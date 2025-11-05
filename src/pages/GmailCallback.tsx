import { useEffect, useState } from 'react';
import { gmailService } from '@/lib/gmail-integration';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirebaseGmailConfigService } from '@/lib/firebase-gmail-config';

export default function GmailCallback() {
  const { user, loading } = useFirebaseAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for Firebase Auth to finish loading before processing callback
    if (loading) {
      console.log('⏳ Waiting for Firebase Auth to initialize...');
      return;
    }

    const handleCallback = async () => {
      console.log('🔄 GmailCallback component mounted');
      console.log('🔄 Current URL:', window.location.href);
      console.log('🔄 User:', user ? user.uid : 'No user');
      console.log('🔄 Auth loading:', loading);
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('🔄 Gmail callback received:', { 
          code: code ? 'present (' + code.substring(0, 20) + '...)' : 'missing', 
          state, 
          error,
          hasCode: !!code,
          hasError: !!error
        });

        if (error) {
          console.error('❌ OAuth error from Google:', error);
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Google');
        }

        // Ensure service is initialized with user config before handling callback
        if (user) {
          console.log('🔄 Initializing Gmail service with user config for callback, userId:', user.uid);
          try {
            const userConfig = await FirebaseGmailConfigService.getConfig(user.uid);
            console.log('🔄 User config result:', userConfig ? 'found' : 'not found');
            
            if (userConfig && userConfig.clientId && userConfig.clientId.trim() !== '') {
              console.log('✅ Found user config:', {
                hasClientId: !!userConfig.clientId,
                hasClientSecret: !!userConfig.clientSecret,
                redirectUri: userConfig.redirectUri
              });
              await gmailService.initializeWithUserConfig(user.uid);
              gmailService.setCurrentUser(user.uid);
              console.log('✅ Service initialized with user config');
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
                    'https://www.googleapis.com/auth/gmail.labels',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email'
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
              console.log('ℹ️ Using global config as fallback after error');
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

        // Verify service is initialized before proceeding
        if (!gmailService.isInitialized()) {
          throw new Error('Gmail service failed to initialize. Please check your OAuth configuration.');
        }
        console.log('✅ Service is initialized, proceeding with token exchange');

        console.log('🔄 Exchanging authorization code for tokens...');
        // Exchange code for tokens
        const account = await gmailService.handleAuthCallback(code, state || '');
        
        console.log('✅ Gmail account connected successfully:', account.email);
        setStatus('success');
        setMessage(`Gmail account ${account.email} connected successfully!`);
        
        // Send message to parent window
        if (window.opener) {
          try {
            window.opener.postMessage({ 
              type: 'GMAIL_CONNECTED', 
              account 
            }, window.location.origin);
            console.log('✅ Message sent to parent window');
          } catch (e) {
            console.error('❌ Error sending message to parent:', e);
          }
        }
        
        // Close popup after a short delay
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            console.log('ℹ️ Could not close window automatically (may be blocked by browser)');
          }
        }, 2000);

      } catch (error) {
        console.error('❌ Gmail callback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect Gmail account';
        setStatus('error');
        setMessage(errorMessage);
        
        // Send error message to parent window
        if (window.opener) {
          try {
            window.opener.postMessage({ 
              type: 'GMAIL_CONNECTION_ERROR', 
              error: errorMessage 
            }, window.location.origin);
            console.log('✅ Error message sent to parent window');
          } catch (e) {
            console.error('❌ Error sending error message to parent:', e);
          }
        }
        
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            console.log('ℹ️ Could not close window automatically (may be blocked by browser)');
          }
        }, 5000);
      }
    };

    handleCallback();
  }, [user, loading]);

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
