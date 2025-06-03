from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os
from dotenv import load_dotenv
import PyPDF2
import io
import logging
from pathlib import Path
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables with explicit path
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Log the environment file path and loading status
logger.info(f"Loading .env file from: {env_path}")
logger.info(f".env file exists: {env_path.exists()}")

# Initialize router with prefix
router = APIRouter(prefix="/api")

# Adzuna API configuration
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_API_KEY = os.getenv("ADZUNA_API_KEY")

# Country code mapping
COUNTRY_CODES = {
    "uk": "gb",
    "united kingdom": "gb",
    "great britain": "gb",
    "usa": "us",
    "united states": "us",
    "united states of america": "us",
    "india": "in",
    "australia": "au",
    "brazil": "br",
    "canada": "ca",
    "france": "fr",
    "germany": "de",
    "italy": "it",
    "japan": "jp",
    "mexico": "mx",
    "netherlands": "nl",
    "new zealand": "nz",
    "poland": "pl",
    "singapore": "sg",
    "south africa": "za",
    "spain": "es"
}

def get_country_code(location: Optional[str]) -> str:
    """Get the Adzuna country code from location string."""
    if not location:
        return "in"  # Default to India if no location specified
    
    location_lower = location.lower()
    for country, code in COUNTRY_CODES.items():
        if country in location_lower:
            return code
    return "in"  # Default to India if no match found

class JobSearchRequest(BaseModel):
    keywords: str
    location: Optional[str] = None

class JobResult(BaseModel):
    title: str
    company: str
    location: str
    description: str
    salary: Optional[str]
    match_score: float
    url: str

async def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text content from PDF file."""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

def clean_text(text: str) -> str:
    """Clean text by removing special characters and extra whitespace."""
    # Replace newlines and multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,-]', '', text)
    return text.strip()

def extract_keywords_from_resume(resume_text: str) -> dict:
    """Extract relevant keywords and information from resume text."""
    try:
        # Clean the resume text first
        resume_text = clean_text(resume_text)
        
        # Find the technical skills section and everything after it
        skills_section_pattern = r"(?i)(technical skills|skills|expertise|proficiencies)[:|\n](.*)"
        skills_match = re.search(skills_section_pattern, resume_text, re.DOTALL)
        
        if skills_match:
            # Get everything after the skills section
            skills_section = skills_match.group(2)
            # Split by common delimiters and clean
            skill_list = re.split(r'[,•|\n]', skills_section)
            # Clean and filter skills
            keywords = [clean_text(skill) for skill in skill_list if skill.strip()]
        else:
            keywords = []

        # Extract job titles/roles
        title_pattern = r"(?i)(software engineer|developer|engineer|analyst|designer|manager|consultant|architect|specialist|qa|quality assurance|test engineer|automation engineer)"
        titles = re.findall(title_pattern, resume_text)
        keywords.extend(titles)

        # Extract technologies/languages
        tech_pattern = r"(?i)(python|java|javascript|react|node|angular|typescript|aws|azure|docker|kubernetes|sql|nosql|mongodb|postgresql|jira|testrail|redmine|comfyui|ai|machine learning|ml|artificial intelligence|selenium|cypress|playwright|jenkins|git|github|gitlab|bitbucket|agile|scrum|kanban|jira|confluence|testrail|postman|rest api|graphql|microservices|ci/cd|devops|cloud|aws|azure|gcp|linux|unix|shell scripting|bash|powershell|windows|macos|ios|android|mobile|web|frontend|backend|fullstack|full stack|data science|data engineering|big data|hadoop|spark|kafka|elasticsearch|redis|cassandra|dynamodb|firebase|tensorflow|pytorch|scikit-learn|pandas|numpy|matplotlib|seaborn|tableau|power bi|excel|vba|word|powerpoint|outlook|teams|slack|zoom|microsoft office|google workspace|g suite|office 365)"
        technologies = re.findall(tech_pattern, resume_text)
        keywords.extend(technologies)
        
        # Remove duplicates and clean up
        keywords = list(set([k.strip().lower() for k in keywords if k.strip()]))
        
        # Take top 10 most relevant keywords (increased from 5)
        keywords = keywords[:10]
        
        # Extract location if present
        location_pattern = r"(?i)(bangalore|mumbai|delhi|chennai|hyderabad|pune|kolkata|india)"
        location_match = re.search(location_pattern, resume_text)
        location = location_match.group(1) if location_match else None

        # Create a clean search query
        search_query = " ".join(keywords)
        
        logger.info(f"Extracted keywords: {keywords}")
        logger.info(f"Extracted location: {location}")
        logger.info(f"Final search query: {search_query}")

        return {
            "keywords": search_query,
            "location": location
        }
    except Exception as e:
        logger.error(f"Error extracting keywords from resume: {str(e)}")
        return {
            "keywords": "",
            "location": None
        }

async def search_adzuna_jobs(keywords: str, location: Optional[str] = None) -> List[dict]:
    """Search jobs using Adzuna API."""
    try:
        if not ADZUNA_APP_ID or not ADZUNA_API_KEY:
            logger.error("Adzuna API credentials not configured")
            raise HTTPException(
                status_code=500,
                detail="Adzuna API credentials not configured. Please check your .env file."
            )

        # Get country code and construct API URL
        country_code = get_country_code(location)
        api_url = f"https://api.adzuna.com/v1/api/jobs/{country_code}/search/1"
        logger.info(f"Using API URL: {api_url}")

        # Clean and prepare the search query
        search_query = clean_text(keywords)
        
        # Split keywords and take the most relevant ones for the search
        keyword_list = search_query.split()
        if len(keyword_list) > 3:
            # Prioritize job titles and core technologies
            job_titles = [k for k in keyword_list if any(title in k.lower() for title in ['engineer', 'developer', 'analyst', 'qa', 'test'])]
            if job_titles:
                search_query = ' '.join(job_titles[:2])
            else:
                search_query = ' '.join(keyword_list[:3])
        
        logger.info(f"Refined search query: {search_query}")
        
        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_API_KEY,
            "results_per_page": 20,
            "what": search_query,
            "sort_by": "date",
            "content-type": "application/json"
        }
        
        if location:
            params["where"] = location

        logger.info(f"Searching Adzuna API with params: {params}")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(api_url, params=params)
            response.raise_for_status()
            data = response.json()

            if not data.get("results"):
                logger.info("No results found from Adzuna API")
                return []

            # Process and format the results
            jobs = []
            for job in data["results"]:
                # Calculate a simple match score based on keyword presence
                match_score = calculate_match_score(job, search_query)
                
                jobs.append({
                    "title": job.get("title", "No Title"),
                    "company": job.get("company_name", "Company Not Specified"),
                    "location": job.get("location", {}).get("display_name", "Location Not Specified"),
                    "description": job.get("description", "No Description Available"),
                    "salary": format_salary(job.get("salary_min"), job.get("salary_max")),
                    "match_score": match_score,
                    "url": job.get("redirect_url", "#")
                })

            logger.info(f"Found {len(jobs)} jobs matching the search criteria")
            return jobs

    except httpx.HTTPError as e:
        logger.error(f"Error calling Adzuna API: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error calling Adzuna API: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in search_adzuna_jobs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

def calculate_match_score(job: dict, keywords: str) -> float:
    """Calculate a match score based on keyword presence in job details."""
    score = 0
    keywords_list = [k.lower() for k in keywords.split()]
    
    # Check title
    title = job.get("title", "").lower()
    for keyword in keywords_list:
        if keyword in title:
            score += 2
    
    # Check description
    description = job.get("description", "").lower()
    for keyword in keywords_list:
        if keyword in description:
            score += 1
    
    # Normalize score to percentage (max 100)
    max_possible_score = len(keywords_list) * 3  # 2 points for title, 1 for description
    if max_possible_score == 0:
        return 0
    
    return min(round((score / max_possible_score) * 100), 100)

def format_salary(min_salary: Optional[int], max_salary: Optional[int]) -> Optional[str]:
    """Format salary range for display."""
    if min_salary is None and max_salary is None:
        return None
    
    if min_salary and max_salary:
        return f"${min_salary:,} - ${max_salary:,}"
    elif min_salary:
        return f"From ${min_salary:,}"
    elif max_salary:
        return f"Up to ${max_salary:,}"
    
    return None

@router.post("/search-jobs")
async def search_jobs(request: JobSearchRequest):
    """Endpoint for keyword-based job search."""
    try:
        logger.info(f"Received job search request - Keywords: {request.keywords}, Location: {request.location}")
        jobs = await search_adzuna_jobs(request.keywords, request.location)
        return {"jobs": jobs}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in search_jobs endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.post("/search-jobs-by-resume")
async def search_jobs_by_resume(resume: UploadFile = File(...)):
    """Endpoint for resume-based job search."""
    try:
        logger.info(f"Received resume-based search request - File: {resume.filename}")
        
        # Read and process the uploaded resume
        content = await resume.read()
        resume_text = await extract_text_from_pdf(content)
        
        # Extract keywords and location from resume
        extracted_info = extract_keywords_from_resume(resume_text)
        
        if not extracted_info["keywords"]:
            logger.warning("No keywords extracted from resume")
            return {"jobs": []}
        
        # Search jobs using the extracted keywords and location
        jobs = await search_adzuna_jobs(
            keywords=extracted_info["keywords"],
            location=extracted_info["location"]
        )
        
        return {"jobs": jobs}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in search_jobs_by_resume endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        ) 