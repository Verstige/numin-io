import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import './lib/debug-firebase'; // Load Firebase debugging utilities
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import NuminLanding from "./components/NuminLanding";
import Index from "./pages/Index";
import "./landing.css";
import NotFound from "./app/not-found";
import DemoWorkspace from "./components/DemoWorkspace";
import NexusDashboard from "./components/NexusDashboard";
import EnhancedNexusDashboard from "./components/EnhancedNexusDashboard";
import NexusDemo from "./components/NexusDemo";
import CRMDashboard from "./components/CRM/CRMDashboard";
import EmailDashboard from "./components/Email/EmailDashboard";
import SettingsDashboard from "./components/Settings/SettingsDashboard";
import GmailCallback from "./pages/GmailCallback";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PublicBookingPage from "./components/PublicBookingPage";
import BookingPageTest from "./components/BookingPageTest";
import DataDebugger from "./components/DataDebugger";
import FirebaseTest from "./components/FirebaseTest";
import BookingFlowTest from "./components/BookingFlowTest";
import FirebaseConnectionTest from "./components/FirebaseConnectionTest";
import AgentSystemStatus from "./components/AgentSystemStatus";
import ContactsTest from "./components/ContactsTest";
import { ReminderSystem } from "./lib/reminder-system";
import { initializeMobileApp } from "./lib/mobile-config";
import { useEffect } from "react";
import "./lib/firebase-test"; // Import Firebase connection test
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  // Initialize reminder system and mobile app when app starts
  useEffect(() => {
    const reminderSystem = ReminderSystem.getInstance();
    reminderSystem.start();
    
    // Initialize mobile-specific configurations
    initializeMobileApp();
    
    // Cleanup on unmount
    return () => {
      reminderSystem.stop();
    };
  }, []);

  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
          <Routes>
            <Route path="/" element={<NuminLanding />} />
            <Route path="/workspace" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/nexus" element={
              <ProtectedRoute>
                <EnhancedNexusDashboard />
              </ProtectedRoute>
            } />
            <Route path="/crm" element={
              <ProtectedRoute>
                <CRMDashboard />
              </ProtectedRoute>
            } />
        <Route path="/email" element={
          <ProtectedRoute>
            <EmailDashboard />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsDashboard />
          </ProtectedRoute>
        } />
        <Route path="/auth/gmail/callback" element={<GmailCallback />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/book/:templateId" element={<PublicBookingPage />} />
        <Route path="/booking-test" element={<BookingPageTest />} />
        <Route path="/data-debug" element={<DataDebugger />} />
        <Route path="/firebase-test" element={<FirebaseTest />} />
        <Route path="/booking-flow-test" element={<BookingFlowTest />} />
        <Route path="/firebase-connection-test" element={<FirebaseConnectionTest />} />
        <Route path="/agent-status" element={<AgentSystemStatus showDetails={true} className="max-w-2xl mx-auto p-4" />} />
        <Route path="/contacts-test" element={<ContactsTest />} />
            <Route path="/demo" element={<DemoWorkspace />} />
            <Route path="/nexus-demo" element={<NexusDemo />} />
            <Route path="/home" element={<NuminLanding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </FirebaseAuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
