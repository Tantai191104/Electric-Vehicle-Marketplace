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
    console.log("Register data:", data);
    const response = await API.post("/auth/register", data);
    return response.data;
  },
};
