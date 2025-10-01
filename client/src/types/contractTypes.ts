export interface ContractInfo {
  contractNumber: string;
  seller: ContractParty;
  buyer: ContractParty;
  vehicle: VehicleInfo;
  price: number;
  priceInWords: string;
  signDate: string;
}

export interface ContractParty {
  name: string;
  idNumber: string;
  address?: string;
  phone?: string;
}

export interface VehicleInfo {
  name: string;
  plateNumber: string;
  year?: number;
  brand?: string;
  model?: string;
}

export interface ContractResponse {
  success: boolean;
  data: ContractData;
}

export interface ContractData {
  contractId: string;
  status: "draft" | "signed" | "completed" | string; // có thể refine thêm nếu biết rõ trạng thái
  seller: Party;
  buyer: Party;
  template: ContractTemplate;
}

export interface Party {
  id: string;
  name: string;
  signed: boolean;
}

export interface ContractTemplate {
  name: string;
  placeholders: {
    sellerName: string;
    buyerName: string;
    productTitle: string;
    unitPrice: number;
    [key: string]: string | number; // phòng khi có thêm placeholder khác
  };
}
