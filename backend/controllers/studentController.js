const User = require("../models/User");
const Result = require("../models/Result");
const Experience = require("../models/Experience");

/**
 * @desc    Get the logged in student's full profile
 * @route   GET /api/students/profile
 * @access  Private (student)
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the logged in student's profile
 * @route   PUT /api/students/profile
 * @access  Private (student)
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "branch", "degree", "graduationYear", "phone", "skills"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Student dashboard summary (counts + recent results)
 * @route   GET /api/students/dashboard
 * @access  Private (student)
 */
const getDashboard = async (req, res, next) => {
  try {
    const results = await Result.find({ student: req.user._id }).sort({ createdAt: -1 });
    const experiences = await Experience.find({ student: req.user._id }).sort({ createdAt: -1 });

    const totalTests = results.length;
    const avgScore =
      totalTests > 0
        ? Math.round(results.reduce((sum, r) => sum + r.scorePercent, 0) / totalTests)
        : 0;
    const bestScore = totalTests > 0 ? Math.max(...results.map((r) => r.scorePercent)) : 0;

    // Per-category best score
    const byCategory = {};
    results.forEach((r) => {
      if (!byCategory[r.category] || byCategory[r.category] < r.scorePercent) {
        byCategory[r.category] = r.scorePercent;
      }
    });

    return res.json({
      success: true,
      summary: {
        totalTests,
        avgScore,
        bestScore,
        totalExperiences: experiences.length,
        approvedExperiences: experiences.filter((e) => e.status === "approved").length,
        pendingExperiences: experiences.filter((e) => e.status === "pending").length,
        byCategory,
      },
      recentResults: results.slice(0, 5),
      recentExperiences: experiences.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getDashboard };
