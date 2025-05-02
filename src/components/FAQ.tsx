import type React from 'react';

const FAQ: React.FC = () => {
  return (
    <div id="faq" className="container mx-auto px-4 max-w-6xl mt-20 pt-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Get answers to common questions about FundRaisely</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2 text-gray-800">What fundraising events can I run?</h3>
          <p className="text-gray-600">Our platform supports bingo games, lotteries, and skill-based quizzes - each with appropriate compliance controls built in.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2 text-gray-800">How does it ensure compliance?</h3>
          <p className="text-gray-600">We automatically enforce legal limits on stakes, minimum charity percentages, and age verification based on your jurisdiction.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2 text-gray-800">What reporting features are included?</h3>
          <p className="text-gray-600">Comprehensive regulatory-ready reports showing all transactions, winners, and charitable distributions with verified audit trails.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2 text-gray-800">Do I need special licenses?</h3>
          <p className="text-gray-600">Our system will guide you through the necessary permits for your organization and activity type, ensuring full compliance.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;