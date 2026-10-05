import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute({ children }) {
  const { status, error, retry, logout } = useAuth();
  const location = useLocation();
  if (status === "checking") return <p role="status">Checking your session...</p>;
  if (status === "error") return <div role="alert">
    <p>{error}</p>
    <button onClick={() => retry()}>Retry</button>
    <button onClick={logout}>Return to login</button>
  </div>;
  if (status !== "authenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
export default ProtectedRoute;
