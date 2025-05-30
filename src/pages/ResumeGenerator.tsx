/**
 * Resume Generator Page Component
 * ------------------------------
 * This is the main component for the Resume Generator application. It provides a form interface
 * for users to input their resume information and generates a professional resume using AI.
 * 
 * Features:
 * - Multi-section form for resume data input
 * - Real-time validation
 * - Dynamic form fields for experience and education
 * - PDF generation and download
 * - Preview modal for generated resume
 * - Error handling and user feedback
 */

import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import { FileText, Link, User, Download, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { jsPDF } from "jspdf";
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

interface ResumeData {
  personal_info: PersonalInfo;
  experience: Experience[];
  education: Education[];
  technical_skills: string;
  soft_skills: string;
  projects: Project[];
}

interface ValidationError {
  field: string;
  message: string;
  index?: number;
}

interface GeneratedResume {
  name: string;
  title: string;
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    location: string;
    dates: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    dates: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  projects: Array<{
    name: string;
    description: string;
  }>;
  pdfUrl?: string;
}

const ResumeGenerator = () => {
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
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

  // Refs for scrolling to invalid fields
  const experienceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const educationRefs = useRef<(HTMLDivElement | null)[]>([]);

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    // Validate personal info
    if (!resumeData.personal_info.full_name) {
      errors.push({ field: 'full_name', message: 'Full name is required' });
    }
    if (!resumeData.personal_info.email) {
      errors.push({ field: 'email', message: 'Email is required' });
    }
    if (!resumeData.personal_info.phone) {
      errors.push({ field: 'phone', message: 'Phone number is required' });
    }
    if (!resumeData.personal_info.location) {
      errors.push({ field: 'location', message: 'Location is required' });
    }
    if (!resumeData.personal_info.summary) {
      errors.push({ field: 'summary', message: 'Professional summary is required' });
    }

    // Validate experience
    resumeData.experience.forEach((exp, index) => {
      if (!exp.job_title) {
        errors.push({ field: 'job_title', message: 'Job title is required', index });
      }
      if (!exp.company) {
        errors.push({ field: 'company', message: 'Company name is required', index });
      }
      if (!exp.start_date) {
        errors.push({ field: 'start_date', message: 'Start date is required', index });
      }
      if (!exp.end_date) {
        errors.push({ field: 'end_date', message: 'End date is required', index });
      }
      if (!exp.location) {
        errors.push({ field: 'location', message: 'Location is required', index });
      }
      if (!exp.description) {
        errors.push({ field: 'description', message: 'Job description is required', index });
      }
    });

    // Validate education
    resumeData.education.forEach((edu, index) => {
      if (!edu.degree) {
        errors.push({ field: 'degree', message: 'Degree is required', index });
      }
      if (!edu.institution) {
        errors.push({ field: 'institution', message: 'Institution is required', index });
      }
      if (!edu.graduation_date) {
        errors.push({ field: 'graduation_date', message: 'Graduation date is required', index });
      }
      if (!edu.location) {
        errors.push({ field: 'location', message: 'Location is required', index });
      }
    });

    // Validate skills
    if (!resumeData.technical_skills.trim()) {
      errors.push({ field: 'technical_skills', message: 'Technical skills are required' });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const scrollToError = (error: ValidationError) => {
    if (error.index !== undefined) {
      if (error.field.startsWith('job_') || error.field === 'company' || error.field === 'start_date' || 
          error.field === 'end_date' || error.field === 'location' || error.field === 'description') {
        experienceRefs.current[error.index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (error.field === 'degree' || error.field === 'institution' || 
                 error.field === 'graduation_date' || error.field === 'location') {
        educationRefs.current[error.index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (error.field === 'technical_skills') {
      document.getElementById('technical_skills')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleGenerate = async (method: string) => {
    if (method === "linkedin") {
      toast.error("LinkedIn import coming soon!");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      if (validationErrors.length > 0) {
        scrollToError(validationErrors[0]);
      }
      return;
    }

    setIsGenerating(true);
    try {
      console.log("Sending resume data:", resumeData);  // Debug log
      
      const response = await fetch(API_ENDPOINTS.GENERATE_RESUME, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"  // Request JSON response for preview
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      // Check if the response is a PDF
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/pdf")) {
        // Handle PDF download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${resumeData.personal_info.full_name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Resume generated and downloaded successfully!");
      } else {
        // Handle JSON response (for preview)
        const data = await response.json();
        if (data.status === "success") {
          // Convert base64 PDF to blob for preview
          if (data.pdf) {
            const pdfBytes = atob(data.pdf);
            const pdfArray = new Uint8Array(pdfBytes.length);
            for (let i = 0; i < pdfBytes.length; i++) {
              pdfArray[i] = pdfBytes.charCodeAt(i);
            }
            const pdfBlob = new Blob([pdfArray], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Store the PDF URL for later use
            setGeneratedResume({
              ...data.resume,
              pdfUrl
            });
          } else {
            setGeneratedResume(data.resume);
          }
          toast.success("Resume generated successfully!");
        } else {
          throw new Error(data.detail || "Failed to generate resume");
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate resume. Please try again.");
    } finally {
      setIsGenerating(false);
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
    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(error => 
      !(error.index === index && error.field === field)
    ));
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
    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(error => 
      !(error.index === index && error.field === field)
    ));
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

  const generatePDF = () => {
    if (!generatedResume) return;

    // Create PDF with A4 size
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    });

    // Set margins (in mm)
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = margin;
    const lineHeight = 7;

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, y: number, maxWidth: number) => {
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, margin, y);
      return y + (splitText.length * lineHeight);
    };

    // Helper function to check if content will fit on current page
    const willContentFit = (contentHeight: number) => {
      return yPos + contentHeight <= pageHeight - margin;
    };

    // Helper function to add new page
    const addNewPage = () => {
      doc.addPage();
      yPos = margin;
    };

    // Add name
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText(generatedResume.name, yPos, pageWidth - (2 * margin));
    
    // Add summary
    doc.setFontSize(12);
    yPos = addWrappedText(generatedResume.summary, yPos + 10, pageWidth - (2 * margin));

    // Add experience
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText('EXPERIENCE', yPos + 10, pageWidth - (2 * margin));
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    generatedResume.experience.forEach(exp => {
      // Check if we need a new page for this experience entry
      const estimatedHeight = 40; // Approximate height for an experience entry
      if (!willContentFit(estimatedHeight)) {
        addNewPage();
      }
      
      doc.setFont('helvetica', 'bold');
      yPos = addWrappedText(`${exp.position} at ${exp.company}`, yPos + 5, pageWidth - (2 * margin));
      
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`${exp.location} | ${exp.dates}`, yPos, pageWidth - (2 * margin));
      
      exp.description.forEach(desc => {
        if (!willContentFit(lineHeight * 2)) {
          addNewPage();
        }
        yPos = addWrappedText(`• ${desc}`, yPos + 5, pageWidth - (2 * margin));
      });
    });

    // Add education
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    // Check if we need a new page for education section
    if (!willContentFit(30)) {
      addNewPage();
    }
    yPos = addWrappedText('EDUCATION', yPos + 10, pageWidth - (2 * margin));
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    generatedResume.education.forEach(edu => {
      // Check if we need a new page for this education entry
      const estimatedHeight = 25; // Approximate height for an education entry
      if (!willContentFit(estimatedHeight)) {
        addNewPage();
      }
      
      doc.setFont('helvetica', 'bold');
      yPos = addWrappedText(edu.degree, yPos + 5, pageWidth - (2 * margin));
      
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`${edu.institution} | ${edu.location} | ${edu.dates}`, yPos, pageWidth - (2 * margin));
      
      if (edu.gpa) {
        yPos = addWrappedText(`GPA: ${edu.gpa}`, yPos, pageWidth - (2 * margin));
      }
    });

    // Add skills
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    // Check if we need a new page for skills section
    if (!willContentFit(30)) {
      addNewPage();
    }
    yPos = addWrappedText('SKILLS', yPos + 10, pageWidth - (2 * margin));
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const technicalSkills = Array.isArray(generatedResume.skills?.technical)
      ? generatedResume.skills.technical.join(', ')
      : generatedResume.skills?.technical || 'No technical skills listed';
    const softSkills = Array.isArray(generatedResume.skills?.soft)
      ? generatedResume.skills.soft.join(', ')
      : generatedResume.skills?.soft || 'No soft skills listed';
    
    yPos = addWrappedText(`Technical: ${technicalSkills}`, yPos + 5, pageWidth - (2 * margin));
    yPos = addWrappedText(`Soft: ${softSkills}`, yPos + 5, pageWidth - (2 * margin));

    // Add projects
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    // Check if we need a new page for projects section
    if (!willContentFit(30)) {
      addNewPage();
    }
    yPos = addWrappedText('PROJECTS', yPos + 10, pageWidth - (2 * margin));
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    generatedResume.projects.forEach(proj => {
      // Check if we need a new page for this project entry
      const estimatedHeight = 40; // Approximate height for a project entry
      if (!willContentFit(estimatedHeight)) {
        addNewPage();
      }
      
      doc.setFont('helvetica', 'bold');
      yPos = addWrappedText(proj.name, yPos + 5, pageWidth - (2 * margin));
      
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(proj.description, yPos, pageWidth - (2 * margin));
    });

    // Save the PDF
    doc.save(`${generatedResume.name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`);
  };

  const handleDownloadPDF = async () => {
    try {
      if (generatedResume?.pdfUrl) {
        // If we already have the PDF URL, use it
        const link = document.createElement("a");
        link.href = generatedResume.pdfUrl;
        link.download = `${resumeData.personal_info.full_name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Resume downloaded successfully!");
      } else {
        // Otherwise, request a new PDF
        const response = await fetch(API_ENDPOINTS.GENERATE_RESUME, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/pdf"  // Request PDF response
          },
          body: JSON.stringify(resumeData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${resumeData.personal_info.full_name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Resume downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error(error instanceof Error ? error.message : "Failed to download resume. Please try again.");
    }
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

          <Card className="max-w-4xl mx-auto">
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
                            {getFieldError('full_name') && (
                              <p className="text-red-500 text-sm">{getFieldError('full_name')?.message}</p>
                            )}
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
                            {getFieldError('email') && (
                              <p className="text-red-500 text-sm">{getFieldError('email')?.message}</p>
                            )}
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
                            {getFieldError('phone') && (
                              <p className="text-red-500 text-sm">{getFieldError('phone')?.message}</p>
                            )}
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
                            {getFieldError('location') && (
                              <p className="text-red-500 text-sm">{getFieldError('location')?.message}</p>
                            )}
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

                          <div className="space-y-2">
                            <Label htmlFor="website">Website/Portfolio (Optional)</Label>
                            <Input
                              id="website"
                              placeholder="www.johndoe.com"
                              value={resumeData.personal_info.website}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personal_info: { ...prev.personal_info, website: e.target.value }
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
                          {getFieldError('summary') && (
                            <p className="text-red-500 text-sm">{getFieldError('summary')?.message}</p>
                          )}
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
                        <Card 
                          key={index} 
                          className="p-4"
                          ref={el => experienceRefs.current[index] = el}
                        >
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
                          {validationErrors.filter(error => error.index === index).map((error, i) => (
                            <p key={i} className="text-red-500 text-sm mt-1">{error.message}</p>
                          ))}
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
                        <Card 
                          key={index} 
                          className="p-4"
                          ref={el => educationRefs.current[index] = el}
                        >
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
                          {validationErrors.filter(error => error.index === index).map((error, i) => (
                            <p key={i} className="text-red-500 text-sm mt-1">{error.message}</p>
                          ))}
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
                      {getFieldError('technical_skills') && (
                        <p className="text-red-500 text-sm">{getFieldError('technical_skills')?.message}</p>
                      )}
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

                    {/* Generate button */}
                    <div className="text-center mt-8">
                      <Button 
                        onClick={() => handleGenerate("guided")}
                        disabled={isGenerating}
                        className="bg-portfolioai-primary hover:bg-portfolioai-secondary px-8 py-3"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Generating...
                          </>
                        ) : (
                          'Generate Resume'
                        )}
                      </Button>
                    </div>

                    {/* Resume Preview */}
                    {generatedResume && (
                      <Card className="mt-8">
                        <CardHeader>
                          <CardTitle>Generated Resume</CardTitle>
                          <CardDescription>Review your generated resume below</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {/* PDF Preview */}
                            {generatedResume.pdfUrl && (
                              <div className="border rounded-lg overflow-hidden h-[800px]">
                                <iframe
                                  src={generatedResume.pdfUrl}
                                  className="w-full h-full"
                                  title="Resume Preview"
                                />
                              </div>
                            )}

                            {/* Download Button */}
                            <div className="flex justify-center">
                              <Button onClick={handleDownloadPDF}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
