import type React from 'react';
import { Gamepad2, Shield, Heart, Users } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="pt-16 pb-8 px-4">
      {/* Reduced top padding from pt-24 to pt-16 */}
      {/* Reduced bottom padding from pb-10 to pb-8 */}
      <div className="container mx-auto max-w-6xl">
        <div className="relative">
          {/* Background Elements */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-300 rounded-full opacity-20 blur-2xl" />
          <div className="absolute top-20 -right-10 w-40 h-40 bg-indigo-300 rounded-full opacity-20 blur-2xl"/>
          
          {/* Hero Content */}
          <div className="text-center relative z-10">
            <div className="inline-block p-3 bg-indigo-100 rounded-full mb-6 animate-pulse">
              <Gamepad2 className="h-12 w-12 text-indigo-600" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent leading-tight">
              FundRaisely: Compliant Fundraising for Clubs & Charities
            </h1>
            
            <p className="text-lg md:text-xl text-indigo-900/70 max-w-3xl mx-auto mb-8">
              Host bingo, lotteries and quizzes with built-in compliance checks, automatically enforced limits, and comprehensive reporting for all regulatory requirements.
            </p>
            
            <p className="text-xl font-semibold text-indigo-700 mb-6 italic">
              "A world where fundraising is fun, fair, and fraud-proof."
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {/* Reduced margin bottom from mb-12 to mb-8 */}
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">Regulatory Enforcement</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                <Heart className="h-5 w-5 text-pink-600" />
                <span className="text-sm font-medium">License Tracking</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Complete Audit Trail</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
