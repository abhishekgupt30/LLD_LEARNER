import { Problem, ProblemDifficulty, ProblemStatus } from '../types/problem';
import { api } from './api';

type ApiProblem = { id: string; slug: string; title: string; difficulty: string; prerequisites: string[]; description: string; sample_scenario: string; requirements: string[]; constraints: string[]; hints: string[]; expected_concepts: string[]; evaluation_criteria: string[] | Record<string, string>; estimated_time: number; patterns: string[] };
const asList = (value: string[] | Record<string, string> | undefined): string[] => Array.isArray(value) ? value : Object.values(value || {});
const mapProblem = (p: ApiProblem): Problem => ({
  id: p.id, title: p.title, difficulty: p.difficulty as ProblemDifficulty, prerequisites: p.prerequisites.join(', '), timeTarget: `${p.estimated_time} min`, description: p.description, patterns: p.patterns.length ? p.patterns : p.expected_concepts, status: 'Unattempted' as ProblemStatus,
  requirements: { functional: p.requirements }, scenario: { traceId: p.slug, events: [{ time: '00:00', label: 'Sample scenario', desc: p.sample_scenario }] }, constraints: { concurrencyNotice: p.constraints.join(' '), targets: p.constraints, memoryBudget: 'Defined by the candidate' }, hints: p.hints.map((h, i) => ({ title: `Hint ${i + 1}`, desc: h })), expectedConcepts: p.expected_concepts.map((name, i) => ({ id: `${p.id}-${i}`, name, points: 1, status: 'pending' as const })), scorecardWeighting: asList(p.evaluation_criteria).map((category) => ({ category, points: 0, maxPoints: 0 })), starterTemplate: {}, starterCode: '', language: 'Java 17'
});

export const problemService = {
  async getAllProblems(): Promise<Problem[]> {
    const data = await api.get<ApiProblem[]>('/problems'); return data.filter((p) => !p.slug.startsWith('legacy-')).map(mapProblem);
  },

  async getProblemById(id: string): Promise<Problem | null> {
    try { return mapProblem(await api.get<ApiProblem>(`/problems/${id}`)); } catch { return null; }
  },

  async searchAndFilterProblems(params: {
    query?: string;
    difficulty?: string;
    status?: string;
    patterns?: string[];
    sortBy?: string;
  }): Promise<Problem[]> {
    let list = await this.getAllProblems();

    if (params.query) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.patterns.some((pat) => pat.toLowerCase().includes(q))
      );
    }

    if (params.difficulty && params.difficulty !== 'all') {
      list = list.filter(
        (p) => p.difficulty.toLowerCase() === (params.difficulty as string).toLowerCase()
      );
    }

    if (params.status && params.status !== 'all') {
      list = list.filter((p) => {
        if (params.status === 'Completed' || params.status === 'Solved') return p.status === 'Completed';
        if (params.status === 'In Progress') return p.status === 'In Progress';
        if (params.status === 'Unattempted') return p.status === 'Unattempted';
        return true;
      });
    }

    if (params.patterns && params.patterns.length > 0) {
      list = list.filter((p) =>
        params.patterns!.every((pat) =>
          p.patterns.some((probPat) => probPat.toLowerCase().includes(pat.toLowerCase()))
        )
      );
    }

    if (params.sortBy) {
      if (params.sortBy === 'difficulty') {
        const weights: Record<ProblemDifficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };
        list.sort((a, b) => weights[a.difficulty] - weights[b.difficulty]);
      } else if (params.sortBy === 'success_rate') {
        list.sort((a, b) => (b.score || 0) - (a.score || 0));
      } else if (params.sortBy === 'popular') {
        list.sort((a, b) => (b.score || 0) - (a.score || 0));
      }
    }

    return list;
  }
};
