import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiStar, FiZap, FiShield, FiFrown } from "react-icons/fi";
import { useAuthStore } from "@/store/auth";

import type { SubscriptionPlan } from "@/types/subscriptionTypes";
import { PageHeader } from "./components/PageHeader";
import { PlanCard } from "./components/PlanCard";
import { ContactSection } from "./components/ContactSection";


export default function SubscriptionPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

    const subscriptionPlans: SubscriptionPlan[] = [
        {
            id: "basic",
            name: "Free",
            icon: <FiShield className="w-6 h-6" />,
            price: 0,
            duration: "miễn phí",
            color: "gray",
            features: [
                "3 bài đăng/tháng",
                "Hỗ trợ cơ bản",
                "Ưu tiên thấp",
                "Không tin nổi bật"
            ],
            suitable: "Dành cho người dùng cá nhân"
        },
        {
            id: "standard",
            name: "Standard",
            icon: <FiStar className="w-6 h-6" />,
            price: 99000,
            duration: "tháng",
            color: "blue",
            features: [
                "15 bài đăng/tháng",
                "2 tin nổi bật/tháng",
                "Hiển thị trang chủ 1 ngày",
                "Thống kê cơ bản",
                "Hỗ trợ email"
            ],
            bonuses: [
                "Hiển thị ở trang chủ 1 ngày"
            ],
            suitable: "Dành cho người bán thường xuyên"
        },
        {
            id: "pro",
            name: "Pro",
            icon: <FiZap className="w-6 h-6" />,
            price: 299000,
            duration: "tháng",
            color: "emerald",
            badge: "PRO",
            popular: true,
            features: [
                "50 bài đăng/tháng",
                "10 tin nổi bật/tháng",
                "Hiển thị trang chủ 3 ngày",
                "Badge PRO nổi bật",
                "Thống kê chi tiết",
                "Hỗ trợ ưu tiên",
                "API tích hợp"
            ],
            bonuses: [
                "Hiển thị ở trang chủ 3 ngày",
                "Badge 'PRO' trên profile",
                "Thống kê chi tiết"
            ],
            suitable: "Dành cho đại lý và cửa hàng"
        },
        {
            id: "enterprise",
            name: "Enterprise",
            icon: <FiFrown className="w-6 h-6" />,
            price: 1299000,
            duration: "tháng",
            color: "purple",
            badge: "VIP",
            recommended: true,
            features: [
                "Không giới hạn bài đăng",
                "Không giới hạn tin nổi bật",
                "Banner quảng cáo riêng",
                "Badge VIP kim cương",
                "Báo cáo doanh thu chi tiết",
                "Quản lý tài khoản riêng",
                "Hỗ trợ 24/7",
                "Tích hợp CRM"
            ],
            bonuses: [
                "Banner quảng cáo riêng",
                "Badge 'VIP' nổi bật",
                "Hỗ trợ 24/7",
                "Tích hợp hệ thống quản lý",
                "Báo cáo doanh thu chi tiết"
            ],
            suitable: "Dành cho doanh nghiệp lớn"
        }
    ];

    const handleSelectPlan = (planId: string) => {
        if (!user) {
            navigate('/auth/login');
            return;
        }
        setSelectedPlan(planId);
        navigate(`/checkout?planId=${planId}&type=subscription`);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <PageHeader />

                    {/* Pricing Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                    >
                        {subscriptionPlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isSelected={selectedPlan === plan.id}
                                isHovered={hoveredPlan === plan.id}
                                onSelect={() => handleSelectPlan(plan.id)}
                                onHover={() => setHoveredPlan(plan.id)}
                                onLeave={() => setHoveredPlan(null)}
                            />
                        ))}
                    </motion.div>

                    <ContactSection />
                </div>
            </div>
        </div>
    );
}