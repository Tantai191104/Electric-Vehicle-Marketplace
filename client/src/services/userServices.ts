import API from "@/lib/axios";
import type {
  District,
  LocationsPayload,
  Province,
  Ward,
} from "@/types/addressType";
import type { User } from "@/types/authType";

  export const userServices = {
  async fetchProvince(): Promise<Province[]> {
    const response = await API.get("/profile/locations/provinces");
    console.log("Provinces data:", response.data);
    return response.data;
  },
  async fetchDistrict(provinceId: string): Promise<District[]> {
    const response = await API.get(
      `/profile/locations/districts?provinceCode=${provinceId}`
    );
    return response.data;
  },
  async fetchWard(districtId: string): Promise<Ward[]> {
    const response = await API.get(
      `/profile/locations/wards?districtId=${districtId}`
    );
    return response.data;
  },
  async updateProfile(data: LocationsPayload): Promise<null> {
    const response = await API.put("/profile/locations", data);
    return response.data;
  },
  async getProfile(): Promise<User> {
    const response = await API.get("/profile/profile");
    return response.data;
  },
  async fetchOrders() {
    const response = await API.get("/profile/orders");
    return response.data;
  },
  async fetchTransactions() {
    const response = await API.get("/profile/wallet/transactions");
    return response.data;
  },
  async fetchOwnedProducts() {
    const response = await API.get("/products/my/products");
    return response.data;
  }
};
