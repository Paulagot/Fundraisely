// src/pages/QuizChallengePage.tsx
import { useState } from 'react';

import JoinQuizModal from '../components/Quiz/joinroom/JoinQuizModal';
import QuizWizard from '../components/Quiz/Wizard/QuizWizard';

const QuizChallengePage = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">🧠 Quiz Challenge</h1>
      <p className="mb-8 text-gray-700">
        Welcome to the ultimate fundraising quiz! Choose an action below to get started.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-indigo-700"
          onClick={() => setShowWizard(true)}
        >
          🎤 Host a Quiz
        </button>

        <button
          className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50"
          onClick={() => setShowJoinModal(true)}
        >
          🙋 Join a Quiz
        </button>
      </div>

      {showWizard && <QuizWizard onComplete={() => {/* navigate to dashboard */}} />}
      {showJoinModal && <JoinQuizModal onClose={() => setShowJoinModal(false)} />}
    </div>
  );
};

export default QuizChallengePage;
