export type DocumentType = 'aadhaar' | 'pan' | 'voter_id' | 'passport';

export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'locked';

export type KYCStage = 
  | 'landing'
  | 'details'
  | 'document_upload'
  | 'photo_upload'
  | 'review'
  | 'result';

export interface KYCApplication {
  id: string;
  name: string;
  mobile: string;
  email: string;
  documentType: DocumentType;
  documentNumber: string;
  documentFile: File | null;
  documentPreview: string | null;
  photoFile: File | null;
  photoPreview: string | null;
  status: KYCStatus;
  attemptsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface StageAttempt {
  stage: KYCStage;
  count: number;
  maxAttempts: number;
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  voter_id: 'Voter ID',
  passport: 'Passport',
};

export const MAX_ATTEMPTS = 3;
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const ALLOWED_DOCUMENT_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];
