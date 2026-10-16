import Question from "../models/Question.js";
import { DEFAULT_QUESTIONS, GENERAL_PROBLEM } from "../data/quiz.js";
import { PROBLEM_TITLES } from "../data/problems.js";

export const VALID_PROBLEMS = [GENERAL_PROBLEM, ...PROBLEM_TITLES];

// every host starts with an editable copy of the default questions
export async function ensureDefaults(ownerId) {
  if (await Question.exists({ owner: ownerId })) return;

  await Question.bulkWrite(
    DEFAULT_QUESTIONS.map(({ id, problem, question, options, answer, explanation }) => ({
      updateOne: {
        filter: { owner: ownerId, seedKey: id },
        update: { $setOnInsert: { owner: ownerId, seedKey: id, problem, question, options, answer, explanation } },
        upsert: true,
      },
    }))
  );
}

const toSnapshot = (doc) => ({
  id: doc._id.toString(),
  question: doc.question,
  options: doc.options,
  answer: doc.answer,
  explanation: doc.explanation || "",
});

// questions for a new interview: the general ones first, then the ones for the chosen problem
export async function snapshotQuiz(ownerId, problem) {
  await ensureDefaults(ownerId);

  const docs = await Question.find({
    owner: ownerId,
    problem: { $in: [GENERAL_PROBLEM, problem] },
  }).sort({ createdAt: 1, _id: 1 });

  const general = docs.filter((d) => d.problem === GENERAL_PROBLEM);
  const specific = docs.filter((d) => d.problem !== GENERAL_PROBLEM);

  return [...general, ...specific].map(toSnapshot);
}

/** @returns {string | null} an error message, or null when the input is valid */
export function validateQuestionInput(body = {}) {
  const { question, options, answer, explanation, problem } = body;

  if (typeof question !== "string" || question.trim().length < 5) return "Question text is too short";
  if (question.length > 500) return "Question text is too long";
  if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
    return "A question needs between 2 and 6 options";
  }
  if (options.some((o) => typeof o !== "string" || !o.trim() || o.length > 200)) {
    return "Options must be non-empty text (max 200 characters)";
  }
  if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) {
    return "Pick which option is correct";
  }
  if (explanation !== undefined && (typeof explanation !== "string" || explanation.length > 500)) {
    return "Explanation is too long";
  }
  if (problem !== undefined && !VALID_PROBLEMS.includes(problem)) return "Unknown problem";

  return null;
}

export const cleanQuestionInput = ({ question, options, answer, explanation = "" }) => ({
  question: question.trim(),
  options: options.map((o) => o.trim()),
  answer,
  explanation: explanation.trim(),
});
