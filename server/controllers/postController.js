const Post = require("../models/Post");
const Comment = require("../models/Comment");

// ========================
// CREATE POST
// ========================

const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const post = await Post.create({
      author: req.userId,
      content: content.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================
// GET ALL POSTS
// ========================

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name bio location")
      .populate({
        path: "sharedPost",
        populate: {
          path: "author",
          select: "name bio location",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================
// GET POSTS BY USER
// ========================

const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId;

    const posts = await Post.find({
      author: userId,
    })
      .populate("author", "name bio location")
      .populate({
        path: "sharedPost",
        populate: {
          path: "author",
          select: "name bio location",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Get user posts error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================
// UPDATE POST
// ========================

const updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check ownership
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this post",
      });
    }

    // Do not edit reposts
    if (post.sharedPost) {
      return res.status(400).json({
        success: false,
        message: "Shared posts cannot be edited",
      });
    }

    post.content = content.trim();

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================
// DELETE POST
// ========================

const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Find the post
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check ownership
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post",
      });
    }

    // Delete all comments and replies
    // belonging to this post
    await Comment.deleteMany({
      post: postId,
    });

    // Delete the post itself
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================
// LIKE / UNLIKE POST
// ========================

const toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (userId) => userId.toString() === req.userId.toString(),
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.userId.toString(),
      );
    } else {
      post.likes.push(req.userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    console.error("Like post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================
// SHARE / REPOST
// ========================

const sharePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const originalPost = await Post.findById(postId);

    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const sharedPost = await Post.create({
      author: req.userId,
      content: "",
      sharedPost: originalPost._id,
    });

    res.status(201).json({
      success: true,
      message: "Post shared successfully",
      post: sharedPost,
    });
  } catch (error) {
    console.error("Share post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  sharePost,
};
