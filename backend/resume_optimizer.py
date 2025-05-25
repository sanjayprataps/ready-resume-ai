from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
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

app = FastAPI(title="Resume Analysis API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class JobDescription(BaseModel):
    description: str

def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def analyze_resume(resume_text: str, job_desc: str):
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
    
    try:
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
        return {"error": str(e)}

@app.post("/analyze-resume")
async def analyze_resume_endpoint(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        # Extract text from resume
        resume_text = extract_text_from_pdf(resume.file)
        
        # Get analysis from API
        analysis = analyze_resume(resume_text, job_description)
        
        return {
            "status": "success",
            "analysis": analysis
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/")
async def root():
    return {"message": "Welcome to Resume Analysis API. Use POST /analyze-resume to analyze a resume."}