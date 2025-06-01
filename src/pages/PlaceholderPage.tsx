import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code } from "lucide-react";

const PlaceholderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const buttonName = location.state?.buttonName || "the button";

  return (
    <MainLayout>
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl font-bold text-portfolioai-primary">Coming Soon!</h1>
            <p className="mt-3 text-gray-600">
              This feature is currently under development. You clicked on {buttonName} which will be implemented soon.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Implementation Guide</CardTitle>
              <CardDescription>Steps to implement this feature</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">1. Create New Feature Page</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Create a new file in <code className="bg-gray-100 px-1 rounded">src/pages/</code> directory</li>
                    <li>Name it according to the feature (e.g., <code className="bg-gray-100 px-1 rounded">ResumeOptimizer.tsx</code>)</li>
                    <li>Use <code className="bg-gray-100 px-1 rounded">MainLayout</code> component as the base</li>
                    <li>Implement the feature's UI and functionality</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">2. Update Routing</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Open <code className="bg-gray-100 px-1 rounded">src/App.tsx</code></li>
                    <li>Import the new feature component at the top with other page imports</li>
                    <li>Replace the <code className="bg-gray-100 px-1 rounded">PlaceholderPage</code> route with your new component</li>
                    <li>Example:
                      <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
{`// Import the new component
import ResumeOptimizer from "./pages/ResumeOptimizer";

// In the Routes component
<Route path="/resume-optimizer" element={<ResumeOptimizer />} />`}
                      </pre>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">3. Update Navigation</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Open <code className="bg-gray-100 px-1 rounded">src/components/landing/FeaturesSection.tsx</code></li>
                    <li>Update the feature's route in the <code className="bg-gray-100 px-1 rounded">featuresData</code> object</li>
                    <li>Ensure the route matches the one defined in <code className="bg-gray-100 px-1 rounded">App.tsx</code></li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">4. Backend Integration</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Create a new Python file in the <code className="bg-gray-100 px-1 rounded">backend/</code> directory</li>
                    <li>Implement the required API endpoints</li>
                    <li>Update <code className="bg-gray-100 px-1 rounded">backend/main.py</code> to include new routes</li>
                    <li>Add any new dependencies to <code className="bg-gray-100 px-1 rounded">backend/requirements.txt</code></li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">5. Testing</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Test the feature's UI components</li>
                    <li>Test API integration</li>
                    <li>Test error handling</li>
                    <li>Test responsive design</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">6. Recent Fixes</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Remove any unused imports from <code className="bg-gray-100 px-1 rounded">App.tsx</code></li>
                    <li>Ensure all routes are properly defined in <code className="bg-gray-100 px-1 rounded">App.tsx</code></li>
                    <li>Verify that <code className="bg-gray-100 px-1 rounded">PlaceholderPage</code> is used for all unimplemented features</li>
                    <li>Check that the main routes (<code className="bg-gray-100 px-1 rounded">Index</code>, <code className="bg-gray-100 px-1 rounded">CareerCoach</code>, <code className="bg-gray-100 px-1 rounded">NotFound</code>) are properly configured</li>
                  </ul>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Button>
                  <Button onClick={() => window.open('https://github.com/your-repo', '_blank')} variant="outline">
                    <Code className="mr-2 h-4 w-4" />
                    View Source
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlaceholderPage; 