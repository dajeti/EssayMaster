import { FeedbackSuggestion } from '../types';

interface SuggestionsListProps {
  suggestions: FeedbackSuggestion[];
  onHover: (sugId?: string) => void;
  onToggleResolved: (sugId: string) => void;
}

export const SuggestionsList = ({ 
  suggestions,
  onHover,
  onToggleResolved,
}: SuggestionsListProps) => (
  <div className="mt-4">
    {suggestions.map((sug) => (
      <div
        key={sug.id}
        className={`p-2 border rounded mb-2 transition-colors ${
          sug.resolved ? "bg-gray-200 dark:bg-gray-700" : "bg-white dark:bg-darker-custom hover:bg-gray-50"
        }`}
        onMouseEnter={() => onHover(sug.id)}
        onMouseLeave={() => onHover()}
      >
        <strong>Suggestion:</strong> {sug.advice}
        <button
          className="ml-3 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          onClick={() => onToggleResolved(sug.id)}
        >
          {sug.resolved ? "Unresolve" : "Mark Resolved"}
        </button>
        {sug.snippet && (
          <div className="mt-1 text-sm text-gray-600">
            <em>Snippet:</em> {sug.snippet}
          </div>
        )}
      </div>
    ))}
  </div>
);