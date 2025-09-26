import React, { useRef } from "react";
import { formatTime } from "@/utils/date";

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
}

interface ChatMessagesProps {
    messages: Message[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 bg-white">
            <div className="space-y-3">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.senderId === "me"
                                ? "bg-blue-500 text-white"
                                : "bg-gray- 100 text-gray-900 border border-gray-200"
                                }`}
                        >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <span
                                className={`text-xs mt-1 block ${msg.senderId === "me" ? "text-blue-100" : "text-gray-500"}`}
                            >
                                {formatTime(msg.timestamp)}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};
