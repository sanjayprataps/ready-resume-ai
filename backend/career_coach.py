"""
Career Coach Module
-----------------
This module provides AI-powered career guidance and analysis. Features include:

1. Career Analysis:
   - Resume-based career path analysis
   - Skills assessment and recommendations
   - Industry trend analysis
   - Career progression suggestions

2. Guidance Features:
   - Personalized career recommendations
   - Skill development suggestions
   - Industry insights
   - Professional development paths

3. Analysis Components:
   - Experience evaluation
   - Education assessment
   - Skills gap analysis
   - Market alignment check

4. Integration:
   - Resume text extraction
   - Groq LLM API integration
   - Structured response formatting
   - Error handling and validation

5. Output Format:
   - Detailed career analysis
   - Actionable recommendations
   - Skill development roadmap
   - Industry insights

The module uses AI to provide personalized career guidance based on the user's
resume, helping them make informed decisions about their career path.
"""

import os
import groq
from typing import Dict, List, Optional
from pydantic import BaseModel
import json
import pdfkit
import tempfile
import base64
import traceback
from jinja2 import Environment, FileSystemLoader

class CareerAnalysis(BaseModel):
    """Model for career analysis results"""
    career_strengths: List[str]
    areas_for_improvement: List[str]
    skill_gaps: List[str]
    actionable_recommendations: List[str]
    potential_career_paths: List[Dict[str, str]]

# Initialize Jinja2 environment
template_dir = os.path.join(os.path.dirname(__file__), 'templates')
env = Environment(loader=FileSystemLoader(template_dir))

def analyze_career(resume_text: str) -> Dict:
    """
    Analyze a resume and provide career guidance using the Groq LLM API.
    
    Args:
        resume_text (str): The extracted text from the user's resume
        
    Returns:
        dict: Career analysis results and PDF
        
    Raises:
        Exception: If there's an error in analysis
    """
    try:
        print("\n=== Starting Career Analysis ===")
        
        # Initialize Groq client
        client = groq.Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        print("Groq client initialized")

        # Create the prompt for career analysis
        prompt = f"""
        Analyze the following resume and provide a detailed career analysis.

        Resume:
        {resume_text}

        Please provide a structured analysis with the following sections:

        1. Career Strengths:
        - Highlight the candidate's key strengths based on their experience, skills, and achievements.
        - Focus on areas where the candidate excels.
        - Use bullet points for clarity.

        2. Areas for Improvement:
        - Identify any gaps or weaknesses in the candidate's profile.
        - Suggest areas where the candidate can improve or gain additional experience.
        - Use bullet points for clarity.

        3. Skill Gaps:
        - List any in-demand skills that are missing or underrepresented in the candidate's resume.
        - Highlight skills that are relevant to the candidate's desired career path.
        - Use bullet points for clarity.

        4. Actionable Recommendations:
        - Provide specific, actionable suggestions to enhance the candidate's career prospects.
        - Include recommendations for skill development, certifications, or experiences to pursue.
        - Use bullet points for clarity.

        5. Potential Career Paths:
        - Suggest 2–3 career paths or roles that align with the candidate's background and strengths.
        - For each, explain why it's a good fit and what additional steps the candidate should take to pursue it.
        - Use bullet points for clarity.

        Format the response in the following JSON structure:
        {{
            "career_strengths": ["strength1", "strength2", ...],
            "areas_for_improvement": ["area1", "area2", ...],
            "skill_gaps": ["skill1", "skill2", ...],
            "actionable_recommendations": ["rec1", "rec2", ...],
            "potential_career_paths": [
                {{
                    "role": "role name",
                    "fit": "explanation of why it's a good fit",
                    "next_steps": "specific steps to pursue this path"
                }},
                ...
            ]
        }}
        """
        
        # Get completion from Groq
        completion = client.chat.completions.create(
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": """You are a career development expert. Analyze resumes and provide detailed career guidance.
                    Focus on actionable insights and practical recommendations.
                    Return only valid JSON with no additional text or formatting."""
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Process the response
        output_text = completion.choices[0].message.content.strip()
        print("\n=== Raw Response from Groq ===")
        print(output_text)
        
        # Clean and parse the JSON response
        if "```json" in output_text:
            output_text = output_text.split("```json")[1].split("```")[0].strip()
        elif "```" in output_text:
            output_text = output_text.split("```")[1].split("```")[0].strip()
        
        # Extract only the JSON object
        start_idx = output_text.find("{")
        end_idx = output_text.rfind("}")
        if start_idx == -1 or end_idx == -1:
            raise ValueError("Invalid JSON structure in response")
        
        cleaned_text = output_text[start_idx:end_idx + 1]
        
        # Parse the JSON response
        analysis_data = json.loads(cleaned_text)
        print("\n=== Parsed Analysis Data ===")
        print(json.dumps(analysis_data, indent=2))
        
        try:
            # Generate HTML report using Jinja2 template
            print("\n=== Generating HTML Report ===")
            template = env.get_template('career_analysis_template.html')
            html_report = template.render(analysis=analysis_data)
            print("HTML report generated successfully")
            
            # Convert HTML to PDF using pdfkit
            print("\n=== Converting to PDF ===")
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_pdf_path = os.path.join(temp_dir, 'career_analysis.pdf')
                
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
                    print("Attempting PDF conversion...")
                    pdfkit.from_string(html_report, temp_pdf_path, options=options)
                    print("PDF conversion successful")
                    
                    # Read the generated PDF and encode it as base64
                    with open(temp_pdf_path, 'rb') as pdf_file:
                        pdf_content = pdf_file.read()
                        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
                    print("PDF encoded successfully")
                    
                    return {
                        "status": "success",
                        "analysis": analysis_data,
                        "pdf": pdf_base64
                    }
                except Exception as pdf_error:
                    print(f"\n=== PDF Generation Error ===")
                    print(f"Error: {str(pdf_error)}")
                    print("Stack trace:", traceback.format_exc())
                    # Return analysis without PDF if PDF generation fails
                    return {
                        "status": "success",
                        "analysis": analysis_data,
                        "pdf": None
                    }
            
        except Exception as html_error:
            print(f"\n=== HTML Generation Error ===")
            print(f"Error: {str(html_error)}")
            print("Stack trace:", traceback.format_exc())
            # Return analysis without HTML/PDF if HTML generation fails
            return {
                "status": "success",
                "analysis": analysis_data,
                "pdf": None
            }
            
    except Exception as e:
        print(f"\n=== Career Analysis Error ===")
        print(f"Error: {str(e)}")
        print("Stack trace:", traceback.format_exc())
        raise ValueError(f"Failed to analyze career: {str(e)}") 