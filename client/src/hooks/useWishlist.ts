import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/lib/axios";
import { productServices } from "@/services/productServices";
import type { Product } from "@/types/productType";

export const wishlistKeys = {
  all: ["profile", "wishlist"] as const,
  list: () => [...wishlistKeys.all, "list"] as const,
};

export const useWishlist = () => {
  return useQuery({
    queryKey: wishlistKeys.list(),
    queryFn: async (): Promise<Product[]> => {
      const res = await API.get("/profile/wishlist");
      return res.data?.products || res.data || [];
    },
  });
};

export const useAddToWishlist = () => {
  const qc = useQueryClient();
  return useMutation<null, unknown, string>({
    mutationFn: (productId: string) => productServices.addWishlist(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: wishlistKeys.list() }),
  });
};

export const useRemoveFromWishlist = () => {
  const qc = useQueryClient();
  return useMutation<null, unknown, string>({
    mutationFn: (productId: string) => productServices.removeWishlist(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: wishlistKeys.list() }),
  });
};
