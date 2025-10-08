export type ApiResponse<T> = {
  message: string;
  data: T;
};
export type ApiError = {
  success?: boolean;
  message?: string;
  errorCode?: string;
  errors?: unknown[];
};