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
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import page components
import Index from "./pages/Index";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeOptimizer from "./pages/ResumeOptimizer";
import ResumeGenerator from "./pages/ResumeGenerator";
import CoverLetterWriter from "./pages/CoverLetterWriter";
import NotFound from "./pages/NotFound";

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
 * 
 * @returns {JSX.Element} The root component of the application
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Toast notification providers */}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<Index />} />
          <Route path="/upload-resume" element={<ResumeUpload />} />
          <Route path="/signup" element={<ResumeUpload />} />
          <Route path="/demo" element={<ResumeUpload />} />
          <Route path="/resume-optimizer" element={<ResumeOptimizer />} />
          <Route path="/resume-generator" element={<ResumeGenerator />} />
          <Route path="/cover-letter-writer" element={<CoverLetterWriter />} />
          
          {/* Placeholder routes for upcoming features */}
          <Route path="/portfolio-builder" element={<ResumeUpload />} />
          <Route path="/portfolio-optimizer" element={<ResumeUpload />} />
          <Route path="/linkedin-optimizer" element={<ResumeUpload />} />
          <Route path="/career-coach" element={<ResumeUpload />} />
          <Route path="/job-search-tracker" element={<ResumeUpload />} />
          <Route path="/interview-coach" element={<ResumeUpload />} />
          
          {/* Catch-all route for 404 pages */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
