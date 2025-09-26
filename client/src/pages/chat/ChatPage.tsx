import React, { useState, useEffect } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import type { Conversation } from "@/types/chatType";
import { chatService } from "@/services/chatServices";
import { useAuthStore } from "@/store/auth";

export const ChatPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Array<{
        id: string;
        senderId: string;
        content: string;
        timestamp: Date;
        type: string;
    }>>([]);
    const [newMessage, setNewMessage] = useState("");
    const {user} = useAuthStore();
    useEffect(() => {
        chatService.fetchConversations()
            .then(data => {
                setConversations(data.items); // data.items theo response của bạn
                if (data.items.length > 0) setSelectedConversation(data.items[0]);
            })
            .catch(err => console.error(err));
    }, []);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;
        const msg = { id: Date.now().toString(), senderId: "me", content: newMessage.trim(), timestamp: new Date(), type: "text" };
        setMessages([...messages, msg]);
        setNewMessage("");
        // TODO: Gửi lên server
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
                    currentUserId={user?._id || ""  }
                    selectedConversation={selectedConversation}
                    onSelectConversation={setSelectedConversation}
                />
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            <ChatHeader user={{
                                id: selectedConversation.sellerId._id,
                                name: selectedConversation.sellerId.name,
                                avatar: selectedConversation.sellerId.avatar
                            }} />
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
                                <p className="text-gray-500 text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
