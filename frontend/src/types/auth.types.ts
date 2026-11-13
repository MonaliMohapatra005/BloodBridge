import { BloodGroup } from '../lib/bloodCompatibility';

export interface User {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  bloodGroup: BloodGroup;
  isAvailableToDonate: boolean;
  lastDonatedAt?: string | null;
  totalDonations: number;
  reliabilityScore?: number;
  fcmToken?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  bloodGroup: BloodGroup;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ReadinessPayload {
  fullName?: string;
  email?: string | null;
  isAvailableToDonate?: boolean;
  lastDonatedAt?: string | null;
  fcmToken?: string | null;
}

