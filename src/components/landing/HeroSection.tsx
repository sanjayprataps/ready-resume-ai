
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="container-wide py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight hero-text-gradient">
            <span className="block">Transform Your Career Profile</span>
            <span className="block">with AI-Powered Tools</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            PortfolioAI helps early-career engineers create stunning portfolios, ATS-optimized resumes, and tailored cover letters in minutes — all powered by artificial intelligence.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-portfolioai-primary hover:bg-portfolioai-secondary text-white px-8 py-6 text-lg" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" className="px-8 py-6 text-lg" asChild>
              <Link to="/demo">See Demo</Link>
            </Button>
          </div>
        </div>
        
        {/* Hero image */}
        <div className="mt-16 flex justify-center">
          <div className="relative w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
              alt="PortfolioAI dashboard preview"
              className="w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-portfolioai-primary/20 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
