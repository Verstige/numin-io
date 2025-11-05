import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Tag,
  Calendar,
  User
} from 'lucide-react';
import { FirebaseNotesService, type Note } from '@/lib/firebase-notes';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

export default function BuiltInNotes() {
  const { user } = useFirebaseAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: '',
    visibility: 'private' as 'private' | 'team'
  });

  // Load notes from Firebase
  useEffect(() => {
    const loadNotes = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('📝 Loading notes from Firebase...');
        
        const userId = user.uid;
        const teamId = 'default-team';
        
        const firebaseNotes = await FirebaseNotesService.getNotes(userId, teamId);
        setNotes(firebaseNotes);
        console.log('✅ Notes loaded from Firebase:', firebaseNotes.length);
      } catch (error) {
        console.error('Error loading notes:', error);
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [user]);

  // Create new note
  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !user) return;

    try {
      setIsLoading(true);
      console.log('🔄 Creating note in Firebase...');
      
      const userId = user.uid;
      const teamId = 'default-team';
      
      const noteData = {
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        visibility: newNote.visibility
      };

      console.log('🔄 Note data to save:', noteData);
      const createdNote = await FirebaseNotesService.createNote(userId, teamId, noteData);
      console.log('✅ Note created successfully:', createdNote.id);
      
      // Update local state
      setNotes(prev => [createdNote, ...prev]);
      
      // Reset form
      setNewNote({ title: '', content: '', tags: '', visibility: 'private' });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update note
  const handleUpdateNote = async () => {
    if (!editingNote || !editingNote.title.trim() || !user) return;

    try {
      setIsLoading(true);
      console.log('🔄 Updating note in Firebase...');
      
      const userId = user.uid;
      const teamId = 'default-team';
      
      const updateData = {
        title: editingNote.title,
        content: editingNote.content,
        tags: editingNote.tags,
        visibility: editingNote.visibility
      };

      console.log('🔄 Note update data:', updateData);
      await FirebaseNotesService.updateNote(userId, teamId, editingNote.id, updateData);
      console.log('✅ Note updated successfully');
      
      // Update local state
      const updatedNote: Note = {
        ...editingNote,
        updatedAt: new Date()
      };

      setNotes(prev => prev.map(note => 
        note.id === editingNote.id ? updatedNote : note
      ));
      
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('🔄 Deleting note from Firebase...');
      
      const userId = user.uid;
      const teamId = 'default-team';
      
      await FirebaseNotesService.deleteNote(userId, teamId, noteId);
      console.log('✅ Note deleted successfully');
      
      // Update local state
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = [...new Set(notes.flatMap(note => note.tags))];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Built-in Notes</h2>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Built-in Notes</h2>
          <p className="text-muted-foreground">Organize your thoughts and ideas</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background"
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter note title..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Enter note content..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <Input
                value={newNote.tags}
                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                placeholder="Enter tags separated by commas..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Visibility</label>
              <select
                value={newNote.visibility}
                onChange={(e) => setNewNote({ ...newNote, visibility: e.target.value as 'private' | 'team' })}
                className="mt-1 px-3 py-2 border border-border rounded-md bg-background w-full"
              >
                <option value="private">Private</option>
                <option value="team">Team</option>
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

      {/* Edit Note Form */}
      {editingNote && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                placeholder="Enter note title..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                placeholder="Enter note content..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <Input
                value={editingNote.tags.join(', ')}
                onChange={(e) => setEditingNote({ 
                  ...editingNote, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                placeholder="Enter tags separated by commas..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Visibility</label>
              <select
                value={editingNote.visibility}
                onChange={(e) => setEditingNote({ ...editingNote, visibility: e.target.value as 'private' | 'team' })}
                className="mt-1 px-3 py-2 border border-border rounded-md bg-background w-full"
              >
                <option value="private">Private</option>
                <option value="team">Team</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateNote} disabled={!editingNote.title.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Update Note
              </Button>
              <Button variant="outline" onClick={() => setEditingNote(null)}>
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
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                {note.content}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {note.visibility}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No notes found</h3>
            <p className="text-sm">
              {searchTerm || selectedTag 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first note to get started'
              }
            </p>
          </div>
          {!searchTerm && !selectedTag && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Note
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
