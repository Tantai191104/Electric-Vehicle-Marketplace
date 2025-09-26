// utils/formatVND.ts
export const formatVND = (amount?: number | string): string => {
  if (!amount) return "0 VNĐ";
  const numberAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return numberAmount.toLocaleString("vi-VN") + " VNĐ";
};
