import API from "@/lib/axios";

export const chatService = {
  async fetchConversations() {
    const response = await API.get("/chat");
    return response.data;
  },
  async addMessage(conversationId: string, text: string) {
    console.log(conversationId, text);
    const response = await API.post(`/chat/messages`, { conversationId, text });
    return response.data;
  },
  async fetchMessages(conversationId: string) {
    const response = await API.get(`/chat/${conversationId}/messages`);
    return response.data;
  },
  async createConversation(productId: string, sellerId: string) {
    const response = await API.post("/chat/start", {
      productId,
      sellerId,
    });
    return response.data;
  },
  async markMessagesAsRead(conversationId: string) {
    const response = await API.post(`/chat/${conversationId}/read`);
    return response.data;
  },
};
