from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import PyPDF2
import os
import groq
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Verify API key is set
if not os.getenv("GROQ_API_KEY"):
    raise ValueError("GROQ_API_KEY environment variable is not set. Please set it in your .env file.")

# Initialize FastAPI app
app = FastAPI(
    title="Resume Analysis API",
    description="API for analyzing resumes against job descriptions",
    version="1.0.0"
)

# Add CORS middleware with more specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://127.0.0.1:8080"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobDescription(BaseModel):
    description: str

def extract_text_from_pdf(pdf_file):
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
    try:
        # Initialize Groq client
        client = groq.Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        
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

@app.post("/analyze-resume", response_model=dict)
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

@app.get("/")
async def root():
    return {
        "message": "Welcome to Resume Analysis API",
        "endpoints": {
            "analyze_resume": "POST /analyze-resume - Analyze a resume against a job description"
        }
    }