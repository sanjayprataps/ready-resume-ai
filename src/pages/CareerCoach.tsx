import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FileText, Download, Loader2, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/config";

interface CareerPath {
  role: string;
  fit: string;
  next_steps: string;
}

interface CareerAnalysis {
  career_summary: string;
  key_strengths: string[];
  areas_for_growth: string[];
  career_paths: string[];
  skill_development: string[];
  industry_opportunities: string[];
}

const CareerCoach = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Add console log to verify component rendering
  console.log("CareerCoach component rendered", {
    isAnalyzing,
    hasResumeFile: !!resumeFile,
    hasAnalysis: !!analysis,
    hasPdfUrl: !!pdfUrl
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change detected");
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      if (file.type !== "application/pdf") {
        console.error("Invalid file type:", file.type);
        toast.error("Please upload a PDF file");
        return;
      }
      
      setResumeFile(file);
      console.log("File stored in state");
    } else {
      console.log("No file selected");
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast.error("Please upload a resume first");
      return;
    }

    // Validate file type
    if (resumeFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    // Log file details
    console.log("File details:", {
      name: resumeFile.name,
      type: resumeFile.type,
      size: resumeFile.size
    });

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      // Log FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      console.log("Sending request to:", API_ENDPOINTS.ANALYZE_CAREER);
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(API_ENDPOINTS.ANALYZE_CAREER, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Received data:", data);

      if (data.status === "success" && data.analysis) {
        setAnalysis(data.analysis);
        
        // Convert base64 PDF to blob for preview if available
        if (data.pdf) {
          console.log("Converting PDF data...");
          try {
            const pdfBytes = atob(data.pdf);
            const pdfArray = new Uint8Array(pdfBytes.length);
            for (let i = 0; i < pdfBytes.length; i++) {
              pdfArray[i] = pdfBytes.charCodeAt(i);
            }
            const pdfBlob = new Blob([pdfArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            console.log("PDF URL created:", url);
          } catch (pdfError) {
            console.warn("Error creating PDF preview:", pdfError);
            setPdfUrl(null);
          }
        } else {
          console.warn("No PDF data received in response");
          setPdfUrl(null);
        }
        
        toast.success("Career analysis completed successfully!");
      } else {
        console.error("Analysis failed:", data.detail);
        throw new Error(data.detail || "Failed to analyze career");
      }
    } catch (error) {
      console.error("Error details:", error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error("Request timed out. Please try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to analyze career. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl) {
      toast.error("PDF report is not available. Please try analyzing your resume again.");
      return;
    }
    
    try {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "career-analysis.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Career analysis report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download the report. Please try again.");
    }
  };

  return (
    <MainLayout>
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="mb-4">
              <BrainCircuit className="h-12 w-12 text-portfolioai-accent mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-portfolioai-primary">AI Career Coach</h1>
            <p className="mt-3 text-gray-600">
              Get personalized career guidance, skill gap analysis, and actionable recommendations
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Upload your resume to receive personalized career guidance and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF only</p>
                    </div>
                    <input
                      id="resume-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {resumeFile && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Selected file: {resumeFile.name}
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!resumeFile || isAnalyzing}
                    className="bg-portfolioai-primary hover:bg-portfolioai-secondary px-8 py-3"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Career'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis && (
            <Card className="max-w-4xl mx-auto mt-8">
              <CardHeader>
                <CardTitle>Career Analysis Results</CardTitle>
                <CardDescription>
                  Your personalized career guidance and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Career Summary */}
                  <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold text-portfolioai-primary mb-4">Career Summary</h3>
                    <p className="text-gray-700">{analysis.career_summary}</p>
                  </div>

                  {/* Analysis Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 bg-green-50 p-6 rounded-lg border border-green-100">
                      <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Key Strengths
                      </h3>
                      <ul className="list-none space-y-2">
                        {analysis.key_strengths?.map((strength, index) => (
                          <li key={index} className="text-green-700 flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-100">
                      <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Areas for Growth
                      </h3>
                      <ul className="list-none space-y-2">
                        {analysis.areas_for_growth?.map((area, index) => (
                          <li key={index} className="text-blue-700 flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4 bg-amber-50 p-6 rounded-lg border border-amber-100">
                      <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Skill Development
                      </h3>
                      <ul className="list-none space-y-2">
                        {analysis.skill_development?.map((skill, index) => (
                          <li key={index} className="text-amber-700 flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4 bg-purple-50 p-6 rounded-lg border border-purple-100">
                      <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Industry Opportunities
                      </h3>
                      <ul className="list-none space-y-2">
                        {analysis.industry_opportunities?.map((opportunity, index) => (
                          <li key={index} className="text-purple-700 flex items-start gap-2">
                            <span className="text-purple-500">•</span>
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-portfolioai-primary flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Career Paths
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {analysis.career_paths?.map((path, index) => (
                        <div key={index} className="bg-gradient-to-r from-portfolioai-primary/5 to-portfolioai-secondary/5 p-6 rounded-lg border border-portfolioai-primary/10 hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-lg mb-3 text-portfolioai-primary">{path}</h4>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Download Button */}
                  {pdfUrl && (
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleDownloadPDF}
                        className="bg-portfolioai-primary hover:bg-portfolioai-secondary transition-colors"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Full Report
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CareerCoach; 