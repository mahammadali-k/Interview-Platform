import Session from "../models/Session.js";

const idOf = (ref) => ref?._id?.toString() ?? ref?.toString();

/** @returns {"host" | "participant" | null} */
export const roleOf = (session, user) => {
  const userId = user._id.toString();

  if (idOf(session.host) === userId) return "host";
  if (idOf(session.participant) === userId) return "participant";
  return null;
};

const FORBIDDEN = {
  host: "Only the host can do this",
  participant: "Only the candidate can do this",
  member: "You are not a member of this session",
};

const WRONG_STATUS = {
  active: "This session has already ended",
  completed: "The interview has not ended yet",
};

/**
 * Loads a session and checks that the caller is allowed to act on it. If something is off, the
 * response is sent right here and `{}` comes back, so callers can simply do `if (!session) return;`.
 *
 * @param {object} options
 * @param {"host" | "participant" | "member"} [options.role]  who may do this (default: any member)
 * @param {"active" | "completed"} [options.status]  required state of the session
 * @param {boolean} [options.populate]  populate host and participant (name, email)
 * @param {string} [options.forbidden] custom message for a role mismatch
 */
export async function loadSession(req, res, { role = "member", status, populate = false, forbidden } = {}) {
  let query = Session.findById(req.params.id);
  if (populate) query = query.populate("host", "name email").populate("participant", "name email");

  const session = await query;

  if (!session) {
    res.status(404).json({ message: "Session not found" });
    return {};
  }

  const userRole = roleOf(session, req.user);

  if (!userRole || (role !== "member" && userRole !== role)) {
    res.status(403).json({ message: forbidden || FORBIDDEN[role] });
    return {};
  }

  if (status && session.status !== status) {
    res.status(400).json({ message: WRONG_STATUS[status] });
    return {};
  }

  return { session, role: userRole };
}

// what any signed-in user may see of a session: never the answer key or the host's notes
export const publicSession = (id) => Session.findById(id).select("-quiz -hostNotes -incidents");
