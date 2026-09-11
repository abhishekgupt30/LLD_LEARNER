import { api } from './api';
import { Attempt } from '../types/attempt';
import { BlueprintSections } from '../types/submission';

type ApiAttempt = { id: string; user_id: string; problem_id: string; attempt_number: number; status: Attempt['status']; started_at: string; submitted_at?: string };
type ApiSubmission = { section_0_requirements: unknown; section_1_classes: unknown; section_2_relationships: unknown; section_3_abstractions: unknown; section_4_patterns: unknown; section_5_explanation: string; section_6_extensibility: unknown; section_7_edge_cases: unknown; section_8_tradeoffs: unknown; section_9_diagram: string; section_10_code: string };
const text = (value: unknown) => typeof value === 'string' ? value : value ? JSON.stringify(value) : '';
const map = (a: ApiAttempt, s?: ApiSubmission): Attempt => ({ id: a.id, userId: a.user_id, problemId: a.problem_id, attemptNumber: a.attempt_number, status: a.status, startedAt: a.started_at, updatedAt: a.started_at, submittedAt: a.submitted_at, timeSpentSeconds: 0, sections: { sec0_requirements: text(s?.section_0_requirements), sec1_classes: text(s?.section_1_classes), sec2_relationships: text(s?.section_2_relationships), sec3_interfaces: text(s?.section_3_abstractions), sec4_patterns: text(s?.section_4_patterns), sec5_explanation: text(s?.section_5_explanation), sec6_extensibility: text(s?.section_6_extensibility), sec7_concurrency: text(s?.section_7_edge_cases), sec8_tradeoffs: text(s?.section_8_tradeoffs), sec9_diagramNotes: text(s?.section_9_diagram), sec10_code: text(s?.section_10_code) }, activeLanguage: 'Java 17', completedSectionsCount: 0 });
const payload = (sections: Partial<BlueprintSections>) => ({ section_0_requirements: sections.sec0_requirements ?? '', section_1_classes: sections.sec1_classes ?? '', section_2_relationships: sections.sec2_relationships ?? '', section_3_abstractions: sections.sec3_interfaces ?? '', section_4_patterns: sections.sec4_patterns ?? '', section_5_explanation: sections.sec5_explanation ?? '', section_6_extensibility: sections.sec6_extensibility ?? '', section_7_edge_cases: sections.sec7_concurrency ?? '', section_8_tradeoffs: sections.sec8_tradeoffs ?? '', section_9_diagram: sections.sec9_diagramNotes ?? '', section_10_code: sections.sec10_code ?? '' });

export const attemptService = {
  async getAttemptById(id: string): Promise<Attempt | null> { try { const a = await api.get<ApiAttempt>(`/attempts/${id}`); let s: ApiSubmission | undefined; try { s = await api.get<ApiSubmission>(`/attempts/${id}/submission`); } catch {} return map(a, s); } catch { return null; } },
  async getActiveAttemptForProblem(problemId: string): Promise<Attempt | null> {
    const list = await api.get<ApiAttempt[]>('/attempts');
    const a = list.find(x => x.problem_id === problemId && x.status === 'IN_PROGRESS');
    return a ? this.getAttemptById(a.id) : null;
  },
  async createAttempt(problemId: string): Promise<Attempt> { return map(await api.post<ApiAttempt>('/attempts', { problem_id: problemId })); },
  async saveDraft(attemptId: string, sections: Partial<BlueprintSections>, _timeSpentSeconds?: number): Promise<Attempt> { const current = await this.getAttemptById(attemptId); await api.put(`/attempts/${attemptId}/draft`, payload({ ...(current?.sections || {}), ...sections })); return (await this.getAttemptById(attemptId))!; },
  async submit(attemptId: string, sections: BlueprintSections) { return api.post(`/attempts/${attemptId}/submit`, payload(sections)); },
  async list(): Promise<Attempt[]> { const list = await api.get<ApiAttempt[]>('/attempts'); return list.map((attempt) => map(attempt)); }
};
