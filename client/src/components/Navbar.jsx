import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/feed")}>
        ConnectHub
      </div>

      <div className="navbar-links">
        <span>Signed in as {user?.name}</span>
        <button onClick={() => navigate("/feed")}>Feed</button>

        <button onClick={() => navigate("/search")}>Search Users</button>

        <button onClick={() => navigate("/profile")}>My Profile</button>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
