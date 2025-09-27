export interface Conversation {
  _id: string;
  buyerId: {
    _id: string;
    name: string;
    avatar: string | null;
  };
  sellerId: {
    _id: string;
    name: string;
    avatar: string | null;
  };
  productId: {
    _id: string;
    title: string;
    price: number;
    images: string[];
  };
  lastMessage: {
    text: string | null;
    sentAt: string | null;
    sentBy: string | null;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: "text" | "image" | "file";
  files: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
