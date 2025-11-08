import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onSendFile: (files: File[], text?: string) => void;
  disabled?: boolean;
  isSending?: boolean; // Thêm prop isSending từ parent component
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyDown,
  onSendFile,
  disabled = false,
  isSending = false // Sử dụng giá trị từ parent
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check file size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error(`File quá lớn: ${oversizedFiles[0].name}`, {
        description: 'Kích thước tối đa là 5MB'
      });
      e.target.value = '';
      return;
    }

    // Auto-send files immediately (no preview/confirm step)
    const fileArray = Array.from(files);
    e.target.value = '';
    try {
      setIsUploading(true);
      await onSendFile(fileArray, value);
      onChange('');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Không thể tải file lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendClick = () => {
    if (!value.trim() || disabled || isSending || isUploading) return;
    onSend();
    textareaRef.current?.focus();
  };

  // Handle keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Gọi onKeyDown từ props nếu có
    if (onKeyDown) {
      onKeyDown(e);
      return;
    }

    // Default behavior if no onKeyDown provided
    if (e.key === "Enter" && !e.shiftKey && !isSending && !isUploading) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  // Auto-resize textarea as user types
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    onChange(textarea.value);

    // Reset height to auto to get correct scrollHeight
    textarea.style.height = 'auto';

    // Set new height based on scrollHeight (with max height)
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  };

  // Thêm timer để đảm bảo nút gửi không bị kẹt ở trạng thái loading
  useEffect(() => {
    // Nếu đang gửi tin nhắn, đặt một timeout an toàn
    if (isSending) {
      const safetyTimer = setTimeout(() => {
        console.log("Safety timer triggered to reset input state");
        // Không thay đổi state isSending vì nó được quản lý ở component cha
        // Nhưng bạn có thể gọi một prop callback để thông báo nếu cần
      }, 5000); // Timeout dài hơn để đảm bảo không can thiệp vào quy trình bình thường

      return () => clearTimeout(safetyTimer);
    }
  }, [isSending]);

  return (
    <div className={`flex items-end gap-2 ${disabled ? 'opacity-50' : ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
      />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={handleFileSelect}
        disabled={disabled || isUploading || isSending}
        className="text-gray-400 hover:text-gray-300 hover:bg-gray-700"
      >
        <Paperclip className="w-4 h-4" />
      </Button>

      {/* files are sent immediately on selection; no preview UI */}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || isUploading || isSending}
        placeholder={
          disabled ? "Đang kết nối..." :
            isUploading ? "Đang tải file..." :
              isSending ? "Đang gửi tin nhắn..." :
                "Nhập tin nhắn..."
        }
        className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed min-h-[40px] max-h-[120px] overflow-auto"
        style={{ height: '40px' }} // Initial height
      />

      <Button
        onClick={handleSendClick}
        disabled={disabled || isUploading || isSending || !value.trim()}
        className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-colors"
      >
        {isSending ? (
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};
