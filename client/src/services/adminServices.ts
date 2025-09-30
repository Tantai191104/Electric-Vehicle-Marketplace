import API from "@/lib/axios";
import type { User } from "@/types/authType";

export const adminServices = {
  async fetchUsers(): Promise<User[]> {
    const response = await API.get("/admin/users");
    return response.data.data;
  },
};
