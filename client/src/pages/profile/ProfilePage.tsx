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
        const resp = await subscriptionServices.getSubscriptionUsage();
        // resp.data là object chứa các trường planKey, planName, ...
        if (resp && resp.data && resp.data.planKey) {
          setMyPlan(resp.data);
        } else {
          setMyPlan({ planKey: 'free', planName: 'Gói CƠ BẢN (FREE)' });
        }
      } catch (err) {
        console.error("Failed to load subscription usage", err);
        setMyPlan({ planKey: 'free', planName: 'Gói CƠ BẢN (FREE)' });
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
                const planObj = (myPlan && typeof myPlan === 'object') ? (myPlan as Record<string, unknown>) : { planKey: 'free', planName: 'Gói CƠ BẢN (FREE)' };
                const planName = typeof planObj.planName === 'string' ? planObj.planName : 'Gói CƠ BẢN (FREE)';
                const planKey = typeof planObj.planKey === 'string' ? planObj.planKey : 'free';
                const isPro = planKey === 'pro' || planName.toLowerCase().includes('pro');
                const isFree = !isPro;

                return (
                  <div className={isPro
                    ? "relative flex items-center justify-between bg-gradient-to-r from-yellow-400 via-orange-400 to-green-300 rounded-xl p-1 border-2 border-yellow-400 shadow-lg"
                    : "flex items-center justify-between"
                  }>
                    <div className={isPro ? "p-4" : ""}>
                      <div className={isPro ? "text-sm text-white drop-shadow" : "text-sm text-gray-500"}>Gói hiện tại</div>
                      <div className="flex items-center gap-2">
                        <div className={isPro ? "font-bold text-white text-lg flex items-center gap-2" : "font-semibold text-gray-800"}>
                          {isPro && (
                            <svg className="w-5 h-5 text-yellow-200 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l2.39 6.94H19l-5.18 3.76L15.82 18 10 14.27 4.18 18l1.99-5.3L1 8.94h6.61z" /></svg>
                          )}
                          {planName}
                        </div>
                        {isPro && (
                          <span className="text-xs font-bold bg-gradient-to-r from-yellow-300 via-orange-300 to-green-200 text-yellow-900 px-2 py-1 rounded-full border border-yellow-300 shadow animate-pulse">PRO</span>
                        )}
                        {isFree && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Miễn phí</span>
                        )}
                      </div>
                    </div>
                    <div className={isPro ? "p-4" : ""}>
                      {isFree ? (
                        <button
                          onClick={() => setShowSubModal(true)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm hover:bg-emerald-700 shadow"
                        >
                          Nâng cấp
                        </button>
                      ) : (
                        <span className="text-sm text-white font-semibold drop-shadow">Đang sử dụng</span>
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
      <SubscriptionModal
        open={showSubModal}
        onOpenChange={setShowSubModal}
        currentPlanKey={typeof myPlan === 'object' && myPlan && 'planKey' in myPlan ? (myPlan as { planKey?: string }).planKey : undefined}
      />
    </div>
  );
};

export default ProfilePage;
