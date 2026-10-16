import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    // Stream video call id
    callId: {
      type: String,
      default: "",
    },
    // optional time limit in minutes (0 = none): shown as a countdown, it never ends the session
    timeLimitMinutes: { type: Number, default: 0, min: 0, max: 180 },
    // device detection (phones, laptops...) on the candidate's camera; the candidate is told it's on
    proctoring: { type: Boolean, default: true },
    // integrity incidents, e.g. a prohibited device that got the candidate removed
    incidents: {
      type: [
        {
          _id: false,
          type: { type: String, default: "prohibited_device" },
          device: String,
          score: Number,
          at: { type: Date, default: Date.now },
          candidate: String,
        },
      ],
      default: [],
    },
    // the interviewer's private notes, saved while the interview runs
    hostNotes: { type: String, default: "", maxlength: 5000 },
    // when the candidate joined and when the interview ended (used for the time spent)
    joinedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    // candidates the host removed; they can't join again
    removed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // the questions asked in this interview, copied from the host's bank when the session starts
    quiz: {
      type: [
        {
          _id: false,
          id: String,
          question: String,
          options: [String],
          answer: Number,
          explanation: { type: String, default: "" },
        },
      ],
      default: [],
    },
    // the candidate's quiz answers (the answer key stays on the server, in data/quiz.js)
    quizAnswers: {
      type: [{ _id: false, questionId: String, selected: Number }],
      default: [],
    },
    quizSubmittedAt: {
      type: Date,
      default: null,
    },
    // every "Run code" the candidate did (capped in the controller)
    codeRuns: {
      type: [
        {
          _id: false,
          language: String,
          passed: Boolean,
          code: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    // the final outcome, set when the interview ends
    result: {
      type: new mongoose.Schema(
        {
          verdict: { type: String, enum: ["accepted", "rejected"] },
          suggested: { type: String, enum: ["accepted", "rejected"] },
          testsPassed: Boolean,
          quizCorrect: Number,
          quizTotal: Number,
          quizPercent: Number,
          notes: { type: String, default: "" },
          rating: { type: Number, min: 1, max: 5, default: null },
          endedBy: { type: String, enum: ["host", "candidate"], default: "host" },
        },
        { _id: false }
      ),
      default: null,
    },
    // whether the feedback email went out
    email: {
      type: new mongoose.Schema(
        { sentAt: Date, to: String, error: String },
        { _id: false }
      ),
      default: null,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ status: 1, createdAt: -1 });
sessionSchema.index({ host: 1, status: 1, endedAt: -1 });
sessionSchema.index({ participant: 1, status: 1, endedAt: -1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
