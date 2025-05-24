
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FileText, Link, User } from "lucide-react";
import { toast } from "sonner";

const ResumeGenerator = () => {
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (method: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Resume generated successfully!");
    }, 3000);
  };

  return (
    <MainLayout>
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="mb-4">
              <FileText className="h-12 w-12 text-portfolioai-accent mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-portfolioai-primary">AI Resume Generator</h1>
            <p className="mt-3 text-gray-600">
              Don't have a Resume or CV? No problem! Import your LinkedIn profile or answer guided questions
            </p>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Choose Your Method</CardTitle>
              <CardDescription>Select how you'd like to generate your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="linkedin" className="w-full">
                <TabsList className="grid grid-cols-2 mb-8">
                  <TabsTrigger value="linkedin" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    LinkedIn Import
                  </TabsTrigger>
                  <TabsTrigger value="guided" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Guided Questions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="linkedin" className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">
                      LinkedIn Profile URL
                    </label>
                    <Input
                      placeholder="https://www.linkedin.com/in/yourprofile"
                      value={linkedInUrl}
                      onChange={(e) => setLinkedInUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      We'll extract your experience, skills, and education from your public LinkedIn profile
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleGenerate("linkedin")}
                    disabled={!linkedInUrl || isGenerating}
                    className="w-full bg-portfolioai-primary hover:bg-portfolioai-secondary"
                  >
                    {isGenerating ? "Generating..." : "Import from LinkedIn"}
                  </Button>
                </TabsContent>

                <TabsContent value="guided" className="space-y-6">
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Guided Resume Builder</h3>
                    <p className="text-gray-600 mb-4">
                      Answer a series of questions about your experience, skills, and career goals
                    </p>
                    <Button 
                      onClick={() => handleGenerate("guided")}
                      disabled={isGenerating}
                      className="bg-portfolioai-primary hover:bg-portfolioai-secondary"
                    >
                      {isGenerating ? "Generating..." : "Start Guided Questions"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResumeGenerator;
