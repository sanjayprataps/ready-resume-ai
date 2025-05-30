"""
Main API Router
--------------
This file serves as the main API router for the application.
It imports and uses the core logic from resume_optimizer.py, resume_generator.py, and portfolio_generator.py.
"""

import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
from io import BytesIO

# Import core logic from other files
from resume_optimizer import extract_text_from_pdf, analyze_resume
from resume_generator import ResumeData, generate_resume
from coverletter_writer import generate_cover_letter, CoverLetterInput
from portfolio_generator import PortfolioData, generate_portfolio, extract_text_from_pdf as extract_portfolio_text

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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://ready-resume-ai.vercel.app",  # Your Vercel frontend URL
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
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
            print("\n=== Final Response ===")
            print("Analysis:", analysis)
            
            response = {
                "status": "success",
                "analysis": analysis
            }
            print("Response:", response)
            
            return JSONResponse(content=response)
        except Exception as e:
            print(f"Error during analysis: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.post("/generate-resume")
async def generate_resume_endpoint(resume_data: ResumeData, accept: str = Header(default="application/pdf")):
    """
    Generate a professional resume using the provided data.
    
    - **resume_data**: The structured resume data
    - **accept**: The Accept header to determine response format (application/pdf or application/json)
    """
    try:
        print("\n=== Resume Generation Request ===")
        print(f"Accept header: {accept}")
        print("Resume data:", resume_data.dict())
        
        result = generate_resume(resume_data)
        print("\n=== Generation Result ===")
        print(f"Status: {result['status']}")
        
        if result["status"] == "success":
            if "application/json" in accept:
                print("Returning JSON response")
                return JSONResponse(content=result)
            else:
                print("Returning PDF response")
                return StreamingResponse(
                    BytesIO(result["pdf"]),
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": f"attachment; filename={result['resume']['name'].lower().replace(' ', '-')}-resume.pdf"
                    }
                )
        return result
    except ValueError as ve:
        print(f"\n=== Validation Error ===")
        print(f"Error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"\n=== Unexpected Error ===")
        print(f"Error: {str(e)}")
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

@app.post("/api/generate-portfolio")
async def generate_portfolio_endpoint(
    method: str = Form(...),
    resume: UploadFile = File(None),
    portfolio_data: str = Form(None),
    style: str = Form("professional")  # Add style parameter with default value
):
    """
    Generate a portfolio website based on resume upload or guided input.
    
    Args:
        method (str): Either "upload" or "guided"
        resume (UploadFile): Resume PDF file (required if method is "upload")
        portfolio_data (str): JSON string of portfolio data (required if method is "guided")
        style (str): Portfolio style ('minimal', 'creative', or 'professional')
        
    Returns:
        JSONResponse: Generated portfolio HTML
    """
    try:
        print("\n=== Portfolio Generation Request ===")
        print(f"Method: {method}")
        print(f"Style: {style}")
        
        # Validate style parameter
        valid_styles = ['minimal', 'creative', 'professional']
        if style not in valid_styles:
            raise HTTPException(status_code=400, detail=f"Invalid style. Must be one of: {', '.join(valid_styles)}")

        if method == "upload":
            if not resume:
                raise HTTPException(status_code=400, detail="Resume file is required for upload method")
            
            # Validate file type
            if not resume.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail="Only PDF files are allowed")
            
            # Extract text from resume
            resume_text = extract_portfolio_text(resume.file)
            
            # Create a basic PortfolioData structure from the resume text
            portfolio_data = PortfolioData(
                personal_info=PersonalInfo(
                    full_name="",  # Will be extracted from resume
                    email="",
                    phone="",
                    location="",
                    summary=""
                ),
                experience=[],
                education=[],
                technical_skills="",
                soft_skills="",
                projects=[]
            )
            
        elif method == "guided":
            if not portfolio_data:
                raise HTTPException(status_code=400, detail="Portfolio data is required for guided method")
            
            # Parse the portfolio data
            import json
            try:
                print("\n=== Parsing Portfolio Data ===")
                print(f"Raw data: {portfolio_data}")
                
                data = json.loads(portfolio_data)
                print(f"Parsed data: {json.dumps(data, indent=2)}")
                
                # Validate required fields
                required_fields = ["personal_info", "experience", "education", "technical_skills", "soft_skills", "projects"]
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
                
                # Ensure arrays are properly formatted
                if not isinstance(data["experience"], list):
                    data["experience"] = [data["experience"]]
                if not isinstance(data["education"], list):
                    data["education"] = [data["education"]]
                if not isinstance(data["projects"], list):
                    data["projects"] = [data["projects"]]
                
                # Create PortfolioData instance
                try:
                    portfolio_data = PortfolioData(**data)
                    print("\n=== Validated Portfolio Data ===")
                    print(json.dumps(portfolio_data.dict(), indent=2))
                except Exception as e:
                    print(f"\n=== Portfolio Data Validation Error ===")
                    print(f"Error: {str(e)}")
                    raise ValueError(f"Invalid portfolio data structure: {str(e)}")
                
            except json.JSONDecodeError as e:
                print(f"\n=== JSON Parse Error ===")
                print(f"Error: {str(e)}")
                print(f"Invalid JSON: {portfolio_data}")
                raise HTTPException(status_code=400, detail=f"Invalid portfolio data format: {str(e)}")
            except Exception as e:
                print(f"\n=== Portfolio Data Processing Error ===")
                print(f"Error: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Error processing portfolio data: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Invalid method. Use 'upload' or 'guided'")
        
        # Generate portfolio with selected style
        try:
            result = generate_portfolio(portfolio_data, style)
            return JSONResponse(content=result)
        except Exception as e:
            print(f"\n=== Portfolio Generation Error ===")
            print(f"Error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"\n=== Unexpected Error ===")
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if resume:
            await resume.close()

@app.get("/")
async def root():
    """Root endpoint that returns a welcome message and all available endpoints"""
    return {
        "message": "Welcome to Resume AI API",
        "endpoints": {
            "analyze_resume": "POST /analyze-resume - Analyze a resume against a job description",
            "generate_resume": "POST /generate-resume - Generate a professional resume",
            "generate_cover_letter": "POST /api/generate-cover-letter - Generate a personalized cover letter",
            "generate_portfolio": "POST /api/generate-portfolio - Generate a portfolio website"
        },
        "usage": {
            "analyze_resume": "Upload a resume PDF and provide a job description for analysis",
            "generate_resume": "Provide resume data to generate a professional resume",
            "generate_cover_letter": "Upload a resume PDF and provide job details to generate a cover letter",
            "generate_portfolio": "Upload a resume PDF or provide portfolio data to generate a website"
        }
    }