import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { VehicleFormData, BatteryFormData } from "@/types/productType";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { Car, BatteryCharging, Sparkles, DollarSign, TrendingUp, Lightbulb, AlertCircle, ArrowDownCircle, Star, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    form: VehicleFormData | BatteryFormData;
    setForm: React.Dispatch<React.SetStateAction<VehicleFormData | BatteryFormData | null>>;
    onGetPriceSuggestion?: () => void;
    isLoadingPrice?: boolean;
    suggestedPrice?: number | null;
    priceAnalysis?: {
        priceRange?: { low: number; recommended: number; high: number };
        reasoning?: { low: string; recommended: string; high: string };
        marketAnalysis?: string;
        factors?: string[];
        tips?: string[];
        warnings?: string[];
    } | null;
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

const BasicInfoForm: React.FC<Props> = ({ form, setForm, onGetPriceSuggestion, isLoadingPrice, suggestedPrice, priceAnalysis }) => {
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
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                value={form.price ? formatNumberWithDots(form.price) : ""}
                                onChange={(e) => handleChange("price", Number(e.target.value.replace(/\./g, "")))}
                                placeholder="Nhập giá sản phẩm"
                                className={`${inputClass} pl-14`}
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                VNĐ
                            </div>
                        </div>
                        {onGetPriceSuggestion && (
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onGetPriceSuggestion?.();
                                }}
                                disabled={isLoadingPrice}
                                className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500
             hover:from-purple-600 hover:to-pink-600 text-white
             rounded-xl shadow-lg hover:shadow-xl transition-all duration-200
             flex items-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                {isLoadingPrice ? "Đang phân tích..." : "Gợi ý giá AI"}
                            </Button>
                        )}
                    </div>
                    {suggestedPrice && priceAnalysis && (
                        <div className="mt-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 shadow-lg">
                            {/* Header với giá khuyến nghị chính */}
                            <div className="flex flex-col gap-4 mb-6 pb-6 border-b-2 border-purple-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Gợi ý giá từ AI</h3>
                                </div>
                            </div>

                            {/* 3 mức giá theo chiều ngang */}
                            {priceAnalysis.priceRange && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <DollarSign className="w-5 h-5 text-gray-700" />
                                        <h4 className="text-base font-bold text-gray-800">Chọn mức giá phù hợp</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                        {(["low", "recommended", "high"] as const).map((k) => {
                                            const configs = {
                                                low: { label: "Giá thấp", desc: "Bán nhanh" },
                                                recommended: { label: "Khuyến nghị", desc: "Cân bằng tốt nhất" },
                                                high: { label: "Giá cao", desc: "Lợi nhuận cao" }
                                            };
                                            const config = configs[k];
                                            const value = (priceAnalysis.priceRange as { low: number; recommended: number; high: number })[k as keyof typeof priceAnalysis.priceRange];
                                            const isSelected = form.price === value;

                                            // Styles based on selection and type
                                            let cardClasses = "border-2 rounded-xl p-4 transition-all cursor-pointer ";
                                            let badgeClasses = "inline-block px-3 py-1 rounded-lg text-xs font-semibold mb-2 ";
                                            let buttonClasses = "w-full py-2.5 font-semibold rounded-lg transition-all text-sm ";

                                            if (isSelected) {
                                                // Selected state - highlight with bright colors
                                                if (k === "low") {
                                                    cardClasses += "bg-green-100 border-green-500 shadow-lg ring-2 ring-green-300";
                                                    badgeClasses += "bg-green-600 text-white";
                                                    buttonClasses += "bg-green-600 text-white shadow-md";
                                                } else if (k === "recommended") {
                                                    cardClasses += "bg-purple-100 border-purple-500 shadow-lg ring-2 ring-purple-300";
                                                    badgeClasses += "bg-purple-600 text-white";
                                                    buttonClasses += "bg-purple-600 text-white shadow-md";
                                                } else {
                                                    cardClasses += "bg-orange-100 border-orange-500 shadow-lg ring-2 ring-orange-300";
                                                    badgeClasses += "bg-orange-600 text-white";
                                                    buttonClasses += "bg-orange-600 text-white shadow-md";
                                                }
                                            } else {
                                                // Unselected state - subtle colors
                                                if (k === "low") {
                                                    cardClasses += "bg-white border-green-200 hover:border-green-400 hover:shadow-md";
                                                    badgeClasses += "bg-green-50 text-green-700";
                                                    buttonClasses += "bg-white border-2 border-green-300 text-green-700 hover:bg-green-50";
                                                } else if (k === "recommended") {
                                                    cardClasses += "bg-white border-purple-200 hover:border-purple-400 hover:shadow-md";
                                                    badgeClasses += "bg-purple-50 text-purple-700";
                                                    buttonClasses += "bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50";
                                                } else {
                                                    cardClasses += "bg-white border-orange-200 hover:border-orange-400 hover:shadow-md";
                                                    badgeClasses += "bg-orange-50 text-orange-700";
                                                    buttonClasses += "bg-white border-2 border-orange-300 text-orange-700 hover:bg-orange-50";
                                                }
                                            }

                                            return (
                                                <div
                                                    key={k}
                                                    className={cardClasses}
                                                    onClick={() => handleChange("price", value)}
                                                >
                                                    <div className="text-center">
                                                        <span className={badgeClasses}>
                                                            {config.label}
                                                        </span>
                                                        <div className={`text-2xl font-black mb-2 ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                                            {formatNumberWithDots(value)} ₫
                                                        </div>
                                                        <div className="text-xs text-gray-600 mb-4">{config.desc}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleChange("price", value);
                                                        }}
                                                        className={buttonClasses}
                                                    >
                                                        {isSelected ? "✓ Đã chọn" : "Chọn giá này"}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Lý do gợi ý giá */}
                                    {priceAnalysis.reasoning && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                                            <h5 className="text-sm font-bold text-gray-800 mb-3">
                                                Vì sao gợi ý các mức giá này?
                                            </h5>
                                            <div className="space-y-3">
                                                {(["low", "recommended", "high"] as const).map((k) => {
                                                    const configs = {
                                                        low: { label: "Giá thấp", icon: <ArrowDownCircle className="text-green-500 w-4 h-4" /> },
                                                        recommended: { label: "Khuyến nghị", icon: <Star className="text-yellow-500 w-4 h-4" /> },
                                                        high: { label: "Giá cao", icon: <ArrowUpCircle className="text-blue-500 w-4 h-4" /> },
                                                    };
                                                    const config = configs[k];
                                                    const reason = priceAnalysis.reasoning![k as keyof typeof priceAnalysis.reasoning];
                                                    const value = (priceAnalysis.priceRange as { low: number; recommended: number; high: number })[k];

                                                    return (
                                                        <div key={k} className="flex gap-3 pb-3 border-b last:border-b-0 border-gray-100">
                                                            <div className="flex items-center justify-center">{config.icon}</div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-sm font-semibold text-gray-700">{config.label}</span>
                                                                    <span className="text-sm font-bold text-gray-900">{formatNumberWithDots(value)} ₫</span>
                                                                </div>
                                                                <p className="text-xs text-gray-600 leading-relaxed">{reason}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Phân tích chi tiết theo chiều dọc */}
                            <div className="space-y-3">
                                {priceAnalysis.marketAnalysis && (
                                    <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                            <h4 className="text-base font-bold text-blue-700">Phân tích thị trường</h4>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">{priceAnalysis.marketAnalysis}</p>
                                    </div>
                                )}

                                {priceAnalysis.tips && priceAnalysis.tips.length > 0 && (
                                    <div className="p-4 bg-white rounded-xl border border-green-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Lightbulb className="w-5 h-5 text-green-600" />
                                            <h4 className="text-base font-bold text-green-700">Mẹo bán nhanh</h4>
                                        </div>
                                        <ul className="space-y-2">
                                            {priceAnalysis.tips.map((t, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="text-green-500 mt-0.5 font-bold">✓</span>
                                                    <span>{t}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {priceAnalysis.warnings && priceAnalysis.warnings.length > 0 && (
                                    <div className="p-4 bg-white rounded-xl border border-orange-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertCircle className="w-5 h-5 text-orange-600" />
                                            <h4 className="text-base font-bold text-orange-600">Lưu ý quan trọng</h4>
                                        </div>
                                        <ul className="space-y-2">
                                            {priceAnalysis.warnings.map((w, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="text-orange-500 mt-0.5 font-bold">!</span>
                                                    <span>{w}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BasicInfoForm;
