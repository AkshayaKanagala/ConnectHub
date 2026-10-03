const express = require("express");

const {
  createPost,
  getPosts,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  sharePost,
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ========================
// CREATE POST
// ========================

router.post("/", protect, createPost);

// ========================
// GET ALL POSTS
// ========================

router.get("/", protect, getPosts);

// ========================
// GET POSTS BY USER
// ========================

router.get("/user/:userId", protect, getUserPosts);

// ========================
// UPDATE POST
// ========================

router.put("/:postId", protect, updatePost);

// ========================
// DELETE POST
// ========================

router.delete("/:postId", protect, deletePost);

// ========================
// LIKE / UNLIKE POST
// ========================

router.put("/:postId/like", protect, toggleLike);

// ========================
// SHARE / REPOST
// ========================

router.post("/:postId/share", protect, sharePost);

module.exports = router;
