import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import { useChat } from "@/hooks/useChat";
import type { Conversation, Message } from "@/types/chatType";
import { useAuthStore } from "@/store/auth";
import FixedHeader from "@/layouts/components/base/FixedHeader";

export const ChatPage: React.FC = () => {
    const { id: conversationId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const { user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);

    const {
        conversations,
        messages,
        sendMessage,
        isLoadingConversations,
        isLoadingMessages,
    } = useChat(selectedConversationId || undefined);

    const selectedConversation = Array.isArray(conversations)
        ? conversations.find((conv: Conversation) => conv._id === selectedConversationId)
        : null;

    // Kiểm tra conversation từ URL có tồn tại
    const conversationExists = conversationId && selectedConversation;
    const shouldShowLoading =
        isLoadingConversations ||
        (conversationId && !conversationExists && !isLoadingConversations);

    useEffect(() => {
        if (conversationId) {
            setSelectedConversationId(conversationId);
        } else if (
            !conversationId &&
            !isLoadingConversations &&
            Array.isArray(conversations) &&
            conversations.length > 0
        ) {
            const firstConv = conversations[0];
            setSelectedConversationId(firstConv._id);
            navigate(`/chat/${firstConv._id}`, { replace: true });
        } else if (
            !conversationId &&
            !isLoadingConversations &&
            Array.isArray(conversations) &&
            conversations.length === 0
        ) {
            setSelectedConversationId(null);
        }
    }, [conversationId, conversations, navigate, isLoadingConversations]);

    // Socket.IO setup
    useEffect(() => {
        if (!user) return;

        socketRef.current = io(import.meta.env.VITE_API_URL);

        socketRef.current.emit("join", user._id);

        socketRef.current.on("receive_message", (msg: Message) => {
            if (selectedConversationId && msg.conversationId === selectedConversationId) {
                console.log("Received new message:", msg);
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user, selectedConversationId]);

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversationId(conversation._id);
        navigate(`/chat/${conversation._id}`);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversationId) return;

        sendMessage(newMessage.trim());
        setNewMessage("");

        if (socketRef.current) {
            socketRef.current.emit("send_message", {
                conversationId: selectedConversationId,
                text: newMessage.trim(),
                senderId: user?._id,
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div>
            <FixedHeader />
            <div className="flex h-[calc(100vh-120px)] mt-[120px] bg-gray-900 text-gray-100">
                {/* Sidebar */}
                <ChatSidebar
                    conversations={Array.isArray(conversations) ? conversations : []}
                    currentUserId={user?._id || ""}
                    selectedConversation={selectedConversation}
                    selectedConversationId={selectedConversationId || undefined}
                    onSelectConversation={handleSelectConversation}
                />

                {/* Chat area */}
                <div className="flex-1 flex flex-col bg-gray-800">
                    {shouldShowLoading ? (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-gray-300 text-sm">
                                    {isLoadingConversations
                                        ? "Đang tải cuộc trò chuyện..."
                                        : "Đang tìm cuộc trò chuyện..."}
                                </p>
                            </div>
                        </div>
                    ) : selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-gray-700">
                                <ChatHeader
                                    user={{
                                        id: selectedConversation.sellerId._id,
                                        name: selectedConversation.sellerId.name,
                                        avatar: selectedConversation.sellerId.avatar,
                                    }}
                                />
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-900">
                                {isLoadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            <p className="text-gray-300 text-xs">Đang tải tin nhắn...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <ChatMessages messages={messages} />
                                )}
                            </div>

                            {/* Input */}
                            <div className="px-4 py-3 border-t border-gray-700 bg-gray-800">
                                <ChatInput
                                    value={newMessage}
                                    onChange={setNewMessage}
                                    onSend={handleSendMessage}
                                    onKeyDown={handleKeyDown}

                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                                <div className="text-4xl mb-3 text-gray-500">💬</div>
                                <p className="text-gray-400 text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );

};
