import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { attemptService } from '../services/attemptService';
import { evaluationService, PreCheckResult } from '../services/evaluationService';
import { BlueprintSections } from '../types/submission';
import { Attempt } from '../types/attempt';

interface SectionMeta {
  key: keyof BlueprintSections;
  idNum: number;
  label: string;
  shortLabel: string;
  description: string;
  placeholder: string;
  isCode?: boolean;
}

const BLUEPRINT_META: SectionMeta[] = [
  {
    key: 'sec0_requirements',
    idNum: 0,
    label: '0. Clarifying Scope & Capacity Estimation',
    shortLabel: '0. Scope',
    description: 'Clarify explicit functional boundaries, scale requirements, capacity math, and operational constraints.',
    placeholder: 'e.g. Total Capacity: 4 floors, 100 spots/floor (400 spots total). Peak throughput: 50 checkouts/second...'
  },
  {
    key: 'sec1_classes',
    idNum: 1,
    label: '1. Core Entities & Class Declarations',
    shortLabel: '1. Classes',
    description: 'Identify domain entities, attributes, and access modifiers. Enforce high cohesion and encapsulation.',
    placeholder: 'e.g. ParkingLot (singleton), ParkingFloor, ParkingSpot (abstract), CompactSpot, LargeSpot, ElectricSpot, Ticket, Payment...'
  },
  {
    key: 'sec2_relationships',
    idNum: 2,
    label: '2. Relationship Matrix (UML Semantics)',
    shortLabel: '2. Relations',
    description: 'Explicitly categorize Composition (strong lifecycle), Aggregation (loose association), and Inheritance.',
    placeholder: 'e.g. ParkingLot 1 -- * ParkingFloor (Composition)\nParkingFloor 1 -- * ParkingSpot (Composition)\nParkingSpot 1 -- 0..1 Vehicle (Aggregation)...'
  },
  {
    key: 'sec3_interfaces',
    idNum: 3,
    label: '3. Interface & Contract Design',
    shortLabel: '3. Interfaces',
    description: 'Design flexible, segregated interfaces following the Interface Segregation Principle (ISP) and Dependency Inversion.',
    placeholder: 'public interface IParkingStrategy {\n  ParkingSpot findSpot(ParkingFloor floor, Vehicle vehicle);\n  void releaseSpot(ParkingSpot spot);\n}'
  },
  {
    key: 'sec4_patterns',
    idNum: 4,
    label: '4. Design Patterns Justification',
    shortLabel: '4. Patterns',
    description: 'State exactly which GoF design patterns you applied, why they are needed, and alternative patterns rejected.',
    placeholder: '1. Strategy Pattern for Spot Allocation (NearestFirst, Random, EnergyOptimized)\n2. Factory Method for Spot Instantiation\n3. Singleton Pattern for ParkingLot Controller...'
  },
  {
    key: 'sec5_explanation',
    idNum: 5,
    label: '5. End-to-End Execution Flow',
    shortLabel: '5. Flow',
    description: 'Walk through primary execution traces: vehicle arrival, slot allocation, ticket issuance, departure, and fee calculation.',
    placeholder: '1. Vehicle arrives at Entry Gate 1\n2. Gate queries ParkingLot.assignSpot(vehicleType)\n3. Assigned strategy scans floor locks...'
  },
  {
    key: 'sec6_extensibility',
    idNum: 6,
    label: '6. Extensibility Scenarios & OCP',
    shortLabel: '6. Extensibility',
    description: 'Demonstrate how new requirements (e.g., dynamic surge pricing, autonomous EV valet) can be added without modifying core classes.',
    placeholder: 'To add Dynamic Surge Pricing: implement IFeeStrategy without touching Ticket or ParkingGate...'
  },
  {
    key: 'sec7_concurrency',
    idNum: 7,
    label: '7. Concurrency & Thread-Safety Isolation',
    shortLabel: '7. Concurrency',
    description: 'Specify atomic operations, locking strategies (synchronized, ReentrantLock, Striped Locks, StampedLock), and race condition mitigations.',
    placeholder: 'Race condition: Two cars approaching the last spot on Floor 2 simultaneously. Solution: Atomic CAS / ReentrantLock per floor spot queue...'
  },
  {
    key: 'sec8_tradeoffs',
    idNum: 8,
    label: '8. Architectural Trade-offs & Staff Reflection',
    shortLabel: '8. Trade-offs',
    description: 'Discuss deliberate compromises made: e.g., memory overhead vs lock granularity, caching vs immediate consistency.',
    placeholder: 'Trade-off: Chose Striped ReentrantReadWriteLock over global synchronized floor monitor. Yields 4x throughput at expense of memory overhead...'
  },
  {
    key: 'sec9_diagramNotes',
    idNum: 9,
    label: '9. Architecture Graph & State Transition Notes',
    shortLabel: '9. Diagram',
    description: 'Notes and structural layout for the class diagram and state machine (e.g., SpotState: FREE -> RESERVED -> OCCUPIED).',
    placeholder: 'SpotState: [AVAILABLE] --(reserve)--> [RESERVED] --(park)--> [OCCUPIED] --(exit)--> [AVAILABLE]'
  },
  {
    key: 'sec10_code',
    idNum: 10,
    label: '10. Complete Executable Code Implementation',
    shortLabel: '10. Code',
    description: 'Write complete, idiomatic, clean Java 17/21 code with proper thread-safety and interface implementations.',
    placeholder: '// Paste or write complete Java implementation here...',
    isCode: true
  }
];

const buildStarterSections = (problem: any): BlueprintSections => {
  const requirements = problem.requirements?.functional || [];
  const constraints = problem.constraints?.targets || [];
  const concepts = problem.expectedConcepts?.map((concept: { name: string }) => concept.name) || problem.patterns || [];
  const patterns = problem.patterns || [];
  return {
    sec0_requirements: `Problem scope:\n${problem.description || ''}\n\nFunctional requirements:\n${requirements.map((item: string) => `- ${item}`).join('\n')}\n\nAssumptions and capacity:\n- Define expected throughput, storage, latency, and tenant/user limits before implementation.`,
    sec1_classes: `Core entities to refine:\n${concepts.map((concept: string) => `- ${concept}Coordinator / service\n- ${concept}Configuration`).join('\n')}\n- Request / response models\n- State or persistence abstraction`,
    sec2_relationships: `Describe ownership and collaboration:\n- The coordinator depends on an interface for replaceable policies.\n- Policy implementations are composed into the coordinator.\n- Storage lifecycle and entity ownership must be explicit.`,
    sec3_interfaces: `Candidate contracts:\n- Policy / strategy interface for interchangeable behavior.\n- Store interface for in-memory and distributed implementations.\n- Metrics or notification interface where the problem requires it.`,
    sec4_patterns: `Patterns under consideration:\n${patterns.map((pattern: string) => `- ${pattern}: explain the variation it isolates and why it fits this problem.`).join('\n')}\n- Prefer composition and dependency inversion over condition-heavy controllers.`,
    sec5_explanation: `Primary flow to complete:\n1. Validate the incoming request.\n2. Select or invoke the configured policy.\n3. Perform the state update atomically.\n4. Return the result and observable status.`,
    sec6_extensibility: `Extension plan:\n- Add a new policy by implementing the policy interface.\n- Keep the coordinator independent from concrete algorithms.\n- Isolate storage so a distributed backend can be introduced later.`,
    sec7_concurrency: `Concurrency questions to answer:\n${constraints.map((constraint: string) => `- ${constraint}`).join('\n')}\n- Identify the invariant that must be atomic.\n- Explain lock/CAS/transaction scope and retry behavior.`,
    sec8_tradeoffs: `Document trade-offs:\n- In-memory simplicity versus distributed consistency.\n- Lock granularity and contention versus implementation complexity.\n- Strict correctness versus latency under load.`,
    sec9_diagramNotes: `Diagram plan:\n- Request -> Coordinator -> Strategy -> Store\n- Show state transitions, ownership, and the atomic boundary.`,
    sec10_code: `// Implement the interfaces, coordinator, policy, and store for ${problem.title || 'this problem'}.\n// Include validation, concurrency control, and focused tests.`,
  };
};

export const ProblemWorkspacePage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [sections, setSections] = useState<BlueprintSections>(
    {} as BlueprintSections
  );
  const sectionsRef = useRef<BlueprintSections>({} as BlueprintSections);
  const draftSaveTimeout = useRef<number | undefined>(undefined);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedMessage, setLastSavedMessage] = useState('Draft saved just now');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [rightPanelTab, setRightPanelTab] = useState<'uml' | 'precheck' | 'templates'>('uml');
  const [preCheckResult, setPreCheckResult] = useState<PreCheckResult | null>(null);
  const [selectedUmlNode, setSelectedUmlNode] = useState<string>('');
  const [showPrecheckModal, setShowPrecheckModal] = useState(false);

  // Find problem
  const [currentProblem, setCurrentProblem] = useState<any>(null);
  const displayProblem = currentProblem || { title: 'Loading problem…', language: 'Java 17', description: 'Loading the selected problem specification…', patterns: [], starterTemplate: {} };
  const problemName = String(displayProblem.title || 'Problem').replace(/[^a-zA-Z0-9]+/g, '');
  const interfaceName = `I${problemName}Strategy`;
  const controllerName = `${problemName}Controller`;
  const primaryPattern = displayProblem.patterns?.[0] || 'Domain';
  const concepts = displayProblem.expectedConcepts?.map((concept: { name: string }) => concept.name) || [];
  const snippetCode = `final ${interfaceName} strategy = new ${primaryPattern}Strategy();\nfinal ${controllerName} controller = new ${controllerName}(strategy);\nResult result = controller.handle(request);`;
  useEffect(() => { setSelectedUmlNode(`I${String(displayProblem.title || 'Problem').replace(/[^a-zA-Z0-9]+/g, '')}Strategy`); }, [displayProblem.title]);

  // Load attempt data
  useEffect(() => {
    async function load() {
      const rememberedProblemId = localStorage.getItem('lld_selected_problem_id');
      const routeProblemId = searchParams.get('problemId');
      const isNewAttempt = searchParams.get('newAttempt') === '1';
      const sourceAttemptId = searchParams.get('sourceAttemptId');
      let att = attemptId && !isNewAttempt ? await attemptService.getAttemptById(attemptId) : null;

      if (!att && (routeProblemId || rememberedProblemId)) {
        const selectedId = routeProblemId || rememberedProblemId!;
        if (isNewAttempt) {
          const source = sourceAttemptId ? await attemptService.getAttemptById(sourceAttemptId) : null;
          const created = await attemptService.createAttempt(selectedId);
          if (source && Object.values(source.sections).some((value) => value.trim().length > 0)) {
            await attemptService.saveDraft(created.id, source.sections);
            att = (await attemptService.getAttemptById(created.id)) || created;
          } else {
            att = created;
          }
          navigate(`/workspace/${att.id}?problemId=${encodeURIComponent(selectedId)}`, { replace: true });
        } else {
          att = await attemptService.getActiveAttemptForProblem(selectedId);
        }
      }

      if (att) {
        setAttempt(att);
        const localDraft = localStorage.getItem(`lld_workspace_draft_${att.id}`);
        let restoredSections = att.sections;
        if (localDraft) {
          try {
            restoredSections = { ...att.sections, ...JSON.parse(localDraft) };
          } catch {
            localStorage.removeItem(`lld_workspace_draft_${att.id}`);
          }
        }
        sectionsRef.current = restoredSections;
        setSections(restoredSections);
        localStorage.setItem('lld_selected_problem_id', att.problemId);
        const savedElapsed = Number(localStorage.getItem(`lld_workspace_elapsed_${att.id}`));
        if (Number.isFinite(savedElapsed) && savedElapsed > 0) setElapsedSeconds(savedElapsed);
        else if (att.timeSpentSeconds) setElapsedSeconds(att.timeSpentSeconds);
      }

      const selectedProblemId = att?.problemId || routeProblemId || rememberedProblemId;
      if (selectedProblemId) {
        localStorage.setItem('lld_selected_problem_id', selectedProblemId);
        setCurrentProblem(await problemService.getProblemById(selectedProblemId));
      }
    }
    load();
  }, [attemptId, searchParams]);

  useEffect(() => () => {
    if (draftSaveTimeout.current) window.clearTimeout(draftSaveTimeout.current);
  }, [attempt?.id]);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (attempt?.id) localStorage.setItem(`lld_workspace_elapsed_${attempt.id}`, String(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [attempt?.id]);

  // Format timer
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Section change handler
  const handleSectionTextChange = (key: keyof BlueprintSections, text: string) => {
    const nextSections = { ...sectionsRef.current, [key]: text };
    sectionsRef.current = nextSections;
    if (attempt) {
      localStorage.setItem(`lld_workspace_draft_${attempt.id}`, JSON.stringify(nextSections));
    }
    setSections(nextSections);
    setIsAutoSaving(true);
    setLastSavedMessage('Saving changes...');

    if (draftSaveTimeout.current) window.clearTimeout(draftSaveTimeout.current);
    draftSaveTimeout.current = window.setTimeout(async () => {
      if (attempt) {
        try {
          await attemptService.saveDraft(attempt.id, sectionsRef.current, elapsedSeconds);
          setIsAutoSaving(false);
          setLastSavedMessage('Draft saved just now');
        } catch {
          setIsAutoSaving(false);
          setLastSavedMessage('Saved locally; server sync will retry on the next edit');
        }
      }
    }, 800);
  };

  // Load starter template
  const handleLoadStarter = async () => {
    if (confirm('Load standard Staff-level starter template for this problem?')) {
      const starterTemplate = Object.keys(displayProblem?.starterTemplate || {}).length
        ? displayProblem.starterTemplate
        : buildStarterSections(displayProblem);
      if (starterTemplate) {
        sectionsRef.current = starterTemplate;
        setSections(starterTemplate);
        if (attempt) {
          localStorage.setItem(`lld_workspace_draft_${attempt.id}`, JSON.stringify(starterTemplate));
          await attemptService.saveDraft(attempt.id, starterTemplate);
        }
        setLastSavedMessage('Loaded starter blueprint template');
      }
    }
  };

  // Run Pre-check
  const handleRunPreCheck = async () => {
    const res = await evaluationService.runPreCheck(sections);
    setPreCheckResult(res);
    setRightPanelTab('precheck');
    setShowPrecheckModal(true);
  };

  // Submit for Staff Evaluation
  const handleSubmitEvaluation = async () => {
    setIsEvaluating(true);
    setSubmissionError('');
    try {
      if (!attempt) {
        setSubmissionError('The attempt is still loading. Please wait a moment and try again.');
        setIsEvaluating(false);
        return;
      }
      // Completed/submitted attempts are immutable. Fork them before saving a
      // revision so the original submission and evaluation remain preserved.
      let submissionAttempt = attempt;
      if (attempt.status !== 'IN_PROGRESS') {
        submissionAttempt = await attemptService.createAttempt(attempt.problemId);
        await attemptService.saveDraft(submissionAttempt.id, sections);
      }

      // The backend evaluates in a background task. Navigate after the submit
      // POST succeeds and let EvaluationPage poll the evaluation record rather
      // than racing the background task with an immediate GET.
      await attemptService.submit(submissionAttempt.id, sections);
      localStorage.removeItem(`lld_workspace_draft_${attempt.id}`);
      localStorage.removeItem(`lld_workspace_elapsed_${attempt.id}`);
      localStorage.removeItem(`lld_workspace_draft_${submissionAttempt.id}`);
      localStorage.removeItem(`lld_workspace_elapsed_${submissionAttempt.id}`);
      navigate(`/evaluation/${submissionAttempt.id}`);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Submission failed. Please try again.');
      setIsEvaluating(false);
    }
  };

  const currentSection = BLUEPRINT_META[activeSectionIndex];

  // Completed sections count
  const completedCount = useMemo(() => {
    let count = 0;
    BLUEPRINT_META.forEach((m) => {
      if (sections[m.key] && sections[m.key].trim().length > 15) count++;
    });
    return count;
  }, [sections]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden text-[#dfe2ee] bg-[#0f131c]">
      {/* ================= WORKSPACE SUB-HEADER & NAVIGATION STRIP ================= */}
      <div className="min-h-14 bg-[#181c24] border-b border-[#262a33] px-layout-margin-mobile lg:px-layout-margin-desktop py-space-sm lg:py-0 flex flex-wrap lg:flex-nowrap items-center justify-between gap-space-md shrink-0">
        {/* Left: Problem & Session Info */}
        <div className="flex items-center gap-space-md min-w-0">
          <Link
            to="/problems"
            className="p-1 rounded text-[#908fa0] hover:text-[#dfe2ee] hover:bg-[#262a33] transition-colors"
            title="Back to Problem Library"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Link>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-body-md font-bold text-[#dfe2ee] truncate">
                {displayProblem.title}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#00a572]/20 text-[#4edea3] font-label-code text-[11px] font-semibold">
              Attempt #{attempt?.attemptNumber || 1}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Timer & Status */}
        <div className="hidden md:flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-md bg-[#0a0e16] border border-[#262a33]">
            <span className="material-symbols-outlined text-xs text-[#4edea3] animate-pulse">timer</span>
            <span className="font-label-code text-label-code font-semibold text-[#dfe2ee]">
              {formatTime(elapsedSeconds)}
            </span>
            <span className="text-[#908fa0] text-xs font-label-code">/ {displayProblem.timeTarget || '45 min'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#908fa0] font-label-code">
            <span
              className={`w-2 h-2 rounded-full ${isAutoSaving ? 'bg-amber-400 animate-pulse' : 'bg-[#4edea3]'}`}
            ></span>
            <span>{lastSavedMessage}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-space-sm shrink-0 max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={handleLoadStarter}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-[#262a33] hover:bg-[#353942] text-[#c7c4d7] transition-colors"
            title="Load standard starter scaffold"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Starter Scaffold</span>
          </button>

          <button
            onClick={handleRunPreCheck}
            className="px-space-md py-1.5 rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#c0c1ff] font-label-ui text-label-ui flex items-center gap-space-xs transition-colors border border-[#464554]/60"
          >
            <span className="material-symbols-outlined text-sm">checklist</span>
            <span>Pre-Check</span>
          </button>

          <button
            onClick={handleSubmitEvaluation}
            disabled={isEvaluating}
            className="px-space-md py-1.5 rounded-lg bg-[#8083ff] hover:bg-[#c0c1ff] hover:text-[#1000a9] text-[#dfe2ee] font-label-ui text-label-ui font-semibold flex items-center gap-space-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm font-bold">bolt</span>
                <span>Submit for Evaluation</span>
              </>
            )}
          </button>
          {submissionError && <span className="max-w-xs text-xs text-[#ffb4ab]">{submissionError}</span>}
        </div>
      </div>

      {/* ================= 11-SECTION STEPPER RIBBON ================= */}
      <div className="bg-[#0a0e16] border-b border-[#262a33] px-layout-margin-desktop py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1 shrink-0">
        <div className="flex items-center gap-2 pr-3 border-r border-[#262a33] shrink-0">
          <span className="font-label-code text-[11px] text-[#908fa0] uppercase tracking-wider">
            Blueprint:
          </span>
          <span className="font-label-code text-[11px] text-[#4edea3] font-bold">
            {completedCount}/11 Done
          </span>
        </div>

        {BLUEPRINT_META.map((meta, idx) => {
          const isFilled = (sections[meta.key] || '').trim().length > 15;
          const isActive = idx === activeSectionIndex;
          return (
            <button
              key={meta.key}
              onClick={() => setActiveSectionIndex(idx)}
              className={`px-2.5 py-1 rounded-md text-xs font-label-ui flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#8083ff] text-[#dfe2ee] font-semibold shadow-sm'
                  : isFilled
                  ? 'bg-[#1c2028] text-[#c7c4d7] hover:bg-[#262a33]'
                  : 'text-[#908fa0] hover:bg-[#181c24] hover:text-[#dfe2ee]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-white' : isFilled ? 'bg-[#4edea3]' : 'bg-[#464554]'
                }`}
              ></span>
              <span>{meta.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <section className="lg:hidden shrink-0 bg-[#141820] border-b border-[#262a33] px-space-md py-space-md">
        <div className="flex items-center gap-space-xs mb-space-xs">
          <span className="material-symbols-outlined text-sm text-[#4cd7f6]">description</span>
          <span className="font-label-ui text-label-ui font-semibold text-[#dfe2ee] uppercase tracking-wider">Problem Description</span>
        </div>
        <p className="font-body-sm text-body-sm text-[#c7c4d7] leading-relaxed break-words whitespace-normal">
          {displayProblem.description}
        </p>
      </section>

      {/* ================= 3-PANE WORKSPACE BODY ================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* ================= PANE 1: PROBLEM SPEC & CONSTRAINTS (3 COLS) ================= */}
        <section className="hidden lg:flex lg:col-span-3 flex-col bg-[#141820] border-r border-[#262a33] overflow-y-auto p-space-md space-y-space-md">
          {/* Header */}
          <div className="pb-space-xs border-b border-[#262a33] flex items-center justify-between">
            <span className="font-label-ui text-label-ui font-semibold text-[#dfe2ee] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#4cd7f6]">description</span>
              System Specification
            </span>
          </div>

          {/* Problem Overview & Context */}
          <div className="space-y-space-xs">
            <h3 className="font-label-ui text-body-sm font-semibold text-[#dfe2ee]">Requirements Scope</h3>
            <p className="font-body-sm text-body-sm text-[#c7c4d7] leading-relaxed">
              {displayProblem.description}
            </p>
          </div>

          {/* Functional Requirements */}
          <div className="space-y-space-xs">
            <h4 className="font-label-ui text-xs font-semibold text-[#c0c1ff] uppercase tracking-wider">
              Functional Requirements
            </h4>
            <ul className="space-y-1 text-xs text-[#c7c4d7] list-disc list-inside">
              {(displayProblem.requirements?.functional || []).map((requirement: string) => <li key={requirement}>{requirement}</li>)}
            </ul>
          </div>

          {/* Non-Functional / Concurrency Constraints */}
          <div className="p-space-sm rounded-lg bg-[#0a0e16] border border-[#262a33] space-y-space-xs">
            <div className="flex items-center gap-1 text-[#ffb4ab] font-label-code text-[11px] font-semibold uppercase">
              <span className="material-symbols-outlined text-xs">warning</span>
              <span>Concurrency &amp; Invariants</span>
            </div>
            <ul className="space-y-1 text-[11px] text-[#c7c4d7] font-label-code">
              {(displayProblem.constraints?.targets || []).map((constraint: string) => <li key={constraint}>• {constraint}</li>)}
            </ul>
          </div>

          {/* Design Patterns Checklist */}
          <div className="space-y-space-xs pt-space-xs">
            <h4 className="font-label-ui text-xs font-semibold text-[#4edea3] uppercase tracking-wider">
              Expected Design Patterns
            </h4>
            <div className="space-y-1 text-xs">
              {displayProblem.patterns.map((pat: string) => (
                <div
                  key={pat}
                  className="flex items-center justify-between p-1.5 rounded bg-[#1c2028] text-[#dfe2ee]"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-[#4edea3]">check_box</span>
                    {pat}
                  </span>
                  <span className="text-[10px] text-[#908fa0] font-label-code">MANDATORY</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Data Structures */}
          <div className="p-space-sm rounded-lg bg-[#1c2028] border border-[#262a33] space-y-1 text-xs text-[#c7c4d7]">
            <span className="text-[11px] font-label-code text-[#4cd7f6] uppercase">Core Data Structures:</span>
            <p className="font-code-block text-[11px] text-[#c7c4d7]">
              {(concepts.length ? concepts : ['Interfaces', 'Composition', 'Concurrency']).slice(0, 4).map((concept: string) => <React.Fragment key={concept}>• {concept}<br /></React.Fragment>)}
            </p>
            <p className="hidden">
              • ConcurrentSkipListMap&lt;SpotType, TreeSet&lt;ParkingSpot&gt;&gt;
              <br />
              • StampedLock / Striped ReentrantReadWriteLock
              <br />
              • ConcurrentHashMap&lt;String, Ticket&gt;
            </p>
          </div>
        </section>

        {/* ================= PANE 2: BLUEPRINT EDITOR (5 COLS) ================= */}
        <section className="col-span-1 lg:col-span-5 min-h-0 flex flex-col bg-[#0f131c] border-r border-[#262a33] overflow-y-auto lg:overflow-hidden">
          {/* Section Header */}
          <div className="px-space-lg py-space-md bg-gradient-to-r from-[#181c24] to-[#1c2028] border-b border-[#31353e] flex items-center justify-between gap-space-sm shrink-0">
            <div className="min-w-0">
              <span className="font-label-code text-[11px] text-[#c0c1ff] uppercase">
                SECTION {currentSection.idNum} OF {BLUEPRINT_META.length - 1}
              </span>
              <h2 className="font-headline-sm text-body-md font-bold text-[#dfe2ee] truncate">
                {currentSection.label}
              </h2>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                disabled={activeSectionIndex === 0}
                onClick={() => setActiveSectionIndex((prev) => Math.max(0, prev - 1))}
                className="p-1 rounded hover:bg-[#262a33] text-[#c7c4d7] disabled:opacity-30"
                title="Previous Section"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <span className="text-xs text-[#908fa0] font-label-code px-1">
                {activeSectionIndex + 1}/11
              </span>
              <button
                disabled={activeSectionIndex === BLUEPRINT_META.length - 1}
                onClick={() =>
                  setActiveSectionIndex((prev) => Math.min(BLUEPRINT_META.length - 1, prev + 1))
                }
                className="p-1 rounded hover:bg-[#262a33] text-[#c7c4d7] disabled:opacity-30"
                title="Next Section"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Section Guidance Prompt */}
          <div className="px-space-lg py-space-sm bg-[#141820] border-b border-[#262a33] text-xs text-[#a8a6b8] flex items-start gap-2 shrink-0 leading-relaxed">
            <span className="material-symbols-outlined text-sm text-[#4cd7f6] shrink-0 mt-0.5">info</span>
            <span>{currentSection.description}</span>
          </div>

          {/* Textarea Workspace */}
          <div className="flex-1 relative flex flex-col min-h-[420px] lg:min-h-0 p-space-md lg:p-space-lg overflow-hidden bg-[#10141b]">
            <textarea
              value={sections[currentSection.key] || ''}
              onChange={(e) => handleSectionTextChange(currentSection.key, e.target.value)}
              placeholder={currentSection.placeholder}
              className={`w-full flex-1 p-space-lg bg-[#090c12] text-[#dfe2ee] border border-[#31353e] rounded-xl resize-none outline-none focus:border-[#8083ff] focus:ring-2 focus:ring-[#8083ff]/20 leading-relaxed shadow-inner ${
                currentSection.isCode
                  ? 'font-code-block text-code-block text-[13px] font-mono'
                  : 'font-body-md text-body-md'
              }`}
              spellCheck="false"
            />
          </div>

          {/* Editor Status Footer */}
          <div className="h-10 px-space-lg bg-[#181c24] border-t border-[#31353e] flex items-center justify-between text-xs text-[#908fa0] font-label-code shrink-0">
            <div className="flex items-center gap-space-md">
              <span>Lines: {(sections[currentSection.key] || '').split('\n').length}</span>
              <span>Chars: {(sections[currentSection.key] || '').length}</span>
              <span className="text-[#4edea3]">
                {(sections[currentSection.key] || '').trim().length > 15 ? '✓ Drafted' : '○ Pending'}
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sections[currentSection.key] || '');
                  alert('Section content copied to clipboard!');
                }}
                className="hover:text-[#dfe2ee] transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">content_copy</span>
                Copy
              </button>
            </div>
          </div>
        </section>

        {/* ================= PANE 3: ARCHITECTURE GRAPH & LIVE DIAGNOSTICS (4 COLS) ================= */}
        <section className="hidden lg:flex col-span-1 lg:col-span-4 flex-col bg-[#141820] overflow-hidden">
          {/* Panel Tabs Header */}
          <div className="h-12 px-space-md bg-gradient-to-r from-[#181c24] to-[#1c2028] border-b border-[#31353e] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-space-xs">
              <button
                onClick={() => setRightPanelTab('uml')}
                className={`px-space-sm py-1 rounded text-xs font-label-ui transition-colors ${
                  rightPanelTab === 'uml'
                    ? 'bg-[#262a33] text-[#c0c1ff] font-semibold'
                    : 'text-[#908fa0] hover:text-[#dfe2ee]'
                }`}
              >
                UML Class Graph
              </button>
              <button
                onClick={() => setRightPanelTab('precheck')}
                className={`px-space-sm py-1 rounded text-xs font-label-ui transition-colors ${
                  rightPanelTab === 'precheck'
                    ? 'bg-[#262a33] text-[#c0c1ff] font-semibold'
                    : 'text-[#908fa0] hover:text-[#dfe2ee]'
                }`}
              >
                Pre-Check Linter
              </button>
              <button
                onClick={() => setRightPanelTab('templates')}
                className={`px-space-sm py-1 rounded text-xs font-label-ui transition-colors ${
                  rightPanelTab === 'templates'
                    ? 'bg-[#262a33] text-[#c0c1ff] font-semibold'
                    : 'text-[#908fa0] hover:text-[#dfe2ee]'
                }`}
              >
                Snippets
              </button>
            </div>

            <span className="font-label-code text-[11px] text-[#4edea3]">DRAFT PREVIEW</span>
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-space-lg space-y-space-lg bg-[#11151d]">
            {/* TAB 1: UML CLASS GRAPH */}
            {rightPanelTab === 'uml' && (
              <div className="space-y-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-code text-xs text-[#908fa0] uppercase">
                    Interactive UML Topology
                  </span>
                  <span className="font-label-code text-xs text-[#c0c1ff]">DESIGN PREVIEW</span>
                </div>

                {/* Node 1: IParkingStrategy Interface */}
                <div
                  onClick={() => setSelectedUmlNode(interfaceName)}
                  className={`cursor-pointer rounded-lg border p-space-sm transition-all ${
                    selectedUmlNode === interfaceName
                      ? 'bg-[#1c2028] border-[#8083ff] shadow-md ring-1 ring-[#8083ff]'
                      : 'bg-[#0a0e16] border-[#262a33] hover:border-[#464554]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-[#262a33]">
                    <span className="font-label-code text-xs text-[#4cd7f6] font-semibold">
                      &lt;&lt;interface&gt;&gt; {interfaceName}
                    </span>
                    <span className="material-symbols-outlined text-xs text-[#4cd7f6]">hub</span>
                  </div>
                  <div className="pt-2 text-xs font-mono text-[#c7c4d7] space-y-0.5">
                    <p className="text-[#4edea3]">+ execute(request): Result</p>
                    <p className="text-[#4edea3]">+ validate(input): boolean</p>
                  </div>
                </div>

                {/* Vector link */}
                <div className="flex justify-center -my-1">
                  <span className="material-symbols-outlined text-[#464554] text-lg rotate-180">
                    arrow_upward
                  </span>
                </div>

                {/* Node 2: NearestFirstStrategy */}
                <div
                  onClick={() => setSelectedUmlNode(`${primaryPattern}Strategy`)}
                  className={`cursor-pointer rounded-lg border p-space-sm transition-all ${
                    selectedUmlNode === `${primaryPattern}Strategy`
                      ? 'bg-[#1c2028] border-[#8083ff] shadow-md ring-1 ring-[#8083ff]'
                      : 'bg-[#0a0e16] border-[#262a33] hover:border-[#464554]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-[#262a33]">
                    <span className="font-label-code text-xs text-[#c0c1ff] font-semibold">
                      {primaryPattern}Strategy (implements)
                    </span>
                      <span className="px-1 py-0.5 rounded bg-[#00a572]/20 text-[#4edea3] text-[10px] font-label-code">
                      POLICY
                    </span>
                  </div>
                  <div className="pt-2 text-xs font-mono text-[#c7c4d7] space-y-0.5">
                    <p className="text-[#908fa0]">- policy: {primaryPattern}</p>
                    <p className="text-[#dfe2ee]">
                      + execute(...) <span className="text-[#4edea3]">/* replaceable strategy */</span>
                    </p>
                  </div>
                </div>

                {/* Node 3: ParkingLot Singleton */}
                <div
                  onClick={() => setSelectedUmlNode(controllerName)}
                  className={`cursor-pointer rounded-lg border p-space-sm transition-all ${
                    selectedUmlNode === controllerName
                      ? 'bg-[#1c2028] border-[#8083ff] shadow-md ring-1 ring-[#8083ff]'
                      : 'bg-[#0a0e16] border-[#262a33] hover:border-[#464554]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-[#262a33]">
                    <span className="font-label-code text-xs text-[#dfe2ee] font-semibold">
                      {controllerName}
                    </span>
                    <span className="text-[10px] text-[#c0c1ff] font-label-code">CONTROLLER</span>
                  </div>
                  <div className="pt-2 text-xs font-mono text-[#c7c4d7] space-y-0.5">
                    <p className="text-[#908fa0]">- concepts: {concepts.slice(0, 2).join(', ') || 'domain entities'}</p>
                    <p className="text-[#908fa0]">- strategy: {interfaceName}</p>
                    <p className="text-[#4edea3]">+ handle(request): Result</p>
                    <p className="text-[#4edea3]">+ getStatus(): Status</p>
                  </div>
                </div>

                {/* Selected Node Inspector detail */}
                <div className="p-space-sm rounded-lg bg-[#0a0e16] border border-[#262a33] space-y-1">
                  <span className="font-label-code text-[11px] text-[#c0c1ff] uppercase">
                    Node Inspector: {selectedUmlNode}
                  </span>
                  <p className="text-xs text-[#c7c4d7]">
                    {selectedUmlNode === interfaceName && `Abstract contract for ${displayProblem.title}, guided by the stored requirements and evaluation criteria.`}
                    {selectedUmlNode === `${primaryPattern}Strategy` && `${primaryPattern} is represented as a replaceable strategy for this problem.`}
                    {selectedUmlNode === controllerName && `${controllerName} coordinates the domain concepts for ${displayProblem.title}.`}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: PRE-CHECK LINTER */}
            {rightPanelTab === 'precheck' && (
              <div className="space-y-space-md">
                <div className="p-space-sm rounded-lg bg-[#1c2028] border border-[#262a33] space-y-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-ui text-xs font-semibold text-[#dfe2ee]">
                      Staff Pre-Check Diagnostic
                    </span>
                    <span className="font-label-code text-xs text-[#4edea3] font-bold">
                      {preCheckResult?.scoreEstimate || 88}/100 Est.
                    </span>
                  </div>
                  <p className="text-xs text-[#c7c4d7]">
                    Checks section completeness and concurrency guidance before submission.
                  </p>
                </div>

                <div className="space-y-space-xs">
                  <span className="font-label-code text-[11px] text-[#908fa0] uppercase">
                    Completeness Checklist
                  </span>
                  {BLUEPRINT_META.map((meta) => {
                    const isDone = (sections[meta.key] || '').trim().length > 15;
                    return (
                      <div
                        key={meta.key}
                        onClick={() => setActiveSectionIndex(meta.idNum)}
                        className="flex items-center justify-between p-space-md rounded-xl bg-[#0a0e16] border border-[#202631] text-xs cursor-pointer hover:bg-[#1c2028] hover:border-[#3b4352] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-xs ${
                              isDone ? 'text-[#4edea3]' : 'text-amber-400'
                            }`}
                          >
                            {isDone ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span className={isDone ? 'text-[#dfe2ee]' : 'text-[#908fa0]'}>
                            {meta.label}
                          </span>
                        </span>
                        <span className="font-label-code text-[11px] text-[#908fa0]">
                          {isDone ? 'OK' : 'MISSING'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Precheck Warnings */}
                {preCheckResult?.warnings && preCheckResult.warnings.length > 0 && (
                  <div className="p-space-sm rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                    <span className="font-label-code text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">warning</span>
                      Staff Warnings ({preCheckResult.warnings.length})
                    </span>
                    <ul className="text-xs text-[#c7c4d7] space-y-1 list-disc list-inside">
                      {preCheckResult.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SNIPPETS & PATTERNS */}
            {rightPanelTab === 'templates' && (
              <div className="space-y-space-md">
                <span className="font-label-code text-xs text-[#908fa0] uppercase">
                  Staff-Level Code Snippets
                </span>

                {/* Snippet 1: Striped Lock */}
                <div className="p-space-sm rounded-lg bg-[#0a0e16] border border-[#262a33] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-code text-xs text-[#4cd7f6] font-semibold">
                      {primaryPattern} Strategy Integration
                    </span>
                    <button
                      onClick={() => {
                        const code = snippetCode;
                        handleSectionTextChange(
                          'sec7_concurrency',
                          (sections.sec7_concurrency || '') + '\n' + code
                        );
                        alert('Inserted into Section 7!');
                      }}
                      className="text-[10px] text-[#c0c1ff] hover:underline"
                    >
                      + Insert
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-[#c7c4d7] overflow-x-auto bg-[#141820] p-1.5 rounded">
                    {snippetCode}
                  </pre>
                </div>

                {/* Snippet 2: problem-specific controller */}
                <div className="p-space-sm rounded-lg bg-[#0a0e16] border border-[#262a33] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-code text-xs text-[#4edea3] font-semibold">
                      {controllerName} Controller
                    </span>
                    <button
                      onClick={() => {
                        const code = `public class ${controllerName} {\n  private final ${interfaceName} strategy;\n  public Result handle(Request request) {\n    return strategy.execute(request);\n  }\n}`;
                        handleSectionTextChange(
                          'sec10_code',
                          (sections.sec10_code || '') + '\n' + code
                        );
                        alert('Inserted into Section 10!');
                      }}
                      className="text-[10px] text-[#c0c1ff] hover:underline"
                    >
                      + Insert
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-[#c7c4d7] overflow-x-auto bg-[#141820] p-1.5 rounded">
                    {`class ${controllerName} {
    private final ${interfaceName} strategy;
    Result handle(Request request) { return strategy.execute(request); }
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Pre-Check Modal */}
      {showPrecheckModal && preCheckResult && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181c24] border border-[#464554] rounded-2xl max-w-lg w-full p-space-xl shadow-2xl space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[#4edea3]">checklist</span>
                <h3 className="font-headline-sm text-body-lg font-bold text-[#dfe2ee]">
                  Blueprint Pre-Check Complete
                </h3>
              </div>
              <button
                onClick={() => setShowPrecheckModal(false)}
                className="text-[#908fa0] hover:text-[#dfe2ee]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="p-space-md rounded-xl bg-[#0a0e16] border border-[#262a33] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#908fa0] block">Estimated Staff Readiness:</span>
                <span className="font-headline-lg text-headline-lg font-bold text-[#4edea3]">
                  {preCheckResult.scoreEstimate}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#908fa0] block">Completed Sections:</span>
                <span className="font-label-code text-body-md font-semibold text-[#dfe2ee]">
                  {preCheckResult.completedSections} / {preCheckResult.totalSections}
                </span>
              </div>
            </div>

            {preCheckResult.warnings.length > 0 ? (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-amber-400">Recommendations before submitting:</span>
                <ul className="text-xs text-[#c7c4d7] space-y-1 list-disc list-inside">
                  {preCheckResult.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-[#4edea3]">
                ✓ All 11 blueprint sections have sufficient detail and meet baseline L6 staff requirements!
              </p>
            )}

            <div className="flex items-center justify-end gap-space-sm pt-space-xs">
              <button
                onClick={() => setShowPrecheckModal(false)}
                className="px-space-md py-1.5 rounded-lg bg-[#262a33] text-[#dfe2ee] text-xs font-medium"
              >
                Back to Workspace
              </button>
              <button
                onClick={() => {
                  setShowPrecheckModal(false);
                  handleSubmitEvaluation();
                }}
                className="px-space-md py-1.5 rounded-lg bg-[#8083ff] text-[#dfe2ee] text-xs font-semibold flex items-center gap-1"
              >
                <span>Submit Anyway</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
