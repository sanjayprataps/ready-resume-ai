// API Configuration
const isLovablePreview = window.location.hostname.includes('lovable.app');

export const API_BASE_URL = isLovablePreview
  ? 'http://localhost:8000'  // For Lovable preview, we'll use localhost since the backend isn't deployed yet
  : process.env.NODE_ENV === 'production'
    ? 'https://ready-resume-ai.onrender.com'  // Your Render backend URL
    : 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  GENERATE_RESUME: `${API_BASE_URL}/generate-resume`,
  ANALYZE_RESUME: `${API_BASE_URL}/analyze-resume`,
  GENERATE_PORTFOLIO: `${API_BASE_URL}/api/generate-portfolio`,
  GENERATE_COVER_LETTER: `${API_BASE_URL}/api/generate-cover-letter`,
  INTERVIEW_COACH_START: `${API_BASE_URL}/api/interview-coach/start`,
  INTERVIEW_COACH_SUBMIT: `${API_BASE_URL}/api/interview-coach/submit-answer`,
  SEARCH_JOBS: `${API_BASE_URL}/api/search-jobs`,
  SEARCH_JOBS_BY_RESUME: `${API_BASE_URL}/api/search-jobs-by-resume`,
  ANALYZE_CAREER: `${API_BASE_URL}/analyze-career`,
} as const; 