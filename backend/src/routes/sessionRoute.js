import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  endSession,
  getActiveSessions,
  getHistory,
  getMyRecentSessions,
  getSessionById,
  joinSession,
  removeParticipant,
  saveNotes,
  updateResult,
  updateSession,
} from "../controllers/sessionController.js";
import {
  addSessionQuestion,
  deleteSessionQuestion,
  emailReport,
  getQuiz,
  getReport,
  getReportPdf,
  submitQuiz,
  updateSessionQuestion,
} from "../controllers/interviewController.js";

const router = express.Router();

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);
router.get("/history", protectRoute, getHistory);

router.get("/:id", protectRoute, getSessionById);
router.patch("/:id", protectRoute, updateSession);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/remove-participant", protectRoute, removeParticipant);
router.post("/:id/end", protectRoute, endSession);
router.patch("/:id/result", protectRoute, updateResult);
router.patch("/:id/notes", protectRoute, saveNotes);

router.get("/:id/quiz", protectRoute, getQuiz);
router.post("/:id/quiz", protectRoute, submitQuiz);
router.post("/:id/quiz/questions", protectRoute, addSessionQuestion);
router.put("/:id/quiz/questions/:questionId", protectRoute, updateSessionQuestion);
router.delete("/:id/quiz/questions/:questionId", protectRoute, deleteSessionQuestion);

router.get("/:id/report", protectRoute, getReport);
router.get("/:id/report.pdf", protectRoute, getReportPdf);
router.post("/:id/report/email", protectRoute, emailReport);

export default router;
