import React from 'react';
import { Map, CheckSquare, StickyNote, Clock, Calendar } from 'lucide-react';
import { type WorkspaceTab } from './WorkspaceTabs';

interface MobileBottomNavProps {
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onSearch: () => void;
  onMenu: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  currentTab, 
  onTabChange, 
  onSearch, 
  onMenu 
}) => {
  const navItems = [
    { id: 'mindmap' as WorkspaceTab, icon: Map, label: 'Map' },
    { id: 'tasks' as WorkspaceTab, icon: CheckSquare, label: 'Tasks' },
    { id: 'notes' as WorkspaceTab, icon: StickyNote, label: 'Notes' },
    { id: 'timer' as WorkspaceTab, icon: Clock, label: 'Timer' },
    { id: 'calendar' as WorkspaceTab, icon: Calendar, label: 'Calendar' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 xl:hidden">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all touch-manipulation active:scale-95 ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
