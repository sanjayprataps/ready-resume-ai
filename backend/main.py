"""
Combined Resume Generator and Optimizer API
------------------------------------------
This file combines both the Resume Generator and Resume Optimizer functionality
into a single FastAPI application.
"""

import os
import groq
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import PyPDF2

# Load environment variables from .env file
load_dotenv()

# Verify API key is set
if not os.getenv("GROQ_API_KEY"):
    raise ValueError("GROQ_API_KEY environment variable is not set. Please set it in your .env file.")

# Initialize FastAPI application
app = FastAPI(title="Resume Services API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://id-preview--2b0cdaca-c7f6-45c8-beac-90c14d77ce88.lovable.app",
        "https://*.lovable.app"  # Allow all Lovable preview URLs
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import models from resume_generator.py
class Experience(BaseModel):
    job_title: str
    company: str
    start_date: str
    end_date: str
    location: str
    description: str
    achievements: List[str]

class Education(BaseModel):
    degree: str
    institution: str
    graduation_date: str
    location: str
    gpa: Optional[str] = None

class Project(BaseModel):
    title: str
    description: str

class PersonalInfo(BaseModel):
    full_name: str
    email: str
    phone: str
    location: str
    linkedin: Optional[str] = None
    website: Optional[str] = None
    summary: str

class ResumeData(BaseModel):
    personal_info: PersonalInfo
    experience: List[Experience]
    education: List[Education]
    technical_skills: str
    soft_skills: str
    projects: List[Project]

# Template for the resume generation prompt
GROQ_PROMPT_TEMPLATE = """
You are a resume generation expert. Based on the user's input below, create a structured and professional resume. 
Use action verbs, quantify achievements where possible, and format in standard US resume format.

## Personal Information:
Name: {name}
Email: {email}
Phone: {phone}
Location: {location}
LinkedIn: {linkedin}
Website: {website}
Summary: {summary}

## Experience:
{experience}

## Education:
{education}

## Technical Skills:
{technical_skills}

## Soft Skills:
{soft_skills}

## Projects:
{projects}

Output a JSON with the following keys: name, summary, experience, education, skills, and projects.
Use bullet points where needed. Return only valid JSON.
"""

def format_input_for_prompt(form_data: ResumeData) -> str:
    """Format the input data into a structured prompt for the LLM."""
    personal_info = form_data.personal_info
    linkedin = f"\nLinkedIn: {personal_info.linkedin}" if personal_info.linkedin else ""
    website = f"\nWebsite: {personal_info.website}" if personal_info.website else ""

    exp_blocks = []
    for job in form_data.experience:
        block = f"Position: {job.job_title}\nCompany: {job.company}\nPeriod: {job.start_date} - {job.end_date}\nLocation: {job.location}\n"
        block += f"Description: {job.description}\n"
        if job.achievements:
            block += "Achievements:\n"
            for a in job.achievements:
                block += f"- {a}\n"
        exp_blocks.append(block)

    edu_blocks = []
    for edu in form_data.education:
        block = f"Degree: {edu.degree}\nInstitution: {edu.institution}\nGraduation: {edu.graduation_date}\nLocation: {edu.location}"
        if edu.gpa:
            block += f"\nGPA: {edu.gpa}"
        edu_blocks.append(block)

    project_blocks = []
    for p in form_data.projects:
        block = f"Title: {p.title}\nDescription: {p.description}"
        project_blocks.append(block)

    technical_skills = [skill.strip() for skill in form_data.technical_skills.split(',') if skill.strip()]
    soft_skills = [skill.strip() for skill in form_data.soft_skills.split(',') if skill.strip()]

    return GROQ_PROMPT_TEMPLATE.format(
        name=personal_info.full_name,
        email=personal_info.email,
        phone=personal_info.phone,
        location=personal_info.location,
        linkedin=linkedin,
        website=website,
        summary=personal_info.summary,
        experience="\n\n".join(exp_blocks),
        education="\n\n".join(edu_blocks),
        technical_skills=", ".join(technical_skills),
        soft_skills=", ".join(soft_skills),
        projects="\n\n".join(project_blocks),
    )

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file."""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error in extract_text_from_pdf: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

def analyze_resume(resume_text: str, job_desc: str):
    """Analyze a resume against a job description."""
    try:
        client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        prompt = f"""
        Analyze the following resume against the job description:
        
        Resume:
        {resume_text}
        
        Job Description:
        {job_desc}
        
        Please provide:
        1. Key strengths matching the job requirements
        2. Areas of improvement or missing skills
        3. Specific suggestions to improve the resume
        """
        
        completion = client.chat.completions.create(
            model="deepseek-r1-distill-llama-70b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000
        )
        
        response_text = completion.choices[0].message.content
        return {
            "strengths": response_text.split("1.")[1].split("2.")[0].strip(),
            "weaknesses": response_text.split("2.")[1].split("3.")[0].strip(),
            "suggestions": response_text.split("3.")[1].strip()
        }
    except Exception as e:
        print(f"Error in analyze_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/generate-resume")
async def generate_resume(resume_data: ResumeData):
    """Generate a professional resume using the Groq LLM API."""
    try:
        client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))
        prompt = format_input_for_prompt(resume_data)
        
        completion = client.chat.completions.create(
            model="deepseek-r1-distill-llama-70b",
            messages=[
                {
                    "role": "system",
                    "content": """You are a resume writing assistant. Your task is to generate a professional resume in JSON format.
                    Always respond with a valid JSON object containing these exact keys: name, summary, experience, education, skills, and projects.
                    
                    For experience, each entry should have: company, position, location, dates, and description (as an array of bullet points).
                    For education, each entry should have: degree, institution, location, dates (use graduation_date as the dates value), and gpa (if provided).
                    For projects, each entry should have: name and description.
                    
                    For skills, use this exact format:
                    "skills": {
                        "technical": ["skill1", "skill2", "skill3"],
                        "soft": ["skill1", "skill2", "skill3"]
                    }
                    
                    Make sure to:
                    1. Split technical and soft skills into separate arrays
                    2. Convert comma-separated skills into array items
                    3. Remove any empty or whitespace-only skills
                    4. Preserve all skills exactly as provided in the input
                    
                    Do not include any text before or after the JSON object."""
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        output_text = completion.choices[0].message.content.strip()
        
        if not output_text:
            raise ValueError("Empty response received from Groq API")
        
        if "```json" in output_text:
            output_text = output_text.split("```json")[1].split("```")[0].strip()
        elif "```" in output_text:
            output_text = output_text.split("```")[1].split("```")[0].strip()
        
        import json
        resume_data = json.loads(output_text)
        
        required_fields = ["name", "summary", "experience", "education", "skills", "projects"]
        missing_fields = [field for field in required_fields if field not in resume_data]
        
        if missing_fields:
            raise ValueError(f"Missing required fields in response: {', '.join(missing_fields)}")
        
        for edu in resume_data.get('education', []):
            if 'dates' not in edu:
                if 'graduation_date' in edu:
                    edu['dates'] = edu['graduation_date']
                else:
                    edu['dates'] = "Not specified"
        
        return {
            "status": "success",
            "resume": resume_data
        }
    except Exception as e:
        print(f"Error in generate_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate resume: {str(e)}")

@app.post("/analyze-resume")
async def analyze_resume_endpoint(
    resume: UploadFile = File(description="Upload your resume in PDF format"),
    job_description: str = Form(description="Paste the job description here")
):
    """Analyze a resume against a job description."""
    try:
        if not resume.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        resume_text = extract_text_from_pdf(resume.file)
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF file")
        
        analysis = analyze_resume(resume_text, job_description)
        return JSONResponse(
            content={
                "status": "success",
                "analysis": analysis
            }
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint that returns API information."""
    return {
        "message": "Welcome to Resume Services API",
        "endpoints": {
            "generate_resume": "POST /generate-resume - Generate a professional resume",
            "analyze_resume": "POST /analyze-resume - Analyze a resume against a job description"
        }
    } 