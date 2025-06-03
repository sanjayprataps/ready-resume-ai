"""
Interview Coach Module
--------------------
This module provides AI-powered mock interview functionality. It includes:

1. Interview Session Management:
   - Starting new interview sessions
   - Managing interview state
   - Storing session data
   - Handling multiple concurrent sessions

2. Question Generation:
   - Role-specific questions based on resume and job description
   - Progressive question difficulty
   - Context-aware follow-up questions

3. Answer Analysis:
   - Detailed feedback on each answer
   - Overall performance analysis
   - Structured JSON response format

4. Integration Features:
   - PDF resume text extraction
   - Groq LLM API integration
   - Session persistence
   - Error handling and validation

The module uses the Groq LLM API for generating questions and analyzing answers,
with a focus on providing constructive feedback and maintaining interview context.
"""

import os
import uuid
import PyPDF2
import httpx
from typing import Dict
from fastapi import APIRouter, UploadFile, Form, File, HTTPException
from tempfile import NamedTemporaryFile
from dotenv import load_dotenv
import groq
from io import BytesIO

load_dotenv()

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

session_store: Dict[str, Dict] = {}

client = groq.Groq(api_key=GROQ_API_KEY)

def extract_text_from_pdf(file_obj) -> str:
    try:
        # Reset file pointer to beginning
        file_obj.seek(0)
        pdf_reader = PyPDF2.PdfReader(file_obj)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error in extract_text_from_pdf: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

def get_initial_prompt(resume: str, job_desc: str) -> str:
    return f"""
You are an AI mock interview coach. Based on the resume and job description below, generate the first of five role-specific interview questions. Ask only one question at a time.

Resume:
{resume}

Job Description:
{job_desc}

Provide only the first interview question.
"""

def get_followup_prompt(previous_qas: list, next_question: bool = True) -> str:
    formatted = "\n\n".join([
        f"Question: {qa['question']}\nAnswer: {qa['answer']}" for qa in previous_qas
    ])
    if next_question:
        return f"""
You are an AI interview coach continuing a mock interview.
Based on the following Q&A history, provide the next role-specific interview question. Only one question.

{formatted}
"""
    else:
        return f"""
You are an AI career coach. Analyze the following mock interview Q&A and provide structured feedback.
Your response MUST be in the following JSON format:
{{
    "questionAnalysis": [
        {{
            "question": "The question asked",
            "answer": "The candidate's answer",
            "feedback": "Your detailed feedback on this answer"
        }},
        // ... repeat for each Q&A pair
    ],
    "overallAnalysis": "Your overall analysis of the candidate's performance"
}}

Here is the Q&A history to analyze:
{formatted}

Remember to:
1. Keep the exact JSON structure shown above
2. Include all questions and answers in the analysis
3. Provide specific, actionable feedback
4. Ensure the JSON is properly formatted and valid
"""

async def ask_groq(prompt: str) -> str:
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        body = {
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 1024,
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(GROQ_API_URL, headers=headers, json=body)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Error in ask_groq: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calling Groq API: {str(e)}")

@router.post("/api/interview-coach/start")
async def start_interview(resume: UploadFile = File(...), job_description: str = Form(...)):
    print("\n=== Starting Interview Session ===")
    
    if not resume:
        print("No file uploaded")
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    try:
        # Read the file content
        print("Reading file content...")
        contents = await resume.read()
        if not contents:
            print("Empty file uploaded")
            raise HTTPException(status_code=400, detail="Empty file uploaded")
            
        # Create a BytesIO object from the file content
        print("Creating BytesIO object...")
        file_obj = BytesIO(contents)
        
        # Extract text from PDF
        print("Extracting text from PDF...")
        resume_text = extract_text_from_pdf(file_obj)
        if not resume_text.strip():
            print("No text extracted from PDF")
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
            
        # Generate interview question
        print("Generating interview question...")
        session_id = str(uuid.uuid4())
        try:
            question = await ask_groq(get_initial_prompt(resume_text, job_description))
            print(f"Generated question: {question}")
        except Exception as e:
            print(f"Error generating question: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to generate interview question: {str(e)}")
        
        # Store session data
        print("Storing session data...")
        session_store[session_id] = {
            "resume": resume_text,
            "job_description": job_description,
            "qas": [{"question": question, "answer": None}]
        }
        
        print("Interview session started successfully")
        return {"session_id": session_id, "question": question}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in start_interview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")
    finally:
        print("Closing file...")
        await resume.close()

@router.post("/api/interview-coach/submit-answer")
async def submit_answer(session_id: str = Form(...), answer: str = Form(...)):
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    qa_list = session_store[session_id]["qas"]
    if qa_list[-1]["answer"] is not None:
        raise HTTPException(status_code=400, detail="Answer already submitted for latest question")

    qa_list[-1]["answer"] = answer

    if len(qa_list) >= 5:
        try:
            analysis_json = await ask_groq(get_followup_prompt(qa_list, next_question=False))
            import json
            try:
                # Clean the response by removing markdown code blocks if present
                cleaned_response = analysis_json.strip()
                if cleaned_response.startswith("```json"):
                    cleaned_response = cleaned_response[7:]  # Remove ```json
                if cleaned_response.startswith("```"):
                    cleaned_response = cleaned_response[3:]  # Remove ```
                if cleaned_response.endswith("```"):
                    cleaned_response = cleaned_response[:-3]  # Remove trailing ```
                cleaned_response = cleaned_response.strip()
                
                # Try to parse the JSON response
                parsed = json.loads(cleaned_response)
                
                # Validate the expected structure
                if not isinstance(parsed, dict):
                    raise ValueError("Analysis must be a JSON object")
                if "questionAnalysis" not in parsed or "overallAnalysis" not in parsed:
                    raise ValueError("Analysis missing required fields")
                if not isinstance(parsed["questionAnalysis"], list):
                    raise ValueError("questionAnalysis must be an array")
                if not isinstance(parsed["overallAnalysis"], str):
                    raise ValueError("overallAnalysis must be a string")
                
                # Validate each question analysis
                for qa in parsed["questionAnalysis"]:
                    if not all(key in qa for key in ["question", "answer", "feedback"]):
                        raise ValueError("Each question analysis must have question, answer, and feedback")
                
                return {"status": "success", "isComplete": True, "analysis": parsed}
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {str(e)}")
                print(f"Raw response: {analysis_json}")
                print(f"Cleaned response: {cleaned_response}")
                raise HTTPException(status_code=500, detail="LLM returned malformed JSON. Please try again.")
            except ValueError as e:
                print(f"JSON validation error: {str(e)}")
                print(f"Raw response: {analysis_json}")
                print(f"Cleaned response: {cleaned_response}")
                raise HTTPException(status_code=500, detail=f"Invalid analysis format: {str(e)}")
        except Exception as e:
            print(f"Error generating analysis: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(e)}")
    else:
        try:
            next_q = await ask_groq(get_followup_prompt(qa_list))
            qa_list.append({"question": next_q, "answer": None})
            return {"status": "success", "isComplete": False, "nextQuestion": next_q}
        except Exception as e:
            print(f"Error generating next question: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to generate next question: {str(e)}")
