import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  User, 
  Sparkles, 
  Zap, 
  Brain, 
  MessageSquare,
  ArrowRight,
  Play,
  Pause
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const exampleConversations = [
  {
    user: "Hey Nova, how are my projects looking?",
    ai: "Hi there! 👋 Your projects are looking great! You've got Velocity at 75% completion with just 2 tasks left, and Verstige is in the planning phase. Your team's been really productive this week. Would you like me to dive deeper into any specific project?"
  },
  {
    user: "What's on my plate today?",
    ai: "Good morning! ☀️ You've got 5 high-priority tasks waiting for you. The most urgent is the API integration for Velocity - it's due in 2 days. I noticed you're usually most productive in the mornings, so maybe tackle that one first? Want me to help you plan your day?"
  },
  {
    user: "I need to plan a new brand timeline",
    ai: "Absolutely! I'd love to help you create a timeline. Based on your previous brands, I'm thinking we break this into 4 phases: Planning (1 week), Development (3 weeks), Testing (1 week), and Launch (3 days). Sound good? I can set this all up in your BrandMap right now."
  },
  {
    user: "How am I doing with my time?",
    ai: "You're doing fantastic! 🎯 You've logged 32 hours this week across 3 projects, with 40% spent on development - that's right in your sweet spot. Your peak productivity is between 10 AM - 2 PM, so you're already optimizing your schedule perfectly. Want to see some detailed insights?"
  },
  {
    user: "My team seems overwhelmed, can you help?",
    ai: "I can definitely help with that! I've been watching your team's workload and noticed Sarah and Mike are at 85% capacity, while Alex and Jordan have some bandwidth. I think we could redistribute some of the marketing tasks from Velocity to balance things out. Should I create a resource plan for you?"
  }
];

const NovaShowcase: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hey there! 👋 I'm Nova, your intelligent project companion. I'm here to help you manage projects, track tasks, analyze productivity, and connect everything in your Nexus workspace. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [currentConversation, setCurrentConversation] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const typeText = async (text: string, speed: number = 30) => {
    setIsTyping(true);
    setCurrentText("");
    
    for (let i = 0; i <= text.length; i++) {
      if (!isPlaying) break;
      setCurrentText(text.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    
    setIsTyping(false);
  };

  const deleteText = async (speed: number = 15) => {
    setIsDeleting(true);
    const text = currentText;
    
    for (let i = text.length; i >= 0; i--) {
      if (!isPlaying) break;
      setCurrentText(text.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    
    setIsDeleting(false);
  };

  const startDemo = () => {
    setIsPlaying(true);
    runConversationSequence();
  };

  const stopDemo = () => {
    setIsPlaying(false);
    setCurrentText("");
    setIsTyping(false);
    setIsDeleting(false);
  };

  const runConversationSequence = async () => {
    while (isPlaying) {
      const conversation = exampleConversations[currentConversation];
      
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: conversation.user,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isPlaying) break;
      
      // Type AI response
      await typeText(conversation.ai);
      
      // Add AI message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: conversation.ai,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setCurrentText("");
      
      // Wait before next conversation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (!isPlaying) break;
      
      // Delete messages for next conversation
      setMessages(prev => prev.slice(0, 1)); // Keep only the initial message
      
      // Move to next conversation
      setCurrentConversation(prev => (prev + 1) % exampleConversations.length);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // Auto-start demo after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      startDemo();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
            <Sparkles className="w-4 h-4 mr-2" />
            Meet Nova AI
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Your Intelligent
            <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Project Companion
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Nova understands your projects, tracks your progress, and connects everything in your Nexus AI workspace. 
            Experience the future of project management.
          </p>

          <div className="flex justify-center gap-4">
            <Button
              onClick={isPlaying ? stopDemo : startDemo}
              className={cn(
                "px-8 py-4 text-lg",
                isPlaying 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Stop Demo
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Demo
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="px-8 py-4 text-lg border-blue-400 text-blue-300 hover:bg-blue-400/10"
              onClick={() => window.location.href = '/workspace'}
            >
              Try Nova Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Chat Demo */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-gray-700/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Nova AI</h3>
                    <p className="text-sm text-gray-400">
                      {isPlaying ? "Demonstrating capabilities..." : "Your intelligent project companion"}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-500"
                    )} />
                    <span className="text-xs text-gray-400">
                      {isPlaying ? "Live Demo" : "Ready"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4 scrollbar-none">
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
                      "max-w-[80%] rounded-2xl px-4 py-3",
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
                {(isTyping || isDeleting) && currentText && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-2xl px-4 py-3">
                      <p className="text-sm">
                        {currentText}
                        {isTyping && <span className="animate-pulse ml-1">|</span>}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input (Demo) */}
              <div className="border-t border-gray-700/50 p-4">
                <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl overflow-hidden">
                  <input
                    type="text"
                    placeholder="Try asking Nova about your projects..."
                    className="w-full h-12 pl-4 pr-4 bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                    disabled
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Button
                      size="sm"
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-2"
                      disabled
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Demo mode - Try the full experience in your workspace
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nova Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Intelligent Insights</h3>
            <p className="text-gray-400">
              Nova analyzes your project data to provide actionable insights and recommendations.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Instant Responses</h3>
            <p className="text-gray-400">
              Get immediate answers about your projects, tasks, and team performance.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Natural Conversation</h3>
            <p className="text-gray-400">
              Chat with Nova using natural language - no complex commands needed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NovaShowcase;

