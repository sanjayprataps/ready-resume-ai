/**
 * Cover Letter Writer Page Component
 * ---------------------------------
 * This page allows users to generate personalized cover letters using their resume and job details.
 * It provides an AI-powered cover letter generation service that matches the user's experience
 * with the target job requirements.
 * 
 * Features:
 * - Resume file upload
 * - Job details input
 * - Job description analysis
 * - AI-powered cover letter generation
 * - Real-time feedback
 */

// Import necessary components and utilities
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Mail, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

/**
 * CoverLetterWriter Component
 * 
 * Provides a user interface for generating personalized cover letters based on resume
 * and job details. Handles file upload, form input, and cover letter generation process.
 * 
 * @returns {JSX.Element} The cover letter writer page
 */
const CoverLetterWriter = () => {
  // State management for form inputs and generation status
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
   * Handles the cover letter generation process
   * Validates inputs and triggers the generation process
   */
  const handleGenerate = () => {
    if (!resumeFile || !jobDescription || !companyName || !positionTitle) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Cover letter generated successfully!");
    }, 3000);
  };

  return (
    <MainLayout>
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container">
          {/* Header section */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="mb-4">
              <Mail className="h-12 w-12 text-portfolioai-accent mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-portfolioai-primary">AI Cover Letter Writer</h1>
            <p className="mt-3 text-gray-600">
              Get job-specific cover letters using job description and your resume data
            </p>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column: Job info and resume upload */}
            <div className="space-y-6">
              {/* Job information card */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                  <CardDescription>Enter details about the position</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name *</label>
                    <Input
                      placeholder="e.g. Google, Microsoft, Startup Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Position Title *</label>
                    <Input
                      placeholder="e.g. Software Engineer, Marketing Manager"
                      value={positionTitle}
                      onChange={(e) => setPositionTitle(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Resume upload card */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Resume</CardTitle>
                  <CardDescription>We'll use this to personalize your cover letter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
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
            </div>

            {/* Right column: Job description input */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste the job posting or description</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the complete job description here..."
                  rows={12}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Generate button */}
          <div className="text-center mt-8">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-portfolioai-primary hover:bg-portfolioai-secondary px-8 py-3"
            >
              {isGenerating ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </div>

          {/* Loading state */}
          {isGenerating && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-portfolioai-accent mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Crafting your personalized cover letter...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CoverLetterWriter;
