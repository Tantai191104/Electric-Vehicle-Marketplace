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
    street: string;
    province: string;
    district: string;
    ward: string;
    provinceName?: string;
    districtName?: string;
    wardName?: string;
};

type AddressDialogProps = {
    onSubmit: (data: AddressForm) => void;
    onClose: () => void;
    initialData?: {
        street: string;
        province: string;
        district: string;
        ward: string;
        provinceName?: string;
        districtName?: string;
        wardName?: string;
    };
};

const AddressDialog: React.FC<AddressDialogProps> = ({
    onSubmit,
    onClose,
    initialData
}) => {
    const form = useForm<AddressForm>({
        defaultValues: {
            province: initialData?.province || "",
            district: initialData?.district || "",
            ward: initialData?.ward || "",
            street: initialData?.street || "",
        },
    });

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setIsLoading(true);
                const res = await userServices.fetchProvince();
                setProvinces(res);
            } catch (err) {
                console.error("Lỗi fetch provinces:", err);
                toast.error("Không thể tải danh sách tỉnh/thành phố");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProvinces();
    }, []);

    // Load initial districts and wards if initialData exists
    useEffect(() => {
        const loadInitialData = async () => {
            if (initialData?.province && provinces.length > 0) {
                try {
                    // Load districts for initial province
                    const districtsRes = await userServices.fetchDistrict(initialData.province);
                    setDistricts(districtsRes);

                    // Load wards for initial district
                    if (initialData.district) {
                        const wardsRes = await userServices.fetchWard(initialData.district);
                        setWards(wardsRes);
                    }
                } catch (err) {
                    console.error("Lỗi load initial data:", err);
                }
            }
        };

        loadInitialData();
    }, [initialData, provinces]);

    const handleProvinceChange = async (provinceId: string) => {
        form.setValue("province", provinceId);
        form.setValue("district", "");
        form.setValue("ward", "");
        setDistricts([]);
        setWards([]);

        try {
            setIsLoading(true);
            const res = await userServices.fetchDistrict(provinceId);
            setDistricts(res);
        } catch (err) {
            console.error("Lỗi fetch districts:", err);
            toast.error("Không thể tải danh sách quận/huyện");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDistrictChange = async (districtId: string) => {
        form.setValue("district", districtId);
        form.setValue("ward", "");
        setWards([]);

        try {
            setIsLoading(true);
            const res = await userServices.fetchWard(districtId);
            setWards(res);
        } catch (err) {
            console.error("Lỗi fetch wards:", err);
            toast.error("Không thể tải danh sách phường/xã");
        } finally {
            setIsLoading(false);
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

        // Validate required fields
        if (!data.province || !data.district || !data.ward || !data.street.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
            return;
        }

        onSubmit({
            ...data,
            street: data.street.trim(),
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
                    Tỉnh / Thành phố *
                </label>
                <Select
                    onValueChange={handleProvinceChange}
                    value={form.watch("province")}
                    disabled={isLoading || provinces.length === 0}
                >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 rounded-lg">
                        <SelectValue placeholder={
                            isLoading ? "Đang tải..." : "Chọn tỉnh / thành phố"
                        } />
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
                    Quận / Huyện *
                </label>
                <Select
                    onValueChange={handleDistrictChange}
                    value={form.watch("district")}
                    disabled={!form.watch("province") || isLoading}
                >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 rounded-lg">
                        <SelectValue placeholder={
                            !form.watch("province")
                                ? "Chọn tỉnh/thành phố trước"
                                : isLoading
                                    ? "Đang tải..."
                                    : "Chọn quận / huyện"
                        } />
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
                    Phường / Xã *
                </label>
                <Select
                    onValueChange={(val) => form.setValue("ward", val)}
                    value={form.watch("ward")}
                    disabled={!form.watch("district") || isLoading}
                >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 rounded-lg">
                        <SelectValue placeholder={
                            !form.watch("district")
                                ? "Chọn quận/huyện trước"
                                : isLoading
                                    ? "Đang tải..."
                                    : "Chọn phường / xã"
                        } />
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
                    Số nhà, đường *
                </label>
                <Input
                    {...form.register("street", {
                        required: "Số nhà, đường không được để trống",
                        minLength: {
                            value: 2,
                            message: "Số nhà, đường phải có ít nhất 2 ký tự"
                        }
                    })}
                    placeholder="Ví dụ: 123 Nguyễn Trãi"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg"
                />
                {form.formState.errors.street && (
                    <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.street.message}
                    </p>
                )}
            </div>

            {/* Current address preview */}
            {form.watch("street") && form.watch("ward") && (
                <div className="md:col-span-2 mt-2">
                    <label className="block font-semibold text-gray-800 mb-2">
                        Xem trước địa chỉ:
                    </label>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        {`${form.watch("street")}, ${getWardName(form.watch("ward"))}, ${getDistrictName(form.watch("district"))}, ${getProvinceName(form.watch("province"))}`}
                    </div>
                </div>
            )}

            {/* Submit */}
            <div className="col-span-full flex justify-end mt-4 gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="text-gray-700 border-gray-300 px-6"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Hủy
                </Button>
                <Button
                    type="button"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-6 py-2 rounded-lg shadow"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang lưu...
                        </div>
                    ) : (
                        "Lưu địa chỉ"
                    )}
                </Button>
            </div>
        </div>
    );
};

export default AddressDialog;
