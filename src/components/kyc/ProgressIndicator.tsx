import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KYCStage } from '@/types/kyc';

interface ProgressIndicatorProps {
  currentStage: KYCStage;
}

const stages: { key: KYCStage; label: string }[] = [
  { key: 'details', label: 'Your Details' },
  { key: 'document_upload', label: 'Document' },
  { key: 'photo_upload', label: 'Photo' },
  { key: 'review', label: 'Review' },
];

const stageOrder: Record<KYCStage, number> = {
  landing: 0,
  details: 1,
  document_upload: 2,
  photo_upload: 3,
  review: 4,
  result: 5,
};

export function ProgressIndicator({ currentStage }: ProgressIndicatorProps) {
  const currentIndex = stageOrder[currentStage];

  if (currentStage === 'landing' || currentStage === 'result') {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const stageIndex = stageOrder[stage.key];
          const isCompleted = currentIndex > stageIndex;
          const isCurrent = currentIndex === stageIndex;
          const isUpcoming = currentIndex < stageIndex;

          return (
            <div key={stage.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                    isCompleted && 'bg-success text-success-foreground',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isUpcoming && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center whitespace-nowrap',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-success',
                    isUpcoming && 'text-muted-foreground'
                  )}
                >
                  {stage.label}
                </span>
              </div>
              
              {index < stages.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 rounded-full transition-all duration-300',
                    currentIndex > stageIndex + 1 && 'bg-success',
                    currentIndex === stageIndex + 1 && 'bg-gradient-to-r from-success to-muted',
                    currentIndex <= stageIndex && 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
