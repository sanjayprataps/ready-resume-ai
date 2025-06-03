// API Configuration
const isLovablePreview = window.location.hostname.includes('lovable.app');

export const API_BASE_URL = isLovablePreview
  ? 'http://localhost:8000'  // For Lovable preview, we'll use localhost since the backend isn't deployed yet
  : process.env.NODE_ENV === 'production'
    ? 'https://ready-resume-ai.onrender.com'  // Your Render backend URL
    : 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  GENERATE_RESUME: process.env.NODE_ENV === 'production'
    ? 'https://ready-resume-ai.onrender.com/generate-resume'
    : 'http://localhost:8000/generate-resume',
  ANALYZE_RESUME: process.env.NODE_ENV === 'production'
    ? 'https://ready-resume-ai.onrender.com/analyze-resume'
    : 'http://localhost:8000/analyze-resume',
  GENERATE_PORTFOLIO: `${API_BASE_URL}/api/generate-portfolio`,
  GENERATE_COVER_LETTER: `${API_BASE_URL}/api/generate-cover-letter`,
  ANALYZE_CAREER: `${API_BASE_URL}/analyze-career`,
  INTERVIEW_COACH: {
    START: process.env.NODE_ENV === 'production'
      ? 'https://ready-resume-ai.onrender.com/api/interview-coach/start'
      : 'http://localhost:8000/api/interview-coach/start',
    SUBMIT_ANSWER: process.env.NODE_ENV === 'production'
      ? 'https://ready-resume-ai.onrender.com/api/interview-coach/submit-answer'
      : 'http://localhost:8000/api/interview-coach/submit-answer'
  }
} as const; 