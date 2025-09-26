export interface BatterySpecifications {
  batteryCapacity: string;
  range: string;
  chargingTime: string;
  power: string;
  weight: string;
  dimensions: string;
}

export interface BatteryLocation {
  city: string;
  province: string;
  address: string;
}

export interface BatteryFormData {
  title: string;
  description: string;
  price: number;
  brand: string;
  model: string;    
  year: number;
  specifications: BatterySpecifications;
  location: BatteryLocation;
  images: string[];
}
