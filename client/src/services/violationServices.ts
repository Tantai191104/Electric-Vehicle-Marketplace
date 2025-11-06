import API from "@/lib/axios";

// Define valid violation types based on backend enum
export type ViolationType =
  | "spam"
  | "fake_product"
  | "fraud"
  | "inappropriate"
  | "other";

export const violationServices = {
  // Lấy danh sách vi phạm (admin)
  getViolations: async () => {
    const resp = await API.get("/admin/violations");
    return resp.data;
  },

  // Tạo vi phạm cho user
  createViolation: async (
    userId: string,
    data: {
      violationType: ViolationType;
      description: string;
      severity: "low" | "medium" | "high";
      action: "warning" | "suspension" | "ban";
    }
  ) => {
    try {
      // Trim whitespace from violationType to avoid validation errors
      const cleanData = {
        ...data,
        violationType: data.violationType.trim(),
      };
      console.log("Creating violation with data:", cleanData);
      const resp = await API.post(
        `/admin/users/${userId}/violations`,
        cleanData
      );
      return resp.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error(
        "Violation creation error:",
        err.response?.data || err.message
      );
      throw error;
    }
  },

  // Xử lý vi phạm
  updateViolation: async (
    userId: string,
    violationId: string,
    data: {
      status: "pending" | "resolved";
      resolvedBy?: string;
      resolvedAt?: string;
      action?: string;
      note?: string;
    }
  ) => {
    const resp = await API.put(
      `/admin/users/${userId}/violations/${violationId}`,
      data
    );
    return resp.data;
  },
};

export default violationServices;
