/**
 * Job Search Page Component
 * ------------------------
 * This page allows users to search for jobs using either keywords or by uploading their resume.
 * It provides AI-powered job matching and recommendations.
 */

import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Search, Upload, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobMatch {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  match_score: number;
  url: string;
}

const JobSearch = () => {
  // State for keyword search
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [isKeywordSearching, setIsKeywordSearching] = useState(false);
  const [keywordResults, setKeywordResults] = useState<JobMatch[]>([]);

  // State for resume-based search
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isResumeSearching, setIsResumeSearching] = useState(false);
  const [resumeResults, setResumeResults] = useState<JobMatch[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleKeywordSearch = async () => {
    if (!keywords.trim()) {
      toast.error("Please enter keywords for job search");
      return;
    }

    setIsKeywordSearching(true);
    try {
      console.log("Sending keyword search request...");
      const response = await fetch(API_ENDPOINTS.SEARCH_JOBS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords,
          location: location.trim() || undefined,
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Failed to search jobs");
      }

      if (!data.jobs || data.jobs.length === 0) {
        toast.info("No matching jobs found. Try adjusting your search criteria.");
        setKeywordResults([]);
      } else {
        setKeywordResults(data.jobs);
        toast.success(`Found ${data.jobs.length} matching jobs!`);
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search jobs. Please try again.");
    } finally {
      setIsKeywordSearching(false);
    }
  };

  const handleResumeSearch = async () => {
    if (!resumeFile) {
      toast.error("Please upload your resume");
      return;
    }

    setIsResumeSearching(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      console.log("Sending resume search request...");
      const response = await fetch(API_ENDPOINTS.SEARCH_JOBS_BY_RESUME, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Failed to search jobs");
      }

      if (!data.jobs || data.jobs.length === 0) {
        toast.info("No matching jobs found. Try adjusting your search criteria.");
        setResumeResults([]);
      } else {
        setResumeResults(data.jobs);
        toast.success(`Found ${data.jobs.length} matching jobs!`);
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search jobs. Please try again.");
    } finally {
      setIsResumeSearching(false);
    }
  };

  const JobCard = ({ job }: { job: JobMatch }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-portfolioai-primary">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
            <p className="text-sm text-gray-500">{job.location}</p>
          </div>
          <div className="text-right">
            {job.salary && (
              <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {job.salary}
              </div>
            )}
          </div>
        </div>
        <p className="mt-4 text-gray-700 line-clamp-3">{job.description}</p>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            className="text-portfolioai-primary hover:text-portfolioai-secondary"
            onClick={() => window.open(job.url, '_blank')}
          >
            View Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="mb-4">
              <Briefcase className="h-12 w-12 text-portfolioai-accent mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-portfolioai-primary">AI Job Search</h1>
            <p className="mt-3 text-gray-600">
              Get personalized job matches by matching to keywords or your Resume data.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Search Jobs</CardTitle>
              <CardDescription>Choose your preferred search method</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="keyword" className="w-full">
                <TabsList className="grid grid-cols-2 mb-8">
                  <TabsTrigger value="keyword" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Keyword Search
                  </TabsTrigger>
                  <TabsTrigger value="resume" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Resume-Based Search
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="keyword" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Keywords</label>
                      <Input
                        placeholder="e.g., Software Engineer, Python, React"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location (Optional)</label>
                      <Input
                        placeholder="e.g., New York, Remote"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleKeywordSearch}
                    disabled={isKeywordSearching}
                    className="w-full bg-portfolioai-primary hover:bg-portfolioai-secondary"
                  >
                    {isKeywordSearching ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Searching...
                      </>
                    ) : (
                      'Search Jobs'
                    )}
                  </Button>

                  {keywordResults.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h3 className="text-lg font-semibold">Matching Jobs</h3>
                      {keywordResults.map((job, index) => (
                        <JobCard key={index} job={job} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="resume" className="space-y-6">
                  <div className="space-y-4">
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
                        Upload Resume
                      </Button>
                      {resumeFile && (
                        <p className="mt-2 text-sm text-gray-600">Selected: {resumeFile.name}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleResumeSearch}
                    disabled={isResumeSearching || !resumeFile}
                    className="w-full bg-portfolioai-primary hover:bg-portfolioai-secondary"
                  >
                    {isResumeSearching ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Searching...
                      </>
                    ) : (
                      'Find Matching Jobs'
                    )}
                  </Button>

                  {resumeResults.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h3 className="text-lg font-semibold">Matching Jobs</h3>
                      {resumeResults.map((job, index) => (
                        <JobCard key={index} job={job} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobSearch; 