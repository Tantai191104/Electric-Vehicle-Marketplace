import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VehicleFormData, BatteryFormData, Location } from "@/types/productType";
import { useAuthStore } from "@/store/auth";

interface Props {
  form: VehicleFormData | BatteryFormData;
  setForm: React.Dispatch<React.SetStateAction<VehicleFormData | BatteryFormData | null>>;
}

const LocationForm: React.FC<Props> = ({ form, setForm }) => {
  const { user } = useAuthStore();

  // Auto-fill location from user profile
  useEffect(() => {
    if (user?.profile?.address) {
      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          location: {
            city: user.profile.address.province || "",
            province: user.profile.address.province || "",
            address: [
              user.profile.address.houseNumber,
              user.profile.address.ward,
              user.profile.address.district
            ].filter(Boolean).join(", ")
          },
        };
      });
    }
  }, [user, setForm]);

  const handleLocationChange = (field: keyof Location, value: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        location: { ...prev.location, [field]: value },
      };
    });
  };

  const locationLabels = {
    city: "Thành phố",
    province: "Tỉnh/Thành phố",
    address: "Địa chỉ cụ thể"
  };

  const locationPlaceholders = {
    city: "Hồ Chí Minh, Hà Nội, Đà Nẵng...",
    province: "TP. Hồ Chí Minh, Hà Nội, Đà Nẵng...",
    address: "Số nhà, tên đường, phường/xã..."
  };

  return (
    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Địa chỉ 
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(form.location).map((key) => (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-semibold text-gray-800">
              {locationLabels[key as keyof typeof locationLabels]}
            </Label>
            <Input
              value={form.location[key as keyof Location]}
              onChange={(e) => handleLocationChange(key as keyof Location, e.target.value)}
              placeholder={locationPlaceholders[key as keyof typeof locationPlaceholders]}
              disabled
              className="w-full rounded-xl bg-gray-50 border border-gray-200 h-12 px-4 shadow-sm cursor-not-allowed text-gray-600"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LocationForm;
