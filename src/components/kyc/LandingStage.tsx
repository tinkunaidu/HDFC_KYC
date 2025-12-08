import { Shield, FileCheck, Camera, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useKYC } from '@/context/KYCContext';

export function LandingStage() {
  const { setCurrentStage, updateApplication } = useKYC();

  const handleStart = () => {
    updateApplication({ 
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setCurrentStage('details');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 mb-6">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Secure & Fast Digital KYC</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Complete Your KYC in Minutes
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Open your bank account digitally without visiting a branch. 
              Our smart verification system guides you through each step for a seamless experience.
            </p>
            <Button 
              onClick={handleStart}
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-6 h-auto"
            >
              Start KYC Verification
            </Button>
          </div>
        </div>
      </div>

      {/* What You Need Section */}
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          What You'll Need
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Identity Document</h3>
              <p className="text-muted-foreground text-sm">
                Aadhaar Card, PAN Card, Voter ID, or Passport (clear, readable image)
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Passport Photo</h3>
              <p className="text-muted-foreground text-sm">
                Recent photograph with clear face visibility and good lighting
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">5-10 Minutes</h3>
              <p className="text-muted-foreground text-sm">
                Complete the entire process in just a few minutes from your device
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* KYC Guidelines */}
      <div className="bg-muted py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            KYC Guidelines
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Acceptable Address Proof
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Aadhaar Card
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Passport
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Voter ID
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Acceptable Identity Proof
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  PAN Card
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Aadhaar Card
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Passport
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-warning/10 border border-warning/30 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-center">
              <strong>Important:</strong> PAN Card and Aadhaar Card are mandatory for digitally opened accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
