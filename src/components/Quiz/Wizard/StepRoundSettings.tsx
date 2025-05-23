import { FC, useState } from 'react';
import type { WizardStepProps } from './WizardStepProps';
import { useQuizConfig } from '../useQuizConfig';
import { quizGameTypes } from '../../../constants/quiztypeconstants';

const StepRoundSettings: FC<WizardStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig } = useQuizConfig();
  const selectedDefaults = quizGameTypes.find((t) => t.id === config.gameType)?.defaultConfig;

  const [questionsPerRound, setQuestionsPerRound] = useState(config.questionsPerRound ?? 5);
  const [timePerQuestion, setTimePerQuestion] = useState(
    config.timePerQuestion ?? selectedDefaults?.timePerQuestion ?? 30
  );
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(config.totalTimeSeconds ?? 120);

  const isSpeedRound = config.gameType === 'speed_round';

  const handleResetDefaults = () => {
    setQuestionsPerRound(selectedDefaults?.questionsPerRound ?? 5);
    setTimePerQuestion(selectedDefaults?.timePerQuestion ?? 30);
    if (isSpeedRound) {
      setTotalTimeSeconds(120); // default
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      questionsPerRound,
      timePerQuestion,
      ...(isSpeedRound && { totalTimeSeconds }),
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-800">Step 6 of 7: Customize Rounds</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            How many questions per round?
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={questionsPerRound}
            onChange={(e) => setQuestionsPerRound(Number(e.target.value))}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Time per question (in seconds)
          </label>
          <input
            type="number"
            min={5}
            max={180}
            value={timePerQuestion}
            onChange={(e) => setTimePerQuestion(Number(e.target.value))}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
          />
        </div>

        {isSpeedRound && (
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Total time for round (in seconds)
            </label>
            <input
              type="number"
              min={30}
              max={600}
              value={totalTimeSeconds}
              onChange={(e) => setTotalTimeSeconds(Number(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleResetDefaults}
          className="text-sm text-indigo-600 hover:underline"
        >
          Reset to defaults for this quiz type
        </button>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-5 rounded-xl"
        >
          Back
        </button>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-5 rounded-xl"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default StepRoundSettings;

