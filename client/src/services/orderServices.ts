import API from "@/lib/axios";
import type { DepositPayload, OrderPayload, ShippingFeePayload } from "@/types/shippingType";

export const orderServices = {
  async getShippingFee(shippingPayload: ShippingFeePayload) {
    const response = await API.post("/shipping/fee", shippingPayload);
    return response.data;
  },
  async createOrder(data: OrderPayload) {
    const response = await API.post("/shipping/order", data);
    return response.data;
  },
  async cancelOrder(order_code: string) {
    const response = await API.post(`/shipping/order/cancel`, { order_code });
    return response.data;
  } ,
  async createDepositOrder(data: DepositPayload) {
    const response = await API.post("/deposit/vehicle", data);
    return response.data;
  }
};
