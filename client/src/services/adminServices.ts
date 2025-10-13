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
interface RevenueItem {
  date: string;
  revenue: number;
  orders: number;
}
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
  async getPlatformRevenue(params?: MetricsParams): Promise<RevenueItem[]> {
    const query: MetricsParams = {};
    if (params?.range) query.range = params.range;
    if (params?.startDate) query.startDate = params.startDate;
    if (params?.endDate) query.endDate = params.endDate;

    const response = await API.get("/admin/revenue", {
      params: Object.keys(query).length ? query : undefined,
    });

    const data = response.data.data;

    // Map labels, revenue, orders thành array object
    const timeline: RevenueItem[] = data.labels.map(
      (label: string, index: number) => ({
        date: label,
        revenue: data.revenue[index],
        orders: data.orders[index],
      })
    );

    return timeline;
  },
  async getAllOrders(): Promise<Order[]> {
    const response = await API.get("/admin/orders");
    return response.data.data;
  },
  async refundDeposit(orderId: string, reason: string): Promise<null> {
    const response = await API.patch(`/deposit/${orderId}/cancel`, { reason });
    return response.data;
  },
  async confirmDeposit(orderId: string, notes: string): Promise<null> {
    const response = await API.patch(`/deposit/${orderId}/confirm`, { notes });
    return response.data;
  },
};
