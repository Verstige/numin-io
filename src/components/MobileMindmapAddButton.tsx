import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Plus, Building2, Target, CheckSquare, Flag, FileText, Users } from 'lucide-react';

interface MobileMindmapAddButtonProps {
  onElementAdd: (elementType: string) => void;
}

const MobileMindmapAddButton: React.FC<MobileMindmapAddButtonProps> = ({ onElementAdd }) => {
  const [isOpen, setIsOpen] = useState(false);

  const elementTemplates = [
    { 
      type: 'business', 
      icon: Building2, 
      label: 'Business', 
      description: 'Main business entity',
      color: 'blue'
    },
    { 
      type: 'project', 
      icon: Target, 
      label: 'Project', 
      description: 'Project or initiative',
      color: 'red'
    },
    { 
      type: 'task', 
      icon: CheckSquare, 
      label: 'Task', 
      description: 'Action item',
      color: 'green'
    },
    { 
      type: 'milestone', 
      icon: Flag, 
      label: 'Milestone', 
      description: 'Key achievement',
      color: 'purple'
    },
    { 
      type: 'resource', 
      icon: FileText, 
      label: 'Resource', 
      description: 'Document or tool',
      color: 'orange'
    },
    { 
      type: 'team', 
      icon: Users, 
      label: 'Team', 
      description: 'Team member',
      color: 'orange'
    }
  ];

  const handleElementAdd = (elementType: string) => {
    onElementAdd(elementType);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Add Button */}
      <div className="fixed bottom-24 right-4 z-40 xl:hidden">
        <Button
          data-mobile-add-button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="w-16 h-16 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-7 h-7" />
        </Button>
        {/* Add a subtle pulse animation */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
      </div>

      {/* Element Selection Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Element</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                ×
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto">
              {elementTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.type}
                    onClick={() => handleElementAdd(template.type)}
                    className="p-4 rounded-lg border border-border hover:bg-background/50 transition-all text-left touch-manipulation active:scale-95"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-${template.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${template.color}-600`} />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">{template.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground mb-2">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleElementAdd('business')}
                  className="justify-start"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  New Business
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleElementAdd('project')}
                  className="justify-start"
                >
                  <Target className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileMindmapAddButton;
