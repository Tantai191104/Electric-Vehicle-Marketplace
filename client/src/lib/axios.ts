import { useAuthStore } from "@/store/auth";
import axios, {
  AxiosError,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const options: CreateAxiosDefaults = {
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

const API = axios.create(options);
const APIRefresh = axios.create(options);

// ----------------------
// Request interceptor: attach token
// ----------------------
API.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------
// Response interceptor
// ----------------------
API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        interface RefreshResponse {
          accessToken: string;
        }
        const res = await APIRefresh.post<RefreshResponse>("/auth/refresh", {});
        const newAccessToken = res.data.accessToken;

        // update accessToken vào store
        const { user, setAuth } = useAuthStore.getState();
        setAuth({ user, accessToken: newAccessToken });

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return API(originalRequest); // retry request
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
