/**
 * Landing Page Component
 * ---------------------
 * This is the main landing page of the application that showcases the key features
 * and benefits of the resume generation and optimization platform.
 * 
 * The page consists of several sections:
 * - Hero section with main value proposition
 * - Features overview
 * - How it works explanation
 * - User testimonials
 * - Call to action section
 */

// Import section components
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import { FileText, Sparkles, Mail, Globe, Lightbulb, MessageSquare, Briefcase } from "lucide-react";

const features = [
  {
    title: "Resume Generator",
    description: "Create professional resumes tailored to your target role",
    icon: FileText,
    href: "/resume-generator",
  },
  {
    title: "Resume Optimizer",
    description: "Get AI-powered suggestions to improve your resume",
    icon: Sparkles,
    href: "/resume-optimizer",
  },
  {
    title: "Cover Letter Writer",
    description: "Generate compelling cover letters for your applications",
    icon: Mail,
    href: "/cover-letter-writer",
  },
  {
    title: "Portfolio Generator",
    description: "Create a professional portfolio website",
    icon: Globe,
    href: "/portfolio-generator",
  },
  {
    title: "Career Coach",
    description: "Get personalized career guidance and insights",
    icon: Lightbulb,
    href: "/career-coach",
  },
  {
    title: "Interview Coach",
    description: "Practice interviews with AI-powered feedback",
    icon: MessageSquare,
    href: "/interview-coach",
  },
  {
    title: "Job Search",
    description: "Find matching jobs using keywords or your resume",
    icon: Briefcase,
    href: "/job-search",
  },
];

/**
 * Index Component
 * 
 * Renders the landing page with all its sections.
 * Each section is a separate component for better organization and maintainability.
 * 
 * @returns {JSX.Element} The complete landing page
 */
const Index = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
};

export default Index;
