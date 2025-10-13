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
import NexusDemo from "./components/NexusDemo";
import ProjectMapDemo from "./components/ProjectMapDemo";

const queryClient = new QueryClient();

const App = () => (
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
                <NexusDashboard />
              </ProtectedRoute>
            } />
            <Route path="/demo" element={<DemoWorkspace />} />
            <Route path="/nexus-demo" element={<NexusDemo />} />
            <Route path="/project-map-demo" element={<ProjectMapDemo />} />
            <Route path="/home" element={<LandingPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
