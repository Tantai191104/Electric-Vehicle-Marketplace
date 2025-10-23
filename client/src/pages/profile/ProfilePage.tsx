// pages/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileFormCard from "./components/ProfileFormCard";
import PasswordFormCard from "./components/PasswordFormCard";
import RecentActivityCard from "./components/RecentActivityCard";
import UserHeader from "./components/UserHeader";
import WalletCard from "./components/WalletCard";
// AddressDialog is handled inside ProfileFormCard; no need to open it from this page
import { useAuthStore } from "@/store/auth";
import { subscriptionServices } from "@/services/subscriptionServices";
import SubscriptionModal from './components/SubscriptionModal';


type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<number>(user?.wallet?.balance ?? 0);
  const passwordForm = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Page-level address modal removed; ProfileFormCard handles address editing
  const [myPlan, setMyPlan] = useState<unknown | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);
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

  useEffect(() => {
    // Ensure balance is always in sync with user store
    setBalance(user?.wallet?.balance ?? 0);
  }, [user]);

  useEffect(() => {
    const loadMyPlan = async () => {
      try {
        const resp = await subscriptionServices.getMySubscription();
        setMyPlan(resp || null);
      } catch (err) {
        console.error("Failed to load my subscription", err);
        // Default to a free plan when API fails or user has no plan
        setMyPlan({ key: 'free', name: 'Gói CƠ BẢN (FREE)', priceVnd: 0 });
      }
    };

    loadMyPlan();
  }, []);

  return (
    <div className="min-h-screen md:py-20 py-8 bg-yellow-50 mt-16">
      <div className="max-w-5xl mx-auto">
        {/* Hiển thị vai trò người dùng theo tiếng Việt */}
        <UserHeader
          name={user?.name || ""}
          role={
            user?.role === "admin" ? "Quản trị viên" : user?.role === "user" ? "Khách hàng" : (user?.role || "")
          }
          avatarSrc="/vite.svg"
        />

        <div className="mt-8 flex flex-col md:flex-row gap-8 items-start">
          {/* Cột trái: Ví nhỏ + Tabs */}
          <div className="md:w-2/5 flex flex-col gap-6">
            <WalletCard balance={balance} small />

            {/* Current subscription */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {(() => {
                const planObj = (myPlan && typeof myPlan === 'object') ? (myPlan as Record<string, unknown>) : { key: 'free', name: 'Gói CƠ BẢN (FREE)', priceVnd: 0 };
                const planName = typeof planObj.name === 'string' ? planObj.name : 'Gói CƠ BẢN (FREE)';
                const planKey = typeof planObj.key === 'string' ? planObj.key : 'free';
                const planPrice = typeof planObj.priceVnd === 'number' ? planObj.priceVnd : 0;
                const isFree = planKey === 'free' || planPrice === 0;

                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Gói hiện tại</div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-800">{planName}</div>
                        {isFree && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Miễn phí</span>
                        )}
                      </div>
                    </div>
                    <div>
                      {isFree ? (
                        <button
                          onClick={() => setShowSubModal(true)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm hover:bg-emerald-700 shadow"
                        >
                          Nâng cấp
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">Đang sử dụng</span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

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
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-700">Hoạt động gần đây</h3>
            </div>
            <RecentActivityCard activities={recentOrders} />
          </div>
        </div>
      </div>

      {/* Address modal removed from this page - editing handled inside the profile form */}
      <SubscriptionModal open={showSubModal} onOpenChange={setShowSubModal} />
    </div>
  );
};

export default ProfilePage;
