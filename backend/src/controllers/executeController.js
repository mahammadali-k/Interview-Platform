import Session from "../models/Session.js";
import { SUPPORTED_LANGUAGES, runCode } from "../lib/codeRunner.js";
import { judgeOutput } from "../data/problems.js";
import { serverError } from "../lib/http.js";
import { roleOf } from "../services/sessionAccess.js";

const MAX_CODE_LENGTH = 20000;
const MAX_RUNS_KEPT = 30;

// a small per-user limit, so nobody can flood the shared sandbox
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;
const hits = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const recent = (hits.get(userId) || []).filter((t) => now - t < WINDOW_MS);

  recent.push(now);
  hits.set(userId, recent);

  return recent.length > MAX_PER_WINDOW;
}

// POST /execute   body: { language, code, problem?, sessionId? }
// Runs the code in the sandbox and judges it right here on the server. When it's the candidate's run
// in an active session we store the result, so nobody can fake an outcome from the browser.
export async function executeCode(req, res) {
  try {
    const { language, code, problem, sessionId } = req.body || {};

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }
    if (typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ message: "Code is required" });
    }
    if (code.length > MAX_CODE_LENGTH) {
      return res.status(413).json({ message: "Code is too long" });
    }
    if (isRateLimited(req.user._id.toString())) {
      return res.status(429).json({ message: "Too many runs. Wait a few seconds and try again." });
    }

    let session = null;
    let problemTitle = problem;

    if (sessionId) {
      session = await Session.findById(sessionId);

      if (!session || !roleOf(session, req.user)) {
        return res.status(403).json({ message: "You are not a member of this session" });
      }
      problemTitle = session.problem;
    }

    const result = await runCode(language, code);
    const passed = Boolean(result.success && problemTitle && judgeOutput(problemTitle, language, result.output));

    const isCandidateRun =
      session && session.status === "active" && roleOf(session, req.user) === "participant";

    if (isCandidateRun) {
      session.codeRuns.push({ language, passed, code });
      session.codeRuns = session.codeRuns.slice(-MAX_RUNS_KEPT);
      await session.save();
    }

    res.status(200).json({ ...result, passed });
  } catch (error) {
    serverError(res, "executeCode", error);
  }
}
