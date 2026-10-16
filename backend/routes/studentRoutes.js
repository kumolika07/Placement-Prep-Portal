const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getDashboard,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("student"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/dashboard", getDashboard);

module.exports = router;
