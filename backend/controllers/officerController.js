const User = require("../models/User");
const Result = require("../models/Result");
const Experience = require("../models/Experience");
const Question = require("../models/Question");

/**
 * @desc    Officer dashboard: aggregate stats across all students
 * @route   GET /api/officer/dashboard
 * @access  Private (officer)
 */
const getDashboard = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTests = await Result.countDocuments();
    const totalExperiences = await Experience.countDocuments();
    const pendingExperiences = await Experience.countDocuments({ status: "pending" });
    const approvedExperiences = await Experience.countDocuments({ status: "approved" });
    const totalQuestions = await Question.countDocuments();

    const scoreAgg = await Result.aggregate([
      { $group: { _id: null, avg: { $avg: "$scorePercent" } } },
    ]);
    const averageScore = scoreAgg.length ? Math.round(scoreAgg[0].avg) : 0;

    // Top performers by average score
    const topPerformers = await Result.aggregate([
      {
        $group: {
          _id: "$student",
          avgScore: { $avg: "$scorePercent" },
          tests: { $sum: 1 },
        },
      },
      { $sort: { avgScore: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          name: "$student.name",
          branch: "$student.branch",
          degree: "$student.degree",
          avgScore: { $round: ["$avgScore", 0] },
          tests: 1,
        },
      },
    ]);

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalTests,
        totalExperiences,
        pendingExperiences,
        approvedExperiences,
        totalQuestions,
        averageScore,
      },
      topPerformers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all students with their progress summary
 * @route   GET /api/officer/students
 * @access  Private (officer)
 */
const getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").sort({ name: 1 });

    const progress = await Promise.all(
      students.map(async (student) => {
        const results = await Result.find({ student: student._id });
        const experienceCount = await Experience.countDocuments({ student: student._id });

        const tests = results.length;
        const avgScore = tests
          ? Math.round(results.reduce((s, r) => s + r.scorePercent, 0) / tests)
          : 0;
        const bestScore = tests ? Math.max(...results.map((r) => r.scorePercent)) : 0;

        return {
          _id: student._id,
          name: student.name,
          username: student.username,
          email: student.email,
          branch: student.branch,
          degree: student.degree,
          graduationYear: student.graduationYear,
          tests,
          avgScore,
          bestScore,
          experiences: experienceCount,
        };
      })
    );

    return res.json({ success: true, count: progress.length, students: progress });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single student's full progress
 * @route   GET /api/officer/students/:id
 * @access  Private (officer)
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: "student" }).select("-password");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const results = await Result.find({ student: student._id }).sort({ createdAt: -1 });
    const experiences = await Experience.find({ student: student._id }).sort({ createdAt: -1 });

    return res.json({ success: true, student, results, experiences });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List experiences by status (for moderation)
 * @route   GET /api/officer/experiences?status=pending
 * @access  Private (officer)
 */
const getExperiencesForModeration = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const experiences = await Experience.find(filter)
      .populate("student", "name username branch degree")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: experiences.length, experiences });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject an experience
 * @route   PUT /api/officer/experiences/:id/status
 * @access  Private (officer)
 * @body    { status: "approved" | "rejected" }
 */
const moderateExperience = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("student", "name username branch degree");

    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    return res.json({ success: true, message: `Experience ${status}`, experience });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new aptitude question
 * @route   POST /api/officer/questions
 * @access  Private (officer)
 */
const createQuestion = async (req, res, next) => {
  try {
    const { category, questionText, options, correctOption, difficulty, explanation } = req.body;

    if (!category || !questionText || !Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "category, questionText and exactly 4 options are required",
      });
    }
    if (correctOption === undefined || correctOption < 0 || correctOption > 3) {
      return res.status(400).json({ success: false, message: "correctOption must be 0-3" });
    }

    const question = await Question.create({
      category,
      questionText,
      options,
      correctOption,
      difficulty,
      explanation,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: "Question added", question });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all questions
 * @route   GET /api/officer/questions?category=
 * @access  Private (officer)
 */
const getQuestions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/officer/questions/:id
 * @access  Private (officer)
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    return res.json({ success: true, message: "Question deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getStudents,
  getStudentById,
  getExperiencesForModeration,
  moderateExperience,
  createQuestion,
  getQuestions,
  deleteQuestion,
};
