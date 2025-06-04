import { Link } from "react-router-dom";
import { Mail, MessageSquare } from "lucide-react";

const Footer = () => {
  return <footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-8">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <span className="font-display text-portfolioai-primary text-xl font-bold">
                Portfolio<span className="text-portfolioai-accent">AI</span>
              </span>
            </div>
            <div className="mt-6 flex space-x-4">
              <a href="https://www.linkedin.com/in/sanjay-pratap-sagi-a4122479/" className="text-gray-500 hover:text-portfolioai-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
              </a>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-medium text-gray-900">Information</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="https://github.com/sanjayprataps/ready-resume-ai/blob/main/README.md" className="text-gray-600 hover:text-portfolioai-secondary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="mailto:sanjaypratap.wrk@gmail.com" className="text-gray-600 hover:text-portfolioai-secondary transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="https://github.com/sanjayprataps/ready-resume-ai/issues" className="text-gray-600 hover:text-portfolioai-secondary transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} PortfolioAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};

export default Footer;