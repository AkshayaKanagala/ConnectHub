import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Login() {
  // =========================
  // STATE
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, status } = useAuth();
  const from = location.state?.from;
  const destination = from && !["/", "/login"].includes(from.pathname)
    ? `${from.pathname}${from.search || ""}${from.hash || ""}` : "/feed";
  if (status === "authenticated") return <Navigate to={destination} replace />;

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) return;
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setIsLoading(true);

      await login(email, password);
      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        (error.code === "ECONNABORTED" ? "The server took too long to respond. Please try again." :
        error.request ? "Unable to reach the server. Check your connection and try again." :
        error.message || "Login failed. Please try again."),
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
                autoComplete="username"
                required
                disabled={isLoading || status === "checking"}
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
                autoComplete="current-password"
                required
                disabled={isLoading || status === "checking"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ERROR */}

            {errorMessage && <div className="login-error" role="alert">{errorMessage}</div>}

            {/* LOGIN BUTTON */}

            <button className="login-button" type="submit" disabled={isLoading || status === "checking"}>
              {status === "checking" ? "Checking session..." : isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="login-footer">Welcome to ConnectHub</p>
        </section>
      </div>
    </div>
  );
}

export default Login;
