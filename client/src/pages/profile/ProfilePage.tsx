// pages/ProfilePage.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileFormCard from "./components/ProfileFormCard";
import PasswordFormCard from "./components/PasswordFormCard";
import RecentActivityCard from "./components/RecentActivityCard";
import UserHeader from "./components/UserHeader";

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

  const recentOrders = [
    { title: "Đăng tin: Xe máy điện cũ", time: "1 ngày trước" },
    { title: "Mua: Pin xe điện 48V", time: "3 ngày trước" },
    { title: "Cập nhật thông tin cá nhân", time: "1 tuần trước" },
  ];

  return (
    <div className="min-h-screen md:p-36 p-6 pt-12 bg-yellow-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <UserHeader
          name="Nguyễn Tấn Tài"
          role="Customer"
          avatarSrc="/vite.svg"
        />

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-yellow-100 rounded-lg shadow-sm">
            <TabsTrigger value="profile" className="text-yellow-900">
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger value="password" className="text-yellow-900">
              Đổi mật khẩu
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-yellow-900">
              Hoạt động gần đây
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

          <TabsContent value="orders">
            <RecentActivityCard activities={recentOrders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
