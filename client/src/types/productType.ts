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
  specifications: Record<string, string>;
  seller: string;
  status: string;
  isFeatured: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
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
