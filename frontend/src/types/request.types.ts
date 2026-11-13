import { BloodGroup } from '../lib/bloodCompatibility';

export type UrgencyLevel = 'CRITICAL' | 'URGENT' | 'SCHEDULED';
export type RequestStatus = 'BROADCASTING' | 'RESPONDERS_POOLING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export interface BloodRequest {
  _id: string;
  requesterId: {
    _id: string;
    fullName: string;
    phone: string;
    bloodGroup: BloodGroup;
  } | string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgencyLevel: UrgencyLevel;
  hospitalName: string;
  hospitalAddress: string;
  hospitalLat: number;
  hospitalLng: number;
  status: RequestStatus;
  targetPoolSize: number;
  notifiedUserIds?: string[];
  expiresAt: string;
  createdAt: string;
  updatedAt?: string;
  isCompatibleWithMe?: boolean;
  compatibleDonorGroups?: BloodGroup[];
}

export interface CreateRequestPayload {
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded?: number;
  urgencyLevel?: UrgencyLevel;
  hospitalName: string;
  hospitalAddress: string;
  hospitalLat: number;
  hospitalLng: number;
  expiresInHours?: number;
}

export interface CreateRequestResponse {
  success: boolean;
  message: string;
  compatibleDonorGroups: BloodGroup[];
  notifiedDonorsCount: number;
  request: BloodRequest;
}

export interface GetRequestsParams {
  status?: RequestStatus;
  mine?: boolean;
  compatibleOnly?: boolean;
}

export interface GetRequestsResponse {
  success: boolean;
  myBloodGroup?: BloodGroup;
  canDonateToGroups?: BloodGroup[];
  count: number;
  requests: BloodRequest[];
}

