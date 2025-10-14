import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Save,
  X,
  FileText,
  Calendar,
  Tag,
  Users,
  Lock,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BuiltInNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  visibility: "public" | "team" | "private";
  author: string;
  projectId?: string;
  dueDate?: Date;
  reminderDate?: Date;
}

interface BuiltInNotesProps {
  projectId?: string;
  currentUser?: string;
}

// Mock notes data removed - users start with empty notes
const mockBuiltInNotes: BuiltInNote[] = [];

export default function BuiltInNotes({ projectId, currentUser = "Current User" }: BuiltInNotesProps) {
  const [notes, setNotes] = useState<BuiltInNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<BuiltInNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "team" | "private">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<BuiltInNote | null>(null);
  const [newNote, setNewNote] = useState({ 
    title: "", 
    content: "", 
    tags: "",
    visibility: "team" as BuiltInNote["visibility"],
    dueDate: "",
    reminderDate: ""
  });

  // Load notes from localStorage or use mock data
  useEffect(() => {
    const savedNotes = localStorage.getItem('builtInNotes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: BuiltInNote & { createdAt: string; updatedAt: string }) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    } else {
      setNotes(mockBuiltInNotes);
    }
  }, []);

  // Filter notes based on project, search, tags, and visibility
  useEffect(() => {
    let filtered = notes;

    if (projectId) {
      filtered = filtered.filter(note => note.projectId === projectId);
    }

    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        note.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    if (visibilityFilter !== "all") {
      filtered = filtered.filter(note => note.visibility === visibilityFilter);
    }

    setFilteredNotes(filtered);
  }, [notes, projectId, searchQuery, selectedTag, visibilityFilter]);

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  const handleCreateNote = () => {
    if (!newNote.title.trim()) return;

    const note: BuiltInNote = {
      id: `note_${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
      visibility: newNote.visibility,
      author: currentUser,
      projectId: projectId || undefined,
      dueDate: newNote.dueDate ? new Date(newNote.dueDate) : undefined,
      reminderDate: newNote.reminderDate ? new Date(newNote.reminderDate) : undefined
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('builtInNotes', JSON.stringify(updatedNotes));
    
    setNewNote({ title: "", content: "", tags: "", visibility: "team" });
    setIsCreating(false);
  };

  const handleUpdateNote = () => {
    if (!editingNote || !editingNote.title.trim()) return;

    const updatedNotes = notes.map(note =>
      note.id === editingNote.id
        ? { ...editingNote, updatedAt: new Date() }
        : note
    );

    setNotes(updatedNotes);
    localStorage.setItem('builtInNotes', JSON.stringify(updatedNotes));
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem('builtInNotes', JSON.stringify(updatedNotes));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getVisibilityIcon = (visibility: BuiltInNote["visibility"]) => {
    switch (visibility) {
      case "public": return <Globe className="w-4 h-4 text-green-500" />;
      case "team": return <Users className="w-4 h-4 text-blue-500" />;
      case "private": return <Lock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getVisibilityColor = (visibility: BuiltInNote["visibility"]) => {
    switch (visibility) {
      case "public": return "bg-green-100 text-green-800";
      case "team": return "bg-blue-100 text-blue-800";
      case "private": return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Built-in Notes</h2>
        <p className="text-muted-foreground">
          {projectId ? "Project-specific team notes and documentation" : "Team workspace notes and documentation"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedTag(null)}
            className={!selectedTag ? "bg-primary text-primary-foreground" : ""}
          >
            <Tag className="w-4 h-4" />
          </Button>
        </div>

        <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Visibility:</span>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as typeof visibilityFilter)}
            className="px-3 py-1 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="team">Team</option>
            <option value="private">Private</option>
          </select>
        </div>
        
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Tags:</span>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Create New Note
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Textarea
              placeholder="Write your note here (Markdown supported)..."
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Due Date</label>
                <Input
                  type="date"
                  value={newNote.dueDate}
                  onChange={(e) => setNewNote(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Reminder Date</label>
                <Input
                  type="date"
                  value={newNote.reminderDate}
                  onChange={(e) => setNewNote(prev => ({ ...prev, reminderDate: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Input
                placeholder="Tags (comma separated)..."
                value={newNote.tags}
                onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <select
                value={newNote.visibility}
                onChange={(e) => setNewNote(prev => ({ ...prev, visibility: e.target.value as BuiltInNote["visibility"] }))}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="private">Private</option>
                <option value="team">Team</option>
                <option value="public">Public</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateNote} disabled={!newNote.title.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map(note => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight">{note.title}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingNote(note)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {formatDate(note.updatedAt)}
                </div>
                <div className="flex items-center gap-2">
                  {getVisibilityIcon(note.visibility)}
                  <span className="text-xs text-muted-foreground">{note.author}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                {note.content.replace(/#{1,6}\s+/g, '').replace(/\*\*/g, '').substring(0, 150)}...
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              {(note.dueDate || note.reminderDate) && (
                <div className="flex items-center gap-4 mb-2 text-xs text-muted-foreground">
                  {note.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {note.dueDate.toLocaleDateString()}</span>
                    </div>
                  )}
                  {note.reminderDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Reminder: {note.reminderDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}
              <Badge className={cn("text-xs", getVisibilityColor(note.visibility))}>
                {note.visibility}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedTag || visibilityFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Create your first team note to get started."
            }
          </p>
          {!searchQuery && !selectedTag && visibilityFilter === "all" && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Note
            </Button>
          )}
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <Card className="fixed inset-4 z-50 max-w-2xl mx-auto max-h-[90vh] overflow-auto border-primary scrollbar-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Edit Note
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={editingNote.title}
              onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
            />
            <Textarea
              placeholder="Write your note here (Markdown supported)..."
              value={editingNote.content}
              onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
              rows={8}
            />
            <div className="flex gap-4">
              <Input
                placeholder="Tags (comma separated)..."
                value={editingNote.tags.join(', ')}
                onChange={(e) => setEditingNote(prev => prev ? { 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                } : null)}
                className="flex-1"
              />
              <select
                value={editingNote.visibility}
                onChange={(e) => setEditingNote(prev => prev ? { 
                  ...prev, 
                  visibility: e.target.value as BuiltInNote["visibility"]
                } : null)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="private">Private</option>
                <option value="team">Team</option>
                <option value="public">Public</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateNote} disabled={!editingNote.title.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
