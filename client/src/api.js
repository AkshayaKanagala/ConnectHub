import axios from "axios";

export const SESSION_EVENT = "connecthub:session-expired";
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.url !== "/api/auth/login") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && error.config?.url !== "/api/auth/login") {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
  return Promise.reject(error);
});

export default API;
