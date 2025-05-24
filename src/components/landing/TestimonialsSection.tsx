import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getTestimonialsData } from "@/lib/dataUtils";
const TestimonialsSection = () => {
  const {
    heading,
    subheading,
    testimonials
  } = getTestimonialsData();
  return <section className="py-16 bg-gray-50" id="testimonials">
      
    </section>;
};
export default TestimonialsSection;