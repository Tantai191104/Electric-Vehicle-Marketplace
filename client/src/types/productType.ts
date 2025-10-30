export type Seller = {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string | null;
  role?: string;
  isActive?: boolean;
    address?: {
      houseNumber?: string;
      provinceCode?: string;
      districtCode?: string;
      wardCode?: string;
      province?: string;
      district?: string;
      ward?: string;
    bankAccount?: {
      bankName?: string | null;
      accountNumber?: string | null;
      accountHolder?: string | null;
    };
    fullName?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    identityCard?: string | null;
    violations?: Violation[];
  };
  wallet?: {
    balance?: number;
    totalDeposited?: number;
    totalSpent?: number;
  };
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    language?: string;
    currency?: string;
  };
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  wishlist?: string[];
};

// Reusable small types
export interface Violation {
  reason?: string;
  date?: string;
  [key: string]: unknown;
}


export type ContractTemplate = {
  htmlContent: string | null;
  sellerSignature: string | null; // data URL (base64) of seller signature image
  pdfUrl: string | null; // public URL to PDF (Cloudinary or similar)
  createdAt: string | null;
};

export type Contract = {
  contractTemplate: ContractTemplate;
  _id: string;
  title: string;
  description: string;
  price: number;
  category: "vehicle" | "battery";
  brand: string;
  model: string;
  year: number;
  condition: string;
  images: string[];
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  seller: Seller;
  status: string;
  isFeatured: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  approvedAt?: string;
  approvedBy?: string;
};

export type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: "vehicle" | "battery";
  brand: string;
  model: string;
  year: number;
  condition: string;
  images: string[];
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  specifications?: Record<string, string>;
  seller: Seller;
  status: string;
  isFeatured: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  approvedAt?: string;
  approvedBy?: string;
  contractTemplate?: ContractTemplate | null; // Contract có thể có hoặc không
  isInWishlist?: boolean; // Để check sản phẩm có trong wishlist không
};

export interface VehicleSpecifications {
  batteryCapacity: string;
  range: string;
  chargingTime: string;
  power: string;
  maxSpeed: string;
  motorType: string;
  batteryType: string;
  voltage: string;
  warranty: string;
  compatibility: string;
}

// Specifications cho pin xe điện
export interface BatterySpecifications {
  batteryCapacity: string;
  voltage: string;
  capacity: string;
  cycleLife: string;
  chargingTime: string;
  operatingTemperature: string;
  weight: string;
  dimensions: string;
  warranty: string;
  compatibility: string;
}

export interface Location {
  city: string;
  province: string;
  address: string;
}

export type ProductCategory = "vehicle" | "battery";

// Form data chung
export interface BaseFormData {
  title: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  category?: ProductCategory;
  condition?: string;
  location: Location;
  images: string[];

  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}

// Form data cho xe điện
export interface VehicleFormData extends BaseFormData {
  category: "vehicle";
  specifications: VehicleSpecifications;
}

// Form data cho pin
export interface BatteryFormData extends BaseFormData {
  category: "battery";
  specifications: BatterySpecifications;
}

export type ProductFormData = VehicleFormData | BatteryFormData;

export type ProductsResponse = {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type ProductDetailResponse = {
  success?: boolean;
  product: Product;
};
