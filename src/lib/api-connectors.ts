import { supabase } from './supabase';
import { 
  APIConnector, 
  ConnectorType, 
  ConnectorConfig, 
  ConnectorPermissions 
} from '@/types/nexus';

// API Connector Manager Class
export class APIConnectorManager {
  private static instance: APIConnectorManager;
  private connectors: Map<string, APIConnector> = new Map();

  private constructor() {}

  public static getInstance(): APIConnectorManager {
    if (!APIConnectorManager.instance) {
      APIConnectorManager.instance = new APIConnectorManager();
    }
    return APIConnectorManager.instance;
  }

  // Create a new connector
  public async createConnector(
    name: string,
    type: ConnectorType,
    config: ConnectorConfig,
    permissions: ConnectorPermissions,
    userId: string,
    teamId?: string
  ): Promise<APIConnector> {
    const connector: APIConnector = {
      id: `connector_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      config,
      status: 'disconnected',
      permissions
    };

    // Test connection
    const isConnected = await this.testConnection(connector);
    if (isConnected) {
      connector.status = 'connected';
      connector.lastSync = new Date();
    }

    // Save to database
    await this.saveConnector(connector, userId, teamId);
    this.connectors.set(connector.id, connector);

    return connector;
  }

  // Test connection for a connector
  public async testConnection(connector: APIConnector): Promise<boolean> {
    try {
      switch (connector.type) {
        case 'google-workspace':
          return await this.testGoogleWorkspaceConnection(connector);
        case 'slack':
          return await this.testSlackConnection(connector);
        case 'hubspot':
          return await this.testHubSpotConnection(connector);
        case 'salesforce':
          return await this.testSalesforceConnection(connector);
        case 'gmail':
          return await this.testGmailConnection(connector);
        case 'facebook-ads':
          return await this.testFacebookAdsConnection(connector);
        case 'webhook':
          return true; // Webhooks don't need testing
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error testing ${connector.type} connection:`, error);
      return false;
    }
  }

  // Execute API call through connector
  public async executeAPICall(
    connectorId: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    headers?: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const connector = await this.getConnector(connectorId);
      if (!connector) {
        return { success: false, error: 'Connector not found' };
      }

      if (connector.status !== 'connected') {
        return { success: false, error: 'Connector not connected' };
      }

      const result = await this.makeAPICall(connector, endpoint, method, data, headers);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error executing API call:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get all connectors for user/team
  public async getConnectors(userId: string, teamId?: string): Promise<APIConnector[]> {
    try {
      let query = supabase
        .from('api_connectors')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const connectors = data.map(this.mapDBToConnector);
      connectors.forEach(connector => this.connectors.set(connector.id, connector));
      
      return connectors;
    } catch (error) {
      console.error('Error getting connectors:', error);
      return [];
    }
  }

  // Get connector by ID
  public async getConnector(connectorId: string): Promise<APIConnector | null> {
    if (this.connectors.has(connectorId)) {
      return this.connectors.get(connectorId)!;
    }

    try {
      const { data, error } = await supabase
        .from('api_connectors')
        .select('*')
        .eq('id', connectorId)
        .single();

      if (error) throw error;
      const connector = this.mapDBToConnector(data);
      this.connectors.set(connectorId, connector);
      return connector;
    } catch (error) {
      console.error('Error getting connector:', error);
      return null;
    }
  }

  // Update connector
  public async updateConnector(
    connectorId: string,
    updates: Partial<APIConnector>
  ): Promise<APIConnector | null> {
    try {
      const connector = await this.getConnector(connectorId);
      if (!connector) return null;

      const updatedConnector = { ...connector, ...updates };
      
      // Test connection if config changed
      if (updates.config) {
        const isConnected = await this.testConnection(updatedConnector);
        updatedConnector.status = isConnected ? 'connected' : 'disconnected';
        if (isConnected) {
          updatedConnector.lastSync = new Date();
        }
      }

      await this.saveConnector(updatedConnector);
      this.connectors.set(connectorId, updatedConnector);
      
      return updatedConnector;
    } catch (error) {
      console.error('Error updating connector:', error);
      return null;
    }
  }

  // Delete connector
  public async deleteConnector(connectorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('api_connectors')
        .delete()
        .eq('id', connectorId);

      if (error) throw error;

      this.connectors.delete(connectorId);
      return true;
    } catch (error) {
      console.error('Error deleting connector:', error);
      return false;
    }
  }

  // Sync data from connector
  public async syncConnectorData(connectorId: string): Promise<boolean> {
    try {
      const connector = await this.getConnector(connectorId);
      if (!connector || connector.status !== 'connected') {
        return false;
      }

      // Implement sync logic based on connector type
      switch (connector.type) {
        case 'google-workspace':
          await this.syncGoogleWorkspaceData(connector);
          break;
        case 'slack':
          await this.syncSlackData(connector);
          break;
        case 'hubspot':
          await this.syncHubSpotData(connector);
          break;
        default:
          console.warn(`Sync not implemented for ${connector.type}`);
      }

      // Update last sync time
      connector.lastSync = new Date();
      await this.saveConnector(connector);
      
      return true;
    } catch (error) {
      console.error('Error syncing connector data:', error);
      return false;
    }
  }

  // Private helper methods for specific connectors
  private async testGoogleWorkspaceConnection(connector: APIConnector): Promise<boolean> {
    try {
      // Test Google Workspace API connection
      const { credentials } = connector.config;
      if (!credentials.access_token) return false;

      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async testSlackConnection(connector: APIConnector): Promise<boolean> {
    try {
      const { credentials } = connector.config;
      if (!credentials.bot_token) return false;

      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${credentials.bot_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data.ok;
    } catch (error) {
      return false;
    }
  }

  private async testHubSpotConnection(connector: APIConnector): Promise<boolean> {
    try {
      const { credentials } = connector.config;
      if (!credentials.access_token) return false;

      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async testSalesforceConnection(connector: APIConnector): Promise<boolean> {
    try {
      const { credentials } = connector.config;
      if (!credentials.access_token || !credentials.instance_url) return false;

      const response = await fetch(`${credentials.instance_url}/services/data/v58.0/sobjects/`, {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async testGmailConnection(connector: APIConnector): Promise<boolean> {
    try {
      const { credentials } = connector.config;
      if (!credentials.access_token) return false;

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async testFacebookAdsConnection(connector: APIConnector): Promise<boolean> {
    try {
      const { credentials } = connector.config;
      if (!credentials.access_token) return false;

      const response = await fetch(`https://graph.facebook.com/v18.0/me/adaccounts?access_token=${credentials.access_token}`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async makeAPICall(
    connector: APIConnector,
    endpoint: string,
    method: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const { credentials } = connector.config;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(connector),
      ...headers
    };

    const config: RequestInit = {
      method,
      headers: defaultHeaders
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private getAuthHeaders(connector: APIConnector): Record<string, string> {
    const { credentials } = connector.config;
    
    switch (connector.type) {
      case 'google-workspace':
      case 'gmail':
        return { 'Authorization': `Bearer ${credentials.access_token}` };
      case 'slack':
        return { 'Authorization': `Bearer ${credentials.bot_token}` };
      case 'hubspot':
      case 'salesforce':
        return { 'Authorization': `Bearer ${credentials.access_token}` };
      case 'facebook-ads':
        return { 'Authorization': `Bearer ${credentials.access_token}` };
      default:
        return {};
    }
  }

  private async syncGoogleWorkspaceData(connector: APIConnector): Promise<void> {
    // Implement Google Workspace data sync
    console.log('Syncing Google Workspace data...');
  }

  private async syncSlackData(connector: APIConnector): Promise<void> {
    // Implement Slack data sync
    console.log('Syncing Slack data...');
  }

  private async syncHubSpotData(connector: APIConnector): Promise<void> {
    // Implement HubSpot data sync
    console.log('Syncing HubSpot data...');
  }

  private async saveConnector(
    connector: APIConnector,
    userId?: string,
    teamId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_connectors')
        .upsert({
          id: connector.id,
          name: connector.name,
          type: connector.type,
          config: connector.config,
          status: connector.status,
          last_sync: connector.lastSync?.toISOString(),
          permissions: connector.permissions,
          created_by: userId || 'current-user',
          team_id: teamId || 'current-team'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving connector:', error);
      throw error;
    }
  }

  private mapDBToConnector(data: any): APIConnector {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      config: data.config,
      status: data.status,
      lastSync: data.last_sync ? new Date(data.last_sync) : undefined,
      permissions: data.permissions
    };
  }
}

// Export singleton instance
export const apiConnectorManager = APIConnectorManager.getInstance();
