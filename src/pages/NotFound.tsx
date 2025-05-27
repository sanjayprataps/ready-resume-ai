/**
 * 404 Not Found Page Component
 * ---------------------------
 * This component is rendered when a user attempts to access a non-existent route.
 * It provides a user-friendly error message and a way to return to the home page.
 * 
 * Features:
 * - Error logging for debugging
 * - Clean and simple UI
 * - Easy navigation back to home
 */

// Import necessary hooks
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * NotFound Component
 * 
 * Displays a 404 error page when a user navigates to a non-existent route.
 * Logs the attempted path for debugging purposes.
 * 
 * @returns {JSX.Element} The 404 error page
 */
const NotFound = () => {
  // Get the current location for logging
  const location = useLocation();

  // Log the 404 error when the component mounts
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
