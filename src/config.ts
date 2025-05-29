// API Configuration
const isLovablePreview = window.location.hostname.includes('lovable.app');

export const API_BASE_URL = isLovablePreview
  ? 'http://localhost:8000'  // For Lovable preview, we'll use localhost since the backend isn't deployed yet
  : process.env.NODE_ENV === 'production'
    ? 'https://your-backend-domain.com'  // Replace with your production backend URL when deployed
    : 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  GENERATE_RESUME: `${API_BASE_URL}/generate-resume`,
  ANALYZE_RESUME: `${API_BASE_URL}/analyze-resume`,
  GENERATE_PORTFOLIO: `${API_BASE_URL}/api/generate-portfolio`
}; 