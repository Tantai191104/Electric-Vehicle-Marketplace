
import { useEffect, useState } from "react";
import { violationServices } from "@/services/violationServices";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  User,
  FileText,
  Calendar,
} from "lucide-react";

interface Violation {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  action: "warning" | "suspension" | "ban";
  status: "pending" | "resolved";
  reportedBy?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  reportedAt?: string;
  resolvedBy?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  resolvedAt?: string;
  adminNotes?: string;
}

export default function ViolationManagePage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    setLoading(true);
    try {
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
      const userId = typeof violation.userId === "string" ? violation.userId : violation.userId._id;
      await violationServices.updateViolation(userId, violation._id, {
        status: "resolved",
        resolvedAt: new Date().toISOString(),
      });
      toast.success("Đã xử lý vi phạm!");
      fetchViolations();
      setShowDetailDialog(false);
    } catch {
      toast.error("Xử lý thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      low: { label: "Thấp", className: "bg-blue-100 text-blue-700 border-blue-300" },
      medium: { label: "Trung bình", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
      high: { label: "Cao", className: "bg-red-100 text-red-700 border-red-300" },
    };
    const { label, className } = config[severity as keyof typeof config] || config.low;
    return <Badge className={className}>{label}</Badge>;
  };

  const getActionBadge = (action: string) => {
    const config = {
      warning: { label: "Cảnh cáo", className: "bg-orange-100 text-orange-700 border-orange-300" },
      suspension: { label: "Tạm khóa", className: "bg-purple-100 text-purple-700 border-purple-300" },
      ban: { label: "Cấm vĩnh viễn", className: "bg-red-100 text-red-700 border-red-300" },
    };
    const { label, className } = config[action as keyof typeof config] || config.warning;
    return <Badge className={className}>{label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === "resolved") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Đã xử lý
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-300">
        <Clock className="w-3 h-3 mr-1" />
        Chờ xử lý
      </Badge>
    );
  };

  const getViolationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      spam: "Spam",
      fake_product: "Sản phẩm giả mạo",
      fraud: "Lừa đảo",
      inappropriate: "Nội dung không phù hợp",
      other: "Khác",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-600" />
                Quản lý Vi phạm
              </h1>
              <p className="text-gray-600 mt-1">
                Theo dõi và xử lý các vi phạm của người dùng
              </p>
            </div>
            <Button onClick={fetchViolations} variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              Làm mới
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng vi phạm</p>
                    <p className="text-3xl font-bold text-gray-900">{violations.length}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chờ xử lý</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {violations.filter((v) => v.status === "pending").length}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đã xử lý</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {violations.filter((v) => v.status === "resolved").length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Violations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Danh sách vi phạm
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              ) : violations.length === 0 ? (
                <div className="py-16 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Không có vi phạm nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {violations.map((v) => (
                    <div
                      key={v._id}
                      className="group p-5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedViolation(v);
                        setShowDetailDialog(true);
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start gap-3 flex-wrap">
                            <AlertTriangle
                              className={`w-5 h-5 mt-0.5 ${v.severity === "high"
                                ? "text-red-500"
                                : v.severity === "medium"
                                  ? "text-yellow-500"
                                  : "text-blue-500"
                                }`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {getViolationTypeLabel(v.type)}
                                </h3>
                                {getStatusBadge(v.status)}
                                {getSeverityBadge(v.severity)}
                                {getActionBadge(v.action)}
                              </div>
                              <p className="text-gray-700 text-sm line-clamp-2">
                                {v.description}
                              </p>
                            </div>
                          </div>

                          {/* User Info */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="font-medium">
                              {typeof v.userId === "string"
                                ? v.userId
                                : `${v.userId.name} (${v.userId.email})`}
                            </span>
                          </div>

                          {/* Timestamps */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {v.reportedAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Báo cáo: {new Date(v.reportedAt).toLocaleDateString("vi-VN")}
                              </div>
                            )}
                            {v.resolvedAt && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3 h-3" />
                                Xử lý: {new Date(v.resolvedAt).toLocaleDateString("vi-VN")}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        {v.status !== "resolved" && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(v);
                            }}
                            disabled={processingId === v._id}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2 shrink-0"
                          >
                            {processingId === v._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Đánh dấu đã xử lý
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Chi tiết Vi phạm
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về vi phạm và người dùng
            </DialogDescription>
          </DialogHeader>

          {selectedViolation && (
            <div className="space-y-4 py-4">
              {/* Status & Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(selectedViolation.status)}
                {getSeverityBadge(selectedViolation.severity)}
                {getActionBadge(selectedViolation.action)}
              </div>

              <Separator />

              {/* Violation Info */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Loại vi phạm</label>
                  <p className="text-gray-900 mt-1">
                    {getViolationTypeLabel(selectedViolation.type)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Mô tả</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {selectedViolation.description}
                  </p>
                </div>
              </div>

              <Separator />

              {/* User Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Thông tin người vi phạm
                </h4>
                {typeof selectedViolation.userId === "object" && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tên:</span>
                      <span className="text-sm font-medium">{selectedViolation.userId.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium">{selectedViolation.userId.email}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reported By */}
              {selectedViolation.reportedBy && typeof selectedViolation.reportedBy === "object" && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Người báo cáo
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tên:</span>
                        <span className="text-sm font-medium">
                          {selectedViolation.reportedBy.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">
                          {selectedViolation.reportedBy.email}
                        </span>
                      </div>
                      {selectedViolation.reportedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Thời gian:</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedViolation.reportedAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Resolved Info */}
              {selectedViolation.status === "resolved" && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Thông tin xử lý
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg space-y-2">
                      {selectedViolation.resolvedBy &&
                        typeof selectedViolation.resolvedBy === "object" && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Người xử lý:</span>
                              <span className="text-sm font-medium">
                                {selectedViolation.resolvedBy.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Email:</span>
                              <span className="text-sm font-medium">
                                {selectedViolation.resolvedBy.email}
                              </span>
                            </div>
                          </>
                        )}
                      {selectedViolation.resolvedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Thời gian xử lý:</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedViolation.resolvedAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Admin Notes */}
              {selectedViolation.adminNotes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Ghi chú của Admin</label>
                    <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                      {selectedViolation.adminNotes}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Đóng
            </Button>
            {selectedViolation && selectedViolation.status !== "resolved" && (
              <Button
                onClick={() => handleResolve(selectedViolation)}
                disabled={processingId === selectedViolation._id}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                {processingId === selectedViolation._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Đánh dấu đã xử lý
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
