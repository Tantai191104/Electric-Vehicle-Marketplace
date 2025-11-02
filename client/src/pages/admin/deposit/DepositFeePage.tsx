import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import API from "@/lib/axios";
import { FiDollarSign, FiSave, FiRefreshCw, FiEdit2, FiX } from "react-icons/fi";
import { formatVND } from "@/utils/formatVND";

interface DepositConfig {
    depositAmounts?: number[];
}

interface EditableAmountItemProps {
    amount: number;
    onUpdate: (newValue: string) => void;
    onRemove: () => void;
}

function EditableAmountItem({ amount, onUpdate, onRemove }: EditableAmountItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(formatVND(amount));
    const [displayValue, setDisplayValue] = useState(formatVND(amount));

    const handleEdit = () => {
        setIsEditing(true);
        setEditValue(amount.toString());
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue(amount.toString());
        setDisplayValue(formatVND(amount));
    };

    const handleSave = () => {
        onUpdate(editValue);
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, "");
        setEditValue(value);
        if (value === "") {
            setDisplayValue("");
        } else {
            const formatted = new Intl.NumberFormat("vi-VN").format(parseInt(value));
            setDisplayValue(formatted + " ₫");
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
                <Input
                    value={displayValue}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") handleCancel();
                    }}
                    className="flex-1"
                    autoFocus
                />
                <Button
                    onClick={handleSave}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    <FiSave className="w-4 h-4" />
                </Button>
                <Button
                    onClick={handleCancel}
                    size="sm"
                    variant="outline"
                >
                    Hủy
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg group hover:shadow-md transition-all">
            <span className="font-semibold text-emerald-800">
                {formatVND(amount)}
            </span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    onClick={handleEdit}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                    <FiEdit2 className="w-4 h-4" />
                </Button>
                <Button
                    onClick={onRemove}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <FiX className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

export default function DepositFeePage() {
    const [config, setConfig] = useState<DepositConfig>({ depositAmounts: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newAmount, setNewAmount] = useState(""); // raw value
    const [displayAmount, setDisplayAmount] = useState(""); // formatted display

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const response = await API.get("/deposit-amount");
            const data = response.data;
            // Backend returns { success: true, depositAmounts: [...] }
            const depositAmounts = Array.isArray(data?.depositAmounts)
                ? data.depositAmounts
                : Array.isArray(data?.data?.depositAmounts)
                ? data.data.depositAmounts
                : [];
            
            setConfig({
                depositAmounts
            });
        } catch (error) {
            console.error("Failed to fetch deposit config:", error);
            toast.error("Không thể tải cấu hình mức đặt cọc");
            setConfig({ depositAmounts: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, ""); // chỉ giữ số
        setNewAmount(value);

        if (value === "") {
            setDisplayAmount("");
        } else {
            const formatted = new Intl.NumberFormat("vi-VN").format(parseInt(value));
            setDisplayAmount(formatted + " ₫");
        }
    };

    const handleAddAmount = () => {
        const amount = parseInt(newAmount);
        if (!amount || amount <= 0) {
            toast.error("Vui lòng nhập số tiền hợp lệ");
            return;
        }
        setConfig({
            ...config,
            depositAmounts: [amount]
        });
        setNewAmount("");
        setDisplayAmount("");
        toast.success(`Đã thêm mức đặt cọc ${formatVND(amount)}`);
    };

    const handleUpdateAmount = (oldAmount: number, newValue: string) => {
        const numericValue = newValue.replace(/[^\d]/g, "");
        if (numericValue === "") {
            // If empty, remove the amount
            handleRemoveAmount(oldAmount);
            return;
        }
        const newAmount = parseInt(numericValue);
        if (!newAmount || newAmount <= 0) {
            toast.error("Vui lòng nhập số tiền hợp lệ");
            return;
        }
        
        const amounts = config.depositAmounts || [];
        // Check if new amount already exists (excluding current amount)
        if (amounts.filter(a => a !== oldAmount).includes(newAmount)) {
            toast.error(`Số tiền ${formatVND(newAmount)} đã tồn tại`);
            return;
        }
        
        setConfig({
            ...config,
            depositAmounts: amounts.map(a => a === oldAmount ? newAmount : a).sort((a, b) => a - b)
        });
    };

    const handleRemoveAmount = (amount: number) => {
        setConfig({
            ...config,
            depositAmounts: (config.depositAmounts || []).filter(a => a !== amount)
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await API.put("/admin/deposit-amount", { depositAmounts: config.depositAmounts || [] });
            toast.success("Cập nhật cấu hình thành công!");
            fetchConfig();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err?.response?.data?.message || "Cập nhật thất bại";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen overflow-y-auto bg-gray-50">
                <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-y-auto bg-gray-50">
            <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                                <FiDollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Quản lý mức đặt cọc</h1>
                                <p className="text-gray-600 mt-1">
                                    Cấu hình các mức tiền đặt cọc sẵn cho sản phẩm
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={fetchConfig}
                            variant="outline"
                            className="gap-2"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            Làm mới
                        </Button>
                    </div>

                    {/* Main Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Các mức đặt cọc</CardTitle>
                            <CardDescription>
                                Quản lý các mức tiền đặt cọc sẵn hiển thị cho người dùng khi đặt cọc sản phẩm
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Add New Amount - Only show when no amounts exist */}
                            {(config.depositAmounts || []).length === 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="newAmount">Thêm mức đặt cọc</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            id="newAmount"
                                            placeholder="Nhập số tiền (VD: 5.000.000 ₫)"
                                            value={displayAmount}
                                            onChange={handleAmountChange}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleAddAmount();
                                            }}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={handleAddAmount}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            Thêm
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Current Amounts - Show editable inputs when amounts exist */}
                            <div className="space-y-2">
                                <Label>
                                    {((config.depositAmounts || []).length === 0)
                                        ? "Danh sách mức đặt cọc"
                                        : `Chỉnh sửa mức đặt cọc (${(config.depositAmounts || []).length})`}
                                </Label>
                                {(config.depositAmounts || []).length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                                        Chưa có mức đặt cọc nào. Thêm mức đặt cọc mới bên trên.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(config.depositAmounts || []).map((amount, index) => (
                                            <EditableAmountItem
                                                key={`${amount}-${index}`}
                                                amount={amount}
                                                onUpdate={(newValue) => handleUpdateAmount(amount, newValue)}
                                                onRemove={() => handleRemoveAmount(amount)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                                >
                                    <FiSave className="w-4 h-4" />
                                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
