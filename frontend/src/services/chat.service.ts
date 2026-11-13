import { apiClient } from './api';
import {
  ChatMessage,
  GetMessagesResponse,
  SendMessagePayload,
  SendMessageResponse,
} from '../types/chat.types';

export const chatService = {
  async getMessages(requestId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<GetMessagesResponse>(`/api/requests/${requestId}/messages`);
    return response.data.messages;
  },

  async sendMessage(requestId: string, payload: SendMessagePayload): Promise<ChatMessage> {
    const response = await apiClient.post<SendMessageResponse>(
      `/api/requests/${requestId}/messages`,
      payload
    );
    return response.data.message;
  },
};

