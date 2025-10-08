import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { VehicleFormData, VehicleSpecifications } from "@/types/productType";

interface Props {
    form: VehicleFormData;
    setForm: React.Dispatch<React.SetStateAction<VehicleFormData>>;
}

// Labels tiếng Việt cho xe điện
const VEHICLE_SPEC_LABELS: Record<keyof VehicleSpecifications, string> = {
    batteryCapacity: "Dung lượng pin",
    range: "Quãng đường",
    chargingTime: "Thời gian sạc",
    power: "Công suất",
    maxSpeed: "Tốc độ tối đa",
    motorType: "Loại động cơ",
    batteryType: "Loại pin",
    voltage: "Điện áp",
    warranty: "Bảo hành",
    compatibility: "Tương thích",
};

// Đơn vị cho xe điện
const VEHICLE_SPEC_UNITS: Record<keyof VehicleSpecifications, string> = {
    batteryCapacity: "kWh",
    range: "km",
    chargingTime: "giờ",
    power: "W",
    maxSpeed: "km/h",
    motorType: "",
    batteryType: "",
    voltage: "V",
    warranty: "",
    compatibility: "",
};

// Options cho dropdown xe điện
const VEHICLE_SPEC_OPTIONS: Partial<Record<keyof VehicleSpecifications, string[]>> = {
    batteryCapacity: ["3.5", "5.0", "7.5", "10.0", "15.0", "20.0"],
    chargingTime: ["2-3", "4-5", "6-7", "8-10", "12+"],
    power: ["1000", "1500", "2000", "2500", "3000"],
    maxSpeed: ["25", "45", "60", "80", "120"],
    motorType: ["Permanent Magnet", "Induction", "Brushless DC"],
    batteryType: ["LFP", "NMC", "Li-ion"],
    voltage: ["12V", "24V", "36V", "48V", "72V", "96V"],
};

const VehicleSpecificationsForm: React.FC<Props> = ({ form, setForm }) => {
    const [customFields, setCustomFields] = useState<Partial<Record<keyof VehicleSpecifications, boolean>>>({});

    const handleSpecChange = (field: keyof VehicleSpecifications, value: string) => {
        setForm((prev) => ({
            ...prev,
            specifications: { ...prev.specifications, [field]: value },
        }));
    };

    const handleSelectChange = (field: keyof VehicleSpecifications, value: string) => {
        if (value === "Khác") {
            setCustomFields((prev) => ({ ...prev, [field]: true }));
            setForm((prev) => ({ ...prev, specifications: { ...prev.specifications, [field]: "" } }));
        } else {
            setCustomFields((prev) => ({ ...prev, [field]: false }));
            setForm((prev) => ({ ...prev, specifications: { ...prev.specifications, [field]: value } }));
        }
    };

    const inputClass = "w-full rounded-xl bg-white border border-gray-200 h-12 px-4 shadow-sm hover:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:border-yellow-500 transition duration-200";

    return (
        <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Thông số kỹ thuật xe điện
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.keys(form.specifications).map((key) => {
                    const typedKey = key as keyof VehicleSpecifications;
                    const options = VEHICLE_SPEC_OPTIONS[typedKey];
                    const isCustom = customFields[typedKey];

                    return (
                        <div key={key} className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">{VEHICLE_SPEC_LABELS[typedKey]}</Label>
                            {options && !isCustom ? (
                                <Select
                                    value={form.specifications[typedKey]}
                                    onValueChange={(val) => handleSelectChange(typedKey, val)}
                                >
                                    <SelectTrigger className={inputClass}>
                                        <SelectValue placeholder={`Chọn ${VEHICLE_SPEC_LABELS[typedKey]}`} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
                                        {options.map((opt) => (
                                            <SelectItem key={opt} value={opt} className="rounded-lg hover:bg-yellow-50">
                                                {opt} {VEHICLE_SPEC_UNITS[typedKey]}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="Khác" className="rounded-lg hover:bg-yellow-50">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="relative">
                                    <Input
                                        value={form.specifications[typedKey]}
                                        onChange={(e) => handleSpecChange(typedKey, e.target.value)}
                                        placeholder={VEHICLE_SPEC_LABELS[typedKey]}
                                        className={`${inputClass} ${VEHICLE_SPEC_UNITS[typedKey] ? 'pr-16' : ''}`}
                                    />
                                    {VEHICLE_SPEC_UNITS[typedKey] && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                                            {VEHICLE_SPEC_UNITS[typedKey]}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default VehicleSpecificationsForm;