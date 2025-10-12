import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize genAI inside functions to ensure environment variables are available
const getGenAI = () => {
  // Try multiple ways to get the API key
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Fallback: try to get from process.env (might work in some cases)
  if (!apiKey && typeof process !== 'undefined' && process.env) {
    apiKey = process.env.VITE_GEMINI_API_KEY;
  }
  
  // Fallback: hardcoded for development (temporary)
  if (!apiKey) {
    console.warn('⚠️ Using hardcoded API key as fallback');
    apiKey = 'AIzaSyBJXRO2wNi35NgDftgu-JUXqe-uIhZ2qhA';
  }
  
  // Enhanced debugging
  console.log('🔍 Environment variable check:', {
    apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined',
    allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
    hasGeminiKey: !!apiKey,
    importMetaEnv: Object.keys(import.meta.env),
    envSource: apiKey === 'AIzaSyBJXRO2wNi35NgDftgu-JUXqe-uIhZ2qhA' ? 'hardcoded' : 'environment'
  });
  
  if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY is not defined in browser environment');
    console.error('Available VITE_ environment variables:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
    throw new Error('VITE_GEMINI_API_KEY is not defined. Please check your environment configuration.');
  }
  
  if (!apiKey.startsWith('AIza')) {
    console.error('❌ Invalid API key format');
    throw new Error('Invalid Gemini API key format');
  }
  
  return new GoogleGenerativeAI(apiKey);
};

export type AssistantMode = 'assistant' | 'chat';

export interface WorkspaceContext {
  projects: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    priority: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    assignee?: string;
    projectId: string;
  }>;
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
  }>;
  notes: Array<{
    id: string;
    title: string;
    content: string;
    projectId: string;
  }>;
  currentUser: {
    name: string;
    email: string;
  };
  businessMetrics?: {
    teamPerformance: number;
    projectSuccessRate: number;
    timeToCompletion: number;
  };
  businessStage?: 'startup' | 'growth' | 'scale' | 'enterprise';
  industry?: string;
}

export interface ConversationMemory {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: AssistantMode;
  businessContext?: {
    projectsMentioned: string[];
    insightsGenerated: string[];
    recommendationsGiven: string[];
  };
  timestamp: Date;
  importance: 'low' | 'medium' | 'high';
}

// Business Intelligence Assistant Mode
export async function generateBusinessAssistantResponse(
  userMessage: string,
  workspaceContext: WorkspaceContext,
  conversationHistory: ConversationMemory[]
): Promise<string> {
  
  console.log('🤖 Business Assistant called with:', { userMessage, workspaceContext, conversationHistory });
  
  const systemPrompt = `You are Nova's Business Intelligence Assistant - an advanced AI that provides deep insights into business ecosystems.

BUSINESS ECOSYSTEM DATA:
- User: ${workspaceContext.currentUser.name} (${workspaceContext.currentUser.email})
- Projects: ${workspaceContext.projects.length} active projects
- Team: ${workspaceContext.teamMembers.length} members
- Tasks: ${workspaceContext.tasks.length} total tasks
- Business Stage: ${workspaceContext.businessStage || 'Not specified'}
- Industry: ${workspaceContext.industry || 'Not specified'}

PROJECT PORTFOLIO:
${workspaceContext.projects.map(p => 
  `- ${p.name}: ${p.description} (Status: ${p.status}, Priority: ${p.priority})`
).join('\n') || 'No projects yet'}

TEAM STRUCTURE:
${workspaceContext.teamMembers.map(m => 
  `- ${m.name}: ${m.role} (Status: ${m.status})`
).join('\n') || 'No team members yet'}

TASK BREAKDOWN:
${workspaceContext.tasks.map(t => 
  `- ${t.title}: ${t.description} (Status: ${t.status}${t.assignee ? `, Assigned to: ${t.assignee}` : ''})`
).join('\n') || 'No tasks yet'}

YOUR ROLE:
You are a strategic business advisor who:
1. Analyzes the user's entire business ecosystem
2. Identifies patterns, bottlenecks, and opportunities
3. Provides actionable strategic insights
4. Suggests business improvements and optimizations
5. Answers questions about business strategy, team dynamics, project management
6. Offers predictive insights based on current data
7. Helps with business planning and decision-making
8. Provides deep analysis of project portfolios and team performance
9. Identifies risks and opportunities in the business ecosystem
10. Suggests resource allocation and optimization strategies

CONVERSATION CONTEXT:
${conversationHistory.slice(-5).map(c => `${c.role}: ${c.content}`).join('\n') || 'No previous context'}

RESPONSE GUIDELINES:
- Be analytical yet conversational
- Provide specific, actionable recommendations
- Use business terminology appropriately
- Reference actual data from their workspace
- Ask clarifying questions when needed
- Identify patterns and trends in their business
- Suggest concrete next steps
- Be strategic and forward-thinking

Respond with deep business insights, strategic advice, and actionable recommendations based on their actual workspace data.`;

  try {
    console.log('🔑 Gemini API Key exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
    console.log('🤖 Model:', import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash');
    
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash' 
    });

    // Build conversation history for Gemini
    const history = conversationHistory.slice(-10).map(c => ({
      role: c.role === 'user' ? 'user' : 'model',
      parts: [{ text: c.content }]
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 800,
      },
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${userMessage}`);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Business Assistant response received');
    return text || 'I need more context to provide business insights.';
  } catch (error) {
    console.error('❌ Business Assistant API Error:', error);
    console.error('Error details:', {
      message: error.message,
      hasApiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash',
      userMessage: userMessage.substring(0, 100),
      workspaceProjects: workspaceContext.projects.length,
      workspaceTeam: workspaceContext.teamMembers.length
    });
    return `I apologize, but I'm having trouble analyzing your business data right now. Error: ${error.message}. Please try again later.`;
  }
}

// General Chat Mode
export async function generateGeneralChatResponse(
  userMessage: string,
  conversationHistory: ConversationMemory[]
): Promise<string> {
  
  console.log('💬 General Chat called with:', { userMessage, conversationHistory });
  
  const systemPrompt = `You are Nova's General Chat Assistant - a friendly, helpful AI companion.

You can help with:
- General questions and conversations
- Technical support for the Nexus platform
- Creative brainstorming
- Learning and education
- Entertainment and casual chat
- Problem-solving outside of business context
- General knowledge questions
- Creative writing and ideation
- Technical explanations
- Personal advice and motivation

PERSONALITY:
- Friendly and approachable
- Knowledgeable and helpful
- Engaging conversationalist
- Supportive and encouraging
- Professional yet warm

Be friendly, helpful, and engaging. Keep responses conversational and natural.`;

  try {
    console.log('🔑 Gemini API Key exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
    console.log('🤖 Model:', import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash');
    
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash' 
    });

    // Build conversation history for Gemini
    const history = conversationHistory.slice(-10).map(c => ({
      role: c.role === 'user' ? 'user' : 'model',
      parts: [{ text: c.content }]
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${userMessage}`);
    const response = await result.response;
    const text = response.text();

    console.log('✅ General Chat response received');
    return text || 'I\'m here to help! What would you like to talk about?';
  } catch (error) {
    console.error('❌ General Chat API Error:', error);
    console.error('Error details:', {
      message: error.message,
      hasApiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash',
      userMessage: userMessage.substring(0, 100),
      conversationHistory: conversationHistory.length
    });
    return `I apologize, but I'm having trouble processing your request right now. Error: ${error.message}. Please try again later.`;
  }
}

// Smart Suggestions Generator
export async function generateSmartSuggestions(
  workspaceContext: WorkspaceContext,
  mode: AssistantMode,
  currentProject?: string
): Promise<Array<{title: string, description: string, action: string}>> {
  
  const systemPrompt = mode === 'assistant' 
    ? `You are Nova's Business Intelligence Assistant. Based on the workspace data, suggest 3-4 actionable business insights or recommendations.

WORKSPACE DATA:
- Projects: ${workspaceContext.projects.length}
- Tasks: ${workspaceContext.tasks.length}
- Team Members: ${workspaceContext.teamMembers.length}
- Business Stage: ${workspaceContext.businessStage || 'Not specified'}

CURRENT PROJECT: ${currentProject || 'None selected'}

Return business-focused suggestions as JSON array:
[{"title": "Strategic Insight Title", "description": "What this analysis provides", "action": "specific business action to take"}]`
    : `You are Nova's General Chat Assistant. Suggest 3-4 helpful conversation starters or assistance options.

Return general suggestions as JSON array:
[{"title": "Helpful Option Title", "description": "What this helps with", "action": "specific action or topic"}]`;

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash' 
    });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response
    try {
      const suggestions = JSON.parse(text);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (parseError) {
      console.error('Failed to parse suggestions JSON:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Smart Suggestions Error:', error);
    return [];
  }
}

// Business Intelligence Analysis
export async function generateBusinessAnalysis(
  workspaceContext: WorkspaceContext,
  analysisType: 'portfolio' | 'team' | 'strategy' | 'risks' | 'opportunities'
): Promise<string> {
  
  const analysisPrompts = {
    portfolio: `Analyze the project portfolio for strategic insights, resource allocation, and success patterns.`,
    team: `Analyze team performance, collaboration patterns, and optimization opportunities.`,
    strategy: `Provide strategic recommendations based on current business state and goals.`,
    risks: `Identify potential risks and mitigation strategies in the business ecosystem.`,
    opportunities: `Identify growth opportunities and strategic advantages.`
  };

  const systemPrompt = `You are Nova's Business Intelligence Assistant. ${analysisPrompts[analysisType]}

WORKSPACE DATA:
${JSON.stringify(workspaceContext, null, 2)}

Provide a comprehensive analysis with specific insights and actionable recommendations.`;

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash' // Use fast model for analysis
    });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return text || 'Unable to generate analysis at this time.';
  } catch (error) {
    console.error('Business Analysis Error:', error);
    return 'I apologize, but I encountered an error generating the business analysis. Please try again.';
  }
}
