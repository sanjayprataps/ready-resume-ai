import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getSiteConfig } from "@/lib/dataUtils";
const HeroSection = () => {
  const {
    product_name,
    tagline,
    what_it_is
  } = getSiteConfig();
  return <div className="relative overflow-hidden bg-white">
      <div className="container-wide py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight hero-text-gradient">
            <span className="block text-5xl">{product_name}</span>
            <span className="block">{tagline}</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            {what_it_is}
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
        
      </div>
    </div>;
};
export default HeroSection;