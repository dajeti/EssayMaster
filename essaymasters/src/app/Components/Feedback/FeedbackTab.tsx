'use client';

import React, { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import FeedbackChart from './FeedbackChart';
import { useMarkScheme } from './hooks/useMarkScheme';
import { UploadMarkScheme } from './parts/UploadMarkScheme';
import { SuggestionsList } from './parts/SuggestionsList';
import { generateFeedback, uploadMarkScheme } from './api';
import type { FeedbackTabProps, GPTResponse, CriteriaScores, CriteriaReasons } from './types';

export default function FeedbackTab(props: FeedbackTabProps) {
  const [score, setScore] = useState<string | number>('N/A');
  const [criteria, setCriteria] = useState<CriteriaScores | null>(null);
  const [criteriaReasons, setCriteriaReasons] = useState<CriteriaReasons | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  
  const { markSchemeUrl, setMarkSchemeUrl, isLoading: isMarkLoading } = useMarkScheme(props.sessionId);

  const handleGenerateFeedback = async () => {
    // Implementation using generateFeedback from api.ts
    // (similar to original but using the extracted functions)
  };

  return (
    <ThemeProvider attribute="class">
      <div className="flex-1 overflow-auto p-3 border rounded bg-white dark:bg-blue-custom-dark relative">
        <h2 className="font-bold text-lg mb-3">Generate Feedback</h2>
        
        <UploadMarkScheme
          markSchemeUrl={markSchemeUrl}
          isLoading={isMarkLoading || isFeedbackLoading}
          onUpload={async (file) => {
            const url = await uploadMarkScheme(file, props.sessionId);
            setMarkSchemeUrl(url);
          }}
        />

        {/* Generate Button */}
        <button
          onClick={handleGenerateFeedback}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          disabled={isFeedbackLoading || isMarkLoading}
        >
          Generate Feedback
        </button>

        {/* Score and Criteria Display */}
        {/* Suggestions List */}
        <SuggestionsList
          suggestions={props.suggestions}
          onHover={props.onHoverSuggestion}
          onToggleResolved={props.onToggleResolved}
        />
      </div>
    </ThemeProvider>
  );
}