import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BatteryFormData, BatteryLocation } from "@/types/productType";

interface Props {
  form: BatteryFormData;
  setForm: React.Dispatch<React.SetStateAction<BatteryFormData>>;
}

const LocationForm: React.FC<Props> = ({ form, setForm }) => {
  const handleLocationChange = (field: keyof BatteryLocation, value: string) => {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  return (
    <section className="space-y-2">
      <div className="font-semibold text-lg">Địa điểm</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.keys(form.location).map((key) => (
          <div key={key}>
            <Label>{key}</Label>
            <Input
              value={form.location[key as keyof BatteryLocation]}
              onChange={(e) => handleLocationChange(key as keyof BatteryLocation, e.target.value)}
              placeholder={`Nhập ${key}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LocationForm;
