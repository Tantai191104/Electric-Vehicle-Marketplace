import API from "@/lib/axios";
export const authServices = {
  async login(data: { email: string; password: string }) {
    const response = await API.post("/auth/login", data);
    return response.data;
  },
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) {
    const response = await API.post("/auth/register", {
      ...data,
      role: "user",
    });
    return response.data;
  },
  async fetchProfile() {
    const response = await API.get("/auth/profile");
    return response.data;
  },
  async updateProfile(data: { name?: string; phone?: string }) {
    const response = await API.put("/auth/profile", data);
    return response.data;
  },
  async logout() {
    const response = await API.post("/auth/logout");
    return response.data;
  },
};
