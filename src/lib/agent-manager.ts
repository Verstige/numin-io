import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';
import { 
  AIAgent, 
  AgentRole, 
  AIModel, 
  AgentMemory, 
  ConversationMemory, 
  VectorMemory,
  AgentPermissions,
  AgentMetrics
} from '@/types/nexus';

// Agent Manager Class
export class AgentManager {
  private static instance: AgentManager;
  private agents: Map<string, AIAgent> = new Map();
  private geminiClient: GoogleGenerativeAI;

  private constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not defined');
    }
    this.geminiClient = new GoogleGenerativeAI(apiKey);
  }

  public static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  // Create a new agent
  public async createAgent(agentData: Partial<AIAgent>): Promise<AIAgent> {
    const agent: AIAgent = {
      id: this.generateAgentId(),
      name: agentData.name || 'Unnamed Agent',
      role: agentData.role || 'custom',
      description: agentData.description || '',
      systemPrompt: agentData.systemPrompt || this.getDefaultSystemPrompt(agentData.role || 'custom'),
      model: agentData.model || this.getDefaultModel(),
      memory: {
        shortTerm: [],
        longTerm: [],
        contextWindow: 8000,
        maxMemorySize: 100
      },
      permissions: agentData.permissions || this.getDefaultPermissions(agentData.role || 'custom'),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      metrics: {
        totalInteractions: 0,
        successfulTasks: 0,
        failedTasks: 0,
        averageResponseTime: 0,
        userSatisfaction: 0,
        lastPerformanceReview: new Date()
      }
    };

    // Save to database
    await this.saveAgent(agent);
    this.agents.set(agent.id, agent);
    
    return agent;
  }

  // Get agent by ID
  public async getAgent(agentId: string): Promise<AIAgent | null> {
    if (this.agents.has(agentId)) {
      return this.agents.get(agentId)!;
    }

    const agent = await this.loadAgentFromDB(agentId);
    if (agent) {
      this.agents.set(agentId, agent);
    }
    
    return agent;
  }

  // Get all agents
  public async getAllAgents(): Promise<AIAgent[]> {
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const agents = data.map(this.mapDBToAgent);
      agents.forEach(agent => this.agents.set(agent.id, agent));
      
      return agents;
    } catch (error) {
      console.error('Error loading agents:', error);
      return [];
    }
  }

  // Update agent
  public async updateAgent(agentId: string, updates: Partial<AIAgent>): Promise<AIAgent | null> {
    const agent = await this.getAgent(agentId);
    if (!agent) return null;

    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date()
    };

    await this.saveAgent(updatedAgent);
    this.agents.set(agentId, updatedAgent);
    
    return updatedAgent;
  }

  // Delete agent
  public async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      this.agents.delete(agentId);
      return true;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }

  // Execute agent task
  public async executeAgentTask(
    agentId: string, 
    task: string, 
    context?: Record<string, any>
  ): Promise<{ response: string; success: boolean; error?: string }> {
    const agent = await this.getAgent(agentId);
    if (!agent) {
      return { response: '', success: false, error: 'Agent not found' };
    }

    const startTime = Date.now();
    
    try {
      // Get model
      const model = this.geminiClient.getGenerativeModel({
        model: agent.model.model,
        generationConfig: {
          temperature: agent.model.temperature,
          maxOutputTokens: agent.model.maxTokens,
          topP: agent.model.topP,
        }
      });

      // Build conversation context
      const conversationHistory = agent.memory.shortTerm.slice(-10);
      const history = conversationHistory.map(mem => ({
        role: mem.role === 'user' ? 'user' : 'model',
        parts: [{ text: mem.content }]
      }));

      // Start chat session
      const chat = model.startChat({
        history: history,
        generationConfig: {
          temperature: agent.model.temperature,
          maxOutputTokens: agent.model.maxTokens,
        }
      });

      // Execute task
      const result = await chat.sendMessage(task);
      const response = await result.response;
      const responseText = response.text();

      // Update memory
      await this.updateAgentMemory(agentId, 'user', task);
      await this.updateAgentMemory(agentId, 'assistant', responseText);

      // Update metrics
      const responseTime = Date.now() - startTime;
      await this.updateAgentMetrics(agentId, {
        totalInteractions: agent.metrics.totalInteractions + 1,
        successfulTasks: agent.metrics.successfulTasks + 1,
        averageResponseTime: this.calculateAverageResponseTime(
          agent.metrics.averageResponseTime,
          agent.metrics.totalInteractions,
          responseTime
        )
      });

      return { response: responseText, success: true };
    } catch (error) {
      console.error('Error executing agent task:', error);
      
      // Update metrics
      await this.updateAgentMetrics(agentId, {
        totalInteractions: agent.metrics.totalInteractions + 1,
        failedTasks: agent.metrics.failedTasks + 1
      });

      return { 
        response: '', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Create the five core business agents
  public async createCoreAgents(): Promise<AIAgent[]> {
    const coreAgents = [
      {
        name: 'Aurora',
        role: 'aurora' as AgentRole,
        description: 'Executive AI Assistant for daily operations and productivity',
        systemPrompt: `You are Aurora, the Executive AI Assistant within Nexus. Your role is to manage schedules, emails, and productivity tasks with precision. You help with:

- Schedule meetings and prioritize tasks
- Manage emails and communications
- Take meeting notes and generate reports
- Interface with Calendar, Slack/Teams, Email APIs
- Provide executive insights and recommendations

Respond concisely, act autonomously, and maintain clarity in every action. Focus on efficiency and strategic thinking.`,
        permissions: {
          canAccessAPIs: ['google-calendar', 'slack', 'gmail', 'teams'],
          canExecuteWorkflows: true,
          canAccessFiles: true,
          canSendEmails: true,
          canScheduleMeetings: true,
          canAccessCRM: false,
          canAccessAnalytics: true
        }
      },
      {
        name: 'Vega',
        role: 'vega' as AgentRole,
        description: 'AI Sales Representative for lead management and revenue growth',
        systemPrompt: `You are Vega, Nexus' AI Sales Representative. Your mission is to grow revenue by:

- Finding, qualifying, and tracking leads
- Sending personalized outreach emails
- Updating CRM and following up automatically
- Analyzing pipelines and recommending next actions
- Building relationships with prospects

Use data-driven reasoning and persuasive language. Focus on conversion and relationship building.`,
        permissions: {
          canAccessAPIs: ['hubspot', 'salesforce', 'gmail', 'linkedin'],
          canExecuteWorkflows: true,
          canAccessFiles: true,
          canSendEmails: true,
          canScheduleMeetings: true,
          canAccessCRM: true,
          canAccessAnalytics: true
        }
      },
      {
        name: 'Luma',
        role: 'luma' as AgentRole,
        description: 'Customer Support Specialist for multi-channel customer service',
        systemPrompt: `You are Luma, Nexus' AI Customer Support Specialist. You provide:

- Helpful, empathetic responses to customer inquiries
- Multi-channel support (chat, email, phone)
- Knowledge base retrieval and recommendations
- Issue escalation when necessary
- Interaction logging and sentiment analysis

Pull relevant knowledge before replying and escalate complex issues when required. Maintain a warm, professional tone.`,
        permissions: {
          canAccessAPIs: ['zendesk', 'intercom', 'gmail', 'slack'],
          canExecuteWorkflows: true,
          canAccessFiles: true,
          canSendEmails: true,
          canScheduleMeetings: false,
          canAccessCRM: true,
          canAccessAnalytics: true
        }
      },
      {
        name: 'Orion',
        role: 'orion' as AgentRole,
        description: 'Marketing Strategist for campaign planning and execution',
        systemPrompt: `You are Orion, the Marketing Strategist of Nexus. You excel at:

- Generating creative yet data-backed marketing strategies
- Producing content for posts, ads, emails
- Connecting to social platforms and analytics tools
- Performing competitor and trend research
- Suggesting optimization strategies

Stay analytical, modern, and brand-consistent. Focus on ROI and engagement metrics.`,
        permissions: {
          canAccessAPIs: ['facebook-ads', 'google-ads', 'tiktok-ads', 'twitter', 'linkedin'],
          canExecuteWorkflows: true,
          canAccessFiles: true,
          canSendEmails: true,
          canScheduleMeetings: false,
          canAccessCRM: true,
          canAccessAnalytics: true
        }
      },
      {
        name: 'Titan',
        role: 'titan' as AgentRole,
        description: 'Operations Manager for systems monitoring and efficiency',
        systemPrompt: `You are Titan, the Operations AI of Nexus. You focus on:

- Monitoring KPIs and generating reports
- Tracking workflows and identifying bottlenecks
- Generating operational summaries
- Recommending process improvements
- Ensuring business continuity

Focus on efficiency, forecasting, and actionable insights. Be analytical and proactive.`,
        permissions: {
          canAccessAPIs: ['quickbooks', 'stripe', 'shopify', 'slack', 'teams'],
          canExecuteWorkflows: true,
          canAccessFiles: true,
          canSendEmails: true,
          canScheduleMeetings: true,
          canAccessCRM: false,
          canAccessAnalytics: true
        }
      }
    ];

    const createdAgents: AIAgent[] = [];
    
    for (const agentData of coreAgents) {
      try {
        const agent = await this.createAgent(agentData);
        createdAgents.push(agent);
      } catch (error) {
        console.error(`Error creating ${agentData.name}:`, error);
      }
    }

    return createdAgents;
  }

  // Private helper methods
  private generateAgentId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultSystemPrompt(role: AgentRole): string {
    const prompts = {
      aurora: 'You are Aurora, the Executive AI Assistant within Nexus...',
      vega: 'You are Vega, Nexus\' AI Sales Representative...',
      luma: 'You are Luma, Nexus\' AI Customer Support Specialist...',
      orion: 'You are Orion, the Marketing Strategist of Nexus...',
      titan: 'You are Titan, the Operations AI of Nexus...',
      custom: 'You are a helpful AI assistant designed to assist with various tasks...'
    };
    
    return prompts[role] || prompts.custom;
  }

  private getDefaultModel(): AIModel {
    return {
      provider: 'gemini',
      model: 'gemini-1.5-pro',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.8
    };
  }

  private getDefaultPermissions(role: AgentRole): AgentPermissions {
    return {
      canAccessAPIs: [],
      canExecuteWorkflows: true,
      canAccessFiles: true,
      canSendEmails: false,
      canScheduleMeetings: false,
      canAccessCRM: false,
      canAccessAnalytics: false
    };
  }

  private async saveAgent(agent: AIAgent): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_agents')
        .upsert(this.mapAgentToDB(agent));

      if (error) throw error;
    } catch (error) {
      console.error('Error saving agent:', error);
      throw error;
    }
  }

  private async loadAgentFromDB(agentId: string): Promise<AIAgent | null> {
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (error) throw error;
      return data ? this.mapDBToAgent(data) : null;
    } catch (error) {
      console.error('Error loading agent from DB:', error);
      return null;
    }
  }

  private async updateAgentMemory(
    agentId: string, 
    role: 'user' | 'assistant' | 'system', 
    content: string
  ): Promise<void> {
    const agent = await this.getAgent(agentId);
    if (!agent) return;

    const memory: ConversationMemory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      importance: 'medium',
      tags: []
    };

    agent.memory.shortTerm.push(memory);

    // Keep only the last maxMemorySize entries
    if (agent.memory.shortTerm.length > agent.memory.maxMemorySize) {
      agent.memory.shortTerm = agent.memory.shortTerm.slice(-agent.memory.maxMemorySize);
    }

    await this.saveAgent(agent);
  }

  private async updateAgentMetrics(agentId: string, updates: Partial<AgentMetrics>): Promise<void> {
    const agent = await this.getAgent(agentId);
    if (!agent) return;

    agent.metrics = { ...agent.metrics, ...updates };
    await this.saveAgent(agent);
  }

  private calculateAverageResponseTime(
    currentAverage: number, 
    totalInteractions: number, 
    newResponseTime: number
  ): number {
    return ((currentAverage * totalInteractions) + newResponseTime) / (totalInteractions + 1);
  }

  private mapAgentToDB(agent: AIAgent): any {
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      description: agent.description,
      system_prompt: agent.systemPrompt,
      model: JSON.stringify(agent.model),
      memory: JSON.stringify(agent.memory),
      permissions: JSON.stringify(agent.permissions),
      status: agent.status,
      created_at: agent.createdAt.toISOString(),
      updated_at: agent.updatedAt.toISOString(),
      last_activity: agent.lastActivity.toISOString(),
      metrics: JSON.stringify(agent.metrics)
    };
  }

  private mapDBToAgent(data: any): AIAgent {
    return {
      id: data.id,
      name: data.name,
      role: data.role,
      description: data.description,
      systemPrompt: data.system_prompt,
      model: JSON.parse(data.model),
      memory: JSON.parse(data.memory),
      permissions: JSON.parse(data.permissions),
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastActivity: new Date(data.last_activity),
      metrics: JSON.parse(data.metrics)
    };
  }
}

// Export singleton instance
export const agentManager = AgentManager.getInstance();
