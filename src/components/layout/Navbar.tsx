
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm py-4 fixed w-full top-0 z-50">
      <div className="container-wide flex justify-center items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="font-display text-portfolioai-primary text-2xl font-bold">
              Portfolio<span className="text-portfolioai-accent">AI</span>
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
