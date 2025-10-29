import React, { useState } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { testFirebaseConnection, testFirebaseSecurityRules } from '@/lib/firebase-connection-test';
import { FirebaseBookingTemplatesService, FirebaseBookingsService } from '@/lib/firebase-booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FirebaseConnectionTest() {
  const { user } = useFirebaseAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, success: boolean, details?: any, error?: string) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      details,
      error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Basic Firebase Connection
      addResult('Basic Connection', true, 'Starting...');
      const connectionTest = await testFirebaseConnection();
      addResult('Basic Connection', connectionTest.success, connectionTest.details, connectionTest.error);
      
      // Test 2: Security Rules
      addResult('Security Rules', true, 'Starting...');
      const securityTest = await testFirebaseSecurityRules();
      addResult('Security Rules', securityTest.success, securityTest.details, securityTest.error);
      
      // Test 3: Booking Templates Service
      addResult('Templates Service', true, 'Starting...');
      try {
        const userId = user?.uid || 'test-user-123';
        const teamId = 'default-team';
        
        const templates = await FirebaseBookingTemplatesService.getTemplates(userId, teamId);
        addResult('Templates Service', true, { templatesFound: templates.length });
        
        // Try to create a template
        const testTemplate = {
          userId: userId,
          name: 'Firebase Test Template',
          description: 'Testing Firebase connection',
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
        addResult('Template Creation', true, { templateId: createdTemplate.id });
        
      } catch (error: any) {
        addResult('Templates Service', false, null, error.message);
      }
      
      // Test 4: Bookings Service
      addResult('Bookings Service', true, 'Starting...');
      try {
        const userId = user?.uid || 'test-user-123';
        const teamId = 'default-team';
        
        const bookings = await FirebaseBookingsService.getBookings(userId, teamId);
        addResult('Bookings Service', true, { bookingsFound: bookings.length });
        
        // Try to create a booking
        const testBooking = {
          userId: userId,
          bookingCode: 'TEST' + Date.now(),
          templateId: 'test-template-123',
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          customerPhone: '+1234567890',
          startTime: new Date(),
          endTime: new Date(Date.now() + 30 * 60000),
          duration: 30,
          status: 'confirmed' as const,
          location: 'Test Location',
          meetingType: 'video-call' as const,
          videoLink: 'https://test.com',
          notes: 'Test booking',
          price: 25,
          currency: 'USD',
          remindersSent: {
            email24h: false,
            email1h: false,
            sms24h: false,
            sms1h: false
          }
        };
        
        const createdBooking = await FirebaseBookingsService.createBooking(userId, teamId, testBooking);
        addResult('Booking Creation', true, { bookingId: createdBooking.id });
        
      } catch (error: any) {
        addResult('Bookings Service', false, null, error.message);
      }
      
    } catch (error: any) {
      addResult('Overall Test', false, null, error.message);
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
          <CardTitle>Firebase Connection & Service Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runAllTests} disabled={isLoading}>
              {isLoading ? 'Running Tests...' : 'Run All Firebase Tests'}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <Card key={index} className={`${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{result.test}</h3>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Time: {result.timestamp}</p>
                    {result.details && (
                      <div className="mt-2">
                        <p className="font-medium">Details:</p>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.error && (
                      <div className="mt-2">
                        <p className="font-medium text-red-600">Error:</p>
                        <p className="text-red-600 text-xs">{result.error}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-xs text-gray-500">
            <p>User ID: {user?.uid || 'Not authenticated'}</p>
            <p>Status: {user ? 'Authenticated' : 'Not authenticated'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
