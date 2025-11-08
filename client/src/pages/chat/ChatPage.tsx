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

// ChatPage xử lý realtime và gửi đúng format

export const ChatPage: React.FC = () => {
    const { id: conversationIdParam } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
    const [isSending, setIsSending] = useState<boolean>(false);
    const messageEndRef = useRef<HTMLDivElement>(null);

    const { conversations, messages: fetchedMessages, isLoadingConversations, isLoadingMessages } = useChat(selectedConversationId || undefined);

    const { isConnected, error, sendMessage: socketSendMessage, markAsRead } = useSocketChat(
        selectedConversationId ? String(selectedConversationId) : undefined
    );

    const messages = useMemo(() => {
        if (!fetchedMessages) return optimisticMessages;
        const tempMessages = optimisticMessages.filter((tempMsg) => {
            // if any real message matches this temp optimistic message, filter it out
            return !fetchedMessages.some((realMsg: Message) => {
                if (realMsg.senderId !== tempMsg.senderId) return false;

                // If both have text and equal, treat as duplicate
                if (realMsg.text && tempMsg.text && realMsg.text === tempMsg.text) return true;

                // If both have files, match by count and names (handles image uploads)
                const tFiles = (tempMsg as unknown as { files?: import("@/types/chatType").FileMeta[] })?.files;
                const rFiles = (realMsg as unknown as { files?: import("@/types/chatType").FileMeta[] })?.files;
                if (tFiles && rFiles && tFiles.length > 0 && rFiles.length > 0 && tFiles.length === rFiles.length) {
                    const namesMatch = tFiles.every((tf, idx) => {
                        const tn = tf?.name || '';
                        const rn = rFiles[idx]?.name || '';
                        return tn && rn && tn === rn;
                    });
                    if (namesMatch) return true;
                }

                // fallback: timestamps close together => consider duplicate
                if (Math.abs(new Date(realMsg.createdAt).getTime() - new Date(tempMsg.createdAt).getTime()) < 60000) return true;

                return false;
            });
        });
        // Merge fetched + temp and dedupe by signature (sender + text OR files + close timestamp)
        const merged = [...fetchedMessages, ...tempMessages];
        const unique: Message[] = [];
        const isSimilar = (a: Message, b: Message) => {
            if (a.senderId !== b.senderId) return false;
            if (a.text && b.text && a.text === b.text) return true;
            const aFiles = (a as unknown as { files?: import("@/types/chatType").FileMeta[] })?.files;
            const bFiles = (b as unknown as { files?: import("@/types/chatType").FileMeta[] })?.files;
            if (aFiles && bFiles && aFiles.length === bFiles.length && aFiles.length > 0) {
                const namesMatch = aFiles.every((af, idx) => {
                    const an = af?.name || '';
                    const bn = bFiles[idx]?.name || '';
                    return an && bn && an === bn;
                });
                if (namesMatch) return true;
            }
            if (Math.abs(new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) < 1000) return true;
            return false;
        };

        for (const m of merged) {
            const exists = unique.some(u => isSimilar(u, m));
            if (!exists) unique.push(m);
        }

        return unique;
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
        if (!newMessage.trim() || !selectedConversationId) return;
        if (!isConnected) {
            toast.error("Không có kết nối mạng");
            return;
        }

        const messageText = newMessage.trim();
        setNewMessage("");
        setIsSending(true); // Đặt trạng thái gửi

        // Đảm bảo reset isSending sau tối đa 3 giây
        const sendingTimeout = setTimeout(() => {
            setIsSending(false);
        }, 3000);

        try {
            const tempId = `temp-${Date.now()}-${Math.random()}`;
            const tempMessage: Message = {
                _id: tempId,
                conversationId: selectedConversationId,
                senderId: user?._id || "",
                text: messageText,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                files: [],
                type: "text",
                isRead: false,
                isPending: true // Đánh dấu tin nhắn là đang chờ
            };

            setOptimisticMessages(prev => [...prev, tempMessage]);

            const success = await socketSendMessage({
                conversationId: String(selectedConversationId),
                text: messageText
            });

            if (!success) {
                toast.error("Gửi tin nhắn thất bại");
            }
        } finally {
            clearTimeout(sendingTimeout);
            setIsSending(false); // Reset trạng thái gửi bất kể thành công hay thất bại
        }
    }, [newMessage, selectedConversationId, socketSendMessage, isConnected, user?._id]);

    // Gửi file
    const handleSendFile = useCallback(async (files: File[], text?: string) => {
        if (!selectedConversationId || !isConnected) {
            toast.error("Không thể gửi file");
            return;
        }
        const tempId = `temp-${Date.now()}-${Math.random()}`;

        // Create preview URLs for optimistic display
        const tempFiles = files.map((f, i) => ({
            _id: `tempfile-${Date.now()}-${i}-${Math.random()}`,
            url: URL.createObjectURL(f),
            name: f.name,
            type: f.type
        }));

        const tempMessage: Message = {
            _id: tempId,
            conversationId: selectedConversationId,
            senderId: user?._id || "",
            text: text || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            files: tempFiles as unknown as import("@/types/chatType").FileMeta[],
            type: files[0]?.type.startsWith('image/') ? 'image' : 'file',
            isRead: false,
            isPending: true
        };

        // Add optimistic message for immediate UI (with previews)
        setOptimisticMessages(prev => [...prev, tempMessage]);

        // Call sendMessage with tempId so hook does not add duplicate temp message in cache
        const success = await socketSendMessage({
            conversationId: String(selectedConversationId),
            text: text || "",
            files,
            tempId
        });

        // Remove optimistic message and revoke preview URLs
        setOptimisticMessages(prev => {
            const removed = prev.find(m => m._id === tempId);
            if (removed && removed.files) {
                removed.files.forEach((f: import("@/types/chatType").FileMeta) => {
                    try { URL.revokeObjectURL(f.url); } catch { /* ignore */ }
                });
            }
            return prev.filter(msg => msg._id !== tempId);
        });

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

