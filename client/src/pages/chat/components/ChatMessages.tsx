import React, { useRef } from "react";
import { formatTime } from "@/utils/date";
import type { Message } from "@/types/chatType";
import { useAuthStore } from "@/store/auth";

interface ChatMessagesProps {
    messages: Message[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 bg-white">
            <div className="space-y-3">
                {messages.map((msg) => {
                    const isMine = msg.senderId === user?._id;
                    return (
                        <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-900 border border-gray-200"
                                    }`}
                            >
                                <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                <span
                                    className={`text-xs mt-1 block ${isMine ? "text-blue-100" : "text-gray-500"}`}
                                >
                                    {formatTime(new Date(msg.createdAt))}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};
