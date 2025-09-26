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

export const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, onKeyDown }) => (
    <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100 text-gray-500"><Paperclip className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100 text-gray-500"><Image className="h-4 w-4" /></Button>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown} // Thay onKeyPress bằng onKeyDown
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-full border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50 h-10 text-sm"
            />
            <Button
                onClick={onSend}
                disabled={!value.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white h-10 w-10 p-0 rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send className="h-4 w-4" />
            </Button>   
        </div>
    </div>
);
