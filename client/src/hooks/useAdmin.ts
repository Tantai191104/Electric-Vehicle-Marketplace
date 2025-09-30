import { useQuery } from "@tanstack/react-query";
import { adminServices } from "@/services/adminServices";

export const useAdmin = () => {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: adminServices.fetchUsers,
  });

  return { usersQuery };
};
