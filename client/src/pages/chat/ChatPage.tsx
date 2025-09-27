import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import type { Conversation } from "@/types/chatType";
import { chatService } from "@/services/chatServices";
import { useAuthStore } from "@/store/auth";
import type { Message } from "@/types/chatType";
export const ChatPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const { user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user) return;

        socketRef.current = io(import.meta.env.VITE_API_URL);

        // Join room theo userId
        socketRef.current.emit("join", user._id);

        // Lắng nghe tin nhắn realtime
        socketRef.current.on("receive_message", (msg: Message) => {
            if (selectedConversation && msg.conversationId === selectedConversation._id) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user, selectedConversation]);

    useEffect(() => {
        chatService
            .fetchConversations()
            .then((data) => {
                setConversations(data.items);
                if (data.items.length > 0) setSelectedConversation(data.items[0]);
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (!selectedConversation) return;
        chatService
            .fetchMessages(selectedConversation._id)
            .then((data) => setMessages(data.items))
            .catch(() => setMessages([]));
    }, [selectedConversation]);

    // 4️⃣ Gửi tin nhắn
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        try {
            // Gọi API để lưu message vào DB
            const savedMessage = await chatService.addMessage(
                selectedConversation._id,
                newMessage.trim()
            );

            // Emit Socket.IO để realtime
            socketRef.current?.emit("send_message", savedMessage);

            // Cập nhật local messages
            setMessages((prev) => [...prev, savedMessage]);
            setNewMessage("");
        } catch (err) {
            console.error("Gửi tin nhắn thất bại:", err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center py-6 px-4 mt-[80px]">
            <div className="w-full max-w-5xl h-[calc(100vh-180px)] bg-white rounded-3xl shadow-lg overflow-hidden flex border border-gray-100">
                <ChatSidebar
                    conversations={conversations}
                    currentUserId={user?._id || ""}
                    selectedConversation={selectedConversation}
                    onSelectConversation={setSelectedConversation}
                />
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            <ChatHeader
                                user={{
                                    id: selectedConversation.sellerId._id,
                                    name: selectedConversation.sellerId.name,
                                    avatar: selectedConversation.sellerId.avatar,
                                }}
                            />
                            <ChatMessages messages={messages} />
                            <ChatInput
                                value={newMessage}
                                onChange={setNewMessage}
                                onSend={handleSendMessage}
                                onKeyDown={handleKeyDown}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-white">
                            <div className="text-center">
                                <div className="text-4xl mb-3 text-gray-300">💬</div>
                                <p className="text-gray-500 text-sm">
                                    Chọn một cuộc trò chuyện để bắt đầu
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
