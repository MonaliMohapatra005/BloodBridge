import { BloodGroup } from '../lib/bloodCompatibility';

export type ResponderStatus =
  | 'CONFIRMED_PRIMARY'
  | 'CONFIRMED_BACKUP'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'DONATED'
  | 'WITHDRAWN';

export interface ResponderUser {
  _id: string;
  fullName: string;
  phone: string;
  bloodGroup: BloodGroup;
  reliabilityScore?: number;
  totalDonations?: number;
}

export interface ResponderItem {
  _id: string;
  requestId: string;
  responderId: ResponderUser;
  status: ResponderStatus;
  responderLat: number;
  responderLng: number;
  distanceMeters: number;
  etaSeconds: number;
  poolRank: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequestDetailsResponse {
  success: boolean;
  request: import('./request.types').BloodRequest;
  compatibility: {
    patientBloodGroup: BloodGroup;
    myBloodGroup: BloodGroup;
    isCompatibleWithMe: boolean;
    compatibleDonorGroups: BloodGroup[];
  };
  responderPool: ResponderItem[];
  myResponse: ResponderItem | null;
}

export interface RespondPayload {
  lat: number;
  lng: number;
}

export interface RespondResponse {
  success: boolean;
  message: string;
  bloodCompatibility: {
    donorBloodGroup: BloodGroup;
    patientBloodGroup: BloodGroup;
    isCompatible: boolean;
    compatibleDonorGroups: BloodGroup[];
  };
  response: ResponderItem;
}

export interface UpdateResponderStatusPayload {
  status: 'EN_ROUTE' | 'ARRIVED' | 'DONATED' | 'WITHDRAWN';
}

export interface UpdateRequestStatusPayload {
  status: 'FULFILLED' | 'CANCELLED';
}

