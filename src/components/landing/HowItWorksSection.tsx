
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Upload your resume or LinkedIn profile",
    description: "Start by uploading your existing resume or connecting your LinkedIn profile to extract your professional information.",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
  },
  {
    number: "02",
    title: "Choose what you want to create",
    description: "Select from portfolio website, optimized resume, cover letter, or prepare for interviews with our AI tools.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
  },
  {
    number: "03",
    title: "Customize and refine with AI assistance",
    description: "Fine-tune your content with our AI assistant that helps highlight your strengths and matches job requirements.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
  },
  {
    number: "04",
    title: "Download, publish, or share your results",
    description: "Export your optimized materials in various formats or publish your portfolio site with a custom domain.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 bg-white" id="how-it-works">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-portfolioai-primary">
            How PortfolioAI Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Four simple steps to transform your career materials with the power of AI
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
