import { LayoutDashboard, Plus, Settings, Sparkles, Search, Bot, Users, Mail, Network, Database, Zap, Map, StickyNote, CheckSquare, Clock, ChevronLeft, ChevronRight, ChevronDown, Calendar, CalendarDays, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarStatsSkeleton } from "./LoadingSkeleton";
import PlatformSearch from "./PlatformSearch";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  onNewProject?: () => void;
  onDashboard?: () => void;
  onConnections?: () => void;
  onEmail?: () => void;
  onProjectMap?: () => void;
  onNotes?: () => void;
  onTasks?: () => void;
  onTeam?: () => void;
  onTimer?: () => void;
  onCalendar?: () => void;
  onBookings?: () => void;
  onNavigateToTab?: (tab: string) => void;
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high";
  }>;
  isLoading?: boolean;
  hasEverCreatedProject?: boolean;
}

export default function Sidebar({ 
  onDashboard, 
  onConnections,
  onEmail,
  onProjectMap,
  onNotes,
  onTasks,
  onTeam,
  onTimer,
  onCalendar,
  onBookings,
  onNavigateToTab,
  projects = [], 
  isLoading = false, 
  hasEverCreatedProject = false 
}: SidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAIBusinessSuiteMinimized, setIsAIBusinessSuiteMinimized] = useState(false);
  const [isBusinessToolsMinimized, setIsBusinessToolsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleAIBusinessSuite = () => {
    setIsAIBusinessSuiteMinimized(!isAIBusinessSuiteMinimized);
  };

  const toggleBusinessTools = () => {
    setIsBusinessToolsMinimized(!isBusinessToolsMinimized);
  };

  return (
    <div className={`${isMinimized ? 'w-16' : 'w-72'} h-screen bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border ${isMinimized ? 'p-3' : 'p-6'} flex flex-col backdrop-blur-sm transition-all duration-300 ease-in-out`}>
      {/* Enhanced Logo */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`${isMinimized ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl overflow-hidden shadow-lg shadow-blue-500/25 transition-all duration-300`}>
              <img 
                src="https://storage.googleapis.com/msgsndr/555cPqlZh4po0jGHqsnl/media/68f296a880dbce7deda676f5.png"
                alt="Nexus AI Logo"
                className={`${isMinimized ? 'w-12 h-12' : 'w-16 h-16'} object-contain transition-all duration-300 logo-img`}
                loading="eager"
                decoding="sync"
                width={isMinimized ? 48 : 64}
                height={isMinimized ? 48 : 64}
              />
            </div>
            {!isMinimized && (
              <div className="transition-opacity duration-300">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Nexus AI</h1>
                <p className="text-xs text-sidebar-foreground/60 font-medium">
                  Business Intelligence Suite
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMinimize}
            className="h-8 w-8 p-0 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"
          >
            {isMinimized ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced Platform Search */}
      {!isMinimized && (
        <div className="space-y-4 mb-6">
          <PlatformSearch className="w-full" onNavigateToTab={onNavigateToTab} />
        
        {/* Main Navigation Buttons */}
        <div className="space-y-2">
        </div>
        
        {/* AI Business Suite Section */}
        <div className="space-y-3">
          {!isMinimized && (
            <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-sidebar-foreground">AI Business Suite</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAIBusinessSuite}
                className="h-6 w-6 p-0 hover:bg-blue-500/10"
              >
                <ChevronDown className={`w-3 h-3 text-blue-400 transition-transform duration-200 ${isAIBusinessSuiteMinimized ? 'rotate-[-90deg]' : ''}`} />
              </Button>
            </div>
          )}
          
          {!isAIBusinessSuiteMinimized && (
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                onClick={onProjectMap}
                title={isMinimized ? "Business Map" : undefined}
              >
                <Map className="w-4 h-4 group-hover:text-primary transition-colors" />
                {!isMinimized && <span className="font-medium">Business Map</span>}
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                onClick={() => navigate('/nexus')}
                title={isMinimized ? "Nexus Agents" : undefined}
              >
                <Bot className="w-4 h-4 group-hover:text-primary transition-colors" />
                {!isMinimized && <span className="font-medium">Nexus Agents</span>}
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                onClick={onDashboard}
                title={isMinimized ? "App Library" : undefined}
              >
                <LayoutDashboard className="w-4 h-4 group-hover:text-primary transition-colors" />
                {!isMinimized && <span className="font-medium">App Library</span>}
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                onClick={() => navigate('/settings')}
                title={isMinimized ? "My Account" : undefined}
              >
                <Settings className="w-4 h-4 group-hover:text-primary transition-colors" />
                {!isMinimized && <span className="font-medium">My Account</span>}
              </Button>
            </div>
          )}
            
            {/* Business Tools within AI Business Suite */}
            <div className="space-y-2 mt-4">
              {!isMinimized && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-sidebar-foreground">Business Tools</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleBusinessTools}
                    className="h-6 w-6 p-0 hover:bg-primary/15"
                  >
                    <ChevronDown className={`w-3 h-3 text-primary transition-transform duration-200 ${isBusinessToolsMinimized ? 'rotate-[-90deg]' : ''}`} />
                  </Button>
                </div>
              )}
              
              {!isBusinessToolsMinimized && (
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                    onClick={onCalendar}
                    title={isMinimized ? "Calendar" : undefined}
                  >
                    <Calendar className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {!isMinimized && <span className="font-medium">Calendar</span>}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                    onClick={onConnections}
                    title={isMinimized ? "Connect" : undefined}
                  >
                    <Users className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {!isMinimized && <span className="font-medium">Connect</span>}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                    onClick={onTasks}
                    title={isMinimized ? "Tasks" : undefined}
                  >
                    <CheckSquare className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {!isMinimized && <span className="font-medium">Tasks</span>}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                    onClick={onEmail}
                    title={isMinimized ? "Email" : undefined}
                  >
                    <Mail className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {!isMinimized && <span className="font-medium">Email</span>}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                    onClick={onNotes}
                    title={isMinimized ? "Notes" : undefined}
                  >
                    <StickyNote className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {!isMinimized && <span className="font-medium">Notes</span>}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                    onClick={onTimer}
                    title={isMinimized ? "Timer" : undefined}
                  >
                    <Clock className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {!isMinimized && <span className="font-medium">Timer</span>}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                    onClick={onTeam}
                    title={isMinimized ? "Team" : undefined}
                  >
                    <Users className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {!isMinimized && <span className="font-medium">Team</span>}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full ${isMinimized ? 'justify-center' : 'justify-start gap-3'} text-sidebar-foreground hover:text-foreground hover:bg-primary/15 hover:scale-102 transition-all duration-300 h-10 border-0 shadow-none group`}
                    onClick={onBookings}
                    title={isMinimized ? "Bookings" : undefined}
                  >
                    <CalendarDays className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {!isMinimized && <span className="font-medium">Bookings</span>}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Quick Stats */}
      {!isMinimized && (
        <>
      {isLoading ? (
        <SidebarStatsSkeleton />
      ) : projects.length > 0 ? (
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-xl border border-blue-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-blue-400" />
                <div className="text-sm font-semibold text-sidebar-foreground">Quick Stats</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col">
                  <span className="text-sidebar-foreground/60">Total</span>
                  <span className="font-semibold text-blue-400">{projects.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sidebar-foreground/60">Active</span>
                  <span className="font-semibold text-primary">{projects.filter(p => p.status === "Active").length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sidebar-foreground/60">High Priority</span>
                  <span className="font-semibold text-red-400">{projects.filter(p => p.priority === "high").length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sidebar-foreground/60">Planning</span>
                  <span className="font-semibold text-yellow-400">{projects.filter(p => p.status === "Planning").length}</span>
                </div>
          </div>
        </div>
      ) : null}
        </>
      )}

      {/* Enhanced Keyboard Shortcuts */}
      {!isMinimized && (
        <div className="mb-6 p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/5 rounded-xl border border-purple-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-purple-400" />
            <div className="text-sm font-semibold text-sidebar-foreground">Shortcuts</div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-sidebar-foreground/70">Quick Switcher</span>
              <kbd className="px-2 py-1 bg-background/50 border border-border/50 rounded text-xs font-mono">⌘K</kbd>
            </div>
          <div className="flex items-center justify-between">
              <span className="text-sidebar-foreground/70">Close Project</span>
              <kbd className="px-2 py-1 bg-background/50 border border-border/50 rounded text-xs font-mono">Esc</kbd>
          </div>
          <div className="flex items-center justify-between">
              <span className="text-sidebar-foreground/70">New Project</span>
              <kbd className="px-2 py-1 bg-background/50 border border-border/50 rounded text-xs font-mono">⌘N</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Navigation */}
      <nav className="flex-1 space-y-4">
        {/* Main Navigation - Empty for now */}
        


      </nav>

      {/* Sign Out Button */}
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={async () => {
            console.log('🔴 Sign out button clicked');
            try {
              console.log('🔄 Calling signOut...');
              await signOut();
              console.log('✅ Sign out successful');
              
              // Clear any local storage data
              console.log('🧹 Clearing localStorage...');
              localStorage.clear();
              
              // Force a hard reload to the auth page
              console.log('🔄 Redirecting to auth page...');
              window.location.href = '/';
              
              // Fallback: if the above doesn't work, try navigate
              setTimeout(() => {
                navigate('/');
              }, 100);
            } catch (error) {
              console.error('❌ Error signing out:', error);
              // Even if there's an error, clear local data and redirect
              localStorage.clear();
              window.location.href = '/';
            }
          }}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!isMinimized && "Sign Out"}
        </Button>
      </div>

    </div>
  );
}
