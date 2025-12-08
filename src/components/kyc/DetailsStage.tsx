import { useState } from 'react';
import { ArrowRight, AlertCircle, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useKYC } from '@/context/KYCContext';
import { DocumentType, DOCUMENT_LABELS, ValidationError, MAX_ATTEMPTS } from '@/types/kyc';
import { ProgressIndicator } from './ProgressIndicator';

export function DetailsStage() {
  const { 
    application, 
    updateApplication, 
    setCurrentStage, 
    checkDuplicate, 
    getAttemptInfo,
    incrementAttempt,
    currentStage 
  } = useKYC();
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: application.name || '',
    mobile: application.mobile || '',
    email: application.email || '',
    documentType: application.documentType || '' as DocumentType,
    documentNumber: application.documentNumber || '',
  });

  const attemptInfo = getAttemptInfo('details');

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];
    
    if (!formData.name.trim()) {
      newErrors.push({ field: 'name', message: 'Full name is required' });
    } else if (formData.name.trim().length < 3) {
      newErrors.push({ field: 'name', message: 'Name must be at least 3 characters' });
    }
    
    if (!formData.mobile.trim()) {
      newErrors.push({ field: 'mobile', message: 'Mobile number is required' });
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.push({ field: 'mobile', message: 'Enter a valid 10-digit Indian mobile number' });
    }
    
    if (!formData.email.trim()) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Enter a valid email address' });
    }
    
    if (!formData.documentType) {
      newErrors.push({ field: 'documentType', message: 'Please select a document type' });
    }
    
    if (!formData.documentNumber.trim()) {
      newErrors.push({ field: 'documentNumber', message: 'Document number is required' });
    } else {
      // Validate document number format based on type
      const docNum = formData.documentNumber.replace(/\s/g, '').toUpperCase();
      if (formData.documentType === 'aadhaar' && !/^\d{12}$/.test(docNum.replace(/-/g, ''))) {
        newErrors.push({ field: 'documentNumber', message: 'Aadhaar must be 12 digits' });
      } else if (formData.documentType === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(docNum)) {
        newErrors.push({ field: 'documentNumber', message: 'Invalid PAN format (e.g., ABCDE1234F)' });
      }
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateError(null);
    
    if (!validateForm()) {
      incrementAttempt('details');
      return;
    }
    
    setIsChecking(true);
    
    // Check for duplicate
    const isDuplicate = await checkDuplicate(formData.mobile, formData.documentNumber);
    
    if (isDuplicate) {
      setIsChecking(false);
      setDuplicateError('KYC already completed for this mobile number or document. Please login to your existing account or contact support.');
      incrementAttempt('details');
      return;
    }
    
    // Update application and proceed
    updateApplication({
      name: formData.name.trim(),
      mobile: formData.mobile.replace(/\D/g, ''),
      email: formData.email.trim().toLowerCase(),
      documentType: formData.documentType,
      documentNumber: formData.documentNumber.replace(/\s/g, '').toUpperCase(),
    });
    
    setIsChecking(false);
    setCurrentStage('document_upload');
  };

  const getError = (field: string) => errors.find(e => e.field === field)?.message;

  return (
    <div className="min-h-screen bg-background">
      <ProgressIndicator currentStage={currentStage} />
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Personal Details</CardTitle>
            <CardDescription>
              Enter your details as they appear on your identity document
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attemptInfo.count > 0 && attemptInfo.count < MAX_ATTEMPTS && (
              <Alert className="mb-6 border-warning bg-warning/10">
                <Info className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning">
                  Attempt {attemptInfo.count} of {attemptInfo.maxAttempts}. Please review your details carefully.
                </AlertDescription>
              </Alert>
            )}
            
            {duplicateError && (
              <Alert className="mb-6 border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {duplicateError}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={getError('name') ? 'border-destructive' : ''}
                />
                {getError('name') && (
                  <p className="text-sm text-destructive">{getError('name')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className={getError('mobile') ? 'border-destructive' : ''}
                />
                {getError('mobile') && (
                  <p className="text-sm text-destructive">{getError('mobile')}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This number will be used for OTP verification
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={getError('email') ? 'border-destructive' : ''}
                />
                {getError('email') && (
                  <p className="text-sm text-destructive">{getError('email')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value: DocumentType) => setFormData(prev => ({ ...prev, documentType: value, documentNumber: '' }))}
                >
                  <SelectTrigger className={getError('documentType') ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getError('documentType') && (
                  <p className="text-sm text-destructive">{getError('documentType')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Document Number *</Label>
                <Input
                  id="documentNumber"
                  placeholder={
                    formData.documentType === 'aadhaar' ? 'XXXX-XXXX-XXXX' :
                    formData.documentType === 'pan' ? 'ABCDE1234F' :
                    formData.documentType === 'passport' ? 'A1234567' :
                    'Enter document number'
                  }
                  value={formData.documentNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value.toUpperCase() }))}
                  className={getError('documentNumber') ? 'border-destructive' : ''}
                />
                {getError('documentNumber') && (
                  <p className="text-sm text-destructive">{getError('documentNumber')}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Continue to Document Upload
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
