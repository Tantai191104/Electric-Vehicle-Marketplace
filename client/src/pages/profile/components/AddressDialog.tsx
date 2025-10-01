import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { userServices } from "@/services/userServices";
import type { District, Province, Ward } from "@/types/addressType";
import { toast } from "sonner";

type AddressForm = {
    province: string;
    provinceName?: string;
    district: string;
    districtName?: string;
    ward: string;
    wardName?: string;
    street: string;
};

type AddressDialogProps = {
    onSubmit: (data: AddressForm) => void;
    onClose: () => void;
};

const AddressDialog: React.FC<AddressDialogProps> = ({ onSubmit, onClose }) => {
    const form = useForm<AddressForm>({
        defaultValues: {
            province: "",
            district: "",
            ward: "",
            street: "",
        },
    });

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await userServices.fetchProvince();
                setProvinces(res);
            } catch (err) {
                console.error("Lỗi fetch provinces:", err);
            }
        };
        fetchProvinces();
    }, []);

    const handleProvinceChange = async (provinceId: string) => {
        form.setValue("province", provinceId);
        form.setValue("district", "");
        form.setValue("ward", "");
        setDistricts([]);
        setWards([]);
        try {
            const res = await userServices.fetchDistrict(provinceId);
            setDistricts(res);
        } catch (err) {
            console.error("Lỗi fetch districts:", err);
        }
    };

    const handleDistrictChange = async (districtId: string) => {
        form.setValue("district", districtId);
        form.setValue("ward", "");
        setWards([]);
        try {
            const res = await userServices.fetchWard(districtId);
            setWards(res);
        } catch (err) {
            console.error("Lỗi fetch wards:", err);
        }
    };

    // Lấy tên từ id
    const getProvinceName = (id: string) =>
        provinces.find((p) => String(p.ProvinceID) === id)?.ProvinceName || "";
    const getDistrictName = (id: string) =>
        districts.find((d) => String(d.DistrictID) === id)?.DistrictName || "";
    const getWardName = (id: string) =>
        wards.find((w) => String(w.WardCode) === id)?.WardName || "";

    const handleSave = () => {
        const data = form.getValues();
        onSubmit({
            ...data,
            provinceName: getProvinceName(data.province),
            districtName: getDistrictName(data.district),
            wardName: getWardName(data.ward),
        });
        toast.success("Địa chỉ đã được cập nhật");
        onClose();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
            <div className="md:col-span-2 mb-2">
                <div className="text-xl font-bold text-gray-900 mb-1">
                    Cập nhật địa chỉ
                </div>
                <div className="text-base text-gray-600">
                    Vui lòng chọn tỉnh/thành, quận/huyện, phường/xã và nhập số nhà, đường.
                </div>
            </div>

            {/* Province */}
            <div>
                <label className="block font-semibold text-gray-800 mb-2">
                    Tỉnh / Thành phố
                </label>
                <Select
                    onValueChange={handleProvinceChange}
                    value={form.watch("province")}
                >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 rounded-lg">
                        <SelectValue placeholder="Chọn tỉnh / thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                        {provinces.map((p) => (
                            <SelectItem key={p.ProvinceID} value={String(p.ProvinceID)}>
                                {p.ProvinceName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* District */}
            <div>
                <label className="block font-semibold text-gray-800 mb-2">
                    Quận / Huyện
                </label>
                <Select
                    onValueChange={handleDistrictChange}
                    value={form.watch("district")}
                    disabled={!form.watch("province")}
                >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 rounded-lg">
                        <SelectValue placeholder="Chọn quận / huyện" />
                    </SelectTrigger>
                    <SelectContent>
                        {districts.map((d) => (
                            <SelectItem key={d.DistrictID} value={String(d.DistrictID)}>
                                {d.DistrictName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Ward */}
            <div>
                <label className="block font-semibold text-gray-800 mb-2">
                    Phường / Xã
                </label>
                <Select
                    onValueChange={(val) => form.setValue("ward", val)}
                    value={form.watch("ward")}
                    disabled={!form.watch("district")}
                >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 rounded-lg">
                        <SelectValue placeholder="Chọn phường / xã" />
                    </SelectTrigger>
                    <SelectContent>
                        {wards.map((w) => (
                            <SelectItem key={w.WardCode} value={String(w.WardCode)}>
                                {w.WardName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Street */}
            <div>
                <label className="block font-semibold text-gray-800 mb-2">
                    Số nhà, đường
                </label>
                <Input
                    {...form.register("street")}
                    placeholder="Ví dụ: 123 Nguyễn Trãi"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg"
                />
            </div>

            {/* Submit */}
            <div className="col-span-full flex justify-end mt-2 gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="text-gray-700 border-gray-300"
                    onClick={onClose}
                >
                    Hủy
                </Button>
                <Button
                    type="button"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-6 py-2 rounded-lg shadow"
                    onClick={handleSave}
                >
                    Lưu địa chỉ
                </Button>
            </div>
        </div>
    );
};

export default AddressDialog;
