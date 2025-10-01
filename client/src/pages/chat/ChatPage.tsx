import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import { useChat, chatKeys } from "@/hooks/useChat";
import type { Conversation, Message } from "@/types/chatType";
import { useAuthStore } from "@/store/auth";
import FixedHeader from "@/layouts/components/base/FixedHeader";
import { chatService } from "@/services/chatServices";
import { LucideMessageSquareMore } from "lucide-react";

export const ChatPage: React.FC = () => {
    const { id: conversationId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const { user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);

    // Cache refs để tránh re-creation
    const userIdRef = useRef(user?._id);
    const prevConversationIdRef = useRef<string | null>(null);

    const {
        conversations,
        messages,
        sendMessage,
        isLoadingConversations,
        isLoadingMessages,
    } = useChat(selectedConversationId || undefined);

    // Memoize selected conversation để tránh re-compute
    const selectedConversation = useMemo(() => {
        if (!Array.isArray(conversations) || !selectedConversationId) return null;
        return conversations.find((conv: Conversation) => conv._id === selectedConversationId) || null;
    }, [conversations, selectedConversationId]);

    // Memoize loading states
    const shouldShowLoading = useMemo(() => {
        return isLoadingConversations ||
            (conversationId && !selectedConversation && !isLoadingConversations);
    }, [isLoadingConversations, conversationId, selectedConversation]);

    // Memoize socket URL để tránh re-creation
    const socketUrl = useMemo(() => import.meta.env.VITE_API_URL, []);

    // Optimized socket message handler với useCallback
    const handleReceiveMessage = useCallback((newMessage: Message) => {
        console.log("📨 Received new message:", newMessage);

        // Update messages cache cho conversation hiện tại
        if (selectedConversationId && newMessage.conversationId === selectedConversationId) {
            queryClient.setQueryData(
                chatKeys.messages(selectedConversationId),
                (oldMessages: Message[] = []) => {
                    // Kiểm tra duplicate với binary search nếu messages nhiều
                    const messageExists = oldMessages.some(msg => msg._id === newMessage._id);
                    if (messageExists) return oldMessages;

                    return [...oldMessages, newMessage];
                }
            );
        }

        // Batch update conversations cache
        queryClient.setQueryData(
            chatKeys.conversations(),
            (oldConversations: Conversation[] = []) => {
                let updatedConv: Conversation | undefined;
                const otherConvs: Conversation[] = [];

                // Single loop để tìm và update conversation
                oldConversations.forEach(conv => {
                    if (conv._id === newMessage.conversationId) {
                        updatedConv = {
                            ...conv,
                            lastMessage: {
                                text: newMessage.text,
                                sentAt: newMessage.createdAt,
                                sentBy: newMessage.senderId
                            },
                            unreadCount: newMessage.senderId !== userIdRef.current
                                ? (conv.unreadCount || 0) + 1
                                : conv.unreadCount || 0,
                            updatedAt: newMessage.createdAt
                        };
                    } else {
                        otherConvs.push(conv);
                    }
                });

                return updatedConv ? [updatedConv, ...otherConvs] : oldConversations;
            }
        );
    }, [selectedConversationId, queryClient]);

    // Optimized conversation update handler
    const handleConversationUpdated = useCallback((updatedConversation: Conversation) => {
        console.log("🔄 Conversation updated:", updatedConversation);
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    }, [queryClient]);

    // Optimized new conversation handler
    const handleNewConversation = useCallback((newConversation: Conversation) => {
        console.log("🆕 New conversation:", newConversation);
        queryClient.setQueryData(
            chatKeys.conversations(),
            (oldConversations: Conversation[] = []) => [newConversation, ...oldConversations]
        );
    }, [queryClient]);

    // Chọn conversation với optimization
    useEffect(() => {
        if (conversationId && conversationId !== prevConversationIdRef.current) {
            setSelectedConversationId(conversationId);
            prevConversationIdRef.current = conversationId;
        } else if (
            !conversationId &&
            !isLoadingConversations &&
            Array.isArray(conversations) &&
            conversations.length > 0 &&
            !selectedConversationId
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
    }, [conversationId, conversations, navigate, isLoadingConversations, selectedConversationId]);

    // Optimized socket setup với dependency array chính xác
    useEffect(() => {
        if (!user?._id) return;

        userIdRef.current = user._id;

        // Chỉ tạo socket mới nếu chưa có hoặc user thay đổi
        if (
            !socketRef.current ||
            (typeof socketRef.current.auth === "object" &&
                socketRef.current.auth !== null &&
                "userId" in socketRef.current.auth &&
                (socketRef.current.auth as { userId?: string }).userId !== user._id)
        ) {
            // Cleanup socket cũ nếu có
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            // Tạo socket mới
            socketRef.current = io(socketUrl, {
                auth: { userId: user._id },
                transports: ['websocket'], // Chỉ dùng websocket để tối ưu
                upgrade: false,
            });

            // Join user room
            socketRef.current.emit("join", user._id);

            // Setup event listeners với cached handlers
            socketRef.current.on("receive_message", handleReceiveMessage);
            socketRef.current.on("conversation_updated", handleConversationUpdated);
            socketRef.current.on("new_conversation", handleNewConversation);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off("receive_message", handleReceiveMessage);
                socketRef.current.off("conversation_updated", handleConversationUpdated);
                socketRef.current.off("new_conversation", handleNewConversation);
            }
        };
    }, [user?._id, socketUrl, handleReceiveMessage, handleConversationUpdated, handleNewConversation]);

    // Optimized conversation room joining
    useEffect(() => {
        if (!socketRef.current || !selectedConversationId) return;

        // Join conversation room
        socketRef.current.emit("join_conversation", selectedConversationId);

        // Batch mark as read và cache update
        if (selectedConversation?.unreadCount && selectedConversation.unreadCount > 0) {
            socketRef.current.emit("mark_as_read", selectedConversationId);

            // Immediate cache update
            queryClient.setQueryData(
                chatKeys.conversations(),
                (oldConversations: Conversation[] = []) =>
                    oldConversations.map(conv =>
                        conv._id === selectedConversationId
                            ? { ...conv, unreadCount: 0 }
                            : conv
                    )
            );
        }
    }, [selectedConversationId, selectedConversation?.unreadCount, queryClient]);

    // Memoized handlers
    const handleSelectConversation = useCallback((conversation: Conversation) => {
        if (conversation._id !== selectedConversationId) {
            setSelectedConversationId(conversation._id);
            navigate(`/chat/${conversation._id}`);
        }
    }, [selectedConversationId, navigate]);

    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim() || !selectedConversationId) return;

        const messageText = newMessage.trim();
        setNewMessage("");

        try {
            // Optimistic update với stable ID
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
                isRead: true
            };

            // Batch cache updates
            queryClient.setQueryData(
                chatKeys.messages(selectedConversationId),
                (oldMessages: Message[] = []) => [...oldMessages, tempMessage]
            );

            // Send message và emit socket trong Promise.all để parallel
            await Promise.all([
                sendMessage(messageText),
                socketRef.current?.emit("send_message", {
                    conversationId: selectedConversationId,
                    text: messageText,
                    senderId: user?._id,
                })
            ]);

            // Remove temp message và refresh
            queryClient.setQueryData(
                chatKeys.messages(selectedConversationId),
                (oldMessages: Message[] = []) =>
                    oldMessages.filter(msg => msg._id !== tempId)
            );

            // Invalidate với specific key để tối ưu
            queryClient.invalidateQueries({
                queryKey: chatKeys.messages(selectedConversationId),
                exact: true
            });

        } catch (error) {
            console.error("❌ Send message error:", error);
            // Rollback optimistic update
            queryClient.setQueryData(
                chatKeys.messages(selectedConversationId),
                (oldMessages: Message[] = []) =>
                    oldMessages.filter(msg => !msg._id.startsWith('temp-'))
            );
        }
    }, [newMessage, selectedConversationId, sendMessage, user?._id, queryClient]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const handleSendFile = useCallback(async (files: File[], text?: string) => {
        if (!selectedConversationId) return;

        try {
            const response = await chatService.sendFileMessage(selectedConversationId, files, text);

            socketRef.current?.emit("send_message", response);

            // Precise invalidation
            queryClient.invalidateQueries({
                queryKey: chatKeys.messages(selectedConversationId),
                exact: true
            });

        } catch (error) {
            console.error("❌ Upload file error:", error);
        }
    }, [selectedConversationId, queryClient]);

    // Memoized chat header user data
    const chatHeaderUser = useMemo(() => {
        if (!selectedConversation) return null;
        return {
            id: selectedConversation.sellerId._id,
            name: selectedConversation.sellerId.name,
            avatar: selectedConversation.sellerId.avatar,
        };
    }, [selectedConversation]);

    // Cleanup socket on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return (
        <div>
            <FixedHeader />
            <div className="flex h-[calc(100vh-120px)] mt-[120px] bg-gray-900 text-gray-100">
                {/* Sidebar với memoized props */}
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
                            {/* Header với memoized data */}
                            <div className="px-4 py-3 border-b border-gray-700">
                                {chatHeaderUser && <ChatHeader user={chatHeaderUser} />}
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

                            {/* Input với memoized handlers */}
                            <div className="px-4 py-3 border-t border-gray-700 bg-gray-800">
                                <ChatInput
                                    value={newMessage}
                                    onChange={setNewMessage}
                                    onSend={handleSendMessage}
                                    onKeyDown={handleKeyDown}
                                    onSendFile={handleSendFile}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                                <div className="text-4xl mb-3 text-gray-500"><LucideMessageSquareMore /></div>
                                <p className="text-gray-400 text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
