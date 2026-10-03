const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // ========================
    // POST AUTHOR
    // ========================

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ========================
    // POST CONTENT
    // ========================

    content: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // ========================
    // LIKES
    // ========================

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ========================
    // SHARED / ORIGINAL POST
    // ========================

    sharedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
