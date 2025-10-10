import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Mic, Volume2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface NovaChatInterfaceProps {
  userName?: string;
  onSendMessage?: (message: string) => void;
  className?: string;
}

const NovaChatInterface: React.FC<NovaChatInterfaceProps> = ({
  userName = "User",
  onSendMessage,
  className = ""
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello ${userName}! I'm Nova, your intelligent project companion. I can help you with project management, task tracking, time analysis, and much more. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate AI response (mock for now)
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock responses based on message content
    const responses = {
      'project': "I can see you're interested in project management. I can help you analyze your current projects, suggest improvements, or create new ones. What specific aspect would you like to focus on?",
      'task': "I'd be happy to help with task management! I can show you pending tasks, help prioritize work, or assist with task creation. What tasks are you working on?",
      'time': "Let me analyze your time tracking data. I can provide insights on productivity patterns, suggest time optimizations, or help you set better time estimates for your projects.",
      'progress': "Based on your project data, I can see several areas where we can improve progress tracking. Would you like me to show you a detailed progress report or suggest next steps?",
      'default': "That's an interesting question! I'm here to help you with project management, task tracking, time analysis, and team collaboration. Could you be more specific about what you'd like to accomplish?"
    };

    const lowerMessage = userMessage.toLowerCase();
    let response = responses.default;
    
    if (lowerMessage.includes('project')) response = responses.project;
    else if (lowerMessage.includes('task')) response = responses.task;
    else if (lowerMessage.includes('time') || lowerMessage.includes('timer')) response = responses.time;
    else if (lowerMessage.includes('progress')) response = responses.progress;

    setIsTyping(false);
    return response;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const userMessage = message.trim();
      
      // Add user message
      const newUserMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      setMessage("");
      
      // Call external handler if provided
      if (onSendMessage) {
        onSendMessage(userMessage);
      }
      
      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage);
      
      const newAIMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAIMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleQuickAction = async (quickMessage: string) => {
    setMessage(quickMessage);
    // Trigger submit after a brief delay to show the message in input
    setTimeout(() => {
      handleSubmit(new Event('submit') as any);
    }, 100);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Welcome Message */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-medium text-white mb-2">
          Good to see you, {userName}.
        </h2>
      </div>

      {/* Chat Container */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Chat History */}
        <div 
          ref={chatContainerRef}
          className="h-80 overflow-y-auto p-6 space-y-4 scrollbar-none"
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
                "max-w-[70%] rounded-2xl px-4 py-3",
                msg.type === 'user'
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800/80 text-gray-100 border border-gray-700/50"
              )}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={cn(
                  "text-xs mt-2 opacity-70",
                  msg.type === 'user' ? "text-blue-100" : "text-gray-400"
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-700/50 p-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl overflow-hidden">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                className="w-full h-12 pl-12 pr-24 bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                disabled={isTyping}
              />
              
              {/* Left side icons */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Plus className="w-4 h-4 text-gray-400 hover:text-white transition-colors cursor-pointer" />
              </div>
              
              {/* Right side icons */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Button
                  type="button"
                  onClick={toggleRecording}
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-gray-700/50 transition-colors"
                  disabled={isTyping}
                >
                  <Mic className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </Button>
                
                <div className={`relative ${isRecording ? 'animate-pulse' : ''}`}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isRecording 
                        ? 'bg-green-500/20 hover:bg-green-500/30' 
                        : 'bg-blue-500/20 hover:bg-blue-500/30'
                    }`}
                    disabled={!message.trim() || isTyping}
                  >
                    <Volume2 className={`w-4 h-4 transition-colors ${
                      isRecording ? 'text-green-400' : 'text-blue-400'
                    }`} />
                  </Button>
                  
                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </form>
          
          {/* Quick Actions */}
          <div className="flex justify-center mt-4 gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white transition-colors px-3 py-1 text-xs"
              onClick={() => handleQuickAction("Show me my project progress")}
              disabled={isTyping}
            >
              Project Progress
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white transition-colors px-3 py-1 text-xs"
              onClick={() => handleQuickAction("What tasks need attention?")}
              disabled={isTyping}
            >
              Pending Tasks
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white transition-colors px-3 py-1 text-xs"
              onClick={() => handleQuickAction("Create a new project")}
              disabled={isTyping}
            >
              New Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaChatInterface;
