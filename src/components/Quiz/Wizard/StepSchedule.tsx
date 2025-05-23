import { FC, useState } from 'react';
import type { WizardStepProps } from './WizardStepProps';
import { useQuizConfig } from '../useQuizConfig';

const StepSchedule: FC<WizardStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig } = useQuizConfig();
  const [startTime, setStartTime] = useState(config.startTime ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime) return;
    updateConfig({ startTime });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-800">Step 8 of 9: Set Schedule</h2>
      <p className="text-sm text-gray-600 mb-2">
        Choose when the quiz should begin. This will be used to time reminders and room opening.
      </p>

      <div>
        <label htmlFor="startTime" className="block text-gray-700 font-medium mb-1">
          Quiz Start Time (Local Time)
        </label>
        <input
          id="startTime"
          type="datetime-local"
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-between">
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

export default StepSchedule;
