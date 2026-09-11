export interface DiagnosticIssue {
  id: string;
  number: string;
  category: string;
  title: string;
  severity: string;
  severityType: 'critical' | 'ocp' | 'low';
  specificIssue: {
    desc: string;
    loc: string;
  };
  rootCause: {
    desc: string;
    detail: string;
  };
  systemImpact: {
    desc: string;
    detail: string;
  };
  primaryFix: {
    desc: string;
    guarantee: string;
  };
  staffTradeoff: {
    title: string;
    desc: string;
    tag: string;
  };
  codeDiff?: {
    filename: string;
    removed: { line: number; text: string }[];
    added: { line: number; text: string }[];
  };
}

export interface SectionRubricEvaluation {
  secCode: string;
  title: string;
  score: number;
  maxScore: number;
  badge: string;
  badgeType: 'distinction' | 'warning' | 'neutral';
  subtext: string;
  details: { title?: string; text: string; passed?: boolean }[];
  metrics?: { label: string; value: string; highlight?: boolean }[];
  harnessResult?: string;
  jumpToIssueId?: string;
}

export interface Evaluation {
  id: string;
  attemptId: string;
  problemId: string;
  problemTitle: string;
  candidateName: string;
  candidateTrack: string;
  attemptNumber: number;
  evalDuration: string;
  filesAnalyzed: number;
  overallScore: number;
  overallGrade: string;
  overallSummary: string;
  passMark: number;
  deltaPrevious: string;
  dimensionalPerformance: {
    name: string;
    icon: string;
    score: number;
    rating: string;
    statusType: 'success' | 'tertiary' | 'error' | 'warning';
  }[];
  architecturalStrength: {
    title: string;
    desc: string;
    tag: string;
  };
  criticalVulnerability: {
    title: string;
    desc: string;
    tag: string;
  };
  staffTrackGuidance: {
    title: string;
    desc: string;
    tag: string;
  };
  structuredIssues: DiagnosticIssue[];
  sectionBreakdown: SectionRubricEvaluation[];
  rawAstJson?: string;
  issues?: any[];
  rubricScores?: { dimension: string; score: number; feedback: string }[];
  staffReadyStatus?: string;
}
