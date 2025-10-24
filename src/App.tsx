import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import Index from "./pages/Index";
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
import { ReminderSystem } from "./lib/reminder-system";
import { initializeMobileApp } from "./lib/mobile-config";
import { useEffect } from "react";

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
            <Route path="/" element={<LandingPage />} />
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
            <Route path="/demo" element={<DemoWorkspace />} />
            <Route path="/nexus-demo" element={<NexusDemo />} />
            <Route path="/home" element={<LandingPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
