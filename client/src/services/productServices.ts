import API from "@/lib/axios";
import type { BatteryFormData, ProductsResponse, VehicleFormData } from "@/types/productType";

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
  async fetchProducts(filters: ProductFilters = {}):Promise<ProductsResponse> {
    const { page = 1, limit = 10, ...otherFilters } = filters;
    const params = Object.fromEntries(
      Object.entries({ page, limit, ...otherFilters }).filter(([, value]) => value !== undefined && value !== "")
    );
    
    const response = await API.get("/products", { params });
    return response.data;
  },
  async fetchVehicleProducts(filters: Omit<ProductFilters, 'category'> = {}):Promise<ProductsResponse> {
    const { page = 1, limit = 10, ...otherFilters } = filters;
    const params = Object.fromEntries(
      Object.entries({ page, limit, ...otherFilters }).filter(([, value]) => value !== undefined && value !== "")
    );
    
    const response = await API.get("/products/vehicles", { params });
    return response.data;
  },
  async fetchBatteryProducts(filters: Omit<ProductFilters, 'category'> = {}):Promise<ProductsResponse> {
    const { page = 1, limit = 10, ...otherFilters } = filters;
    const params = Object.fromEntries(
      Object.entries({ page, limit, ...otherFilters }).filter(([, value]) => value !== undefined && value !== "")
    );
    const response = await API.get("/products/batteries", { params });
    return response.data;
  },
  async fetchProductById(id: string) {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },
  async createProduct(data: BatteryFormData | VehicleFormData) {
    const response = await API.post("/products", data);
    return response.data;
  },
};
