import { Evaluation } from '../types/evaluation';
import { BlueprintSections } from '../types/submission';
import { attemptService } from './attemptService';
import { api } from './api';

export interface PreCheckResult {
  valid: boolean;
  scoreEstimate: number;
  totalSections: number;
  completedSections: number;
  warnings: string[];
  suggestions: string[];
}

export const evaluationService = {
  async getEvaluationByAttemptId(attemptId: string): Promise<Evaluation | null> {
    const id = attemptId.startsWith('eval-') ? attemptId.slice(5) : attemptId;
    const raw = await api.get<any>(`/attempts/${id}/evaluation`);
    const attempt = await api.get<any>(`/attempts/${id}`);
    const problem = await api.get<any>(`/problems/${attempt.problem_id}`);
    const result = raw.result || {};
    const score = raw.score ?? result.score ?? 0;
    const issues = (result.issues || result.critical_issues || []).map((issue: any, index: number) => ({ id: String(index), number: String(index + 1).padStart(2, '0'), title: issue.title || `Finding ${index + 1}`, type: issue.category || issue.severity || 'Finding', dimension: issue.category || 'Architecture', severity: issue.severity || 'WARNING', specificIssue: issue.issue || issue.specific_issue || issue.title || 'Review finding', rootCause: issue.why || issue.root_cause || 'See evaluator reasoning.', realWorldImpact: issue.impact || 'May reduce correctness or maintainability.', primaryFix: issue.primary_fix || issue.suggestion || 'State the invariant and show the responsible abstraction.', staffTradeoff: issue.alternative || issue.staff_tradeoff || 'Balance complexity against the requirement.', filePath: issue.file_path || '', diffContent: issue.diff || '' }));
    const rubricScores = Object.entries(result.dimensions || result.category_scores || {}).map(([dimension, value]: [string, any]) => ({ dimension, score: typeof value === 'number' ? value : value?.score || 0, feedback: typeof value === 'object' ? value?.feedback || '' : '' }));
    return { ...(result as any), id: raw.id, attemptId: id, problemId: attempt.problem_id, problemTitle: problem.title, attemptNumber: attempt.attempt_number, overallScore: score, staffReadyStatus: raw.status, overallSummary: result.summary || '', rubricScores, issues } as Evaluation & any;
  },

  async runPreCheck(sections: BlueprintSections): Promise<PreCheckResult> {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let completedCount = 0;

    if (!sections.sec0_requirements || sections.sec0_requirements.trim().length < 15) {
      warnings.push('Section 0 (Requirements): Missing explicit capacity or concurrency assumptions.');
    } else {
      completedCount++;
    }

    if (!sections.sec1_classes || sections.sec1_classes.trim().length < 15) {
      warnings.push('Section 1 (Classes): Core entities not defined or too short.');
    } else {
      completedCount++;
    }

    if (!sections.sec2_relationships || sections.sec2_relationships.trim().length < 15) {
      warnings.push('Section 2 (Relationships): Composition vs Aggregation relationships missing.');
    } else {
      completedCount++;
    }

    if (!sections.sec3_interfaces || sections.sec3_interfaces.trim().length < 15) {
      warnings.push('Section 3 (Interfaces): Strategy or abstract contracts missing.');
    } else {
      completedCount++;
    }

    if (!sections.sec4_patterns || sections.sec4_patterns.trim().length < 15) {
      suggestions.push('Section 4 (Patterns): Clearly specify why each design pattern was chosen.');
    } else {
      completedCount++;
    }

    if (sections.sec5_explanation && sections.sec5_explanation.trim().length > 15) completedCount++;
    if (sections.sec6_extensibility && sections.sec6_extensibility.trim().length > 15) completedCount++;

    if (!sections.sec7_concurrency || sections.sec7_concurrency.trim().length < 20) {
      warnings.push('Section 7 (Concurrency): Must discuss race conditions and slot locking invariants.');
    } else {
      completedCount++;
    }

    if (sections.sec8_tradeoffs && sections.sec8_tradeoffs.trim().length > 15) completedCount++;
    if (sections.sec9_diagramNotes && sections.sec9_diagramNotes.trim().length > 10) completedCount++;
    if (sections.sec10_code && sections.sec10_code.trim().length > 20) completedCount++;

    const scoreEstimate = Math.min(95, Math.round((completedCount / 11) * 90 + 5));

    return Promise.resolve({
      valid: warnings.length === 0,
      scoreEstimate,
      totalSections: 11,
      completedSections: completedCount,
      warnings,
      suggestions
    });
  },

  async submitAttemptForEvaluation(
    attemptId: string,
    sections: BlueprintSections
  ): Promise<Evaluation> {
    await attemptService.submit(attemptId, sections);
    return (await this.getEvaluationByAttemptId(attemptId)) as Evaluation;
  }
,

  async retryEvaluation(attemptId: string): Promise<void> {
    await api.post(`/attempts/${attemptId}/evaluation/retry`);
  }
};
