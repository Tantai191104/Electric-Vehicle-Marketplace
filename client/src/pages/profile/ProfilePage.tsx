// pages/ProfilePage.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileFormCard from "./components/ProfileFormCard";
import PasswordFormCard from "./components/PasswordFormCard";
import RecentActivityCard from "./components/RecentActivityCard";
import UserHeader from "./components/UserHeader";
import WalletCard from "./components/WalletCard";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ProfilePage: React.FC = () => {
  const profileForm = useForm({
    defaultValues: {
      name: "Nguyễn Tấn Tài",
      email: "tantai231204@gmail.com",
      phone: "0123456789",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  type Activity = {
    title: string;
    time: string;
    type: "ban" | "daBan" | "daMua";
  };

  const recentOrders: Activity[] = [
    { title: "Xe máy điện VinFast Feliz", time: "1 ngày trước", type: "ban" },
    { title: "Xe máy điện Yadea đã bán", time: "2 ngày trước", type: "daBan" },
    { title: "Mua pin xe điện 48V", time: "3 ngày trước", type: "daMua" }
  ];

  return (
    <div className="min-h-screen md:p-36 p-6 pt-12 bg-yellow-50">
      <div className="max-w-6xl mx-auto">
        <UserHeader
          name="Nguyễn Tấn Tài"
          role="Customer"
          avatarSrc="/vite.svg"
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cột trái: Ví + Thông tin cá nhân */}
          <div className="space-y-8">
            <WalletCard balance={1200000} membership="Premium" /> {/* Ví dụ số dư ví */}
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="bg-yellow-100 rounded-lg shadow-sm">
                <TabsTrigger value="profile" className="text-yellow-900">
                  Thông tin cá nhân
                </TabsTrigger>
                <TabsTrigger value="password" className="text-yellow-900">
                  Đổi mật khẩu
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <ProfileFormCard
                  form={profileForm}
                  onSubmit={(data) => console.log(data)}
                />
              </TabsContent>
              <TabsContent value="password">
                <PasswordFormCard
                  form={passwordForm}
                  onSubmit={(data) => console.log(data)}
                />
              </TabsContent>
            </Tabs>
          </div>
          {/* Cột phải: Hoạt động đăng bán */}
          <div>
            <RecentActivityCard activities={recentOrders} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
