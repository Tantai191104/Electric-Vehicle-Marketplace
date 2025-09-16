import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: (failureCount, error: unknown) => {
        // Cast error về AxiosError nếu là Axios
        const axiosError = error as AxiosError<{ message?: string }>;

        // Không retry lỗi client (4xx)
        if (
          axiosError?.response?.status &&
          axiosError.response.status >= 400 &&
          axiosError.response.status < 500
        ) {
          return false;
        }

        return failureCount < 3; // retry tối đa 3 lần
      },
    },
    mutations: {
      retry: 0, // mutation không retry
    },
  },
});
