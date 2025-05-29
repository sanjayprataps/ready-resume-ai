'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, FileText, User, Plus, Trash2, Download, Eye, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { API_ENDPOINTS } from "@/config";

interface Experience {
  job_title: string;
  company: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  achievements: string[];
}

interface Education {
  degree: string;
  institution: string;
  graduation_date: string;
  location: string;
  gpa?: string;
}

interface Project {
  title: string;
  description: string;
}

interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  summary: string;
}

interface ValidationError {
  field: string;
  message: string;
  index?: number;
}

type PortfolioStyle = 'minimal' | 'creative' | 'professional';

export default function PortfolioGeneratorPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [resumeData, setResumeData] = useState({
    personal_info: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
      summary: ""
    },
    experience: [{
      job_title: "",
      company: "",
      start_date: "",
      end_date: "",
      location: "",
      description: "",
      achievements: [""]
    }],
    education: [{
      degree: "",
      institution: "",
      graduation_date: "",
      location: "",
      gpa: ""
    }],
    technical_skills: "",
    soft_skills: "",
    projects: []
  });
  const [selectedStyle, setSelectedStyle] = useState<PortfolioStyle>('professional');

  const handleSubmit = async () => {
    if (activeTab === "upload") {
      if (!resumeFile) {
        toast.error('Please upload a resume file.');
        return;
      }

      const formData = new FormData();
      formData.append('method', 'upload');
      formData.append('resume', resumeFile);
      formData.append('style', selectedStyle);

      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.GENERATE_PORTFOLIO, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to generate portfolio: ${errorData}`);
        }

        const result = await response.json();
        if (result.status === "success") {
          // Create a blob from the HTML content
          const blob = new Blob([result.portfolio.html], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          setDownloadUrl(url);
          toast.success("Portfolio generated successfully!");
        } else {
          throw new Error(result.detail || "Failed to generate portfolio");
        }
      } catch (err) {
        console.error("Error generating portfolio:", err);
        toast.error(err instanceof Error ? err.message : "Failed to generate portfolio. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Guided input method
      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        if (validationErrors.length > 0) {
          scrollToError(validationErrors[0]);
        }
        return;
      }

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('method', 'guided');
        formData.append('portfolio_data', JSON.stringify(resumeData));
        formData.append('style', selectedStyle);

        const response = await fetch(API_ENDPOINTS.GENERATE_PORTFOLIO, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to generate portfolio: ${errorData}`);
        }

        const result = await response.json();
        if (result.status === "success") {
          // Create a blob from the HTML content
          const blob = new Blob([result.portfolio.html], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          setDownloadUrl(url);
          toast.success("Portfolio generated successfully!");
        } else {
          throw new Error(result.detail || "Failed to generate portfolio");
        }
      } catch (err) {
        console.error("Error generating portfolio:", err);
        toast.error(err instanceof Error ? err.message : "Failed to generate portfolio. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleAddExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        job_title: "",
        company: "",
        start_date: "",
        end_date: "",
        location: "",
        description: "",
        achievements: [""]
      }]
    }));
  };

  const handleAddEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: "",
        institution: "",
        graduation_date: "",
        location: "",
        gpa: ""
      }]
    }));
  };

  const handleAddProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        title: "",
        description: ""
      }]
    }));
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = {
        ...newExperience[index],
        [field]: value
      };
      return { ...prev, experience: newExperience };
    });
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setResumeData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value
      };
      return { ...prev, education: newEducation };
    });
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    setResumeData(prev => {
      const newProjects = [...prev.projects];
      newProjects[index] = {
        ...newProjects[index],
        [field]: value
      };
      return { ...prev, projects: newProjects };
    });
  };

  const getFieldError = (field: string, index?: number) => {
    return validationErrors.find(error => error.field === field && error.index === index);
  };

  const validateForm = () => {
    // Implement form validation logic here
    return true; // Placeholder return, actual implementation needed
  };

  const scrollToError = (error: ValidationError) => {
    // Implement scrolling logic to the error field
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `portfolio_${resumeData.personal_info.full_name.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <MainLayout>
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container">
          {/* Header section */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="mb-4">
              <User className="h-12 w-12 text-portfolioai-accent mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-portfolioai-primary">AI Portfolio Generator</h1>
            <p className="mt-3 text-gray-600">
              Create a professional portfolio website from your resume or guided input
            </p>
          </div>

          {/* Main content */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Choose Your Method</CardTitle>
              <CardDescription>Select how you'd like to generate your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-8">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Resume
                  </TabsTrigger>
                  <TabsTrigger value="guided" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Guided Questions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-6">
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
                </TabsContent>

                <TabsContent value="guided" className="space-y-6">
                  <div className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Personal Information</h3>
                      <Card className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                              id="full_name"
                              placeholder="John Doe"
                              value={resumeData.personal_info.full_name}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personal_info: { ...prev.personal_info, full_name: e.target.value }
                              }))}
                              className={cn(getFieldError('full_name') && "border-red-500")}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@example.com"
                              value={resumeData.personal_info.email}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personal_info: { ...prev.personal_info, email: e.target.value }
                              }))}
                              className={cn(getFieldError('email') && "border-red-500")}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              placeholder="(555) 123-4567"
                              value={resumeData.personal_info.phone}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personal_info: { ...prev.personal_info, phone: e.target.value }
                              }))}
                              className={cn(getFieldError('phone') && "border-red-500")}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                              id="location"
                              placeholder="City, State"
                              value={resumeData.personal_info.location}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personal_info: { ...prev.personal_info, location: e.target.value }
                              }))}
                              className={cn(getFieldError('location') && "border-red-500")}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn Profile (Optional)</Label>
                            <Input
                              id="linkedin"
                              placeholder="linkedin.com/in/johndoe"
                              value={resumeData.personal_info.linkedin}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personal_info: { ...prev.personal_info, linkedin: e.target.value }
                              }))}
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label htmlFor="summary">Professional Summary *</Label>
                          <Textarea
                            id="summary"
                            placeholder="Write a brief summary of your professional background and career goals..."
                            value={resumeData.personal_info.summary}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personal_info: { ...prev.personal_info, summary: e.target.value }
                            }))}
                            rows={4}
                            className={cn(getFieldError('summary') && "border-red-500")}
                          />
                        </div>
                      </Card>
                    </div>

                    {/* Experience Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Work Experience</h3>
                        <Button variant="outline" onClick={handleAddExperience}>
                          Add Experience
                        </Button>
                      </div>
                      {resumeData.experience.map((exp, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              placeholder="Job Title"
                              value={exp.job_title}
                              onChange={(e) => handleExperienceChange(index, "job_title", e.target.value)}
                              className={cn(getFieldError('job_title', index) && "border-red-500")}
                            />
                            <Input
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                              className={cn(getFieldError('company', index) && "border-red-500")}
                            />
                            <Input
                              placeholder="Start Date"
                              value={exp.start_date}
                              onChange={(e) => handleExperienceChange(index, "start_date", e.target.value)}
                              className={cn(getFieldError('start_date', index) && "border-red-500")}
                            />
                            <Input
                              placeholder="End Date"
                              value={exp.end_date}
                              onChange={(e) => handleExperienceChange(index, "end_date", e.target.value)}
                              className={cn(getFieldError('end_date', index) && "border-red-500")}
                            />
                            <Input
                              placeholder="Location"
                              value={exp.location}
                              onChange={(e) => handleExperienceChange(index, "location", e.target.value)}
                              className={cn(getFieldError('location', index) && "border-red-500")}
                            />
                          </div>
                          <div className="mt-4">
                            <Textarea
                              placeholder="Job Description"
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                              rows={3}
                              className={cn("w-full", getFieldError('description', index) && "border-red-500")}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Education Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Education</h3>
                        <Button variant="outline" onClick={handleAddEducation}>
                          Add Education
                        </Button>
                      </div>
                      {resumeData.education.map((edu, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                              className={cn(getFieldError('degree', index) && "border-red-500")}
                            />
                            <Input
                              placeholder="Institution"
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                              className={cn(getFieldError('institution', index) && "border-red-500")}
                            />
                            <Input
                              placeholder="Graduation Date"
                              value={edu.graduation_date}
                              onChange={(e) => handleEducationChange(index, "graduation_date", e.target.value)}
                              className={cn(getFieldError('graduation_date', index) && "border-red-500")}
                            />
                            <Input
                              placeholder="Location"
                              value={edu.location}
                              onChange={(e) => handleEducationChange(index, "location", e.target.value)}
                              className={cn(getFieldError('location', index) && "border-red-500")}
                            />
                            <Input
                              placeholder="GPA (optional)"
                              value={edu.gpa}
                              onChange={(e) => handleEducationChange(index, "gpa", e.target.value)}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Skills</h3>
                      <Textarea
                        id="technical_skills"
                        placeholder="Technical Skills (e.g., Python, JavaScript, React)"
                        value={resumeData.technical_skills}
                        onChange={(e) => setResumeData(prev => ({ ...prev, technical_skills: e.target.value }))}
                        rows={3}
                        className={cn(getFieldError('technical_skills') && "border-red-500")}
                      />
                      <Textarea
                        placeholder="Soft Skills (e.g., Leadership, Communication, Teamwork)"
                        value={resumeData.soft_skills}
                        onChange={(e) => setResumeData(prev => ({ ...prev, soft_skills: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    {/* Projects Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Projects</h3>
                        <Button variant="outline" onClick={handleAddProject}>
                          Add Project
                        </Button>
                      </div>
                      {resumeData.projects.map((project, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-4">
                            <Input
                              placeholder="Project Title"
                              value={project.title}
                              onChange={(e) => handleProjectChange(index, "title", e.target.value)}
                            />
                            <Textarea
                              placeholder="Project Description"
                              value={project.description}
                              onChange={(e) => handleProjectChange(index, "description", e.target.value)}
                              rows={3}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Generate button */}
          <div className="text-center mt-8">
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-portfolioai-primary hover:bg-portfolioai-secondary px-8 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Generating...
                </>
              ) : (
                'Generate Portfolio'
              )}
            </Button>
          </div>

          {/* Style Selection */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-center mb-6">Choose Your Portfolio Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Minimal Style Card */}
              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg",
                  selectedStyle === 'minimal' && "ring-2 ring-portfolioai-primary"
                )}
                onClick={() => setSelectedStyle('minimal')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Minimal
                  </CardTitle>
                  <CardDescription>Clean and simple design with focus on content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Creative Style Card */}
              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg",
                  selectedStyle === 'creative' && "ring-2 ring-portfolioai-primary"
                )}
                onClick={() => setSelectedStyle('creative')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Creative
                  </CardTitle>
                  <CardDescription>Bold and unique design with artistic elements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Style Card */}
              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg",
                  selectedStyle === 'professional' && "ring-2 ring-portfolioai-primary"
                )}
                onClick={() => setSelectedStyle('professional')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Professional
                  </CardTitle>
                  <CardDescription>Polished and corporate design for business focus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Portfolio Preview */}
          {downloadUrl && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Portfolio Preview</CardTitle>
                <CardDescription>Review your generated portfolio website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* HTML Preview */}
                  <div className="border rounded-lg overflow-hidden h-[600px]">
                    <iframe
                      src={downloadUrl}
                      className="w-full h-full"
                      title="Portfolio Preview"
                    />
                  </div>
                  
                  {/* Download Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleDownload}
                      className="bg-portfolioai-primary hover:bg-portfolioai-secondary"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download HTML
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
