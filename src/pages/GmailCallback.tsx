import { useEffect, useState } from 'react';
import { gmailService } from '@/lib/gmail-integration';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function GmailCallback() {
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

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for tokens
        const account = await gmailService.handleAuthCallback(code, state || '');
        
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
        console.error('Gmail callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to connect Gmail account');
        
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    handleCallback();
  }, []);

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
