import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/types/chatType";


interface ChatSidebarProps {
    conversations: Conversation[];
    currentUserId: string;
    selectedConversation: Conversation | null;
    onSelectConversation: (conv: Conversation) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    conversations,
    currentUserId,
    selectedConversation,
    onSelectConversation
}) => {
    const formatTime = (dateStr: string | null) =>
        dateStr ? new Date(dateStr).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";

    return (
        <div className="w-72 bg-gray-50/80 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Tin nhắn</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {conversations.map(conv => {
                    // xác định user bên kia
                    const otherUser = conv.sellerId._id === currentUserId ? conv.buyerId : conv.sellerId;

                    return (
                        <div
                            key={conv._id}
                            onClick={() => onSelectConversation(conv)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 ${selectedConversation?._id === conv._id ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-100"
                                }`}
                        >
                            <div className="relative">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={otherUser.avatar ?? undefined} />
                                    <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">{otherUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm truncate text-gray-900">{otherUser.name}</h4>
                                    {conv.lastMessage.sentBy !== currentUserId && conv.unreadCount > 0 && (
                                        <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-4 flex items-center justify-center">
                                            {conv.unreadCount}
                                        </Badge>
                                    )}  
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-500 text-xs truncate flex-1">{conv.lastMessage.text}</p>
                                    <span className="text-xs text-gray-400 ml-2">{formatTime(conv.lastMessage.sentAt)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

