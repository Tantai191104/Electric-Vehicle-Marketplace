import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { AdminSubscription, SubscriptionSavePayload } from '@/types/subscriptionType';

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    editing: AdminSubscription | null;
    onSave: (payload: SubscriptionSavePayload) => Promise<void> | void;
    onCancel?: () => void;
};

export default function SubscriptionDialog({ open, onOpenChange, editing, onSave, onCancel }: Props) {
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formPrice, setFormPrice] = useState<number | undefined>(undefined);
    const [formBilling, setFormBilling] = useState('monthly');
    const [formQuotas, setFormQuotas] = useState({
        maxHighlightsPerCycle: 0,
        maxListingsPerCycle: 0,
        aiUsagePerCycle: 0,
        highlightHoursPerListing: 0,
        cooldownDaysBetweenListings: 0,
    });
    const [formFeatures, setFormFeatures] = useState({ aiAssist: false, priorityBoost: false, manualReviewBypass: false, supportLevel: 'none' });
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (editing) {
            setFormName(editing.name || '');
            setFormDesc(editing.description || '');
            setFormPrice(editing.priceVnd ?? editing.price ?? undefined);
            setFormBilling(editing.billingCycle || editing.duration || 'monthly');
            setFormQuotas({
                maxHighlightsPerCycle: editing.quotas?.maxHighlightsPerCycle ?? 0,
                maxListingsPerCycle: editing.quotas?.maxListingsPerCycle ?? 0,
                aiUsagePerCycle: editing.quotas?.aiUsagePerCycle ?? 0,
                highlightHoursPerListing: editing.quotas?.highlightHoursPerListing ?? 0,
                cooldownDaysBetweenListings: editing.quotas?.cooldownDaysBetweenListings ?? 0,
            });
            setFormFeatures({
                aiAssist: !!editing.features?.aiAssist,
                priorityBoost: !!editing.features?.priorityBoost,
                manualReviewBypass: !!editing.features?.manualReviewBypass,
                supportLevel: editing.features?.supportLevel ?? 'none',
            });
            setIsActive(editing.isActive ?? true);
        } else {
            setFormName('');
            setFormDesc('');
            setFormPrice(undefined);
            setFormBilling('monthly');
            setFormQuotas({ maxHighlightsPerCycle: 0, maxListingsPerCycle: 0, aiUsagePerCycle: 0, highlightHoursPerListing: 0, cooldownDaysBetweenListings: 0 });
            setFormFeatures({ aiAssist: false, priorityBoost: false, manualReviewBypass: false, supportLevel: 'none' });
            setIsActive(true);
        }
    }, [editing, open]);

    const handleSave = async () => {
        if (!formName) return; // validation left to parent
        await onSave({
            name: formName,
            description: formDesc,
            priceVnd: formPrice ?? 0,
            billingCycle: formBilling,
            isActive,
            quotas: { ...formQuotas },
            features: { ...formFeatures },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editing ? 'Chỉnh sửa gói' : 'Tạo gói mới'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">Tên gói</label>
                        <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Tên gói" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Mô tả</label>
                        <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Mô tả ngắn" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Giá (VND)</label>
                        <Input value={formPrice ?? ''} onChange={(e) => setFormPrice(Number(e.target.value || 0))} placeholder="0" type="number" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Chu kỳ thanh toán</label>
                        <Input value={formBilling} onChange={(e) => setFormBilling(e.target.value)} placeholder="monthly" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-sm font-medium">Số tin tối đa / chu kỳ</label>
                            <Input value={formQuotas.maxListingsPerCycle} onChange={(e) => setFormQuotas(q => ({ ...q, maxListingsPerCycle: Number(e.target.value || 0) }))} type="number" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Tin nổi bật / chu kỳ</label>
                            <Input value={formQuotas.maxHighlightsPerCycle} onChange={(e) => setFormQuotas(q => ({ ...q, maxHighlightsPerCycle: Number(e.target.value || 0) }))} type="number" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Ai usage / chu kỳ</label>
                            <Input value={formQuotas.aiUsagePerCycle} onChange={(e) => setFormQuotas(q => ({ ...q, aiUsagePerCycle: Number(e.target.value || 0) }))} type="number" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Giờ nổi bật</label>
                            <Input value={formQuotas.highlightHoursPerListing} onChange={(e) => setFormQuotas(q => ({ ...q, highlightHoursPerListing: Number(e.target.value || 0) }))} type="number" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Cooldown (ngày)</label>
                            <Input value={formQuotas.cooldownDaysBetweenListings} onChange={(e) => setFormQuotas(q => ({ ...q, cooldownDaysBetweenListings: Number(e.target.value || 0) }))} type="number" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="text-sm font-medium mb-2">Tính năng</div>
                        <div className="flex flex-col gap-3">
                            {/* Simple Switch component */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="text-sm">AI Assist</div></div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" checked={formFeatures.aiAssist} onChange={(e) => setFormFeatures(f => ({ ...f, aiAssist: e.target.checked }))} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-emerald-500"></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formFeatures.aiAssist ? 'translate-x-5' : ''}`} />
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="text-sm">Priority Boost</div></div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" checked={formFeatures.priorityBoost} onChange={(e) => setFormFeatures(f => ({ ...f, priorityBoost: e.target.checked }))} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-yellow-400"></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formFeatures.priorityBoost ? 'translate-x-5' : ''}`} />
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="text-sm">Manual Review Bypass</div></div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" checked={formFeatures.manualReviewBypass} onChange={(e) => setFormFeatures(f => ({ ...f, manualReviewBypass: e.target.checked }))} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-slate-400"></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formFeatures.manualReviewBypass ? 'translate-x-5' : ''}`} />
                                </label>
                            </div>

                            <div>
                                <label className="text-sm">Support level</label>
                                <select value={formFeatures.supportLevel} onChange={(e) => setFormFeatures(f => ({ ...f, supportLevel: e.target.value }))} className="w-full mt-1 px-2 py-1 border rounded-md">
                                    <option value="none">Không hỗ trợ</option>
                                    <option value="standard">Chuẩn</option>
                                    <option value="priority">Ưu tiên</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input id="active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                        <label htmlFor="active" className="text-sm">Kích hoạt</label>
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex gap-2 w-full justify-end">
                        <Button variant="ghost" onClick={() => { onCancel?.(); onOpenChange(false); }}>{'Hủy'}</Button>
                        <Button onClick={handleSave}>{editing ? 'Lưu thay đổi' : 'Tạo gói'}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
