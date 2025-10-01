import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chatServices";
import type { Conversation, Message } from "@/types/chatType";

// Query Keys
export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  conversation: (id: string) => [...chatKeys.all, "conversation", id] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, "messages", conversationId] as const,
};

// Interface cho message form data
export interface SendMessageData {
  conversationId: string;
  text: string;
}

// Hook để fetch danh sách conversations
export const useConversations = () => {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: async () => {
      const response = await chatService.fetchConversations();
      return response.items || response;
    },
  });
};

// Hook để fetch messages của một conversation
export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async () => {
      const response = await chatService.fetchMessages(conversationId);
      return response.items || response;
    },
    enabled: !!conversationId,
  });
};

// Hook để gửi message mới
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, text }: SendMessageData) =>
      chatService.addMessage(conversationId, text),
    onSuccess: (newMessage, variables) => {
      // Invalidate messages list để refetch
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.conversationId),
      });

      // Invalidate conversations để update lastMessage
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });

      // Optimistic update cho messages (optional)
      queryClient.setQueryData(
        chatKeys.messages(variables.conversationId),
        (oldData: Message[] | undefined) => {
          if (!oldData) return [newMessage];
          return [...oldData, newMessage];
        }
      );
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });
};

// Hook để tìm existing conversation trong cache
export const useFindExistingConversation = () => {
  const queryClient = useQueryClient();
  
  return (productId: string, sellerId: string): Conversation | null => {
    const conversations = queryClient.getQueryData<Conversation[]>(chatKeys.conversations());
    if (!conversations) return null;
    
    return conversations.find(conv => 
      conv.productId._id === productId && conv.sellerId._id === sellerId
    ) || null;
  };
};

// Hook để tạo conversation mới (không check cache)
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: string; sellerId: string }) => {
      // Tạo conversation mới trực tiếp
      const newConversation = await chatService.createConversation(data.productId, data.sellerId);
      return newConversation;
    },
    onSuccess: (newConversation) => {
      // Invalidate để refetch data mới
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      
      if (newConversation._id) {
        queryClient.invalidateQueries({ 
          queryKey: chatKeys.messages(newConversation._id) 
        });
      }
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => {
      return chatService.markMessagesAsRead(conversationId);
    },
    onSuccess: (_, conversationId) => {
      // Update unread count in conversations
      queryClient.setQueryData(
        chatKeys.conversations(),
        (oldData: Conversation[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((conv) =>
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          );
        }
      );

      // Mark messages as read
      queryClient.setQueryData(
        chatKeys.messages(conversationId),
        (oldData: Message[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((msg) => ({ ...msg, isRead: true }));
        }
      );
    },
  });
};

export const useConversation = (conversationId: string) => {
  const conversations = useConversations();

  const conversation = conversations.data?.find(
    (conv: Conversation) => conv._id === conversationId
  );

  return {
    conversation,
    isLoading: conversations.isLoading,
    error: conversations.error,
    refetch: conversations.refetch,
  };
};

// Hook utility để get unread conversations count
export const useUnreadCount = () => {
  const conversations = useConversations();

  const totalUnread =
    conversations.data?.reduce((total: number, conv: Conversation) => {
      return total + conv.unreadCount;
    }, 0) || 0;

  return {
    totalUnread,
    hasUnread: totalUnread > 0,
    isLoading: conversations.isLoading,
  };
};

export const useChat = (conversationId?: string) => {
  const conversations = useConversations();
  const messages = useMessages(conversationId || "");
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  // Helper để gửi message
  const handleSendMessage = (text: string) => {
    if (!conversationId || !text.trim()) return;

    sendMessage.mutate({
      conversationId,
      text: text.trim(),
    });
  };

  // Helper để mark as read
  const handleMarkAsRead = () => {
    if (!conversationId) return;
    markAsRead.mutate(conversationId);
  };

  return {
    // Data
    conversations: conversations.data || [],
    messages: messages.data || [],

    // Loading states
    isLoadingConversations: conversations.isLoading,
    isLoadingMessages: messages.isLoading,
    isSendingMessage: sendMessage.isPending,

    // Error states
    conversationsError: conversations.error,
    messagesError: messages.error,
    sendMessageError: sendMessage.error,

    // Actions
    sendMessage: handleSendMessage,
    markAsRead: handleMarkAsRead,

    // Raw mutations (nếu cần control chi tiết hơn)
    sendMessageMutation: sendMessage,
    markAsReadMutation: markAsRead,

    // Refetch functions
    refetchConversations: conversations.refetch,
    refetchMessages: messages.refetch,
  };
};
