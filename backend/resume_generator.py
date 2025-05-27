"""
Resume Generator Core Logic
-------------------------
This file contains the core logic for generating professional resumes.
The actual API endpoints are defined in main.py.
"""

import os
import groq
from typing import Dict, List, Optional
from pydantic import BaseModel

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

    # Format experience entries
    exp_blocks = []
    for job in form_data.experience:
        block = f"Position: {job.job_title}\nCompany: {job.company}\nPeriod: {job.start_date} - {job.end_date}\nLocation: {job.location}\n"
        block += f"Description: {job.description}\n"
        if job.achievements:
            block += "Achievements:\n"
            for a in job.achievements:
                block += f"- {a}\n"
        exp_blocks.append(block)

    # Format education entries
    edu_blocks = []
    for edu in form_data.education:
        block = f"Degree: {edu.degree}\nInstitution: {edu.institution}\nGraduation: {edu.graduation_date}\nLocation: {edu.location}"
        if edu.gpa:
            block += f"\nGPA: {edu.gpa}"
        edu_blocks.append(block)

    # Format project entries
    project_blocks = []
    for p in form_data.projects:
        block = f"Title: {p.title}\nDescription: {p.description}"
        project_blocks.append(block)

    # Format skills
    technical_skills = [skill.strip() for skill in form_data.technical_skills.split(',') if skill.strip()]
    soft_skills = [skill.strip() for skill in form_data.soft_skills.split(',') if skill.strip()]

    # Return formatted prompt
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
        dict: Generated resume data
        
    Raises:
        Exception: If there's an error in resume generation
    """
    try:
        # Initialize Groq client
        client = groq.Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )

        # Format and send prompt to Groq
        prompt = format_input_for_prompt(resume_data)
        print("Sending prompt to Groq:", prompt)  # Debug log
        
        try:
            # Get completion from Groq
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
            
            # Process the response
            output_text = completion.choices[0].message.content.strip()
            print("Raw response from Groq:", output_text)  # Debug log
            
            if not output_text:
                raise ValueError("Empty response received from Groq API")
            
            # Clean the response if it contains markdown code blocks
            if "```json" in output_text:
                output_text = output_text.split("```json")[1].split("```")[0].strip()
            elif "```" in output_text:
                output_text = output_text.split("```")[1].split("```")[0].strip()
            
            print("Cleaned response:", output_text)  # Debug log
            
            try:
                # Parse and validate the JSON response
                import json
                resume_data = json.loads(output_text)
                
                # Debug log for education data
                print("Education data in response:", json.dumps(resume_data.get('education', []), indent=2))
                
                # Validate required fields
                required_fields = ["name", "summary", "experience", "education", "skills", "projects"]
                missing_fields = [field for field in required_fields if field not in resume_data]
                
                if missing_fields:
                    raise ValueError(f"Missing required fields in response: {', '.join(missing_fields)}")
                
                # Validate education data structure
                for edu in resume_data.get('education', []):
                    if 'dates' not in edu:
                        print(f"Warning: Missing dates in education entry: {edu}")
                        # Use graduation_date if available
                        if 'graduation_date' in edu:
                            edu['dates'] = edu['graduation_date']
                        else:
                            edu['dates'] = "Not specified"
                
                return {
                    "status": "success",
                    "resume": resume_data
                }
            except json.JSONDecodeError as e:
                print(f"JSON parsing error. Response text: {output_text}")
                raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
                
        except Exception as e:
            print(f"Groq API error: {str(e)}")
            raise ValueError(f"Groq API error: {str(e)}")
            
    except Exception as e:
        print(f"Error in generate_resume: {str(e)}")
        raise ValueError(f"Failed to generate resume: {str(e)}")