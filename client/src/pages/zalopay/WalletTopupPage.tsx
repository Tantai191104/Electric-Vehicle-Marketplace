import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaCoins } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { FaWallet } from "react-icons/fa";
import PaymentQR from "./components/PaymentQR";
import { zaloPayServices } from "@/services/walletServices";
import ZaloPayLogo from "@/assets/Zalopay.svg";
import { useZaloPayOrder } from "@/hooks/useZaloPayOrder";
import { toast } from "sonner";

const PRESET_AMOUNTS = [25000, 50000, 100000, 500000, 1000000];

const WalletTopupPage: React.FC = () => {
  const [tab, setTab] = useState("cash");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderUrl, setOrderUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { status, checking } = useZaloPayOrder(orderId, open);

  const dongTot = Number(amount) || 0;
  const vat = Math.round(dongTot * 0.1);
  const dongTotAfterTax = dongTot - vat;

  const handlePreset = (val: number) => setAmount(val.toString());

  const handleTopup = async () => {
    if (!amount) return;
    setLoading(true);
    setOrderUrl(null);

    try {
      const res = await zaloPayServices.createZaloPayOrder({
        amount: Number(amount),
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
      setAmount("");
      toast.success("Thanh toán thành công! Ví đã được cộng tiền.");
    }
    if (status === "fail") {
      toast.error("Thanh toán thất bại. Vui lòng thử lại.");
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50 flex items-center justify-center py-16 px-4">
      <Card className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl border border-gray-100 bg-white/90 backdrop-blur">
        <CardHeader className="flex flex-col items-center gap-2 pb-2">
          <BsCashCoin className="text-yellow-500 text-5xl drop-shadow" />
          <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Nạp tiền vào Ví
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Thanh toán an toàn qua
            <span className="font-semibold text-blue-600">ZaloPay</span>
          </p>
        </CardHeader>

        <CardContent className="mt-4 space-y-6">
          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-gray-100 rounded-full p-1">
              <TabsTrigger
                value="cash"
                className="rounded-full py-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow"
              >
                <BsCashCoin /> Tiền mặt
              </TabsTrigger>
              <TabsTrigger
                value="dongtot"
                className="rounded-full py-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow"
              >
                <FaCoins className="text-yellow-600 mr-1" /> Đồng Tốt
              </TabsTrigger>
            </TabsList>

            {/* Tab: Cash */}
            <TabsContent value="cash" className="mt-3 space-y-4">
              <div>
                <label className="font-medium text-gray-700 mb-2 block">
                  Số tiền muốn nạp
                </label>
                <div className="flex flex-wrap gap-2 pb-2 mb-2">
                  {PRESET_AMOUNTS.map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant="outline"
                      className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-all ${amount === val.toString()
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      onClick={() => handlePreset(val)}
                    >
                      {val.toLocaleString()} đ
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  min={10000}
                  step={1000}
                  placeholder="Nhập số tiền (VND)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading || orderUrl !== null}
                  className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </TabsContent>

            {/* Tab: Đồng Tốt */}
            <TabsContent value="dongtot" className="mt-3 space-y-4">
              <div>
                <label className="font-medium text-gray-700 mb-2 block">
                  Số Đồng Tốt muốn quy đổi
                </label>
                <Input
                  type="number"
                  min={10000}
                  step={1000}
                  placeholder="Nhập số Đồng Tốt"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading || orderUrl !== null}
                  className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Summary */}
          <div className="bg-yellow-50 rounded-2xl p-5 shadow-inner border border-yellow-100">
            <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
              <FaCoins className="text-yellow-500" /> Tóm tắt giao dịch
            </h3>
            <Separator className="mb-3" />
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-gray-600">Số tiền nạp</span>
              <span className="font-semibold text-right">
                {dongTot.toLocaleString()} đ
              </span>
              <span className="text-gray-600">Thuế GTGT (10%)</span>
              <span className="font-semibold text-right">
                {vat.toLocaleString()} đ
              </span>
              <span className="text-gray-600">Đồng Tốt nhận</span>
              <span className="font-bold text-yellow-700 text-right">
                {dongTotAfterTax > 0 ? dongTotAfterTax.toLocaleString() : 0} ĐT
              </span>
            </div>
          </div>

          {/* Action */}
          <Button
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-xl py-3 text-lg shadow-lg transition-all flex items-center justify-center gap-2"
            onClick={handleTopup}
            disabled={!amount || loading}
          >
            <FaWallet /> {loading ? "Đang xử lý..." : "Nạp qua ZaloPay"}
          </Button>

          {/* Popup QR */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-sm rounded-2xl p-6 flex flex-col items-center gap-4 border border-blue-100 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-center text-lg font-bold text-gray-900 mb-2">
                  Quét QR để thanh toán
                </DialogTitle>
              </DialogHeader>
              <img
                src={ZaloPayLogo}
                alt="ZaloPay"
                className="h-10 mb-2 drop-shadow"
                style={{ objectFit: "contain" }}
              />
              <PaymentQR orderUrl={orderUrl} />
              <p className="text-xs text-gray-500 text-center mt-2">
                {checking
                  ? " Đang kiểm tra trạng thái giao dịch..."
                  : status === "pending"
                    ? "Chờ thanh toán..."
                    : status === "fail"
                      ? " Thanh toán thất bại"
                      : ""}
              </p>
              <Button
                variant="outline"
                className="w-full rounded-lg"
                onClick={() => setOpen(false)}
              >
                Đóng
              </Button>
            </DialogContent>
          </Dialog>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Khi thanh toán, bạn đồng ý với
            <a href="#" className="text-blue-600 underline">
              Điều khoản sử dụng
            </a>
            của Chợ Tốt
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletTopupPage;
