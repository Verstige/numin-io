import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirebaseBookingTemplatesService, FirebaseBookingsService } from '@/lib/firebase-booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FirebaseTest() {
  const { user } = useFirebaseAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userId = user?.uid || 'anonymous';
  const teamId = 'default-team';

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addResult('🧪 Starting Firebase tests...');
    addResult(`👤 User ID: ${userId}`);
    addResult(`🏢 Team ID: ${teamId}`);

    try {
      // Test 1: Connection test
      addResult('🔗 Testing Firebase connection...');
      const connectionTest = await FirebaseBookingTemplatesService.testConnection(userId, teamId);
      addResult(`✅ Connection test: ${connectionTest ? 'PASSED' : 'FAILED'}`);

      // Test 2: Create a test template
      addResult('📝 Creating test template...');
      const testTemplate = {
        userId: userId,
        name: 'Firebase Test Template ' + Date.now(),
        description: 'A test template to verify Firebase functionality',
        duration: 30,
        bufferTime: 10,
        meetingType: 'video-call' as const,
        videoLink: 'https://test.com',
        instructions: 'Test instructions',
        price: 25,
        currency: 'USD',
        isActive: true
      };

      const createdTemplate = await FirebaseBookingTemplatesService.createTemplate(userId, teamId, testTemplate);
      addResult(`✅ Template created with ID: ${createdTemplate.id}`);

      // Test 3: Read templates back
      addResult('📖 Reading templates back...');
      const templates = await FirebaseBookingTemplatesService.getTemplates(userId, teamId);
      addResult(`✅ Found ${templates.length} templates`);
      templates.forEach(t => addResult(`  - ${t.name} (${t.id})`));

      // Test 4: Create a test booking
      addResult('📅 Creating test booking...');
      const testBooking = {
        userId: userId,
        templateId: createdTemplate.id,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+1234567890',
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60000), // 30 minutes later
        status: 'confirmed' as const,
        notes: 'Test booking created by Firebase test'
      };

      const createdBooking = await FirebaseBookingsService.createBooking(userId, teamId, testBooking);
      addResult(`✅ Booking created with ID: ${createdBooking.id}`);

      // Test 5: Read bookings back
      addResult('📖 Reading bookings back...');
      const bookings = await FirebaseBookingsService.getBookings(userId, teamId);
      addResult(`✅ Found ${bookings.length} bookings`);
      bookings.forEach(b => addResult(`  - ${b.customerName} (${b.id})`));

      addResult('🎉 All tests completed successfully!');

    } catch (error: any) {
      addResult(`❌ Test failed: ${error.message}`);
      addResult(`❌ Error code: ${error.code || 'unknown'}`);
      addResult(`❌ Error details: ${JSON.stringify(error, null, 2)}`);
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Test Suite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={isLoading}>
              {isLoading ? 'Running Tests...' : 'Run Firebase Tests'}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click "Run Firebase Tests" to start.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">
            <p>User ID: {userId}</p>
            <p>Team ID: {teamId}</p>
            <p>Status: {user ? 'Authenticated' : 'Not authenticated'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
