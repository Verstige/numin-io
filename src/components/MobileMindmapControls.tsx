import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, RotateCcw, Zap, Search, Maximize } from 'lucide-react';

interface MobileMindmapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onLayout: () => void;
  onSearch: () => void;
  onFullscreen: () => void;
  zoomLevel?: number;
  isLayouting?: boolean;
}

const MobileMindmapControls: React.FC<MobileMindmapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onLayout,
  onSearch,
  onFullscreen,
  zoomLevel = 1,
  isLayouting = false
}) => {
  return (
    <div className="fixed top-4 right-4 z-30 xl:hidden">
      <div className="flex flex-col gap-2">
        {/* Zoom Level Display */}
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-1 text-xs text-muted-foreground">
          {Math.round(zoomLevel * 100)}%
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onZoomIn} 
            className="w-10 h-10 p-0 touch-manipulation active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onZoomOut} 
            className="w-10 h-10 p-0 touch-manipulation active:scale-95"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onReset} 
            className="w-10 h-10 p-0 touch-manipulation active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onLayout} 
            disabled={isLayouting}
            className="w-10 h-10 p-0 touch-manipulation active:scale-95"
          >
            {isLayouting ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onSearch} 
            className="w-10 h-10 p-0 touch-manipulation active:scale-95"
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onFullscreen} 
            className="w-10 h-10 p-0 touch-manipulation active:scale-95"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMindmapControls;
