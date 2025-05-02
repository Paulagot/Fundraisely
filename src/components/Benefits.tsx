import type React from 'react';
import { Shield, CheckCircle, Users, Heart, Wallet, Gamepad2 } from 'lucide-react';

const Benefit: React.FC = () => {
  return (
    <div id="benefits" className="container mx-auto px-4 max-w-6xl mt-20 pt-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Benefits for Clubs & Charities</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive compliance and management for all regulated fundraising activities</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">License & Permit Tracking</h3>
            <p className="text-gray-600">Automatically track and verify all required licenses and permits for each type of fundraising event</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Fraud Prevention</h3>
            <p className="text-gray-600">Eliminate accusations of favoritism with verifiable random selections and transparent winner determination</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Multiple Event Types</h3>
            <p className="text-gray-600">Run bingo games, lotteries, or skill-based quizzes - each with appropriate compliance controls built in</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Complete Audit Trail</h3>
            <p className="text-gray-600">Permanent, tamper-proof records of all transactions and winners for full regulatory compliance</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Enforced Compliance</h3>
            <p className="text-gray-600">System automatically enforces legal requirements like maximum stakes, minimum charity percentages, and age restrictions</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Public Trust Builder</h3>
            <p className="text-gray-600">Build donor confidence with transparent processes and verifiable audit trails that showcase your integrity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Benefit;