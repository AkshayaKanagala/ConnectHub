import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  // =========================
  // STATE
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email,
          password: password,
        },
      );

      localStorage.setItem("token", response.data.token);

      navigate("/feed");
    } catch (error) {
      console.log("Login error:", error);

      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* LEFT SIDE */}

        <section className="login-brand">
          <h1>ConnectHub</h1>

          <h2>Connect. Share. Grow.</h2>

          <p>
            A simple social community where people can share posts, connect with
            others, and build meaningful connections.
          </p>
        </section>

        {/* LOGIN CARD */}

        <section className="login-card">
          <div className="login-card-header">
            <h2>Welcome Back</h2>

            <p>Sign in to continue to ConnectHub</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            {/* EMAIL */}

            <div className="login-form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}

            <div className="login-form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ERROR */}

            {errorMessage && <div className="login-error">{errorMessage}</div>}

            {/* LOGIN BUTTON */}

            <button className="login-button" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="login-footer">Welcome to ConnectHub</p>
        </section>
      </div>
    </div>
  );
}

export default Login;
