// Contacts Test Component
// This component tests the Firebase contacts functionality

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirebaseContactsService, type Contact } from '@/lib/firebase-contacts';
import { toast } from '@/hooks/use-toast';

export default function ContactsTest() {
  const { user } = useFirebaseAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testContact, setTestContact] = useState({
    name: 'Test Contact',
    email: 'test@example.com',
    phone: '555-0123',
    company: 'Test Company',
    position: 'Test Position'
  });

  const loadContacts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('🔄 Loading contacts for testing...');
      
      const userId = user.uid;
      const teamId = 'default-team';
      
      const firebaseContacts = await FirebaseContactsService.getContacts(userId, teamId);
      setContacts(firebaseContacts);
      console.log('✅ Test contacts loaded:', firebaseContacts.length);
      
      toast({
        title: "Contacts Loaded",
        description: `Found ${firebaseContacts.length} contacts in Firebase`,
      });
    } catch (error) {
      console.error('Error loading test contacts:', error);
      toast({
        title: "Error Loading Contacts",
        description: "Failed to load contacts from Firebase",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTestContact = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('🔄 Creating test contact...');
      
      const userId = user.uid;
      const teamId = 'default-team';
      
      const contactData = {
        name: testContact.name,
        email: testContact.email,
        phone: testContact.phone,
        company: testContact.company,
        position: testContact.position,
        status: 'lead' as const,
        source: 'Test',
        tags: ['test', 'automated']
      };

      const createdContact = await FirebaseContactsService.createContact(userId, teamId, contactData);
      console.log('✅ Test contact created:', createdContact.id);
      
      // Reload contacts
      await loadContacts();
      
      toast({
        title: "Test Contact Created",
        description: `Contact "${createdContact.name}" created successfully`,
      });
    } catch (error) {
      console.error('Error creating test contact:', error);
      toast({
        title: "Error Creating Contact",
        description: "Failed to create test contact",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTestContact = async (contactId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('🔄 Deleting test contact...');
      
      const userId = user.uid;
      const teamId = 'default-team';
      
      await FirebaseContactsService.deleteContact(userId, teamId, contactId);
      console.log('✅ Test contact deleted');
      
      // Reload contacts
      await loadContacts();
      
      toast({
        title: "Test Contact Deleted",
        description: "Contact deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting test contact:', error);
      toast({
        title: "Error Deleting Contact",
        description: "Failed to delete test contact",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Firebase Contacts Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Test Contact Creation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create Test Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testName">Name</Label>
                  <Input
                    id="testName"
                    value={testContact.name}
                    onChange={(e) => setTestContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="testEmail">Email</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testContact.email}
                    onChange={(e) => setTestContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Contact email"
                  />
                </div>
                <div>
                  <Label htmlFor="testPhone">Phone</Label>
                  <Input
                    id="testPhone"
                    value={testContact.phone}
                    onChange={(e) => setTestContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Contact phone"
                  />
                </div>
                <div>
                  <Label htmlFor="testCompany">Company</Label>
                  <Input
                    id="testCompany"
                    value={testContact.company}
                    onChange={(e) => setTestContact(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={createTestContact} disabled={isLoading || !user}>
                  {isLoading ? 'Creating...' : 'Create Test Contact'}
                </Button>
                <Button onClick={loadContacts} disabled={isLoading || !user} variant="outline">
                  {isLoading ? 'Loading...' : 'Refresh Contacts'}
                </Button>
              </div>
            </div>

            {/* Current Contacts */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Contacts ({contacts.length})</h3>
              {contacts.length === 0 ? (
                <p className="text-gray-500">No contacts found. Create a test contact above.</p>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.email}</div>
                        <div className="text-sm text-gray-500">
                          {contact.company} • {contact.phone}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {contact.status}
                        </span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteTestContact(contact.id)}
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-sm text-gray-600">
              <p><strong>User ID:</strong> {user?.uid || 'Not logged in'}</p>
              <p><strong>Team ID:</strong> default-team</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
