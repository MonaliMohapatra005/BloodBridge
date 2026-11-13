// Blood group definitions and RBC compatibility matching backend logic

export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export const ALL_BLOOD_GROUPS: BloodGroup[] = [
  'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'
];

// Recipient Compatibility (Inbound): Which donors can donate to recipientGroup
export const RBC_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

// Donor Compatibility (Outbound): Which recipients can a donor donate to
export const DONOR_CAN_DONATE_TO: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export function canDonorDonateToPatient(donorGroup?: BloodGroup, patientGroup?: BloodGroup): boolean {
  if (!donorGroup || !patientGroup) return false;
  const compatible = RBC_COMPATIBILITY[patientGroup];
  return !!compatible && compatible.includes(donorGroup);
}

export function getCompatibleDonorsForPatient(patientGroup: BloodGroup): BloodGroup[] {
  return RBC_COMPATIBILITY[patientGroup] || [];
}

export function getEligiblePatientGroupsForDonor(donorGroup: BloodGroup): BloodGroup[] {
  return DONOR_CAN_DONATE_TO[donorGroup] || [];
}

