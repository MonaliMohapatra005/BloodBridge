import { apiClient } from './api';
import {
  BloodRequest,
  CreateRequestPayload,
  CreateRequestResponse,
  GetRequestsParams,
  GetRequestsResponse,
} from '../types/request.types';
import {
  RequestDetailsResponse,
  ResponderItem,
  RespondPayload,
  RespondResponse,
  UpdateRequestStatusPayload,
  UpdateResponderStatusPayload,
} from '../types/responder.types';

export const requestService = {
  async createRequest(payload: CreateRequestPayload): Promise<CreateRequestResponse> {
    const response = await apiClient.post<CreateRequestResponse>('/api/requests', payload);
    return response.data;
  },

  async getRequests(params?: GetRequestsParams): Promise<GetRequestsResponse> {
    const response = await apiClient.get<GetRequestsResponse>('/api/requests', { params });
    return response.data;
  },

  async getRequestById(id: string): Promise<RequestDetailsResponse> {
    const response = await apiClient.get<RequestDetailsResponse>(`/api/requests/${id}`);
    return response.data;
  },

  async respondToRequest(id: string, payload: RespondPayload): Promise<RespondResponse> {
    const response = await apiClient.post<RespondResponse>(`/api/requests/${id}/respond`, payload);
    return response.data;
  },

  async updateResponderStatus(
    id: string,
    payload: UpdateResponderStatusPayload
  ): Promise<{ success: boolean; message: string; response: ResponderItem }> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      response: ResponderItem;
    }>(`/api/requests/${id}/respond/status`, payload);
    return response.data;
  },

  async updateRequestStatus(
    id: string,
    payload: UpdateRequestStatusPayload
  ): Promise<{ success: boolean; message: string; request: BloodRequest }> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      request: BloodRequest;
    }>(`/api/requests/${id}/status`, payload);
    return response.data;
  },
};

