const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, username, email, password, branch, degree, graduationYear, phone } = req.body;

    // ---- Server side validation ----
    const errors = [];
    if (!name || name.trim().length < 3) errors.push("Name must be at least 3 characters");
    if (!username || username.trim().length < 4) errors.push("Username must be at least 4 characters");
    if (!email || !EMAIL_REGEX.test(email)) errors.push("A valid email is required");
    if (!password || password.length < 6) errors.push("Password must be at least 6 characters");

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      const field = existing.email === email.toLowerCase() ? "Email" : "Username";
      return res.status(400).json({ success: false, message: `${field} is already registered` });
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
      role: "student",
      branch: branch || "",
      degree: degree || "Postgraduate",
      graduationYear: graduationYear || new Date().getFullYear(),
      phone: phone || "",
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token: generateToken(user._id),
      user: sanitize(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate a student or officer
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    // If a role was supplied (student vs officer module), enforce it.
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is not a ${role} account. Please use the correct module.`,
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: sanitize(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the currently logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  return res.json({ success: true, user: sanitize(req.user) });
};

const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  branch: user.branch,
  degree: user.degree,
  graduationYear: user.graduationYear,
  phone: user.phone,
  skills: user.skills,
  createdAt: user.createdAt,
});

module.exports = { register, login, getMe };
