import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Profile() {
  // =========================
  // STATE
  // =========================

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");

  // =========================
  // FETCH USER POSTS
  // =========================

  const fetchUserPosts = async (userId) => {
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
  // FETCH MY PROFILE
  // =========================

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data.user;

      setUser(userData);

      fetchUserPosts(userData._id);
    } catch (error) {
      console.log("Fetch profile error:", error);
    }
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEditProfile = () => {
    setEditName(user.name);
    setEditBio(user.bio || "");
    setEditLocation(user.location || "");

    setIsEditing(true);
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          name: editName,
          bio: editBio,
          location: editLocation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUser((previousUser) => ({
        ...previousUser,
        ...response.data.user,
      }));

      setIsEditing(false);
    } catch (error) {
      console.log("Update profile error:", error);
    }
  };

  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {
    fetchProfile();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (!user) {
    return (
      <div>
        <Navbar />

        <main className="profile-container">
          <div className="profile-card">
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div>
      <Navbar />

      <main className="profile-container">
        <h2 className="profile-page-title">My Profile</h2>

        {/* PROFILE CARD */}

        <section className="profile-card">
          {!isEditing ? (
            <>
              <div className="profile-header">
                <div className="profile-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>

                <div className="profile-main-info">
                  <h2>{user.name}</h2>

                  <p>{user.email}</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="profile-detail">
                  <span>Bio</span>

                  <p>{user.bio || "No bio added yet"}</p>
                </div>

                <div className="profile-detail">
                  <span>Location</span>

                  <p>{user.location || "No location added yet"}</p>
                </div>
              </div>

              <div className="profile-stats">
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

              <button
                className="edit-profile-button"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
            </>
          ) : (
            /* EDIT PROFILE */

            <div className="profile-edit-form">
              <h3>Edit Profile</h3>

              <div className="profile-form-group">
                <label>Name</label>

                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label>Bio</label>

                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label>Location</label>

                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
              </div>

              <div className="profile-edit-actions">
                <button
                  className="save-profile-button"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </button>

                <button
                  className="cancel-profile-button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* MY POSTS */}

        <section className="profile-posts-section">
          <h2>My Posts</h2>

          {posts.length === 0 ? (
            <div className="empty-posts-card">
              <p>You haven't created any posts yet.</p>
            </div>
          ) : (
            <div className="profile-posts-list">
              {posts.map((post) => (
                <article key={post._id} className="profile-post-card">
                  <div className="profile-post-header">
                    <div className="small-avatar">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{user.name}</strong>

                      <span>ConnectHub member</span>
                    </div>
                  </div>

                  {post.sharedPost ? (
                    <div className="profile-shared-wrapper">
                      <p className="profile-shared-label">You shared a post</p>

                      <div className="profile-shared-post">
                        <strong>
                          {post.sharedPost.author?.name || "User"}
                        </strong>

                        <p>{post.sharedPost.content}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="profile-post-content">{post.content}</p>
                  )}

                  <div className="profile-post-stats">
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

export default Profile;
