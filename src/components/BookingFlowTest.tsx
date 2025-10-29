import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirebaseBookingTemplatesService, FirebaseBookingsService } from '@/lib/firebase-booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BookingFlowTest() {
  const { user } = useFirebaseAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState('Test Customer');
  const [customerEmail, setCustomerEmail] = useState('test@example.com');

  const userId = user?.uid || 'anonymous';
  const teamId = 'default-team';

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBookingFlow = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addResult('🧪 Starting complete booking flow test...');
    addResult(`👤 User ID: ${userId}`);
    addResult(`🏢 Team ID: ${teamId}`);

    try {
      // Step 1: Create a test template
      addResult('📝 Step 1: Creating test template...');
      const testTemplate = {
        userId: userId,
        name: 'Flow Test Template ' + Date.now(),
        description: 'A template to test the complete booking flow',
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

      // Step 2: Create a test booking
      addResult('📅 Step 2: Creating test booking...');
      const testBooking = {
        userId: userId,
        bookingCode: 'TEST' + Date.now(),
        templateId: createdTemplate.id,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: '+1234567890',
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60000), // 30 minutes later
        duration: 30,
        status: 'confirmed' as const,
        location: 'Test Location',
        meetingType: 'video-call' as const,
        videoLink: 'https://test.com',
        notes: 'Test booking created by flow test',
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
      addResult(`✅ Booking created with ID: ${createdBooking.id}`);

      // Step 3: Verify booking can be retrieved
      addResult('🔍 Step 3: Verifying booking retrieval...');
      const retrievedBookings = await FirebaseBookingsService.getBookings(userId, teamId);
      const foundBooking = retrievedBookings.find(b => b.id === createdBooking.id);
      
      if (foundBooking) {
        addResult(`✅ Booking found in database: ${foundBooking.customerName}`);
        addResult(`✅ Booking status: ${foundBooking.status}`);
        addResult(`✅ Booking userId: ${foundBooking.userId}`);
      } else {
        addResult(`❌ Booking NOT found in database!`);
      }

      // Step 4: Test real-time listener
      addResult('📡 Step 4: Testing real-time listener...');
      let listenerTriggered = false;
      
      const unsubscribe = FirebaseBookingsService.subscribeToBookings(userId, teamId, (bookings) => {
        if (!listenerTriggered) {
          listenerTriggered = true;
          addResult(`✅ Real-time listener triggered with ${bookings.length} bookings`);
          const ourBooking = bookings.find(b => b.id === createdBooking.id);
          if (ourBooking) {
            addResult(`✅ Our booking found in real-time listener: ${ourBooking.customerName}`);
          } else {
            addResult(`❌ Our booking NOT found in real-time listener!`);
          }
          unsubscribe(); // Clean up
        }
      });

      // Wait a moment for the listener to trigger
      setTimeout(() => {
        if (!listenerTriggered) {
          addResult(`⚠️ Real-time listener did not trigger within 3 seconds`);
          unsubscribe();
        }
      }, 3000);

      addResult('🎉 Complete booking flow test finished!');

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
          <CardTitle>Complete Booking Flow Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter customer email"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={testBookingFlow} disabled={isLoading}>
              {isLoading ? 'Running Test...' : 'Test Complete Booking Flow'}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click "Test Complete Booking Flow" to start.</p>
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
