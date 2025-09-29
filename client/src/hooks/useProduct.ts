import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productServices,
  type ProductFilters,
} from "@/services/productServices";
import type { BatteryFormData, VehicleFormData } from "@/types/productType";

// Query Keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductFilters) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Hook để fetch danh sách products
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: productKeys.list(filters || {}),
    queryFn: () => productServices.fetchProducts(filters),
  });
};

// Hook để fetch chi tiết 1 product (tạm thời comment vì chưa có API)
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      return productServices.fetchProductById(id);
    },
  });
};

// Hook để tạo product mới
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatteryFormData | VehicleFormData) =>
      productServices.createProduct(data),
    onSuccess: (data) => {
      // Invalidate và refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Có thể add product mới vào cache
      if (data?.data?._id) {
        queryClient.setQueryData(productKeys.detail(data.data._id), data);
      }
    },
    onError: (error) => {
      console.error("Error creating product:", error);
    },
  });
};

// TODO: Hook để update product (chưa có API)
// export const useUpdateProduct = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
//       productServices.updateProduct(id, data),
//   });
// };

// TODO: Hook để delete product (chưa có API)
// export const useDeleteProduct = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) => productServices.deleteProduct(id),
//   });
// };

// TODO: Hook với infinite query cho pagination (chưa test)
// export const useInfiniteProducts = (params?: Omit<ProductParams, 'page'>) => {
//   return useInfiniteQuery({
//     queryKey: [...productKeys.lists(), 'infinite', params],
//     queryFn: ({ pageParam = 1 }) =>
//       productServices.fetchProducts(
//         pageParam as number,
//         params?.limit || 10,
//         params?.category
//       ),
//     getNextPageParam: (lastPage: ProductsResponse) => {
//       const { page, pages } = lastPage.pagination;
//       return page < pages ? page + 1 : undefined;
//     },
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });
// };

// // Hook để thêm sản phẩm vào giỏ hàng
// export const useAddToCart = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       productId,
//       quantity = 1,
//     }: {
//       productId: string;
//       quantity?: number;
//     }) => productServices.addToCart(productId, quantity),
//     onSuccess: () => {
//       // Invalidate cart cache (nếu có)
//       queryClient.invalidateQueries({
//         queryKey: ["cart"],
//       });

//       toast.success("Đã thêm vào giỏ hàng thành công!");
//     },
//     onError: (error: unknown) => {
//       let errorMessage = "Không thể thêm vào giỏ hàng";

//       if (error && typeof error === "object" && "response" in error) {
//         const axiosError = error as {
//           response?: { data?: { message?: string } };
//         };
//         errorMessage = axiosError.response?.data?.message || errorMessage;
//       }

//       toast.error(errorMessage);
//       console.error("Error adding to cart:", error);
//     },
//   });
// };
