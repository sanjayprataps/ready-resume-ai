import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Book, Calendar, Mail, Mic, Search, Award, Link as LinkIcon, BrainCircuit, Target, PenTool, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Updated feature data for 3x3 grid
const featuresData = {
  heading: "Comprehensive Career Tools",
  subheading: "Everything you need to stand out in today's competitive job market, powered by advanced AI technology.",
  features: [
    // Row 1
    {
      name: "AI Resume Optimizer",
      description: "Real-time score, keyword gap analysis vs. target job description, and auto-rewrite suggestions.",
      icon: "Search",
      cta: "Optimize Now",
      route: "/resume-optimizer"
    },
    {
      name: "AI Resume Generator", 
      description: "Don't have a Resume or CV?, No problem! Generate a resume by answering guided questions.",
      icon: "FileText",
      cta: "Generate Resume",
      route: "/resume-generator"
    },
    {
      name: "AI Cover Letter Writer",
      description: "Get job-specific cover letters using job description and your resume data.",
      icon: "Mail",
      cta: "Write Cover Letter",
      route: "/cover-letter-writer"
    },
    // Row 2
    {
      name: "AI Portfolio Builder",
      description: "Accepts PDF/Word resume or guided Q&A to generate a responsive, host-ready site (custom subdomain + exportable HTML)",
      icon: "User",
      cta: "Build Portfolio",
      route: "/portfolio-generator"
    },
    {
      name: "AI Career Coach",
      description: "Get personalized career coaching and skill gap analysis.",
      icon: "BrainCircuit",
      cta: "Start Coaching",
      route: "/career-coach"
    },
    {
      name: "AI Interview Coach",
      description: "Get role specific interview practice with analysis and improvement tips.",
      icon: "Mic",
      cta: "Practice Interview",
      route: "/interview-coach"
    },
    // Row 3 - Full width job search
    {
      name: "AI Job Search and Tracker",
      description: "Get personalized right-fit Job recommendations with advanced matching algorithms and application tracking.",
      icon: "Calendar",
      cta: "Search Jobs",
      route: "/job-search",
      fullWidth: true
    }
  ]
};

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-6 w-6 text-portfolioai-accent" />,
  User: <User className="h-6 w-6 text-portfolioai-accent" />,
  Search: <Search className="h-6 w-6 text-portfolioai-accent" />,
  Calendar: <Calendar className="h-6 w-6 text-portfolioai-accent" />,
  Mail: <Mail className="h-6 w-6 text-portfolioai-accent" />,
  Mic: <Mic className="h-6 w-6 text-portfolioai-accent" />,
  BrainCircuit: <BrainCircuit className="h-6 w-6 text-portfolioai-accent" />
};

const FeatureCard = ({ feature }: { feature: any }) => {
  return (
    <Card className={`border border-gray-200 transition-all hover:shadow-md h-full flex flex-col ${feature.fullWidth ? 'col-span-full' : ''}`}>
      <CardHeader className="pb-4">
        <div className="mb-3">{iconMap[feature.icon] || <FileText className="h-6 w-6 text-portfolioai-accent" />}</div>
        <CardTitle className="text-lg font-semibold text-portfolioai-primary">{feature.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pt-0">
        <CardDescription className="text-gray-600 mb-4 text-sm flex-grow">{feature.description}</CardDescription>
        <Button className="w-full mt-auto" size="sm" asChild>
          <Link to={feature.route} state={{ buttonName: feature.cta }}>{feature.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const FeaturesSection = () => {
  const { heading, subheading, features } = featuresData;

  return (
    <section className="py-16 bg-gray-50" id="features">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-portfolioai-primary">
            {heading}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
