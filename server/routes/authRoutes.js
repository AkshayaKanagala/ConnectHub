const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Get currently logged-in user
router.get("/me", protect, getMe);

// Update currently logged-in user's profile
router.put("/profile", protect, updateProfile);

module.exports = router;
