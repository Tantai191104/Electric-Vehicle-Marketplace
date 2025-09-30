import API from "@/lib/axios";
import type { User } from "@/types/authType";
import type { Product } from "@/types/productType";

export const adminServices = {
  async fetchUsers(): Promise<User[]> {
    const response = await API.get("/users/list");
    return response.data;
  },
  async fetchPendingProducts(): Promise<Product[]> {
    const response = await API.get("/admin/products/pending");
    return response.data.data;
  },
  async approveProduct(productId: string): Promise<{ message: string }> {
    const response = await API.patch(`/admin/products/${productId}/approve`);
    return response.data;
  },
  async rejectProduct(
    productId: string,
    reason: string
  ): Promise<{ message: string }> {
    const response = await API.patch(`/admin/products/${productId}/reject`, {
      reason,
    });
    return response.data;
  },
};
