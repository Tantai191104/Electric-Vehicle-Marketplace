import { useQuery } from "@tanstack/react-query";
import { adminServices } from "@/services/adminServices";

export const useOrders = () => {
  // Fetch all orders with auto-refresh
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: adminServices.getAllOrders,
    staleTime: 0, // Always refetch when invalidated (important for status updates)
    refetchInterval: 30 * 1000, 
    refetchIntervalInBackground: true, 
  });

  return {
    // Queries
    ordersQuery,
    
    // Helper methods
    refetchOrders: () => ordersQuery.refetch(),
  };
};