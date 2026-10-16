import mongoose from "mongoose";

// A host's editable quiz question. `problem` is a problem title, or "*" for every problem.
const questionSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    problem: { type: String, required: true },
    question: { type: String, required: true, trim: true, maxlength: 500 },
    options: {
      type: [{ type: String, trim: true, maxlength: 200 }],
      validate: (value) => value.length >= 2 && value.length <= 6,
    },
    answer: { type: Number, required: true, min: 0 },
    explanation: { type: String, default: "", trim: true, maxlength: 500 },
    // only set on copies made from the built-in defaults (stops them from being seeded twice)
    seedKey: { type: String },
  },
  { timestamps: true }
);

questionSchema.index({ owner: 1, seedKey: 1 }, { unique: true, partialFilterExpression: { seedKey: { $type: "string" } } });

export default mongoose.model("Question", questionSchema);
