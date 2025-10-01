import API from "@/lib/axios";
import type { ContractResponse } from "@/types/contractTypes";

export const contractServices = {
  async createContract(data: {
    product_id: string;
    seller_id: string;
  }): Promise<ContractResponse> {
    const response = await API.post("/contracts/initiate", data);
    return response.data;
  },
  async signContract(contractId: string, pdf: File, finalUrl?: string) {
    const formData = new FormData();
    formData.append("contractId", contractId);
    if (finalUrl) {
      formData.append("finalUrl", finalUrl);
    }
    formData.append("pdf", pdf);

    const response = await API.post(`/contracts/sign`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
