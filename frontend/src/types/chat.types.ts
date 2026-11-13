import { BloodGroup } from '../lib/bloodCompatibility';

export interface ChatMessage {
  _id: string;
  requestId: string;
  senderId: {
    _id: string;
    fullName: string;
    phone: string;
    bloodGroup: BloodGroup;
  };
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetMessagesResponse {
  success: boolean;
  count: number;
  messages: ChatMessage[];
}

export interface SendMessagePayload {
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: ChatMessage;
}

