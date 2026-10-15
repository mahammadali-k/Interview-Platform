import { defaultQuizFor, gradeQuiz } from "../data/quiz.js";

export const quizOf = (session) =>
  session.quiz?.length
    ? session.quiz.map(({ id, question, options, answer, explanation }) => ({
        id,
        question,
        options: [...options],
        answer,
        explanation: explanation || "",
      }))
    : defaultQuizFor(session.problem);

export function durationSeconds(session) {
  const start = session.joinedAt || session.createdAt;
  const end = session.endedAt || session.updatedAt;

  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 1000));
}

const person = (user) => (user ? { name: user.name, email: user.email } : null);

/** compact numbers used by the history table */
export function summarize(session) {
  const quiz = gradeQuiz(quizOf(session), session.quizAnswers);
  const runs = session.codeRuns;

  return {
    id: session._id,
    problem: session.problem,
    difficulty: session.difficulty,
    status: session.status,
    host: person(session.host),
    candidate: person(session.participant),
    startedAt: session.createdAt,
    joinedAt: session.joinedAt,
    endedAt: session.endedAt || session.updatedAt,
    durationSeconds: durationSeconds(session),
    quiz: {
      submitted: Boolean(session.quizSubmittedAt),
      total: quiz.total,
      correct: quiz.correct,
      incorrect: quiz.incorrect,
      unanswered: quiz.unanswered,
      percent: quiz.percent,
    },
    code: {
      runs: runs.length,
      passedRuns: runs.filter((r) => r.passed).length,
      testsPassed: runs.some((r) => r.passed),
    },
    verdict: session.result?.verdict ?? null,
    rating: session.result?.rating ?? null,
    endedBy: session.result?.endedBy ?? null,
  };
}

/** the full feedback report (page, PDF and email all use this) */
export function buildReport(session, role) {
  const quiz = gradeQuiz(quizOf(session), session.quizAnswers);
  const summary = summarize(session);
  const lastRun = session.codeRuns.at(-1);

  return {
    role,
    session: {
      id: session._id,
      problem: session.problem,
      difficulty: session.difficulty,
      startedAt: session.createdAt,
      joinedAt: session.joinedAt,
      endedAt: summary.endedAt,
      durationSeconds: summary.durationSeconds,
      host: summary.host,
      candidate: summary.candidate,
    },
    result: session.result,
    email: session.email,
    // only the host sees integrity incidents (the controller strips them for the candidate)
    incidents: role === "host" ? session.incidents : [],
    quiz: {
      submitted: summary.quiz.submitted,
      correct: quiz.correct,
      incorrect: quiz.incorrect,
      unanswered: quiz.unanswered,
      total: quiz.total,
      percent: quiz.percent,
      items: quiz.items.map(({ id, question, options, selected, answer, isCorrect, explanation }) => ({
        id,
        question,
        options,
        selected,
        answer,
        isCorrect,
        explanation,
      })),
    },
    code: {
      runs: summary.code.runs,
      passedRuns: summary.code.passedRuns,
      lastRun: lastRun
        ? { language: lastRun.language, passed: lastRun.passed, code: lastRun.code, createdAt: lastRun.createdAt }
        : null,
    },
  };
}
