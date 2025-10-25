import React, { useState } from 'react';
import { Plus, Mic, Camera, FileText } from 'lucide-react';

interface MobileFABProps {
  onQuickAdd: () => void;
  onVoiceInput: () => void;
  onCameraInput: () => void;
  onDocumentScan: () => void;
}

const MobileFAB: React.FC<MobileFABProps> = ({ 
  onQuickAdd, 
  onVoiceInput, 
  onCameraInput, 
  onDocumentScan 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      id: 'voice',
      icon: Mic,
      label: 'Voice Input',
      action: onVoiceInput,
      color: 'text-blue-500'
    },
    {
      id: 'camera',
      icon: Camera,
      label: 'Scan Document',
      action: onCameraInput,
      color: 'text-green-500'
    },
    {
      id: 'document',
      icon: FileText,
      label: 'Quick Add',
      action: onQuickAdd,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 xl:hidden">
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  action.action();
                  setIsExpanded(false);
                }}
                className="flex items-center gap-3 bg-background border border-border rounded-full px-4 py-3 shadow-lg hover:bg-background/80 transition-all touch-manipulation active:scale-95"
              >
                <Icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-300 touch-manipulation active:scale-95 ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default MobileFAB;
