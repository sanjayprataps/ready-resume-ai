/**
 * Main Application Component
 * -------------------------
 * This is the root component of the application that sets up the routing and global providers.
 * It configures React Query for data fetching, tooltips, and toast notifications.
 * 
 * Features:
 * - React Router setup for navigation
 * - Global state management with React Query
 * - Toast notifications with multiple providers
 * - Tooltip provider for enhanced UI interactions
 */

// Import necessary components and utilities
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Index from "@/pages/Index";
import ResumeGenerator from "@/pages/ResumeGenerator";
import ResumeOptimizer from "@/pages/ResumeOptimizer";
import CoverLetterWriter from "@/pages/CoverLetterWriter";
import PortfolioGenerator from "@/pages/PortfolioGenerator";
import CareerCoach from "@/pages/CareerCoach";
import InterviewCoach from "@/pages/InterviewCoach";
import PlaceholderPage from "@/pages/PlaceholderPage";

// Initialize React Query client
const queryClient = new QueryClient();

/**
 * Main App Component
 * 
 * This component serves as the root of the application and sets up:
 * 1. React Query for data fetching and caching
 * 2. Tooltip provider for enhanced UI interactions
 * 3. Multiple toast notification systems
 * 4. React Router for navigation
 * 5. Authentication context for user management
 * 
 * @returns {JSX.Element} The root component of the application
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        {/* Toast notification providers */}
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route index element={<Index />} />
            <Route path="resume-generator" element={<ResumeGenerator />} />
            <Route path="resume-optimizer" element={<ResumeOptimizer />} />
            <Route path="cover-letter-writer" element={<CoverLetterWriter />} />
            <Route path="portfolio-generator" element={<PortfolioGenerator />} />
            <Route path="career-coach" element={<CareerCoach />} />
            <Route path="interview-coach" element={<InterviewCoach />} />
            <Route path="*" element={<PlaceholderPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
