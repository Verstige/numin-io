import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Sparkles, FolderPlus, Users, Brain, Zap, Target, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface SignUpFormProps {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

export default function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: string[] = []

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.push('Full name is required')
    } else if (formData.fullName.trim().length < 2) {
      newErrors.push('Full name must be at least 2 characters')
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.push('Email is required')
    } else if (!emailRegex.test(formData.email)) {
      newErrors.push('Please enter a valid email address')
    }

    // Password validation
    if (!formData.password) {
      newErrors.push('Password is required')
    } else if (formData.password.length < 8) {
      newErrors.push('Password must be at least 8 characters')
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.push('Please confirm your password')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match')
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setSuccess(false)

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.fullName.trim()
      )

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors(['An account with this email already exists. Please sign in instead.'])
        } else if (error.message.includes('Password')) {
          setErrors(['Password does not meet requirements.'])
        } else {
          setErrors([error.message])
        }
      } else {
        setSuccess(true)
        setTimeout(() => {
          if (onSuccess) onSuccess()
        }, 2000)
      }
    } catch (error) {
      setErrors(['An unexpected error occurred. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors.length > 0) {
      setErrors([])
    }
  }

  if (success) {
    const features = [
      {
        icon: <Brain className="w-5 h-5 text-blue-500" />,
        title: "AI-Powered Insights",
        description: "Get intelligent brand recommendations and automated insights"
      },
      {
        icon: <Target className="w-5 h-5 text-green-500" />,
        title: "Brand Mapping",
        description: "Visualize your brand ecosystem with interactive mind maps"
      },
      {
        icon: <Users className="w-5 h-5 text-purple-500" />,
        title: "Team Collaboration",
        description: "Invite team members and collaborate in real-time"
      },
      {
        icon: <Zap className="w-5 h-5 text-orange-500" />,
        title: "Smart Automation",
        description: "Automated task tracking and progress monitoring"
      }
    ];

    const steps = [
      {
        step: "1",
        title: "Create Your First Brand",
        description: "Start by adding a brand to your workspace"
      },
      {
        step: "2", 
        title: "Invite Your Team",
        description: "Add team members to collaborate on brands"
      },
      {
        step: "3",
        title: "Get AI Insights",
        description: "Let Nova AI help you manage and optimize your work"
      }
    ];

    return (
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Account Created Successfully!</h3>
                <p className="text-sm text-green-600 mt-2">
                  Please check your email to verify your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Content */}
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-full border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Welcome to Nexus
              </span>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your AI Workspace Awaits
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your ideas into organized, intelligent brand workflows with AI-powered insights and seamless team collaboration.
            </p>
          </div>

          {/* Quick Start Action */}
          <div className="flex justify-center">
            <Button 
              onClick={onSuccess}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Getting Started Steps */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Getting Started</CardTitle>
              <CardDescription>
                Follow these simple steps to set up your AI-powered workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <p className="text-center text-muted-foreground">
          Join Nexus and start collaborating with your team
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
