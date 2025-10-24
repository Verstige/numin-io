import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SignInForm from '@/components/auth/SignInForm'
import SignUpForm from '@/components/auth/SignUpForm'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

type AuthMode = 'signin' | 'signup' | 'forgot'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const navigate = useNavigate()

  const handleSignUpSuccess = () => {
    // Redirect to workspace after successful signup
    console.log('🚀 handleSignUpSuccess called - navigating to /workspace');
    
    // Try navigate first
    navigate('/workspace', { replace: true });
    
    // Fallback to window.location after a brief delay if navigate doesn't work
    setTimeout(() => {
      if (window.location.pathname !== '/workspace') {
        console.log('🔄 Navigate didn\'t work, using window.location as fallback');
        window.location.href = '/workspace';
      }
    }, 100);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Nexus</h1>
          <p className="text-muted-foreground">
            {mode === 'signin' && 'Welcome back to your workspace'}
            {mode === 'signup' && 'Start your collaboration journey'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </div>

        {mode === 'signin' && (
          <SignInForm
            onSwitchToSignUp={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot')}
          />
        )}

        {mode === 'signup' && (
          <SignUpForm
            onSuccess={handleSignUpSuccess}
            onSwitchToSignIn={() => setMode('signin')}
          />
        )}

        {mode === 'forgot' && (
          <ForgotPasswordForm
            onBackToSignIn={() => setMode('signin')}
          />
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
