
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah Johnson",
    position: "Frontend Developer",
    company: "Tech Innovate",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "PortfolioAI transformed my basic resume into a comprehensive portfolio that helped me stand out. I received interview calls from 3 top companies within a week!"
  },
  {
    name: "Michael Chen",
    position: "Software Engineer",
    company: "DataSphere",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "The AI mock interviews were incredibly realistic and helped me prepare for tough technical questions. I'm now working at my dream company thanks to PortfolioAI."
  },
  {
    name: "Jessica Williams",
    position: "UX Designer",
    company: "Creative Solutions",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    quote: "I was skeptical about AI-written cover letters, but PortfolioAI created personalized letters that perfectly highlighted my experience for each job application."
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-gray-50" id="testimonials">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-portfolioai-primary">
            Success Stories
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See how PortfolioAI has helped early-career professionals land their dream jobs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">
                      {testimonial.position}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600">
                  <svg className="h-6 w-6 text-portfolioai-accent opacity-60 mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-gray-700">{testimonial.quote}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
