// Agent System Status Component
// This component shows the current status of the agent system for debugging

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAIAgentIntegration } from '@/hooks/useAIAgentIntegration';
import { getAgentSystemStatus } from '@/lib/agent-config';
import { 
  Bot, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';

interface AgentSystemStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function AgentSystemStatus({ showDetails = false, className = '' }: AgentSystemStatusProps) {
  const { getAgentStatus } = useAIAgentIntegration();
  const [status, setStatus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const agentStatus = getAgentStatus();
      const systemStatus = getAgentSystemStatus();
      setStatus({ ...agentStatus, system: systemStatus });
    } catch (error) {
      console.error('Error refreshing agent status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  if (!status) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading agent status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    if (status.enabled && status.autoSync) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (status.enabled && !status.autoSync) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (status.enabled && status.autoSync) {
      return 'Active';
    } else if (status.enabled && !status.autoSync) {
      return 'Enabled (No Auto-sync)';
    } else {
      return 'Disabled';
    }
  };

  const getStatusColor = () => {
    if (status.enabled && status.autoSync) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (status.enabled && !status.autoSync) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    } else {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Agent System Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor()}>
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshStatus}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* System Configuration */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Configuration</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Enabled:</span>
                  <span className={status.enabled ? 'text-green-600' : 'text-red-600'}>
                    {status.enabled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-sync:</span>
                  <span className={status.autoSync ? 'text-green-600' : 'text-red-600'}>
                    {status.autoSync ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Debug Mode:</span>
                  <span className={status.debugMode ? 'text-blue-600' : 'text-gray-600'}>
                    {status.debugMode ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sync Interval:</span>
                  <span className="text-gray-600">{status.syncInterval}ms</span>
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Features</h4>
              <div className="space-y-1">
                {Object.entries(status.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <Badge 
                      variant={enabled ? 'default' : 'secondary'}
                      className={enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                    >
                      {enabled ? 'On' : 'Off'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* System Info */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">System Info</h4>
              <div className="text-xs text-muted-foreground">
                <p>Reason: {status.system?.reason || 'Unknown'}</p>
                <p>Status: {status.system?.status || 'Unknown'}</p>
              </div>
            </div>

            {/* Info Message */}
            <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <Info className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <p className="font-medium">Agent System Status</p>
                <p>
                  The agent system is currently disabled until Firebase migration is complete. 
                  Nova AI assistant works independently and doesn't require this system.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
