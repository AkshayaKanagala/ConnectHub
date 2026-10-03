import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/feed")}>
        ConnectHub
      </div>

      <div className="navbar-links">
        <button onClick={() => navigate("/feed")}>Feed</button>

        <button onClick={() => navigate("/search")}>Search Users</button>

        <button onClick={() => navigate("/profile")}>My Profile</button>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
