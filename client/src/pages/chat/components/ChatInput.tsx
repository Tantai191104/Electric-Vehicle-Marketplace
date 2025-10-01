import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Send, X } from "lucide-react";

interface ChatInputProps {
    value: string;
    onChange: (val: string) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onSendFile: (files: File[], text?: string) => void; // gửi nhiều file kèm text
}

export const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSend,
    onKeyDown,
    onSendFile,
}) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setSelectedFiles((prev) => [...prev, ...files]); // thêm vào list
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSend = () => {
        if (selectedFiles.length > 0) {
            onSendFile(selectedFiles, value.trim() || undefined);
            setSelectedFiles([]);
            onChange(""); // reset text
        } else {
            onSend();
        }
    };

    return (
        <div className="bg-gray-800 border-t border-gray-700 p-4 rounded-b-2xl">
            {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedFiles.map((file, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg"
                        >
                            <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="h-12 w-12 object-cover rounded"
                            />
                            <span className="text-sm text-gray-200 truncate max-w-[120px]">
                                {file.name}
                            </span>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRemoveFile(idx)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-lg hover:bg-gray-700 text-gray-200"
                    onClick={() => document.getElementById("fileInput")?.click()}
                >
                    <Image className="h-5 w-5" />
                </Button>
                <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={
                        selectedFiles.length > 0
                            ? "Nhập chú thích cho ảnh..."
                            : "Nhập tin nhắn..."
                    }
                    className="flex-1 rounded-full border border-gray-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-700 text-gray-100 h-10 text-sm placeholder-gray-400"
                />

                <Button
                    onClick={handleSend}
                    disabled={!value.trim() && selectedFiles.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 p-0 rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};
