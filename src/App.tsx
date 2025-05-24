
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeOptimizer from "./pages/ResumeOptimizer";
import ResumeGenerator from "./pages/ResumeGenerator";
import CoverLetterWriter from "./pages/CoverLetterWriter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload-resume" element={<ResumeUpload />} />
          <Route path="/signup" element={<ResumeUpload />} />
          <Route path="/demo" element={<ResumeUpload />} />
          <Route path="/resume-optimizer" element={<ResumeOptimizer />} />
          <Route path="/resume-generator" element={<ResumeGenerator />} />
          <Route path="/cover-letter-writer" element={<CoverLetterWriter />} />
          {/* Placeholder routes for remaining features */}
          <Route path="/portfolio-builder" element={<ResumeUpload />} />
          <Route path="/portfolio-optimizer" element={<ResumeUpload />} />
          <Route path="/linkedin-optimizer" element={<ResumeUpload />} />
          <Route path="/career-coach" element={<ResumeUpload />} />
          <Route path="/job-search-tracker" element={<ResumeUpload />} />
          <Route path="/interview-coach" element={<ResumeUpload />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
