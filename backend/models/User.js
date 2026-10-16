const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [4, "Username must be at least 4 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "officer"],
      default: "student",
    },
    // Student specific profile fields
    branch: {
      type: String,
      default: "",
    },
    degree: {
      type: String,
      default: "Postgraduate",
    },
    graduationYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    phone: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash the password before saving whenever it is new or changed.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance helper used by the auth controller.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
