import React, { useState } from 'react';

export function PitchDeckContent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 12;
  
  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  // The pitch deck content is embedded as an HTML file
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow relative">
        <iframe 
          src="/pitch-deck.html" 
          className="w-full h-full border-0" 
          title="FundRaisely Pitch Deck"
       />
      </div>
      
      <div className="p-4 flex justify-center space-x-4">
        <button 
         type="button"
          onClick={handlePrevious}
          disabled={currentSlide === 0}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div className="flex items-center">
          <span className="text-gray-700">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>
        <button 
         type="button"
          onClick={handleNext}
          disabled={currentSlide === totalSlides - 1}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}