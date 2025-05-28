"""
Main API Router
--------------
This file serves as the main API router for the application.
It imports and uses the core logic from resume_optimizer.py and resume_generator.py.
"""

import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
from io import BytesIO

# Import core logic from other files
from resume_optimizer import extract_text_from_pdf, analyze_resume
from resume_generator import ResumeData, generate_resume
from coverletter_writer import generate_cover_letter, CoverLetterInput

# Load environment variables from .env file
load_dotenv()

# Verify API key is set
if not os.getenv("GROQ_API_KEY"):
    raise ValueError("GROQ_API_KEY environment variable is not set. Please set it in your .env file.")

# Initialize FastAPI application
app = FastAPI(
    title="Resume AI API",
    description="API for resume generation and optimization",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-resume")
async def analyze_resume_endpoint(
    resume: UploadFile = File(description="Upload your resume in PDF format"),
    job_description: str = Form(description="Paste the job description here")
):
    """
    Analyze a resume against a job description.
    
    - **resume**: Upload your resume in PDF format
    - **job_description**: Paste the job description here
    """
    try:
        print(f"Received resume file: {resume.filename}, content type: {resume.content_type}")
        print(f"Job description length: {len(job_description)}")
        
        if not resume.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Extract text from resume
        try:
            resume_text = extract_text_from_pdf(resume.file)
            print(f"Extracted text length: {len(resume_text)}")
            if not resume_text.strip():
                raise HTTPException(status_code=400, detail="Could not extract text from the PDF file")
        except Exception as e:
            print(f"Error extracting text from PDF: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error processing PDF file: {str(e)}")
        
        # Get analysis from API
        try:
            analysis = analyze_resume(resume_text, job_description)
            return JSONResponse(
                content={
                    "status": "success",
                    "analysis": analysis
                }
            )
        except Exception as e:
            print(f"Error during analysis: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.post("/generate-resume")
async def generate_resume_endpoint(resume_data: ResumeData):
    """
    Generate a professional resume using the provided data.
    
    - **resume_data**: The structured resume data
    """
    try:
        result = generate_resume(resume_data)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        print(f"Error in generate_resume_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate resume: {str(e)}")

@app.post("/api/generate-cover-letter")
async def generate_cover_letter_endpoint(
    company_name: str = Form(...),
    position_title: str = Form(...),
    job_description: str = Form(...),
    resume: UploadFile = File(...)
):
    """
    Generate a personalized cover letter based on resume and job details.
    
    Args:
        company_name (str): Name of the company
        position_title (str): Title of the position
        job_description (str): Job description text
        resume (UploadFile): Resume PDF file
        
    Returns:
        StreamingResponse: PDF file of the generated cover letter
    """
    try:
        # Validate file type
        if not resume.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Extract text from resume
        resume_text = extract_text_from_pdf(resume.file)
        
        # Generate cover letter
        result = generate_cover_letter(CoverLetterInput(
            company_name=company_name,
            position_title=position_title,
            job_description=job_description,
            resume_text=resume_text
        ))
        
        # Return PDF file
        return StreamingResponse(
            BytesIO(result["pdf"]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=cover_letter_{company_name.lower().replace(' ', '_')}.pdf"
            }
        )
        
    except Exception as e:
        print(f"Error in generate_cover_letter_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Close the uploaded file
        await resume.close()

@app.get("/")
async def root():
    """Root endpoint that returns a welcome message"""
    return {
        "message": "Welcome to Resume AI API",
        "endpoints": {
            "analyze_resume": "POST /analyze-resume - Analyze a resume against a job description",
            "generate_resume": "POST /generate-resume - Generate a professional resume"
        }
    }