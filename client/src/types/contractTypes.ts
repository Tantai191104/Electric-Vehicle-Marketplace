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
  // Server may return template info that can be either a simple template descriptor
  // (name + placeholders) or a richer template with htmlContent / terms.
  template: ContractTemplate;

  // URLs stored on the contract
  draftPdfUrl?: string | null;
  finalPdfUrl?: string | null;

  // Timestamps when parties signed
  sellerSignedAt?: string | null;
  buyerSignedAt?: string | null;
  signedAt?: string | null;

  // optional metadata from product/creation
  metadata?: Record<string, unknown>;
  templateName?: string | null;
}

export interface Party {
  id: string;
  name: string;
  signed: boolean;
}

export interface ContractTemplate {
  // human-facing name of the template (if provided by server)
  name?: string | null;

  // Optionally the rendered HTML content for the template (server may store it)
  htmlContent?: string | null;

  // base64 dataURL of seller signature (if present on product template)
  sellerSignature?: string | null;

  // URL to an existing PDF for the template (product-level)
  pdfUrl?: string | null;

  // When returned from /contracts/initiate the server includes placeholders
  // used by the client to populate the template. These are optional.
  placeholders?: Record<string, string | number> | null;

  // Optional editable terms array
  terms?: Array<{ title: string; content: string }> | null;

  createdAt?: string | null;
}
