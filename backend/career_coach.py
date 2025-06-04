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
import time
from fastapi import HTTPException
import logging
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

async def analyze_career(resume_text: str) -> Dict:
    """
    Analyze a resume and provide career guidance using Groq LLM.
    
    Args:
        resume_text (str): The text content of the resume
        
    Returns:
        Dict: Analysis results including career insights and recommendations
        
    Raises:
        HTTPException: If there's an error in the analysis process
    """
    try:
        logger.info("\n=== Starting Career Analysis ===")
        
        # Initialize Groq client
        client = groq.Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        logger.info("Groq client initialized")

        # Format the prompt
        prompt = f"""Analyze this resume and provide career guidance:
        
        {resume_text}
        
        Please provide a structured analysis with the following sections:
        1. Career Summary
        2. Key Strengths
        3. Areas for Growth
        4. Career Path Recommendations
        5. Skill Development Suggestions
        6. Industry Opportunities
        
        Format the response as a JSON object with these keys:
        {{
            "career_summary": string,
            "key_strengths": string[],
            "areas_for_growth": string[],
            "career_paths": string[],
            "skill_development": string[],
            "industry_opportunities": string[]
        }}
        """

        max_retries = 3
        retry_delay = 2  # seconds
        last_error = None

        for attempt in range(max_retries):
            try:
                # Groq API call is synchronous, no need for await
                completion = client.chat.completions.create(
                    model="meta-llama/llama-4-maverick-17b-128e-instruct",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a career guidance expert. Analyze resumes and provide detailed career advice."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )

                # Extract and parse the response
                response_text = completion.choices[0].message.content.strip()
                
                # Remove markdown code block formatting if present
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0].strip()

                try:
                    analysis = json.loads(response_text)
                    logger.info("Successfully parsed analysis response")
                    
                    # Generate PDF report
                    try:
                        pdf_base64 = generate_pdf(analysis)
                        if pdf_base64:
                            return {
                                "status": "success",
                                "analysis": analysis,
                                "pdf": pdf_base64
                            }
                        else:
                            logger.warning("PDF generation failed, returning analysis without PDF")
                            return {
                                "status": "success",
                                "analysis": analysis
                            }
                    except Exception as pdf_error:
                        logger.error(f"Error generating PDF: {str(pdf_error)}")
                        return {
                            "status": "success",
                            "analysis": analysis
                        }
                        
                except json.JSONDecodeError as e:
                    logger.error(f"JSON parsing error: {str(e)}")
                    logger.error(f"Raw response: {response_text}")
                    raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")

            except groq.InternalServerError as e:
                last_error = e
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (attempt + 1)  # Exponential backoff
                    logger.warning(f"Groq API error (attempt {attempt + 1}/{max_retries}). Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
                continue
            except Exception as e:
                logger.error(f"Unexpected error during career analysis: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to analyze career: {str(e)}"
                )

        # If we've exhausted all retries
        if last_error:
            logger.error(f"All {max_retries} attempts failed")
            raise HTTPException(
                status_code=503,
                detail="Career analysis service is temporarily unavailable. Please try again in a few minutes."
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in analyze_career: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze career: {str(e)}"
        )

def generate_pdf(analysis_data: Dict) -> str:
    """
    Generate a PDF report from the analysis data.
    
    Args:
        analysis_data (Dict): The career analysis data
        
    Returns:
        str: The base64-encoded PDF content
    """
    try:
        logger.info("\n=== Generating HTML Report ===")
        
        # Create a simple HTML template for the report
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Career Analysis Report</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                h2 { color: #34495e; margin-top: 30px; }
                .section { margin-bottom: 30px; }
                ul { list-style-type: none; padding-left: 0; }
                li { margin-bottom: 10px; padding-left: 20px; position: relative; }
                li:before { content: "•"; position: absolute; left: 0; color: #3498db; }
            </style>
        </head>
        <body>
            <h1>Career Analysis Report</h1>
            
            <div class="section">
                <h2>Career Summary</h2>
                <p>{{ analysis.career_summary }}</p>
            </div>
            
            <div class="section">
                <h2>Key Strengths</h2>
                <ul>
                    {% for strength in analysis.key_strengths %}
                    <li>{{ strength }}</li>
                    {% endfor %}
                </ul>
            </div>
            
            <div class="section">
                <h2>Areas for Growth</h2>
                <ul>
                    {% for area in analysis.areas_for_growth %}
                    <li>{{ area }}</li>
                    {% endfor %}
                </ul>
            </div>
            
            <div class="section">
                <h2>Career Paths</h2>
                <ul>
                    {% for path in analysis.career_paths %}
                    <li>{{ path }}</li>
                    {% endfor %}
                </ul>
            </div>
            
            <div class="section">
                <h2>Skill Development</h2>
                <ul>
                    {% for skill in analysis.skill_development %}
                    <li>{{ skill }}</li>
                    {% endfor %}
                </ul>
            </div>
            
            <div class="section">
                <h2>Industry Opportunities</h2>
                <ul>
                    {% for opportunity in analysis.industry_opportunities %}
                    <li>{{ opportunity }}</li>
                    {% endfor %}
                </ul>
            </div>
        </body>
        </html>
        """
        
        # Render the template with the analysis data
        template = env.from_string(html_template)
        html_report = template.render(analysis=analysis_data)
        logger.info("HTML report generated successfully")
        
        logger.info("\n=== Converting to PDF ===")
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
                logger.info("Attempting PDF conversion...")
                pdfkit.from_string(html_report, temp_pdf_path, options=options)
                logger.info("PDF conversion successful")
                
                # Read the generated PDF and encode it as base64
                with open(temp_pdf_path, 'rb') as pdf_file:
                    pdf_content = pdf_file.read()
                    pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
                logger.info("PDF encoded successfully")
                
                return pdf_base64
            except Exception as pdf_error:
                logger.error(f"\n=== PDF Generation Error ===")
                logger.error(f"Error: {str(pdf_error)}")
                logger.error("Stack trace:", traceback.format_exc())
                return None
        
    except Exception as html_error:
        logger.error(f"\n=== HTML Generation Error ===")
        logger.error(f"Error: {str(html_error)}")
        logger.error("Stack trace:", traceback.format_exc())
        return None

def generate_report(analysis_data: Dict) -> Dict:
    """
    Generate a comprehensive report from the analysis data.
    
    Args:
        analysis_data (Dict): The career analysis data
        
    Returns:
        Dict: The generated report
    """
    try:
        pdf_base64 = generate_pdf(analysis_data)
        return {
            "status": "success",
            "analysis": analysis_data,
            "pdf": pdf_base64
        }
    except Exception as e:
        logger.error(f"Error in generate_report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        ) 