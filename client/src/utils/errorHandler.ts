import { ERROR_MESSAGES } from "@/constants/error";

export type ErrorCodeType = keyof typeof ERROR_MESSAGES;

export const getErrorMessage = (
  errorCode?: string,
  defaultMessage?: string,
): string => {
  if (!errorCode) return defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;

  const message = ERROR_MESSAGES[errorCode as ErrorCodeType];
  return message || defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
};