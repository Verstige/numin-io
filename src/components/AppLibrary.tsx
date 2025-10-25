import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Map, 
  FileText, 
  CheckSquare, 
  UserPlus, 
  Mail, 
  Calendar, 
  Users, 
  Timer, 
  CalendarDays, 
  Bot, 
  Search,
  X,
  Sparkles,
  Target,
  Clock,
  Building2,
  Network,
  Database,
  Zap,
  Grid3X3,
  Star,
  TrendingUp,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
  className?: string;
}

interface BusinessTool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'productivity' | 'communication' | 'management' | 'ai' | 'analytics';
  color: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const businessTools: BusinessTool[] = [
  {
    id: 'mindmap',
    name: 'Business Map',
    description: 'Visual project mapping and business ecosystem overview',
    icon: Map,
    category: 'management',
    color: 'bg-blue-500',
    isPopular: true
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Project notes and documentation',
    icon: FileText,
    category: 'productivity',
    color: 'bg-green-500'
  },
  {
    id: 'tasks',
    name: 'Tasks',
    description: 'Task management and project tracking',
    icon: CheckSquare,
    category: 'productivity',
    color: 'bg-orange-500',
    isPopular: true
  },
  {
    id: 'crm',
    name: 'Connect',
    description: 'Customer relationship management',
    icon: UserPlus,
    category: 'communication',
    color: 'bg-purple-500'
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Email management & Gmail integration',
    icon: Mail,
    category: 'communication',
    color: 'bg-red-500'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Workspace calendar & scheduling',
    icon: Calendar,
    category: 'productivity',
    color: 'bg-indigo-500'
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Team management and collaboration',
    icon: Users,
    category: 'management',
    color: 'bg-pink-500'
  },
  {
    id: 'timer',
    name: 'Timer',
    description: 'Time tracking and productivity monitoring',
    icon: Timer,
    category: 'productivity',
    color: 'bg-yellow-500'
  },
  {
    id: 'bookings',
    name: 'Bookings',
    description: 'Appointment booking management',
    icon: CalendarDays,
    category: 'management',
    color: 'bg-teal-500'
  },
  {
    id: 'nova',
    name: 'Nova AI',
    description: 'AI assistant for business intelligence',
    icon: Bot,
    category: 'ai',
    color: 'bg-cyan-500',
    isNew: true,
    isPopular: true
  }
];

const categories = [
  { id: 'all', name: 'All Tools', icon: Database },
  { id: 'productivity', name: 'Productivity', icon: Zap },
  { id: 'communication', name: 'Communication', icon: Network },
  { id: 'management', name: 'Management', icon: Building2 },
  { id: 'ai', name: 'AI Tools', icon: Bot }
];

export default function AppLibrary({ isOpen, onClose, onNavigateToTab, className }: AppLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredTools = businessTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToolClick = (toolId: string) => {
    // Android-style haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50); // Short vibration
    }
    onNavigateToTab(toolId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-md", className)}>
      {/* Android-style bottom sheet */}
      <div className="absolute inset-0 flex items-end justify-center">
        <div className="bg-background/98 backdrop-blur-xl border-t border-border/50 rounded-t-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Grid3X3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">App Library</h2>
                <p className="text-sm text-muted-foreground">Business tools & productivity apps</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="h-9 w-9 p-0 rounded-xl"
              >
                {viewMode === 'grid' ? <MoreHorizontal className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 p-0 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-2xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-6 pb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <Button
                    key={category.id}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "whitespace-nowrap rounded-xl transition-all duration-200",
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Apps Grid/List */}
          <ScrollArea className="flex-1 px-6 pb-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      className="group relative bg-card/30 hover:bg-card/60 border border-border/30 hover:border-border/60 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 touch-manipulation"
                    >
                      {/* App Icon */}
                      <div className="flex flex-col items-center text-center">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg", tool.color)}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        
                        {/* App Name */}
                        <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {tool.name}
                        </h3>
                        
                        {/* Badges */}
                        <div className="flex gap-1 mt-1">
                          {tool.isNew && (
                            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600 border-0 px-1.5 py-0.5">
                              New
                            </Badge>
                          )}
                          {tool.isPopular && (
                            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-600 border-0 px-1.5 py-0.5">
                              <Star className="w-3 h-3 mr-1" />
                              Hot
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      className="group flex items-center gap-4 p-4 bg-card/30 hover:bg-card/60 border border-border/30 hover:border-border/60 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md touch-manipulation"
                    >
                      {/* App Icon */}
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md", tool.color)}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* App Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                            {tool.name}
                          </h3>
                          {tool.isNew && (
                            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600 border-0">
                              New
                            </Badge>
                          )}
                          {tool.isPopular && (
                            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-600 border-0">
                              <Star className="w-3 h-3 mr-1" />
                              Hot
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                      
                      {/* Arrow */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredTools.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">No apps found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </ScrollArea>

          {/* Footer Stats */}
          <div className="px-6 py-4 border-t border-border/30 bg-muted/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>{filteredTools.length} apps available</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Settings className="w-4 h-4" />
                <span>Tap to open</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
