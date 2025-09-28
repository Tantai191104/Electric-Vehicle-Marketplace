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
    const { accessToken, isAuthenticated, user, setAuth, clearAuth } =
      useAuthStore.getState();

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      isAuthenticated && // chỉ refresh khi đã login
      accessToken // phải có accessToken
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;

      try {
        interface RefreshResponse {
          accessToken: string;
        }

        const res = await APIRefresh.post<RefreshResponse>(
          "/auth/refresh-token",
          {}
        );
        const newAccessToken = res.data.accessToken;

        setAuth({ user: user!, accessToken: newAccessToken });

        if (originalRequest.headers)              
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
