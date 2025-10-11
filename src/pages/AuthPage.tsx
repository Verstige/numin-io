import { useState } from 'react'
import SignInForm from '@/components/auth/SignInForm'
import SignUpForm from '@/components/auth/SignUpForm'

type AuthMode = 'signin' | 'signup' | 'forgot'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Rena AI</h1>
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
            onSwitchToSignIn={() => setMode('signin')}
          />
        )}

        {mode === 'forgot' && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Password reset functionality will be implemented with Supabase Auth.
            </p>
            <button
              onClick={() => setMode('signin')}
              className="text-primary hover:underline"
            >
              Back to Sign In
            </button>
          </div>
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
