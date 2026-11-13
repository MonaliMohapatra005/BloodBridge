export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];
  donorBloodGroup?: string;
  patientBloodGroup?: string;
  compatibleDonorGroups?: string[];
}

