import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { ProductFormData, VehicleSpecifications, BatterySpecifications } from "@/types/productType";

interface Props {
    form: ProductFormData;
    setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
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

// Options cho dropdown pin
const BATTERY_SPEC_OPTIONS: Partial<Record<keyof BatterySpecifications, string[]>> = {
    batteryCapacity: ["3.5", "5.0", "7.5", "10.0", "15.0", "20.0"],
    voltage: ["12V", "24V", "36V", "48V", "72V", "96V"],
    capacity: ["10", "15", "20", "25", "30", "35"],
    cycleLife: ["500", "1000", "1500", "2000", "3000"],
    chargingTime: ["2-3", "4-5", "6-7", "8-10"],
    weight: ["5", "7", "10", "12", "15", "20"],
};

const SpecificationsForm: React.FC<Props> = ({ form, setForm }) => {
    const [customFields, setCustomFields] = useState<Record<string, boolean>>({});

    const isVehicle = form.category === "vehicle";

    // Get the appropriate labels, units, and options based on category
    const getSpecConfig = () => {
        if (isVehicle) {
            return {
                labels: VEHICLE_SPEC_LABELS as Record<keyof VehicleSpecifications, string>,
                units: VEHICLE_SPEC_UNITS as Record<string, string>,
                options: VEHICLE_SPEC_OPTIONS,
                keys: Object.keys(VEHICLE_SPEC_LABELS) as (keyof VehicleSpecifications)[]
            };
        } else {
            return {
                labels: BATTERY_SPEC_LABELS as Record<keyof BatterySpecifications, string>,
                units: BATTERY_SPEC_UNITS as Record<string, string>,
                options: BATTERY_SPEC_OPTIONS,
                keys: Object.keys(BATTERY_SPEC_LABELS) as (keyof BatterySpecifications)[]
            };
        }
    };

    const specConfig = getSpecConfig();

    const handleSpecChange = (field: string, value: string) => {
        setForm((prev) => {
            if (prev.category === "vehicle") {
                return {
                    ...prev,
                    specifications: {
                        ...(prev.specifications as VehicleSpecifications),
                        [field]: value,
                    } as VehicleSpecifications,
                };
            } else if (prev.category === "battery") {
                return {
                    ...prev,
                    specifications: {
                        ...(prev.specifications as BatterySpecifications),
                        [field]: value,
                    } as BatterySpecifications,
                };
            }
            return prev;
        });
    };

    const handleSelectChange = (field: string, value: string) => {
        if (value === "Khác") {
            setCustomFields((prev) => ({ ...prev, [field]: true }));
            setForm((prev) => {
                if (prev.category === "vehicle") {
                    return {
                        ...prev,
                        specifications: {
                            ...(prev.specifications as VehicleSpecifications),
                            [field]: "",
                        } as VehicleSpecifications,
                    };
                } else if (prev.category === "battery") {
                    return {
                        ...prev,
                        specifications: {
                            ...(prev.specifications as BatterySpecifications),
                            [field]: "",
                        } as BatterySpecifications,
                    };
                }
                return prev;
            });
        } else {
            setCustomFields((prev) => ({ ...prev, [field]: false }));
            setForm((prev) => {
                if (prev.category === "vehicle") {
                    return {
                        ...prev,
                        specifications: {
                            ...(prev.specifications as VehicleSpecifications),
                            [field]: value,
                        } as VehicleSpecifications,
                    };
                } else if (prev.category === "battery") {
                    return {
                        ...prev,
                        specifications: {
                            ...(prev.specifications as BatterySpecifications),
                            [field]: value,
                        } as BatterySpecifications,
                    };
                }
                return prev;
            });
        }
    };

    // Don't render if category is not set
    if (!form.category) {
        return null;
    }

    return (
        <section className="space-y-3">
            <div className="font-semibold text-lg">
                Thông số kỹ thuật {isVehicle ? "xe điện" : "pin"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {specConfig.keys.map((key) => {
                    const fieldKey = key as string;
                    const options = (specConfig.options as Record<string, string[]>)[key as string];
                    const isCustom = customFields[fieldKey];
                    const fieldValue = isVehicle
                        ? (form.specifications as VehicleSpecifications)[fieldKey as keyof VehicleSpecifications] || ""
                        : (form.specifications as BatterySpecifications)[fieldKey as keyof BatterySpecifications] || "";

                    return (
                        <div key={fieldKey}>
                            <Label>{specConfig.labels[key as keyof typeof specConfig.labels]}</Label>
                            {options && !isCustom ? (
                                <Select
                                    value={fieldValue}
                                    onValueChange={(val) => handleSelectChange(fieldKey, val)}
                                >
                                    <SelectTrigger className="w-full rounded-lg bg-gray-50 border-gray-200 h-10 px-3">
                                        <SelectValue placeholder={`Chọn ${specConfig.labels[key as keyof typeof specConfig.labels]}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map((opt: string) => (
                                            <SelectItem key={opt} value={opt}>
                                                {opt} {specConfig.units[key]}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="Khác">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="relative">
                                    <Input
                                        value={fieldValue}
                                        onChange={(e) => handleSpecChange(fieldKey, e.target.value)}
                                        placeholder={specConfig.labels[key as keyof typeof specConfig.labels]}
                                        className="pr-14 rounded-lg bg-gray-50 border-gray-200"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                        {specConfig.units[key as keyof typeof specConfig.units]}
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
