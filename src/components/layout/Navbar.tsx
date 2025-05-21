
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm py-4 fixed w-full top-0 z-50">
      <div className="container-wide flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="font-display text-portfolioai-primary text-2xl font-bold">
              Portfolio<span className="text-portfolioai-accent">AI</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/features" className="text-gray-600 hover:text-portfolioai-secondary transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-gray-600 hover:text-portfolioai-secondary transition-colors">
            Pricing
          </Link>
          <Link to="/faq" className="text-gray-600 hover:text-portfolioai-secondary transition-colors">
            FAQ
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button className="bg-portfolioai-primary hover:bg-portfolioai-secondary text-white" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 animate-fade-in">
          <div className="container py-8 flex flex-col space-y-6">
            <Link 
              to="/features" 
              className="text-gray-600 py-2 text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="text-gray-600 py-2 text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/faq" 
              className="text-gray-600 py-2 text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </Link>
            <div className="flex flex-col space-y-4 pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
              </Button>
              <Button className="w-full bg-portfolioai-primary hover:bg-portfolioai-secondary" asChild>
                <Link to="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
