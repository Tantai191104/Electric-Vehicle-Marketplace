import API from "@/lib/axios";
import type { User } from "@/types/authType";
import type { Order } from "@/types/orderType";
import type { Product } from "@/types/productType";
interface MetricsParams {
  range?: string;
  startDate?: string;
  endDate?: string;
}
export type MetricData = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  percentageChanges: {
    users: number;
    products: number;
    orders: number;
    revenue: number;
    commission: number;
  };
};
export type TransactionStats = {
  categories: string[];
  values: number[];
  total: number;
  totalValue: number;
  successRate: string;
};
export const adminServices = {
  async fetchUsers(): Promise<User[]> {
    const response = await API.get("/users/list");
    console.log(response);
    return response.data;
  },
  async fetchPendingProducts(): Promise<Product[]> {
    const response = await API.get("/admin/products/pending");
    return response.data.data;
  },
  async fetchAllProducts(status?: string): Promise<{ data: Product[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const params = status ? { status } : {};
    const response = await API.get("/admin/products", { params });
    return response.data;
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
  async getPlatformMetrics(params?: MetricsParams): Promise<MetricData> {
    const query: MetricsParams = {};

    if (params?.range) query.range = params.range;
    if (params?.startDate) query.startDate = params.startDate;
    if (params?.endDate) query.endDate = params.endDate;

    const response = await API.get("/admin/stats", {
      params: Object.keys(query).length ? query : undefined,
    });
    console.log(response.data);
    return response.data.data;
  },
  async getTransactionStats(params?: MetricsParams): Promise<TransactionStats> {
    const query: MetricsParams = {};
    if (params?.range) query.range = params.range;
    if (params?.startDate) query.startDate = params.startDate;
    if (params?.endDate) query.endDate = params.endDate;
    const response = await API.get("/admin/orders/summary", {
      params: Object.keys(query).length ? query : undefined,
    });
    console.log(response.data);
    return response.data.data;
  },
  async getPlatformRevenue(params?: MetricsParams): Promise<{
    labels: string[];
    revenue: number[];
    orders: number[];
    growth: string;
    summary: {
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
    };
  }> {
    const query: MetricsParams = {};
    if (params?.range) query.range = params.range;
    if (params?.startDate) query.startDate = params.startDate;
    if (params?.endDate) query.endDate = params.endDate;

    const response = await API.get("/admin/revenue", {
      params: Object.keys(query).length ? query : undefined,
    });

    // Trả về đúng object cho chart
    return response.data.data;
  },
  async getAllOrders(): Promise<Order[]> {
    const response = await API.get("/admin/orders");
    return response.data.data;
  },
  async refundDeposit(orderId: string, reason: string) {
    const response = await API.patch(`/deposit/${orderId}/cancel`, { reason });
    return response.data;
  },
  async confirmDeposit(orderId: string, notes: string) {
    const response = await API.patch(`/deposit/${orderId}/confirm`, { notes });
    return response.data;
  },
  async syncGhnOrderStatus(orderId: string) {
    const response = await API.post(`/admin/orders/${orderId}/sync-ghn`);
    return response.data;
  },
};
