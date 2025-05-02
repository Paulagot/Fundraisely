import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

const Headers: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">FundRaisely</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a>
          <a href="#benefits" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Benefits</a>
          <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">FAQ</a>
          <Link to="/pitch-deck" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Pitch Deck</Link>
        </div>
      </div>
    </header>
  );
};

export default Headers;