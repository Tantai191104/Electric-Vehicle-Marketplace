import { useQuery } from "@tanstack/react-query";
import { adminServices } from "@/services/adminServices";

export const useOrders = () => {
  // Fetch all orders
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: adminServices.getAllOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    // Queries
    ordersQuery,
    
    // Helper methods
    refetchOrders: () => ordersQuery.refetch(),
  };
};