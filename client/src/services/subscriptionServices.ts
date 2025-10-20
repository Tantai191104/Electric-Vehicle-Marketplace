import API from "@/lib/axios";

export const subscriptionServices = {
  getAdminSubscriptions: async () => {
    return API.get("/admin/subscriptions");
  },
  // fetch active (public) subscription plans for customers
  getActiveSubscriptions: async () => {
    const resp = await API.get("/subscriptions/active");
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
