import { useQuery } from "@tanstack/react-query";
import { adminServices } from "@/services/adminServices";

export const useAdmin = () => {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: adminServices.fetchUsers,
  });
  const productsQuery = useQuery({
    queryKey: ["pending-products"],
    queryFn: adminServices.fetchPendingProducts,
  });
  return { usersQuery, productsQuery };
};

export const useTransactionStats = (timeRange: string) => {
  return useQuery({
    queryKey: ["transaction-stats", timeRange],
    queryFn: () => adminServices.getTransactionStats({ range: timeRange }),
  });
};

interface UseRevenueParams {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

export const useRevenueData = ({
  timeRange,
  startDate,
  endDate,
}: UseRevenueParams) => {
  // Nếu không có start/end thì lấy từ đầu năm đến nay
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), 0, 1)
    .toISOString()
    .split("T")[0];
  const defaultEnd = now.toISOString().split("T")[0];

  const effectiveStart = startDate || defaultStart;
  const effectiveEnd = endDate || defaultEnd;

  return useQuery({
    queryKey: ["revenue-data", timeRange, effectiveStart, effectiveEnd],
    queryFn: () =>
      adminServices.getPlatformRevenue({
        range: timeRange,
        startDate: effectiveStart,
        endDate: effectiveEnd,
      }),
  });
};
