import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MobileMindmapHeaderProps {
  onSearch: () => void;
  onFilter: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

const MobileMindmapHeader: React.FC<MobileMindmapHeaderProps> = ({
  onSearch,
  onFilter,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const handleFilterToggle = () => {
    setShowFilterDropdown(!showFilterDropdown);
    onFilter();
  };

  const handleFilterChange = (value: string) => {
    onFilterChange(value);
    setShowFilterDropdown(false);
  };

  return (
    <div className="xl:hidden bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="flex items-center justify-between p-3">
        {/* Search Bar */}
        <div className="flex-1 mr-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search elements..."
              className="w-full pl-9 pr-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={showFilterDropdown ? "default" : "outline"}
            size="sm"
            onClick={handleFilterToggle}
            className="p-2"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filter Dropdown */}
      {showFilterDropdown && (
        <div className="px-3 pb-3">
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Filter by Status</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilterDropdown(false)}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <Select value={filterStatus} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMindmapHeader;
