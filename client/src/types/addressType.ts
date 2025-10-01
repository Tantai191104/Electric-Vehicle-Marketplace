export type Province = {
  ProvinceID: number;
  ProvinceName: string;
  CountryID: number;
  Code: string;
};
export type District = {
  DistrictID: number;
  DistrictName: string;
  ProvinceID: number;
  Code: string;
};
export type Ward = {
  WardCode: number;
  WardName: string;
  DistrictID: number;
};
export type LocationsPayload = {
  houseNumber: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
};
