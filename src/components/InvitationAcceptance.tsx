import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserPlus, 
  Mail, 
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  type TeamInvitation,
  acceptInvitation,
  mockInvitations,
  mockTeamMembers
} from "@/lib/collaboration";

interface InvitationAcceptanceProps {
  token?: string;
  onAccept?: (member: any) => void;
}

export default function InvitationAcceptance({ token, onAccept }: InvitationAcceptanceProps) {
  const [invitation, setInvitation] = useState<TeamInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    newMember?: any;
  } | null>(null);

  useEffect(() => {
    if (token) {
      // Find invitation by token
      const foundInvitation = mockInvitations.find(inv => inv.token === token);
      setInvitation(foundInvitation || null);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!invitation) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = acceptInvitation(token!, mockInvitations, mockTeamMembers);
      setResult(result);
      
      if (result.success && result.newMember && onAccept) {
        onAccept(result.newMember);
      }
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while processing the invitation"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineInvitation = () => {
    setResult({
      success: false,
      message: "Invitation declined"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Invitation Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This invitation link is invalid or has expired. Please contact the person who invited you for a new invitation.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {result.success ? "Invitation Accepted" : "Invitation Declined"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
            {result.success && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-800 mb-2">Welcome to the team!</h3>
                <p className="text-sm text-green-700">
                  You can now access the workspace and collaborate on projects.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date() >= invitation.expiresAt;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Team Invitation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExpired && (
            <Alert variant="destructive">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                This invitation has expired. Please contact the person who invited you for a new invitation.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{invitation.name || invitation.email}</h3>
                <p className="text-sm text-muted-foreground">{invitation.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Role:</span>
                <span className="capitalize">{invitation.role}</span>
              </div>
              
              {invitation.projectId && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Project:</span>
                  <span>Specific Project</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Expires: {invitation.expiresAt.toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span>Invited by: {invitation.invitedByName}</span>
              </div>
            </div>
          </div>

          {!isExpired && (
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={handleAcceptInvitation}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {isProcessing ? "Accepting..." : "Accept Invitation"}
              </Button>
              <Button 
                variant="outline"
                onClick={handleDeclineInvitation}
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
