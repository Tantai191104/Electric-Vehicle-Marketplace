import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PlanCard from './components/PlanCard';
import SubscriptionDialog from './components/SubscriptionDialog';
import { toast } from "sonner";
import { subscriptionServices } from "@/services/subscriptionServices";

import type { AdminSubscription, SubscriptionSavePayload } from '@/types/subscriptionType';

// (sampleFallback memoized inside component to keep a stable reference)

export default function SubscriptionManage() {
    const [plans, setPlans] = useState<AdminSubscription[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [cardLoading, setCardLoading] = useState<Record<string, boolean>>({});
    const [confirmDisable, setConfirmDisable] = useState<string | null>(null); // plan id pending disable
    const [lastAction, setLastAction] = useState<{ id: string; name?: string; type: 'disable' | 'enable'; timeout?: number } | null>(null);
    const timeoutsRef = useRef<number[]>([]);
    // Fallback sample data (used when API returns empty) — memoized to keep stable reference
    const sampleFallback = useMemo<AdminSubscription[]>(() => [
        { _id: '68f6341094b8406c57d92127', key: 'free', name: 'Gói CƠ BẢN (FREE)', description: 'Phù hợp người dùng cá nhân, đăng ít', priceVnd: 0, billingCycle: 'monthly', isActive: true, quotas: { maxHighlightsPerCycle: 0, maxListingsPerCycle: 3, aiUsagePerCycle: 0, highlightHoursPerListing: 0, cooldownDaysBetweenListings: 30 }, features: { aiAssist: false, priorityBoost: false, manualReviewBypass: false, supportLevel: 'none' } },
        { _id: '68f6356794b8406c57d9212b', key: 'trial', name: 'Gói TIÊU CHUẨN', description: 'Phù hợp người bán thường xuyên', priceVnd: 99000, billingCycle: 'monthly', isActive: true, quotas: { maxHighlightsPerCycle: 0, maxListingsPerCycle: 15, aiUsagePerCycle: 5, highlightHoursPerListing: 24, cooldownDaysBetweenListings: 7 }, features: { aiAssist: true, priorityBoost: true, manualReviewBypass: false, supportLevel: 'standard' } },
        { _id: '68f6358694b8406c57d9212f', key: 'pro', name: 'Gói PRO', description: 'Phù hợp đại lý, cửa hàng nhỏ', priceVnd: 299000, billingCycle: 'monthly', isActive: true, quotas: { maxHighlightsPerCycle: 0, maxListingsPerCycle: 50, aiUsagePerCycle: 100, highlightHoursPerListing: 72, cooldownDaysBetweenListings: 0 }, features: { aiAssist: true, priorityBoost: true, manualReviewBypass: true, supportLevel: 'priority' } },
    ], []);

    // cleanup pending timeouts on unmount
    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach((t) => window.clearTimeout(t));
            timeoutsRef.current = [];
        };
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const resp = await subscriptionServices.getAdminSubscriptions();
            // Support responses shaped as { data: [...] } or [...]
            const maybeData = resp as unknown;
            // Helper to try to extract an array from common API shapes
            const extractArray = (val: unknown): AdminSubscription[] => {
                if (Array.isArray(val)) return val as AdminSubscription[];
                if (typeof val === 'object' && val !== null) {
                    const v = val as Record<string, unknown>;
                    if (Array.isArray(v.data)) return v.data as AdminSubscription[];
                    // sometimes nested: { data: { data: [...] } }
                    if (typeof v.data === 'object' && v.data !== null) {
                        const v2 = v.data as Record<string, unknown>;
                        if (Array.isArray(v2.data)) return v2.data as AdminSubscription[];
                    }
                }
                return [];
            };

            const normalized = extractArray(maybeData);
            setPlans(normalized);
        } catch (err: unknown) {
            console.error(err);
            toast.error("Không thể tải danh sách gói đăng ký");
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleToggleActive = useCallback(async (id: string) => {
        const p = plans?.find((pl) => String(pl._id ?? pl.id ?? pl.key) === id);
        if (!p) return toast.error("Gói không tồn tại");

        // If disabling, ask for confirmation
        if (p.isActive) {
            setConfirmDisable(id);
            return;
        }

        // Optimistic activate
        setCardLoading(prev => ({ ...prev, [id]: true }));
        setPlans(prev => prev?.map(pl => (String(pl._id ?? pl.id ?? pl.key) === id ? { ...pl, isActive: true } : pl)) ?? prev);
        try {
            await subscriptionServices.updateSubscription(id, { isActive: true } as Record<string, unknown>);
            toast.success("Kích hoạt gói thành công");
        } catch (err) {
            console.error(err);
            // revert
            setPlans(prev => prev?.map(pl => (String(pl._id ?? pl.id ?? pl.key) === id ? { ...pl, isActive: false } : pl)) ?? prev);
            toast.error("Kích hoạt không thành công");
        } finally {
            setCardLoading(prev => ({ ...prev, [id]: false }));
        }
    }, [plans]);

    const confirmDisablePlan = useCallback(async (id: string) => {
        setConfirmDisable(null);
        setCardLoading(prev => ({ ...prev, [id]: true }));
        // optimistic disable
        setPlans(prev => prev?.map(pl => (String(pl._id ?? pl.id ?? pl.key) === id ? { ...pl, isActive: false } : pl)) ?? prev);
        try {
            await subscriptionServices.updateSubscription(id, { isActive: false } as Record<string, unknown>);
            toast.success("Vô hiệu hóa gói thành công");
            // provide undo opportunity
            const t = window.setTimeout(() => setLastAction(null), 8000);
            timeoutsRef.current.push(t);
            // include the plan name to show in the undo banner
            const planName = (plans ?? sampleFallback).find(pl => String(pl._id ?? pl.id ?? pl.key) === id)?.name;
            setLastAction({ id, name: planName, type: 'disable', timeout: t });
        } catch (err) {
            console.error(err);
            // revert
            setPlans(prev => prev?.map(pl => (String(pl._id ?? pl.id ?? pl.key) === id ? { ...pl, isActive: true } : pl)) ?? prev);
            toast.error("Vô hiệu hóa không thành công");
        } finally {
            setCardLoading(prev => ({ ...prev, [id]: false }));
        }
    }, [plans, sampleFallback]);

    // create handled by opening the modal with empty editing state

    const handleEdit = useCallback((id: string) => {
        // open modal with selected plan
        const p = plans?.find((pl) => String(pl._id ?? pl.id ?? pl.key) === id);
        if (!p) return toast.error("Gói không tồn tại");
        setEditing(p);
        setOpen(true);
    }, [plans]);

    // Modal form state
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<AdminSubscription | null>(null);

    // Modal state is managed inside SubscriptionDialog; keep `editing` and `open` here only

    // quotas & features are handled inside SubscriptionDialog

    const handleSaveForm = async (payload: SubscriptionSavePayload): Promise<void> => {
        if (!payload.name) { toast.error("Tên gói không được để trống"); return; }
        try {
            toast.loading("Đang lưu...");
            if (editing && (editing._id || editing.id || editing.key)) {
                const id = String(editing._id ?? editing.id ?? editing.key);
                await subscriptionServices.updateSubscription(id, payload as Record<string, unknown>);
                toast.dismiss();
                toast.success("Cập nhật thành công");
            } else {
                await subscriptionServices.createSubscription(payload as Record<string, unknown>);
                toast.dismiss();
                toast.success("Tạo gói thành công");
            }
            setOpen(false);
            setEditing(null);
            fetchPlans();
            return;
        } catch (err) {
            console.error(err);
            toast.dismiss();
            toast.error("Lưu không thành công");
        }
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm flex flex-col h-full overflow-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">Quản lý gói đăng ký</h2>
                        <p className="text-sm text-gray-600">Danh sách các gói đăng ký hiện có trong hệ thống</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => { setEditing(null); setOpen(true); }}>Tạo gói mới</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading && <div className="text-center text-gray-500 col-span-3">Đang tải...</div>}
                    {!loading && (plans ?? sampleFallback).length === 0 && <div className="text-center text-gray-500 col-span-3">Không tìm thấy gói đăng ký</div>}
                    {useMemo(() => (
                        (plans ?? sampleFallback)
                            .slice()
                            .sort((a, b) => (a.key === 'pro' ? -1 : b.key === 'pro' ? 1 : 0))
                            .map((p) => {
                                const id = String(p._id ?? p.id ?? p.key);
                                return (
                                    <PlanCard key={id} plan={p} onEdit={handleEdit} onToggleActive={handleToggleActive} loading={!!cardLoading[id]} />
                                );
                            })
                    ), [plans, cardLoading, handleEdit, handleToggleActive, sampleFallback])}
                </div>
                <SubscriptionDialog open={open} onOpenChange={setOpen} editing={editing} onSave={handleSaveForm} onCancel={() => { setOpen(false); setEditing(null); }} />

                {/* Confirmation dialog for disabling a plan (uses shared Dialog) */}
                <Dialog open={!!confirmDisable} onOpenChange={(v) => { if (!v) setConfirmDisable(null); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Xác nhận vô hiệu hóa</DialogTitle>
                        </DialogHeader>
                        <div className="py-2 text-sm text-gray-700">Bạn có chắc muốn vô hiệu hóa gói này? Hành động này sẽ tạm thời ngắt quyền lợi.</div>
                        <DialogFooter>
                            <div className="flex gap-2 w-full justify-end">
                                <Button variant="ghost" onClick={() => setConfirmDisable(null)}>Hủy</Button>
                                <Button variant="destructive" onClick={() => confirmDisablePlan(String(confirmDisable))}>Vô hiệu hóa</Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Undo banner */}
                {lastAction && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-4">
                        <div className="text-sm">Đã vô hiệu hóa gói: <strong>{lastAction.name ?? 'gói'}</strong></div>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1 bg-white text-gray-900 rounded-md text-sm"
                                onClick={async () => {
                                    const id = lastAction.id;
                                    // cancel timeout
                                    if (lastAction.timeout) {
                                        window.clearTimeout(lastAction.timeout);
                                        // remove from ref list
                                        timeoutsRef.current = timeoutsRef.current.filter(x => x !== lastAction.timeout);
                                    }
                                    setLastAction(null);
                                    // optimistic re-enable
                                    setPlans(prev => prev?.map(pl => (String(pl._id ?? pl.id ?? pl.key) === id ? { ...pl, isActive: true } : pl)) ?? prev);
                                    try {
                                        await subscriptionServices.updateSubscription(id, { isActive: true } as Record<string, unknown>);
                                        toast.success('Hoàn tác thành công');
                                    } catch (err) {
                                        console.error(err);
                                        toast.error('Hoàn tác không thành công');
                                    }
                                }}
                            >Hoàn tác</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Note: cleanup effect for timeouts is defined inside the component where timeoutsRef is in scope.
