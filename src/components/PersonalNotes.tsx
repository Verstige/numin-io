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
  Filter,
  Save,
  X,
  FileText,
  Calendar,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

interface PersonalNotesProps {
  projectId?: string;
}

// Mock notes data removed - users start with empty notes
const mockNotes: PersonalNote[] = [];

export default function PersonalNotes({ projectId }: PersonalNotesProps) {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<PersonalNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });

  // Load notes from localStorage or use mock data
  useEffect(() => {
    const savedNotes = localStorage.getItem('personalNotes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: PersonalNote & { createdAt: string; updatedAt: string }) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    } else {
      setNotes(mockNotes);
    }
  }, []);

  // Filter notes based on project and search
  useEffect(() => {
    let filtered = notes;

    if (projectId) {
      filtered = filtered.filter(note => note.projectId === projectId);
    }

    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    setFilteredNotes(filtered);
  }, [notes, projectId, searchQuery, selectedTag]);

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  const handleCreateNote = () => {
    if (!newNote.title.trim()) return;

    const note: PersonalNote = {
      id: `note_${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: projectId || undefined
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('personalNotes', JSON.stringify(updatedNotes));
    
    setNewNote({ title: "", content: "", tags: "" });
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
    localStorage.setItem('personalNotes', JSON.stringify(updatedNotes));
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem('personalNotes', JSON.stringify(updatedNotes));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Personal Notes</h2>
        <p className="text-muted-foreground">
          {projectId ? "Project-specific notes and thoughts" : "Your private workspace"}
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
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedTag(null)}
            className={!selectedTag ? "bg-primary text-primary-foreground" : ""}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground mr-2">Filter by tags:</span>
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

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
            />
            <Textarea
              placeholder="Write your note here..."
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
            <Input
              placeholder="Tags (comma separated)..."
              value={newNote.tags}
              onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
            />
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(note.updatedAt)}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                {note.content}
              </p>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedTag 
              ? "Try adjusting your search or filter criteria."
              : "Create your first note to get started."
            }
          </p>
          {!searchQuery && !selectedTag && (
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
              placeholder="Write your note here..."
              value={editingNote.content}
              onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
              rows={8}
            />
            <Input
              placeholder="Tags (comma separated)..."
              value={editingNote.tags.join(', ')}
              onChange={(e) => setEditingNote(prev => prev ? { 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              } : null)}
            />
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
