import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle, 
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';
import { generateBusinessAnalysis, type WorkspaceContext } from '@/lib/gemini';

interface BusinessIntelligencePanelProps {
  workspaceContext: WorkspaceContext;
  onAnalysisComplete?: (analysis: string) => void;
  className?: string;
}

type AnalysisType = 'portfolio' | 'team' | 'strategy' | 'risks' | 'opportunities';

const BusinessIntelligencePanel: React.FC<BusinessIntelligencePanelProps> = ({
  workspaceContext,
  onAnalysisComplete,
  className = ""
}) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analysisTypes = [
    {
      type: 'portfolio' as AnalysisType,
      title: 'Portfolio Analysis',
      description: 'Strategic project insights and resource allocation',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'blue'
    },
    {
      type: 'team' as AnalysisType,
      title: 'Team Performance',
      description: 'Collaboration patterns and optimization',
      icon: <Users className="w-5 h-5" />,
      color: 'green'
    },
    {
      type: 'strategy' as AnalysisType,
      title: 'Business Strategy',
      description: 'Strategic recommendations and planning',
      icon: <Target className="w-5 h-5" />,
      color: 'purple'
    },
    {
      type: 'risks' as AnalysisType,
      title: 'Risk Assessment',
      description: 'Potential risks and mitigation strategies',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'red'
    },
    {
      type: 'opportunities' as AnalysisType,
      title: 'Growth Opportunities',
      description: 'Identify strategic advantages and growth areas',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'yellow'
    }
  ];

  const handleAnalysis = async (analysisType: AnalysisType) => {
    setIsAnalyzing(true);
    setSelectedAnalysis(analysisType);
    
    try {
      const result = await generateBusinessAnalysis(workspaceContext, analysisType);
      setAnalysisResult(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult('Sorry, I encountered an error generating the analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20',
      green: 'bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20',
      purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20',
      red: 'bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20',
      yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Calculate business metrics
  const businessMetrics = {
    totalProjects: workspaceContext.projects.length,
    activeProjects: workspaceContext.projects.filter(p => p.status === 'In Progress').length,
    completedProjects: workspaceContext.projects.filter(p => p.status === 'Completed').length,
    totalTeamMembers: workspaceContext.teamMembers.length,
    activeTeamMembers: workspaceContext.teamMembers.filter(m => m.status === 'active').length,
    totalTasks: workspaceContext.tasks.length,
    completedTasks: workspaceContext.tasks.filter(t => t.status === 'Completed').length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Business Metrics Overview */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Business Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{businessMetrics.totalProjects}</div>
              <div className="text-sm text-gray-400">Total Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{businessMetrics.activeProjects}</div>
              <div className="text-sm text-gray-400">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{businessMetrics.totalTeamMembers}</div>
              <div className="text-sm text-gray-400">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{businessMetrics.totalTasks}</div>
              <div className="text-sm text-gray-400">Total Tasks</div>
            </div>
          </div>
          
          {/* Progress Indicators */}
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Project Completion Rate</span>
                <span className="text-gray-400">
                  {businessMetrics.totalProjects > 0 
                    ? Math.round((businessMetrics.completedProjects / businessMetrics.totalProjects) * 100)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={businessMetrics.totalProjects > 0 
                  ? (businessMetrics.completedProjects / businessMetrics.totalProjects) * 100
                  : 0
                } 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Task Completion Rate</span>
                <span className="text-gray-400">
                  {businessMetrics.totalTasks > 0 
                    ? Math.round((businessMetrics.completedTasks / businessMetrics.totalTasks) * 100)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={businessMetrics.totalTasks > 0 
                  ? (businessMetrics.completedTasks / businessMetrics.totalTasks) * 100
                  : 0
                } 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Types */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Business Intelligence Analysis
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Get deep insights into your business ecosystem with AI-powered analysis
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisTypes.map((analysis) => (
              <Button
                key={analysis.type}
                variant="ghost"
                className={`h-auto p-4 border rounded-lg transition-all duration-200 ${getColorClasses(analysis.color)}`}
                onClick={() => handleAnalysis(analysis.type)}
                disabled={isAnalyzing}
              >
                <div className="text-left w-full">
                  <div className="flex items-center gap-3 mb-2">
                    {analysis.icon}
                    <span className="font-medium">{analysis.title}</span>
                  </div>
                  <p className="text-xs opacity-80">{analysis.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {(selectedAnalysis || analysisResult) && (
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {selectedAnalysis && analysisTypes.find(a => a.type === selectedAnalysis)?.icon}
              {selectedAnalysis ? analysisTypes.find(a => a.type === selectedAnalysis)?.title : 'Analysis Result'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-400">Generating analysis...</span>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {analysisResult}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessIntelligencePanel;
