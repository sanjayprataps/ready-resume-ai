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

// Import page components
import Index from "./pages/Index";
import CareerCoach from "./pages/CareerCoach";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";
import ResumeOptimizer from "./pages/ResumeOptimizer";
import ResumeGenerator from "./pages/ResumeGenerator";
import CoverLetterWriter from "./pages/CoverLetterWriter";
import PortfolioGenerator from "./pages/PortfolioGenerator";

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
      <Router>
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<Index />} />
          <Route path="/career-coach" element={<CareerCoach />} />
          
          {/* Implemented feature routes */}
          <Route path="/resume-optimizer" element={<ResumeOptimizer />} />
          <Route path="/resume-generator" element={<ResumeGenerator />} />
          <Route path="/cover-letter-writer" element={<CoverLetterWriter />} />
          <Route path="/portfolio-generator" element={<PortfolioGenerator />} />
          
          {/* Placeholder routes for upcoming features */}
          <Route path="/portfolio-optimizer" element={<PlaceholderPage />} />
          <Route path="/linkedin-optimizer" element={<PlaceholderPage />} />
          <Route path="/job-search-tracker" element={<PlaceholderPage />} />
          <Route path="/interview-coach" element={<PlaceholderPage />} />
          
          {/* Catch-all route for 404 pages */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
