import { toast } from "sonner";
import { getErrorMessage } from "./errorHandler";
import type { AxiosError } from "axios";

interface ErrorResponseData {
  errorCode?: string;
  message?: string;
}

export const handleApiError = (error: AxiosError) => {
  const data = error?.response?.data as ErrorResponseData | undefined;
  const errorCode = data?.errorCode;
  const message = data?.message;

  const displayMessage = getErrorMessage(errorCode, message);

  toast.error("Error", {
    description: displayMessage,
  });

  // Log error for debugging
  console.error("API Error:", error);
};

// Global error handler for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);

  toast.error("Unexpected Error", {
    description: "Something went wrong. Please try again.",
  });
});

// Global error handler for uncaught errors
window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);

  // Don't show toast for network errors or script loading errors
  if (event.error?.name !== "NetworkError" && !event.filename) {
    toast.error("Application Error", {
      description: "An unexpected error occurred.",
    });
  }
});
