import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "../utils/cookie";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

// -----------------------------
// Token refresh handling
// -----------------------------
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

async function refreshToken(): Promise<string> {
  if (isRefreshing) {
    // If already refreshing, return a promise that resolves when token is refreshed
    return new Promise((resolve) => {
      refreshSubscribers.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    // Refresh token call
    const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
    const newToken = response.data.accessToken;
    setCookie("access_token", newToken, 1) //added
    onRefreshed(newToken);
    return newToken;
  } catch (err) {
    // If refresh fails, logout
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    window.location.href = "/login";
    throw err;
  } finally {
    isRefreshing = false;
  }
}

// -----------------------------
// Check if token is expiring soon
// -----------------------------
function isTokenExpiringSoon(token: string, offsetSeconds = 60) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp; // in seconds
    const now = Math.floor(Date.now() / 1000);
    return exp - now < offsetSeconds; // true if expiring in less than offsetSeconds
  } catch {
    return true; // treat invalid token as expired
  }
}

// -----------------------------
// Request interceptor
// -----------------------------
apiClient.interceptors.request.use(
  async (config) => {
    let token = getCookie("access_token");
    if (token && isTokenExpiringSoon(token)) {
      token = await refreshToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------
// Response interceptor
// -----------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest); // retry original request
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
