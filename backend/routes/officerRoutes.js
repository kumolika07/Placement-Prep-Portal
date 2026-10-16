const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getStudents,
  getStudentById,
  getExperiencesForModeration,
  moderateExperience,
  createQuestion,
  getQuestions,
  deleteQuestion,
} = require("../controllers/officerController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("officer"));

router.get("/dashboard", getDashboard);
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
router.get("/experiences", getExperiencesForModeration);
router.put("/experiences/:id/status", moderateExperience);
router.route("/questions").get(getQuestions).post(createQuestion);
router.delete("/questions/:id", deleteQuestion);

module.exports = router;
