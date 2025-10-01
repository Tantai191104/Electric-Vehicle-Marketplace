// pages/ProfilePage.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileFormCard from "./components/ProfileFormCard";
import PasswordFormCard from "./components/PasswordFormCard";
import RecentActivityCard from "./components/RecentActivityCard";
import UserHeader from "./components/UserHeader";
import WalletCard from "./components/WalletCard";
import AddressDialog from "./components/AddressDialog";
import { useAuthStore } from "@/store/auth";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const passwordForm = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [openAddressModal, setOpenAddressModal] = useState(false);
  type Activity = {
    title: string;
    time: string;
    type: "ban" | "daBan" | "daMua";
  };

  const recentOrders: Activity[] = [
    { title: "Xe máy điện VinFast Feliz", time: "1 ngày trước", type: "ban" },
    { title: "Xe máy điện Yadea đã bán", time: "2 ngày trước", type: "daBan" },
    { title: "Mua pin xe điện 48V", time: "3 ngày trước", type: "daMua" },
  ];

  return (
    <div className="min-h-screen md:py-20 py-8 bg-yellow-50 mt-16">
      <div className="max-w-5xl mx-auto">
        <UserHeader name={user?.name || ""} role={user?.role || ""} avatarSrc="/vite.svg" />

        <div className="mt-8 flex flex-col md:flex-row gap-8">
          {/* Cột trái: Ví nhỏ + Tabs */}
          <div className="md:w-2/5 flex flex-col gap-6">
            <WalletCard balance={1200000} membership="Premium" small />

            <Tabs defaultValue="profile" className="mt-2">
              <TabsList className="bg-yellow-100 rounded-lg shadow-sm flex justify-between">
                <TabsTrigger value="profile" className="text-yellow-900 font-semibold px-4 py-2">
                  Thông tin cá nhân
                </TabsTrigger>
                <TabsTrigger value="password" className="text-yellow-900 font-semibold px-4 py-2">
                  Đổi mật khẩu
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileFormCard />
              </TabsContent>

              <TabsContent value="password">
                <PasswordFormCard form={passwordForm} onSubmit={(data) => console.log(data)} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Cột phải: Hoạt động đăng bán */}
          <div className="md:w-3/5">
            <RecentActivityCard activities={recentOrders} />
          </div>
        </div>
      </div>

      {/* Modal địa chỉ */}
      {openAddressModal && (
        <AddressDialog
          onSubmit={() => {
            // TODO: map code tỉnh/huyện/xã tại đây
            setOpenAddressModal(false);
          }}
          onClose={() => setOpenAddressModal(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
