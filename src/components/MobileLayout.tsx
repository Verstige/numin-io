import React, { useState, useEffect } from 'react';
import { type WorkspaceTab } from './WorkspaceTabs';
import MobileBottomNav from './MobileBottomNav';
import MobileElementCreator from './MobileElementCreator';
import MobileElementPalette from './MobileElementPalette';
import { useMobileInteractions } from '@/hooks/useMobileInteractions';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onElementCreate?: (element: any) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onLayout?: () => void;
  onSearch?: () => void;
  onFullscreen?: () => void;
  zoomLevel?: number;
  isLayouting?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  currentTab,
  onTabChange,
  onElementCreate,
  onZoomIn,
  onZoomOut,
  onReset,
  onLayout,
  onSearch,
  onFullscreen,
  zoomLevel = 1,
  isLayouting = false
}) => {
  const [isElementCreatorOpen, setIsElementCreatorOpen] = useState(false);
  const [isElementPaletteOpen, setIsElementPaletteOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Mobile interactions
  const {
    isMobile,
    isBottomNavVisible,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDoubleTap,
    handleSwipe
  } = useMobileInteractions();

  const handleElementCreate = (element: any) => {
    if (onElementCreate) {
      onElementCreate(element);
    }
    setIsElementCreatorOpen(false);
  };


  const handleVoiceInput = () => {
    // TODO: Implement voice input
    console.log('Voice input triggered');
  };

  const handleCameraInput = () => {
    // TODO: Implement camera input
    console.log('Camera input triggered');
  };

  const handleDocumentScan = () => {
    // TODO: Implement document scan
    console.log('Document scan triggered');
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    } else {
      setIsSearchOpen(true);
    }
  };

  // Set up touch event handlers
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStartEvent = (e: TouchEvent) => handleTouchStart(e);
    const handleTouchMoveEvent = (e: TouchEvent) => handleTouchMove(e);
    const handleTouchEndEvent = (e: TouchEvent) => handleTouchEnd(e);

    document.addEventListener('touchstart', handleTouchStartEvent, { passive: true });
    document.addEventListener('touchmove', handleTouchMoveEvent, { passive: true });
    document.addEventListener('touchend', handleTouchEndEvent, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStartEvent);
      document.removeEventListener('touchmove', handleTouchMoveEvent);
      document.removeEventListener('touchend', handleTouchEndEvent);
    };
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Handle swipe gestures for tab navigation
  const swipeHandlers = handleSwipe(
    () => {
      // Swipe left - next tab
      const tabs: WorkspaceTab[] = ['mindmap', 'tasks', 'notes', 'timer', 'calendar'];
      const currentIndex = tabs.indexOf(currentTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      onTabChange(tabs[nextIndex]);
    },
    () => {
      // Swipe right - previous tab
      const tabs: WorkspaceTab[] = ['mindmap', 'tasks', 'notes', 'timer', 'calendar'];
      const currentIndex = tabs.indexOf(currentTab);
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      onTabChange(tabs[prevIndex]);
    }
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="pb-20 md:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          isBottomNavVisible ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <MobileBottomNav 
            currentTab={currentTab}
            onTabChange={onTabChange}
            onSearch={handleSearch}
            onMenu={() => {
              // TODO: Implement mobile menu
              console.log('Mobile menu triggered');
            }}
          />
        </div>
      )}



      {/* Mobile Element Creator */}
      <MobileElementCreator
        isOpen={isElementCreatorOpen}
        onClose={() => setIsElementCreatorOpen(false)}
        onElementCreate={handleElementCreate}
      />

      {/* Mobile Element Palette */}
      <MobileElementPalette
        isOpen={isElementPaletteOpen}
        onClose={() => setIsElementPaletteOpen(false)}
        onElementAdd={(elementType) => {
          // For quick add, we'll create a basic element
          handleElementCreate({
            type: elementType,
            title: `New ${elementType}`,
            description: '',
            priority: 'medium',
            status: 'planning'
          });
        }}
      />
    </div>
  );
};

export default MobileLayout;
