import { chatClient, streamClient } from "../lib/stream.js";
import { serverError } from "../lib/http.js";
import Session from "../models/Session.js";
import { PASS_PERCENT, gradeQuiz } from "../data/quiz.js";
import { PROBLEMS } from "../data/problems.js";
import { snapshotQuiz } from "../services/questionBank.js";
import { quizOf, summarize } from "../services/report.js";
import { sendFeedbackEmail } from "../services/feedbackEmail.js";
import { loadSession, publicSession, roleOf } from "../services/sessionAccess.js";

// list views never need the answer key, the candidate's answers/code or the host's notes
const LIST_EXCLUDE = "-quiz -quizAnswers -codeRuns -hostNotes -incidents";

const isValidTimeLimit = (value) => Number.isInteger(value) && value >= 0 && value <= 180;
const isValidRating = (value) => Number.isInteger(value) && value >= 1 && value <= 5;
const isValidDecision = (value) => ["accepted", "rejected"].includes(value);

// POST /sessions
export async function createSession(req, res) {
  try {
    const { problem, difficulty, timeLimitMinutes = 0 } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }
    if (!isValidTimeLimit(timeLimitMinutes)) {
      return res.status(400).json({ message: "Time limit must be between 0 and 180 minutes" });
    }

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // the interview's questions are copied from the host's (editable) question bank
    const quiz = await snapshotQuiz(userId, problem);

    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
      quiz,
      timeLimitMinutes,
    });

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ session: await publicSession(session._id) });
  } catch (error) {
    serverError(res, "createSession", error);
  }
}

// GET /sessions/active
export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .select(LIST_EXCLUDE)
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    serverError(res, "getActiveSessions", error);
  }
}

// GET /sessions/my-recent
export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .select(LIST_EXCLUDE)
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    serverError(res, "getMyRecentSessions", error);
  }
}

// GET /sessions/history: every finished interview the user took part in, with the numbers
export async function getHistory(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .populate("host", "name email")
      .populate("participant", "name email")
      .sort({ endedAt: -1, updatedAt: -1 })
      .limit(200);

    res.status(200).json({
      interviews: sessions.map((session) => ({
        ...summarize(session),
        role: roleOf(session, req.user),
      })),
    });
  } catch (error) {
    serverError(res, "getHistory", error);
  }
}

// GET /sessions/:id
export async function getSessionById(req, res) {
  try {
    const session = await Session.findById(req.params.id)
      .select("-quiz")
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    const data = session.toObject();
    const role = roleOf(session, req.user);

    // the notes and the integrity log are the host's; people outside the interview get the public part
    if (role !== "host") {
      delete data.hostNotes;
      delete data.incidents;
    }
    if (!role) {
      delete data.codeRuns;
      delete data.quizAnswers;
      data.result = null;
    }

    res.status(200).json({ session: data });
  } catch (error) {
    serverError(res, "getSessionById", error);
  }
}

// POST /sessions/:id/join
export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    if (session.removed.some((removedId) => removedId.toString() === userId.toString())) {
      return res.status(403).json({ message: "The host removed you from this session" });
    }

    // check if session is already full - has a participant
    if (session.participant) return res.status(409).json({ message: "Session is full" });

    session.participant = userId;
    session.joinedAt = new Date();
    await session.save();

    await chatClient.channel("messaging", session.callId).addMembers([req.user.clerkId]);

    res.status(200).json({ session: await publicSession(id) });
  } catch (error) {
    serverError(res, "joinSession", error);
  }
}

// PATCH /sessions/:id  (host): switch the problem and/or the time limit of a running interview
export async function updateSession(req, res) {
  try {
    const { session } = await loadSession(req, res, {
      role: "host",
      status: "active",
      forbidden: "Only the host can edit the session",
    });
    if (!session) return;

    const { problem, timeLimitMinutes, proctoring } = req.body || {};

    if (typeof proctoring === "boolean") session.proctoring = proctoring;

    if (timeLimitMinutes !== undefined) {
      if (!isValidTimeLimit(timeLimitMinutes)) {
        return res.status(400).json({ message: "Time limit must be between 0 and 180 minutes" });
      }
      session.timeLimitMinutes = timeLimitMinutes;
    }

    if (problem !== undefined && problem !== session.problem) {
      const meta = PROBLEMS[problem];
      if (!meta) return res.status(400).json({ message: "Unknown problem" });

      session.problem = problem;
      session.difficulty = meta.difficulty;
      session.quiz = await snapshotQuiz(req.user._id, problem);
      // a different problem means a fresh quiz and fresh code runs
      session.quizAnswers = [];
      session.quizSubmittedAt = null;
      session.codeRuns = [];
    }

    await session.save();

    res.status(200).json({ session: await publicSession(session._id) });
  } catch (error) {
    serverError(res, "updateSession", error);
  }
}

// PATCH /sessions/:id/notes  (host): the interviewer's private notes, autosaved from the page
export async function saveNotes(req, res) {
  try {
    const { session } = await loadSession(req, res, { role: "host" });
    if (!session) return;

    const { notes } = req.body || {};
    if (typeof notes !== "string") return res.status(400).json({ message: "Notes must be text" });

    session.hostNotes = notes.slice(0, 5000);
    await session.save();

    res.status(200).json({ saved: true });
  } catch (error) {
    serverError(res, "saveNotes", error);
  }
}

// POST /sessions/:id/remove-participant  (host)
export async function removeParticipant(req, res) {
  try {
    const { session } = await loadSession(req, res, {
      role: "host",
      status: "active",
      forbidden: "Only the host can remove the candidate",
    });
    if (!session) return;

    if (!session.participant) {
      return res.status(400).json({ message: "There is no candidate to remove" });
    }

    await session.populate("participant", "clerkId name");
    const { _id: participantId, clerkId, name } = session.participant;

    // the browser of the host detected a prohibited device on the candidate's camera
    const { reason, device, score } = req.body || {};

    if (reason === "prohibited_device") {
      session.incidents.push({
        type: reason,
        device: typeof device === "string" ? device.slice(0, 40) : "device",
        score: Number.isFinite(score) ? Math.round(score * 100) / 100 : undefined,
        candidate: name,
      });
    }

    session.removed.push(participantId);
    session.participant = null;
    session.joinedAt = null;
    session.quizAnswers = [];
    session.quizSubmittedAt = null;
    session.codeRuns = [];
    await session.save();

    try {
      await chatClient.channel("messaging", session.callId).removeMembers([clerkId]);
    } catch (error) {
      console.log("Could not remove the member from the chat:", error.message);
    }

    res.status(200).json({ session: await publicSession(session._id) });
  } catch (error) {
    serverError(res, "removeParticipant", error);
  }
}

// POST /sessions/:id/end  (host or candidate)
export async function endSession(req, res) {
  try {
    const { session, role } = await loadSession(req, res, {
      status: "active",
      forbidden: "Only the host or the candidate can end the session",
    });
    if (!session) return;

    // delete stream video call and chat channel
    await streamClient.video.call("default", session.callId).delete({ hard: true });
    await chatClient.channel("messaging", session.callId).delete();

    // interview outcome: tests passed + quiz threshold; only the host can overrule it
    const { decision, notes, rating } = req.body || {};
    const isHost = role === "host";
    const quiz = gradeQuiz(quizOf(session), session.quizAnswers);
    const testsPassed = session.codeRuns.some((run) => run.passed);
    const suggested = testsPassed && quiz.percent >= PASS_PERCENT ? "accepted" : "rejected";

    session.result = {
      verdict: isHost && isValidDecision(decision) ? decision : suggested,
      suggested,
      testsPassed,
      quizCorrect: quiz.correct,
      quizTotal: quiz.total,
      quizPercent: quiz.percent,
      notes: isHost && typeof notes === "string" ? notes.trim().slice(0, 2000) : "",
      rating: isHost && isValidRating(rating) ? rating : null,
      endedBy: role,
    };

    session.status = "completed";
    session.endedAt = new Date();
    await session.save();

    // fire and forget: a mail problem must never block ending the interview
    sendFeedbackEmail(session._id).catch((error) => console.log("Feedback email failed:", error.message));

    // never send the whole document back: it holds the answer key and the host's notes
    res.status(200).json({ id: session._id, status: session.status, result: session.result });
  } catch (error) {
    serverError(res, "endSession", error);
  }
}

// PATCH /sessions/:id/result  (host): change the decision, rating or notes of a finished interview
export async function updateResult(req, res) {
  try {
    const { session } = await loadSession(req, res, {
      role: "host",
      status: "completed",
      forbidden: "Only the host can change the result",
    });
    if (!session) return;

    const { decision, notes, rating } = req.body || {};

    if (rating !== undefined) {
      if (rating !== null && !isValidRating(rating)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      session.result.rating = rating;
    }

    if (decision !== undefined) {
      if (!isValidDecision(decision)) {
        return res.status(400).json({ message: "Decision must be accepted or rejected" });
      }
      session.result.verdict = decision;
    }

    if (notes !== undefined) session.result.notes = String(notes).trim().slice(0, 2000);

    await session.save();

    res.status(200).json({ result: session.result });
  } catch (error) {
    serverError(res, "updateResult", error);
  }
}
