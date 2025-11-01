import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { VehicleFormData, BatteryFormData } from "@/types/productType";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { Car, BatteryCharging } from "lucide-react";

interface Props {
    form: VehicleFormData | BatteryFormData;
    setForm: React.Dispatch<React.SetStateAction<VehicleFormData | BatteryFormData | null>>;
}

// Brand và model cho xe điện
const VEHICLE_BRAND_MODELS: Record<string, string[]> = {
    VinFast: ["VF 5 Plus", "VF 6", "VF 7", "VF 8", "VF 9", "Klara", "Theon", "Impuls"],
    Tesla: ["Model S", "Model 3", "Model X", "Model Y"],
    Honda: ["PCX Electric", "Benly e", "EV-neo"],
    Yamaha: ["E-Vino", "Neo's", "E01"],
    Pega: ["CapA", "Xmen", "Zico"],
    Yadea: ["Xmen GT", "Like", "Odora"],
    Xiaomi: ["M365", "Mi Electric Scooter Pro 2"],
};

// Brand và model cho pin
const BATTERY_BRAND_MODELS: Record<string, string[]> = {
    Panasonic: ["NCR18650B", "NCR21700A", "NCR18650GA"],
    Samsung: ["INR18650-25R", "INR21700-30T", "INR18650-35E"],
    LG: ["INR18650HG2", "INR21700M50", "INR18650MJ1"],
    CATL: ["LiFePO4 3.2V", "NCM 3.7V", "LTO 2.4V"],
    BYD: ["Blade Battery", "LFP Battery", "NCM Battery"],
    EVE: ["LF280K", "LF230", "LF105"],
    Gotion: ["LiFePO4", "NCM", "NCA"],
};

const BasicInfoForm: React.FC<Props> = ({ form, setForm }) => {
    const [modelOptions, setModelOptions] = useState<string[]>([]);
    const [customBrand, setCustomBrand] = useState(false);
    const [customModel, setCustomModel] = useState(false);

    // Đảm bảo với vehicle thì luôn có length, width, height, weight = 1
    React.useEffect(() => {
        if (form.category === "vehicle") {
            setForm((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    length: 1,
                    width: 1,
                    height: 1,
                    weight: 1,
                };
            });
        }
    }, [form.category, setForm]);

    // Lấy brand/model phù hợp theo category
    const getBrandModels = () => {
        return form.category === "vehicle" ? VEHICLE_BRAND_MODELS : BATTERY_BRAND_MODELS;
    };

    const handleChange = (field: string, value: string | number) => {
        setForm((prev) => {
            if (!prev) return prev;
            return { ...prev, [field]: value };
        });
    };

    const handleOptionalChange = (field: string, value: number | undefined) => {
        setForm((prev) => {
            if (!prev) return prev;
            // Nếu là vehicle thì luôn set = 1
            if (prev.category === "vehicle") {
                return { ...prev, [field]: 1 };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleBrandChange = (brand: string) => {
        const brandModels = getBrandModels();

        if (brand === "Khác") {
            setCustomBrand(true);
            setForm((prev) => {
                if (!prev) return prev;
                return { ...prev, brand: "" };
            });
            setModelOptions([]);
            setCustomModel(true);
            setForm((prev) => {
                if (!prev) return prev;
                return { ...prev, model: "" };
            });
        } else {
            setCustomBrand(false);
            setForm((prev) => {
                if (!prev) return prev;
                return { ...prev, brand, model: "" };
            });
            setModelOptions(brandModels[brand] || []);
            setCustomModel(false);
        }
    };

    const handleModelChange = (model: string) => {
        if (model === "Khác") {
            setCustomModel(true);
            setForm((prev) => {
                if (!prev) return prev;
                return { ...prev, model: "" };
            });
        } else {
            setCustomModel(false);
            setForm((prev) => {
                if (!prev) return prev;
                return { ...prev, model };
            });
        }
    };
    const inputClass = "w-full rounded-xl bg-white border border-gray-200 h-12 px-4 shadow-sm hover:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:border-yellow-500 transition duration-200";

    return (
        <section className="bg-white rounded-2xl p-8 shadow-lg border border-yellow-200">
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                        {form.category === "vehicle" ? (
                            <Car className="w-6 h-6 text-white" />
                        ) : (
                            <BatteryCharging className="w-6 h-6 text-white" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        Thông tin cơ bản
                    </h2>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Tiêu đề</Label>
                    <Input
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder={form.category === "vehicle"
                            ? "VinFast VF8 2023 - Xe điện cao cấp..."
                            : "Pin Lithium-ion 48V 20Ah - Dung lượng cao..."
                        }
                        className={inputClass}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Thương hiệu</Label>
                    {!customBrand ? (
                        <Select value={form.brand} onValueChange={handleBrandChange}>
                            <SelectTrigger className={inputClass}>
                                <SelectValue placeholder="Chọn thương hiệu" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
                                {Object.keys(getBrandModels()).map((b) => (
                                    <SelectItem key={b} value={b} className="rounded-lg hover:bg-yellow-50">{b}</SelectItem>
                                ))}
                                <SelectItem value="Khác" className="rounded-lg hover:bg-yellow-50">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            value={form.brand}
                            onChange={(e) => handleChange("brand", e.target.value)}
                            placeholder="Nhập thương hiệu"
                            className={inputClass}
                        />
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">Model</Label>
                    {!customModel ? (
                        <Select value={form.model} onValueChange={handleModelChange} disabled={!form.brand && !customBrand}>
                            <SelectTrigger className={`${inputClass} ${(!form.brand && !customBrand) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <SelectValue placeholder="Chọn model" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
                                {modelOptions.map((m) => (
                                    <SelectItem key={m} value={m} className="rounded-lg hover:bg-yellow-50">{m}</SelectItem>
                                ))}
                                <SelectItem value="Khác" className="rounded-lg hover:bg-yellow-50">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            value={form.model}
                            onChange={(e) => handleChange("model", e.target.value)}
                            placeholder="Nhập model"
                            className={inputClass}
                        />
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">Năm sản xuất</Label>
                    <Select
                        value={form.year.toString()}
                        onValueChange={(val) => handleChange("year", Number(val))}
                    >
                        <SelectTrigger className={inputClass}>
                            <SelectValue placeholder="Chọn năm" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-gray-200 shadow-lg max-h-60">
                            {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => 2000 + i)
                                .reverse()
                                .map((year) => (
                                    <SelectItem
                                        key={year}
                                        value={year.toString()}
                                        className="rounded-lg hover:bg-blue-50 transition"
                                    >
                                        {year}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">Tình trạng</Label>
                    <Select
                        value={form.condition || ""}
                        onValueChange={(val) => handleChange("condition", val)}
                    >
                        <SelectTrigger className={inputClass}>
                            <SelectValue placeholder="Chọn tình trạng" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
                            <SelectItem value="used" className="rounded-lg hover:bg-yellow-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-700 rounded-full"></div>
                                    Đã sử dụng
                                </div>
                            </SelectItem>
                            <SelectItem value="refurbished" className="rounded-lg hover:bg-yellow-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-800 rounded-full"></div>
                                    Tân trang
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">Mô tả</Label>
                    <Textarea
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder={form.category === "vehicle"
                            ? "Mô tả chi tiết về xe điện: tình trạng, tính năng nổi bật, lịch sử sử dụng..."
                            : "Mô tả chi tiết về pin: tình trạng, số chu kỳ sạc đã qua, bảo hành..."
                        }
                        rows={4}
                        className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 resize-none"
                    />
                </div>

                {/* Thông số kích thước */}
                {form.category !== "vehicle" && (
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Kích thước & Trọng lượng
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-800">Dài (cm)</Label>
                                <Input
                                    type="number"
                                    value={form.length || ""}
                                    onChange={(e) => handleOptionalChange("length", e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="180"
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-800">Rộng (cm)</Label>
                                <Input
                                    type="number"
                                    value={form.width || ""}
                                    onChange={(e) => handleOptionalChange("width", e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="80"
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-800">Cao (cm)</Label>
                                <Input
                                    type="number"
                                    value={form.height || ""}
                                    onChange={(e) => handleOptionalChange("height", e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="120"
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-800">Cân nặng (kg)</Label>
                                <Input
                                    type="number"
                                    value={form.weight || ""}
                                    onChange={(e) => handleOptionalChange("weight", e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="45"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-semibold text-gray-800">Giá (VNĐ)</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            value={form.price ? formatNumberWithDots(form.price) : ""}
                            onChange={(e) => handleChange("price", Number(e.target.value.replace(/\./g, "")))}
                            placeholder="Nhập giá sản phẩm"
                            className={`${inputClass} pl-12`}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            VNĐ
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BasicInfoForm;
