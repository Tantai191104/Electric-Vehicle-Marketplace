import React, { useRef } from "react";
import { formatTime } from "@/utils/date";
import type { Message } from "@/types/chatType";
import { useAuthStore } from "@/store/auth";

interface ChatMessagesProps {
    messages: Message[];
    darkMode?: boolean; // optional để bật/tắt dark
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
    messages,
    darkMode = true,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();

    const shouldGroupWithPrevious = (
        currentMsg?: Message,
        previousMsg?: Message
    ): boolean => {
        if (!currentMsg || !previousMsg) return false;
        if (currentMsg.senderId !== previousMsg.senderId) return false;

        const timeDiff =
            new Date(currentMsg.createdAt).getTime() -
            new Date(previousMsg.createdAt).getTime();
        return timeDiff < 5 * 60 * 1000; // 5 phút
    };

    return (
        <div
            ref={containerRef}
            className={`flex-1 overflow-y-auto ${darkMode ? "bg-gray-900" : "bg-white"
                } p-2`}
        >
            {messages.map((msg, index) => {
                const isMine = msg.senderId === user?._id;
                const previousMsg = index > 0 ? messages[index - 1] : undefined;
                const isGrouped = shouldGroupWithPrevious(msg, previousMsg);
                const nextMsg =
                    index < messages.length - 1 ? messages[index + 1] : undefined;
                const isLastInGroup = nextMsg
                    ? !shouldGroupWithPrevious(nextMsg, msg)
                    : true;

                return (
                    <div
                        key={msg._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"
                            } ${isGrouped ? "mt-1" : "mt-3"}`}
                    >
                        <div
                            className={`max-w-[75%] px-4 py-2.5 ${isMine
                                    ? darkMode
                                        ? "bg-blue-600 text-white"
                                        : "bg-blue-500 text-white"
                                    : darkMode
                                        ? "bg-gray-800 text-gray-200 border border-gray-700"
                                        : "bg-gray-100 text-gray-900 border border-gray-200"
                                } ${isGrouped && !isLastInGroup
                                    ? isMine
                                        ? "rounded-2xl rounded-br-md"
                                        : "rounded-2xl rounded-bl-md"
                                    : isGrouped && isLastInGroup
                                        ? isMine
                                            ? "rounded-2xl rounded-tr-md"
                                            : "rounded-2xl rounded-tl-md"
                                        : !isGrouped && !isLastInGroup
                                            ? isMine
                                                ? "rounded-2xl rounded-br-md"
                                                : "rounded-2xl rounded-bl-md"
                                            : "rounded-2xl"
                                }`}
                        >
                            {/* Nếu có file thì render file */}
                            {msg.files && msg.files.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {msg.files.map((file) =>
                                        file.type.startsWith("image/") ? (
                                            <img
                                                key={file._id}
                                                src={file.url}
                                                alt={file.name}
                                                className="max-h-48 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <a
                                                key={file._id}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm underline text-blue-300"
                                            >
                                                📎 {file.name}
                                            </a>
                                        )
                                    )}
                                </div>
                            )}

                            {/* Nếu có text thì render text */}
                            {msg.text && (
                                <p className="text-sm leading-relaxed break-words">
                                    {msg.text}
                                </p>
                            )}

                            {/* Thời gian */}
                            {isLastInGroup && (
                                <span
                                    className={`text-xs mt-1 block ${isMine
                                            ? darkMode
                                                ? "text-blue-200"
                                                : "text-blue-100"
                                            : darkMode
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                        }`}
                                >
                                    {formatTime(new Date(msg.createdAt))}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};
