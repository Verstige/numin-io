// Agent System Configuration
// This file manages the agent system settings and feature flags

export interface AgentSystemConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number;
  useFirebase: boolean;
  fallbackToLocalStorage: boolean;
  debugMode: boolean;
}

// Default configuration - agents disabled until Firebase migration
export const defaultAgentConfig: AgentSystemConfig = {
  enabled: false, // Disabled until Firebase migration is complete
  autoSync: false, // Disabled to prevent Supabase errors
  syncInterval: 30000, // 30 seconds (when enabled)
  useFirebase: false, // Will be true after Firebase migration
  fallbackToLocalStorage: true, // Fallback for now
  debugMode: true // Enable debug logging
};

// Environment-based configuration
export const getAgentConfig = (): AgentSystemConfig => {
  const env = import.meta.env.MODE;
  
  // In development, we can enable debug mode
  if (env === 'development') {
    return {
      ...defaultAgentConfig,
      debugMode: true
    };
  }
  
  // In production, agents are disabled until Firebase migration
  return {
    ...defaultAgentConfig,
    enabled: false,
    autoSync: false,
    debugMode: false
  };
};

// Feature flags for different agent capabilities
export const agentFeatureFlags = {
  // Core agent features
  agentInitialization: false, // Disabled until Firebase migration
  agentAutoSync: false, // Disabled to prevent errors
  agentMemory: false, // Disabled until Firebase migration
  
  // Workspace integration
  workspaceIntegration: false, // Disabled until Firebase migration
  projectNotifications: false, // Disabled until Firebase migration
  taskNotifications: false, // Disabled until Firebase migration
  
  // Cross-agent communication
  crossAgentMessaging: false, // Disabled until Firebase migration
  agentCoordination: false, // Disabled until Firebase migration
  
  // Future features for Nexus Agents page
  nexusAgentsPage: true, // This will be enabled for the separate product section
  agentMarketplace: false, // Future feature
  customAgents: false, // Future feature
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof agentFeatureFlags): boolean => {
  return agentFeatureFlags[feature];
};

// Helper function to get agent system status
export const getAgentSystemStatus = () => {
  const config = getAgentConfig();
  return {
    status: config.enabled ? 'active' : 'disabled',
    reason: config.enabled ? 'Agent system is active' : 'Agent system disabled until Firebase migration',
    features: agentFeatureFlags,
    config: config
  };
};
