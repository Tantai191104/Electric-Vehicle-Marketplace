import API from "@/lib/axios";

export const violationServices = {
  // Lấy danh sách vi phạm (admin)
  getViolations: async () => {
    const resp = await API.get("/admin/violations");
    return resp.data;
  },

  // Tạo vi phạm cho user
  createViolation: async (userId: string, data: {
    violationType: string;
    description: string;
    severity: "low" | "medium" | "high";
    action: "warning" | "suspension" | "ban";
  }) => {
    const resp = await API.post(`/admin/users/${userId}/violations`, data);
    return resp.data;
  },

  // Xử lý vi phạm
  updateViolation: async (userId: string, violationId: string, data: {
    status: "pending" | "resolved";
    resolvedBy?: string;
    resolvedAt?: string;
    action?: string;
    note?: string;
  }) => {
    const resp = await API.put(`/admin/users/${userId}/violations/${violationId}`, data);
    return resp.data;
  },
};

export default violationServices;
