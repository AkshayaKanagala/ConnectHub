const express = require("express");

const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a comment on a post
router.post("/:postId", protect, createComment);

// Get all comments for a post
router.get("/:postId", protect, getPostComments);

// Update a comment
router.put("/:commentId", protect, updateComment);

// Delete a comment
router.delete("/:commentId", protect, deleteComment);

module.exports = router;
