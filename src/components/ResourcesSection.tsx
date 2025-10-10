import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Link, 
  Globe, 
  FileText, 
  Database, 
  Server, 
  Cloud,
  Settings,
  Code,
  Image,
  Video,
  Music,
  Archive
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'website' | 'document' | 'api' | 'database' | 'server' | 'cloud' | 'code' | 'image' | 'video' | 'audio' | 'other';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ResourcesSectionProps {
  projectId: string | undefined;
  projectName?: string;
}

const resourceTypes = [
  { value: 'website', label: 'Website', icon: Globe, color: 'bg-blue-500' },
  { value: 'document', label: 'Document', icon: FileText, color: 'bg-green-500' },
  { value: 'api', label: 'API', icon: Code, color: 'bg-purple-500' },
  { value: 'database', label: 'Database', icon: Database, color: 'bg-orange-500' },
  { value: 'server', label: 'Server', icon: Server, color: 'bg-red-500' },
  { value: 'cloud', label: 'Cloud Service', icon: Cloud, color: 'bg-cyan-500' },
  { value: 'code', label: 'Code Repository', icon: Code, color: 'bg-indigo-500' },
  { value: 'image', label: 'Image/Design', icon: Image, color: 'bg-pink-500' },
  { value: 'video', label: 'Video', icon: Video, color: 'bg-yellow-500' },
  { value: 'audio', label: 'Audio', icon: Music, color: 'bg-teal-500' },
  { value: 'other', label: 'Other', icon: Archive, color: 'bg-gray-500' }
];

const defaultCategories = [
  'Development Tools',
  'Design Resources',
  'Documentation',
  'APIs & Services',
  'Infrastructure',
  'Assets',
  'References',
  'Tools'
];

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ projectId, projectName }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    type: 'website' as Resource['type'],
    category: ''
  });

  // Load resources from localStorage
  useEffect(() => {
    if (projectId) {
      const savedResources = localStorage.getItem(`resources_${projectId}`);
      if (savedResources) {
        try {
          const parsed = JSON.parse(savedResources).map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt)
          }));
          setResources(parsed);
        } catch (error) {
          console.error('Error loading resources:', error);
        }
      } else {
        // If no resources found for this project, reset to empty array
        setResources([]);
      }
    } else {
      // If no project selected, reset resources
      setResources([]);
    }
  }, [projectId]);

  // Save resources to localStorage
  const saveResources = (newResources: Resource[]) => {
    if (projectId) {
      localStorage.setItem(`resources_${projectId}`, JSON.stringify(newResources));
    }
  };

  const handleAddResource = () => {
    if (!formData.name.trim()) return;

    const newResource: Resource = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      url: formData.url.trim(),
      type: formData.type,
      category: formData.category || 'Uncategorized',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedResources = [...resources, newResource];
    setResources(updatedResources);
    saveResources(updatedResources);

    // Reset form
    setFormData({ name: '', description: '', url: '', type: 'website', category: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditResource = () => {
    if (!editingResource || !formData.name.trim()) return;

    const updatedResources = resources.map(resource =>
      resource.id === editingResource.id
        ? {
            ...resource,
            name: formData.name.trim(),
            description: formData.description.trim(),
            url: formData.url.trim(),
            type: formData.type,
            category: formData.category || 'Uncategorized',
            updatedAt: new Date()
          }
        : resource
    );

    setResources(updatedResources);
    saveResources(updatedResources);

    // Reset form and close dialog
    setFormData({ name: '', description: '', url: '', type: 'website', category: '' });
    setEditingResource(null);
  };

  const handleDeleteResource = (resourceId: string) => {
    const updatedResources = resources.filter(resource => resource.id !== resourceId);
    setResources(updatedResources);
    saveResources(updatedResources);
  };

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      description: resource.description,
      url: resource.url,
      type: resource.type,
      category: resource.category
    });
  };

  const closeDialogs = () => {
    setIsAddDialogOpen(false);
    setEditingResource(null);
    setFormData({ name: '', description: '', url: '', type: 'website', category: '' });
  };

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const categoryMatch = filterCategory === 'all' || resource.category === filterCategory;
    const typeMatch = filterType === 'all' || resource.type === filterType;
    return categoryMatch && typeMatch;
  });

  // Get unique categories from resources
  const availableCategories = Array.from(new Set(resources.map(r => r.category)));

  if (!projectId) {
    return (
      <div className="bg-gradient-to-r from-muted/30 to-muted/20 rounded-2xl p-8 border border-border/50 shadow-glass text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-muted-foreground">No Project Selected</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Select a project from the ProjectMap to view and manage its resources
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Each project has its own dedicated resource collection</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-glass">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <h2 className="text-xl font-bold text-primary">Project Resources</h2>
          <Badge variant="outline" className="text-primary border-primary/30">
            {projectName}
          </Badge>
          <Badge variant="secondary" className="text-muted-foreground">
            {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
          </Badge>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Filters */}
      {(resources.length > 0 || availableCategories.length > 0) && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Category:</Label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1 rounded-md border border-border bg-background text-sm"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Type:</Label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 rounded-md border border-border bg-background text-sm"
            >
              <option value="all">All Types</option>
              {resourceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {resources.length === 0 ? `No Resources for ${projectName}` : 'No Resources Match Filters'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {resources.length === 0 
              ? `Add resources, links, and tools used in the ${projectName} project to keep everything organized.`
              : 'Try adjusting your filters to see more resources.'
            }
          </p>
          {resources.length === 0 && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Resource
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const typeConfig = resourceTypes.find(t => t.value === resource.type);
            const TypeIcon = typeConfig?.icon || Archive;
            
            return (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", typeConfig?.color)}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">
                          {resource.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {resource.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(resource)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResource(resource.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {resource.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                  {resource.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resource.url, '_blank')}
                      className="w-full text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open Link
                    </Button>
                  )}
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>{typeConfig?.label}</span>
                    <span>{new Date(resource.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Resource Dialog */}
      <Dialog open={isAddDialogOpen || !!editingResource} onOpenChange={closeDialogs}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </DialogTitle>
            <DialogDescription>
              Add a resource, tool, or link used in this project to keep everything organized.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Resource Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., GitHub Repository, Design System, API Docs"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this resource..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="url">URL/Link</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="type">Resource Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Resource['type'] })}
                className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              >
                {resourceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Development Tools, Design Resources"
                className="mt-1"
                list="categories"
              />
              <datalist id="categories">
                {defaultCategories.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              Cancel
            </Button>
            <Button
              onClick={editingResource ? handleEditResource : handleAddResource}
              disabled={!formData.name.trim()}
            >
              {editingResource ? 'Update Resource' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourcesSection;
