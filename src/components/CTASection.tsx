import type React from 'react';

const CTASection: React.FC = () => {
  return (
    <div className="container mx-auto px-4 max-w-6xl mt-20 pt-10">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-8 py-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Run Compliant Fundraising Events?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">Join clubs and charities using FundRaisely to manage bingo, lotteries, and quizzes with automatic compliance controls</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              type="button"
              onClick={() => document.getElementById('create-room-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-50 transition"
            >
              Host an Event
            </button>
            <button 
              type="button"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-800 transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;