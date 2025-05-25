import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Search, Upload, Target } from "lucide-react";
import { toast } from "sonner";

interface AnalysisResult {
  status: string;
  analysis: {
    strengths: string;
    weaknesses: string;
    suggestions: string;
  };
}

const ResumeOptimizer = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleOptimize = async () => {
    if (!resumeFile || !jobDescription) {
      toast.error("Please upload your resume and enter job description");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("job_description", jobDescription);

      const response = await fetch("http://localhost:8000/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setAnalysisResult(data);
        toast.success("Resume analysis complete!");
      } else {
        toast.error(data.message || "Analysis failed");
      }
    } catch (error) {
      toast.error("Failed to analyze resume. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <MainLayout>
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="mb-4">
              <Search className="h-12 w-12 text-portfolioai-accent mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-portfolioai-primary">AI Resume Optimizer</h1>
            <p className="mt-3 text-gray-600">
              Get real-time score, keyword gap analysis vs. target job description, and auto-rewrite suggestions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>Upload your current resume for analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById("resume-upload")?.click()}
                  >
                    Choose Resume File
                  </Button>
                  {resumeFile && (
                    <p className="mt-2 text-sm text-gray-600">Selected: {resumeFile.name}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste the target job description for analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the job description here..."
                  rows={8}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button 
              onClick={handleOptimize}
              disabled={isAnalyzing}
              className="bg-portfolioai-primary hover:bg-portfolioai-secondary px-8 py-3"
            >
              {isAnalyzing ? "Analyzing..." : "Optimize My Resume"}
            </Button>
          </div>

          {isAnalyzing && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <Target className="h-8 w-8 text-portfolioai-accent mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Analyzing your resume against job requirements...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Key Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-wrap">{analysisResult.analysis.strengths}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-wrap">{analysisResult.analysis.weaknesses}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-wrap">{analysisResult.analysis.suggestions}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ResumeOptimizer;
