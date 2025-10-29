import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BookingPageTest() {
  const testTemplateId = 'test_template_123';
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Booking Page Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is a test page to verify the booking functionality.</p>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Test Links:</h3>
            <div className="space-x-2">
              <Button asChild>
                <Link to={`/book/${testTemplateId}`}>
                  Test Booking Page
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/workspace">
                  Back to Workspace
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Test Template ID:</strong> {testTemplateId}</p>
            <p><strong>Expected URL:</strong> /book/{testTemplateId}</p>
            <p><strong>Note:</strong> The booking page should load with a default template if the ID doesn't exist.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
