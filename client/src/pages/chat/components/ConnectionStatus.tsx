import React from "react";
import { Button } from "@/components/ui/button";
import { LucideWifiOff, LucideRefreshCw, LucideBug } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  onRetryConnection: () => void;
  onDebug?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  error,
  onRetryConnection,
  onDebug
}) => {
  if (isConnected && !error) return null;

  return (
    <div className="fixed top-[120px] left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <LucideWifiOff size={16} />
        <span>
          {error || "Mất kết nối chat. Không thể nhận tin nhắn mới."}
        </span>
      </div>
      <div className="flex gap-2">
        {onDebug && (
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-red-500 border-white hover:bg-red-50"
            onClick={onDebug}
          >
            <LucideBug size={16} className="mr-1" />
            Kiểm tra
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-red-500 border-white hover:bg-red-50"
          onClick={onRetryConnection}
        >
          <LucideRefreshCw size={16} className="mr-1" />
          Kết nối lại
        </Button>
      </div>
    </div>
  );
};