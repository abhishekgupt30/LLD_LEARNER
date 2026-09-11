import { BlueprintSections } from './submission';

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export interface Attempt {
  id: string;
  userId: string;
  problemId: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  updatedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  sections: BlueprintSections;
  activeLanguage: string;
  completedSectionsCount: number;
}
