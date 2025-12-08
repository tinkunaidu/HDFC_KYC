import { useKYC } from '@/context/KYCContext';
import { LandingStage } from './LandingStage';
import { DetailsStage } from './DetailsStage';
import { DocumentUploadStage } from './DocumentUploadStage';
import { PhotoUploadStage } from './PhotoUploadStage';
import { ReviewStage } from './ReviewStage';
import { ResultStage } from './ResultStage';

export function KYCWizard() {
  const { currentStage } = useKYC();

  const renderStage = () => {
    switch (currentStage) {
      case 'landing':
        return <LandingStage />;
      case 'details':
        return <DetailsStage />;
      case 'document_upload':
        return <DocumentUploadStage />;
      case 'photo_upload':
        return <PhotoUploadStage />;
      case 'review':
        return <ReviewStage />;
      case 'result':
        return <ResultStage />;
      default:
        return <LandingStage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderStage()}
    </div>
  );
}
