import { useState, useRef, useCallback } from 'react';
import { ArrowRight, ArrowLeft, Upload, X, AlertCircle, CheckCircle, Info, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useKYC } from '@/context/KYCContext';
import { MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES, MAX_ATTEMPTS } from '@/types/kyc';
import { ProgressIndicator } from './ProgressIndicator';
import { cn } from '@/lib/utils';

interface FileValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export function PhotoUploadStage() {
  const { 
    application, 
    updateApplication, 
    setCurrentStage, 
    currentStage,
    getAttemptInfo,
    incrementAttempt 
  } = useKYC();
  
  const [file, setFile] = useState<File | null>(application.photoFile || null);
  const [preview, setPreview] = useState<string | null>(application.photoPreview || null);
  const [validation, setValidation] = useState<FileValidation>({ isValid: false });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const attemptInfo = getAttemptInfo('photo_upload');

  const validateFile = useCallback((file: File): FileValidation => {
    const warnings: string[] = [];
    
    // Check file type - only images for photo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload JPG or PNG images only.',
      };
    }
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return {
        isValid: false,
        error: `File too large (${fileSizeMB.toFixed(1)}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`,
      };
    }
    
    if (fileSizeMB < 0.01) {
      warnings.push('Image size is very small. Please ensure your face is clearly visible.');
    }
    
    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const result = validateFile(selectedFile);
    setValidation(result);
    
    if (!result.isValid) {
      incrementAttempt('photo_upload');
      setFile(null);
      setPreview(null);
      return;
    }
    
    setFile(selectedFile);
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, [validateFile, incrementAttempt]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setValidation({ isValid: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    if (!file) {
      setValidation({ isValid: false, error: 'Please upload your photo to continue.' });
      incrementAttempt('photo_upload');
      return;
    }
    
    updateApplication({
      photoFile: file,
      photoPreview: preview,
    });
    
    setCurrentStage('review');
  };

  return (
    <div className="min-h-screen bg-background">
      <ProgressIndicator currentStage={currentStage} />
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upload Your Photo</CardTitle>
            <CardDescription>
              Upload a recent passport-size photograph with clear face visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {attemptInfo.count > 0 && attemptInfo.count < MAX_ATTEMPTS && (
              <Alert className="border-warning bg-warning/10">
                <Info className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning">
                  Attempt {attemptInfo.count} of {attemptInfo.maxAttempts}. 
                  Ensure your photo meets the requirements below.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Photo Requirements */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Photo Requirements
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Recent passport-size photograph</li>
                <li>• Front-facing with neutral expression</li>
                <li>• Good lighting, no shadows on face</li>
                <li>• Plain background preferred</li>
                <li>• No sunglasses or hats</li>
              </ul>
            </div>
            
            {/* Upload Area */}
            <div
              className={cn(
                'relative border-2 border-dashed rounded-lg p-8 transition-colors',
                isDragging && 'border-primary bg-primary/5',
                !isDragging && !file && 'border-muted-foreground/30 hover:border-primary/50',
                file && validation.isValid && 'border-success bg-success/5',
                validation.error && 'border-destructive bg-destructive/5'
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {!file ? (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    Drag and drop your photo here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse files
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Supported formats: JPG, PNG (Max {MAX_FILE_SIZE_MB}MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {preview && (
                      <img 
                        src={preview} 
                        alt="Photo preview" 
                        className="w-32 h-32 object-cover rounded-full border-4 border-background shadow-lg"
                      />
                    )}
                    <div className="flex-1 pt-4">
                      <div className="flex items-center gap-2">
                        {validation.isValid ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        )}
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      {validation.isValid && (
                        <p className="text-sm text-success mt-1">
                          Photo validated successfully
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {validation.warnings && validation.warnings.length > 0 && (
                    <Alert className="border-warning bg-warning/10">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <AlertDescription className="text-warning">
                        {validation.warnings.join(' ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            
            {/* Error Display */}
            {validation.error && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {validation.error}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStage('document_upload')}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                className="flex-1"
                disabled={!file || !validation.isValid}
              >
                Continue to Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
