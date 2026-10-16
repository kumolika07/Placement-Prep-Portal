const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    selectedOption: { type: Number, default: null },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    scorePercent: {
      type: Number,
      required: true,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
