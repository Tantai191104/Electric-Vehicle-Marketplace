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
  const { user } = useAuthStore();
  const [openAddressModal, setOpenAddressModal] = useState(false);
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

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.profile?.address
          ? `${user.profile.address.houseNumber}, ${user.profile.address.ward}, ${user.profile.address.district}, ${user.profile.address.province}`
          : "",
      });

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

  const handleSubmit: SubmitHandler<ProfileForm> = async () => {
    try {
      await userServices.updateProfile({
        houseNumber: addressInfo.houseNumber,
        provinceCode: addressInfo.provinceCode,
        districtCode: addressInfo.districtCode,
        wardCode: addressInfo.wardCode,
      });
      toast.success("Cập nhật thành công");
    } catch (err) {
      toast.error("Cập nhật thất bại", {
        description: err instanceof Error ? err.message : undefined,
      });
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
              <Input {...form.register("name")} />
            </CardFormRow>
            <CardFormRow
              label="Số điện thoại"
              error={form.formState.errors.phone?.message}
              className="flex-1"
            >
              <Input {...form.register("phone")} />
            </CardFormRow>
          </div>

          <CardFormRow label="Email" error={form.formState.errors.email?.message}>
            <Input readOnly type="email" {...form.register("email")} />
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
                      className="text-yellow-700 border-yellow-300 px-2 py-1 text-xs font-semibold"
                    >
                      Cập nhật địa chỉ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <AddressDialog
                      onSubmit={(data) => {
                        form.setValue(
                          "address",
                          `${data.street}, ${data.wardName}, ${data.districtName}, ${data.provinceName}`
                        );
                        setAddressInfo({
                          houseNumber: data.street,
                          provinceCode: data.province,
                          districtCode: data.district,
                          wardCode: data.ward,
                          provinceName: data.provinceName || "",
                          districtName: data.districtName || "",
                          wardName: data.wardName || "",
                        });
                        setOpenAddressModal(false);
                      }}
                      onClose={() => setOpenAddressModal(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            }
            error={form.formState.errors.address?.message}
          >
            <Input readOnly {...form.register("address")} />
          </CardFormRow>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-white"
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileFormCard;
