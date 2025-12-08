import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  KYCApplication, 
  KYCStage, 
  KYCStatus, 
  DocumentType,
  MAX_ATTEMPTS,
  StageAttempt 
} from '@/types/kyc';

interface KYCContextType {
  application: Partial<KYCApplication>;
  currentStage: KYCStage;
  stageAttempts: Record<KYCStage, number>;
  isProcessing: boolean;
  updateApplication: (data: Partial<KYCApplication>) => void;
  setCurrentStage: (stage: KYCStage) => void;
  incrementAttempt: (stage: KYCStage) => number;
  getAttemptInfo: (stage: KYCStage) => StageAttempt;
  checkDuplicate: (mobile: string, documentNumber: string) => Promise<boolean>;
  submitKYC: () => Promise<{ success: boolean; status: KYCStatus; message: string }>;
  resetApplication: () => void;
  setIsProcessing: (value: boolean) => void;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

// Simulated database of existing KYC applications
const MOCK_EXISTING_KYCS = [
  { mobile: '9876543210', documentNumber: '1234-5678-9012', status: 'approved' as KYCStatus },
  { mobile: '9999888877', documentNumber: 'ABCDE1234F', status: 'approved' as KYCStatus },
];

const initialApplication: Partial<KYCApplication> = {
  status: 'pending',
  attemptsCount: 0,
};

const initialStageAttempts: Record<KYCStage, number> = {
  landing: 0,
  details: 0,
  document_upload: 0,
  photo_upload: 0,
  review: 0,
  result: 0,
};

export function KYCProvider({ children }: { children: React.ReactNode }) {
  const [application, setApplication] = useState<Partial<KYCApplication>>(initialApplication);
  const [currentStage, setCurrentStage] = useState<KYCStage>('landing');
  const [stageAttempts, setStageAttempts] = useState<Record<KYCStage, number>>(initialStageAttempts);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateApplication = useCallback((data: Partial<KYCApplication>) => {
    setApplication(prev => ({ ...prev, ...data, updatedAt: new Date() }));
  }, []);

  const incrementAttempt = useCallback((stage: KYCStage): number => {
    setStageAttempts(prev => {
      const newCount = (prev[stage] || 0) + 1;
      return { ...prev, [stage]: newCount };
    });
    return stageAttempts[stage] + 1;
  }, [stageAttempts]);

  const getAttemptInfo = useCallback((stage: KYCStage): StageAttempt => {
    return {
      stage,
      count: stageAttempts[stage] || 0,
      maxAttempts: MAX_ATTEMPTS,
    };
  }, [stageAttempts]);

  const checkDuplicate = useCallback(async (mobile: string, documentNumber: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const normalizedMobile = mobile.replace(/\D/g, '');
    const normalizedDocNum = documentNumber.replace(/\s/g, '').toUpperCase();
    
    return MOCK_EXISTING_KYCS.some(
      kyc => 
        kyc.mobile === normalizedMobile || 
        kyc.documentNumber === normalizedDocNum
    );
  }, []);

  const submitKYC = useCallback(async (): Promise<{ success: boolean; status: KYCStatus; message: string }> => {
    setIsProcessing(true);
    
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const totalAttempts = Object.values(stageAttempts).reduce((a, b) => a + b, 0);
    
    // Check if locked due to too many attempts
    if (totalAttempts >= MAX_ATTEMPTS * 3) {
      setIsProcessing(false);
      updateApplication({ status: 'locked' });
      return {
        success: false,
        status: 'locked',
        message: 'KYC Locked — Too many failed attempts. Please visit nearest branch or contact support.',
      };
    }

    // Simulate verification logic
    const hasAllRequiredFields = 
      application.name && 
      application.mobile && 
      application.email && 
      application.documentType &&
      application.documentNumber &&
      application.documentFile &&
      application.photoFile;

    if (!hasAllRequiredFields) {
      setIsProcessing(false);
      updateApplication({ status: 'rejected' });
      return {
        success: false,
        status: 'rejected',
        message: 'KYC verification failed. Some required documents or information are missing.',
      };
    }

    // Check for duplicate
    const isDuplicate = await checkDuplicate(
      application.mobile || '', 
      application.documentNumber || ''
    );

    if (isDuplicate) {
      setIsProcessing(false);
      updateApplication({ status: 'rejected' });
      return {
        success: false,
        status: 'rejected',
        message: 'KYC already completed for this document/mobile. Please login or recover your account.',
      };
    }

    // Success!
    setIsProcessing(false);
    updateApplication({ status: 'approved' });
    return {
      success: true,
      status: 'approved',
      message: 'KYC Completed Successfully! Your account is now active.',
    };
  }, [application, stageAttempts, updateApplication, checkDuplicate]);

  const resetApplication = useCallback(() => {
    setApplication(initialApplication);
    setCurrentStage('landing');
    setStageAttempts(initialStageAttempts);
    setIsProcessing(false);
  }, []);

  return (
    <KYCContext.Provider
      value={{
        application,
        currentStage,
        stageAttempts,
        isProcessing,
        updateApplication,
        setCurrentStage,
        incrementAttempt,
        getAttemptInfo,
        checkDuplicate,
        submitKYC,
        resetApplication,
        setIsProcessing,
      }}
    >
      {children}
    </KYCContext.Provider>
  );
}

export function useKYC() {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
}
