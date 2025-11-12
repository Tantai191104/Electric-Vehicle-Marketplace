import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaCoins, FaWallet, FaShieldAlt } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { TbArrowRight } from "react-icons/tb";
import PaymentQR from "./components/PaymentQR";
import { zaloPayServices } from "@/services/walletServices";
import ZaloPayLogo from "@/assets/Zalopay.svg";
import { useZaloPayOrder } from "@/hooks/useZaloPayOrder";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

const PRESET_AMOUNTS = [25000, 50000, 100000, 500000, 1000000];

// Utility function để format số với dấu chấm
const formatNumberWithDots = (value: string | number): string => {
  const numValue = typeof value === 'string' ? value.replace(/\./g, '') : value.toString();
  return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Function để parse số từ string có dấu chấm
const parseNumberFromFormatted = (value: string): number => {
  return parseInt(value.replace(/\./g, '')) || 0;
};

const WalletTopupPage: React.FC = () => {
  const [tab, setTab] = useState("cash");
  const [amount, setAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState(""); // Để hiển thị với dấu chấm
  const [loading, setLoading] = useState(false);
  const [orderUrl, setOrderUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { status } = useZaloPayOrder(orderId, open);

  // track which orderId we've already notified about to avoid duplicate toasts
  const lastNotifiedOrderRef = useRef<string | null>(null);

  const dongTot = parseNumberFromFormatted(amount) || 0;

  const handlePreset = (val: number) => {
    setAmount(val.toString());
    setDisplayAmount(formatNumberWithDots(val));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\./g, ''); // Remove dots for processing
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    setAmount(value);
    setDisplayAmount(formatNumberWithDots(value));
  };

  const handleTopup = async () => {
    if (!amount) return;
    setLoading(true);
    setOrderUrl(null);

    try {
      const res = await zaloPayServices.createZaloPayOrder({
        amount: parseNumberFromFormatted(amount),
        description: "Nạp xu vào ví",
      });
      console.log("ZaloPay create order response:", res.data.order_url);
      if (res?.data?.order_url && res?.data?.orderId) {
        setOrderUrl(res.data.order_url);
        setOrderId(res.data.orderId);
        setOpen(true);
      } else {
        toast.error("Không nhận được order_url từ server!");
      }
    } catch {
      toast.error("Có lỗi khi tạo giao dịch nạp tiền!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "success") {
      setOpen(false);
      const depositAmount = parseNumberFromFormatted(amount);
      useAuthStore.getState().updateUser({
        wallet: {
          balance: (useAuthStore.getState().user?.wallet.balance ?? 0) + depositAmount,
          totalDeposited: (useAuthStore.getState().user?.wallet.totalDeposited ?? 0) + depositAmount
        }
      });
      // Show a single success toast per orderId so we don't spam duplicates
      if (orderId && lastNotifiedOrderRef.current !== orderId) {
        if (depositAmount > 0) {
          toast.success(`Nạp tiền thành công: ${formatNumberWithDots(depositAmount)} đ`);
        } else {
          toast.success("Nạp tiền thành công");
        }
        lastNotifiedOrderRef.current = orderId;
      }
      // Clear order state and inputs
      setOrderUrl(null);
      setOrderId(null);
      setAmount("");
      setDisplayAmount("");
    }

    if (status === "fail") {
      // clear order state and notify (only once per orderId)
      if (orderId && lastNotifiedOrderRef.current !== orderId) {
        toast.error("Thanh toán thất bại. Vui lòng thử lại.");
        lastNotifiedOrderRef.current = orderId;
      }
      setOrderUrl(null);
      setOrderId(null);
    }
  }, [status, amount, orderId]);

  return (
    // Use padding-top instead of margin-top so the layout can shrink and the inner container can grow.
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-[120px] pb-4 px-4">
      <div className="max-w-md mx-auto flex-1 flex flex-col">
        {/* Header compact */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl shadow-lg mb-4 group transition-all duration-300 hover:scale-105">
            <FaWallet className="text-white text-lg" />
          </div>
          <h1 className="text-2xl font-light text-gray-900 mb-1 tracking-tight">
            Nạp tiền
          </h1>
          <p className="text-gray-500 text-xs font-medium">
            Thanh toán đơn giản và bảo mật
          </p>
        </div>

        {/* Main Card - Flexible height */}
        {/* Allow the card to scroll on small screens instead of clipping content */}
        <Card className="rounded-2xl shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm overflow-auto flex-1 flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col space-y-5 min-h-0">
            {/* Tabs compact */}
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-gray-100 rounded-xl p-1 h-10">
                <TabsTrigger
                  value="cash"
                  className="rounded-lg py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 flex items-center gap-2"
                >
                  <BsCashCoin className="text-sm" />
                  Tiền mặt
                </TabsTrigger>
                <TabsTrigger
                  value="dongtot"
                  className="rounded-lg py-2 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 flex items-center gap-2"
                >
                  <FaCoins className="text-sm" />
                  Đồng Tốt
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <TabsContent value="cash" className="mt-4 space-y-4 flex-1">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-3 text-xs font-medium">
                    Chọn số tiền nạp
                  </label>

                  {/* Preset buttons - Compact grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {PRESET_AMOUNTS.map((val) => (
                      <Button
                        key={val}
                        type="button"
                        variant="outline"
                        className={`h-10 rounded-xl font-medium text-xs transition-all duration-200 border group ${amount === val.toString()
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        onClick={() => handlePreset(val)}
                      >
                        <span>{formatNumberWithDots(val)} đ</span>
                      </Button>
                    ))}
                  </div>

                  {/* Custom amount input */}
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Hoặc nhập số tiền tùy chỉnh"
                      value={displayAmount}
                      onChange={handleAmountChange}
                      disabled={loading || orderUrl !== null}
                      className="h-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 pl-4 pr-14 text-sm font-medium placeholder:text-gray-400 transition-all duration-200"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium bg-white px-2 py-1 rounded-md border border-gray-200">
                      VNĐ
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dongtot" className="mt-4 space-y-4 flex-1">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-3 text-xs font-medium">
                    Số Đồng Tốt muốn quy đổi
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Nhập số Đồng Tốt"
                      value={displayAmount}
                      onChange={handleAmountChange}
                      disabled={loading || orderUrl !== null}
                      className="h-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 pl-4 pr-12 text-sm font-medium placeholder:text-gray-400 transition-all duration-200"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <FaCoins className="text-gray-500 text-sm" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Summary Card - Compact */}
            {dongTot > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  Chi tiết giao dịch
                </h3>
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <FaCoins className="text-gray-600 text-sm" />
                      Đồng Tốt nhận được
                    </span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatNumberWithDots(dongTot)} ĐT
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button - Always at bottom */}
            <div className="mt-auto">
              <Button
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                onClick={handleTopup}
                disabled={!amount || loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <img src={ZaloPayLogo} alt="ZaloPay" className="h-5 w-5" />
                    <span>Thanh toán qua ZaloPay</span>
                    <TbArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              {/* Security Notice - Inline */}
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                <FaShieldAlt className="text-xs" />
                <span>Giao dịch được mã hóa SSL 256-bit</span>
              </div>
            </div>

            {/* Payment Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="sm:max-w-sm rounded-2xl p-6 border-0 shadow-2xl">
                <DialogHeader className="text-center">
                  <DialogTitle className="text-lg font-semibold text-gray-900 mb-3">
                    Quét mã QR để thanh toán
                  </DialogTitle>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <img src={ZaloPayLogo} alt="ZaloPay" className="h-6" />
                    <span className="text-sm text-gray-600 font-medium">ZaloPay</span>
                  </div>
                </DialogHeader>

                <div className="space-y-4">
                  <PaymentQR orderUrl={orderUrl} />
                  <Button
                    variant="outline"
                    className="w-full rounded-xl h-10 font-medium border border-gray-200 hover:bg-gray-50 text-sm"
                    onClick={() => setOpen(false)}
                  >
                    Đóng
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Footer compact */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            Bằng việc tiếp tục, bạn đồng ý với
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Điều khoản
            </a>
            và
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Chính sách
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletTopupPage;
