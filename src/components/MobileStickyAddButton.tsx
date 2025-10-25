import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Plus, Building2, Target, CheckSquare, Flag, FileText, Users } from 'lucide-react';

interface MobileStickyAddButtonProps {
  onElementAdd: (elementType: string) => void;
}

const MobileStickyAddButton: React.FC<MobileStickyAddButtonProps> = ({ onElementAdd }) => {
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
      {/* Sticky Add Button - Always visible at bottom */}
      <div className="fixed bottom-4 left-4 right-4 z-50 xl:hidden">
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full shadow-lg">
          <Button
            data-mobile-add-button
            onClick={() => setIsOpen(true)}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Element
          </Button>
        </div>
      </div>

      {/* Element Selection Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New Element</h2>
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
              <div className="text-sm text-muted-foreground mb-3">Quick Actions</div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleElementAdd('business')}
                  className="justify-start h-10"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  New Business
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleElementAdd('project')}
                  className="justify-start h-10"
                >
                  <Target className="w-4 h-4 mr-2" />
                  New Project
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleElementAdd('task')}
                  className="justify-start h-10"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  New Task
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleElementAdd('team')}
                  className="justify-start h-10"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Add Team
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileStickyAddButton;
