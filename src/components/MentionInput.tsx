import { useState, useRef, useEffect, forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import TeamMemberAvatar from "./TeamMemberAvatar";
import { type TeamMember } from "@/lib/collaboration";
import { cn } from "@/lib/utils";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  teamMembers: TeamMember[];
  disabled?: boolean;
  className?: string;
}

interface MentionPosition {
  start: number;
  end: number;
  query: string;
}

const MentionInput = forwardRef<HTMLTextAreaElement, MentionInputProps>(({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  teamMembers,
  disabled = false,
  className
}, ref) => {
  const [mentionPosition, setMentionPosition] = useState<MentionPosition | null>(null);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Combine refs
  useEffect(() => {
    if (ref && textareaRef.current) {
      if (typeof ref === 'function') {
        ref(textareaRef.current);
      } else {
        ref.current = textareaRef.current;
      }
    }
  }, [ref]);

  const findMentionPosition = (text: string, cursorPosition: number): MentionPosition | null => {
    // Look backwards from cursor position for @ symbol
    let start = cursorPosition - 1;
    while (start >= 0 && text[start] !== '@' && text[start] !== ' ') {
      start--;
    }
    
    if (start < 0 || text[start] !== '@') {
      return null;
    }
    
    // Look forwards to find the end of the mention query
    let end = start + 1;
    while (end < text.length && text[end] !== ' ' && text[end] !== '\n') {
      end++;
    }
    
    return {
      start,
      end,
      query: text.slice(start + 1, end)
    };
  };

  const getFilteredMembers = () => {
    if (!mentionPosition) return [];
    
    const query = mentionPosition.query.toLowerCase();
    return teamMembers.filter(member => 
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  };

  const handleTextChange = (newValue: string) => {
    onChange(newValue);
    
    // Check for mention trigger
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const mentionPos = findMentionPosition(newValue, cursorPosition);
    
    if (mentionPos && mentionPos.query.length >= 0) {
      setMentionPosition(mentionPos);
      setIsMentionOpen(true);
      setSelectedMentionIndex(0);
    } else {
      setMentionPosition(null);
      setIsMentionOpen(false);
    }
  };

  const insertMention = (member: TeamMember) => {
    if (!mentionPosition || !textareaRef.current) return;
    
    const before = value.slice(0, mentionPosition.start);
    const after = value.slice(mentionPosition.end);
    const mentionText = `@${member.name} `;
    
    const newValue = before + mentionText + after;
    onChange(newValue);
    
    // Move cursor after the mention
    const newCursorPosition = before.length + mentionText.length;
    setTimeout(() => {
      textareaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
      textareaRef.current?.focus();
    }, 0);
    
    setMentionPosition(null);
    setIsMentionOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isMentionOpen) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
      return;
    }

    const filteredMembers = getFilteredMembers();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < filteredMembers.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : filteredMembers.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredMembers[selectedMentionIndex]) {
          insertMention(filteredMembers[selectedMentionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setMentionPosition(null);
        setIsMentionOpen(false);
        break;
    }
  };

  const handleClick = () => {
    if (!textareaRef.current) return;
    
    const cursorPosition = textareaRef.current.selectionStart || 0;
    const mentionPos = findMentionPosition(value, cursorPosition);
    
    if (mentionPos && mentionPos.query.length >= 0) {
      setMentionPosition(mentionPos);
      setIsMentionOpen(true);
    }
  };

  const filteredMembers = getFilteredMembers();

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "min-h-[60px] max-h-[200px] resize-none bg-secondary border-border text-secondary-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary",
          className
        )}
      />
      
      {/* Mention Popover */}
      <Popover open={isMentionOpen && filteredMembers.length > 0}>
        <PopoverTrigger asChild>
          <div className="absolute inset-0 pointer-events-none" />
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0 bg-card border-border shadow-lg"
          side="top"
          align="start"
          sideOffset={5}
        >
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
              Mention team members
            </div>
            <ScrollArea className="max-h-60">
              <div className="space-y-1">
                {filteredMembers.map((member, index) => (
                  <Button
                    key={member.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-auto p-2",
                      index === selectedMentionIndex && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => insertMention(member)}
                  >
                    <TeamMemberAvatar 
                      member={member} 
                      size="sm" 
                      showStatus={true}
                    />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">
                        {member.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {member.role}
                    </Badge>
                  </Button>
                ))}
              </div>
            </ScrollArea>
            
            {filteredMembers.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No team members found
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Send Button */}
      <div className="absolute bottom-2 right-2">
        <Button
          size="sm"
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="h-8 w-8 p-0 gradient-primary text-white shadow-primary hover:opacity-90 transition-smooth"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
});

MentionInput.displayName = "MentionInput";

export default MentionInput;

