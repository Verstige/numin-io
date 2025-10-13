import { supabase } from './supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  RAGDocument, 
  RAGQuery, 
  RAGResult, 
  VectorMemory,
  ConversationMemory 
} from '@/types/nexus';

// RAG Engine Class
export class RAGEngine {
  private static instance: RAGEngine;
  private geminiClient: GoogleGenerativeAI;
  private embeddingModel: any;

  private constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not defined');
    }
    this.geminiClient = new GoogleGenerativeAI(apiKey);
    // Note: Gemini doesn't have a separate embedding model, we'll use text-embedding-004
    // For production, you might want to use OpenAI's embedding model or a dedicated embedding service
  }

  public static getInstance(): RAGEngine {
    if (!RAGEngine.instance) {
      RAGEngine.instance = new RAGEngine();
    }
    return RAGEngine.instance;
  }

  // Generate embeddings for text content
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // For now, we'll use a simple hash-based embedding as a placeholder
      // In production, use OpenAI's text-embedding-ada-002 or similar
      const hash = this.simpleHash(text);
      const embedding = this.hashToVector(hash);
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  // Simple hash function for placeholder embeddings
  private simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Convert hash to vector (1536 dimensions like OpenAI embeddings)
  private hashToVector(hash: number): number[] {
    const vector = new Array(1536).fill(0);
    for (let i = 0; i < 1536; i++) {
      vector[i] = Math.sin(hash * (i + 1)) / Math.sqrt(i + 1);
    }
    return vector;
  }

  // Add document to RAG knowledge base
  public async addDocument(
    title: string,
    content: string,
    source: string,
    type: 'pdf' | 'text' | 'html' | 'markdown' | 'json',
    metadata: Record<string, any> = {}
  ): Promise<RAGDocument> {
    try {
      // Generate embedding
      const embedding = await this.generateEmbedding(content);
      
      // Create document
      const document: RAGDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        content,
        source,
        type,
        embedding,
        metadata: {
          size: content.length,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: metadata.tags || [],
          importance: metadata.importance || 0.5,
          ...metadata
        }
      };

      // Save to database
      await this.saveDocument(document);
      
      return document;
    } catch (error) {
      console.error('Error adding document:', error);
      throw new Error('Failed to add document to knowledge base');
    }
  }

  // Search documents using RAG
  public async searchDocuments(
    query: RAGQuery,
    userId: string,
    teamId?: string
  ): Promise<RAGResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query.query);
      
      // For now, we'll use a simple text-based search since we don't have vector search
      // In production, use Supabase's vector search or Pinecone
      const { data: documents, error } = await supabase
        .from('rag_documents')
        .select('*')
        .eq('created_by', userId)
        .limit(query.limit || 10);

      if (error) throw error;

      // Calculate similarity scores (simplified)
      const results: RAGResult[] = documents
        .map(doc => ({
          document: this.mapDBToDocument(doc),
          similarity: this.calculateSimilarity(queryEmbedding, doc.embedding),
          relevanceScore: this.calculateRelevanceScore(query.query, doc.content, doc.title),
          context: this.extractContext(doc.content, query.query)
        }))
        .filter(result => 
          result.similarity >= (query.threshold || 0.1) &&
          this.matchesFilters(result.document, query.filters)
        )
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      return results;
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  // Generate context-aware response using RAG
  public async generateContextualResponse(
    query: string,
    conversationHistory: ConversationMemory[],
    userId: string,
    teamId?: string
  ): Promise<{ response: string; sources: RAGDocument[] }> {
    try {
      // Search for relevant documents
      const ragQuery: RAGQuery = {
        query,
        limit: 5,
        threshold: 0.2
      };
      
      const searchResults = await this.searchDocuments(ragQuery, userId, teamId);
      
      // Build context from search results
      const context = searchResults
        .map(result => `Source: ${result.document.title}\nContent: ${result.context}`)
        .join('\n\n');

      // Generate response using Gemini with context
      const model = this.geminiClient.getGenerativeModel({ 
        model: 'gemini-1.5-pro' 
      });

      const systemPrompt = `You are a helpful AI assistant with access to a knowledge base. Use the provided context to answer questions accurately and comprehensively.

CONTEXT:
${context}

CONVERSATION HISTORY:
${conversationHistory.slice(-5).map(mem => `${mem.role}: ${mem.content}`).join('\n')}

INSTRUCTIONS:
- Answer based on the provided context when possible
- If the context doesn't contain enough information, say so and provide what you can
- Cite sources when referencing specific information
- Be helpful, accurate, and concise`;

      const result = await model.generateContent(`${systemPrompt}\n\nUser: ${query}`);
      const response = await result.response;
      const responseText = response.text();

      return {
        response: responseText,
        sources: searchResults.map(result => result.document)
      };
    } catch (error) {
      console.error('Error generating contextual response:', error);
      return {
        response: 'I apologize, but I encountered an error while processing your request. Please try again.',
        sources: []
      };
    }
  }

  // Add conversation memory to knowledge base
  public async addConversationMemory(
    conversation: ConversationMemory,
    userId: string,
    teamId?: string
  ): Promise<void> {
    try {
      // Only add important conversations to long-term memory
      if (conversation.importance === 'high') {
        await this.addDocument(
          `Conversation: ${conversation.content.substring(0, 50)}...`,
          conversation.content,
          'conversation',
          'text',
          {
            tags: conversation.tags,
            importance: this.importanceToNumber(conversation.importance),
            timestamp: conversation.timestamp,
            role: conversation.role
          }
        );
      }
    } catch (error) {
      console.error('Error adding conversation memory:', error);
    }
  }

  // Update document in knowledge base
  public async updateDocument(
    documentId: string,
    updates: Partial<RAGDocument>
  ): Promise<RAGDocument | null> {
    try {
      const existingDoc = await this.getDocument(documentId);
      if (!existingDoc) return null;

      const updatedDoc = { ...existingDoc, ...updates };
      
      // Regenerate embedding if content changed
      if (updates.content && updates.content !== existingDoc.content) {
        updatedDoc.embedding = await this.generateEmbedding(updates.content);
        updatedDoc.metadata.updatedAt = new Date();
      }

      await this.saveDocument(updatedDoc);
      return updatedDoc;
    } catch (error) {
      console.error('Error updating document:', error);
      return null;
    }
  }

  // Delete document from knowledge base
  public async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rag_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Get all documents for a user/team
  public async getDocuments(
    userId: string,
    teamId?: string,
    limit: number = 50
  ): Promise<RAGDocument[]> {
    try {
      let query = supabase
        .from('rag_documents')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(this.mapDBToDocument);
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  // Private helper methods
  private async saveDocument(document: RAGDocument): Promise<void> {
    try {
      const { error } = await supabase
        .from('rag_documents')
        .upsert({
          id: document.id,
          title: document.title,
          content: document.content,
          source: document.source,
          type: document.type,
          embedding: document.embedding,
          metadata: document.metadata,
          created_by: 'current-user', // TODO: Get from auth context
          team_id: 'current-team' // TODO: Get from context
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  private async getDocument(documentId: string): Promise<RAGDocument | null> {
    try {
      const { data, error } = await supabase
        .from('rag_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data ? this.mapDBToDocument(data) : null;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  private calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    // Cosine similarity
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

  private calculateRelevanceScore(query: string, content: string, title: string): number {
    // Simple relevance scoring based on text matching
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentText = (title + ' ' + content).toLowerCase();
    
    let score = 0;
    queryWords.forEach(word => {
      const matches = (contentText.match(new RegExp(word, 'g')) || []).length;
      score += matches;
    });
    
    // Boost score for title matches
    const titleMatches = queryWords.filter(word => 
      title.toLowerCase().includes(word)
    ).length;
    score += titleMatches * 2;
    
    return score;
  }

  private extractContext(content: string, query: string): string {
    // Extract relevant context around query terms
    const sentences = content.split(/[.!?]+/);
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const relevantSentences = sentences.filter(sentence => 
      queryWords.some(word => sentence.toLowerCase().includes(word))
    );
    
    return relevantSentences.slice(0, 3).join('. ') + '.';
  }

  private matchesFilters(document: RAGDocument, filters?: RAGQuery['filters']): boolean {
    if (!filters) return true;
    
    if (filters.sources && !filters.sources.includes(document.source)) {
      return false;
    }
    
    if (filters.types && !filters.types.includes(document.type)) {
      return false;
    }
    
    if (filters.tags && !filters.tags.some(tag => document.metadata.tags.includes(tag))) {
      return false;
    }
    
    if (filters.dateRange) {
      const docDate = document.metadata.createdAt;
      if (docDate < filters.dateRange.from || docDate > filters.dateRange.to) {
        return false;
      }
    }
    
    return true;
  }

  private importanceToNumber(importance: string): number {
    switch (importance) {
      case 'low': return 0.2;
      case 'medium': return 0.5;
      case 'high': return 0.8;
      default: return 0.5;
    }
  }

  private mapDBToDocument(data: any): RAGDocument {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      source: data.source,
      type: data.type,
      embedding: data.embedding || [],
      metadata: data.metadata || {}
    };
  }
}

// Export singleton instance
export const ragEngine = RAGEngine.getInstance();
