// components/ProfileFormCard.tsx
import React, { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CardFormRow from "./CardFormRow";
import { useAuthStore } from "@/store/auth";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddressDialog from "./AddressDialog";
import { userServices } from "@/services/userServices";
import { toast } from "sonner";
import type { User } from "@/types/authType";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type AddressInfo = {
  houseNumber: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  provinceName: string;
  districtName: string;
  wardName: string;
};

const ProfileFormCard: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    houseNumber: "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    provinceName: "",
    districtName: "",
    wardName: "",
  });

  const form = useForm<ProfileForm>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  // Initialize form data from user store
  useEffect(() => {
    if (user) {
      const addressStr = user.profile?.address
        ? `${user.profile.address.houseNumber || ""}, ${user.profile.address.ward || ""}, ${user.profile.address.district || ""}, ${user.profile.address.province || ""}`.replace(/^,+|,+$/g, '').replace(/,+/g, ', ')
        : "";

      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: addressStr,
      });

      // Initialize address info
      if (user.profile?.address) {
        setAddressInfo({
          houseNumber: user.profile.address.houseNumber || "",
          provinceCode: user.profile.address.provinceCode || "",
          districtCode: user.profile.address.districtCode || "",
          wardCode: user.profile.address.wardCode || "",
          provinceName: user.profile.address.province || "",
          districtName: user.profile.address.district || "",
          wardName: user.profile.address.ward || "",
        });
      }
    }
  }, [user, form]);

  const handleSubmit: SubmitHandler<ProfileForm> = async (data) => {
    if (!user) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare update data for LocationsPayload
      const updateData = {
        houseNumber: addressInfo.houseNumber,
        provinceCode: addressInfo.provinceCode,
        districtCode: addressInfo.districtCode,
        wardCode: addressInfo.wardCode,
      };
      // Call API to update profile location
      const response = await userServices.updateProfile(updateData);

      console.log("Update response:", response);

      // Create updated user object for store
      const updatedUser: User = {
        ...user,
        name: data.name.trim(),
        phone: data.phone.trim(),
        profile: {
          ...user.profile,
          address: {
            houseNumber: addressInfo.houseNumber,
            provinceCode: addressInfo.provinceCode,
            districtCode: addressInfo.districtCode,
            wardCode: addressInfo.wardCode,
            province: addressInfo.provinceName,
            district: addressInfo.districtName,
            ward: addressInfo.wardName,
          },
        },
        updatedAt: new Date().toISOString(),
      };

      // Update user in store
      updateUser(updatedUser);

      // Update form display value
      const newAddressStr = `${addressInfo.houseNumber}, ${addressInfo.wardName}, ${addressInfo.districtName}, ${addressInfo.provinceName}`
        .replace(/^,+|,+$/g, '')
        .replace(/,+/g, ', ');

      form.setValue("address", newAddressStr);

      toast.success("Cập nhật thông tin thành công!", {
        description: "Thông tin cá nhân đã được cập nhật",
      });

    } catch (err) {
      console.error("Update profile error:", err);

      let errorMessage = "Cập nhật thất bại";
      let errorDescription = "Vui lòng thử lại sau";

      if (err instanceof Error) {
        errorMessage = err.message;

        // Handle specific error cases
        if (err.message.includes("network") || err.message.includes("fetch")) {
          errorDescription = "Lỗi kết nối mạng";
        } else if (err.message.includes("validation")) {
          errorDescription = "Dữ liệu không hợp lệ";
        } else if (err.message.includes("unauthorized")) {
          errorDescription = "Phiên đăng nhập hết hạn";
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = (data: {
    street: string;
    province: string;
    district: string;
    ward: string;
    provinceName?: string;
    districtName?: string;
    wardName?: string;
  }) => {
    try {
      // Update address info state
      const newAddressInfo = {
        houseNumber: data.street,
        provinceCode: data.province,
        districtCode: data.district,
        wardCode: data.ward,
        provinceName: data.provinceName || "",
        districtName: data.districtName || "",
        wardName: data.wardName || "",
      };

      setAddressInfo(newAddressInfo);

      // Update form display value
      const addressStr = `${data.street}, ${data.wardName}, ${data.districtName}, ${data.provinceName}`
        .replace(/^,+|,+$/g, '')
        .replace(/,+/g, ', ');

      form.setValue("address", addressStr);

      // Close modal
      setOpenAddressModal(false);

      toast.info("Địa chỉ đã được cập nhật", {
        description: "Nhấn 'Lưu thay đổi' để hoàn tất",
      });

    } catch (error) {
      console.error("Address update error:", error);
      toast.error("Cập nhật địa chỉ thất bại");
    }
  };

  return (
    <Card className="shadow-md rounded-xl bg-white">
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
      </CardHeader>
      <CardContent className="mt-2">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Tên và SĐT */}
          <div className="flex flex-col md:flex-row gap-4">
            <CardFormRow
              label="Tên"
              error={form.formState.errors.name?.message}
              className="flex-1"
            >
              <Input
                {...form.register("name", {
                  required: "Tên không được để trống",
                  minLength: {
                    value: 2,
                    message: "Tên phải có ít nhất 2 ký tự"
                  }
                })}
                placeholder="Nhập tên của bạn"
                disabled={isLoading}
              />
            </CardFormRow>

            <CardFormRow
              label="Số điện thoại"
              error={form.formState.errors.phone?.message}
              className="flex-1"
            >
              <Input
                {...form.register("phone", {
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ"
                  }
                })}
                placeholder="Nhập số điện thoại"
                disabled={isLoading}
              />
            </CardFormRow>
          </div>

          <CardFormRow label="Email" error={form.formState.errors.email?.message}>
            <Input
              readOnly
              type="email"
              {...form.register("email")}
              className="bg-gray-50"
              title="Email không thể thay đổi"
            />
          </CardFormRow>

          <CardFormRow
            label={
              <div className="flex items-center gap-2">
                Địa chỉ
                <Dialog open={openAddressModal} onOpenChange={setOpenAddressModal}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-yellow-700 border-yellow-300 hover:bg-yellow-50 px-2 py-1 text-xs font-semibold"
                      disabled={isLoading}
                    >
                      Cập nhật địa chỉ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <AddressDialog
                      onSubmit={handleAddressSubmit}
                      onClose={() => setOpenAddressModal(false)}
                      initialData={{
                        street: addressInfo.houseNumber,
                        province: addressInfo.provinceCode,
                        district: addressInfo.districtCode,
                        ward: addressInfo.wardCode,
                        provinceName: addressInfo.provinceName,
                        districtName: addressInfo.districtName,
                        wardName: addressInfo.wardName,
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            }
            error={form.formState.errors.address?.message}
          >
            <Input
              readOnly
              {...form.register("address")}
              className="bg-gray-50"
              placeholder="Chưa có địa chỉ"
            />
          </CardFormRow>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-white min-w-[120px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang lưu...
                </div>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileFormCard;
