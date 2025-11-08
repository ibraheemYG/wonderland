'use client';

import { useState } from 'react';
import SurveyForm from './SurveyForm';

export default function SurveySidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Survey Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-32 z-30 p-3 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition transform hover:scale-110"
        title="استبيان سريع"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </button>

      {/* Survey Form Modal */}
      {isOpen && (
        <SurveyForm onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
