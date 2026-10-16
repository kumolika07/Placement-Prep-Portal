const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema(
  {
    roundName: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["Full Time", "Internship", "Internship + PPO"],
      default: "Full Time",
    },
    package: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    selectionStatus: {
      type: String,
      enum: ["Selected", "Rejected", "On Hold", "Waiting"],
      default: "Selected",
    },
    rounds: {
      type: [roundSchema],
      default: [],
    },
    content: {
      type: String,
      required: [true, "Experience description is required"],
      trim: true,
    },
    tips: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", experienceSchema);
