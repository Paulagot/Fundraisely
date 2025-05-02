import { Link } from 'react-router-dom';
import { useState } from 'react';

const SimpleHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    // Close mobile menu after clicking
    setIsMobileMenuOpen(false);
    
    // Find the section element
    const section = document.getElementById(sectionId);
    if (section) {
      // Calculate position to scroll to (accounting for fixed header height)
      const headerHeight = 72; // Approximate height of your header in pixels
      const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      
      // Smooth scroll to the section
      window.scrollTo({
        top: sectionPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="bg-white shadow-md fixed w-full z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-indigo-700">Fundraisely</Link>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-700 hover:text-indigo-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <Link
                to="/"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('about-campaign')}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                About This Campaign
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('for-hosts')}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                For Hosts
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('for-players')}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                For Players
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('about-fundraisely')}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                About Fundraisely
              </button>
            </li>
            <li>
              <Link
                to="/pitch-deck"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Pitch Deck
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <ul className="flex flex-col space-y-2 px-4">
            <li>
              <Link
                to="/"
                className="block py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('about-campaign')}
                className="block w-full text-left py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                About This Campaign
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('for-hosts')}
                className="block w-full text-left py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                For Hosts
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('for-players')}
                className="block w-full text-left py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                For Players
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('about-fundraisely')}
                className="block w-full text-left py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                About Fundraisely
              </button>
            </li>
            <li>
              <Link
                to="/pitch-deck"
                className="block py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pitch Deck
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default SimpleHeader;