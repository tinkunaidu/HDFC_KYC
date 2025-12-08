import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, User, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '@/context/KYCContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { application } = useKYC();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8" />
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome to your account dashboard
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              KYC Verification Complete
            </CardTitle>
            <CardDescription>
              Your account has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Application ID</p>
                <p className="font-mono font-medium">
                  {application.id?.slice(0, 8).toUpperCase() || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium text-success">Verified</p>
              </div>
              {application.name && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{application.name}</p>
                </div>
              )}
              {application.mobile && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-medium">+91 {application.mobile}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and update your profile information
              </p>
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your uploaded documents
              </p>
              <Button variant="outline" className="w-full">
                View Documents
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your KYC verification is complete
              </p>
              <Button variant="outline" className="w-full" disabled>
                Verified
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

