// Shared types used across the app. Extracted during the JSX -> TSX
// conversion so components don't each redeclare the same shapes.

export type Screen =
  | 'dashboard'
  | 'investigate'
  | 'image'
  | 'monitoring'
  | 'cases'
  | 'reports'
  | 'settings';

export type RiskLevel = 'high' | 'medium' | 'resolved';

export interface TimelineEvent {
  title: string;
  detail: string;
}

export interface CaseItem {
  id: string;
  title: string;
  url: string;
  risk: RiskLevel;
  riskLabel: string;
  created: string;
  status: string;
  timeline: TimelineEvent[];
}

// --- Identity verification (National ID + face verification + monthly re-check) ---
//
// Rationale: a hacked/hijacked Facebook account could otherwise keep using
// the browser extension as if it were the real owner. Re-requiring
// verification on a schedule limits how long a hijacked session stays
// trusted, without needing a real backend to enforce session revocation.

export type VerificationStepId = 'national-id' | 'face' | 'review';

export const VERIFICATION_STEPS: VerificationStepId[] = [
  'national-id',
  'face',
  'review',
];

// How often a verified identity must be re-confirmed.
export const VERIFICATION_VALIDITY_DAYS = 30;

export type NationalIdType =
  | 'philsys'
  | 'drivers-license'
  | 'passport'
  | 'umid';

export const NATIONAL_ID_LABELS: Record<NationalIdType, string> = {
  philsys: 'Philippine National ID (PhilSys)',
  'drivers-license': "Driver's License",
  passport: 'Passport',
  umid: 'UMID',
};

export interface NationalIdInfo {
  idType: NationalIdType;
  idNumber: string;
  fullNameOnId: string;
  frontImagePreviewUrl: string | null;
}

export interface FaceVerificationResult {
  capturedAt: string;
  selfiePreviewUrl: string | null;
  matchScore: number; // 0-100, mocked comparison against ID/profile photo
  passed: boolean;
}

export type IdentityVerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'expired';

export interface IdentityVerificationState {
  status: IdentityVerificationStatus;
  nationalId: NationalIdInfo | null;
  face: FaceVerificationResult | null;
  verifiedAt: string | null;
  nextDueAt: string | null;
}

export const createEmptyIdentityVerification = (): IdentityVerificationState => ({
  status: 'unverified',
  nationalId: null,
  face: null,
  verifiedAt: null,
  nextDueAt: null,
});

export function isVerificationOverdue(state: IdentityVerificationState): boolean {
  if (state.status !== 'verified' || !state.nextDueAt) return false;
  return new Date(state.nextDueAt).getTime() <= Date.now();
}