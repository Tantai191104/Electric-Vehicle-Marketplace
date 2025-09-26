import API from "@/lib/axios";

export const chatService = {
    async fetchConversations() {
       const response = await API.get('/chat');
       return response.data;
    }
};
