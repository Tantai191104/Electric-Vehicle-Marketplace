import React, { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import type { Message } from "@/types/chatType";
import { Check, Loader2 } from "lucide-react";

interface ChatMessagesProps {
    messages: Message[];
    isLoading?: boolean;
    messageStatusMap?: Record<string, boolean>; // Thêm prop này
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
    messages = [],
    isLoading = false,
    messageStatusMap = {} // Default empty object
}) => {
    const { user } = useAuthStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);


    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-300 text-xs">Đang tải tin nhắn...</p>
                </div>
            </div>
        );
    }

    if (!messages.length) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                    <p className="text-gray-400 text-sm">Hãy bắt đầu cuộc trò chuyện</p>
                </div>
            </div>
        );
    }

    // Group messages by date
    const groupedMessages: { [key: string]: Message[] } = {};
    messages.forEach(message => {
        const date = new Date(message.createdAt).toLocaleDateString('vi-VN');
        if (!groupedMessages[date]) {
            groupedMessages[date] = [];
        }
        groupedMessages[date].push(message);
    });

    // Sort dates
    const sortedDates = Object.keys(groupedMessages).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
    });


    return (
        <div className="flex flex-col space-y-3 py-1">
            {sortedDates.map(date => (
                <React.Fragment key={date}>
                    {/* Date separator */}
                    <div className="flex justify-center my-4">
                        <div className="px-4 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                            {date === new Date().toLocaleDateString('vi-VN') ? 'Hôm nay' : date}
                        </div>
                    </div>

                    {/* Messages for this date */}
                    {groupedMessages[date].map((message) => {
                        const isMyMessage = message.senderId === user?._id;
                        // Sử dụng messageStatusMap làm nguồn sự thật chính
                        const isLoading = messageStatusMap[message._id] === true || message.isPending;

                        return (
                            <div
                                key={message._id}
                                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end gap-2 max-w-[80%] ${isMyMessage ? 'flex-row-reverse' : ''}`}>
                                    <div
                                        className={`px-3 py-2 rounded-lg ${isMyMessage
                                            ? isLoading ? 'bg-yellow-600/60 text-white' : 'bg-yellow-600 text-white'
                                            : 'bg-gray-700 text-gray-100'
                                            }`}
                                    >
                                        <div className="break-words whitespace-pre-wrap">
                                            {message.text}

                                            {message.files && message.files.length > 0 && (
                                                <div className="mt-2 space-y-2">
                                                    {message.files.map((file, index) => (
                                                        <div key={index} className="flex items-center">
                                                            <a
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-300 hover:underline text-sm"
                                                            >
                                                                {file.name || 'File đính kèm'}
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Hiển thị trạng thái tin nhắn */}
                                        <div className="flex justify-end items-center space-x-1 mt-1">
                                            <span className="text-xs text-gray-300">
                                                {new Date(message.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {isMyMessage && (
                                                <>
                                                    {isLoading ? (
                                                        <Loader2 className="w-3 h-3 text-gray-300 animate-spin" />
                                                    ) : (
                                                        <Check className="w-3 h-3 text-gray-300" />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};
