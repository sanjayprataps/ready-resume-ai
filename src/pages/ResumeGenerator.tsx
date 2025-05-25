import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { FileText, Link, User, Plus } from "lucide-react";
import { toast } from "sonner";

interface WorkExperience {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  achievements: string[];
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa: string;
}

interface Project {
  id: number;
  description: string;
}

const ResumeGenerator = () => {
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Personal Information
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedInProfile, setLinkedInProfile] = useState("");
  const [website, setWebsite] = useState("");
  const [professionalSummary, setProfessionalSummary] = useState("");
  
  // Work Experience
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    {
      id: 1,
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      achievements: [""]
    }
  ]);
  
  // Education
  const [educations, setEducations] = useState<Education[]>([
    {
      id: 1,
      degree: "",
      institution: "",
      location: "",
      graduationDate: "",
      gpa: ""
    }
  ]);
  
  // Skills
  const [technicalSkills, setTechnicalSkills] = useState("");
  const [softSkills, setSoftSkills] = useState("");

  // Projects
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      description: ""
    }
  ]);

  const handleGenerate = (method: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Resume generated successfully!");
    }, 3000);
  };

  const addWorkExperience = () => {
    const newId = Math.max(...workExperiences.map(exp => exp.id)) + 1;
    setWorkExperiences([...workExperiences, {
      id: newId,
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      achievements: [""]
    }]);
  };

  const addEducation = () => {
    const newId = Math.max(...educations.map(edu => edu.id)) + 1;
    setEducations([...educations, {
      id: newId,
      degree: "",
      institution: "",
      location: "",
      graduationDate: "",
      gpa: ""
    }]);
  };

  const addProject = () => {
    const newId = Math.max(...projects.map(proj => proj.id)) + 1;
    setProjects([...projects, {
      id: newId,
      description: ""
    }]);
  };

  const updateWorkExperience = (id: number, field: string, value: string) => {
    setWorkExperiences(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const updateEducation = (id: number, field: string, value: string) => {
    setEducations(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const updateProject = (id: number, value: string) => {
    setProjects(prev => prev.map(proj => 
      proj.id === id ? { ...proj, description: value } : proj
    ));
  };

  const addAchievement = (experienceId: number) => {
    setWorkExperiences(prev => prev.map(exp => 
      exp.id === experienceId 
        ? { ...exp, achievements: [...exp.achievements, ""] }
        : exp
    ));
  };

  const updateAchievement = (experienceId: number, achievementIndex: number, value: string) => {
    setWorkExperiences(prev => prev.map(exp => 
      exp.id === experienceId 
        ? { 
            ...exp, 
            achievements: exp.achievements.map((achievement, index) => 
              index === achievementIndex ? value : achievement
            )
          }
        : exp
    ));
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

                <TabsContent value="guided" className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center text-portfolioai-primary">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Full Name *</label>
                        <Input
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email *</label>
                        <Input
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone *</label>
                        <Input
                          placeholder="(555) 123-4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Location *</label>
                        <Input
                          placeholder="City, State"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">LinkedIn Profile (Optional)</label>
                        <Input
                          placeholder="linkedin.com/in/johndoe"
                          value={linkedInProfile}
                          onChange={(e) => setLinkedInProfile(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Website/Portfolio (Optional)</label>
                        <Input
                          placeholder="www.johndoe.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Professional Summary</label>
                      <Textarea
                        placeholder="Write a compelling 2-3 sentence professional summary highlighting your expertise and career goals..."
                        rows={4}
                        className="resize-y"
                        value={professionalSummary}
                        onChange={(e) => setProfessionalSummary(e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Work Experience Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center text-portfolioai-primary">Work Experience</h2>
                    {workExperiences.map((experience) => (
                      <div key={experience.id} className="border border-gray-300 rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-medium text-gray-800">Experience Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Job Title</label>
                            <Input
                              placeholder="Software Engineer"
                              value={experience.jobTitle}
                              onChange={(e) => updateWorkExperience(experience.id, 'jobTitle', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Company</label>
                            <Input
                              placeholder="Acme Inc."
                              value={experience.company}
                              onChange={(e) => updateWorkExperience(experience.id, 'company', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Location</label>
                            <Input
                              placeholder="San Francisco, CA"
                              value={experience.location}
                              onChange={(e) => updateWorkExperience(experience.id, 'location', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Start Date</label>
                            <Input
                              placeholder="01/2022"
                              value={experience.startDate}
                              onChange={(e) => updateWorkExperience(experience.id, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">End Date</label>
                            <Input
                              placeholder="Present"
                              value={experience.endDate}
                              onChange={(e) => updateWorkExperience(experience.id, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Key Achievements</label>
                          {experience.achievements.map((achievement, index) => (
                            <div key={index} className="space-y-2">
                              <Textarea
                                placeholder="Led a team of 5 developers and increased productivity by 30%..."
                                rows={3}
                                className="resize-y"
                                value={achievement}
                                onChange={(e) => updateAchievement(experience.id, index, e.target.value)}
                              />
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addAchievement(experience.id)}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="text-center">
                      <Button variant="outline" onClick={addWorkExperience}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Education Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center text-portfolioai-primary">Education</h2>
                    {educations.map((education) => (
                      <div key={education.id} className="border border-gray-300 rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-medium text-gray-800">Education</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Degree</label>
                            <Input
                              placeholder="Bachelor of Science in Computer Science"
                              value={education.degree}
                              onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Institution</label>
                            <Input
                              placeholder="University of California"
                              value={education.institution}
                              onChange={(e) => updateEducation(education.id, 'institution', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Location</label>
                            <Input
                              placeholder="Berkeley, CA"
                              value={education.location}
                              onChange={(e) => updateEducation(education.id, 'location', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Graduation Date</label>
                            <Input
                              placeholder="05/2020"
                              value={education.graduationDate}
                              onChange={(e) => updateEducation(education.id, 'graduationDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">GPA (Optional)</label>
                            <Input
                              placeholder="3.8/4.0"
                              value={education.gpa}
                              onChange={(e) => updateEducation(education.id, 'gpa', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center">
                      <Button variant="outline" onClick={addEducation}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Skills Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center text-portfolioai-primary">Skills</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Technical Skills</label>
                        <Textarea
                          placeholder="JavaScript, Python, React, Node.js, AWS, Docker..."
                          rows={4}
                          className="resize-y"
                          value={technicalSkills}
                          onChange={(e) => setTechnicalSkills(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Soft Skills</label>
                        <Textarea
                          placeholder="Leadership, Communication, Problem Solving, Team Collaboration..."
                          rows={4}
                          className="resize-y"
                          value={softSkills}
                          onChange={(e) => setSoftSkills(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Projects Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center text-portfolioai-primary">Projects</h2>
                    {projects.map((project) => (
                      <div key={project.id} className="border border-gray-300 rounded-lg p-6 space-y-4 relative">
                        <h3 className="text-lg font-medium text-gray-800 absolute top-4 right-6">Project</h3>
                        <div className="mt-8">
                          <Textarea
                            placeholder="Developed a full-stack e-commerce platform using React and Node.js..."
                            rows={3}
                            className="resize-y"
                            value={project.description}
                            onChange={(e) => updateProject(project.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="text-center">
                      <Button variant="outline" onClick={addProject}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                      </Button>
                    </div>
                  </div>

                  <div className="text-center pt-6">
                    <Button 
                      onClick={() => handleGenerate("guided")}
                      disabled={isGenerating}
                      className="bg-portfolioai-primary hover:bg-portfolioai-secondary px-8 py-3 text-lg"
                    >
                      {isGenerating ? "Generating..." : "Generate Resume"}
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
