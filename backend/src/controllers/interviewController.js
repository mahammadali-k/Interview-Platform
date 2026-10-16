import mongoose from "mongoose";
import Session from "../models/Session.js";
import Question from "../models/Question.js";
import { toPublicQuestion } from "../data/quiz.js";
import { buildReport, quizOf } from "../services/report.js";
import { cleanQuestionInput, validateQuestionInput } from "../services/questionBank.js";
import { buildReportPdf, reportFileName } from "../lib/reportPdf.js";
import { sendFeedbackEmail } from "../services/feedbackEmail.js";
import { isMailConfigured } from "../lib/mailer.js";
import { serverError } from "../lib/http.js";
import { loadSession } from "../services/sessionAccess.js";

// GET /sessions/:id/quiz
export async function getQuiz(req, res) {
  try {
    const { session, role } = await loadSession(req, res);
    if (!session) return;

    // the host (interviewer) gets the answer key; the candidate only sees it once the interview is over
    const revealAnswers = role === "host" || session.status === "completed";
    const selectedById = new Map(session.quizAnswers.map((a) => [a.questionId, a.selected]));

    const questions = quizOf(session).map((q) => ({
      ...toPublicQuestion(q),
      selected: selectedById.has(q.id) ? selectedById.get(q.id) : null,
      ...(revealAnswers && { answer: q.answer, explanation: q.explanation }),
    }));

    res.status(200).json({ role, questions, submitted: Boolean(session.quizSubmittedAt) });
  } catch (error) {
    serverError(res, "getQuiz", error);
  }
}

// POST /sessions/:id/quiz   body: { answers: { [questionId]: optionIndex } }
// Partial submissions are fine: whatever isn't answered just counts as unanswered.
export async function submitQuiz(req, res) {
  try {
    const { session } = await loadSession(req, res, {
      role: "participant",
      status: "active",
      forbidden: "Only the candidate can submit the quiz",
    });
    if (!session) return;

    if (session.quizSubmittedAt) {
      return res.status(409).json({ message: "Quiz has already been submitted" });
    }

    const submitted = req.body?.answers || {};

    session.quizAnswers = quizOf(session)
      .filter((q) => Number.isInteger(submitted[q.id]))
      .filter((q) => submitted[q.id] >= 0 && submitted[q.id] < q.options.length)
      .map((q) => ({ questionId: q.id, selected: submitted[q.id] }));
    session.quizSubmittedAt = new Date();
    await session.save();

    res.status(200).json({ submitted: true, answered: session.quizAnswers.length });
  } catch (error) {
    serverError(res, "submitQuiz", error);
  }
}

// ---- the host edits the questions of a running interview ----

async function loadHostSession(req, res) {
  const { session } = await loadSession(req, res, {
    role: "host",
    status: "active",
    forbidden: "Only the host can change the questions",
  });
  if (!session) return {};

  // sessions from before we started snapshotting get their questions copied in first
  if (!session.quiz.length) session.quiz = quizOf(session);

  return { session };
}

// POST /sessions/:id/quiz/questions   body: question fields (+ saveToBank)
export async function addSessionQuestion(req, res) {
  try {
    const { session } = await loadHostSession(req, res);
    if (!session) return;

    const error = validateQuestionInput(req.body);
    if (error) return res.status(400).json({ message: error });

    const fields = cleanQuestionInput(req.body);
    let id = new mongoose.Types.ObjectId().toString();

    if (req.body.saveToBank) {
      const saved = await Question.create({ ...fields, owner: req.user._id, problem: session.problem });
      id = saved._id.toString();
    }

    session.quiz.push({ id, ...fields });
    await session.save();

    res.status(201).json({ id });
  } catch (error) {
    serverError(res, "addSessionQuestion", error);
  }
}

// PUT /sessions/:id/quiz/questions/:questionId
export async function updateSessionQuestion(req, res) {
  try {
    const { session } = await loadHostSession(req, res);
    if (!session) return;

    const target = session.quiz.find((q) => q.id === req.params.questionId);
    if (!target) return res.status(404).json({ message: "Question not found" });

    const error = validateQuestionInput(req.body);
    if (error) return res.status(400).json({ message: error });

    Object.assign(target, cleanQuestionInput(req.body));
    await session.save();

    res.status(200).json({ id: target.id });
  } catch (error) {
    serverError(res, "updateSessionQuestion", error);
  }
}

// DELETE /sessions/:id/quiz/questions/:questionId
export async function deleteSessionQuestion(req, res) {
  try {
    const { session } = await loadHostSession(req, res);
    if (!session) return;

    const { questionId } = req.params;

    if (!session.quiz.some((q) => q.id === questionId)) {
      return res.status(404).json({ message: "Question not found" });
    }

    session.quiz = session.quiz.filter((q) => q.id !== questionId);
    session.quizAnswers = session.quizAnswers.filter((a) => a.questionId !== questionId);
    await session.save();

    res.status(200).json({ id: questionId });
  } catch (error) {
    serverError(res, "deleteSessionQuestion", error);
  }
}

// ---- feedback report ----

const loadCompleted = (req, res) => loadSession(req, res, { status: "completed", populate: true });

// GET /sessions/:id/report  (completed sessions only; host and candidate)
export async function getReport(req, res) {
  try {
    const { session, role } = await loadCompleted(req, res);
    if (!session) return;

    res.status(200).json({ ...buildReport(session, role), emailEnabled: isMailConfigured() });
  } catch (error) {
    serverError(res, "getReport", error);
  }
}

// GET /sessions/:id/report.pdf
export async function getReportPdf(req, res) {
  try {
    const { session, role } = await loadCompleted(req, res);
    if (!session) return;

    const report = buildReport(session, role);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportFileName(report)}"`,
    });
    res.status(200).send(buildReportPdf(report));
  } catch (error) {
    serverError(res, "getReportPdf", error);
  }
}

// POST /sessions/:id/report/email  (host): send (again) the feedback to the candidate
export async function emailReport(req, res) {
  try {
    const { session } = await loadSession(req, res, {
      role: "host",
      status: "completed",
      populate: true,
      forbidden: "Only the host can send the feedback email",
    });
    if (!session) return;

    if (!session.participant) {
      return res.status(400).json({ message: "This interview has no candidate" });
    }
    if (!isMailConfigured()) {
      return res.status(503).json({ message: "Email is not configured on the server (see SMTP_* settings)" });
    }

    const result = await sendFeedbackEmail(session._id);

    if (!result.sent) return res.status(502).json({ message: result.error || "Could not send the email" });

    res.status(200).json({ sent: true, to: result.to });
  } catch (error) {
    serverError(res, "emailReport", error);
  }
}
