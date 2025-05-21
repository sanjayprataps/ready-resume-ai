
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Book, Calendar, Mail, Mic, Search, Award, Link } from "lucide-react";

const features = [
  {
    icon: <FileText className="h-8 w-8 text-portfolioai-accent" />,
    title: "AI Resume Optimization",
    description: "Transform your resume to be ATS-friendly and highlight your most relevant skills and experiences."
  },
  {
    icon: <User className="h-8 w-8 text-portfolioai-accent" />,
    title: "Portfolio Generator",
    description: "Create a professional portfolio website tailored to your career goals and accomplishments."
  },
  {
    icon: <Mail className="h-8 w-8 text-portfolioai-accent" />,
    title: "Cover Letter Creator",
    description: "Generate personalized cover letters that match job descriptions and highlight your qualifications."
  },
  {
    icon: <Mic className="h-8 w-8 text-portfolioai-accent" />,
    title: "AI Mock Interviews",
    description: "Practice interviews with our AI interviewer and receive instant feedback to improve your performance."
  },
  {
    icon: <Search className="h-8 w-8 text-portfolioai-accent" />,
    title: "Job Match Analysis",
    description: "Get AI-powered insights on how well your profile matches specific job descriptions."
  },
  {
    icon: <Award className="h-8 w-8 text-portfolioai-accent" />,
    title: "Skills Assessment",
    description: "Identify your strengths and areas for improvement with our comprehensive skills analysis."
  },
  {
    icon: <Calendar className="h-8 w-8 text-portfolioai-accent" />,
    title: "Interview Scheduler",
    description: "Schedule and prepare for upcoming interviews with personalized preparation plans."
  },
  {
    icon: <Link className="h-8 w-8 text-portfolioai-accent" />,
    title: "LinkedIn Optimization",
    description: "Enhance your LinkedIn profile to attract recruiters and improve your visibility."
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-gray-50" id="features">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-portfolioai-primary">
            Comprehensive Career Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to stand out in today's competitive job market, powered by advanced AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 transition-all hover:shadow-md">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className="text-xl font-semibold text-portfolioai-primary">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
