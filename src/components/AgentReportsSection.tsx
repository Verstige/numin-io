import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Bot,
  Target,
  Calendar,
  User,
  MessageSquare,
  Lightbulb,
  BarChart3,
  Filter
} from 'lucide-react';
import { getWorkspaceData } from '@/lib/ai-agent-service';

interface AgentReport {
  id: string;
  agentId: string;
  agentName: string;
  type: 'task_recommendation' | 'insight' | 'alert' | 'summary' | 'analysis';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'reviewed' | 'actioned' | 'dismissed';
  category: string;
  recommendations?: string[];
  tasks?: string[];
  createdAt: Date;
  tags?: string[];
}

export default function AgentReportsSection() {
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<AgentReport[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, filter, priorityFilter]);

  const loadReports = () => {
    const workspaceData = getWorkspaceData();
    const agentReports = workspaceData.agentReports || [];
    
    // Convert the data to AgentReport format
    const formattedReports: AgentReport[] = agentReports.map((report: any) => ({
      id: report.id,
      agentId: report.agentId,
      agentName: report.agentName,
      type: report.type || 'insight',
      title: report.title,
      content: report.content,
      priority: report.priority || 'medium',
      status: report.status || 'new',
      category: report.category || 'general',
      recommendations: report.recommendations || [],
      tasks: report.tasks || [],
      createdAt: new Date(report.createdAt),
      tags: report.tags || []
    }));

    setReports(formattedReports);
  };

  const filterReports = () => {
    let filtered = reports;

    if (filter !== 'all') {
      filtered = filtered.filter(report => report.type === filter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    setFilteredReports(filtered);
  };

  const generateSampleReports = () => {
    const sampleReports: AgentReport[] = [
      {
        id: 'report_1',
        agentId: 'aurora',
        agentName: 'Aurora',
        type: 'task_recommendation',
        title: 'Q4 Budget Review Needed',
        content: 'Based on current spending patterns and upcoming projects, I recommend scheduling a comprehensive Q4 budget review meeting. Current projections show we may exceed budget by 15% if spending continues at current rates.',
        priority: 'high',
        status: 'new',
        category: 'finance',
        recommendations: [
          'Schedule budget review meeting with finance team',
          'Review all Q4 project costs',
          'Identify potential cost savings opportunities'
        ],
        tasks: [
          'Prepare budget analysis report',
          'Contact finance team for meeting',
          'Review vendor contracts for cost optimization'
        ],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        tags: ['budget', 'finance', 'q4']
      },
      {
        id: 'report_2',
        agentId: 'vega',
        agentName: 'Vega',
        type: 'insight',
        title: 'Sales Pipeline Analysis - High Conversion Opportunity',
        content: 'Analysis of current sales pipeline shows 3 high-value prospects in the negotiation phase with 85% probability of closing. These deals represent $250K in potential revenue. Recommend prioritizing these accounts with executive involvement.',
        priority: 'high',
        status: 'new',
        category: 'sales',
        recommendations: [
          'Schedule executive calls with top 3 prospects',
          'Prepare customized proposals for high-value deals',
          'Implement accelerated follow-up process'
        ],
        tasks: [
          'Update CRM with latest prospect information',
          'Prepare executive briefing materials',
          'Schedule stakeholder meetings'
        ],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        tags: ['sales', 'pipeline', 'revenue']
      },
      {
        id: 'report_3',
        agentId: 'luma',
        agentName: 'Luma',
        type: 'alert',
        title: 'Customer Satisfaction Score Dropped',
        content: 'Customer satisfaction score has decreased by 12% this month. Main issues identified: response time delays and technical support resolution time. Immediate action required to prevent further customer churn.',
        priority: 'urgent',
        status: 'new',
        category: 'support',
        recommendations: [
          'Implement 24-hour response time SLA',
          'Add additional technical support resources',
          'Create customer feedback follow-up process'
        ],
        tasks: [
          'Analyze recent customer feedback',
          'Review support ticket resolution times',
          'Propose support team expansion'
        ],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        tags: ['support', 'satisfaction', 'urgent']
      },
      {
        id: 'report_4',
        agentId: 'orion',
        agentName: 'Orion',
        type: 'analysis',
        title: 'Marketing Campaign Performance - Q4 Optimization',
        content: 'Q4 marketing campaigns are performing 23% below target. Email campaigns show strong engagement but low conversion. Social media campaigns need content refresh. Recommend immediate campaign optimization.',
        priority: 'medium',
        status: 'new',
        category: 'marketing',
        recommendations: [
          'A/B test email subject lines for better conversion',
          'Refresh social media content calendar',
          'Implement retargeting campaigns for website visitors'
        ],
        tasks: [
          'Create new email campaign variations',
          'Develop fresh social media content',
          'Set up retargeting pixel implementation'
        ],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        tags: ['marketing', 'campaigns', 'q4']
      },
      {
        id: 'report_5',
        agentId: 'titan',
        agentName: 'Titan',
        type: 'summary',
        title: 'Weekly Operations Summary',
        content: 'Weekly operations review: Team productivity increased by 8% this week. Project delivery is on track for 95% of active projects. Resource utilization is optimal at 87%. Recommend maintaining current operational efficiency.',
        priority: 'low',
        status: 'new',
        category: 'operations',
        recommendations: [
          'Maintain current productivity levels',
          'Continue monitoring resource utilization',
          'Plan for upcoming project deadlines'
        ],
        tasks: [
          'Prepare next week\'s resource allocation',
          'Review upcoming project milestones',
          'Schedule team performance review'
        ],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        tags: ['operations', 'productivity', 'summary']
      }
    ];

    // Add to workspace data
    const workspaceData = getWorkspaceData();
    workspaceData.agentReports = sampleReports;
    localStorage.setItem('nexus-workspace-data', JSON.stringify(workspaceData));

    setReports(sampleReports);
  };

  const updateReportStatus = (reportId: string, newStatus: AgentReport['status']) => {
    const workspaceData = getWorkspaceData();
    const reportIndex = workspaceData.agentReports?.findIndex((r: any) => r.id === reportId);
    
    if (reportIndex !== -1 && workspaceData.agentReports) {
      workspaceData.agentReports[reportIndex].status = newStatus;
      localStorage.setItem('nexus-workspace-data', JSON.stringify(workspaceData));
      
      setReports(prev => prev.map(report =>
        report.id === reportId 
          ? { ...report, status: newStatus }
          : report
      ));
    }
  };

  const getTypeIcon = (type: AgentReport['type']) => {
    switch (type) {
      case 'task_recommendation': return <Target className="w-4 h-4" />;
      case 'insight': return <Lightbulb className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'summary': return <BarChart3 className="w-4 h-4" />;
      case 'analysis': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: AgentReport['type']) => {
    switch (type) {
      case 'task_recommendation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'insight': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'alert': return 'bg-red-100 text-red-800 border-red-200';
      case 'summary': return 'bg-green-100 text-green-800 border-green-200';
      case 'analysis': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: AgentReport['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: AgentReport['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'actioned': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgentIcon = (agentName: string) => {
    return <Bot className="w-4 h-4" />;
  };

  const typeCounts = {
    task_recommendation: reports.filter(r => r.type === 'task_recommendation').length,
    insight: reports.filter(r => r.type === 'insight').length,
    alert: reports.filter(r => r.type === 'alert').length,
    summary: reports.filter(r => r.type === 'summary').length,
    analysis: reports.filter(r => r.type === 'analysis').length
  };

  const priorityCounts = {
    urgent: reports.filter(r => r.priority === 'urgent').length,
    high: reports.filter(r => r.priority === 'high').length,
    medium: reports.filter(r => r.priority === 'medium').length,
    low: reports.filter(r => r.priority === 'low').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Reports</h2>
          <p className="text-gray-400">AI agent insights, recommendations, and alerts</p>
        </div>
        <Button 
          onClick={generateSampleReports}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Sample Reports
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-white">{typeCounts.task_recommendation}</div>
                <div className="text-sm text-gray-400">Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-white">{typeCounts.insight}</div>
                <div className="text-sm text-gray-400">Insights</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-white">{typeCounts.alert}</div>
                <div className="text-sm text-gray-400">Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-white">{typeCounts.summary}</div>
                <div className="text-sm text-gray-400">Summaries</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-white">{typeCounts.analysis}</div>
                <div className="text-sm text-gray-400">Analyses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alerts */}
      {(priorityCounts.urgent > 0 || priorityCounts.high > 0) && (
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              High Priority Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              {priorityCounts.urgent > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-400">{priorityCounts.urgent} Urgent</span>
                </div>
              )}
              {priorityCounts.high > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-orange-400">{priorityCounts.high} High Priority</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filter by:</span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white text-sm"
        >
          <option value="all">All Types</option>
          <option value="task_recommendation">Task Recommendations</option>
          <option value="insight">Insights</option>
          <option value="alert">Alerts</option>
          <option value="summary">Summaries</option>
          <option value="analysis">Analyses</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white text-sm"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Reports List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reports found</p>
                  <p className="text-sm">Generate sample reports to see agent insights</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div key={report.id} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getAgentIcon(report.agentName)}
                          <span className="font-medium text-white">{report.agentName}</span>
                        </div>
                        <Badge className={getTypeColor(report.type)}>
                          {getTypeIcon(report.type)}
                          <span className="ml-1 capitalize">{report.type.replace('_', ' ')}</span>
                        </Badge>
                        <Badge className={getPriorityColor(report.priority)}>
                          <span className="capitalize">{report.priority}</span>
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          <span className="capitalize">{report.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {report.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-white mb-2">{report.title}</h3>
                    <p className="text-gray-300 text-sm mb-3">{report.content}</p>
                    
                    {report.recommendations && report.recommendations.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {report.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {report.tasks && report.tasks.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Suggested Tasks:</h4>
                        <ul className="space-y-1">
                          {report.tasks.map((task, index) => (
                            <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {report.tags && report.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {report.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-slate-600 border-slate-500 text-gray-300">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {report.status === 'new' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReportStatus(report.id, 'reviewed')}
                          >
                            Mark Reviewed
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReportStatus(report.id, 'actioned')}
                          >
                            Mark Actioned
                          </Button>
                        </>
                      )}
                      {report.status === 'reviewed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'actioned')}
                        >
                          Mark Actioned
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}






