import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { BatteryFormData, BatterySpecifications } from "@/types/productType";

interface Props {
    form: BatteryFormData;
    setForm: React.Dispatch<React.SetStateAction<BatteryFormData>>;
}

// Labels tiếng Việt cho pin
const BATTERY_SPEC_LABELS: Record<keyof BatterySpecifications, string> = {
    batteryCapacity: "Dung lượng pin",
    voltage: "Điện áp",
    capacity: "Công suất",
    cycleLife: "Chu kỳ sống",
    chargingTime: "Thời gian sạc",
    operatingTemperature: "Nhiệt độ hoạt động",
    weight: "Trọng lượng",
    dimensions: "Kích thước",
    warranty: "Bảo hành",
    compatibility: "Tương thích",
};

// Đơn vị cho pin
const BATTERY_SPEC_UNITS: Record<keyof BatterySpecifications, string> = {
    batteryCapacity: "kWh",
    voltage: "V",
    capacity: "Ah",
    cycleLife: "chu kỳ",
    chargingTime: "giờ",
    operatingTemperature: "°C",
    weight: "kg",
    dimensions: "mm",
    warranty: "",
    compatibility: "",
};

// Options cho dropdown pin
const BATTERY_SPEC_OPTIONS: Partial<Record<keyof BatterySpecifications, string[]>> = {
    batteryCapacity: ["3.5", "5.0", "7.5", "10.0", "15.0", "20.0"],
    voltage: ["12", "24", "36", "48", "72", "96"],
    capacity: ["10", "15", "20", "25", "30", "35"],
    cycleLife: ["500", "1000", "1500", "2000", "3000"],
    chargingTime: ["2-3", "4-5", "6-7", "8-10"],
    weight: ["5", "7", "10", "12", "15", "20"],
};

const BatterySpecificationsForm: React.FC<Props> = ({ form, setForm }) => {
    const [customFields, setCustomFields] = useState<Partial<Record<keyof BatterySpecifications, boolean>>>({});

    const handleSpecChange = (field: keyof BatterySpecifications, value: string) => {
        setForm((prev) => ({
            ...prev,
            specifications: { ...prev.specifications, [field]: value },
        }));
    };

    const handleSelectChange = (field: keyof BatterySpecifications, value: string) => {
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Thông số kỹ thuật pin
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.keys(form.specifications).map((key) => {
                    const typedKey = key as keyof BatterySpecifications;
                    const options = BATTERY_SPEC_OPTIONS[typedKey];
                    const isCustom = customFields[typedKey];

                    return (
                        <div key={key} className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">{BATTERY_SPEC_LABELS[typedKey]}</Label>
                            {options && !isCustom ? (
                                <Select
                                    value={form.specifications[typedKey]}
                                    onValueChange={(val) => handleSelectChange(typedKey, val)}
                                >
                                    <SelectTrigger className={inputClass}>
                                        <SelectValue placeholder={`Chọn ${BATTERY_SPEC_LABELS[typedKey]}`} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
                                        {options.map((opt) => (
                                            <SelectItem key={opt} value={opt} className="rounded-lg hover:bg-yellow-50">
                                                {opt} {BATTERY_SPEC_UNITS[typedKey]}
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
                                        placeholder={BATTERY_SPEC_LABELS[typedKey]}
                                        className={`${inputClass} ${BATTERY_SPEC_UNITS[typedKey] ? 'pr-16' : ''}`}
                                    />
                                    {BATTERY_SPEC_UNITS[typedKey] && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                                            {BATTERY_SPEC_UNITS[typedKey]}
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

export default BatterySpecificationsForm;