import Question from "../models/Question.js";
import { serverError } from "../lib/http.js";
import {
  VALID_PROBLEMS,
  cleanQuestionInput,
  ensureDefaults,
  validateQuestionInput,
} from "../services/questionBank.js";


const present = (doc) => ({
  id: doc._id,
  problem: doc.problem,
  question: doc.question,
  options: doc.options,
  answer: doc.answer,
  explanation: doc.explanation,
  builtIn: Boolean(doc.seedKey),
});

// GET /questions: the host's whole bank
export async function listQuestions(req, res) {
  try {
    await ensureDefaults(req.user._id);

    const docs = await Question.find({ owner: req.user._id }).sort({ createdAt: 1, _id: 1 });

    res.status(200).json({ problems: VALID_PROBLEMS, questions: docs.map(present) });
  } catch (error) {
    serverError(res, "listQuestions", error);
  }
}

// POST /questions
export async function createQuestion(req, res) {
  try {
    const error = validateQuestionInput(req.body);
    if (error) return res.status(400).json({ message: error });
    if (!req.body.problem) return res.status(400).json({ message: "Choose a problem" });

    const doc = await Question.create({
      ...cleanQuestionInput(req.body),
      problem: req.body.problem,
      owner: req.user._id,
    });

    res.status(201).json({ question: present(doc) });
  } catch (error) {
    serverError(res, "createQuestion", error);
  }
}

// PUT /questions/:id
export async function updateQuestion(req, res) {
  try {
    const error = validateQuestionInput(req.body);
    if (error) return res.status(400).json({ message: error });

    const doc = await Question.findOne({ _id: req.params.id, owner: req.user._id });
    if (!doc) return res.status(404).json({ message: "Question not found" });

    Object.assign(doc, cleanQuestionInput(req.body));
    if (req.body.problem) doc.problem = req.body.problem;
    await doc.save();

    res.status(200).json({ question: present(doc) });
  } catch (error) {
    serverError(res, "updateQuestion", error);
  }
}

// DELETE /questions/:id
export async function deleteQuestion(req, res) {
  try {
    const doc = await Question.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!doc) return res.status(404).json({ message: "Question not found" });

    res.status(200).json({ id: doc._id });
  } catch (error) {
    serverError(res, "deleteQuestion", error);
  }
}
