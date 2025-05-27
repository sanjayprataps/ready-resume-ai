/**
 * Resume Upload Page Component
 * ---------------------------
 * This page allows users to upload their existing resume or LinkedIn profile
 * to begin creating personalized career materials.
 * 
 * Features:
 * - Clean and intuitive upload interface
 * - Support for resume and LinkedIn profile uploads
 * - Clear user instructions
 * - Responsive design
 */

// Import layout and form components
import MainLayout from "@/components/layout/MainLayout";
import ResumeUploadForm from "@/components/resume/ResumeUploadForm";

/**
 * ResumeUpload Component
 * 
 * Renders the resume upload page with a header section and the upload form.
 * The page is wrapped in the main layout for consistent styling and navigation.
 * 
 * @returns {JSX.Element} The resume upload page
 */
const ResumeUpload = () => {
  return (
    <MainLayout>
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container">
          {/* Header section with title and description */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl font-bold text-portfolioai-primary">Let's Get Started</h1>
            <p className="mt-3 text-gray-600">
              Upload your resume or LinkedIn profile to begin creating your personalized career materials
            </p>
          </div>
          {/* Main upload form component */}
          <ResumeUploadForm />
        </div>
      </div>
    </MainLayout>
  );
};

export default ResumeUpload;
