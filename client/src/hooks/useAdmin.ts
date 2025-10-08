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

export const useRevenueData = (timeRange: string) => {
  return useQuery({
    queryKey: ["revenue-data", timeRange],
    queryFn: () => adminServices.getPlatformRevenue({ range: timeRange }),
  });
};
