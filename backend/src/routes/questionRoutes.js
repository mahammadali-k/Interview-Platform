import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createQuestion,
  deleteQuestion,
  listQuestions,
  updateQuestion,
} from "../controllers/questionController.js";

const router = express.Router();

router.get("/", protectRoute, listQuestions);
router.post("/", protectRoute, createQuestion);
router.put("/:id", protectRoute, updateQuestion);
router.delete("/:id", protectRoute, deleteQuestion);

export default router;
