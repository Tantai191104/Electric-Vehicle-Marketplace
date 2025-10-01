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
