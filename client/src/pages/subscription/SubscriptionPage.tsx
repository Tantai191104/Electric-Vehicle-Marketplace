import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiStar, FiZap, FiShield } from "react-icons/fi";
import { useAuthStore } from "@/store/auth";
import { subscriptionServices } from "@/services/subscriptionServices";
import { toast } from 'sonner';
import PlanCardSkeleton from './components/PlanCardSkeleton';
import type { SubscriptionPlan } from "@/types/subscriptionTypes";
import { PageHeader } from "./components/PageHeader";
import { PlanCard } from "./components/PlanCard";
import { ContactSection } from "./components/ContactSection";


export default function SubscriptionPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await subscriptionServices.getActiveSubscriptions();
                // Map server shape to SubscriptionPlan conservatively
                const raw = Array.isArray(data) ? data : [];
                type ServerSubscription = {
                    _id?: string;
                    id?: string;
                    key?: string;
                    name?: string;
                    description?: string;
                    priceVnd?: number;
                    price?: number;
                    billingCycle?: string;
                    duration?: string;
                    quotas?: { maxListingsPerCycle?: number };
                    features?: { aiAssist?: boolean; priorityBoost?: boolean };
                };

                type ServerQuotas = {
                    maxHighlightsPerCycle?: number;
                    maxListingsPerCycle?: number;
                    aiUsagePerCycle?: number;
                    highlightHoursPerListing?: number;
                    cooldownDaysBetweenListings?: number;
                };
                type ServerFeaturesObj = {
                    aiAssist?: boolean;
                    priorityBoost?: boolean;
                    manualReviewBypass?: boolean;
                    supportLevel?: string;
                };

                const mapped = raw.map((sRaw: unknown) => {
                    const s = sRaw as ServerSubscription & { quotas?: ServerQuotas; features?: ServerFeaturesObj };
                    return {
                        id: s._id ?? s.id ?? s.key ?? String(s.name),
                        name: s.name ?? 'Gói',
                        icon: s.key === 'pro' ? <FiZap className="w-6 h-6" /> : s.key === 'standard' ? <FiStar className="w-6 h-6" /> : <FiShield className="w-6 h-6" />,
                        price: s.priceVnd ?? s.price ?? 0,
                        duration: s.billingCycle ?? s.duration ?? 'tháng',
                        color: s.key === 'pro' ? 'emerald' : s.key === 'standard' ? 'blue' : 'gray',
                        badge: s.key === 'pro' ? 'PRO' : undefined,
                        // keep a simple features list for fallback display
                        features: [
                            ...(s.quotas?.maxListingsPerCycle ? [`${s.quotas.maxListingsPerCycle} bài đăng/chu kỳ`] : []),
                            ...(s.features?.aiAssist ? ['AI Assist'] : []),
                            ...(s.features?.priorityBoost ? ['Priority Boost'] : []),
                        ],
                        bonuses: [],
                        suitable: s.description ?? '',
                        popular: s.key === 'pro',
                        // structured/server fields for PlanCard to render
                        quotas: s.quotas,
                        featuresObj: s.features,
                    } as SubscriptionPlan;
                });
                if (mounted) setSubscriptionPlans(mapped);
            } catch (err) {
                console.error('Failed to load subscription plans', err);
                toast.error('Không thể tải danh sách gói. Vui lòng thử lại sau.');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

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
                        {loading && Array.from({ length: 4 }).map((_, i) => (
                            <PlanCardSkeleton key={`sk-${i}`} />
                        ))}
                        {!loading && subscriptionPlans.map((plan) => (
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