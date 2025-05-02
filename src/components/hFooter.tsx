
import type React from 'react';
import { Gamepad2 } from 'lucide-react';

const hFooter: React.FC = () => {
  return (
    <footer className="container mx-auto px-4 max-w-6xl mt-20 pt-10 pb-8">
      <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Gamepad2 className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-800">FundRaisely</h1>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 md:mb-0">
          <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Terms of Service</a>
          <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Contact Us</a>
        </div>
        
        <div className="text-sm text-gray-500">
          © 2025 FundRaisely. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default hFooter;