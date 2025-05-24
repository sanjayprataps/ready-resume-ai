
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Book, Calendar, Mail, Mic, Search, Award, Link as LinkIcon } from "lucide-react";
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
      cta: "Optimize Now"
    },
    {
      name: "AI Resume Generator", 
      description: "Don't have a Resume or CV?, No problem! Import your LinkedIn profile to generate a resume OR Generate a resume by answering guided questions.",
      icon: "FileText",
      cta: "Generate Resume"
    },
    {
      name: "AI Cover Letter Writer",
      description: "Get job-specific cover letters using job description and your resume data.",
      icon: "Mail",
      cta: "Write Cover Letter"
    },
    // Row 2 - Placeholder content
    {
      name: "Portfolio Builder",
      description: "Create stunning portfolios that showcase your work and achievements.",
      icon: "User",
      cta: "Build Portfolio"
    },
    {
      name: "Interview Coach",
      description: "Practice interviews with AI-powered coaching and feedback.",
      icon: "Mic",
      cta: "Start Coaching"
    },
    {
      name: "Skills Assessment",
      description: "Identify skill gaps and get personalized learning recommendations.",
      icon: "Award",
      cta: "Assess Skills"
    },
    // Row 3 - Placeholder content
    {
      name: "Job Tracker",
      description: "Organize and track all your job applications in one place.",
      icon: "Calendar",
      cta: "Track Jobs"
    },
    {
      name: "LinkedIn Optimizer",
      description: "Optimize your LinkedIn profile for maximum visibility.",
      icon: "Link",
      cta: "Optimize Profile"
    },
    {
      name: "Salary Negotiator",
      description: "Get data-driven insights for salary negotiations.",
      icon: "Book",
      cta: "Get Insights"
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
  Award: <Award className="h-6 w-6 text-portfolioai-accent" />,
  Link: <LinkIcon className="h-6 w-6 text-portfolioai-accent" />
};

const FeatureCard = ({ feature }: { feature: any }) => {
  return (
    <Card className="border border-gray-200 transition-all hover:shadow-md h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="mb-3">{iconMap[feature.icon] || <FileText className="h-6 w-6 text-portfolioai-accent" />}</div>
        <CardTitle className="text-lg font-semibold text-portfolioai-primary">{feature.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <CardDescription className="text-gray-600 mb-4 text-sm">{feature.description}</CardDescription>
        <Button className="w-full mt-auto" size="sm" asChild>
          <Link to="/upload-resume">{feature.cta}</Link>
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
