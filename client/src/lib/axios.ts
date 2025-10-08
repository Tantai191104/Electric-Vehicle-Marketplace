import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({ baseURL: BASE_URL, withCredentials: true });
const APIRefresh = axios.create({ baseURL: BASE_URL, withCredentials: true });

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
  originalRequest: InternalAxiosRequestConfig;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (token) {
      if (originalRequest.headers)
        originalRequest.headers.Authorization = `Bearer ${token}`;
      resolve(API(originalRequest));
    } else {
      reject(error);
    }
  });
  failedQueue = [];
};

// Attach accessToken
API.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const { isAuthenticated, user, setAuth, clearAuth } =
      useAuthStore.getState();

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      isAuthenticated
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;

      try {
        const res = await APIRefresh.post("/auth/refresh-token");
        const newToken = res.data.accessToken;

        if (!newToken) throw new Error("Không nhận được accessToken mới");

        setAuth({ user, accessToken: newToken });
        processQueue(null, newToken);

        // Retry request cũ
        if (originalRequest.headers)
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (err) {
        // Chỉ logout khi thực sự refresh token thất bại
        processQueue(err, null);
        clearAuth();
        window.location.href = "/auth/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
