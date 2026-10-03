import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";

function Feed() {
  // =========================
  // STATE
  // =========================

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  const [editingPostId, setEditingPostId] = useState(null);

  const [editPostText, setEditPostText] = useState("");

  const [commentTexts, setCommentTexts] = useState({});

  const [comments, setComments] = useState({});

  const [replyTexts, setReplyTexts] = useState({});

  const [editingCommentId, setEditingCommentId] = useState(null);

  const [editCommentText, setEditCommentText] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  // =========================
  // FETCH CURRENT USER
  // =========================

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCurrentUser(response.data.user);
    } catch (error) {
      console.log("Fetch current user error:", error);
    }
  };

  // =========================
  // FETCH COMMENTS
  // =========================

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/comments/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setComments((previousComments) => ({
        ...previousComments,
        [postId]: response.data.comments,
      }));
    } catch (error) {
      console.log("Fetch comments error:", error);
    }
  };

  // =========================
  // FETCH POSTS
  // =========================

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:5000/api/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(response.data.posts);

      response.data.posts.forEach((post) => {
        fetchComments(post._id);
      });
    } catch (error) {
      console.log("Fetch posts error:", error);
    }
  };

  // =========================
  // CREATE POST
  // =========================

  const handleCreatePost = async () => {
    if (!newPost || !newPost.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/posts",
        {
          content: newPost,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setNewPost("");

      fetchPosts();
    } catch (error) {
      console.log("Create post error:", error);
    }
  };

  // =========================
  // EDIT POST
  // =========================

  const handleEditPost = (post) => {
    setEditingPostId(post._id);
    setEditPostText(post.content);
  };

  const handleCancelPostEdit = () => {
    setEditingPostId(null);
    setEditPostText("");
  };

  const handleSavePost = async (postId) => {
    if (!editPostText.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/posts/${postId}`,
        {
          content: editPostText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditingPostId(null);
      setEditPostText("");

      fetchPosts();
    } catch (error) {
      console.log("Edit post error:", error);
    }
  };

  // =========================
  // DELETE POST
  // =========================

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchPosts();
    } catch (error) {
      console.log("Delete post error:", error);
    }
  };

  // =========================
  // LIKE / UNLIKE POST
  // =========================

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchPosts();
    } catch (error) {
      console.log("Like post error:", error);
    }
  };

  // =========================
  // SHARE POST
  // =========================

  const handleShare = async (postId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/posts/${postId}/share`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchPosts();
    } catch (error) {
      console.log("Share post error:", error);
    }
  };

  // =========================
  // CREATE COMMENT
  // =========================

  const handleCreateComment = async (postId) => {
    const commentContent = commentTexts[postId];

    if (!commentContent || !commentContent.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/comments/${postId}`,
        {
          content: commentContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCommentTexts((previousCommentTexts) => ({
        ...previousCommentTexts,
        [postId]: "",
      }));

      fetchComments(postId);
    } catch (error) {
      console.log("Create comment error:", error);
    }
  };

  // =========================
  // CREATE REPLY
  // =========================

  const handleCreateReply = async (postId, commentId) => {
    const replyContent = replyTexts[commentId];

    if (!replyContent || !replyContent.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/comments/${postId}`,
        {
          content: replyContent,
          parentComment: commentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReplyTexts((previousReplyTexts) => ({
        ...previousReplyTexts,
        [commentId]: "",
      }));

      fetchComments(postId);
    } catch (error) {
      console.log("Create reply error:", error);
    }
  };

  // =========================
  // EDIT COMMENT
  // =========================

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const handleSaveComment = async (postId, commentId) => {
    if (!editCommentText.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          content: editCommentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditingCommentId(null);
      setEditCommentText("");

      fetchComments(postId);
    } catch (error) {
      console.log("Edit comment error:", error);
    }
  };

  // =========================
  // DELETE COMMENT
  // =========================

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchComments(postId);
    } catch (error) {
      console.log("Delete comment error:", error);
    }
  };

  // =========================
  // LOAD FEED
  // =========================

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, []);

  // =========================
  // UI
  // =========================

  return (
    <div>
      <Navbar />

      <main className="feed-container">
        <h2 className="feed-title">Feed</h2>

        {/* CREATE POST */}

        <div className="create-post-card">
          <textarea
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />

          <button onClick={handleCreatePost}>Post</button>
        </div>

        {/* POSTS */}

        <div className="posts-list">
          {posts.map((post) => (
            <article key={post._id} className="post-card">
              {/* AUTHOR */}

              <div className="post-header">
                <div className="user-avatar">
                  {post.author.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3 className="post-author">{post.author.name}</h3>

                  <span className="post-label">ConnectHub member</span>
                </div>
              </div>

              {/* SHARED POST */}

              {post.sharedPost ? (
                <div className="shared-wrapper">
                  <p className="shared-label">
                    <strong>{post.author.name}</strong> shared a post
                  </p>

                  <div className="shared-post">
                    <h4>{post.sharedPost.author?.name || "User"}</h4>

                    <p>{post.sharedPost.content}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* NORMAL POST */}

                  {editingPostId === post._id ? (
                    <div className="edit-post-area">
                      <textarea
                        value={editPostText}
                        onChange={(e) => setEditPostText(e.target.value)}
                      />

                      <div className="edit-actions">
                        <button
                          className="primary-button"
                          onClick={() => handleSavePost(post._id)}
                        >
                          Save
                        </button>

                        <button
                          className="secondary-button"
                          onClick={handleCancelPostEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="post-content">{post.content}</p>

                      {currentUser && post.author._id === currentUser._id && (
                        <div className="owner-actions">
                          <button onClick={() => handleEditPost(post)}>
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDeletePost(post._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* LIKE COUNT */}

              <div className="post-stats">
                <span>
                  {post.likes.length}{" "}
                  {post.likes.length === 1 ? "Like" : "Likes"}
                </span>
              </div>

              {/* POST ACTIONS */}

              <div className="post-actions">
                <button onClick={() => handleLike(post._id)}>♡ Like</button>

                <button onClick={() => handleShare(post._id)}>↗ Share</button>
              </div>

              {/* COMMENT INPUT */}

              <div className="comment-form">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentTexts[post._id] || ""}
                  onChange={(e) =>
                    setCommentTexts((previousCommentTexts) => ({
                      ...previousCommentTexts,
                      [post._id]: e.target.value,
                    }))
                  }
                />

                <button onClick={() => handleCreateComment(post._id)}>
                  Comment
                </button>
              </div>

              {/* COMMENTS */}

              <div className="comments-section">
                {(comments[post._id] || [])
                  .filter((comment) => !comment.parentComment)
                  .map((comment) => (
                    <div key={comment._id} className="comment-thread">
                      <div className="comment-card">
                        <strong>{comment.author.name}</strong>

                        {editingCommentId === comment._id ? (
                          <div className="comment-edit-area">
                            <input
                              type="text"
                              value={editCommentText}
                              onChange={(e) =>
                                setEditCommentText(e.target.value)
                              }
                            />

                            <div className="comment-edit-actions">
                              <button
                                onClick={() =>
                                  handleSaveComment(post._id, comment._id)
                                }
                              >
                                Save
                              </button>

                              <button onClick={handleCancelEdit}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>{comment.content}</p>

                            {currentUser &&
                              comment.author._id === currentUser._id && (
                                <div className="comment-owner-actions">
                                  <button
                                    onClick={() => handleEditComment(comment)}
                                  >
                                    Edit
                                  </button>

                                  <button
                                    className="delete-button"
                                    onClick={() =>
                                      handleDeleteComment(post._id, comment._id)
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                          </>
                        )}
                      </div>

                      {/* REPLIES */}

                      <div className="replies-section">
                        {(comments[post._id] || [])
                          .filter(
                            (reply) => reply.parentComment === comment._id,
                          )
                          .map((reply) => (
                            <div key={reply._id} className="reply-card">
                              <strong>↳ {reply.author.name}</strong>

                              <p>{reply.content}</p>
                            </div>
                          ))}
                      </div>

                      {/* REPLY INPUT */}

                      <div className="reply-form">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyTexts[comment._id] || ""}
                          onChange={(e) =>
                            setReplyTexts((previousReplyTexts) => ({
                              ...previousReplyTexts,
                              [comment._id]: e.target.value,
                            }))
                          }
                        />

                        <button
                          onClick={() =>
                            handleCreateReply(post._id, comment._id)
                          }
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Feed;
