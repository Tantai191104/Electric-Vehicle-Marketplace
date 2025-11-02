import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import API from "@/lib/axios";
import { FiDollarSign, FiSave, FiRefreshCw } from "react-icons/fi";
import { formatVND } from "@/utils/formatVND";

interface DepositConfig {
    depositAmounts?: number[];
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
            if (data && typeof data === "object") {
                setConfig({
                    depositAmounts: Array.isArray(data.depositAmounts)
                        ? data.depositAmounts
                        : []
                });
            } else {
                setConfig({ depositAmounts: [] });
            }
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
        const amounts = config.depositAmounts || [];
        if (amounts.includes(amount)) {
            toast.error(`Số tiền ${formatVND(amount)} đã tồn tại`);
            return;
        }
        setConfig({
            ...config,
            depositAmounts: [...amounts, amount].sort((a, b) => a - b)
        });
        setNewAmount("");
        setDisplayAmount("");
        toast.success(`Đã thêm mức đặt cọc ${formatVND(amount)}`);
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
                            {/* Add New Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="newAmount">Thêm mức đặt cọc mới</Label>
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

                            {/* Current Amounts */}
                            <div className="space-y-2">
                                <Label>Danh sách mức đặt cọc hiện tại ({(config.depositAmounts || []).length})</Label>
                                {(config.depositAmounts || []).length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                                        Chưa có mức đặt cọc nào. Thêm mức đặt cọc mới bên trên.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {(config.depositAmounts || []).map((amount) => (
                                            <div
                                                key={amount}
                                                className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg group hover:shadow-md transition-all"
                                            >
                                                <span className="font-semibold text-emerald-800">
                                                    {formatVND(amount)}
                                                </span>
                                                <Button
                                                    onClick={() => handleRemoveAmount(amount)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    Xóa
                                                </Button>
                                            </div>
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
