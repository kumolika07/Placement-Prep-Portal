const express = require("express");
const router = express.Router();
const {
  createExperience,
  getExperiences,
  getMyExperiences,
  getExperienceById,
  deleteExperience,
} = require("../controllers/experienceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/mine", authorize("student"), getMyExperiences);
router.route("/").get(getExperiences).post(authorize("student"), createExperience);
router.route("/:id").get(getExperienceById).delete(authorize("student"), deleteExperience);

module.exports = router;
