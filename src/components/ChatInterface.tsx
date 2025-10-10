import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  projectName?: string;
}

export default function ChatInterface({ projectName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm Rena, your entrepreneurial AI assistant. ${projectName ? `I see you've opened **${projectName}**.` : "Select a project to get started, and I'll help you with actionable insights and next steps."}`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      const responses = [
        "I've analyzed your project context. Here are 3 priority actions:\n\n1. Complete the investor one-pager (due Oct 20)\n2. Finalize pricing model\n3. Draft demo video script\n\nWould you like me to help with any of these?",
        "Based on your project data, I suggest focusing on customer discovery first. I can help you create interview templates and track insights.",
        "I've identified a potential growth opportunity: partnering with existing wellness platforms. Let me create a partnership outreach template for you."
      ];
      
      const aiMessage: Message = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full glass rounded-3xl shadow-glass">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Ask Rena</h2>
            <p className="text-sm text-muted-foreground">
              {projectName || "Select a project to begin"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === "user"
                  ? "gradient-primary text-white shadow-primary"
                  : "bg-card border border-border shadow-soft"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border border-border p-4 rounded-2xl shadow-soft">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-glow"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-glow" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-glow" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your project, request tasks, or get insights..."
            className="min-h-[60px] resize-none glass border-border"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="gradient-primary text-white shadow-primary hover:opacity-90 transition-smooth"
            size="icon"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
