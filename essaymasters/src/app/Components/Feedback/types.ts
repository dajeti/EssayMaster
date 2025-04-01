export interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
}

export interface CriteriaScores {
  grammar: number;
  clarity: number;
  structure: number;
  analysis: number;
  markscheme?: number | null;
}

export interface CriteriaReasons {
  grammar?: string;
  clarity?: string;
  structure?: string;
  analysis?: string;
  markscheme?: string;
}

export interface GPTResponse {
  score: number | string;
  criteria?: {
    grammar?: number;
    clarity?: number;
    structure?: number;
    analysis?: number;
    markscheme?: number;
  };
  criteriaReasons?: CriteriaReasons;
  suggestions?: FeedbackSuggestion[];
}

export interface FeedbackTabProps {
  sessionId: string;
  essay: string;
  suggestions: FeedbackSuggestion[];
  onNewSuggestions: (newSuggestions: FeedbackSuggestion[]) => void;
  onToggleResolved: (sugId: string) => void;
  onHoverSuggestion: (sugId?: string) => void;
  setParentLoading: (val: boolean) => void;
}