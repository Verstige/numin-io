import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirebaseBookingTemplatesService, FirebaseBookingsService } from '@/lib/firebase-booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DataDebugger() {
  const { user } = useFirebaseAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const userId = user?.uid || 'anonymous';
  const teamId = 'default-team';

  const loadData = async () => {
    setIsLoading(true);
    console.log('🔍 DataDebugger: Loading data...');
    
    try {
      // Load from Firebase
      const firebaseTemplates = await FirebaseBookingTemplatesService.getTemplates(userId, teamId);
      const firebaseBookings = await FirebaseBookingsService.getBookings(userId, teamId);
      
      setTemplates(firebaseTemplates);
      setBookings(firebaseBookings);
      
      console.log('🔍 Firebase data loaded:', {
        templates: firebaseTemplates.length,
        bookings: firebaseBookings.length
      });
    } catch (error) {
      console.error('🔍 Firebase error:', error);
    }

    // Load from localStorage
    const savedTemplates = localStorage.getItem(`bookingTemplates_${userId}`);
    const savedBookings = localStorage.getItem(`bookings_${userId}`);
    const savedSettings = localStorage.getItem(`bookingSettings_${userId}`);

    setLocalStorageData({
      templates: savedTemplates ? JSON.parse(savedTemplates) : [],
      bookings: savedBookings ? JSON.parse(savedBookings) : [],
      settings: savedSettings ? JSON.parse(savedSettings) : null
    });

    console.log('🔍 localStorage data:', {
      templates: savedTemplates ? JSON.parse(savedTemplates).length : 0,
      bookings: savedBookings ? JSON.parse(savedBookings).length : 0,
      settings: !!savedSettings
    });

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const createTestTemplate = async () => {
    console.log('🔍 Creating test template...');
    const testTemplate = {
      userId: userId,
      name: 'Test Template ' + Date.now(),
      description: 'A test template created by DataDebugger',
      duration: 30,
      bufferTime: 10,
      meetingType: 'video-call' as const,
      videoLink: 'https://test.com',
      instructions: 'Test instructions',
      price: 50,
      currency: 'USD',
      isActive: true
    };

    try {
      await FirebaseBookingTemplatesService.createTemplate(userId, teamId, testTemplate);
      console.log('✅ Test template created in Firebase');
    } catch (error) {
      console.error('❌ Failed to create test template in Firebase:', error);
      
      // Fallback to localStorage
      const existing = JSON.parse(localStorage.getItem(`bookingTemplates_${userId}`) || '[]');
      const newTemplate = {
        ...testTemplate,
        id: 'test_' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`bookingTemplates_${userId}`, JSON.stringify([...existing, newTemplate]));
      console.log('✅ Test template created in localStorage');
    }

    loadData();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={loadData} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </Button>
            <Button onClick={createTestTemplate} variant="outline">
              Create Test Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Firebase Data</h3>
              <div className="text-sm space-y-1">
                <p>Templates: {templates.length}</p>
                <p>Bookings: {bookings.length}</p>
                {templates.length > 0 && (
                  <div>
                    <p className="font-medium">Template Names:</p>
                    <ul className="list-disc list-inside ml-2">
                      {templates.map(t => (
                        <li key={t.id}>{t.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">localStorage Data</h3>
              <div className="text-sm space-y-1">
                <p>Templates: {localStorageData.templates?.length || 0}</p>
                <p>Bookings: {localStorageData.bookings?.length || 0}</p>
                <p>Settings: {localStorageData.settings ? 'Yes' : 'No'}</p>
                {localStorageData.templates?.length > 0 && (
                  <div>
                    <p className="font-medium">Template Names:</p>
                    <ul className="list-disc list-inside ml-2">
                      {localStorageData.templates.map((t: any) => (
                        <li key={t.id}>{t.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>User ID: {userId}</p>
            <p>Team ID: {teamId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
