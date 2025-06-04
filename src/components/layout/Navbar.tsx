import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <nav className="bg-white shadow-sm py-4 fixed w-full top-0 z-50">
      <div className="container-wide flex justify-between items-center">
        <div className="flex-1"></div>
        
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="font-display text-portfolioai-primary font-bold text-5xl">
              Portfolio<span className="text-portfolioai-accent">AI</span>
            </span>
          </Link>
        </div>
        
        <div className="flex-1"></div>
      </div>
    </nav>;
};
export default Navbar;