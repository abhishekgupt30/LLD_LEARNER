export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'Completed' | 'In Progress' | 'Unattempted';

export interface TraceEvent {
  time: string;
  label: string;
  desc: string;
  codeSnippet?: string;
  color?: string;
}

export interface ExpectedConcept {
  id: string;
  name: string;
  points: number;
  status: 'completed' | 'partial' | 'pending';
}

export interface ScorecardCriterion {
  category: string;
  points: number;
  maxPoints: number;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  prerequisites: string;
  timeTarget: string;
  description: string;
  patterns: string[];
  status: ProblemStatus;
  attemptNumber?: number;
  score?: number;
  lastSaved?: string;
  acceptanceRate?: string;
  focusArea?: string;
  entityComplexity?: string;
  requirements: {
    functional: string[];
    nonFunctional?: string[];
    assumptions?: string[];
  };
  scenario: {
    traceId: string;
    events: TraceEvent[];
  };
  constraints: {
    concurrencyNotice: string;
    targets: string[];
    memoryBudget: string;
  };
  hints: {
    title: string;
    desc: string;
    icon?: string;
  }[];
  expectedConcepts: ExpectedConcept[];
  scorecardWeighting: ScorecardCriterion[];
  starterTemplate: Record<string, string>;
  starterCode: string;
  language: string;
}
