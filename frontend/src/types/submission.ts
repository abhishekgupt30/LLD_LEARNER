export interface BlueprintSections {
  sec0_requirements: string;
  sec1_classes: string;
  sec2_relationships: string;
  sec3_interfaces: string;
  sec4_patterns: string;
  sec5_explanation: string;
  sec6_extensibility: string;
  sec7_concurrency: string;
  sec8_tradeoffs: string;
  sec9_diagramNotes: string;
  sec10_code: string;
}

export interface Submission {
  id: string;
  attemptId: string;
  problemId: string;
  sections: BlueprintSections;
  language: string;
  submittedAt: string;
}
