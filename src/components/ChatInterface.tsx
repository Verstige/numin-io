import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, X, MessageSquare } from "lucide-react";
import EmptyState from "./EmptyState";
import ActionSuggestions from "./ActionButton";
import MentionInput from "./MentionInput";
import { generateSmartResponse, generateProactiveSuggestions, type ActionSuggestion, type ProjectContext } from "@/lib/ai-intelligence";
import { type TeamMember, type Mention, mockMentions } from "@/lib/collaboration";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  suggestions?: ActionSuggestion[];
}

interface ChatInterfaceProps {
  projectName?: string;
  onCloseProject?: () => void;
  activeProject?: ProjectContext | null;
  allProjects?: ProjectContext[];
  teamMembers?: TeamMember[];
}

export default function ChatInterface({ 
  projectName, 
  onCloseProject, 
  activeProject,
  allProjects = [],
  teamMembers = []
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [proactiveSuggestions, setProactiveSuggestions] = useState<ActionSuggestion[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mentions, setMentions] = useState<Mention[]>(mockMentions);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with welcome message and proactive suggestions
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: "assistant",
        content: `Hello! I'm Rena, your AI project management assistant. ${projectName ? `I see you've opened **${projectName}**.` : "Select a project to get started, and I'll help you with actionable insights and next steps."}`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      
      // Generate proactive suggestions
      const suggestions = generateProactiveSuggestions(allProjects);
      setProactiveSuggestions(suggestions);
    }
  }, [projectName, allProjects, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check for mentions in the message
    const mentionRegex = /@(\w+)/g;
    const foundMentions = input.match(mentionRegex);
    
    if (foundMentions) {
      foundMentions.forEach(mention => {
        const userName = mention.slice(1); // Remove @ symbol
        const member = teamMembers.find(m => 
          m.name.toLowerCase().includes(userName.toLowerCase())
        );
        
        if (member) {
          // Create mention notification
          const newMention: Mention = {
            id: `mention_${Date.now()}_${Math.random()}`,
            userId: member.id,
            userName: member.name,
            userAvatar: member.avatar,
            timestamp: new Date(),
            read: false,
            context: input
          };
          
          setMentions(prev => [newMention, ...prev]);
          
          // Show toast notification
          toast({
            title: "Mentioned",
            description: `You mentioned ${member.name} in your message`,
          });
        }
      });
    }

    const userMessage: Message = { 
      role: "user", 
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Generate smart AI response with context
    setTimeout(() => {
      const { response, suggestions } = generateSmartResponse(
        input,
        activeProject || null,
        allProjects
      );
      
      const aiMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
        suggestions: suggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
  };

  const handleAction = (suggestion: ActionSuggestion) => {
    // Handle different action types
    switch (suggestion.type) {
      case "create_task":
        toast({
          title: "Task Created",
          description: `Created task: ${suggestion.title}`,
        });
        break;
      case "schedule_meeting":
        toast({
          title: "Meeting Scheduled",
          description: `Scheduled: ${suggestion.title}`,
        });
        break;
      case "add_member":
        toast({
          title: "Team Member Added",
          description: `Added member for: ${suggestion.title}`,
        });
        break;
      case "set_reminder":
        toast({
          title: "Reminder Set",
          description: `Reminder set: ${suggestion.title}`,
        });
        break;
      case "update_status":
        toast({
          title: "Status Updated",
          description: `Updated: ${suggestion.title}`,
        });
        break;
    }
    
    // Execute custom action if provided
    if (suggestion.action) {
      suggestion.action();
    }
  };

  return (
    <div className="flex flex-col h-full bg-chatgpt-card rounded-3xl shadow-glass border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Ask Rena</h2>
              <p className="text-sm text-muted-foreground">
                {projectName || "Select a project to begin"}
              </p>
            </div>
          </div>
          {projectName && onCloseProject && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseProject}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!projectName ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState 
              type="no-active-project"
              onAction={() => {
                // This could trigger a project selection modal or focus the project grid
                const projectGrid = document.querySelector('[class*="grid"]');
                projectGrid?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === "user"
                  ? "gradient-primary text-white shadow-primary"
                  : "bg-secondary border border-border shadow-soft text-secondary-foreground"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.suggestions && msg.suggestions.length > 0 && (
                <ActionSuggestions
                  suggestions={msg.suggestions}
                  onAction={handleAction}
                  compact={true}
                />
              )}
            </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-secondary border border-border p-4 rounded-2xl shadow-soft">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-glow"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-glow" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-glow" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Proactive Suggestions */}
        {proactiveSuggestions.length > 0 && messages.length === 1 && (
          <div className="mt-4">
            <ActionSuggestions
              suggestions={proactiveSuggestions}
              onAction={handleAction}
              title="Proactive Insights"
            />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border">
        <MentionInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder={projectName ? `Ask Rena about ${projectName} or mention @team members...` : "Select a project to start chatting with Rena..."}
          teamMembers={teamMembers}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
