// utils/date.ts
export const formatTime = (date: Date) => {
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};
