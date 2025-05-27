"""
Resume Optimizer Core Logic
--------------------------
This file contains the core logic for analyzing resumes against job descriptions.
The actual API endpoints are defined in main.py.
"""

import os
import groq
from typing import Dict
import PyPDF2
from fastapi import HTTPException

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
        print("\n" + "="*50)
        print("STARTING RESUME ANALYSIS")
        print("="*50)
        
        # Initialize Groq client
        client = groq.Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        
        # Debug log for model verification
        print("\n=== Model Configuration ===")
        target_model = "meta-llama/llama-4-maverick-17b-128e-instruct"
        print(f"Attempting to use model: {target_model}")
        
        prompt = f"""
        Analyze this resume against the job description and provide a structured analysis.
        Format your response EXACTLY as shown below, with bullet points.
        DO NOT include any thinking process, analysis steps, or additional text.
        DO NOT use any markers like <think> or similar.
        Start directly with the section headers and bullet points.

        Resume:
        {resume_text}
        
        Job Description:
        {job_desc}
        
        Required format:
        1. Key Strengths:
        • [First strength]
        • [Second strength]
        • [Third strength]
        
        2. Areas for Improvement:
        • [First area]
        • [Second area]
        • [Third area]
        
        3. Suggestions:
        • [First suggestion]
        • [Second suggestion]
        • [Third suggestion]
        """
        
        print("\n=== Making API Call ===")
        try:
            completion = client.chat.completions.create(
                model=target_model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a resume analysis expert. Your task is to analyze resumes against job descriptions.
                        Provide ONLY bullet-pointed analysis in the exact format requested.
                        DO NOT include any thinking process, analysis steps, or additional text.
                        DO NOT use any markers like <think> or similar.
                        Start directly with the section headers and bullet points.
                        Each section should contain 3-5 bullet points of relevant analysis.
                        Keep the analysis concise and focused on the most important points."""
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for more focused responses
                max_tokens=1000
            )
            
            # Debug log for model response
            print("\n=== Model Response ===")
            actual_model = completion.model
            print(f"Actual model used: {actual_model}")
            if actual_model != target_model:
                print(f"WARNING: Model mismatch! Expected {target_model} but got {actual_model}")
            print(f"Response length: {len(completion.choices[0].message.content)}")
            
            response_text = completion.choices[0].message.content.strip()
            print("\n=== Raw Response from Groq ===")
            print(response_text)
            print("="*50 + "\n")
            
            # Clean up the response
            def clean_text(text):
                print("\n=== Cleaning Text ===")
                print("Original text:", text)
                
                # Remove any thinking markers and their content
                text = text.replace("<think>", "").replace("</think>", "")
                text = text.replace("<thinking>", "").replace("</thinking>", "")
                
                # Remove any text before the first section header
                if "1. Key Strengths:" in text:
                    text = text[text.index("1. Key Strengths:"):]
                
                # Split into lines and clean each line
                lines = text.split("\n")
                cleaned_lines = []
                skip_line = False
                
                print("\nProcessing lines:")
                for line in lines:
                    original_line = line
                    # Skip lines that contain thinking process markers
                    if any(marker in line.lower() for marker in [
                        "let me", "i need to", "i will", "first,", "next,", "then,", "finally,",
                        "alright", "so,", "let's", "i'll", "i'm going to", "i should",
                        "i think", "i believe", "in my opinion", "looking at", "analyzing",
                        "considering", "examining", "reviewing", "evaluating", "okay, so",
                        "let me start", "let me begin", "first,", "looking at", "based on",
                        "from the", "in this", "the job", "the resume", "the candidate"
                    ]):
                        print(f"Skipping line (thinking process): {original_line}")
                        skip_line = True
                        continue
                    
                    # Skip empty lines or lines with just whitespace
                    if not line.strip():
                        print(f"Skipping empty line")
                        continue
                    
                    # If we find a section header, stop skipping lines
                    if line.strip().startswith(("1.", "2.", "3.")):
                        print(f"Found section header: {original_line}")
                        skip_line = False
                    
                    if not skip_line:
                        # Only keep lines that start with bullet points or section headers
                        if line.strip().startswith(("•", "1.", "2.", "3.")):
                            print(f"Keeping line: {original_line}")
                            cleaned_lines.append(line)
                        else:
                            print(f"Skipping line (not a bullet point or header): {original_line}")
                
                # Join the cleaned lines back together
                cleaned_text = "\n".join(cleaned_lines)
                
                # Ensure we have the proper section structure
                if not cleaned_text.startswith("1. Key Strengths:"):
                    cleaned_text = "1. Key Strengths:\n" + cleaned_text
                
                print("\nCleaned text:", cleaned_text)
                print("=============================\n")
                return cleaned_text.strip()
            
            # Clean the entire response
            response_text = clean_text(response_text)
            
            # More robust parsing of the response
            try:
                print("\n=== Parsing Sections ===")
                # Split by section headers
                sections = response_text.split("1. Key Strengths:")
                print(f"Found {len(sections)} sections after splitting by Key Strengths")
                
                if len(sections) < 2:
                    raise ValueError("Response missing Key Strengths section")
                
                strengths_section = sections[1].split("2. Areas for Improvement:")
                print(f"Found {len(strengths_section)} sections after splitting by Areas for Improvement")
                
                if len(strengths_section) < 2:
                    raise ValueError("Response missing Areas for Improvement section")
                
                weaknesses_section = strengths_section[1].split("3. Suggestions:")
                print(f"Found {len(weaknesses_section)} sections after splitting by Suggestions")
                
                if len(weaknesses_section) < 2:
                    raise ValueError("Response missing Suggestions section")
                
                # Clean each section
                strengths = clean_text(strengths_section[0])
                weaknesses = clean_text(weaknesses_section[0])
                suggestions = clean_text(weaknesses_section[1])
                
                print("\n=== Final Sections ===")
                print("Strengths:", strengths)
                print("Weaknesses:", weaknesses)
                print("Suggestions:", suggestions)
                print("=============================\n")
                
                return {
                    "strengths": strengths,
                    "weaknesses": weaknesses,
                    "suggestions": suggestions
                }
            except Exception as parse_error:
                print(f"\nError parsing response: {str(parse_error)}")
                print(f"Raw response: {response_text}")
                # Fallback to simple splitting if structured parsing fails
                parts = response_text.split("\n\n")
                if len(parts) >= 3:
                    return {
                        "strengths": clean_text(parts[0]),
                        "weaknesses": clean_text(parts[1]),
                        "suggestions": clean_text(parts[2])
                    }
                else:
                    raise ValueError("Could not parse the analysis response")
                    
        except Exception as api_error:
            print(f"\nError calling Groq API: {str(api_error)}")
            raise HTTPException(status_code=500, detail=f"Groq API error: {str(api_error)}")
                
    except Exception as e:
        print(f"\nError in analyze_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")