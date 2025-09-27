import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Image, Send } from "lucide-react";

interface ChatInputProps {
    value: string;
    onChange: (val: string) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSend,
    onKeyDown,
}) => (
    <div className="bg-gray-800 border-t border-gray-700 p-4 rounded-b-2xl">
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-lg hover:bg-gray-700 text-gray-200"
            >
                <Paperclip className="h-5 w-5" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-lg hover:bg-gray-700 text-gray-200"
            >
                <Image className="h-5 w-5" />
            </Button>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-full border border-gray-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-700 text-gray-100 h-10 text-sm placeholder-gray-400"
            />
            <Button
                onClick={onSend}
                disabled={!value.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 p-0 rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send className="h-5 w-5" />
            </Button>
        </div>
    </div>
);
