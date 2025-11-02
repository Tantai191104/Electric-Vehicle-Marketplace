import API from "@/lib/axios";
import type {
  BatteryFormData,
  ProductsResponse,
  VehicleFormData,
} from "@/types/productType";
export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: "vehicle" | "battery";
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  search?: string;
}

export const productServices = {
  async fetchProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const { page = 1, limit = 10, ...otherFilters } = filters;
    const params = Object.fromEntries(
      Object.entries({ page, limit, ...otherFilters }).filter(
        ([, value]) => value !== undefined && value !== ""
      )
    );

    const response = await API.get("/products", { params });
    return response.data;
  },
  async fetchVehicleProducts(
    filters: Omit<ProductFilters, "category"> = {}
  ): Promise<ProductsResponse> {
    const { page = 1, limit = 10, ...otherFilters } = filters;
    const params = Object.fromEntries(
      Object.entries({ page, limit, ...otherFilters }).filter(
        ([, value]) => value !== undefined && value !== ""
      )
    );

    const response = await API.get("/products/vehicles", { params });
    return response.data;
  },
  async fetchBatteryProducts(
    filters: Omit<ProductFilters, "category"> = {}
  ): Promise<ProductsResponse> {
    const { page = 1, limit = 10, ...otherFilters } = filters;
    const params = Object.fromEntries(
      Object.entries({ page, limit, ...otherFilters }).filter(
        ([, value]) => value !== undefined && value !== ""
      )
    );
    const response = await API.get("/products/batteries", { params });
    return response.data;
  },
  async fetchProductById(id: string) {
    const response = await API.get(`/products/${id}`);
    console.log("fetchProductById response:", response);
    return response.data;
  },
  async updateProduct(id: string, data: Record<string, unknown>) {
    const response = await API.put(`/products/${id}`, data);
    return response.data;
  },
  async createProduct(data: BatteryFormData | VehicleFormData) {
    const response = await API.post("/products", data);
    return response.data;
  },
  async updateContractTemplate(
    productId: string,
    payload: {
      htmlContent?: string;
      sellerSignature?: string | null;
      pdfUrl?: string | null;
    }
  ) {
    const response = await API.put(
      `/products/${productId}/contract-template`,
      payload
    );
    return response.data;
  },
  async addWishlist(productId: string): Promise<null> {
    const response = await API.post("/profile/wishlist", { productId });
    return response.data;
  },
  async removeWishlist(productId: string): Promise<null> {
    const response = await API.delete(`/profile/wishlist/${productId}`);
    return response.data;
  },
  async suggestPrice(data: BatteryFormData | VehicleFormData): Promise<{ suggestedPrice: number; analysis: string }> {
    const response = await API.post("/products/suggest-price", data);
    return response.data;
  },
};
