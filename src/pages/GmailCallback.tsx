import { useEffect, useState } from 'react';
import { gmailService } from '@/lib/gmail-integration';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirebaseGmailConfigService } from '@/lib/firebase-gmail-config';

export default function GmailCallback() {
  const { user } = useFirebaseAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('🔄 Gmail callback received:', { code: code ? 'present' : 'missing', state, error });

        if (error) {
          console.error('❌ OAuth error from Google:', error);
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Google');
        }

        // Ensure service is initialized with user config before handling callback
        if (user) {
          console.log('🔄 Initializing Gmail service with user config for callback');
          try {
            const userConfig = await FirebaseGmailConfigService.getConfig(user.uid);
            if (userConfig && userConfig.clientId) {
              console.log('✅ Found user config, initializing service');
              await gmailService.initializeWithUserConfig(user.uid);
              gmailService.setCurrentUser(user.uid);
            } else {
              // Try global config
              const globalClientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
              if (globalClientId && globalClientId.trim() !== '') {
                console.log('ℹ️ Using global config as fallback');
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
                throw new Error('Gmail OAuth not configured. Please set up your credentials in settings.');
              }
            }
          } catch (configError) {
            console.error('❌ Error loading config:', configError);
            // Try global config as fallback
            const globalClientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
            if (globalClientId && globalClientId.trim() !== '') {
              console.log('ℹ️ Using global config as fallback');
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
              throw new Error('Gmail OAuth not configured. Please set up your credentials in settings.');
            }
          }
        } else {
          // No user, try global config
          const globalClientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
          if (globalClientId && globalClientId.trim() !== '') {
            console.log('ℹ️ No user, using global config');
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
            throw new Error('Gmail OAuth not configured and no user logged in.');
          }
        }

        console.log('🔄 Exchanging authorization code for tokens...');
        // Exchange code for tokens
        const account = await gmailService.handleAuthCallback(code, state || '');
        
        console.log('✅ Gmail account connected successfully:', account.email);
        setStatus('success');
        setMessage(`Gmail account ${account.email} connected successfully!`);
        
        // Close popup and redirect to settings
        setTimeout(() => {
          window.close();
          if (window.opener) {
            window.opener.postMessage({ type: 'GMAIL_CONNECTED', account }, '*');
          }
        }, 2000);

      } catch (error) {
        console.error('❌ Gmail callback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect Gmail account';
        setStatus('error');
        setMessage(errorMessage);
        
        setTimeout(() => {
          window.close();
        }, 5000);
      }
    };

    handleCallback();
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
                <h2 className="text-xl font-semibold">Connecting Gmail...</h2>
                <p className="text-muted-foreground">Please wait while we connect your Gmail account.</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <h2 className="text-xl font-semibold text-green-700">Success!</h2>
                <p className="text-green-600">{message}</p>
                <p className="text-sm text-muted-foreground">This window will close automatically.</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold text-red-700">Connection Failed</h2>
                <p className="text-red-600">{message}</p>
                <p className="text-sm text-muted-foreground">This window will close automatically.</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
