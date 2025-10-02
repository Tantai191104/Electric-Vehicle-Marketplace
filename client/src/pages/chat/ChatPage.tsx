import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import { useChat } from "@/hooks/useChat";
import { useSocketChat } from "@/hooks/useSocketChat";
import type { Conversation, Message } from "@/types/chatType";
import { useAuthStore } from "@/store/auth";
import FixedHeader from "@/layouts/components/base/FixedHeader";
import { LucideMessageSquareMore } from "lucide-react";
import { ConnectionStatus } from "./components/ConnectionStatus";
export const ChatPage: React.FC = () => {
    const { id: conversationIdParam } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [messageStatusMap, setMessageStatusMap] = useState<Record<string, boolean>>({});
    const messageEndRef = useRef<HTMLDivElement>(null);

    const { conversations, messages: fetchedMessages, isLoadingConversations, isLoadingMessages } = useChat(selectedConversationId || undefined);

    // Tối ưu hóa onMessageStatusChange handler
    const { isConnected, error, sendMessage: socketSendMessage, markAsRead } = useSocketChat(
        selectedConversationId ? String(selectedConversationId) : undefined,
        {
            onMessageStatusChange: useCallback(
                ({ isSending, messageId }: { isSending: boolean; messageId: string }) => {
                    console.log(`Message status change: messageId=${messageId}, isSending=${isSending}`);
                    // Luôn cập nhật trạng thái của input
                    setIsSending(isSending);
                    
                    // Cập nhật trạng thái tin nhắn trong map
                    setMessageStatusMap(prev => ({
                        ...prev,
                        [messageId]: isSending
                    }));
                },
                []
            )
        }
    );

    const messages = useMemo(() => {
        if (!fetchedMessages) return optimisticMessages;
        const tempMessages = optimisticMessages.filter(tempMsg =>
            !fetchedMessages.some((realMsg: Message) =>
                realMsg.text === tempMsg.text &&
                realMsg.senderId === tempMsg.senderId &&
                Math.abs(new Date(realMsg.createdAt).getTime() - new Date(tempMsg.createdAt).getTime()) < 60000
            )
        );
        return [...fetchedMessages, ...tempMessages];
    }, [fetchedMessages, optimisticMessages]);

    const selectedConversation = useMemo(() => {
        if (!conversations || !selectedConversationId) return null;
        return conversations.find((conv: Conversation) => conv._id === selectedConversationId) || null;
    }, [conversations, selectedConversationId]);

    const shouldShowLoading = isLoadingConversations || (conversationIdParam && !selectedConversation && !isLoadingConversations);

    // Set selected conversation from URL or first conversation
    useEffect(() => {
        if (conversationIdParam) {
            setSelectedConversationId(conversationIdParam);
        } else if (!isLoadingConversations && conversations && conversations.length > 0) {
            const firstConv = conversations[0];
            setSelectedConversationId(firstConv._id);
            navigate(`/chat/${firstConv._id}`, { replace: true });
        }
    }, [conversationIdParam, conversations, navigate, isLoadingConversations]);

    // Mark messages as read when conversation changes
    useEffect(() => {
        if (selectedConversationId && selectedConversation?.unreadCount && selectedConversation.unreadCount > 0) {
            markAsRead(selectedConversationId);
        }
    }, [selectedConversationId, selectedConversation?.unreadCount, markAsRead]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Handle selecting conversation
    const handleSelectConversation = useCallback((conv: Conversation) => {
        if (conv._id === selectedConversationId) return;
        setSelectedConversationId(conv._id);
        navigate(`/chat/${conv._id}`);
        setOptimisticMessages([]);
    }, [selectedConversationId, navigate]);

    // Gửi tin nhắn text
    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim() || !selectedConversationId || !isConnected) {
            if (!isConnected) toast.error("Không có kết nối mạng");
            return;
        }

        const messageText = newMessage.trim();
        setNewMessage("");
        
        // Không cần gọi setIsSending ở đây vì sẽ được xử lý qua callback
        
        try {
            await socketSendMessage({
                conversationId: String(selectedConversationId),
                text: messageText
            });
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Gửi tin nhắn thất bại");
            
            // Nếu có lỗi bất ngờ, đảm bảo reset isSending
            setIsSending(false);
        }
    }, [newMessage, selectedConversationId, socketSendMessage, isConnected]);

    // Gửi file
    const handleSendFile = useCallback(async (files: File[], text?: string) => {
        if (!selectedConversationId || !isConnected) {
            toast.error("Không thể gửi file");
            return;
        }

        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const tempMessage: Message = {
            _id: tempId,
            conversationId: selectedConversationId,
            senderId: user?._id || "",
            text: text || "Đang gửi file...",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            files: [],
            type: "file",
            isRead: false
        };

        setOptimisticMessages(prev => [...prev, tempMessage]);

        const success = await socketSendMessage({
            conversationId: String(selectedConversationId),
            text: text || "",
            files
        });

        setOptimisticMessages(prev => prev.filter(msg => msg._id !== tempId));

        if (!success) toast.error("Gửi file thất bại");
    }, [selectedConversationId, isConnected, socketSendMessage, user?._id]);

    const chatHeaderUser = useMemo(() => {
        if (!selectedConversation) return null;
        const partner = selectedConversation.sellerId;
        if (!partner) return null;
        return { id: partner._id, name: partner.name, avatar: partner.avatar };
    }, [selectedConversation]);

    // Chỉ cần thêm xử lý onKeyDown cho phù hợp

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isSending && !isLoadingMessages && newMessage.trim()) {
                handleSendMessage();
            }
        }
    }, [handleSendMessage, isSending, isLoadingMessages, newMessage]);

    // Đảm bảo cleanup messageStatusMap khi component unmount
    useEffect(() => {
        return () => {
            setMessageStatusMap({});
        };
    }, []);

    // Tùy chọn: Thêm logic để tự động xóa trạng thái tin nhắn cũ khỏi messageStatusMap sau một thời gian
    useEffect(() => {
        const messageIds = Object.keys(messageStatusMap);
        if (messageIds.length > 0) {
            const timeoutId = setTimeout(() => {

                const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
                const updatedStatusMap = { ...messageStatusMap };

                messageIds.forEach(id => {
                    // Nếu ID chứa timestamp (temp-{timestamp}-{random})
                    if (id.startsWith('temp-')) {
                        const parts = id.split('-');
                        if (parts.length > 1) {
                            const timestamp = parseInt(parts[1]);
                            if (timestamp < fiveMinutesAgo) {
                                delete updatedStatusMap[id];
                            }
                        }
                    }
                });

                setMessageStatusMap(updatedStatusMap);
            }, 10 * 60 * 1000); // Chạy mỗi 10 phút

            return () => clearTimeout(timeoutId);
        }
    }, [messageStatusMap]);

    if (!isAuthenticated || !user) {
        return (
            <div>
                <FixedHeader />
                <div className="flex h-[calc(100vh-120px)] mt-[120px] bg-gray-900 text-gray-100 items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-300 text-sm">Đang kiểm tra phiên đăng nhập...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <FixedHeader />
            <ConnectionStatus
                isConnected={isConnected}
                error={error}
                onRetryConnection={() => window.location.reload()}
            />

            <div className="flex h-[calc(100vh-120px)] mt-[120px] bg-gray-900 text-gray-100">
                <ChatSidebar
                    conversations={conversations || []}
                    currentUserId={user._id ?? ""}
                    selectedConversation={selectedConversation}
                    selectedConversationId={selectedConversationId || undefined}
                    onSelectConversation={handleSelectConversation}
                />

                <div className="flex-1 flex flex-col bg-gray-800">
                    {shouldShowLoading ? (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-gray-300 text-sm">
                                    {isLoadingConversations ? "Đang tải cuộc trò chuyện..." : "Đang tìm cuộc trò chuyện..."}
                                </p>
                            </div>
                        </div>
                    ) : selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-gray-700">
                                {chatHeaderUser && <ChatHeader user={chatHeaderUser} />}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-900">
                                <ChatMessages
                                    messages={messages}
                                    isLoading={isLoadingMessages}
                                    messageStatusMap={messageStatusMap} // Thêm dòng này
                                />
                                <div ref={messageEndRef} className="h-1" /> {/* Scroll target */}
                            </div>

                            {/* Input */}
                            <div className="px-4 py-3 border-t border-gray-700 bg-gray-800">
                                <ChatInput
                                    value={newMessage}
                                    onChange={setNewMessage}
                                    onSend={handleSendMessage}
                                    onKeyDown={handleKeyDown}
                                    onSendFile={handleSendFile}
                                    disabled={!isConnected}
                                    isSending={isSending}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                                <div className="text-4xl mb-3 text-gray-500">
                                    <LucideMessageSquareMore />
                                </div>
                                <p className="text-gray-400 text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

