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

// Import layout and section components
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";

/**
 * Index Component
 * 
 * Renders the landing page with all its sections wrapped in the main layout.
 * Each section is a separate component for better organization and maintainability.
 * 
 * @returns {JSX.Element} The complete landing page
 */
const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </MainLayout>
  );
};

export default Index;
