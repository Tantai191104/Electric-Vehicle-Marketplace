import API from "@/lib/axios";

export const subscriptionServices = {
  getAdminSubscriptions: async () => {
    return API.get("/admin/subscriptions");
  },
  // fetch active (public) subscription plans for customers
  getActiveSubscriptions: async () => {
    const resp = await API.get("/subscriptions/active");
    const payload = resp.data;
    // Normalize common response shapes: array or { success: true, data: [...] }
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object") {
      if (Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload.result)) return payload.result;
    }
    // fallback: return empty array
    return [];
  },
  // fetch the current authenticated user's subscription
  getMySubscription: async () => {
    const resp = await API.get("/subscriptions/me");
    return resp.data;
  },

  createSubscription: async (data: Record<string, unknown>) => {
    return API.post("/admin/subscriptions", data);
  },

  updateSubscription: async (id: string, data: Record<string, unknown>) => {
    return API.put(`/admin/subscriptions/${id}`, data);
  },

  deleteSubscription: async (id: string) => {
    return API.delete(`/admin/subscriptions/${id}`);
  },
};

export default subscriptionServices;
