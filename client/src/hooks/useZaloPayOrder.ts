import { useEffect, useState } from "react";
import { zaloPayServices } from "@/services/walletServices";

export function useZaloPayOrder(orderId: string | null, open: boolean) {
  const [status, setStatus] = useState<"pending" | "success" | "fail" | null>(
    null
  );
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!orderId || !open) return;

    setStatus("pending");

    const checkStatus = async () => {
      try {
        setChecking(true);
        const res = await zaloPayServices.checkZaloPayOrder(orderId);
        if (res?.data?.status === "success") {
          setStatus("success");
        } else if (res?.data?.status === "fail") {
          setStatus("fail");
        } else {
          setStatus("pending");
        }
      } catch (err) {
        console.error("❌ Lỗi khi check ZaloPay:", err);
      } finally {
        setChecking(false);
      }
    };

    // gọi ngay lần đầu
    checkStatus();

    const interval = setInterval(async () => {
      await checkStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, open]);

  // stop polling khi đã success/fail
  useEffect(() => {
    if (status === "success" || status === "fail") {
      console.log("✅ Dừng polling vì đã có kết quả:", status);
    }
  }, [status]);

  return { status, checking };
}
