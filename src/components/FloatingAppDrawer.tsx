import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import AppLibrary from './AppLibrary';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingAppDrawerProps {
  onNavigateToTab?: (tab: string) => void;
  onAppLibrary?: () => void;
}

const FloatingAppDrawer: React.FC<FloatingAppDrawerProps> = ({
  onNavigateToTab,
  onAppLibrary
}) => {
  const [isAppLibraryOpen, setIsAppLibraryOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleAppLibraryOpen = () => {
    setIsAppLibraryOpen(true);
    if (onAppLibrary) {
      onAppLibrary();
    }
  };

  const handleNavigateToTab = (tab: string) => {
    if (onNavigateToTab) {
      onNavigateToTab(tab);
    }
    setIsAppLibraryOpen(false);
  };

  return (
    <>
      {/* Floating App Drawer Button */}
      <div className={`fixed z-30 ${
        isMobile 
          ? 'bottom-20 right-4' // Above mobile navigation
          : 'bottom-4 right-4'   // Desktop position
      }`}>
        <Button
          onClick={handleAppLibraryOpen}
          className={`${
            isMobile 
              ? 'h-10 w-10' 
              : 'h-12 w-12'
          } rounded-full shadow-lg bg-secondary hover:bg-secondary/90 transition-all duration-200 hover:scale-105`}
          size="icon"
          title="App Library"
        >
          <LayoutDashboard className={`${
            isMobile ? 'w-4 h-4' : 'w-5 h-5'
          }`} />
        </Button>
      </div>

      {/* App Library Modal */}
      <AppLibrary
        isOpen={isAppLibraryOpen}
        onClose={() => setIsAppLibraryOpen(false)}
        onNavigateToTab={handleNavigateToTab}
      />
    </>
  );
};

export default FloatingAppDrawer;
