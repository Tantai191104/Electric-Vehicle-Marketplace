export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};
export interface OrderSummaryData {
  subtotal: number;
  shipping: number;
  tax: number;
  paymentFee: number;
  discount: number;
  total: number;
}

export const calculateOrderSummary = (
  price: number,
  quantity: number = 1,
  paymentFee: number = 0,
  discount: number = 0,
  shipping: number = 0
): OrderSummaryData => {
  const subtotal = price * quantity;
  const tax = 0; // Bỏ VAT
  const total = subtotal + paymentFee - discount; // Không cộng phí vận chuyển
  return { subtotal, shipping, tax, paymentFee, discount, total };
};
