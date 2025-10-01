import API from "@/lib/axios";
import type { ZaloPayOrder } from "@/types/walletType";

export const zaloPayServices = {
  createZaloPayOrder: async (data: ZaloPayOrder) => {
    const response = await API.post("/zalopay/create-order", data);
    return response.data;
  },
  checkZaloPayOrder: async (orderId: string) => {
    const response = await API.get(`/zalopay/order/${orderId}/status`);
    return response.data;
  }
  
};
