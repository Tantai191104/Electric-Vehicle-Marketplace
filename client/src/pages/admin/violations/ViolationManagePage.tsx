
import { useEffect, useState } from "react";
import { violationServices } from "@/services/violationServices";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Violation {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  violationType: string;
  description: string;
  severity: "low" | "medium" | "high";
  action: "warning" | "suspension" | "ban";
  status: string;
  resolvedAt?: string;
  createdAt?: string;
}

export default function ViolationManagePage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      // API returns { success, data } or just array
      const res = await violationServices.getViolations();
      let list: Violation[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res?.data && Array.isArray(res.data)) {
        list = res.data;
      }
      setViolations(list);
    } catch {
      toast.error("Không thể tải danh sách vi phạm");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (violation: Violation) => {
    setProcessingId(violation._id);
    try {
      // userId may be object or string
      const userId = typeof violation.userId === "string" ? violation.userId : violation.userId._id;
      await violationServices.updateViolation(
        userId,
        violation._id,
        { status: "resolved", resolvedAt: new Date().toISOString() }
      );
      toast.success("Đã xử lý vi phạm!");
      fetchViolations();
    } catch {
      toast.error("Xử lý thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách vi phạm</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-gray-500">Đang tải...</div>
              ) : violations.length === 0 ? (
                <div className="py-12 text-center text-gray-500">Không có vi phạm nào</div>
              ) : (
                <div className="space-y-4">
                  {violations.map((v) => (
                    <div key={v._id} className="p-4 bg-white rounded-lg border border-gray-200 shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-red-600">{v.violationType}</div>
                        <div className="text-gray-800">{v.description}</div>
                        <div className="text-xs text-gray-500 mt-1">Mức độ: {v.severity} | Hành động: {v.action}</div>
                        <div className="text-xs text-gray-500">
                          User: <span className="font-semibold text-blue-600">
                            {typeof v.userId === "string"
                              ? v.userId
                              : `${v.userId.name} (${v.userId.email})`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Trạng thái: <span className="font-semibold">{v.status}</span></div>
                        {v.resolvedAt && (
                          <div className="text-xs text-green-600">Đã xử lý: {new Date(v.resolvedAt).toLocaleString()}</div>
                        )}
                        {v.createdAt && (
                          <div className="text-xs text-gray-400">Tạo lúc: {new Date(v.createdAt).toLocaleString()}</div>
                        )}
                      </div>
                      {v.status !== "resolved" && (
                        <Button
                          onClick={() => handleResolve(v)}
                          disabled={processingId === v._id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processingId === v._id ? "Đang xử lý..." : "Đánh dấu đã xử lý"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
