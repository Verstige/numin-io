import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Play } from 'lucide-react';
import { 
  sendMessageToAgent, 
  getAgent, 
  getWorkspaceData,
  getTasks,
  getProjects,
  getNotes,
  type AgentResponse
} from '@/lib/ai-agent-service';

interface TestResult {
  id: string;
  test: string;
  agent: string;
  command: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: Date;
}

export default function AgentWorkspaceTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [workspaceData, setWorkspaceData] = useState<any>(null);

  useEffect(() => {
    // Load initial workspace data
    setWorkspaceData(getWorkspaceData());
  }, []);

  const runTest = async (test: TestResult) => {
    console.log(`🧪 Starting test: ${test.test} for agent ${test.agent}`);
    console.log(`📝 Command: ${test.command}`);
    
    setTestResults(prev => prev.map(t => 
      t.id === test.id ? { ...t, status: 'running' as const } : t
    ));

    try {
      const startTime = Date.now();
      console.log(`⏰ Test started at: ${new Date().toISOString()}`);
      
      const response: AgentResponse = await sendMessageToAgent(test.agent, test.command);
      
      const endTime = Date.now();
      console.log(`✅ Test completed in ${endTime - startTime}ms`);
      console.log(`📊 Response:`, response);
      console.log(`🔍 Response data:`, response.data);
      
      setTestResults(prev => prev.map(t => 
        t.id === test.id ? { 
          ...t, 
          status: response.success ? 'completed' as const : 'failed' as const,
          result: {
            ...response.data,
            executionTime: `${endTime - startTime}ms`,
            timestamp: new Date().toISOString()
          },
          error: response.success ? undefined : response.message
        } : t
      ));

      // Refresh workspace data
      setWorkspaceData(getWorkspaceData());
    } catch (error) {
      console.error(`❌ Test failed for ${test.test}:`, error);
      console.error(`❌ Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      
      setTestResults(prev => prev.map(t => 
        t.id === test.id ? { 
          ...t, 
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
          result: {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          }
        } : t
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests: TestResult[] = [
      {
        id: '1',
        test: 'Create Task',
        agent: 'aurora',
        command: 'Create task: Test workspace integration task',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: '2',
        test: 'Create Project',
        agent: 'titan',
        command: 'Create project: Test Project for workspace integration',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: '3',
        test: 'Add Note',
        agent: 'luma',
        command: 'Add note: Test workspace note for integration testing',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: '4',
        test: 'Create Executive Report',
        agent: 'aurora',
        command: 'Create executive report: Q4 Test Report',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: '5',
        test: 'Qualify Lead',
        agent: 'vega',
        command: 'Qualify lead: John Smith from TestCorp',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: '6',
        test: 'Create Support Ticket',
        agent: 'luma',
        command: 'Create support ticket: Test customer login issue',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: '7',
        test: 'Create Marketing Campaign',
        agent: 'orion',
        command: 'Create marketing campaign: Test Campaign 2024',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: '8',
        test: 'Optimize Workflow',
        agent: 'titan',
        command: 'Optimize workflow: Test workflow optimization',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: '9',
        test: 'Create Project',
        agent: 'aurora',
        command: 'Create project: Test Project for workspace integration',
        status: 'pending',
        timestamp: new Date()
      },
      {
        id: '10',
        test: 'Generate Agent Report',
        agent: 'aurora',
        command: 'Create executive report: Test workspace integration report',
        status: 'pending',
        timestamp: new Date()
      }
    ];

    setTestResults(tests);

    // Run tests sequentially with delays
    for (const test of tests) {
      await runTest(test);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between tests
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      default: return <Play className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Agent Workspace Integration Test
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test that AI agents can properly create and manage workspace data
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm text-muted-foreground">
                        {getAgent(result.agent)?.name} - {result.command}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workspace Data Summary */}
      {workspaceData && (
        <Card>
          <CardHeader>
            <CardTitle>Workspace Data Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{workspaceData.tasks?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{workspaceData.projects?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{workspaceData.notes?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Notes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{workspaceData.executiveReports?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{workspaceData.leads?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{workspaceData.supportTickets?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{workspaceData.marketingCampaigns?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{workspaceData.workflows?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Workflows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">{workspaceData.supportTickets?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Support Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-600">{workspaceData.agentReports?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Agent Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Operations */}
      {workspaceData && (workspaceData.tasks?.length > 0 || workspaceData.projects?.length > 0 || workspaceData.supportTickets?.length > 0 || workspaceData.agentReports?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workspaceData.tasks?.slice(-3).map((task: any) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Task: {task.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
              ))}
              {workspaceData.projects?.slice(-3).map((project: any) => (
                <div key={project.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Project: {project.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {project.status}
                  </Badge>
                </div>
              ))}
              {workspaceData.supportTickets?.slice(-3).map((ticket: any) => (
                <div key={ticket.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Support Ticket: {ticket.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {ticket.status}
                  </Badge>
                </div>
              ))}
              {workspaceData.agentReports?.slice(-3).map((report: any) => (
                <div key={report.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span>Agent Report: {report.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {report.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
