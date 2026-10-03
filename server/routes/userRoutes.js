const express = require("express");

const {
  searchUsers,
  getUserProfile,
  followUser,
  unfollowUser,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Search users
// IMPORTANT: Keep this before /:userId
router.get("/search", protect, searchUsers);

// Get a user's profile
router.get("/:userId", protect, getUserProfile);

// Follow a user
router.put("/:userId/follow", protect, followUser);

// Unfollow a user
router.put("/:userId/unfollow", protect, unfollowUser);

module.exports = router;
