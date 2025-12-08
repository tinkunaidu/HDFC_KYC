import { CheckCircle, XCircle, Lock, Phone, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useKYC } from '@/context/KYCContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function ResultStage() {
  const { application, resetApplication, stageAttempts } = useKYC();
  const navigate = useNavigate();
  
  const status = application.status || 'pending';
  const totalAttempts = Object.values(stageAttempts).reduce((a, b) => a + b, 0);
  const canRetry = status === 'rejected' && totalAttempts < 9;

  const handleStartOver = () => {
    resetApplication();
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Status Icon */}
          <div
            className={cn(
              'w-24 h-24 mx-auto rounded-full flex items-center justify-center',
              status === 'approved' && 'bg-success/10',
              status === 'rejected' && 'bg-destructive/10',
              status === 'locked' && 'bg-muted'
            )}
          >
            {status === 'approved' && (
              <CheckCircle className="w-12 h-12 text-success" />
            )}
            {status === 'rejected' && (
              <XCircle className="w-12 h-12 text-destructive" />
            )}
            {status === 'locked' && (
              <Lock className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          
          {/* Status Title */}
          <div>
            <h1
              className={cn(
                'text-2xl font-bold mb-2',
                status === 'approved' && 'text-success',
                status === 'rejected' && 'text-destructive',
                status === 'locked' && 'text-muted-foreground'
              )}
            >
              {status === 'approved' && 'KYC Verification Successful!'}
              {status === 'rejected' && 'KYC Verification Failed'}
              {status === 'locked' && 'KYC Verification Locked'}
            </h1>
            
            {/* Status Description */}
            <p className="text-muted-foreground">
              {status === 'approved' && (
                'Congratulations! Your identity has been verified successfully. Your account is now active.'
              )}
              {status === 'rejected' && canRetry && (
                'Your verification was unsuccessful. Please ensure your documents are clear and try again.'
              )}
              {status === 'rejected' && !canRetry && (
                'Your verification was unsuccessful. You have exhausted all retry attempts.'
              )}
              {status === 'locked' && (
                'Your KYC verification has been locked due to multiple failed attempts.'
              )}
            </p>
          </div>
          
          {/* Details for Approved */}
          {status === 'approved' && (
            <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-left space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Application ID:</span>{' '}
                <span className="font-mono font-medium">{application.id?.slice(0, 8).toUpperCase()}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Name:</span>{' '}
                <span className="font-medium">{application.name}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Mobile:</span>{' '}
                <span className="font-medium">+91 {application.mobile}</span>
              </p>
            </div>
          )}
          
          {/* Tips for Rejected */}
          {status === 'rejected' && canRetry && (
            <div className="bg-muted rounded-lg p-4 text-left space-y-2">
              <p className="font-medium text-sm mb-2">Tips for next attempt:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure document is not blurry or cropped</li>
                <li>• Check all details match your document</li>
                <li>• Upload a clear, front-facing photo</li>
                <li>• Verify your mobile number is correct</li>
              </ul>
            </div>
          )}
          
          {/* Contact Info for Locked */}
          {(status === 'locked' || (status === 'rejected' && !canRetry)) && (
            <div className="bg-muted rounded-lg p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Please visit your nearest branch or contact our support team for assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>1800-XXX-XXXX</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4 text-primary" />
                  <span>Find Branch</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {status === 'approved' && (
              <Button onClick={handleGoToDashboard} className="flex-1" size="lg">
                Go to Dashboard
              </Button>
            )}
            
            {status === 'rejected' && canRetry && (
              <Button onClick={handleStartOver} className="flex-1" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            
            {(status === 'locked' || (status === 'rejected' && !canRetry)) && (
              <>
                <Button variant="outline" className="flex-1" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button variant="outline" className="flex-1" size="lg">
                  <Home className="mr-2 h-4 w-4" />
                  Find Branch
                </Button>
              </>
            )}
          </div>
          
          {/* Start New Application (for testing) */}
          {status !== 'locked' && (
            <Button
              variant="ghost"
              onClick={handleStartOver}
              className="text-muted-foreground"
            >
              Start New Application
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
