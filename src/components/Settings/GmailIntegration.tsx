import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Trash2,
  User,
  Calendar,
  Shield,
  Loader2
} from 'lucide-react';
import { gmailService, type GmailAccount } from '@/lib/gmail-integration';
import { toast } from '@/hooks/use-toast';

interface GmailIntegrationProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function GmailIntegration({ onConnectionChange }: GmailIntegrationProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<GmailAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = () => {
    const accounts = gmailService.getConnectedAccounts();
    setConnectedAccounts(accounts);
    onConnectionChange?.(accounts.length > 0);
  };

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const authUrl = gmailService.getAuthUrl();
      
      // Open OAuth popup
      const popup = window.open(
        authUrl,
        'gmail-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          
          // Check if account was added
          setTimeout(() => {
            loadConnectedAccounts();
          }, 1000);
        }
      }, 1000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect Gmail');
      setIsConnecting(false);
    }
  };

  const handleSyncEmails = async (accountId: string) => {
    setIsSyncing(true);
    setError(null);

    try {
      const result = await gmailService.syncEmails(accountId);
      
      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `Added ${result.messagesAdded} new emails, updated ${result.messagesUpdated} emails.`,
        });
        loadConnectedAccounts();
      } else {
        throw new Error(result.errors.join(', '));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sync emails');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectAccount = (accountId: string) => {
    gmailService.disconnectAccount(accountId);
    loadConnectedAccounts();
    
    toast({
      title: "Account Disconnected",
      description: "Gmail account has been disconnected successfully.",
    });
  };

  const formatLastSync = (lastSync?: Date) => {
    if (!lastSync) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Gmail Integration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your Gmail account to sync emails and manage communications directly from your workspace.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium">Gmail Integration</h3>
              <p className="text-sm text-muted-foreground">
                {connectedAccounts.length > 0 
                  ? `${connectedAccounts.length} account${connectedAccounts.length > 1 ? 's' : ''} connected`
                  : 'No accounts connected'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={connectedAccounts.length > 0 ? "default" : "secondary"}>
              {connectedAccounts.length > 0 ? "Connected" : "Not Connected"}
            </Badge>
            
            {connectedAccounts.length === 0 && (
              <Button 
                onClick={handleConnectGmail}
                disabled={isConnecting}
                size="sm"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect Gmail
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Connected Accounts */}
        {connectedAccounts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Connected Accounts</h4>
            {connectedAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Last sync: {formatLastSync(account.lastSync)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncEmails(account.id)}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnectAccount(account.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Permissions Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permissions & Privacy
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Read emails and metadata (subject, sender, date)</li>
            <li>• Send emails on your behalf</li>
            <li>• Manage email labels and organization</li>
            <li>• Access is limited to your connected Gmail account</li>
            <li>• You can disconnect at any time</li>
          </ul>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Sync
            </h4>
            <p className="text-xs text-muted-foreground">
              Automatically sync your Gmail emails to the workspace email tab for unified management.
            </p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              AI Integration
            </h4>
            <p className="text-xs text-muted-foreground">
              Use Nova AI to analyze, categorize, and respond to your Gmail emails intelligently.
            </p>
          </div>
        </div>

        {/* Setup Instructions */}
        {connectedAccounts.length === 0 && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Getting Started</h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click "Connect Gmail" to start the OAuth process</li>
              <li>Sign in to your Google account and grant permissions</li>
              <li>Return to this page to see your connected account</li>
              <li>Sync emails to start managing them in your workspace</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
