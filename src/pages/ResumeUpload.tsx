
import MainLayout from "@/components/layout/MainLayout";
import ResumeUploadForm from "@/components/resume/ResumeUploadForm";

const ResumeUpload = () => {
  return (
    <MainLayout>
      <div className="py-12 md:py-16 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl font-bold text-portfolioai-primary">Let's Get Started</h1>
            <p className="mt-3 text-gray-600">
              Upload your resume or LinkedIn profile to begin creating your personalized career materials
            </p>
          </div>
          <ResumeUploadForm />
        </div>
      </div>
    </MainLayout>
  );
};

export default ResumeUpload;
