
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getHowItWorksData } from "@/lib/dataUtils";

const HowItWorksSection = () => {
  const { heading, subheading, steps } = getHowItWorksData();

  return (
    <section className="py-16 bg-white" id="how-it-works">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-portfolioai-primary">
            {heading}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {subheading}
          </p>
        </div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
            >
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="flex items-center">
                  <span className="text-5xl font-bold text-portfolioai-accent opacity-50">{step.number}</span>
                  <h3 className="ml-4 text-2xl font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-lg text-gray-600">{step.description}</p>
                {index === steps.length - 1 && (
                  <Button className="mt-4 bg-portfolioai-primary hover:bg-portfolioai-secondary" asChild>
                    <Link to="/signup">Get Started Now</Link>
                  </Button>
                )}
              </div>
              <div className="w-full lg:w-1/2">
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <img 
                    src={step.image} 
                    alt={`Step ${index + 1}: ${step.title}`} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
