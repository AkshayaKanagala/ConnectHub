import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

function SearchUsers() {
  // =========================
  // STATE
  // =========================

  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  // =========================
  // SEARCH USERS
  // =========================

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/api/users/search", {
        params: {
          q: searchTerm,
        },

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.users);
    } catch (error) {
      console.log("Search users error:", error);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div>
      <Navbar />

      <main className="search-container">
        <h2 className="search-page-title">Search Users</h2>

        {/* SEARCH BOX */}

        <section className="search-card">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search people by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <button onClick={handleSearch}>Search</button>
          </div>
        </section>

        {/* SEARCH RESULTS */}

        <section className="search-results-section">
          <h3>Results</h3>

          {users.length === 0 ? (
            <div className="no-results-card">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="users-list">
              {users.map((user) => (
                <article key={user._id} className="user-result-card">
                  <div className="user-result-info">
                    <div className="search-avatar">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="user-result-details">
                      <h3>{user.name}</h3>

                      <p>{user.bio || "No bio added yet"}</p>

                      <span>{user.location || "No location added yet"}</span>
                    </div>
                  </div>

                  <button
                    className="view-profile-button"
                    onClick={() => navigate(`/user/${user._id}`)}
                  >
                    View Profile
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default SearchUsers;
