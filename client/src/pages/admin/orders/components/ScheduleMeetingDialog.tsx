import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { adminServices } from "@/services/adminServices";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { Order } from "@/types/orderType";

interface ScheduleMeetingDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ScheduleMeetingDialog({
  order,
  isOpen,
  onClose,
  onSuccess,
}: ScheduleMeetingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingAddress, setMeetingAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) return;

    // Validate at least one field is filled
    if (!meetingTime && !meetingLocation && !meetingAddress) {
      toast.error("Vui lòng nhập ít nhất một thông tin cuộc hẹn");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: {
        meetingTime?: string;
        meetingLocation?: string;
        meetingAddress?: string;
      } = {};

      if (meetingTime) payload.meetingTime = meetingTime;
      if (meetingLocation) payload.meetingLocation = meetingLocation;
      if (meetingAddress) payload.meetingAddress = meetingAddress;

      const response = await adminServices.scheduleDepositMeeting(order._id, payload);

      if (response.success) {
        toast.success("Lên lịch cuộc hẹn thành công", {
          description: "Thông tin đã được gửi đến người mua và người bán qua email",
        });
        
        // Reset form
        setMeetingTime("");
        setMeetingLocation("");
        setMeetingAddress("");
        
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
        message?: string;
      };
      
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || err.message || "Có lỗi xảy ra";
      toast.error("Không thể lên lịch cuộc hẹn", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Lên lịch cuộc hẹn
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Order Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Đơn hàng: <span className="font-semibold text-gray-900">{order.orderNumber}</span></p>
            <p className="text-sm text-gray-600">Sản phẩm: <span className="font-semibold text-gray-900">{order.productId.title}</span></p>
          </div>

          {/* Meeting Time */}
          <div className="space-y-2">
            <Label htmlFor="meetingTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              Thời gian gặp mặt
            </Label>
            <Input
              id="meetingTime"
              type="datetime-local"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="w-full"
              placeholder="Chọn thời gian"
            />
            <p className="text-xs text-gray-500">Định dạng: YYYY-MM-DD HH:MM (ví dụ: 2024-01-15 10:00)</p>
          </div>

          {/* Meeting Location */}
          <div className="space-y-2">
            <Label htmlFor="meetingLocation" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              Địa điểm
            </Label>
            <Input
              id="meetingLocation"
              type="text"
              value={meetingLocation}
              onChange={(e) => setMeetingLocation(e.target.value)}
              placeholder="Ví dụ: Showroom Hà Nội, Văn phòng trung tâm"
              className="w-full"
            />
          </div>

          {/* Meeting Address */}
          <div className="space-y-2">
            <Label htmlFor="meetingAddress" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              Địa chỉ chi tiết
            </Label>
            <Textarea
              id="meetingAddress"
              value={meetingAddress}
              onChange={(e) => setMeetingAddress(e.target.value)}
              placeholder="Ví dụ: 123 Nguyễn Trãi, Thanh Xuân, Hà Nội"
              className="w-full min-h-[80px]"
            />
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Lưu ý:</strong> Bạn cần nhập ít nhất một thông tin (thời gian, địa điểm hoặc địa chỉ). 
              Thông tin sẽ được gửi đến cả người mua và người bán qua email.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                "Xác nhận lên lịch"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
