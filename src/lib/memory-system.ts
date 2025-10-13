import { supabase } from './supabase';
import { 
  ConversationMemory, 
  VectorMemory, 
  AgentMemory,
  AIAgent 
} from '@/types/nexus';
import { ragEngine } from './rag-engine';

// Memory System Class
export class MemorySystem {
  private static instance: MemorySystem;
  private shortTermCache: Map<string, ConversationMemory[]> = new Map();
  private longTermCache: Map<string, VectorMemory[]> = new Map();

  private constructor() {}

  public static getInstance(): MemorySystem {
    if (!MemorySystem.instance) {
      MemorySystem.instance = new MemorySystem();
    }
    return MemorySystem.instance;
  }

  // Add conversation to agent's memory
  public async addConversationMemory(
    agentId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    importance: 'low' | 'medium' | 'high' = 'medium',
    tags: string[] = [],
    metadata?: Record<string, any>
  ): Promise<ConversationMemory> {
    const memory: ConversationMemory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      importance,
      tags,
      metadata
    };

    // Add to short-term cache
    if (!this.shortTermCache.has(agentId)) {
      this.shortTermCache.set(agentId, []);
    }
    
    const shortTermMemories = this.shortTermCache.get(agentId)!;
    shortTermMemories.push(memory);

    // Keep only the last maxMemorySize entries
    const agent = await this.getAgent(agentId);
    if (agent && shortTermMemories.length > agent.memory.maxMemorySize) {
      const toArchive = shortTermMemories.splice(0, shortTermMemories.length - agent.memory.maxMemorySize);
      
      // Archive important memories to long-term storage
      for (const mem of toArchive) {
        if (mem.importance === 'high') {
          await this.archiveToLongTerm(agentId, mem);
        }
      }
    }

    // Save to database
    await this.saveConversationMemory(agentId, memory);

    return memory;
  }

  // Get conversation history for agent
  public async getConversationHistory(
    agentId: string,
    limit: number = 10,
    includeSystem: boolean = false
  ): Promise<ConversationMemory[]> {
    // Try cache first
    const cached = this.shortTermCache.get(agentId);
    if (cached) {
      let filtered = cached.filter(mem => includeSystem || mem.role !== 'system');
      return filtered.slice(-limit);
    }

    // Load from database
    try {
      const { data, error } = await supabase
        .from('agent_conversations')
        .select('*')
        .eq('agent_id', agentId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const memories = data.map(this.mapDBToConversationMemory);
      
      // Filter and sort
      let filtered = memories.filter(mem => includeSystem || mem.role !== 'system');
      filtered.reverse(); // Reverse to get chronological order
      
      // Update cache
      this.shortTermCache.set(agentId, memories);
      
      return filtered;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  // Add vector memory for knowledge retrieval
  public async addVectorMemory(
    agentId: string,
    content: string,
    source: string,
    importance: number = 0.5,
    tags: string[] = [],
    metadata?: Record<string, any>
  ): Promise<VectorMemory> {
    try {
      // Generate embedding using RAG engine
      const embedding = await ragEngine.generateEmbedding(content);
      
      const memory: VectorMemory = {
        id: `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        embedding,
        metadata: {
          source,
          timestamp: new Date(),
          importance,
          tags,
          ...metadata
        }
      };

      // Add to cache
      if (!this.longTermCache.has(agentId)) {
        this.longTermCache.set(agentId, []);
      }
      this.longTermCache.get(agentId)!.push(memory);

      // Save to database
      await this.saveVectorMemory(agentId, memory);

      return memory;
    } catch (error) {
      console.error('Error adding vector memory:', error);
      throw new Error('Failed to add vector memory');
    }
  }

  // Search vector memories
  public async searchVectorMemories(
    agentId: string,
    query: string,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<VectorMemory[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await ragEngine.generateEmbedding(query);
      
      // Get vector memories from cache or database
      let vectorMemories = this.longTermCache.get(agentId);
      if (!vectorMemories) {
        vectorMemories = await this.loadVectorMemories(agentId);
        this.longTermCache.set(agentId, vectorMemories);
      }

      // Calculate similarities and filter
      const results = vectorMemories
        .map(memory => ({
          memory,
          similarity: this.calculateCosineSimilarity(queryEmbedding, memory.embedding)
        }))
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(result => result.memory);

      return results;
    } catch (error) {
      console.error('Error searching vector memories:', error);
      return [];
    }
  }

  // Get agent's complete memory context
  public async getAgentMemoryContext(
    agentId: string,
    query?: string
  ): Promise<{
    conversationHistory: ConversationMemory[];
    relevantMemories: VectorMemory[];
    contextSummary: string;
  }> {
    try {
      // Get recent conversation history
      const conversationHistory = await this.getConversationHistory(agentId, 10);
      
      // Get relevant vector memories if query provided
      let relevantMemories: VectorMemory[] = [];
      if (query) {
        relevantMemories = await this.searchVectorMemories(agentId, query, 3);
      }

      // Generate context summary
      const contextSummary = await this.generateContextSummary(
        conversationHistory,
        relevantMemories,
        query
      );

      return {
        conversationHistory,
        relevantMemories,
        contextSummary
      };
    } catch (error) {
      console.error('Error getting agent memory context:', error);
      return {
        conversationHistory: [],
        relevantMemories: [],
        contextSummary: ''
      };
    }
  }

  // Update memory importance
  public async updateMemoryImportance(
    agentId: string,
    memoryId: string,
    importance: 'low' | 'medium' | 'high'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agent_conversations')
        .update({ importance, updated_at: new Date().toISOString() })
        .eq('agent_id', agentId)
        .eq('id', memoryId);

      if (error) throw error;

      // Update cache
      const cached = this.shortTermCache.get(agentId);
      if (cached) {
        const memory = cached.find(mem => mem.id === memoryId);
        if (memory) {
          memory.importance = importance;
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating memory importance:', error);
      return false;
    }
  }

  // Delete memory
  public async deleteMemory(
    agentId: string,
    memoryId: string,
    type: 'conversation' | 'vector'
  ): Promise<boolean> {
    try {
      const table = type === 'conversation' ? 'agent_conversations' : 'agent_vector_memories';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('agent_id', agentId)
        .eq('id', memoryId);

      if (error) throw error;

      // Update cache
      if (type === 'conversation') {
        const cached = this.shortTermCache.get(agentId);
        if (cached) {
          const index = cached.findIndex(mem => mem.id === memoryId);
          if (index !== -1) {
            cached.splice(index, 1);
          }
        }
      } else {
        const cached = this.longTermCache.get(agentId);
        if (cached) {
          const index = cached.findIndex(mem => mem.id === memoryId);
          if (index !== -1) {
            cached.splice(index, 1);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  }

  // Clear agent memory
  public async clearAgentMemory(
    agentId: string,
    type: 'conversation' | 'vector' | 'all' = 'all'
  ): Promise<boolean> {
    try {
      if (type === 'conversation' || type === 'all') {
        const { error: convError } = await supabase
          .from('agent_conversations')
          .delete()
          .eq('agent_id', agentId);

        if (convError) throw convError;
        this.shortTermCache.delete(agentId);
      }

      if (type === 'vector' || type === 'all') {
        const { error: vecError } = await supabase
          .from('agent_vector_memories')
          .delete()
          .eq('agent_id', agentId);

        if (vecError) throw vecError;
        this.longTermCache.delete(agentId);
      }

      return true;
    } catch (error) {
      console.error('Error clearing agent memory:', error);
      return false;
    }
  }

  // Archive important conversations to long-term memory
  private async archiveToLongTerm(
    agentId: string,
    conversation: ConversationMemory
  ): Promise<void> {
    try {
      await this.addVectorMemory(
        agentId,
        conversation.content,
        'conversation',
        this.importanceToNumber(conversation.importance),
        conversation.tags,
        {
          role: conversation.role,
          timestamp: conversation.timestamp,
          ...conversation.metadata
        }
      );
    } catch (error) {
      console.error('Error archiving to long-term memory:', error);
    }
  }

  // Private helper methods
  private async getAgent(agentId: string): Promise<AIAgent | null> {
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (error) throw error;
      return data ? this.mapDBToAgent(data) : null;
    } catch (error) {
      console.error('Error getting agent:', error);
      return null;
    }
  }

  private async saveConversationMemory(
    agentId: string,
    memory: ConversationMemory
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('agent_conversations')
        .insert({
          id: memory.id,
          agent_id: agentId,
          role: memory.role,
          content: memory.content,
          timestamp: memory.timestamp.toISOString(),
          importance: memory.importance,
          tags: memory.tags,
          metadata: memory.metadata || {}
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving conversation memory:', error);
      throw error;
    }
  }

  private async saveVectorMemory(
    agentId: string,
    memory: VectorMemory
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('agent_vector_memories')
        .insert({
          id: memory.id,
          agent_id: agentId,
          content: memory.content,
          embedding: memory.embedding,
          metadata: memory.metadata
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving vector memory:', error);
      throw error;
    }
  }

  private async loadVectorMemories(agentId: string): Promise<VectorMemory[]> {
    try {
      const { data, error } = await supabase
        .from('agent_vector_memories')
        .select('*')
        .eq('agent_id', agentId)
        .order('metadata->timestamp', { ascending: false });

      if (error) throw error;
      return data.map(this.mapDBToVectorMemory);
    } catch (error) {
      console.error('Error loading vector memories:', error);
      return [];
    }
  }

  private calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private async generateContextSummary(
    conversations: ConversationMemory[],
    memories: VectorMemory[],
    query?: string
  ): Promise<string> {
    try {
      // Simple context summary generation
      const recentTopics = conversations
        .slice(-5)
        .map(conv => conv.content.substring(0, 100))
        .join(' ');

      const relevantKnowledge = memories
        .slice(0, 3)
        .map(mem => mem.content.substring(0, 100))
        .join(' ');

      let summary = `Recent conversation topics: ${recentTopics}`;
      
      if (relevantKnowledge) {
        summary += `\n\nRelevant knowledge: ${relevantKnowledge}`;
      }

      if (query) {
        summary += `\n\nCurrent query context: ${query}`;
      }

      return summary.substring(0, 1000); // Limit summary length
    } catch (error) {
      console.error('Error generating context summary:', error);
      return '';
    }
  }

  private importanceToNumber(importance: string): number {
    switch (importance) {
      case 'low': return 0.2;
      case 'medium': return 0.5;
      case 'high': return 0.8;
      default: return 0.5;
    }
  }

  private mapDBToConversationMemory(data: any): ConversationMemory {
    return {
      id: data.id,
      role: data.role,
      content: data.content,
      timestamp: new Date(data.timestamp),
      importance: data.importance,
      tags: data.tags || [],
      metadata: data.metadata || {}
    };
  }

  private mapDBToVectorMemory(data: any): VectorMemory {
    return {
      id: data.id,
      content: data.content,
      embedding: data.embedding || [],
      metadata: data.metadata || {}
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
export const memorySystem = MemorySystem.getInstance();
