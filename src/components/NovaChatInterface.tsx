import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Mic, Volume2, Bot, User, Brain, MessageSquare, TrendingUp, Users, Target, AlertTriangle, Lightbulb, Trash2, Send, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateBusinessAssistantResponse, generateGeneralChatResponse, generateSmartSuggestions, type AssistantMode, type WorkspaceContext, type ConversationMemory } from "@/lib/gemini";
import { debugEnvironment } from "@/lib/debug-env";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { toast } from "@/hooks/use-toast";
import NovaTeamMode from "./NovaTeamMode";

// Message renderer component for formatting text with markdown-like syntax
const MessageRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  const formatText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        const boldText = part.slice(2, -2);
        return <strong key={partIndex} className="font-semibold text-white">{boldText}</strong>;
      } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        // Italic text
        const italicText = part.slice(1, -1);
        return <em key={partIndex} className="italic text-gray-300">{italicText}</em>;
      } else {
        // Regular text
        return <span key={partIndex}>{part}</span>;
      }
    });
  };
  
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => {
        const trimmedParagraph = paragraph.trim();
        
        // Check if it's a list item (starts with number or bullet)
        if (/^\d+\.\s/.test(trimmedParagraph) || /^\*\s/.test(trimmedParagraph)) {
          return (
            <div key={index} className="leading-relaxed pl-2">
              <div className="flex">
                <span className="text-gray-400 mr-2 flex-shrink-0">
                  {trimmedParagraph.match(/^\d+\./) ? 
                    trimmedParagraph.match(/^\d+\./)?.[0] : 
                    '•'
                  }
                </span>
                <div className="flex-1">
                  {formatText(trimmedParagraph.replace(/^(\d+\.|\*)\s/, ''))}
                </div>
              </div>
            </div>
          );
        }
        
        // Regular paragraph
        return (
          <div key={index} className="leading-relaxed">
            {formatText(trimmedParagraph)}
          </div>
        );
      })}
    </div>
  );
};

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  mode?: AssistantMode;
  suggestions?: Array<{title: string, description: string, action: string}>;
}

interface NovaChatInterfaceProps {
  userName?: string;
  workspaceContext?: WorkspaceContext;
  onSendMessage?: (message: string) => void;
  onAppLibrary?: () => void;
  onNavigateToTab?: (tab: string) => void;
  className?: string;
}

const NovaChatInterface: React.FC<NovaChatInterfaceProps> = ({
  userName = "User",
  workspaceContext,
  onSendMessage,
  onAppLibrary,
  onNavigateToTab,
  className = ""
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('chat');
  const [showTeamMode, setShowTeamMode] = useState(false);
  
  // Speech recognition
  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();
  const [conversationMemory, setConversationMemory] = useState<ConversationMemory[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello! I'm Nova, your intelligent companion. I have two modes: Chat Mode for general conversation and Assistant Mode for deep business insights. What would you like to explore?`,
      timestamp: new Date(),
      mode: 'chat'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(true);

  // Handle speech recognition transcript updates
  useEffect(() => {
    if (transcript && isListening) {
      setMessage(message + (message ? ' ' : '') + transcript);
      resetTranscript();
    }
  }, [transcript, isListening, message, resetTranscript]);

  // Handle speech recognition errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Speech Recognition Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  // Update initial message when userName becomes available
  useEffect(() => {
    if (userName && userName !== "User" && messages.length === 1) {
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: `Hello ${userName}! I'm Nova, your intelligent companion. I have two modes: Chat Mode for general conversation and Assistant Mode for deep business insights. What would you like to explore?`,
          timestamp: new Date(),
          mode: 'chat'
        }
      ]);
    }
  }, [userName]);

  // Debug environment on component mount
  useEffect(() => {
    console.log('🔍 Nova AI Component Mounted for user:', userName);
    const envStatus = debugEnvironment();
    console.log('Environment status:', envStatus);
  }, []);

  // Add scroll event listener to detect manual scrolling
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShouldScroll(isNearBottom);
      };

      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Only scroll to bottom when new messages are added and scrolling is enabled
  useEffect(() => {
    if (messages.length > 0 && shouldScroll) {
      // Use a small delay to ensure DOM is updated
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, shouldScroll]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Load conversation history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`nova-conversation-${userName}`);
    const savedMemory = localStorage.getItem(`nova-memory-${userName}`);
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    }
    
    if (savedMemory) {
      try {
        const parsedMemory = JSON.parse(savedMemory);
        // Convert timestamp strings back to Date objects
        const memoryWithDates = parsedMemory.map((mem: any) => ({
          ...mem,
          timestamp: new Date(mem.timestamp)
        }));
        setConversationMemory(memoryWithDates);
      } catch (error) {
        console.error('Error loading conversation memory:', error);
      }
    }
  }, [userName]);

  // Save conversation history to localStorage
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the welcome message
      localStorage.setItem(`nova-conversation-${userName}`, JSON.stringify(messages));
    }
  }, [messages, userName]);

  // Save conversation memory to localStorage
  useEffect(() => {
    if (conversationMemory.length > 0) {
      localStorage.setItem(`nova-memory-${userName}`, JSON.stringify(conversationMemory));
    }
  }, [conversationMemory, userName]);

  // Generate AI response using OpenAI
  const generateAIResponse = async (userMessage: string): Promise<{response: string, suggestions?: Array<{title: string, description: string, action: string}>}> => {
    setIsTyping(true);
    
    try {
      let response: string;
      let suggestions: Array<{title: string, description: string, action: string}> = [];

      if (assistantMode === 'assistant') {
        // Business Intelligence Mode
        response = await generateBusinessAssistantResponse(
          userMessage,
          workspaceContext || {
            projects: [],
            tasks: [],
            teamMembers: [],
            notes: [],
            currentUser: { name: userName, email: 'user@example.com' }
          },
          conversationMemory
        );
        
        // Generate business-focused suggestions
        suggestions = await generateSmartSuggestions(
          workspaceContext || {
            projects: [],
            tasks: [],
            teamMembers: [],
            notes: [],
            currentUser: { name: userName, email: 'user@example.com' }
          },
          'assistant'
        );
      } else {
        // General Chat Mode
        response = await generateGeneralChatResponse(
          userMessage,
          conversationMemory
        );
        
        // Generate general suggestions
        suggestions = await generateSmartSuggestions(
          workspaceContext || {
            projects: [],
            tasks: [],
            teamMembers: [],
            notes: [],
            currentUser: { name: userName, email: 'user@example.com' }
          },
          'chat'
        );
      }

      // Update conversation memory
      const userMemory: ConversationMemory = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        mode: assistantMode,
        timestamp: new Date(),
        importance: 'medium'
      };

      const aiMemory: ConversationMemory = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        mode: assistantMode,
        timestamp: new Date(),
        importance: 'medium'
      };

      setConversationMemory(prev => [...prev.slice(-20), userMemory, aiMemory]); // Keep last 20 messages
      setIsTyping(false);
      
      return { response, suggestions };
    } catch (error) {
      console.error('AI Response Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userName: userName,
        assistantMode: assistantMode,
        workspaceContext: workspaceContext,
        hasApiKey: !!import.meta.env.VITE_GEMINI_API_KEY
      });
      setIsTyping(false);
      return { 
        response: `I apologize, but I encountered an error processing your request. Error: ${error.message}. Please try again.`,
        suggestions: []
      };
    }
  };

  // Mode switching function
  const switchMode = (newMode: AssistantMode) => {
    setAssistantMode(newMode);
    // Mode switch now happens silently without adding a message
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && assistantMode !== 'team') {
      const userMessage = message.trim();
      
      // Add user message
      const newUserMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
        timestamp: new Date(),
        mode: assistantMode
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      setMessage("");
      
      // Call external handler if provided
      if (onSendMessage) {
        onSendMessage(userMessage);
      }
      
      // Generate AI response
      const { response, suggestions } = await generateAIResponse(userMessage);
      
      const newAIMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
        mode: assistantMode,
        suggestions
      };
      
      setMessages(prev => [...prev, newAIMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
      setIsRecording(false);
    } else {
      startListening();
      setIsRecording(true);
    }
  };

  const handleQuickAction = async (quickMessage: string) => {
    setMessage(quickMessage);
    // Trigger submit after a brief delay to show the message in input
    const timeoutId = setTimeout(() => {
      handleSubmit(new Event('submit') as any);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  };

  const clearConversation = () => {
    // Reset to initial state with current userName
    const currentUserName = userName || "User";
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: `Hello ${currentUserName}! I'm Nova, your intelligent companion. I have two modes: Chat Mode for general conversation and Assistant Mode for deep business insights. What would you like to explore?`,
        timestamp: new Date(),
        mode: 'chat'
      }
    ]);
    setConversationMemory([]);

    // Clear localStorage
    localStorage.removeItem(`nova-conversation-${currentUserName}`);
    localStorage.removeItem(`nova-memory-${currentUserName}`);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>

      {/* Welcome Message */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-medium text-white mb-2">
          Good to see you, {userName}.
        </h2>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center items-center gap-4 mb-4 sm:mb-6">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1 flex gap-1">
          <Button 
            variant={assistantMode === 'assistant' ? 'default' : 'ghost'}
            onClick={() => switchMode('assistant')}
            className={`px-3 py-2 text-xs font-medium transition-all duration-200 ${
              assistantMode === 'assistant'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Brain className="w-4 h-4 mr-1" />
            Assistant
          </Button>
          <Button 
            variant={assistantMode === 'chat' ? 'default' : 'ghost'}
            onClick={() => switchMode('chat')}
            className={`px-3 py-2 text-xs font-medium transition-all duration-200 ${
              assistantMode === 'chat'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Chat
          </Button>
          <Button 
            variant={assistantMode === 'team' ? 'default' : 'ghost'}
            onClick={() => switchMode('team')}
            className={`px-3 py-2 text-xs font-medium transition-all duration-200 ${
              assistantMode === 'team'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Network className="w-4 h-4 mr-1" />
            Team
          </Button>
        </div>
        
        {/* Clear Conversation Button */}
        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Clear conversation history"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Mode-specific header */}
      <div className="text-center mb-4">
        {assistantMode === 'assistant' ? (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-3 mx-4">
            <h3 className="text-sm sm:text-base font-medium text-blue-300 mb-1">
              🧠 Business Intelligence Assistant
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Ask about your projects, team performance, business strategy, and ecosystem insights
            </p>
          </div>
        ) : assistantMode === 'team' ? (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3 mx-4">
            <h3 className="text-sm sm:text-base font-medium text-purple-300 mb-1">
              🌐 Team Mode - AI Coordinator
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Coordinate and orchestrate all your AI agents
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-3 mx-4">
            <h3 className="text-sm sm:text-base font-medium text-green-300 mb-1">
              💬 General Chat Assistant
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Ask me anything - general questions, help, or casual conversation
            </p>
          </div>
        )}
      </div>

      {/* Chat Container */}
      {assistantMode === 'team' ? (
        <div className="h-[600px] bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <NovaTeamMode className="h-full" />
        </div>
      ) : (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Chat History */}
        <ScrollArea ref={scrollAreaRef} className="h-64 sm:h-80">
          <div 
            ref={chatContainerRef}
            className="p-4 sm:p-6 space-y-4"
          >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                msg.type === 'user' 
                  ? 'bg-blue-500 order-2' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              )}>
                {msg.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={cn(
                "max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3",
                msg.type === 'user'
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800/80 text-gray-100 border border-gray-700/50"
              )}>
                <div className="text-xs sm:text-sm">
                  <MessageRenderer content={msg.content} />
                </div>
                
                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-400 font-medium">Suggested actions:</p>
                    <div className="flex flex-wrap gap-1">
                      {msg.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white px-2 py-1 h-auto"
                          onClick={() => handleQuickAction(suggestion.action)}
                          disabled={isTyping}
                        >
                          {suggestion.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className={cn(
                  "text-xs mt-1 sm:mt-2 opacity-70",
                  msg.type === 'user' ? "text-blue-100" : "text-gray-400"
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.mode && (
                    <span className="ml-2 px-1.5 py-0.5 bg-gray-700/50 rounded text-xs">
                      {msg.mode === 'assistant' ? '🧠' : '💬'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          </div>
        </ScrollArea>

        {/* Chat Input - Hidden in Team Mode */}
        {assistantMode !== 'team' && (
        <div className="border-t border-gray-700/50 p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl overflow-hidden">
              <Input
                id="nova-chat-input"
                name="nova-chat-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                className="w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-24 sm:pr-28 bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none text-sm sm:text-base"
                disabled={isTyping}
              />
              
              {/* Left side icons */}
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-white transition-colors cursor-pointer" />
              </div>
              
              {/* Right side icons */}
              <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                {isSupported && (
                  <Button
                    type="button"
                    onClick={toggleRecording}
                    variant="ghost"
                    size="sm"
                    className={`p-1.5 sm:p-2 transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-500/20 hover:bg-red-500/30' 
                        : 'hover:bg-gray-700/50'
                    }`}
                    disabled={isTyping}
                    title={isListening ? "Stop recording" : "Start voice input"}
                  >
                    <Mic className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                      isListening ? 'text-red-400' : 'text-gray-400 hover:text-white'
                    }`} />
                  </Button>
                )}
                
                {/* Enter/Send Button */}
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="p-1.5 sm:p-2 bg-blue-500/20 hover:bg-blue-500/30 transition-all duration-200 rounded-lg"
                  disabled={!message.trim() || isTyping}
                  title="Send message (Enter)"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (message.trim()) {
                      handleSubmit(e);
                    }
                  }}
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 transition-colors" />
                </Button>
                
                <div className={`relative ${isRecording ? 'animate-pulse' : ''}`}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                      isRecording 
                        ? 'bg-green-500/20 hover:bg-green-500/30' 
                        : 'bg-gray-500/20 hover:bg-gray-500/30'
                    }`}
                    disabled={isTyping}
                  >
                    <Volume2 className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                      isRecording ? 'text-green-400' : 'text-gray-400'
                    }`} />
                  </Button>
                  
                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </form>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center mt-3 sm:mt-4 gap-1 sm:gap-2">
            {assistantMode === 'assistant' ? (
              // Business Intelligence Quick Actions
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 transition-colors px-2 sm:px-3 py-1 text-xs flex items-center gap-1"
                  onClick={() => handleQuickAction("Analyze my project portfolio and provide strategic insights")}
                  disabled={isTyping}
                >
                  <TrendingUp className="w-3 h-3" />
                  Portfolio Analysis
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 transition-colors px-2 sm:px-3 py-1 text-xs flex items-center gap-1"
                  onClick={() => handleQuickAction("Analyze team performance and collaboration patterns")}
                  disabled={isTyping}
                >
                  <Users className="w-3 h-3" />
                  Team Performance
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 transition-colors px-2 sm:px-3 py-1 text-xs flex items-center gap-1"
                  onClick={() => handleQuickAction("Provide business strategy recommendations")}
                  disabled={isTyping}
                >
                  <Target className="w-3 h-3" />
                  Strategy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 transition-colors px-2 sm:px-3 py-1 text-xs flex items-center gap-1"
                  onClick={() => handleQuickAction("Identify potential risks and mitigation strategies")}
                  disabled={isTyping}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Risk Assessment
                </Button>
              </>
            ) : (
              // General Chat Quick Actions
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:text-green-300 transition-colors px-2 sm:px-3 py-1 text-xs"
                  onClick={() => handleQuickAction("Help me understand how to use Nexus effectively")}
                  disabled={isTyping}
                >
                  Help & Support
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:text-green-300 transition-colors px-2 sm:px-3 py-1 text-xs"
                  onClick={() => handleQuickAction("Let's brainstorm some creative ideas")}
                  disabled={isTyping}
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Brainstorm
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:text-green-300 transition-colors px-2 sm:px-3 py-1 text-xs"
                  onClick={() => handleQuickAction("Tell me something interesting")}
                  disabled={isTyping}
                >
                  Learn Something
                </Button>
              </>
            )}
          </div>
        </div>
        )}
        </div>
      )}

    </div>
  );
};

export default NovaChatInterface;
