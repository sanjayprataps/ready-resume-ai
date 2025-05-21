
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Link } from "lucide-react";
import { toast } from "sonner";

const ResumeUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = (method: string) => {
    setIsLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
      
      toast.success("Resume uploaded successfully! Redirecting to analysis...");
      
      // In a real app, this would navigate to the next step
    }, 2000);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-portfolioai-primary">Upload Your Resume</CardTitle>
        <CardDescription>
          Choose how you'd like to share your professional information with us
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Upload File</span>
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span>LinkedIn</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Paste Text</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-gray-400 mb-4" />
              <p className="mb-2 text-sm text-gray-700">
                Drag & drop your resume here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supports PDF, DOCX, up to 5MB
              </p>
              <Input
                type="file"
                id="resume-file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById("resume-file")?.click()}
              >
                Choose File
              </Button>
              {file && (
                <div className="mt-4 text-sm text-gray-700">
                  Selected: {file.name}
                </div>
              )}
            </div>
            <Button 
              className="w-full bg-portfolioai-primary hover:bg-portfolioai-secondary"
              disabled={!file || isLoading} 
              onClick={() => handleUpload("file")}
            >
              {isLoading ? "Processing..." : "Upload & Continue"}
            </Button>
          </TabsContent>
          
          <TabsContent value="linkedin" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="linkedin-url" className="text-sm font-medium text-gray-700">
                LinkedIn Profile URL
              </label>
              <Input
                id="linkedin-url"
                placeholder="https://www.linkedin.com/in/yourprofile"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                We'll extract your experience, skills, and education from your public LinkedIn profile
              </p>
            </div>
            <Button 
              className="w-full bg-portfolioai-primary hover:bg-portfolioai-secondary"
              disabled={!linkedInUrl || isLoading} 
              onClick={() => handleUpload("linkedin")}
            >
              {isLoading ? "Processing..." : "Connect LinkedIn"}
            </Button>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="resume-text" className="text-sm font-medium text-gray-700">
                Paste your resume content
              </label>
              <Textarea
                id="resume-text"
                placeholder="Copy and paste your resume content here..."
                rows={10}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>
            <Button 
              className="w-full bg-portfolioai-primary hover:bg-portfolioai-secondary"
              disabled={!resumeText || isLoading} 
              onClick={() => handleUpload("text")}
            >
              {isLoading ? "Processing..." : "Process & Continue"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-gray-500 text-center">
          Your data is secure and never shared. We use it only to create your personalized career materials.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ResumeUploadForm;
