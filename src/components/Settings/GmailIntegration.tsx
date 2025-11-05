import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  Loader2,
  Settings
} from 'lucide-react';
import { gmailService, type GmailAccount } from '@/lib/gmail-integration';
import { FirebaseGmailConfigService } from '@/lib/firebase-gmail-config';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { toast } from '@/hooks/use-toast';

interface GmailIntegrationProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function GmailIntegration({ onConnectionChange }: GmailIntegrationProps) {
  const { user } = useFirebaseAuth();
  const [connectedAccounts, setConnectedAccounts] = useState<GmailAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [userConfig, setUserConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: `${window.location.origin}/auth/gmail/callback`
  });
  const [hasUserConfig, setHasUserConfig] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  useEffect(() => {
    loadConnectedAccounts();
    loadUserConfig();
  }, [user]);

  const loadConnectedAccounts = () => {
    const accounts = gmailService.getConnectedAccounts();
    setConnectedAccounts(accounts);
    onConnectionChange?.(accounts.length > 0);
  };

  const loadUserConfig = async () => {
    if (!user) {
      setIsLoadingConfig(false);
      return;
    }
    
    setIsLoadingConfig(true);
    try {
      const config = await FirebaseGmailConfigService.getConfig(user.uid);
      if (config && config.clientId) {
        setUserConfig({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri: config.redirectUri
        });
        setHasUserConfig(true);
        
        // Initialize service with user config
        await gmailService.initializeWithUserConfig(user.uid);
        gmailService.setCurrentUser(user.uid);
      } else {
        // Check for global config
        const globalClientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
        if (globalClientId && globalClientId.trim() !== '') {
          setHasUserConfig(false);
          // Initialize with global config
          gmailService.initialize({
            clientId: globalClientId,
            clientSecret: import.meta.env.VITE_GMAIL_CLIENT_SECRET || '',
            redirectUri: `${window.location.origin}/auth/gmail/callback`,
            scopes: [
              'https://www.googleapis.com/auth/gmail.readonly',
              'https://www.googleapis.com/auth/gmail.send',
              'https://www.googleapis.com/auth/gmail.modify',
              'https://www.googleapis.com/auth/gmail.labels'
            ]
          });
        } else {
          setHasUserConfig(false);
        }
      }
    } catch (error) {
      console.error('Error loading user config:', error);
      setHasUserConfig(false);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to save Gmail configuration.",
        variant: "destructive",
      });
      return;
    }

    if (!userConfig.clientId.trim()) {
      toast({
        title: "Error",
        description: "Client ID is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await FirebaseGmailConfigService.saveConfig(user.uid, {
        clientId: userConfig.clientId,
        clientSecret: userConfig.clientSecret,
        redirectUri: userConfig.redirectUri
      });

      // Reinitialize service with new config
      await gmailService.initializeWithUserConfig(user.uid);
      gmailService.setCurrentUser(user.uid);
      
      setHasUserConfig(true);
      setShowConfigDialog(false);
      
      toast({
        title: "Success",
        description: "Gmail configuration saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save configuration.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfig = async () => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete your Gmail configuration? You will need to use the global configuration if available.')) {
      return;
    }

    try {
      await FirebaseGmailConfigService.deleteConfig(user.uid);
      setUserConfig({
        clientId: '',
        clientSecret: '',
        redirectUri: `${window.location.origin}/auth/gmail/callback`
      });
      setHasUserConfig(false);
      
      // Try to use global config
      const globalClientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
      if (globalClientId && globalClientId.trim() !== '') {
        gmailService.initialize({
          clientId: globalClientId,
          clientSecret: import.meta.env.VITE_GMAIL_CLIENT_SECRET || '',
          redirectUri: `${window.location.origin}/auth/gmail/callback`,
          scopes: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.labels'
          ]
        });
      }
      
      toast({
        title: "Success",
        description: "Gmail configuration deleted. Using global configuration if available.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete configuration.",
        variant: "destructive",
      });
    }
  };

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Ensure service is initialized
      if (!gmailService.isInitialized()) {
        if (hasUserConfig && user) {
          await gmailService.initializeWithUserConfig(user.uid);
        } else {
          // Try global config
          const globalClientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
          if (globalClientId && globalClientId.trim() !== '') {
            gmailService.initialize({
              clientId: globalClientId,
              clientSecret: import.meta.env.VITE_GMAIL_CLIENT_SECRET || '',
              redirectUri: `${window.location.origin}/auth/gmail/callback`,
              scopes: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/gmail.labels',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
              ]
            });
          } else {
            throw new Error(
              'Gmail integration is not configured. Please set up your Google OAuth credentials in the settings below.'
            );
          }
        }
      }

      const authUrl = gmailService.getAuthUrl();
      
      // Validate the URL contains client_id
      if (!authUrl.includes('client_id=') || authUrl.includes('client_id=&')) {
        throw new Error(
          'Invalid Gmail OAuth configuration. Please check your Gmail OAuth credentials in settings.'
        );
      }
      
      // Open OAuth popup
      const popup = window.open(
        authUrl,
        'gmail-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for popup completion via message passing (more reliable than window.closed)
      const messageHandler = (event: MessageEvent) => {
        // Accept messages from same origin only
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GMAIL_CONNECTED') {
          console.log('✅ Gmail connection message received:', event.data);
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);
          setIsConnecting(false);
          
          // Check if account was added
          setTimeout(() => {
            loadConnectedAccounts();
          }, 500);
          
          toast({
            title: "Success",
            description: `Gmail account ${event.data.account?.email || ''} connected successfully!`,
          });
        } else if (event.data.type === 'GMAIL_CONNECTION_ERROR') {
          console.error('❌ Gmail connection error message received:', event.data);
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);
          setIsConnecting(false);
          
          toast({
            title: "Connection Failed",
            description: event.data.error || "Failed to connect Gmail account",
            variant: "destructive",
          });
        }
      };

      window.addEventListener('message', messageHandler);

      // Fallback: Check if popup is closed (for browsers that allow it)
      const checkClosed = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            setIsConnecting(false);
            
            // Check if account was added (in case message wasn't received)
            setTimeout(() => {
              loadConnectedAccounts();
            }, 1000);
          }
        } catch (e) {
          // Cross-origin policy might block this, that's okay
          // We rely on message passing instead
        }
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect Gmail';
      setError(errorMessage);
      setIsConnecting(false);
      
      toast({
        title: "Gmail Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
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

        {/* OAuth Configuration Section */}
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                OAuth Configuration
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoadingConfig ? (
                  "Loading configuration..."
                ) : hasUserConfig ? (
                  "Using your personal Gmail OAuth credentials"
                ) : import.meta.env.VITE_GMAIL_CLIENT_ID ? (
                  "Using global configuration"
                ) : (
                  "No configuration set. Add your credentials below."
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasUserConfig && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteConfig}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (hasUserConfig && user) {
                    // Load existing config into dialog
                    const config = await FirebaseGmailConfigService.getConfig(user.uid);
                    if (config) {
                      setUserConfig({
                        clientId: config.clientId,
                        clientSecret: config.clientSecret,
                        redirectUri: config.redirectUri
                      });
                    }
                  } else {
                    // Reset to default
                    setUserConfig({
                      clientId: '',
                      clientSecret: '',
                      redirectUri: `${window.location.origin}/auth/gmail/callback`
                    });
                  }
                  setShowConfigDialog(true);
                }}
              >
                <Settings className="w-4 h-4 mr-1" />
                {hasUserConfig ? "Update Config" : "Set Your Own"}
              </Button>
            </div>
          </div>
        </div>

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
                disabled={isConnecting || isLoadingConfig}
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
              <li>Set up your Gmail OAuth credentials (click "Set Your Own" above) or use global configuration</li>
              <li>Click "Connect Gmail" to start the OAuth process</li>
              <li>Sign in to your Google account and grant permissions</li>
              <li>Return to this page to see your connected account</li>
              <li>Sync emails to start managing them in your workspace</li>
            </ol>
          </div>
        )}

        {/* Configuration Dialog */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gmail OAuth Configuration</DialogTitle>
              <DialogDescription>
                Enter your Google OAuth 2.0 credentials. These will be stored securely and used only for your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="config-client-id">Client ID *</Label>
                <Input
                  id="config-client-id"
                  type="text"
                  value={userConfig.clientId}
                  onChange={(e) => setUserConfig({ ...userConfig, clientId: e.target.value })}
                  placeholder="xxxxx.apps.googleusercontent.com"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get this from Google Cloud Console
                </p>
              </div>
              <div>
                <Label htmlFor="config-client-secret">Client Secret</Label>
                <Input
                  id="config-client-secret"
                  type="password"
                  value={userConfig.clientSecret}
                  onChange={(e) => setUserConfig({ ...userConfig, clientSecret: e.target.value })}
                  placeholder="GOCSPX-xxxxx"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional but recommended for token refresh
                </p>
              </div>
              <div>
                <Label htmlFor="config-redirect-uri">Redirect URI</Label>
                <Input
                  id="config-redirect-uri"
                  type="text"
                  value={userConfig.redirectUri}
                  onChange={(e) => setUserConfig({ ...userConfig, redirectUri: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must match the URI configured in Google Cloud Console
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">
                  Setup Instructions:
                </p>
                <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console</a></li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the Gmail API</li>
                  <li>Go to "APIs & Services" → "Credentials"</li>
                  <li>Click "Create Credentials" → "OAuth 2.0 Client ID"</li>
                  <li>Choose "Web application"</li>
                  <li>Add authorized redirect URI: <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded text-xs">{userConfig.redirectUri}</code></li>
                  <li>Copy the Client ID and Secret here</li>
                </ol>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveConfig}>
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
