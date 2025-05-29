/**
 * Resume Optimizer Page Component
 * -----------------------------
 * This page allows users to analyze and optimize their resume against a target job description.
 * It provides AI-powered analysis of strengths, weaknesses, and improvement suggestions.
 * 
 * Features:
 * - Resume file upload
 * - Job description input
 * - AI-powered analysis
 * - Real-time feedback
 * - Detailed improvement suggestions
 */

// Import necessary components and utilities
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Search, Upload, Target } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/config";

/**
 * Interface for the analysis result from the API
 */
interface AnalysisResult {
  status: string;
  analysis: {
    strengths: string;
    weaknesses: string;
    suggestions: string;
  };
}

/**
 * ResumeOptimizer Component
 * 
 * Provides a user interface for uploading a resume and analyzing it against a job description.
 * Displays analysis results including strengths, weaknesses, and improvement suggestions.
 * 
 * @returns {JSX.Element} The resume optimizer page
 */
const ResumeOptimizer = () => {
  // State management
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  /**
   * Handles file selection for resume upload
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  /**
   * Handles the resume optimization process
   * Sends the resume and job description to the API for analysis
   */
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

      console.log("Sending request to analyze resume...");
      console.log("File:", resumeFile.name, "Size:", resumeFile.size);
      console.log("Job description length:", jobDescription.length);

      const response = await fetch(API_ENDPOINTS.ANALYZE_RESUME, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type header - let the browser set it with the boundary
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (data.status === "success") {
        setAnalysisResult(data);
        toast.success("Resume analysis complete!");
      } else {
        toast.error(data.message || "Analysis failed");
      }
    } catch (error) {
      console.error("Detailed error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <MainLayout>
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container">
          {/* Header section */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="mb-4">
              <Search className="h-12 w-12 text-portfolioai-accent mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-portfolioai-primary">AI Resume Optimizer</h1>
            <p className="mt-3 text-gray-600">
              Get real-time score, keyword gap analysis vs. target job description, and auto-rewrite suggestions
            </p>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resume upload card */}
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

            {/* Job description input card */}
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

          {/* Optimize button */}
          <div className="text-center mt-8">
            <Button 
              onClick={handleOptimize}
              disabled={isAnalyzing}
              className="bg-portfolioai-primary hover:bg-portfolioai-secondary px-8 py-3"
            >
              {isAnalyzing ? "Analyzing..." : "Optimize My Resume"}
            </Button>
          </div>

          {/* Loading state */}
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

          {/* Analysis results */}
          {analysisResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {/* Strengths card */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-600 whitespace-pre-wrap">
                    {analysisResult.analysis.strengths.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weaknesses card */}
              <Card>
                <CardHeader>
                  <CardTitle>Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-600 whitespace-pre-wrap">
                    {analysisResult.analysis.weaknesses.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions card */}
              <Card>
                <CardHeader>
                  <CardTitle>Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-600 whitespace-pre-wrap">
                    {analysisResult.analysis.suggestions.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </div>
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
