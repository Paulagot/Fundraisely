import React from 'react';
import { useQuizConfig } from '../../../hooks/quiz/useQuizConfig';

const EditableSettingsPanel: React.FC = () => {
  const { config, updateConfig } = useQuizConfig();

  const handleChange = (field: 'roundCount' | 'timePerQuestion', value: number) => {
    if (value >= 1) {
      updateConfig({ [field]: value });
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Game Settings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Round Count */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="roundCount">
            Number of Rounds
          </label>
          <input
            id="roundCount"
            type="number"
            min={1}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={config.roundCount ?? ''}
            onChange={(e) => handleChange('roundCount', Number(e.target.value))}
            placeholder="e.g. 5"
          />
        </div>

        {/* Time per Question */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="timePerQuestion">
            Time Per Question (seconds)
          </label>
          <input
            id="timePerQuestion"
            type="number"
            min={5}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={config.timePerQuestion ?? ''}
            onChange={(e) => handleChange('timePerQuestion', Number(e.target.value))}
            placeholder="e.g. 30"
          />
        </div>
      </div>
    </div>
  );
};

export default EditableSettingsPanel;
