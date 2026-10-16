const Experience = require("../models/Experience");

/**
 * @desc    Create a new interview experience (student)
 * @route   POST /api/experiences
 * @access  Private (student)
 */
const createExperience = async (req, res, next) => {
  try {
    const {
      company,
      role,
      jobType,
      package: pkg,
      location,
      year,
      difficulty,
      selectionStatus,
      rounds,
      content,
      tips,
    } = req.body;

    if (!company || !role || !content) {
      return res.status(400).json({
        success: false,
        message: "Company, role and experience description are required",
      });
    }

    const experience = await Experience.create({
      student: req.user._id,
      company,
      role,
      jobType,
      package: pkg,
      location,
      year,
      difficulty,
      selectionStatus,
      rounds: Array.isArray(rounds) ? rounds : [],
      content,
      tips,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Experience submitted for officer approval",
      experience,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List approved experiences (visible to everyone logged in)
 * @route   GET /api/experiences?company=&role=
 * @access  Private
 */
const getExperiences = async (req, res, next) => {
  try {
    const { company, role } = req.query;
    const filter = { status: "approved" };
    if (company) filter.company = new RegExp(company, "i");
    if (role) filter.role = new RegExp(role, "i");

    const experiences = await Experience.find(filter)
      .populate("student", "name branch degree graduationYear")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: experiences.length, experiences });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the logged in student's own experiences (all statuses)
 * @route   GET /api/experiences/mine
 * @access  Private (student)
 */
const getMyExperiences = async (req, res, next) => {
  try {
    const experiences = await Experience.find({ student: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: experiences.length, experiences });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single experience by id
 * @route   GET /api/experiences/:id
 * @access  Private
 */
const getExperienceById = async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id).populate(
      "student",
      "name branch degree graduationYear"
    );

    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    const isOwner = experience.student && experience.student._id.toString() === req.user._id.toString();
    if (experience.status !== "approved" && !isOwner && req.user.role !== "officer") {
      return res.status(403).json({ success: false, message: "This experience is not available yet" });
    }

    return res.json({ success: true, experience });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete own experience (only while pending)
 * @route   DELETE /api/experiences/:id
 * @access  Private (student)
 */
const deleteExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }
    if (experience.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (experience.status === "approved") {
      return res.status(400).json({ success: false, message: "Approved experiences cannot be deleted" });
    }

    await experience.deleteOne();
    return res.json({ success: true, message: "Experience deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExperience,
  getExperiences,
  getMyExperiences,
  getExperienceById,
  deleteExperience,
};
