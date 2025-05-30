"""
Resume Optimizer Core Logic
--------------------------
This file contains the core logic for analyzing resumes against job descriptions.
The actual API endpoints are defined in main.py.
"""

import os
import groq
import PyPDF2
from fastapi import HTTPException

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

def clean_markdown(text: str) -> str:
    """
    Remove Markdown formatting symbols from text.
    
    Args:
        text (str): Text containing Markdown symbols
        
    Returns:
        str: Cleaned text without Markdown symbols
    """
    # Remove bold/italic markers
    text = text.replace('**', '')
    text = text.replace('*', '')
    # Remove headers
    text = text.replace('##', '')
    # Remove trailing # symbols
    text = text.rstrip('#')
    # Remove extra newlines and whitespace
    text = '\n'.join(line.strip() for line in text.split('\n') if line.strip())
    return text.strip()

def analyze_resume(resume_text: str, job_desc: str) -> dict:
    """
    Analyze a resume against a job description using the Groq LLM API.
    
    Args:
        resume_text (str): The text content of the resume
        job_desc (str): The job description to analyze against
        
    Returns:
        dict: Analysis results containing strengths, weaknesses, and suggestions
        
    Raises:
        HTTPException: If there's an error in the analysis process
    """
    try:
        print("\n" + "="*50)
        print("STARTING RESUME ANALYSIS")
        print("="*50)
        print(f"Resume text length: {len(resume_text)}")
        print(f"Job description length: {len(job_desc)}")
        
        # Initialize Groq client
        client = groq.Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        
        prompt = f"""
        Analyze the following resume against the job description and provide a detailed analysis.
        
        Resume:
        {resume_text}
        
        Job Description:
        {job_desc}
        
        Please provide a structured analysis with the following sections:
        
        1. Key Strengths:
        - List the candidate's key strengths that match the job requirements
        - Focus on relevant experience, skills, and achievements
        - Use bullet points for clarity
        
        2. Areas for Improvement:
        - Identify gaps between the resume and job requirements
        - List missing skills or experience
        - Highlight areas that need enhancement
        - Use bullet points for clarity
        
        3. Suggestions:
        - Provide specific, actionable suggestions to improve the resume
        - Include recommendations for better presentation
        - Suggest ways to highlight relevant experience
        - Use bullet points for clarity
        
        Format the response with clear section headers and bullet points for each item.
        """
        
        print("\n=== Making API Call ===")
        try:
            completion = client.chat.completions.create(
                model="meta-llama/llama-4-maverick-17b-128e-instruct",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a professional resume optimization expert.
                        Your task is to analyze resumes against job descriptions and provide
                        detailed, actionable feedback.
                        
                        Important rules:
                        1. Be specific and actionable in your feedback
                        2. Focus on concrete examples and suggestions
                        3. Use bullet points for clarity
                        4. Maintain a professional and constructive tone
                        5. Structure the response with clear section headers
                        6. Ensure each section has at least 3-5 points
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
            
            # Parse the response into sections
            sections = {
                "strengths": "",
                "weaknesses": "",
                "suggestions": ""
            }
            
            # Try different section header formats
            strength_headers = ["1. Key Strengths:", "### Key Strengths:", "Key Strengths:"]
            weakness_headers = ["2. Areas for Improvement:", "### Areas for Improvement:", "Areas for Improvement:"]
            suggestion_headers = ["3. Suggestions:", "### Suggestions:", "Suggestions:"]
            
            # Find the first occurrence of any strength header
            strength_start = -1
            for header in strength_headers:
                if header in response_text:
                    strength_start = response_text.find(header) + len(header)
                    break
            
            if strength_start != -1:
                # Get the text after the strength header
                remaining_text = response_text[strength_start:]
                
                # Find the first occurrence of any weakness header
                weakness_start = -1
                for header in weakness_headers:
                    if header in remaining_text:
                        weakness_start = remaining_text.find(header)
                        break
                
                if weakness_start != -1:
                    # Extract strengths section
                    sections["strengths"] = clean_markdown(remaining_text[:weakness_start].strip())
                    
                    # Get the text after the weakness header
                    remaining_text = remaining_text[weakness_start:]
                    for header in weakness_headers:
                        if header in remaining_text:
                            remaining_text = remaining_text[remaining_text.find(header) + len(header):]
                            break
                    
                    # Find the first occurrence of any suggestion header
                    suggestion_start = -1
                    for header in suggestion_headers:
                        if header in remaining_text:
                            suggestion_start = remaining_text.find(header)
                            break
                    
                    if suggestion_start != -1:
                        # Extract weaknesses section
                        sections["weaknesses"] = clean_markdown(remaining_text[:suggestion_start].strip())
                        
                        # Extract suggestions section
                        remaining_text = remaining_text[suggestion_start:]
                        for header in suggestion_headers:
                            if header in remaining_text:
                                sections["suggestions"] = clean_markdown(remaining_text[remaining_text.find(header) + len(header):].strip())
                                break
            
            # Ensure all sections have content
            if not sections["strengths"]:
                sections["strengths"] = "No key strengths identified"
            if not sections["weaknesses"]:
                sections["weaknesses"] = "No areas for improvement identified"
            if not sections["suggestions"]:
                sections["suggestions"] = "No specific suggestions provided"
            
            print("\n=== Final Sections ===")
            print("Strengths:", sections["strengths"])
            print("Weaknesses:", sections["weaknesses"])
            print("Suggestions:", sections["suggestions"])
            
            return sections
            
        except Exception as e:
            print(f"Groq API error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")
            
    except Exception as e:
        print(f"Error in analyze_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {str(e)}")