
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getCTAData } from "@/lib/dataUtils";

const CTASection = () => {
  const { headline, subheading, primary_cta, secondary_cta, note } = getCTAData();

  return (
    <section className="py-20 bg-portfolioai-primary">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {headline}
          </h2>
          <p className="mt-4 text-xl text-white/80">
            {subheading}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-white text-portfolioai-primary hover:bg-gray-100 px-8 py-6 text-lg" asChild>
              <Link to="/signup">
                {primary_cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg" asChild>
              <Link to="/demo">{secondary_cta}</Link>
            </Button>
          </div>
          
          <p className="mt-6 text-white/70 text-sm">
            {note}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
