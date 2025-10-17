import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Video
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function BookingDemo() {
  const sampleTemplateId = 'sample_template_1';
  const bookingUrl = `${window.location.origin}/book/${sampleTemplateId}`;

  const copyBookingLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast({
      title: "Link Copied",
      description: "Booking link copied to clipboard",
    });
  };

  const openBookingPage = () => {
    window.open(bookingUrl, '_blank');
  };

  const resetBookingSystem = () => {
    if (window.confirm('This will clear all booking data. Are you sure?')) {
      localStorage.removeItem('bookings');
      localStorage.removeItem('bookingTemplates');
      localStorage.removeItem('bookingSettings');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900 flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            Booking System Demo
          </CardTitle>
          <p className="text-blue-700">
            Test the complete booking flow from customer perspective to admin management
          </p>
        </CardHeader>
      </Card>

      {/* Sample Template Info */}
      <Card className="bg-chatgpt-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sample Booking Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">30 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">Video Call</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-semibold">$150 USD</span>
            </div>
          </div>
          
          <div className="p-4 bg-background/50 rounded-lg border border-border">
            <h4 className="font-medium text-foreground mb-2">Consultation Call</h4>
            <p className="text-sm text-muted-foreground mb-3">
              A 30-minute consultation to discuss your needs and how we can help.
            </p>
            <div className="text-xs text-muted-foreground">
              <strong>Instructions:</strong> Please have your questions ready and ensure you have a stable internet connection.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Link */}
      <Card className="bg-chatgpt-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Customer Booking Link</CardTitle>
          <p className="text-muted-foreground text-sm">
            Share this link with customers to allow them to book appointments
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              value={bookingUrl}
              readOnly
              className="bg-background border-border text-foreground"
            />
            <Button
              variant="outline"
              onClick={copyBookingLink}
              className="border-border text-foreground hover:bg-background/50"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              onClick={openBookingPage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Booking
            </Button>
            <Button
              onClick={resetBookingSystem}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Reset System
            </Button>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Click "Test Booking" to open the customer booking page in a new tab. 
              Complete the booking process and then return to see the booking appear in your management dashboard.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Booking Flow Steps */}
      <Card className="bg-chatgpt-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Complete Booking Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium text-foreground">Customer Visits Booking Link</h4>
                <p className="text-sm text-muted-foreground">Customer clicks the shared booking link</p>
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-auto" />
            
            <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium text-foreground">Select Date & Time</h4>
                <p className="text-sm text-muted-foreground">Customer selects date from calendar, then time slots appear below</p>
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-auto" />
            
            <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium text-foreground">Provide Information</h4>
                <p className="text-sm text-muted-foreground">Customer enters contact details and special requests</p>
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-auto" />
            
            <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Booking Confirmed</h4>
                <p className="text-sm text-muted-foreground">Customer receives confirmation email with booking details</p>
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-auto" />
            
            <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h4 className="font-medium text-foreground">Appears in Management Dashboard</h4>
                <p className="text-sm text-muted-foreground">Booking automatically appears in your Bookings tab and calendar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="bg-chatgpt-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Customer Experience</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Professional booking interface
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Real-time availability checking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Automatic conflict prevention
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Instant confirmation emails
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Unique booking codes
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Management Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Centralized booking management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Automated reminder system
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Calendar integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Gmail integration for emails
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Real-time updates
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
