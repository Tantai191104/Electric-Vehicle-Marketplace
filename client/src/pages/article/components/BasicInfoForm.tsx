import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { BatteryFormData } from "@/types/productType";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatVND } from "@/utils/formatVND";

interface Props {
    form: BatteryFormData;
    setForm: React.Dispatch<React.SetStateAction<BatteryFormData>>;
}

const BRAND_MODELS: Record<string, string[]> = {
    Yadea: ["Model Y1", "Model Y2", "Model Y3"],
    VinFast: ["Klara", "Theon", "Impuls"],
    Xiaomi: ["M365", "M365 Pro", "Pro 2"],
    Honda: ["PCX Electric", "Benly e", "EV-neo"],
    Kymco: ["iONEX", "Like EV", "SuperNEX"],
};

const BasicInfoForm: React.FC<Props> = ({ form, setForm }) => {
    const [modelOptions, setModelOptions] = useState<string[]>([]);
    const [customBrand, setCustomBrand] = useState(false);
    const [customModel, setCustomModel] = useState(false);

    const handleChange = <K extends keyof BatteryFormData>(field: K, value: BatteryFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleBrandChange = (brand: string) => {
        if (brand === "Khác") {
            setCustomBrand(true);
            setForm((prev) => ({ ...prev, brand: "" }));
            setModelOptions([]);
            setCustomModel(true);
            setForm((prev) => ({ ...prev, model: "" }));
        } else {
            setCustomBrand(false);
            setForm((prev) => ({ ...prev, brand, model: "" }));
            setModelOptions(BRAND_MODELS[brand] || []);
            setCustomModel(false);
        }
    };

    const handleModelChange = (model: string) => {
        if (model === "Khác") {
            setCustomModel(true);
            setForm((prev) => ({ ...prev, model: "" }));
        } else {
            setCustomModel(false);
            setForm((prev) => ({ ...prev, model }));
        }
    };
    const inputClass = "w-full rounded-lg bg-gray-50 border border-gray-200 h-10 px-3";
    return (
        <section className="space-y-6 bg-white/90 p-6">
            <div className="font-bold text-xl text-gray-900 mb-2 text-center">Thông tin cơ bản</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label className="font-medium text-gray-700 mb-1 block">Tiêu đề</Label>
                    <Input
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="Pin Lithium-ion 48V 20Ah ..."
                        className="rounded-lg bg-gray-50 border-gray-200"
                    />
                </div>

                <div>
                    <Label className="font-medium text-gray-700 mb-1 block">Thương hiệu</Label>
                    {!customBrand ? (
                        <Select value={form.brand} onValueChange={handleBrandChange}>
                            <SelectTrigger className={inputClass}>
                                <SelectValue placeholder="Chọn thương hiệu" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(BRAND_MODELS).map((b) => (
                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                                <SelectItem value="Khác">Khác</SelectItem>
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

                <div>
                    <Label className="font-medium text-gray-700 mb-1 block">Model</Label>
                    {!customModel ? (
                        <Select value={form.model} onValueChange={handleModelChange} disabled={!form.brand && !customBrand}>
                            <SelectTrigger className={inputClass}>
                                <SelectValue placeholder="Chọn model" />
                            </SelectTrigger>
                            <SelectContent>
                                {modelOptions.map((m) => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                                <SelectItem value="Khác">Khác</SelectItem>
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

                <div>
                    <Label className="font-medium text-gray-700 mb-1 block">Năm sản xuất</Label>
                    <Select
                        value={form.year.toString()}
                        onValueChange={(val) => handleChange("year", Number(val))}
                    >
                        <SelectTrigger className="w-full rounded-xl bg-white border border-gray-300 h-12 px-4 shadow-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none transition">
                            <SelectValue placeholder="Chọn năm" />
                        </SelectTrigger>
                        <SelectContent className="bg-white rounded-xl shadow-lg border border-gray-200">
                            {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => 2000 + i).map((year) => (
                                <SelectItem
                                    key={year}
                                    value={year.toString()}
                                    className="hover:bg-blue-50 rounded-lg px-3 py-2 transition"
                                >
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-2">
                    <Label className="font-medium text-gray-700 mb-1 block">Mô tả</Label>
                    <Textarea
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Nhập mô tả sản phẩm"
                        rows={4}
                        className="rounded-lg bg-gray-50 border-gray-200"
                    />
                </div>

                <div className="md:col-span-2">
                    <Label className="font-medium text-gray-700 mb-1 block">Giá (VNĐ)</Label>
                    <Input
                        type="text" // phải là text để hiển thị định dạng
                        value={form.price ? formatVND(form.price).replace(" VNĐ", "") : ""}
                        onChange={(e) => handleChange("price", Number(e.target.value.replace(/\./g, "")))}
                        placeholder="Nhập giá sản phẩm"
                        className="rounded-lg bg-gray-50 border-gray-200"
                    />
                </div>
            </div>
        </section>
    );
};

export default BasicInfoForm;
