"""
Resume Generator Module
---------------------
This module handles the generation of professional resumes using AI. Key features include:

1. Data Models:
   - Structured data models for resume components
   - Validation using Pydantic
   - Type hints and documentation

2. Resume Generation:
   - AI-powered content generation using Groq LLM
   - Professional formatting and structure
   - Customizable templates
   - PDF generation with proper styling

3. Input Processing:
   - Structured data formatting
   - Skill categorization
   - Experience and education formatting
   - Project description handling

4. Output Formats:
   - JSON structured data
   - HTML formatted resume
   - PDF generation with proper styling
   - Base64 encoded PDF for download

5. Error Handling:
   - Input validation
   - API error handling
   - Retry mechanisms
   - Detailed error logging

The module uses Jinja2 for HTML templating and pdfkit for PDF generation,
ensuring professional and consistent output across different formats.
"""

import os
import groq
from typing import Dict, List, Optional
from pydantic import BaseModel
from jinja2 import Environment, FileSystemLoader
import json
import pdfkit
import tempfile
import base64
import time  # Add time module import

# Pydantic models for data structure
class Experience(BaseModel):
    """Model for work experience entries"""
    job_title: str
    company: str
    start_date: str
    end_date: str
    location: str
    description: str
    achievements: List[str]

class Education(BaseModel):
    """Model for education entries"""
    degree: str
    institution: str
    graduation_date: str
    location: str
    gpa: Optional[str] = None

class Project(BaseModel):
    """Model for project entries"""
    title: str
    description: str

class PersonalInfo(BaseModel):
    """Model for personal information"""
    full_name: str
    email: str
    phone: str
    location: str
    linkedin: Optional[str] = None
    website: Optional[str] = None
    summary: str

class ResumeData(BaseModel):
    """Main model for resume data structure"""
    personal_info: PersonalInfo
    experience: List[Experience]
    education: List[Education]
    technical_skills: str
    soft_skills: str
    projects: List[Project]

# Template for the prompt sent to Groq LLM
GROQ_PROMPT_TEMPLATE = """
You are a resume generation expert. Based on the user's input below, create a structured and professional resume. 
Use action verbs, quantify achievements where possible, and format in standard US resume format.

## Personal Information:
Name: {name}
Email: {email}
Phone: {phone}
Location: {location}{linkedin}{website}
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

IMPORTANT: The input contains multiple entries for experience, education, and projects. Each entry is numbered and should be processed as a separate item in the output JSON arrays.
Output a JSON with the following keys: name, summary, experience, education, skills, and projects.
Use bullet points where needed. Return only valid JSON.
"""

# Initialize Jinja2 environment
template_dir = os.path.join(os.path.dirname(__file__), 'templates')
env = Environment(loader=FileSystemLoader(template_dir))

def generate_resume_html(resume_data: Dict) -> str:
    """
    Generate HTML resume using Jinja2 template.
    
    Args:
        resume_data (Dict): The structured resume data
        
    Returns:
        str: Generated HTML resume
    """
    template = env.get_template('resume_template.html')
    return template.render(resume=resume_data)

def format_input_for_prompt(form_data: ResumeData) -> str:
    """
    Format the input data into a structured prompt for the LLM.
    
    Args:
        form_data (ResumeData): The structured resume data from the user
        
    Returns:
        str: Formatted prompt string for the LLM
    """
    # Format personal info
    personal_info = form_data.personal_info
    linkedin = f"\nLinkedIn: {personal_info.linkedin}" if personal_info.linkedin else ""
    website = f"\nWebsite: {personal_info.website}" if personal_info.website else ""

    # Format experience entries with clear numbering and structure
    exp_blocks = []
    for i, job in enumerate(form_data.experience, 1):
        block = f"Experience Entry {i}:\n"
        block += f"Position: {job.job_title}\n"
        block += f"Company: {job.company}\n"
        block += f"Period: {job.start_date} - {job.end_date}\n"
        block += f"Location: {job.location}\n"
        block += "Description:\n"
        # Split description into bullet points if it contains them
        if "●" in job.description:
            desc_points = [d.strip() for d in job.description.split("●") if d.strip()]
        else:
            desc_points = [job.description]
        for point in desc_points:
            block += f"- {point.strip()}\n"
        if job.achievements:
            block += "Achievements:\n"
            for a in job.achievements:
                if a.strip():  # Only add non-empty achievements
                    block += f"- {a.strip()}\n"
        exp_blocks.append(block)

    # Format education entries with clear numbering and structure
    edu_blocks = []
    for i, edu in enumerate(form_data.education, 1):
        block = f"Education Entry {i}:\n"
        block += f"Degree: {edu.degree}\n"
        block += f"Institution: {edu.institution}\n"
        block += f"Graduation: {edu.graduation_date}\n"
        block += f"Location: {edu.location}"
        if edu.gpa:
            block += f"\nGPA: {edu.gpa}"
        edu_blocks.append(block)

    # Format project entries with clear numbering and structure
    project_blocks = []
    for i, p in enumerate(form_data.projects, 1):
        block = f"Project Entry {i}:\n"
        block += f"Title: {p.title}\n"
        block += f"Description: {p.description}"
        project_blocks.append(block)

    # Format skills with clear separation
    technical_skills = [skill.strip() for skill in form_data.technical_skills.split(',') if skill.strip()]
    soft_skills = [skill.strip() for skill in form_data.soft_skills.split(',') if skill.strip()]

    # Return formatted prompt with clear section headers
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

def generate_resume(resume_data: ResumeData):
    """
    Generate a professional resume using the Groq LLM API.
    
    Args:
        resume_data (ResumeData): The structured resume data from the user
        
    Returns:
        dict: Generated resume data and PDF
        
    Raises:
        Exception: If there's an error in resume generation
    """
    try:
        print("\n=== Starting Resume Generation ===")
        print("Input data:", resume_data.dict())
        
        # Initialize Groq client
        client = groq.Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        print("Groq client initialized")

        # Format and send prompt to Groq
        prompt = format_input_for_prompt(resume_data)
        print("\n=== Sending Prompt to Groq ===")
        print(prompt)
        
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Get completion from Groq
                completion = client.chat.completions.create(
                    model="meta-llama/llama-4-maverick-17b-128e-instruct",
                    messages=[
                        {
                            "role": "system", 
                            "content": """You are a resume writing assistant. Your task is to generate a professional resume in JSON format.
                                CRITICAL: You must ALWAYS return a valid JSON object with NO trailing commas, NO line breaks within strings, and NO markdown formatting.
                                
                                Required JSON structure:
                                {
                                    "name": string,
                                    "email": string,
                                    "phone": string,
                                    "location": string,
                                    "linkedin": string,
                                    "website": string,
                                    "summary": string,
                                    "experience": [
                                        {
                                            "company": string,
                                            "position": string,
                                            "location": string,
                                            "dates": string,
                                            "description": string[]
                                        }
                                    ],
                                    "education": [
                                        {
                                            "degree": string,
                                            "institution": string,
                                            "location": string,
                                            "dates": string,
                                            "gpa": string
                                        }
                                    ],
                                    "skills": {
                                        "technical": string[],
                                        "soft": string[]
                                    },
                                    "projects": [
                                        {
                                            "name": string,
                                            "description": string
                                        }
                                    ]
                                }"""
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7,
                    max_tokens=2000
                )
                
                # Extract and clean the response
                response_text = completion.choices[0].message.content
                cleaned_text = response_text.strip()
                
                # Remove markdown code block formatting if present
                if "```json" in cleaned_text:
                    cleaned_text = cleaned_text.split("```json")[1].split("```")[0].strip()
                elif "```" in cleaned_text:
                    cleaned_text = cleaned_text.split("```")[1].split("```")[0].strip()
                
                try:
                    # Parse and validate the JSON response
                    resume_json = json.loads(cleaned_text)
                    print("\n=== Parsed JSON ===")
                    print(json.dumps(resume_json, indent=2))
                    
                    # Validate required fields
                    required_fields = ["name", "summary", "experience", "education", "skills", "projects"]
                    missing_fields = [field for field in required_fields if field not in resume_json]
                    
                    if missing_fields:
                        raise ValueError(f"Missing required fields in response: {', '.join(missing_fields)}")
                    
                    # Generate HTML resume
                    print("\n=== Generating HTML ===")
                    html_resume = generate_resume_html(resume_json)
                    
                    # Convert HTML to PDF using pdfkit
                    print("\n=== Converting to PDF ===")
                    
                    # Create a temporary directory for PDF generation
                    with tempfile.TemporaryDirectory() as temp_dir:
                        temp_pdf_path = os.path.join(temp_dir, 'resume.pdf')
                        
                        # Configure pdfkit options
                        options = {
                            'page-size': 'A4',
                            'margin-top': '20mm',
                            'margin-right': '20mm',
                            'margin-bottom': '20mm',
                            'margin-left': '20mm',
                            'encoding': 'UTF-8',
                            'no-outline': None,
                            'quiet': '',
                            'enable-local-file-access': None
                        }
                        
                        try:
                            # Convert HTML to PDF
                            pdfkit.from_string(html_resume, temp_pdf_path, options=options)
                            
                            # Read the generated PDF and encode it as base64
                            with open(temp_pdf_path, 'rb') as pdf_file:
                                pdf_content = pdf_file.read()
                                pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
                            
                            print("\n=== Resume Generation Complete ===")
                            return {
                                "status": "success",
                                "resume": resume_json,
                                "html": html_resume,
                                "pdf": pdf_base64  # Return base64 encoded PDF
                            }
                            
                        except Exception as e:
                            print(f"\n=== PDF Generation Error ===")
                            print(f"Error: {str(e)}")
                            if retry_count < max_retries - 1:
                                time.sleep(1)  # Add a small delay between retries
                                retry_count += 1
                                continue
                            raise ValueError(f"Failed to generate PDF after {max_retries} attempts: {str(e)}")
                    
                except json.JSONDecodeError as e:
                    print(f"\n=== JSON Parse Error ===")
                    print(f"Error: {str(e)}")
                    print(f"Raw response: {response_text}")
                    print(f"Cleaned text: {cleaned_text}")
                    print(f"Problematic text: {cleaned_text[max(0, e.pos-50):min(len(cleaned_text), e.pos+50)]}")
                    raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
                
            except Exception as e:
                print(f"\n=== Attempt {retry_count + 1} Failed ===")
                print(f"Error: {str(e)}")
                retry_count += 1
                if retry_count == max_retries:
                    raise ValueError(f"All {max_retries} attempts failed to generate valid JSON: {str(e)}")
                time.sleep(1)  # Add a small delay between retries
                continue
            
    except Exception as e:
        print(f"\n=== Resume Generation Error ===")
        print(f"Error: {str(e)}")
        raise ValueError(f"Failed to generate resume: {str(e)}")