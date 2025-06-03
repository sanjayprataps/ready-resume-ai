"""
Cover Letter Writer Module
------------------------
This module handles the generation of personalized cover letters. Features include:

1. Cover Letter Generation:
   - AI-powered content generation using Groq LLM
   - Personalized content based on resume and job details
   - Professional formatting and structure
   - PDF generation with proper styling

2. Input Processing:
   - Resume text extraction and analysis
   - Job description parsing
   - Company and position details handling
   - Customization options

3. Content Features:
   - Personalized introductions
   - Relevant experience highlighting
   - Skills and qualifications matching
   - Professional closing statements

4. Output Formats:
   - PDF generation with proper styling
   - Professional formatting
   - Consistent branding
   - Downloadable format

5. Integration:
   - Resume text extraction
   - Groq LLM API integration
   - PDF generation
   - Error handling and validation

The module ensures each cover letter is unique and tailored to the specific job
application while maintaining professional standards and formatting.
"""

import os
import groq
from typing import Dict, Optional
import PyPDF2
from fastapi import HTTPException
from pydantic import BaseModel
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from io import BytesIO
from datetime import datetime

# Pydantic models for data structure
class CoverLetterInput(BaseModel):
    """Model for cover letter generation input"""
    company_name: str
    position_title: str
    job_description: str
    resume_text: str

def create_pdf_cover_letter(cover_letter_data: Dict) -> BytesIO:
    """
    Convert cover letter data to a professionally formatted PDF.
    
    Args:
        cover_letter_data (Dict): The cover letter data in JSON format
        
    Returns:
        BytesIO: PDF file as a bytes buffer
    """
    # Create a BytesIO buffer to store the PDF
    buffer = BytesIO()
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=12,
        spaceAfter=30
    ))
    
    styles.add(ParagraphStyle(
        name='CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        alignment=TA_JUSTIFY
    ))
    
    styles.add(ParagraphStyle(
        name='CustomSignature',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        alignment=TA_LEFT,
        spaceBefore=30
    ))
    
    # Build the document content
    story = []
    
    # Add date
    current_date = datetime.now().strftime("%B %d, %Y")
    story.append(Paragraph(current_date, styles['CustomTitle']))
    story.append(Spacer(1, 12))
    
    # Add salutation
    story.append(Paragraph(cover_letter_data['salutation'], styles['CustomBody']))
    story.append(Spacer(1, 12))
    
    # Add body paragraphs
    # Split body into paragraphs and add each one
    body_paragraphs = cover_letter_data['body'].split('\n\n')
    for paragraph in body_paragraphs:
        if paragraph.strip():
            story.append(Paragraph(paragraph.strip(), styles['CustomBody']))
            story.append(Spacer(1, 12))
    
    # Add closing
    story.append(Paragraph(cover_letter_data['closing'], styles['CustomSignature']))
    story.append(Spacer(1, 12))
    
    # Add signature
    story.append(Paragraph(cover_letter_data['signature'], styles['CustomSignature']))
    
    # Build the PDF
    doc.build(story)
    
    # Reset buffer position
    buffer.seek(0)
    return buffer

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

def generate_cover_letter(input_data: CoverLetterInput) -> Dict:
    """
    Generate a personalized cover letter using the Groq LLM API.
    
    Args:
        input_data (CoverLetterInput): The structured input data
        
    Returns:
        dict: Generated cover letter data and PDF
        
    Raises:
        HTTPException: If there's an error in cover letter generation
    """
    try:
        print("\n" + "="*50)
        print("STARTING COVER LETTER GENERATION")
        print("="*50)
        
        # Initialize Groq client - using same method as resume_optimizer.py
        client = groq.Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        
        # Create the prompt for the LLM
        prompt = f"""
        Generate a professional cover letter based on the following information.
        The cover letter should be personalized, compelling, and highlight relevant experience.
        
        Company: {input_data.company_name}
        Position: {input_data.position_title}
        
        Job Description:
        {input_data.job_description}
        
        Resume Content:
        {input_data.resume_text}
        
        Requirements:
        1. Use a professional tone
        2. Highlight relevant experience from the resume that matches the job requirements
        3. Show enthusiasm for the specific company and position
        4. Keep it concise (3-4 paragraphs)
        5. Include a clear call to action
        6. Format as a proper business letter with:
           - Current date (use today's date)
           - Salutation (use "Dear Hiring Manager")
           - Body paragraphs
           - Closing
           - Signature
        
        Important: DO NOT include any address information in the cover letter.
        
        Return the cover letter in this exact format:
        {{
            "date": "Current date in Month Day, Year format",
            "salutation": "Dear Hiring Manager",
            "body": "Cover letter body paragraphs",
            "closing": "Sincerely",
            "signature": "Your Name"
        }}
        """
        
        print("\n=== Making API Call ===")
        try:
            completion = client.chat.completions.create(
                model="meta-llama/llama-4-maverick-17b-128e-instruct",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a professional cover letter writing expert. 
                        Your task is to generate personalized, compelling cover letters that match 
                        the candidate's experience with the job requirements.
                        
                        Important rules:
                        1. NEVER include any address information in the cover letter
                        2. Start with the date, followed by salutation
                        3. For salutation, use "Dear Hiring Manager"
                        4. Use today's date in Month Day, Year format
                        5. Keep the tone professional and engaging
                        6. Focus on creating a unique, engaging narrative that demonstrates the candidate's 
                           value proposition
                        7. Always return a properly formatted JSON object with the specified fields
                        """
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Process the response
            response_text = completion.choices[0].message.content.strip()
            print("\n=== Raw Response from Groq ===")
            print(response_text)
            
            # Clean the response if it contains markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            # Parse the JSON response
            import json
            try:
                cover_letter_data = json.loads(response_text)
                
                # Validate required fields
                required_fields = ["date", "salutation", "body", "closing", "signature"]
                missing_fields = [field for field in required_fields if field not in cover_letter_data]
                
                if missing_fields:
                    raise ValueError(f"Missing required fields in response: {', '.join(missing_fields)}")
                
                # Generate PDF
                pdf_buffer = create_pdf_cover_letter(cover_letter_data)
                
                return {
                    "status": "success",
                    "cover_letter": cover_letter_data,
                    "pdf": pdf_buffer.getvalue()
                }
                
            except json.JSONDecodeError as e:
                print(f"JSON parsing error. Response text: {response_text}")
                raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
                
        except Exception as e:
            print(f"Groq API error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")
            
    except Exception as e:
        print(f"Error in generate_cover_letter: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate cover letter: {str(e)}")
