"""
Portfolio Generator Core Logic
----------------------------
This file contains the core logic for generating professional portfolio websites.
The actual API endpoints are defined in main.py.
"""

import os
import groq
from typing import Dict, List, Optional
from pydantic import BaseModel, validator
import PyPDF2
from fastapi import HTTPException
import re
from jinja2 import Environment, FileSystemLoader
import json

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

    @validator('linkedin')
    def validate_linkedin(cls, v):
        """Validate LinkedIn URL format"""
        if not v:
            return v
        # Add https:// if not present
        if not v.startswith(('http://', 'https://')):
            v = 'https://' + v
        # Remove www. if present
        v = v.replace('www.', '')
        # Validate the format
        if not re.match(r'^https?://linkedin\.com/in/[\w-]+/?$', v):
            raise ValueError('Invalid LinkedIn URL format')
        return v

    @validator('website')
    def validate_website(cls, v):
        """Validate website URL format"""
        if not v:
            return v
        # Add https:// if not present
        if not v.startswith(('http://', 'https://')):
            v = 'https://' + v
        return v

class PortfolioData(BaseModel):
    """Main model for portfolio data structure"""
    personal_info: PersonalInfo
    experience: List[Experience]
    education: List[Education]
    technical_skills: str
    soft_skills: str
    projects: List[Project]

# Template for the prompt sent to Groq LLM
GROQ_PROMPT_TEMPLATE = """
You are a portfolio website generation expert. Based on the user's input below, create a modern, professional portfolio website.
The website should be responsive, visually appealing, and highlight the user's professional achievements.

## Personal Information:
Name: {name}
Email: {email}
Phone: {phone}
Location: {location}
LinkedIn: {linkedin}
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

Generate a complete HTML portfolio website with the following sections:
1. Hero section with name, title, and professional summary
2. About section with personal information
3. Experience section with timeline
4. Education section
5. Skills section with visual representation
6. Projects section with cards
7. Contact section

Include modern CSS styling, responsive design, and smooth animations.
Use a clean, professional color scheme.
Return the complete HTML code with embedded CSS.
"""

def extract_text_from_pdf(pdf_file) -> str:
    """
    Extract text content from a PDF file.
    
    Args:
        pdf_file: The uploaded PDF file
        
    Returns:
        str: Extracted text from the PDF
        
    Raises:
        HTTPException: If there's an error processing the PDF
    """
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error in extract_text_from_pdf: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

def format_input_for_prompt(portfolio_data: PortfolioData) -> str:
    """
    Format the input data into a structured prompt for the LLM.
    
    Args:
        portfolio_data (PortfolioData): The structured portfolio data from the user
        
    Returns:
        str: Formatted prompt string for the LLM
    """
    # Format personal info
    personal_info = portfolio_data.personal_info
    linkedin = f"\nLinkedIn: {personal_info.linkedin}" if personal_info.linkedin else ""
    website = f"\nWebsite: {personal_info.website}" if personal_info.website else ""

    # Format experience entries
    exp_blocks = []
    for job in portfolio_data.experience:
        block = f"Position: {job.job_title}\nCompany: {job.company}\nPeriod: {job.start_date} - {job.end_date}\nLocation: {job.location}\n"
        block += f"Description: {job.description}\n"
        if job.achievements:
            block += "Achievements:\n"
            for a in job.achievements:
                block += f"- {a}\n"
        exp_blocks.append(block)

    # Format education entries
    edu_blocks = []
    for edu in portfolio_data.education:
        block = f"Degree: {edu.degree}\nInstitution: {edu.institution}\nGraduation: {edu.graduation_date}\nLocation: {edu.location}"
        if edu.gpa:
            block += f"\nGPA: {edu.gpa}"
        edu_blocks.append(block)

    # Format project entries
    project_blocks = []
    for p in portfolio_data.projects:
        block = f"Title: {p.title}\nDescription: {p.description}"
        project_blocks.append(block)

    # Format skills
    technical_skills = [skill.strip() for skill in portfolio_data.technical_skills.split(',') if skill.strip()]
    soft_skills = [skill.strip() for skill in portfolio_data.soft_skills.split(',') if skill.strip()]

    # Return formatted prompt
    return f"""
    Generate a professional portfolio website based on the following information:

    ## Personal Information:
    Name: {personal_info.full_name}
    Email: {personal_info.email}
    Phone: {personal_info.phone}
    Location: {personal_info.location}{linkedin}{website}
    Summary: {personal_info.summary}

    ## Experience:
    {chr(10).join(exp_blocks)}

    ## Education:
    {chr(10).join(edu_blocks)}

    ## Technical Skills:
    {', '.join(technical_skills)}

    ## Soft Skills:
    {', '.join(soft_skills)}

    ## Projects:
    {chr(10).join(project_blocks)}
    """

def generate_portfolio(portfolio_data: PortfolioData, style: str = 'professional'):
    """
    Generate a professional portfolio website using the Groq LLM API and Jinja2 templates.
    
    Args:
        portfolio_data (PortfolioData): The structured portfolio data from the user
        style (str): The portfolio style ('minimal', 'creative', or 'professional')
        
    Returns:
        dict: Generated portfolio HTML and assets
        
    Raises:
        Exception: If there's an error in portfolio generation
    """
    try:
        print("\n" + "="*50)
        print("STARTING PORTFOLIO GENERATION")
        print("="*50)
        
        # Log input data
        print("\n=== Input Data ===")
        print(f"Style: {style}")
        print("Portfolio Data:")
        print(json.dumps(portfolio_data.dict(), indent=2))
        
        # Initialize Groq client
        client = groq.Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        
        # Debug log for model verification
        print("\n=== Model Configuration ===")
        target_model = "meta-llama/llama-4-maverick-17b-128e-instruct"
        print(f"Attempting to use model: {target_model}")
        
        # Format and send prompt to Groq
        prompt = format_input_for_prompt(portfolio_data)
        print("\n=== Prompt to Groq ===")
        print(prompt)
        
        try:
            # Get completion from Groq
            completion = client.chat.completions.create(
                model=target_model,
                messages=[
                    {
                        "role": "system", 
                        "content": """You are a portfolio website generation expert. Your task is to generate a structured JSON 
                        representation of a portfolio website based on the user's input.
                        
                        Return a JSON object with the following structure:
                        {
                            "personal_info": {
                                "name": "Full Name",
                                "title": "Professional Title",
                                "email": "email@example.com",
                                "phone": "phone number",
                                "location": "location",
                                "linkedin": "linkedin url",
                                "website": "website url",
                                "summary": "professional summary"
                            },
                            "experience": [
                                {
                                    "title": "Job Title",
                                    "company": "Company Name",
                                    "period": "Start Date - End Date",
                                    "location": "Location",
                                    "description": "Job Description",
                                    "achievements": ["achievement 1", "achievement 2"]
                                }
                            ],
                            "education": [
                                {
                                    "degree": "Degree Name",
                                    "institution": "Institution Name",
                                    "period": "Graduation Date",
                                    "location": "Location",
                                    "gpa": "GPA if available"
                                }
                            ],
                            "skills": {
                                "technical": ["skill1", "skill2"],
                                "soft": ["skill1", "skill2"]
                            },
                            "projects": [
                                {
                                    "title": "Project Title",
                                    "description": "Project Description"
                                }
                            ]
                        }
                        
                        Important guidelines:
                        1. Return ONLY valid JSON
                        2. Keep descriptions concise but informative
                        3. Format dates consistently
                        4. Include all provided information
                        5. Structure arrays and objects properly
                        6. Use proper JSON syntax
                        7. Do not include any explanations or additional text
                        8. Preserve all experience and education entries exactly as provided
                        9. Convert comma-separated skills into arrays
                        10. Maintain the exact structure of achievements and projects"""
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent output
                max_tokens=2000
            )
            
            # Process the response
            if not hasattr(completion, 'choices') or not completion.choices:
                raise ValueError("No choices in Groq API response")
                
            if not hasattr(completion.choices[0], 'message'):
                raise ValueError("No message in Groq API response choice")
                
            if not hasattr(completion.choices[0].message, 'content'):
                raise ValueError("No content in Groq API response message")
            
            output_text = completion.choices[0].message.content.strip()
            print("\n=== Raw Response from Groq ===")
            print(output_text)
            
            if not output_text:
                raise ValueError("Empty response received from Groq API")
            
            # Clean the response if it contains markdown code blocks
            if "```json" in output_text:
                output_text = output_text.split("```json")[1].split("```")[0].strip()
            elif "```" in output_text:
                output_text = output_text.split("```")[1].split("```")[0].strip()
            
            print("\n=== Cleaned Response ===")
            print(output_text)
            
            # Parse the JSON response
            try:
                portfolio_json = json.loads(output_text)
                print("\n=== Parsed JSON ===")
                print(json.dumps(portfolio_json, indent=2))
            except json.JSONDecodeError as e:
                print(f"\n=== JSON Parse Error ===")
                print(f"Error: {str(e)}")
                print(f"Invalid JSON: {output_text}")
                raise ValueError(f"Failed to parse JSON response: {str(e)}")
            
            # Ensure all required fields are present
            required_fields = ["personal_info", "experience", "education", "skills", "projects"]
            missing_fields = [field for field in required_fields if field not in portfolio_json]
            if missing_fields:
                raise ValueError(f"Missing required fields in response: {', '.join(missing_fields)}")
            
            # Ensure arrays are properly formatted
            if not isinstance(portfolio_json["experience"], list):
                portfolio_json["experience"] = [portfolio_json["experience"]]
            if not isinstance(portfolio_json["education"], list):
                portfolio_json["education"] = [portfolio_json["education"]]
            if not isinstance(portfolio_json["projects"], list):
                portfolio_json["projects"] = [portfolio_json["projects"]]
            
            # Ensure skills are properly formatted
            if not isinstance(portfolio_json["skills"], dict):
                portfolio_json["skills"] = {"technical": [], "soft": []}
            if not isinstance(portfolio_json["skills"].get("technical", []), list):
                portfolio_json["skills"]["technical"] = [portfolio_json["skills"]["technical"]]
            if not isinstance(portfolio_json["skills"].get("soft", []), list):
                portfolio_json["skills"]["soft"] = [portfolio_json["skills"]["soft"]]
            
            # Ensure personal_info has all required fields
            required_personal_info = ["name", "title", "email", "phone", "location", "summary"]
            for field in required_personal_info:
                if field not in portfolio_json["personal_info"]:
                    portfolio_json["personal_info"][field] = ""
            
            print("\n=== Final Data Structure ===")
            print(json.dumps(portfolio_json, indent=2))
            
            # Initialize Jinja2 environment
            template_dir = os.path.join(os.path.dirname(__file__), 'templates', 'portfolio')
            env = Environment(loader=FileSystemLoader(template_dir))
            
            # Select template based on style
            template_name = f"{style.lower()}_template.html"
            print(f"\n=== Using Template: {template_name} ===")
            template = env.get_template(template_name)
            
            # Render the template with the portfolio data
            html_output = template.render(**portfolio_json)
            
            return {
                "status": "success",
                "portfolio": {
                    "html": html_output,
                    "style": style
                }
            }
                
        except Exception as e:
            print(f"\n=== Groq API Error ===")
            print(f"Error: {str(e)}")
            raise ValueError(f"Groq API error: {str(e)}")
            
    except Exception as e:
        print(f"\n=== Portfolio Generation Error ===")
        print(f"Error: {str(e)}")
        raise ValueError(f"Failed to generate portfolio: {str(e)}")
