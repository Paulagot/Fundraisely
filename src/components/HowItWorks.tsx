import type React from 'react';

const HowItWorks: React.FC = () => {
  return (
    <div id="how-it-works" className="container mx-auto px-4 max-w-6xl mt-20 pt-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">A complete regulatory compliance system for all your fundraising activities</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Register & Verify</h3>
          <p className="text-gray-600">Organizations register with required licenses and permits for various fundraising activities</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Configure Events</h3>
          <p className="text-gray-600">Set up bingo games, lotteries or quizzes with built-in compliance parameters automatically enforced</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Run & Report</h3>
          <p className="text-gray-600">Host events with automatic compliance tracking and generate complete regulatory reports</p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;