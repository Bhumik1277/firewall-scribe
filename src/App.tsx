import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FirewallManagement from "./pages/FirewallManagement";
import LogMonitoring from "./pages/LogMonitoring";
import ThreatSignatures from "./pages/ThreatSignatures";
import AttackPatterns from "./pages/AttackPatterns";
import SecurityIncidents from "./pages/SecurityIncidents";
import Vulnerabilities from "./pages/Vulnerabilities";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/firewall" element={
              <ProtectedRoute>
                <FirewallManagement />
              </ProtectedRoute>
            } />
            <Route path="/logs" element={
              <ProtectedRoute>
                <LogMonitoring />
              </ProtectedRoute>
            } />
            <Route path="/signatures" element={
              <ProtectedRoute>
                <ThreatSignatures />
              </ProtectedRoute>
            } />
            <Route path="/patterns" element={
              <ProtectedRoute>
                <AttackPatterns />
              </ProtectedRoute>
            } />
            <Route path="/incidents" element={
              <ProtectedRoute>
                <SecurityIncidents />
              </ProtectedRoute>
            } />
            <Route path="/vulnerabilities" element={
              <ProtectedRoute>
                <Vulnerabilities />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
