import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function UserProfile() {
  // =========================
  // STATE
  // =========================

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const { userId } = useParams();

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
  // FETCH USER PROFILE
  // =========================

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUser(response.data.user);
    } catch (error) {
      console.log("Fetch user profile error:", error);
    }
  };

  // =========================
  // FETCH USER POSTS
  // =========================

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/posts/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPosts(response.data.posts);
    } catch (error) {
      console.log("Fetch user posts error:", error);
    }
  };

  // =========================
  // FOLLOW USER
  // =========================

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/users/${userId}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchCurrentUser();
      await fetchUserProfile();
    } catch (error) {
      console.log("Follow user error:", error);
    }
  };

  // =========================
  // UNFOLLOW USER
  // =========================

  const handleUnfollow = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/users/${userId}/unfollow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchCurrentUser();
      await fetchUserProfile();
    } catch (error) {
      console.log("Unfollow user error:", error);
    }
  };

  // =========================
  // LOAD PAGE
  // =========================

  useEffect(() => {
    fetchCurrentUser();
    fetchUserProfile();
    fetchUserPosts();
  }, [userId]);

  // =========================
  // LOADING
  // =========================

  if (!user || !currentUser) {
    return (
      <div>
        <Navbar />

        <main className="other-profile-container">
          <div className="other-profile-card">
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // FOLLOW STATUS
  // =========================

  const isFollowing = currentUser.following?.some(
    (followedUserId) => followedUserId.toString() === userId,
  );

  // =========================
  // UI
  // =========================

  return (
    <div>
      <Navbar />

      <main className="other-profile-container">
        {/* PROFILE */}

        <section className="other-profile-card">
          <div className="other-profile-header">
            <div className="other-profile-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div className="other-profile-main-info">
              <h1>{user.name}</h1>

              <p>ConnectHub member</p>
            </div>
          </div>

          {/* BIO + LOCATION */}

          <div className="other-profile-details">
            <div className="other-profile-detail">
              <span>Bio</span>

              <p>{user.bio || "No bio added yet"}</p>
            </div>

            <div className="other-profile-detail">
              <span>Location</span>

              <p>{user.location || "No location added yet"}</p>
            </div>
          </div>

          {/* STATS */}

          <div className="other-profile-stats">
            <div>
              <strong>{user.followers?.length || 0}</strong>

              <span>Followers</span>
            </div>

            <div>
              <strong>{user.following?.length || 0}</strong>

              <span>Following</span>
            </div>

            <div>
              <strong>{posts.length}</strong>

              <span>Posts</span>
            </div>
          </div>

          {/* FOLLOW / UNFOLLOW */}

          {currentUser._id !== userId && (
            <>
              {isFollowing ? (
                <button className="unfollow-button" onClick={handleUnfollow}>
                  Unfollow
                </button>
              ) : (
                <button className="follow-button" onClick={handleFollow}>
                  Follow
                </button>
              )}
            </>
          )}
        </section>

        {/* USER POSTS */}

        <section className="other-profile-posts">
          <h2>{user.name}'s Posts</h2>

          {posts.length === 0 ? (
            <div className="other-profile-empty">
              <p>This user hasn't created any posts yet.</p>
            </div>
          ) : (
            <div className="other-profile-post-list">
              {posts.map((post) => (
                <article key={post._id} className="other-profile-post-card">
                  {/* POST HEADER */}

                  <div className="other-post-header">
                    <div className="other-post-avatar">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{user.name}</strong>

                      <span>ConnectHub member</span>
                    </div>
                  </div>

                  {/* SHARED POST */}

                  {post.sharedPost ? (
                    <div className="other-shared-wrapper">
                      <p className="other-shared-label">
                        {user.name} shared a post
                      </p>

                      <div className="other-shared-post">
                        <strong>
                          {post.sharedPost.author?.name || "User"}
                        </strong>

                        <p>{post.sharedPost.content}</p>
                      </div>
                    </div>
                  ) : (
                    /* NORMAL POST */

                    <p className="other-post-content">{post.content}</p>
                  )}

                  <div className="other-post-stats">
                    {post.likes.length}{" "}
                    {post.likes.length === 1 ? "Like" : "Likes"}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default UserProfile;
