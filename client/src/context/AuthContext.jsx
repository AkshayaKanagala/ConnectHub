import { useEffect, useState } from "react";
import API, { SESSION_EVENT } from "../api";

import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setStatus("anonymous");
    setError("");
  };

  const restoreSession = async (signal) => {
    setStatus("checking");
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("anonymous");
      return;
    }
    try {
      const { data } = await API.get("/api/auth/me", { signal });
      if (localStorage.getItem("token") !== token) return;
      if (!data.success || !data.user) throw new Error("Invalid session response");
      setUser(data.user);
      setStatus("authenticated");
    } catch (error) {
      if (signal?.aborted || localStorage.getItem("token") !== token) return;
      if ([401, 404].includes(error.response?.status)) {
        logout();
      } else {
        setError("Unable to verify your session. Check the server and try again.");
        setStatus("error");
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    // Defer startup so StrictMode cleanup can cancel the discarded effect.
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) restoreSession(controller.signal);
    });
    const onStorage = (event) => {
      if (event.key === "token" || event.key === null) window.location.reload();
    };
    window.addEventListener(SESSION_EVENT, logout);
    window.addEventListener("storage", onStorage);
    return () => {
      controller.abort();
      window.removeEventListener(SESSION_EVENT, logout);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/api/auth/login", {
      email: email.trim().toLowerCase(), password,
    });
    if (!data.success || typeof data.token !== "string" || !data.token || !data.user?.id) {
      throw new Error("The server returned an invalid login response. Please try again.");
    }
    localStorage.setItem("token", data.token);
    setUser({ ...data.user, _id: data.user.id });
    setStatus("authenticated");
    setError("");
  };

  return <AuthContext.Provider value={{ user, status, error, login, logout, retry: restoreSession }}>
    {children}
  </AuthContext.Provider>;
}

