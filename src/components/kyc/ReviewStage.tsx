import { ArrowLeft, Send, User, FileText, Phone, Mail, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useKYC } from '@/context/KYCContext';
import { DOCUMENT_LABELS } from '@/types/kyc';
import { ProgressIndicator } from './ProgressIndicator';

export function ReviewStage() {
  const { 
    application, 
    setCurrentStage, 
    submitKYC,
    isProcessing,
    currentStage 
  } = useKYC();

  const handleSubmit = async () => {
    const result = await submitKYC();
    setCurrentStage('result');
  };

  const maskDocumentNumber = (docNum: string, type: string) => {
    if (!docNum) return 'N/A';
    
    if (type === 'aadhaar') {
      return `XXXX-XXXX-${docNum.slice(-4)}`;
    } else if (type === 'pan') {
      return `${docNum.slice(0, 2)}XXXXX${docNum.slice(-2)}`;
    }
    return `${docNum.slice(0, 2)}***${docNum.slice(-2)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <ProgressIndicator currentStage={currentStage} />
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Review Your Application</CardTitle>
            <CardDescription>
              Please review your details before submitting for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Details
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-medium">{application.name || 'N/A'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Mobile
                  </span>
                  <span className="font-medium">+91 {application.mobile || 'N/A'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                  <span className="font-medium">{application.email || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {/* Document Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Document Details
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document Type</span>
                  <span className="font-medium">
                    {application.documentType ? DOCUMENT_LABELS[application.documentType] : 'N/A'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document Number</span>
                  <span className="font-medium font-mono">
                    {maskDocumentNumber(application.documentNumber || '', application.documentType || '')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Uploaded Files Preview */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Uploaded Documents
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Document Preview */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Identity Document</p>
                  <div className="aspect-[4/3] bg-muted rounded-lg border overflow-hidden">
                    {application.documentPreview ? (
                      <img 
                        src={application.documentPreview} 
                        alt="Document" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {application.documentFile && (
                    <p className="text-xs text-muted-foreground truncate">
                      {application.documentFile.name}
                    </p>
                  )}
                </div>
                
                {/* Photo Preview */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Your Photo</p>
                  <div className="aspect-[4/3] bg-muted rounded-lg border overflow-hidden flex items-center justify-center">
                    {application.photoPreview ? (
                      <img 
                        src={application.photoPreview} 
                        alt="Photo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  {application.photoFile && (
                    <p className="text-xs text-muted-foreground truncate">
                      {application.photoFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Consent Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                By submitting, I confirm that all information provided is accurate and I authorize 
                the bank to verify my identity using the documents uploaded. I understand that 
                false information may result in rejection of my application.
              </p>
            </div>
            
            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStage('photo_upload')}
                className="flex-1"
                disabled={isProcessing}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Submit for Verification
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
