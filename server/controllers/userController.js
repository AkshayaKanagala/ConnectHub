const User = require("../models/User");

// ========================
// SEARCH USERS
// ========================
const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.query.q;

    if (!searchTerm || !searchTerm.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const users = await User.find({
      name: {
        $regex: searchTerm.trim(),
        $options: "i",
      },
    }).select("-password");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================
// GET USER PROFILE
// ========================
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================
// FOLLOW USER
// ========================
const followUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.userId;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyFollowing = currentUser.following.some(
      (userId) => userId.toString() === targetUserId.toString(),
    );

    if (alreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: "User followed successfully",
      followingCount: currentUser.following.length,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    console.error("Follow user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ========================
// UNFOLLOW USER
// ========================
const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.userId;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFollowing = currentUser.following.some(
      (userId) => userId.toString() === targetUserId.toString(),
    );

    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    currentUser.following = currentUser.following.filter(
      (userId) => userId.toString() !== targetUserId.toString(),
    );

    targetUser.followers = targetUser.followers.filter(
      (userId) => userId.toString() !== currentUserId.toString(),
    );

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
      followingCount: currentUser.following.length,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    console.error("Unfollow user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  searchUsers,
  getUserProfile,
  followUser,
  unfollowUser,
};
