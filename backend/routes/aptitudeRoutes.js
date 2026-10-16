const express = require("express");
const router = express.Router();
const {
  getCategories,
  getQuestions,
  submitTest,
  getResults,
  getResultById,
} = require("../controllers/aptitudeController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// Categories and history are available to any logged in user.
router.get("/categories", getCategories);
router.get("/results", authorize("student"), getResults);
router.get("/results/:id", authorize("student"), getResultById);

// Taking a test is a student action.
router.get("/questions", authorize("student"), getQuestions);
router.post("/submit", authorize("student"), submitTest);

module.exports = router;
