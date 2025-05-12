// components/quiz/wizard/QuizWizard.tsx
import { useState } from 'react';
import StepHostInfo from './StepHostInfo';
import StepGameType from './StepGameType';
import StepFundraisingOptions from './StepFundraisingOptions';
import StepPaymentMethod from './StepPaymentMethod';
import StepReviewLaunch from './StepReviewLaunch';

const steps = ['host', 'type', 'fundraising', 'payment', 'review'] as const;
type Step = typeof steps[number];

export default function QuizWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const goNext = () => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentStep = steps[currentStepIndex];

  const renderStep = () => {
    switch (currentStep) {
      case 'host':
        return <StepHostInfo onNext={goNext} />;
      case 'type':
        return <StepGameType onNext={goNext} onBack={goBack} />;
      case 'fundraising':
        return <StepFundraisingOptions onNext={goNext} onBack={goBack} />;
      case 'payment':
        return <StepPaymentMethod onNext={goNext} onBack={goBack} />;
      case 'review':
        return <StepReviewLaunch onBack={goBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-indigo-800">Create Your Fundraising Quiz</h1>
        <p className="text-sm text-gray-600 mt-2">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">{renderStep()}</div>
    </div>
  );
}
