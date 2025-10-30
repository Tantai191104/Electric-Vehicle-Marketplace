import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { subscriptionServices } from '@/services/subscriptionServices';
import { toast } from 'sonner';
import PlanCardSkeleton from '@/pages/subscription/components/PlanCardSkeleton';
import { PlanCard } from '@/pages/subscription/components/PlanCard';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiZap, FiShield } from 'react-icons/fi';
import type { SubscriptionPlan } from '@/types/subscriptionTypes';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionModal({ open, onOpenChange }: Props) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await subscriptionServices.getActiveSubscriptions();
        const raw = Array.isArray(data) ? data : [];

        type ServerSubscription = Partial<{
          _id: string; id: string; key: string; name: string; description: string;
          priceVnd: number; price: number; billingCycle: string; duration: string;
          quotas: Record<string, number> | Record<string, unknown>;
          features: Record<string, unknown> | undefined;
        }>;

        const mapped = raw.map((sRaw: unknown) => {
          const s = sRaw as ServerSubscription;
          return {
            id: s._id ?? s.id ?? s.key ?? String(s.name ?? ''),
            name: s.name ?? 'Gói',
            icon: s.key === 'pro' ? <FiZap className="w-6 h-6" /> : s.key === 'standard' ? <FiStar className="w-6 h-6" /> : <FiShield className="w-6 h-6" />,
            price: (s.priceVnd ?? s.price ?? 0) as number,
            duration: s.billingCycle ?? s.duration ?? 'tháng',
            color: s.key === 'pro' ? 'emerald' : s.key === 'standard' ? 'blue' : 'gray',
            badge: s.key === 'pro' ? 'PRO' : undefined,
            features: [],
            bonuses: [],
            suitable: s.description ?? '',
            popular: s.key === 'pro',
            quotas: s.quotas as Record<string, unknown> | undefined,
            featuresObj: s.features as Record<string, unknown> | undefined,
          } as SubscriptionPlan;
        });

        if (mounted) setPlans(mapped);
      } catch (err) {
        console.error('Failed to load plans', err);
        toast.error('Không thể tải các gói. Vui lòng thử lại.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [open]);

  const handleSelect = (planId: string) => {
    setSelected(planId);
    onOpenChange(false);
    navigate(`/checkout?planId=${planId}&type=subscription`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl rounded-2xl p-4">
        <DialogHeader className="mb-2">
          <DialogTitle>Chọn gói thuê bao</DialogTitle>
        </DialogHeader>

        <div className="mt-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <PlanCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  isSelected={selected === p.id}
                  isHovered={hovered === p.id}
                  onSelect={() => handleSelect(p.id)}
                  onHover={() => setHovered(p.id)}
                  onLeave={() => setHovered(null)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
