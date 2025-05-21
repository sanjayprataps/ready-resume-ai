
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Book, Calendar, Mail, Mic, Search, Award, Link as LinkIcon } from "lucide-react";
import { getFeaturesData, Feature } from "@/lib/dataUtils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-8 w-8 text-portfolioai-accent" />,
  User: <User className="h-8 w-8 text-portfolioai-accent" />,
  Search: <Search className="h-8 w-8 text-portfolioai-accent" />,
  Calendar: <Calendar className="h-8 w-8 text-portfolioai-accent" />,
  Mail: <Mail className="h-8 w-8 text-portfolioai-accent" />,
  Mic: <Mic className="h-8 w-8 text-portfolioai-accent" />,
  Award: <Award className="h-8 w-8 text-portfolioai-accent" />,
  Link: <LinkIcon className="h-8 w-8 text-portfolioai-accent" />
};

const FeatureCard = ({ feature }: { feature: Feature }) => {
  return (
    <Card className="border border-gray-200 transition-all hover:shadow-md h-full flex flex-col">
      <CardHeader>
        <div className="mb-2">{iconMap[feature.icon] || <FileText className="h-8 w-8 text-portfolioai-accent" />}</div>
        <CardTitle className="text-xl font-semibold text-portfolioai-primary">{feature.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-gray-600 mb-4">{feature.description}</CardDescription>
        <ul className="space-y-2 mb-6">
          {feature.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-portfolioai-accent mr-2">•</span>
              <span className="text-sm text-gray-700">{bullet}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full mt-auto" asChild>
          <Link to="/upload-resume">{feature.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const FeaturesSection = () => {
  const { heading, subheading, features } = getFeaturesData();

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
