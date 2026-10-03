const Comment = require("../models/Comment");
const Post = require("../models/Post");

// =========================
// CREATE COMMENT / REPLY
// =========================

const createComment = async (req, res) => {
  try {
    const postId = req.params.postId;

    const { content, parentComment } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // If this is a reply, check that
    // the parent comment exists
    if (parentComment) {
      const parent = await Comment.findById(parentComment);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }

      // Make sure the parent comment
      // belongs to the same post
      if (parent.post.toString() !== postId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Parent comment does not belong to this post",
        });
      }
    }

    const comment = await Comment.create({
      post: postId,
      author: req.userId,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    res.status(201).json({
      success: true,
      message: parentComment
        ? "Reply created successfully"
        : "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET COMMENTS FOR A POST
// =========================

const getPostComments = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({
      post: postId,
    })
      .populate("author", "name bio location")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// UPDATE COMMENT
// =========================

const updateComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Only the author can edit
    if (comment.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this comment",
      });
    }

    comment.content = content.trim();

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Update comment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// DELETE COMMENT
// =========================

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);

    // Check whether comment exists
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Only the author of the parent
    // comment can delete it
    if (comment.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }

    // =========================
    // DELETE CHILD REPLIES
    // =========================

    await Comment.deleteMany({
      parentComment: commentId,
    });

    // =========================
    // DELETE PARENT COMMENT
    // =========================

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment and its replies deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
};
