import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { BatteryFormData, BatterySpecifications } from "@/types/productType";

interface Props {
    form: BatteryFormData;
    setForm: React.Dispatch<React.SetStateAction<BatteryFormData>>;
}

// Labels tiếng Việt
const SPEC_LABELS: Record<keyof BatterySpecifications, string> = {
    batteryCapacity: "Dung lượng pin",
    range: "Quãng đường",
    chargingTime: "Thời gian sạc",
    power: "Công suất",
    weight: "Trọng lượng",
    dimensions: "Kích thước",
};

// Postfix/đơn vị
const SPEC_UNITS: Record<keyof BatterySpecifications, string> = {
    batteryCapacity: "Ah",
    range: "km",
    chargingTime: "giờ",
    power: "W",
    weight: "kg",
    dimensions: "mm",
};

// Options cho dropdown
const SPEC_OPTIONS: Partial<Record<keyof BatterySpecifications, string[]>> = {
    batteryCapacity: ["10", "12", "15", "20", "24", "30"],
    chargingTime: ["1", "2", "3", "4", "5", "6"],
    power: ["250", "350", "500", "750", "1000"],
    weight: ["5", "7", "10", "12", "15"],
};

const SpecificationsForm: React.FC<Props> = ({ form, setForm }) => {
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

    return (
        <section className="space-y-3">
            <div className="font-semibold text-lg">Thông số kỹ thuật</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(form.specifications).map((key) => {
                    const typedKey = key as keyof BatterySpecifications;
                    const options = SPEC_OPTIONS[typedKey];
                    const isCustom = customFields[typedKey];

                    return (
                        <div key={key}>
                            <Label>{SPEC_LABELS[typedKey]}</Label>
                            {options && !isCustom ? (
                                <Select
                                    value={form.specifications[typedKey]}
                                    onValueChange={(val) => handleSelectChange(typedKey, val)}
                                >
                                    <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-200 h-10 px-3">
                                        <SelectValue placeholder={`Chọn ${SPEC_LABELS[typedKey]}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                                {opt} {SPEC_UNITS[typedKey]}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="Khác">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="relative">
                                    <Input
                                        value={form.specifications[typedKey]}
                                        onChange={(e) => handleSpecChange(typedKey, e.target.value)}
                                        placeholder={SPEC_LABELS[typedKey]}
                                        className="pr-14 rounded-lg bg-gray-50 border-gray-200"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                        {SPEC_UNITS[typedKey]}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default SpecificationsForm;
