import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Search, 
  Plus, 
  Inbox, 
  Send, 
  Trash, 
  Star, 
  Archive, 
  Brain,
  MessageSquare,
  Sparkles,
  Zap,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Target,
  Lightbulb,
  Tag as TagIcon,
  ArrowRight,
  Copy,
  Edit3,
  X,
  Send as SendIcon,
  RefreshCw,
  ExternalLink,
  Loader2,
  FolderPlus,
  Folder,
  MoreVertical,
  Settings
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { gmailService, type GmailAccount, type GmailMessage } from '@/lib/gmail-integration';
import { toast } from '@/hooks/use-toast';

// Types
interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  folder: string;
  tags: string[];
  customCategories?: string[]; // Array of custom category IDs
}

interface Folder {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
  isCustom?: boolean;
  color?: string;
}

interface CustomCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export default function EmailDashboard() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>([]);
  const [gmailEmails, setGmailEmails] = useState<GmailMessage[]>([]);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'emails' | 'ai-assistant'>('emails');
  
  // AI Analysis States
  const [emailAnalysis, setEmailAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Compose States - Simplified
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    content: ''
  });
  
  // AI Compose Helper States
  const [aiHelperPrompt, setAiHelperPrompt] = useState('');
  const [isGeneratingAIResponse, setIsGeneratingAIResponse] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState('');
  const [showAIHelper, setShowAIHelper] = useState(false);
  
  // AI Draft States
  const [aiDrafts, setAiDrafts] = useState<any[]>([]);
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);

  // Custom Categories States
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');

  // Initialize empty data - replace with actual API calls
  const folders: Folder[] = [
    { id: 'inbox', name: 'Inbox', count: 0, icon: <Inbox className="w-4 h-4" /> },
    { id: 'sent', name: 'Sent', count: 0, icon: <Send className="w-4 h-4" /> },
    { id: 'drafts', name: 'Drafts', count: 0, icon: <Mail className="w-4 h-4" /> },
    { id: 'starred', name: 'Starred', count: 0, icon: <Star className="w-4 h-4" /> },
    { id: 'archive', name: 'Archive', count: 0, icon: <Archive className="w-4 h-4" /> },
    { id: 'trash', name: 'Trash', count: 0, icon: <Trash className="w-4 h-4" /> }
  ];

  useEffect(() => {
    loadGmailData();
    loadCustomCategories();
  }, []);

  // Load custom categories from localStorage
  const loadCustomCategories = () => {
    try {
      const stored = localStorage.getItem('email_custom_categories');
      if (stored) {
        setCustomCategories(JSON.parse(stored));
      } else {
        // Initialize with default categories
        const defaults: CustomCategory[] = [
          { id: 'important', name: 'Important', color: '#ef4444', icon: 'AlertCircle', createdAt: new Date().toISOString() },
          { id: 'follow-up', name: 'Follow Up', color: '#f59e0b', icon: 'Clock', createdAt: new Date().toISOString() },
        ];
        setCustomCategories(defaults);
        localStorage.setItem('email_custom_categories', JSON.stringify(defaults));
      }
    } catch (error) {
      console.error('Failed to load custom categories:', error);
    }
  };

  // Save custom categories to localStorage
  const saveCustomCategories = (categories: CustomCategory[]) => {
    try {
      localStorage.setItem('email_custom_categories', JSON.stringify(categories));
      setCustomCategories(categories);
    } catch (error) {
      console.error('Failed to save custom categories:', error);
    }
  };

  // Create a new custom category
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Category Name Required",
        description: "Please enter a name for your category.",
        variant: "destructive"
      });
      return;
    }

    const newCategory: CustomCategory = {
      id: `custom_${Date.now()}`,
      name: newCategoryName.trim(),
      color: newCategoryColor,
      icon: 'Folder',
      createdAt: new Date().toISOString()
    };

    const updated = [...customCategories, newCategory];
    saveCustomCategories(updated);
    setNewCategoryName('');
    setShowCreateCategory(false);
    
    toast({
      title: "Category Created",
      description: `"${newCategory.name}" category has been created.`,
    });
  };

  // Delete a custom category
  const handleDeleteCategory = (categoryId: string) => {
    const updated = customCategories.filter(c => c.id !== categoryId);
    saveCustomCategories(updated);
    
    // Remove category from all emails
    setEmails(prev => prev.map(email => ({
      ...email,
      customCategories: email.customCategories?.filter(catId => catId !== categoryId)
    })));

    toast({
      title: "Category Deleted",
      description: "Category has been removed from all emails.",
    });
  };

  // Toggle email in custom category
  const handleToggleEmailCategory = (emailId: string, categoryId: string) => {
    setEmails(prev => prev.map(email => {
      if (email.id === emailId) {
        const currentCategories = email.customCategories || [];
        const isInCategory = currentCategories.includes(categoryId);
        return {
          ...email,
          tags: email.tags || [],
          customCategories: isInCategory
            ? currentCategories.filter(catId => catId !== categoryId)
            : [...currentCategories, categoryId]
        };
      }
      return email;
    }));

    // Also update the corresponding Gmail message if available
    const email = emails.find(e => e.id === emailId);
    if (email && gmailAccounts.length > 0) {
      // Update localStorage stored emails
      gmailAccounts.forEach(account => {
        const storedEmails = gmailService.getStoredEmailsForAccount(account.id);
        const updatedEmails = storedEmails.map((gmailMsg: GmailMessage) => {
          if (gmailMsg.id === emailId) {
            // Update labels if needed (for Gmail integration)
            return gmailMsg;
          }
          return gmailMsg;
        });
        // Note: We'd need a method to save emails back, but for now we'll just update state
      });
    }
  };

  // Toggle star on email
  const handleToggleStar = async (email: Email) => {
    if (!isGmailConnected || gmailAccounts.length === 0) {
      toast({
        title: "Gmail Not Connected",
        description: "Please connect Gmail to use this feature.",
        variant: "destructive"
      });
      return;
    }

    try {
      const account = gmailAccounts[0];
      await gmailService.toggleStar(account.id, email.id, email.isStarred);
      
      // Update local state
      setEmails(prev => prev.map(e => 
        e.id === email.id ? { ...e, isStarred: !e.isStarred } : e
      ));

      // Update selected email if it's the same
      if (selectedEmail?.id === email.id) {
        setSelectedEmail({ ...selectedEmail, isStarred: !selectedEmail.isStarred });
      }

      toast({
        title: email.isStarred ? "Star Removed" : "Starred",
        description: email.isStarred ? "Email unstarred." : "Email starred.",
      });
    } catch (error) {
      console.error('Failed to toggle star:', error);
      toast({
        title: "Error",
        description: "Failed to update star status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Listen for external email composition triggers
  useEffect(() => {
    const handleComposeEmail = (event: CustomEvent) => {
      const { to, subject, content } = event.detail;
      setIsComposing(true);
      setComposeData({
        to: to || '',
        subject: subject || '',
        content: content || ''
      });
    };

    window.addEventListener('composeEmail', handleComposeEmail as EventListener);
    
    return () => {
      window.removeEventListener('composeEmail', handleComposeEmail as EventListener);
    };
  }, []);

  // Convert GmailMessage to Email format
  const convertGmailToEmail = (gmailMessage: GmailMessage, folder: string = 'inbox'): Email => {
    // Load existing email data to preserve custom categories
    const existingEmail = emails.find(e => e.id === gmailMessage.id);
    return {
      id: gmailMessage.id,
      from: gmailMessage.from,
      to: gmailMessage.to,
      subject: gmailMessage.subject || '(No Subject)',
      content: gmailMessage.body || gmailMessage.htmlBody || '',
      timestamp: gmailMessage.timestamp.toISOString(),
      isRead: gmailMessage.isRead,
      isStarred: gmailMessage.isStarred,
      isImportant: gmailMessage.isImportant,
      folder: folder,
      tags: gmailMessage.labels || [],
      customCategories: existingEmail?.customCategories || []
    };
  };

  // Get the full Gmail message with HTML body for image rendering
  const getGmailEmailWithHtml = (emailId: string): GmailMessage | undefined => {
    return gmailEmails.find(e => e.id === emailId);
  };

  const loadGmailData = async () => {
    try {
      const accounts = gmailService.getConnectedAccounts();
      setGmailAccounts(accounts);
      setIsGmailConnected(accounts.length > 0);

      if (accounts.length > 0) {
        // Load emails from all connected accounts
        const allGmailEmails: GmailMessage[] = [];
        const allEmails: Email[] = [];
        
        for (const account of accounts) {
          try {
            // First, try to load from localStorage (synced emails)
            const storedEmails = gmailService.getStoredEmailsForAccount(account.id);
            
            if (storedEmails.length > 0) {
              console.log(`📧 Loading ${storedEmails.length} stored emails for ${account.email}`);
              // Convert stored Gmail messages to Email format
              storedEmails.forEach((gmailMsg: GmailMessage) => {
                // Determine folder based on labels
                let folder = 'inbox';
                if (gmailMsg.labels.includes('SENT')) folder = 'sent';
                else if (gmailMsg.labels.includes('DRAFT')) folder = 'drafts';
                else if (gmailMsg.labels.includes('STARRED')) folder = 'starred';
                else if (gmailMsg.labels.includes('TRASH')) folder = 'trash';
                else if (gmailMsg.labels.includes('ARCHIVE')) folder = 'archive';
                
                allEmails.push(convertGmailToEmail(gmailMsg, folder));
                allGmailEmails.push(gmailMsg);
              });
            }
            
            // Also fetch fresh emails to ensure we have the latest
            try {
              const freshEmails = await gmailService.fetchEmails(account.id, 50);
              console.log(`📧 Fetched ${freshEmails.length} fresh emails for ${account.email}`);
              
              // Merge with existing, avoiding duplicates
              const existingIds = new Set(allEmails.map(e => e.id));
              freshEmails.forEach((gmailMsg: GmailMessage) => {
                if (!existingIds.has(gmailMsg.id)) {
                  let folder = 'inbox';
                  if (gmailMsg.labels.includes('SENT')) folder = 'sent';
                  else if (gmailMsg.labels.includes('DRAFT')) folder = 'drafts';
                  else if (gmailMsg.labels.includes('STARRED')) folder = 'starred';
                  else if (gmailMsg.labels.includes('TRASH')) folder = 'trash';
                  else if (gmailMsg.labels.includes('ARCHIVE')) folder = 'archive';
                  
                  allEmails.push(convertGmailToEmail(gmailMsg, folder));
                  allGmailEmails.push(gmailMsg);
                }
              });
            } catch (fetchError) {
              console.error(`Failed to fetch fresh emails for ${account.email}:`, fetchError);
              // Continue with stored emails if fetch fails
            }
          } catch (error) {
            console.error(`Failed to load emails for account ${account.email}:`, error);
          }
        }
        
        // Sort by timestamp (newest first)
        allEmails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setGmailEmails(allGmailEmails);
        setEmails(allEmails);
        
        console.log(`✅ Loaded ${allEmails.length} emails total`);
      } else {
        // No Gmail accounts, clear emails
        setGmailEmails([]);
        setEmails([]);
      }
    } catch (error) {
      console.error('Failed to load Gmail data:', error);
      toast({
        title: "Error Loading Emails",
        description: "Failed to load Gmail emails. Please try syncing again.",
        variant: "destructive"
      });
    }
  };

  const handleSyncGmail = async () => {
    if (gmailAccounts.length === 0) return;

    setIsSyncing(true);
    try {
      let totalAdded = 0;
      let totalUpdated = 0;

      for (const account of gmailAccounts) {
        try {
          console.log(`🔄 Syncing emails for ${account.email}...`);
        const result = await gmailService.syncEmails(account.id);
        totalAdded += result.messagesAdded;
        totalUpdated += result.messagesUpdated;
          console.log(`✅ Sync complete for ${account.email}: ${result.messagesAdded} added, ${result.messagesUpdated} updated`);
        } catch (error) {
          console.error(`❌ Sync failed for ${account.email}:`, error);
          toast({
            title: "Sync Error",
            description: `Failed to sync emails for ${account.email}. Please try again.`,
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Gmail Sync Complete",
        description: `Added ${totalAdded} new emails, updated ${totalUpdated} emails.`,
      });

      // Reload data after sync
      await loadGmailData();
    } catch (error) {
      console.error('❌ Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync Gmail emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendViaGmail = async (to: string, subject: string, body: string) => {
    if (gmailAccounts.length === 0) {
      toast({
        title: "No Gmail Account",
        description: "Please connect a Gmail account in Settings to send emails.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use the first connected account for sending
      const account = gmailAccounts[0];
      await gmailService.sendEmail(account.id, to, subject, body);
      
      toast({
        title: "Email Sent",
        description: `Email sent successfully to ${to}`,
      });

      // Refresh emails
      await loadGmailData();
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredEmails = emails.filter(email => {
    // Handle custom category folders
    let matchesFolder = false;
    if (selectedFolder.startsWith('category_')) {
      const categoryId = selectedFolder.replace('category_', '');
      matchesFolder = email.customCategories?.includes(categoryId) || false;
    } else {
      matchesFolder = email.folder === selectedFolder;
    }
    
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleAnalyzeEmail = async (email: Email) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setEmailAnalysis({
        sentiment: 'positive',
        priority: 'medium',
        intent: 'proposal',
        category: 'business',
        confidence: 85,
        keyPoints: [
          'AI integration services proposal',
          'Collaboration opportunity',
          'Meeting request for next week',
          'Team has relevant experience'
        ],
        entities: {
          people: ['John Smith'],
          companies: ['TechCorp'],
          dates: ['next week'],
          amounts: [],
          topics: ['AI integration', 'collaboration', 'meeting']
        },
        suggestedActions: [
          'Review the proposal details',
          'Schedule a meeting',
          'Prepare questions about their services',
          'Check calendar availability'
        ],
        urgencyScore: 6,
        responseTone: 'professional'
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleComposeEmail = () => {
    console.log('Compose button clicked'); // Debug log
    setIsComposing(true);
    setComposeData({
      to: selectedEmail?.from || '',
      subject: selectedEmail ? `Re: ${selectedEmail.subject}` : '',
      content: ''
    });
  };

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject || !composeData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending.",
        variant: "destructive"
      });
      return;
    }

    if (isGmailConnected) {
      // Send via Gmail
      await handleSendViaGmail(composeData.to, composeData.subject, composeData.content);
    } else {
      // Fallback to local storage
      const newEmail: Email = {
        id: Date.now().toString(),
        from: 'you@company.com',
        to: composeData.to,
        subject: composeData.subject,
        content: composeData.content,
        timestamp: new Date().toISOString(),
        isRead: true,
        isStarred: false,
        isImportant: false,
        folder: 'sent',
        tags: []
      };
      
      setEmails(prev => [newEmail, ...prev]);
    }
    
    setIsComposing(false);
    setComposeData({ to: '', subject: '', content: '' });
  };

  const handleGenerateAIDrafts = async (email: Email) => {
    setIsGeneratingDrafts(true);
    
    // Simulate AI draft generation
    setTimeout(() => {
      const drafts = [
        {
          id: '1',
          tone: 'Professional',
          subject: `Re: ${email.subject}`,
          content: `Dear ${email.from.split('@')[0]},\n\nThank you for reaching out regarding ${email.subject.toLowerCase()}. I appreciate your interest and the detailed information you've provided.\n\nI would be happy to discuss this further and explore potential collaboration opportunities. Let me review the details you've shared and I'll get back to you with specific questions and next steps.\n\nI'm available for a call next week if that would be helpful. Please let me know your availability.\n\nBest regards,\n[Your Name]`,
          confidence: 92,
          reasoning: 'Professional tone appropriate for business proposal with clear next steps'
        },
        {
          id: '2',
          tone: 'Friendly',
          subject: `Re: ${email.subject}`,
          content: `Hi ${email.from.split('@')[0]}!\n\nThanks so much for reaching out! I'm excited about the possibility of working together on this project. Your proposal sounds really interesting and I think there could be great synergy between our teams.\n\nI'd love to learn more about your approach and discuss how we can make this collaboration successful. Would you be available for a quick call sometime next week? I'm pretty flexible with timing.\n\nLooking forward to hearing from you!\n\nBest,\n[Your Name]`,
          confidence: 88,
          reasoning: 'Friendly tone to build rapport while maintaining professionalism'
        },
        {
          id: '3',
          tone: 'Formal',
          subject: `Re: ${email.subject}`,
          content: `Dear ${email.from.split('@')[0]},\n\nI acknowledge receipt of your correspondence dated ${new Date(email.timestamp).toLocaleDateString()} regarding the aforementioned subject.\n\nAfter careful consideration of your proposal, I find merit in exploring this opportunity further. I shall review the documentation provided and consult with relevant stakeholders.\n\nI will provide a detailed response within five business days. Should you require any clarification in the interim, please do not hesitate to contact me.\n\nRespectfully,\n[Your Name]`,
          confidence: 95,
          reasoning: 'Highly formal tone for official business correspondence'
        }
      ];
      
      setAiDrafts(drafts);
      setIsGeneratingDrafts(false);
    }, 2000);
  };

  const handleUseDraft = (draft: any) => {
    setComposeData({
      to: selectedEmail?.from || '',
      subject: draft.subject,
      content: draft.content
    });
    setIsComposing(true);
  };

  const handleCopyDraft = (draft: any) => {
    navigator.clipboard.writeText(draft.content);
  };

  const handleGenerateAIResponse = async () => {
    if (!aiHelperPrompt.trim()) return;
    
    setIsGeneratingAIResponse(true);
    setAiGeneratedContent('');
    
    // Simulate AI response generation
    setTimeout(() => {
      const responses = {
        'formal business': `Dear ${composeData.to.split('@')[0] || 'Recipient'},

I hope this email finds you well. I am writing to you regarding ${aiHelperPrompt.toLowerCase()}.

After careful consideration, I believe this matter requires our immediate attention. I would like to propose a meeting to discuss the details and explore potential solutions.

I am available for a call at your convenience. Please let me know your availability for the upcoming week.

I look forward to your response.

Best regards,
[Your Name]`,

        'friendly casual': `Hi ${composeData.to.split('@')[0] || 'there'}!

Hope you're doing great! I wanted to reach out about ${aiHelperPrompt.toLowerCase()}.

I think this could be really exciting and I'd love to chat with you about it. Are you free for a quick call sometime this week? I'm pretty flexible with timing.

Let me know what works for you!

Best,
[Your Name]`,

        'follow up': `Hi ${composeData.to.split('@')[0] || 'there'},

I hope you're well! I wanted to follow up on ${aiHelperPrompt.toLowerCase()}.

I know you're probably busy, but I wanted to check in and see if you had any questions or if there's anything I can help clarify.

Please let me know if you need any additional information.

Thanks!
[Your Name]`,

        'thank you': `Dear ${composeData.to.split('@')[0] || 'Recipient'},

Thank you so much for ${aiHelperPrompt.toLowerCase()}. I really appreciate your time and effort.

This means a lot to me and I'm grateful for your support. Please let me know if there's anything I can do to return the favor.

Best regards,
[Your Name]`,

        'default': `Hi ${composeData.to.split('@')[0] || 'there'},

I hope this email finds you well. I'm reaching out regarding ${aiHelperPrompt.toLowerCase()}.

I'd love to discuss this further and hear your thoughts. Would you be available for a brief conversation sometime this week?

Looking forward to hearing from you.

Best,
[Your Name]`
      };

      // Determine response type based on prompt
      let responseType = 'default';
      const prompt = aiHelperPrompt.toLowerCase();
      
      if (prompt.includes('formal') || prompt.includes('business') || prompt.includes('professional')) {
        responseType = 'formal business';
      } else if (prompt.includes('friendly') || prompt.includes('casual') || prompt.includes('informal')) {
        responseType = 'friendly casual';
      } else if (prompt.includes('follow up') || prompt.includes('follow-up') || prompt.includes('checking')) {
        responseType = 'follow up';
      } else if (prompt.includes('thank') || prompt.includes('appreciate') || prompt.includes('grateful')) {
        responseType = 'thank you';
      }

      setAiGeneratedContent(responses[responseType as keyof typeof responses]);
      setIsGeneratingAIResponse(false);
    }, 2000);
  };

  const handleUseAIContent = () => {
    setComposeData(prev => ({
      ...prev,
      content: aiGeneratedContent
    }));
    setAiGeneratedContent('');
    setAiHelperPrompt('');
    setShowAIHelper(false);
  };

  const handleCopyAIContent = () => {
    navigator.clipboard.writeText(aiGeneratedContent);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // If composing, show simple compose interface
  if (isComposing) {
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-chatgpt-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsComposing(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              {selectedEmail ? 'Reply to Email' : 'Compose New Email'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsComposing(false)}
              className="border-border text-foreground hover:bg-background/50"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Save as draft functionality
                const draftEmail: Email = {
                  id: `draft_${Date.now()}`,
                  from: 'you@company.com',
                  to: composeData.to,
                  subject: composeData.subject || '(No Subject)',
                  content: composeData.content,
                  timestamp: new Date().toISOString(),
                  isRead: true,
                  isStarred: false,
                  isImportant: false,
                  folder: 'drafts',
                  tags: [],
                  customCategories: []
                };
                
                // Add to drafts (in a real app, this would save to backend)
                setEmails(prev => [draftEmail, ...prev]);
                
                // Show success message
                toast({
                  title: "Draft Saved",
                  description: "Your email has been saved as a draft.",
                });
                
                // Reset compose data
                setComposeData({ to: '', subject: '', content: '' });
                setIsComposing(false);
              }}
              disabled={!composeData.to || !composeData.content}
              className="border-border text-foreground hover:bg-background/50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handleSendEmail}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!composeData.to || !composeData.subject || !composeData.content}
            >
              <SendIcon className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

        {/* Compose Form */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* AI Helper Section */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI Email Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showAIHelper ? (
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Need Help Writing Your Email?</h3>
                    <p className="text-muted-foreground mb-4">
                      Describe what you want to say and AI will help you write a professional email.
                    </p>
                    <Button 
                      onClick={() => setShowAIHelper(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Get AI Help
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        What do you want to say in your email?
                      </label>
                      <Textarea
                        value={aiHelperPrompt}
                        onChange={(e) => setAiHelperPrompt(e.target.value)}
                        placeholder="e.g., 'I want to schedule a meeting about the project proposal' or 'I need to thank them for their help'"
                        rows={3}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={handleGenerateAIResponse}
                        disabled={!aiHelperPrompt.trim() || isGeneratingAIResponse}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isGeneratingAIResponse ? (
                          <>
                            <Brain className="w-4 h-4 mr-2 animate-pulse" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Email
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowAIHelper(false)}
                        className="border-border text-foreground hover:bg-background/50"
                      >
                        Cancel
                      </Button>
                    </div>

                    {/* AI Generated Content */}
                    {aiGeneratedContent && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-foreground">AI Generated Content:</span>
                        </div>
                        <div className="p-4 bg-background/50 rounded-lg border border-border">
                          <div className="whitespace-pre-wrap text-sm text-foreground">
                            {aiGeneratedContent}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={handleUseAIContent}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Use This Content
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={handleCopyAIContent}
                            className="border-border text-foreground hover:bg-background/50"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">To:</label>
                <Input
                  value={composeData.to}
                  onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="recipient@example.com"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Subject:</label>
                <Input
                  value={composeData.subject}
                  onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Message:</label>
                <Textarea
                  value={composeData.content}
                  onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={15}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main email dashboard
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 bg-chatgpt-card border-r border-border flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Email</h1>
              <p className="text-sm text-muted-foreground">AI-Powered</p>
            </div>
          </div>
          
          {/* Gmail Integration Status */}
          {isGmailConnected ? (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Gmail Connected
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSyncGmail}
                  disabled={isSyncing}
                  className="h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                >
                  {isSyncing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                {gmailEmails.length} emails synced
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Gmail Not Connected
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Connect Gmail in Settings to sync emails
              </p>
            </div>
          )}
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleComposeEmail}
          >
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>

        {/* Folders */}
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="space-y-1 mb-4">
            {folders.map((folder) => {
              const folderCount = emails.filter(e => e.folder === folder.id).length;
              return (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                {folder.icon}
                <span className="font-medium">{folder.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                    {folderCount}
              </Badge>
            </button>
              );
            })}
          </div>

          {/* Custom Categories Section */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categories</span>
              <Popover open={showCreateCategory} onOpenChange={setShowCreateCategory}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <FolderPlus className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category Name</label>
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Important, Follow Up"
                        className="mb-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Color</label>
                      <div className="flex gap-2">
                        {['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewCategoryColor(color)}
                            className={`w-8 h-8 rounded-full border-2 ${
                              newCategoryColor === color ? 'border-foreground scale-110' : 'border-border'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleCreateCategory} className="w-full">
                      Create Category
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              {customCategories.map((category) => {
                const categoryCount = emails.filter(e => e.customCategories?.includes(category.id)).length;
                const IconComponent = category.icon === 'AlertCircle' ? AlertCircle : 
                                     category.icon === 'Clock' ? Clock : Folder;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedFolder(`category_${category.id}`)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors group ${
                      selectedFolder === `category_${category.id}`
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <IconComponent className="w-3.5 h-3.5" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {categoryCount}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="p-4 border-t border-border">
          <div className="p-2 bg-background/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-foreground">Gmail Connected</span>
            </div>
            <p className="text-xs text-muted-foreground">Last sync: 2 min ago</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-chatgpt-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'emails' | 'ai-assistant')}>
            <TabsList className="bg-background border border-border">
              <TabsTrigger value="emails" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Mail className="w-4 h-4 mr-2" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="ai-assistant" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Brain className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Email List */}
          <div className="w-80 border-r border-border bg-background flex-shrink-0">
            <div className="h-full overflow-y-auto">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Emails</h3>
                  <p className="text-muted-foreground mb-4">
                    {isGmailConnected 
                      ? "Click the sync button to load your Gmail emails."
                      : "Connect Gmail in Settings to sync emails."}
                  </p>
                  {isGmailConnected && (
                    <Button onClick={handleSyncGmail} disabled={isSyncing} variant="outline">
                      {isSyncing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Emails
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`group p-3 border-b border-border transition-colors ${
                    selectedEmail?.id === email.id
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'hover:bg-background/50'
                  } ${!email.isRead ? 'bg-blue-500/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(email);
                      }}
                      className="flex-shrink-0 mt-0.5 p-1 hover:bg-background/50 rounded transition-colors"
                      title={email.isStarred ? "Unstar" : "Star"}
                    >
                      {email.isStarred ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      ) : (
                        <Star className="w-4 h-4 text-muted-foreground hover:text-yellow-500" />
                      )}
                    </button>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleEmailSelect(email)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {email.from}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {formatTimestamp(email.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1 truncate">
                        {email.subject}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {email.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {email.customCategories && email.customCategories.length > 0 && (
                          email.customCategories.map((catId) => {
                            const category = customCategories.find(c => c.id === catId);
                            if (!category) return null;
                            return (
                              <Badge 
                                key={catId} 
                                variant="outline" 
                                className="text-xs"
                                style={{ borderColor: category.color, color: category.color }}
                              >
                                {category.name}
                              </Badge>
                            );
                          })
                        )}
                      {email.tags.length > 0 && (
                          email.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                      )}
                    </div>
                  </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Add to Category</div>
                          {customCategories.map((category) => {
                            const isInCategory = email.customCategories?.includes(category.id);
                            return (
                              <button
                                key={category.id}
                                onClick={() => handleToggleEmailCategory(email.id, category.id)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-background/50 text-sm"
                              >
                                <div 
                                  className="w-3 h-3 rounded"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="flex-1 text-left">{category.name}</span>
                                {isInCategory && <CheckCircle className="w-4 h-4 text-green-500" />}
                              </button>
                            );
                          })}
                </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>

          {/* Email Content / AI Assistant */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'emails' ? (
              /* Email Content */
              <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
                {selectedEmail ? (
                  <div className="space-y-6 max-w-5xl mx-auto pr-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium text-foreground flex-shrink-0">From:</span>
                          <span className="break-all truncate">{selectedEmail.from}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStar(selectedEmail)}
                        >
                          {selectedEmail.isStarred ? (
                            <Star className="w-4 h-4 mr-2 text-yellow-500 fill-current" />
                          ) : (
                            <Star className="w-4 h-4 mr-2" />
                          )}
                          {selectedEmail.isStarred ? 'Starred' : 'Star'}
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                              <TagIcon className="w-4 h-4 mr-2" />
                              Categories
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-2">
                            <div className="space-y-1">
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Add to Category</div>
                              {customCategories.map((category) => {
                                const isInCategory = selectedEmail.customCategories?.includes(category.id);
                                return (
                                  <button
                                    key={category.id}
                                    onClick={() => handleToggleEmailCategory(selectedEmail.id, category.id)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-background/50 text-sm"
                                  >
                                    <div 
                                      className="w-3 h-3 rounded"
                                      style={{ backgroundColor: category.color }}
                                    />
                                    <span className="flex-1 text-left">{category.name}</span>
                                    {isInCategory && <CheckCircle className="w-4 h-4 text-green-500" />}
                                  </button>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-2xl font-bold text-foreground break-words flex-1 min-w-0">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setIsComposing(true);
                            setComposeData({
                              to: selectedEmail.from,
                              subject: `Re: ${selectedEmail.subject}`,
                              content: ''
                            });
                          }}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAnalyzeEmail(selectedEmail)}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          AI Analysis
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleGenerateAIDrafts(selectedEmail)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Drafts
                        </Button>
                      </div>
                    </div>

                    {selectedEmail.customCategories && selectedEmail.customCategories.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedEmail.customCategories.map((catId) => {
                          const category = customCategories.find(c => c.id === catId);
                          if (!category) return null;
                          return (
                            <Badge 
                              key={catId} 
                              variant="outline"
                              style={{ borderColor: category.color, color: category.color }}
                            >
                              {category.name}
                            </Badge>
                          );
                        })}
                        </div>
                    )}

                    <div className="prose max-w-none border-t border-border pt-6">
                      {/* Render HTML content if available, otherwise plain text */}
                      {(() => {
                        const gmailEmail = getGmailEmailWithHtml(selectedEmail.id);
                        if (gmailEmail?.htmlBody) {
                          return (
                            <div 
                              className="email-content"
                              dangerouslySetInnerHTML={{ __html: gmailEmail.htmlBody }}
                              style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                maxWidth: '100%',
                                color: 'inherit',
                                paddingRight: '0'
                              }}
                            />
                          );
                        } else if (gmailEmail?.body) {
                          return (
                            <div className="whitespace-pre-wrap text-foreground leading-relaxed break-words">
                              {gmailEmail.body}
                            </div>
                          );
                        } else {
                          return (
                            <div className="whitespace-pre-wrap text-foreground leading-relaxed break-words">
                              {selectedEmail.content}
                            </div>
                          );
                        }
                      })()}
                    </div>
                    
                    {/* Add CSS for email images */}
                    <style>{`
                      .email-content img {
                        max-width: 100% !important;
                        height: auto !important;
                        display: block;
                        margin: 1rem 0;
                        border-radius: 0.5rem;
                      }
                      .email-content {
                        color: inherit;
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                        overflow-x: hidden;
                      }
                      .email-content * {
                        max-width: 100% !important;
                      }
                      .email-content table {
                        max-width: 100% !important;
                        table-layout: fixed;
                      }
                      .email-content a {
                        color: rgb(59, 130, 246);
                        text-decoration: underline;
                        word-break: break-all;
                      }
                      .email-content a:hover {
                        color: rgb(37, 99, 235);
                      }
                    `}</style>

                    {/* AI Drafts Section */}
                    {aiDrafts.length > 0 && (
                      <div className="mt-8 border-t border-border pt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          AI-Generated Response Drafts
                        </h3>
                        <div className="space-y-4">
                          {aiDrafts.map((draft) => (
                            <Card key={draft.id} className="bg-chatgpt-card border-border">
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                      {draft.tone}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4 text-green-500" />
                                      <span className="text-sm font-medium text-green-500">
                                        {draft.confidence}%
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopyDraft(draft)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleUseDraft(draft)}
                                      className="h-8 bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Edit3 className="w-4 h-4 mr-1" />
                                      Use
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{draft.reasoning}</p>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium text-foreground">Subject:</label>
                                    <div className="p-2 bg-background/50 rounded border border-border text-sm text-foreground">
                                      {draft.subject}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-foreground">Content:</label>
                                    <div className="p-3 bg-background/50 rounded border border-border">
                                      <div className="whitespace-pre-wrap text-sm text-foreground">
                                        {draft.content}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Generate AI Drafts Button */}
                    {aiDrafts.length === 0 && !isGeneratingDrafts && (
                      <div className="mt-8 border-t border-border pt-6">
                        <div className="text-center">
                          <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">Generate AI Response Drafts</h3>
                          <p className="text-muted-foreground mb-4">
                            Get AI-powered response suggestions with different tones
                          </p>
                          <Button 
                            onClick={() => handleGenerateAIDrafts(selectedEmail)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate AI Drafts
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {isGeneratingDrafts && (
                      <div className="mt-8 border-t border-border pt-6">
                        <Card className="bg-chatgpt-card border-border">
                          <CardContent className="p-8">
                            <div className="text-center">
                              <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-foreground mb-2">Generating AI Drafts...</h3>
                              <p className="text-muted-foreground">AI is creating response suggestions for you</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Email Selected</h3>
                      <p className="text-muted-foreground">Choose an email from the list to view its content.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* AI Assistant Tab */
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Brain className="w-8 h-8 text-blue-500" />
                      <h1 className="text-3xl font-bold text-foreground">AI Email Assistant</h1>
                      <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-muted-foreground">
                      Select an email to get AI-powered insights, analysis, and response suggestions.
                    </p>
                  </div>

                  {selectedEmail ? (
                    <div className="space-y-6">
                      {/* AI Analysis */}
                      {isAnalyzing ? (
                        <Card className="bg-chatgpt-card border-border shadow-sm">
                          <CardContent className="p-8">
                            <div className="text-center">
                              <Brain className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing Email...</h3>
                              <p className="text-muted-foreground">AI is processing your email content</p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : emailAnalysis ? (
                        <Card className="bg-chatgpt-card border-border shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                              <Brain className="w-5 h-5" />
                              AI Email Analysis
                              <Badge className="ml-auto bg-green-100 text-green-800 border-green-200">
                                {emailAnalysis.confidence}% Confidence
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Analysis Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium text-foreground">Sentiment</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  {emailAnalysis.sentiment}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium text-foreground">Priority</span>
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  {emailAnalysis.priority}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium text-foreground">Intent</span>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  {emailAnalysis.intent}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <TagIcon className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium text-foreground">Category</span>
                                </div>
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                  {emailAnalysis.category}
                                </Badge>
                              </div>
                            </div>

                            {/* Key Points */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">Key Points</span>
                              </div>
                              <div className="space-y-2">
                                {emailAnalysis.keyPoints.map((point: string, index: number) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-foreground">{point}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Suggested Actions */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">Suggested Actions</span>
                              </div>
                              <div className="space-y-2">
                                {emailAnalysis.suggestedActions.map((action: string, index: number) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-foreground">{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="bg-chatgpt-card border-border shadow-sm">
                          <CardContent className="p-8">
                            <div className="text-center">
                              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-foreground mb-2">Ready for AI Analysis</h3>
                              <p className="text-muted-foreground mb-4">
                                Click "AI Analysis" to get insights about this email
                              </p>
                              <Button 
                                onClick={() => handleAnalyzeEmail(selectedEmail)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Zap className="w-4 h-4 mr-2" />
                                Analyze Email
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card className="bg-chatgpt-card border-border shadow-sm">
                      <CardContent className="p-12">
                        <div className="text-center">
                          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-foreground mb-2">Select an Email</h3>
                          <p className="text-muted-foreground mb-6">
                            Choose an email from the list to access AI-powered analysis and response generation.
                          </p>
                          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              <span>Sentiment Analysis</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              <span>Intent Detection</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              <span>Smart Drafts</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}