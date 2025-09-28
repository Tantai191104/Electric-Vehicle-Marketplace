export type ShippingFeePayload = {
  service_type_id: 2;
  from_district_id: number;
  from_ward_code: string;
  to_district_id: number;
  to_ward_code: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  insurance_value: number;
  coupon: null;
};

export type OrderPayload = {
  productName: string;
  from_name: string;
  from_phone: string;
  from_address: string;
  from_ward_name: string;
  from_district_name: string;
  from_province_name: string;

  to_name: string;
  to_phone: string;
  to_address: string;
  to_ward_name: string;
  to_district_name: string;
  to_province_name: string;

  length: number;
  width: number;
  height: number;
  weight: number;
  unit_price: number;
  shipping_fee: number;
  service_type_id: number;
  payment_type_id: number;
  insurance_value: number;
  cod_amount: number;
  required_note: "KHONGCHOXEMHANG" | "CHOXEMHANGKHONGTHU" | "CHOTHUHANG"; // GHN yêu cầu fixed values
};
