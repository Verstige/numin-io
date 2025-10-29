// AI Agent Integration Hook
// This hook provides workspace integration for AI agents

import { useEffect, useCallback } from 'react';
import { aiAgentIntegration } from '@/lib/ai-agent-integration';
import { agentSyncSystem } from '@/lib/agent-sync-system';
import { getAgentConfig, isFeatureEnabled } from '@/lib/agent-config';

interface UseAIAgentIntegrationOptions {
  autoSync?: boolean;
  syncInterval?: number;
}

export const useAIAgentIntegration = (options: UseAIAgentIntegrationOptions = {}) => {
  const config = getAgentConfig();
  const { 
    autoSync = config.autoSync, 
    syncInterval = config.syncInterval 
  } = options;

  // Initialize agents on mount (only if enabled and autoSync is true)
  useEffect(() => {
    if (!config.enabled) {
      if (config.debugMode) {
        console.log('🤖 Agent system disabled - not enabled in configuration');
      }
      return;
    }

    if (!autoSync) {
      if (config.debugMode) {
        console.log('🤖 Agent system disabled - autoSync is false');
      }
      return;
    }

    if (!isFeatureEnabled('agentInitialization')) {
      if (config.debugMode) {
        console.log('🤖 Agent initialization disabled - feature flag off');
      }
      return;
    }

    const initializeAgents = async () => {
      try {
        if (config.debugMode) {
          console.log('🤖 Initializing AI agents...');
        }
        await aiAgentIntegration.initializeAgents();
        console.log('✅ AI agents initialized via hook');
      } catch (error) {
        console.error('❌ Failed to initialize AI agents via hook:', error);
        console.log('💡 Agent system will fall back to localStorage mode');
      }
    };

    initializeAgents();
  }, [autoSync, config.enabled, config.debugMode]);

  // Auto-sync workspace changes (disabled until Firebase migration)
  useEffect(() => {
    if (!config.enabled) {
      if (config.debugMode) {
        console.log('🤖 Agent auto-sync disabled - system not enabled');
      }
      return;
    }

    if (!autoSync) {
      if (config.debugMode) {
        console.log('🤖 Agent auto-sync disabled - autoSync is false');
      }
      return;
    }

    if (!isFeatureEnabled('agentAutoSync')) {
      if (config.debugMode) {
        console.log('🤖 Agent auto-sync disabled - feature flag off');
      }
      return;
    }

    if (config.debugMode) {
      console.log('🤖 Agent auto-sync enabled - updating contexts every', syncInterval, 'ms');
    }
    
    const interval = setInterval(async () => {
      try {
        await aiAgentIntegration.updateAgentContexts();
      } catch (error) {
        console.error('❌ Failed to auto-sync agent contexts:', error);
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval, config.enabled, config.debugMode]);

  // Get agent system status
  const getAgentStatus = useCallback(() => {
    return {
      enabled: config.enabled,
      autoSync: autoSync,
      syncInterval: syncInterval,
      features: {
        initialization: isFeatureEnabled('agentInitialization'),
        autoSync: isFeatureEnabled('agentAutoSync'),
        workspaceIntegration: isFeatureEnabled('workspaceIntegration'),
        nexusAgentsPage: isFeatureEnabled('nexusAgentsPage')
      },
      debugMode: config.debugMode
    };
  }, [config, autoSync, syncInterval]);

  // Helper functions for notifying agents of workspace changes
  const notifyProjectChange = useCallback((action: 'created' | 'updated' | 'deleted', projectData: any) => {
    if (!config.enabled || !isFeatureEnabled('projectNotifications')) {
      if (config.debugMode) {
        console.log(`📢 Project change notification skipped - system disabled: ${action}`, projectData);
      }
      return;
    }
    console.log(`📢 Project change notification: ${action}`, projectData);
    // In a real implementation, this would trigger agent notifications
  }, [config.enabled, config.debugMode]);

  const notifyTaskChange = useCallback((action: 'created' | 'updated' | 'deleted', taskData: any) => {
    if (!config.enabled || !isFeatureEnabled('taskNotifications')) {
      if (config.debugMode) {
        console.log(`📢 Task change notification skipped - system disabled: ${action}`, taskData);
      }
      return;
    }
    console.log(`📢 Task change notification: ${action}`, taskData);
    // In a real implementation, this would trigger agent notifications
  }, [config.enabled, config.debugMode]);

  const notifyEmailChange = useCallback((action: 'created' | 'updated' | 'deleted', emailData: any) => {
    if (!config.enabled) {
      if (config.debugMode) {
        console.log(`📢 Email change notification skipped - system disabled: ${action}`, emailData);
      }
      return;
    }
    console.log(`📢 Email change notification: ${action}`, emailData);
    // In a real implementation, this would trigger agent notifications
  }, [config.enabled, config.debugMode]);

  const notifyCRMChange = useCallback((action: 'created' | 'updated' | 'deleted', crmData: any) => {
    if (!config.enabled) {
      if (config.debugMode) {
        console.log(`📢 CRM change notification skipped - system disabled: ${action}`, crmData);
      }
      return;
    }
    console.log(`📢 CRM change notification: ${action}`, crmData);
    // In a real implementation, this would trigger agent notifications
  }, [config.enabled, config.debugMode]);

  // Agent interaction functions
  const getAgent = useCallback((agentId: string) => {
    return aiAgentIntegration.getAgent(agentId);
  }, []);

  const getAgentContext = useCallback((agentId: string) => {
    return aiAgentIntegration.getAgentContext(agentId);
  }, []);

  const getAllAgents = useCallback(() => {
    return aiAgentIntegration.getAllAgents();
  }, []);

  const executeAgentAction = useCallback(async (action: any) => {
    return await aiAgentIntegration.executeAgentAction(action);
  }, []);

  const sendCrossAgentMessage = useCallback(async (
    fromAgent: string,
    toAgent: string,
    message: string,
    context: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    data?: any
  ) => {
    return await aiAgentIntegration.sendCrossAgentMessage(fromAgent, toAgent, message, context, priority, data);
  }, []);

  const getSyncStats = useCallback(() => {
    return agentSyncSystem.getSyncStatistics();
  }, []);

  const refreshAgentData = useCallback(async () => {
    await aiAgentIntegration.updateAgentContexts();
  }, []);

  return {
    // Agent access
    getAgent,
    getAgentContext,
    getAllAgents,
    executeAgentAction,
    sendCrossAgentMessage,
    
    // Workspace change notifications
    notifyProjectChange,
    notifyTaskChange,
    notifyEmailChange,
    notifyCRMChange,
    
    // Sync and stats
    getSyncStats,
    refreshAgentData,
    
    // System status
    getAgentStatus,
    
    // Direct access to systems
    agentIntegration: aiAgentIntegration,
    syncSystem: agentSyncSystem
  };
};
