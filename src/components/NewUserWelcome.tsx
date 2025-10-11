import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FolderPlus, 
  Users, 
  Brain, 
  Zap, 
  Target,
  ArrowRight,
  CheckCircle
} from "lucide-react";

interface NewUserWelcomeProps {
  onCreateProject: () => void;
  onViewDemo?: () => void;
}

export default function NewUserWelcome({ onCreateProject, onViewDemo }: NewUserWelcomeProps) {
  const features = [
    {
      icon: <Brain className="w-6 h-6 text-blue-500" />,
      title: "AI-Powered Insights",
      description: "Get intelligent brand recommendations and automated insights"
    },
    {
      icon: <Target className="w-6 h-6 text-green-500" />,
      title: "Brand Mapping",
      description: "Visualize your brand ecosystem with interactive mind maps"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Team Collaboration",
      description: "Invite team members and collaborate in real-time"
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-500" />,
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-full border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Welcome to Nexus
          </span>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your AI Workspace Awaits
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your ideas into organized, intelligent brand workflows with AI-powered insights and seamless team collaboration.
        </p>
      </div>

      {/* Quick Start Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={onCreateProject}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        >
          <FolderPlus className="w-5 h-5 mr-2" />
          Create Your First Brand
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        {onViewDemo && (
          <Button 
            onClick={onViewDemo}
            variant="outline"
            size="lg"
            className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            View Demo Workspace
          </Button>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                {feature.icon}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started Steps */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Getting Started</CardTitle>
          <CardDescription>
            Follow these simple steps to set up your AI-powered workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Use Nova AI for brand insights</p>
              <p className="text-sm text-muted-foreground">Ask Nova AI questions about your brands and get intelligent recommendations</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Organize with brand mapping</p>
              <p className="text-sm text-muted-foreground">Create visual brand maps to see how everything connects</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Invite your team early</p>
              <p className="text-sm text-muted-foreground">Collaboration is key - invite team members to get the full experience</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
