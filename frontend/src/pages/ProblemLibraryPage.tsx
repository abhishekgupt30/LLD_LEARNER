import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Problem, ProblemDifficulty } from '../types/problem';
import { attemptService } from '../services/attemptService';
import { problemService } from '../services/problemService';
import { api } from '../services/api';

type HistoryRow = { attempt_id: string; problem_id: string; attempt_number: number; status: string; score: number | null; started_at: string };

const formatPatternTag = (tag: string) => {
  const normalized = tag.trim();
  const knownNames: Record<string, string> = {
    solid: 'SOLID',
    strategy: 'Strategy',
    state: 'State',
    observer: 'Observer',
    factory: 'Factory',
    concurrency: 'Concurrency',
  };
  return knownNames[normalized.toLowerCase()] || normalized;
};

export const ProblemLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | ProblemDifficulty>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Completed' | 'In Progress' | 'Unattempted'>('all');
  const [activePatterns, setActivePatterns] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'difficulty' | 'success_rate' | 'recently_added'>('popular');
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    async function loadCatalogProgress() {
      try {
        const [catalog, history] = await Promise.all([
          problemService.getAllProblems(),
          api.get<HistoryRow[]>('/history'),
        ]);
        const enriched = catalog.map((problem) => {
          const attempts = history
            .filter((row) => row.problem_id === problem.id)
            .sort((a, b) => b.attempt_number - a.attempt_number);
          const latest = attempts[0];
          const completed = attempts.find((row) => row.status === 'COMPLETED' && row.score != null);
          const active = attempts.find((row) => ['IN_PROGRESS', 'SUBMITTED', 'EVALUATING', 'PENDING'].includes(row.status));
          return {
            ...problem,
            status: completed ? 'Completed' : active ? 'In Progress' : 'Unattempted',
            attemptNumber: latest?.attempt_number,
            score: completed?.score ?? undefined,
            lastSaved: active?.started_at ? new Date(active.started_at).toLocaleDateString() : undefined,
          } as Problem;
        });
        setProblems(enriched);
      } catch {
        // Keep the catalog visible even if user-specific progress is unavailable.
        problemService.getAllProblems().then(setProblems).catch(() => setProblems([]));
      }
    }
    void loadCatalogProgress();
  }, []);

  const availablePatterns = [
    'SOLID',
    'Strategy',
    'State',
    'Observer',
    'Factory',
    'Concurrency',
    'Rate Limiting'
  ];

  // Toggle pattern filter
  const togglePattern = (pat: string) => {
    setActivePatterns((prev) =>
      prev.includes(pat) ? prev.filter((p) => p !== pat) : [...prev, pat]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('all');
    setSelectedStatus('all');
    setActivePatterns([]);
    setSortBy('popular');
  };

  // Keyboard shortcut Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('library-search');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProblems = useMemo(() => {
    let list = [...problems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.patterns.some((pat) => pat.toLowerCase().includes(q))
      );
    }

    if (selectedDifficulty !== 'all') {
      list = list.filter((p) => p.difficulty === selectedDifficulty);
    }

    if (selectedStatus !== 'all') {
      list = list.filter((p) => p.status === selectedStatus);
    }

    if (activePatterns.length > 0) {
      list = list.filter((p) =>
        activePatterns.some((pat) =>
          p.patterns.some((probPat) => probPat.toLowerCase().includes(pat.toLowerCase()))
        )
      );
    }

    if (sortBy === 'difficulty') {
      const weights: Record<ProblemDifficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };
      list.sort((a, b) => weights[a.difficulty] - weights[b.difficulty]);
    } else if (sortBy === 'success_rate' || sortBy === 'popular') {
      list.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return list;
  }, [problems, searchQuery, selectedDifficulty, selectedStatus, activePatterns, sortBy]);

  const completedProblemCount = problems.filter((problem) => problem.status === 'Completed').length;
  const progressPercent = problems.length ? Math.round((completedProblemCount / problems.length) * 100) : 0;
  const patternProficiency = useMemo(() => {
    const names = Array.from(new Set(problems.flatMap((problem) => problem.patterns))).slice(0, 6);
    return names.map((name) => {
      const scores = problems.filter((problem) => problem.patterns.includes(name) && problem.score != null).map((problem) => problem.score as number);
      return { name, score: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0 };
    });
  }, [problems]);

  const handleStartOrContinue = async (problem: Problem) => {
    localStorage.setItem('lld_selected_problem_id', problem.id);
    const active = await attemptService.getActiveAttemptForProblem(problem.id);
    if (active) {
      navigate(`/workspace/${active.id}?problemId=${encodeURIComponent(problem.id)}`);
    } else {
      const created = await attemptService.createAttempt(problem.id);
      navigate(`/workspace/${created.id}?problemId=${encodeURIComponent(problem.id)}`);
    }
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2ee]">
      {/* Subtle Ambient Glow Orbs behind header */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-[#8083ff]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-[#009eb9]/10 blur-3xl pointer-events-none"></div>

        {/* Editorial Header Section */}
        <div className="w-full px-layout-margin-desktop pt-space-2xl pb-space-xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div className="max-w-3xl">
              <h1 className="font-headline-xl text-headline-xl text-[#dfe2ee] tracking-tight font-semibold">
                LLD Problem Library
              </h1>
            </div>
          </div>

          {/* Live Search & Filtering Panel */}
          <div className="mt-space-xl bg-[#181c24] p-space-lg rounded-xl shadow-md border border-[#262a33] space-y-space-md">
            {/* Row 1: Search & Sort dropdown */}
            <div className="flex flex-col md:flex-row gap-space-md items-stretch md:items-center">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0] text-lg">
                  search
                </span>
                <input
                  id="library-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by problem name, pattern, or keyword..."
                  className="w-full pl-10 pr-16 py-space-xs rounded-lg bg-[#0a0e16] text-[#dfe2ee] placeholder:text-[#908fa0] font-body-md text-body-md outline-none focus:bg-[#1c2028] focus:ring-1 focus:ring-[#c0c1ff] transition-all border border-[#262a33]"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-label-code text-label-code px-space-xs py-space-2xs bg-[#1c2028] text-[#908fa0] rounded border border-[#262a33]">
                  ⌘K
                </kbd>
              </div>

              <div className="flex items-center gap-space-sm">
                <span className="font-label-ui text-label-ui text-[#908fa0] whitespace-nowrap">Sort by:</span>
                <div className="relative inline-block">
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-[#262a33] text-[#dfe2ee] font-label-ui text-label-ui py-space-xs pl-space-md pr-space-xl rounded-lg outline-none cursor-pointer hover:bg-[#31353e] transition-colors border border-[#464554]/60"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="difficulty">Difficulty (Easy to Hard)</option>
                    <option value="success_rate">Success Rate (Highest)</option>
                    <option value="recently_added">Recently Added</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#908fa0] text-base">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Difficulty & Status Pills */}
            <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
              {/* Difficulty Pills */}
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-label-code text-label-code text-[#908fa0] uppercase mr-space-xs">
                  Difficulty:
                </span>
                {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-space-sm py-space-2xs rounded font-label-ui text-label-ui transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-[#8083ff] text-[#dfe2ee] font-semibold shadow-sm'
                        : 'bg-[#1c2028] text-[#c7c4d7] hover:bg-[#262a33]'
                    }`}
                  >
                    {diff === 'all' ? 'All' : diff}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-label-code text-label-code text-[#908fa0] uppercase mr-space-xs">
                  Status:
                </span>
                {(['all', 'Completed', 'In Progress', 'Unattempted'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-space-sm py-space-2xs rounded font-label-ui text-label-ui transition-all ${
                      selectedStatus === status
                        ? 'bg-[#8083ff] text-[#dfe2ee] font-semibold shadow-sm'
                        : 'bg-[#1c2028] text-[#c7c4d7] hover:bg-[#262a33]'
                    }`}
                  >
                    {status === 'all' ? 'All' : status === 'Completed' ? 'Solved' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Design Pattern Tags */}
            <div className="flex items-center gap-space-xs flex-wrap pt-space-xs">
              <span className="font-label-code text-label-code text-[#908fa0] uppercase mr-space-xs">
                Patterns:
              </span>
              {availablePatterns.map((pat) => {
                const isActive = activePatterns.includes(pat);
                return (
                  <button
                    key={pat}
                    onClick={() => togglePattern(pat)}
                    className={`px-space-sm py-space-2xs rounded-full font-label-code text-label-code transition-all ${
                      isActive
                        ? 'bg-[#c0c1ff] text-[#1000a9] font-bold shadow-sm'
                        : 'bg-[#31353e]/60 hover:bg-[#31353e] text-[#4cd7f6]'
                    }`}
                  >
                    #{pat}
                  </button>
                );
              })}
              <button
                onClick={handleResetFilters}
                className="ml-auto font-label-ui text-label-ui text-[#908fa0] hover:text-[#dfe2ee] underline transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Workbench Zone */}
      <div className="w-full px-layout-margin-desktop pb-space-3xl">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
          {/* Problems List (8 Cols on XL) */}
          <div className="xl:col-span-8 space-y-space-md" id="problems-container">
            {filteredProblems.length === 0 ? (
              <div className="py-space-3xl text-center bg-[#181c24] rounded-xl border border-[#262a33]">
                <span className="material-symbols-outlined text-4xl text-[#908fa0] mb-space-sm">
                  filter_list_off
                </span>
                <h3 className="font-headline-sm text-headline-sm text-[#dfe2ee]">
                  No problems match your criteria
                </h3>
                <p className="font-body-md text-body-md text-[#c7c4d7] mt-space-xs">
                  Try clearing search terms or resetting pattern filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-space-md px-space-lg py-space-xs bg-[#262a33] hover:bg-[#31353e] text-[#c0c1ff] font-label-ui text-label-ui rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredProblems.map((problem) => (
                <article
                  key={problem.id}
                  className="problem-card group bg-[#181c24] hover:bg-[#1c2028] p-space-xl rounded-xl shadow-md transition-all duration-200 border border-[#262a33]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-md">
                    <div className="space-y-space-md flex-1 min-w-0">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span
                          className={`px-space-xs py-space-2xs rounded font-label-code text-label-code uppercase font-semibold ${
                            problem.difficulty === 'Easy'
                              ? 'bg-[#00a572]/20 text-[#4edea3]'
                              : problem.difficulty === 'Medium'
                              ? 'bg-[#009eb9]/20 text-[#4cd7f6]'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>

                      <h2 className="font-headline-sm text-headline-sm text-[#dfe2ee] group-hover:text-[#c0c1ff] transition-colors flex items-center gap-space-xs">
                        <span>{problem.title}</span>
                        {problem.status === 'Completed' && (
                          <span
                            className="material-symbols-outlined text-[#4edea3] text-sm"
                            title="Verified Architecture"
                          >
                            verified
                          </span>
                        )}
                        {problem.status === 'In Progress' && (
                          <span
                            className="w-2 h-2 rounded-full bg-[#c0c1ff] animate-pulse"
                            title="Active Draft"
                          ></span>
                        )}
                      </h2>

                      <p className="font-body-md text-body-md text-[#c7c4d7] max-w-3xl leading-relaxed break-words whitespace-normal">
                        {problem.description}
                      </p>
                    </div>

                    {/* Status Badge & Score Block */}
                    <div className="flex sm:w-32 sm:flex-col items-end justify-between sm:justify-start gap-space-sm shrink-0 pt-1">
                      {problem.status === 'Completed' && (
                        <>
                          {problem.score && (
                            <div className="flex items-center gap-space-xs text-[#4edea3] font-label-code text-label-code">
                              <span className="material-symbols-outlined text-sm">workspace_premium</span>
                              <span className="font-semibold text-[#dfe2ee]">Score: {problem.score}%</span>
                            </div>
                          )}
                        </>
                      )}

                      {problem.status === 'In Progress' && (
                        <>
                          <div className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-[#c0c1ff]/15 text-[#c0c1ff] font-label-code text-label-code font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff] animate-ping"></span>
                            <span>In Progress</span>
                          </div>
                          {problem.lastSaved && (
                            <span className="font-label-code text-label-code text-[#908fa0]">
                              Last saved {problem.lastSaved}
                            </span>
                          )}
                        </>
                      )}

                      {problem.status === 'Unattempted' && (
                        <>
                          <div className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-[#31353e] text-[#908fa0] font-label-code text-label-code font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#908fa0]"></span>
                            <span>Unattempted</span>
                          </div>
                          <span className="font-label-code text-label-code text-[#908fa0]">Est. 45-60 min</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Concept Tags & CTA Footer */}
                  <div className="mt-space-xl bg-[#0a0e16]/40 p-space-md rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg border border-[#262a33]/60">
                    <div className="flex items-center gap-space-xs flex-wrap">
                      {problem.patterns.slice(0, 4).map((patt, idx) => (
                        <span
                          key={patt}
                          className={`px-space-xs py-space-2xs rounded bg-[#262a33] font-label-code text-label-code ${
                            idx === 0
                              ? 'text-[#c0c1ff]'
                              : idx === 1
                              ? 'text-[#4cd7f6]'
                              : 'text-[#c7c4d7]'
                          }`}
                        >
                          {formatPatternTag(patt)}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-space-xs w-full md:w-auto justify-end">
                      {problem.status === 'Completed' && (
                        <>
                          <Link
                            to="/evaluation"
                            className="px-space-md py-space-xs rounded-lg bg-[#31353e] hover:bg-[#353942] text-[#dfe2ee] font-label-ui text-label-ui flex items-center gap-space-xs transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">history_edu</span>
                            <span>Review Evaluation</span>
                          </Link>
                          <button
                            onClick={() => handleStartOrContinue(problem)}
                            className="px-space-md py-space-xs rounded-lg bg-[#8083ff] text-[#dfe2ee] font-label-ui text-label-ui font-semibold flex items-center gap-space-xs hover:opacity-90 transition-opacity"
                          >
                            <span>Solve Again</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                        </>
                      )}

                      {problem.status === 'In Progress' && (
                        <button
                          onClick={() => handleStartOrContinue(problem)}
                          className="w-full md:w-auto text-center px-space-md py-space-xs rounded-lg bg-[#8083ff] text-[#dfe2ee] font-label-ui text-label-ui font-semibold flex items-center justify-center gap-space-xs hover:opacity-90 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-sm">code</span>
                          <span>Continue in Workspace</span>
                        </button>
                      )}

                      {problem.status === 'Unattempted' && (
                        <button
                          onClick={() => handleStartOrContinue(problem)}
                          className="w-full md:w-auto text-center px-space-md py-space-xs rounded-lg bg-[#31353e] hover:bg-[#353942] text-[#dfe2ee] font-label-ui text-label-ui font-semibold flex items-center justify-center gap-space-xs transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">play_circle</span>
                          <span>Start Challenge</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Right Column: Syllabus Progress Tracker & Recommended Track (4 Cols on XL) */}
          <aside className="xl:col-span-4 space-y-space-lg sticky top-20">
            {/* Syllabus Progress Widget */}
            <div className="bg-[#181c24] p-space-lg rounded-xl shadow-md border border-[#262a33]">
              <div className="flex items-center justify-between pb-space-sm">
                <h3 className="font-headline-sm text-headline-sm text-[#dfe2ee] font-semibold">Syllabus Progress</h3>
                <span className="font-label-code text-label-code text-[#4edea3] font-semibold bg-[#00a572]/20 px-space-xs py-space-2xs rounded">
                  {problems.length ? `${progressPercent}% COMPLETED` : 'LIVE CATALOG'}
                </span>
              </div>

              {/* Circular + Bar Visual Gauge */}
              <div className="flex items-center gap-space-md py-space-md">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#31353e]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    ></path>
                    <path
                      className="text-[#4edea3]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    ></path>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-headline-sm text-headline-sm font-bold text-[#dfe2ee] leading-none">{completedProblemCount}/{problems.length}</span>
                    <span className="font-label-code text-[9px] text-[#908fa0] uppercase tracking-wider">Solved</span>
                  </div>
                </div>
                <div className="space-y-space-xs flex-1">
                  <span className="font-label-ui text-label-ui text-[#c7c4d7] block">Live Problem Catalog</span>
                  <p className="font-body-sm text-body-sm text-[#908fa0]">
                    {problems.length ? `${problems.length} problems are available from the backend catalog.` : 'Loading problem progress from the backend.'}
                  </p>
                </div>
              </div>

              {/* Detailed Step Breakdown */}
              <div className="space-y-space-xs pt-space-xs">{problems.map((problem) => <div key={problem.id} className="flex items-center justify-between text-body-sm font-body-sm py-space-2xs px-space-xs rounded hover:bg-[#1c2028]"><span className="flex items-center gap-space-xs text-[#dfe2ee]"><span className={`material-symbols-outlined text-sm ${problem.status === 'Completed' ? 'text-[#4edea3]' : problem.status === 'In Progress' ? 'text-[#c0c1ff]' : 'text-[#908fa0]'}`}>{problem.status === 'Completed' ? 'check_circle' : problem.status === 'In Progress' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>{problem.title}</span><span className="font-label-code text-label-code text-[#908fa0]">{problem.status}</span></div>)}
                {false && <>
                <div className="flex items-center justify-between text-body-sm font-body-sm py-space-2xs px-space-xs rounded hover:bg-[#1c2028]">
                  <span className="flex items-center gap-space-xs text-[#dfe2ee]">
                    <span className="material-symbols-outlined text-[#4edea3] text-sm">check_circle</span>
                    Parking Lot System
                  </span>
                  <span className="font-label-code text-label-code text-[#4edea3]">88%</span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm py-space-2xs px-space-xs rounded hover:bg-[#1c2028]">
                  <span className="flex items-center gap-space-xs text-[#c0c1ff] font-medium">
                    <span className="material-symbols-outlined text-[#c0c1ff] text-sm animate-pulse">
                      radio_button_checked
                    </span>
                    Elevator Dispatcher
                  </span>
                  <span className="font-label-code text-label-code text-[#c0c1ff]">In Progress</span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm py-space-2xs px-space-xs rounded hover:bg-[#1c2028]">
                  <span className="flex items-center gap-space-xs text-[#908fa0]">
                    <span className="material-symbols-outlined text-[#908fa0] text-sm">radio_button_unchecked</span>
                    Food Ordering System
                  </span>
                  <span className="font-label-code text-label-code text-[#908fa0]">—</span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm py-space-2xs px-space-xs rounded hover:bg-[#1c2028]">
                  <span className="flex items-center gap-space-xs text-[#dfe2ee]">
                    <span className="material-symbols-outlined text-[#4edea3] text-sm">check_circle</span>
                    Thread-safe Rate Limiter
                  </span>
                  <span className="font-label-code text-label-code text-[#4edea3]">94%</span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-body-sm py-space-2xs px-space-xs rounded hover:bg-[#1c2028]">
                  <span className="flex items-center gap-space-xs text-[#dfe2ee]">
                    <span className="material-symbols-outlined text-[#4edea3] text-sm">check_circle</span>
                    Notification Engine
                  </span>
                  <span className="font-label-code text-label-code text-[#4edea3]">79%</span>
                </div>
                </>}
              </div>
            </div>

            {/* Pattern Mastery Radar Snapshot Card */}
            <div className="bg-[#181c24] p-space-lg rounded-xl shadow-md border border-[#262a33]">
              <div className="flex items-center justify-between mb-space-sm">
                <h4 className="font-label-ui text-label-ui text-[#dfe2ee] font-semibold uppercase tracking-wider">
                  Pattern Proficiency
                </h4>
              </div>
              <div className="space-y-space-sm">
                {patternProficiency.map(({ name, score }) => (
                  <div key={name}>
                    <div className="flex justify-between font-label-code text-label-code mb-1">
                      <span className="text-[#c7c4d7]">{name}</span>
                      <span className={`font-semibold ${score ? 'text-[#4edea3]' : 'text-[#908fa0]'}`}>{score}%</span>
                    </div>
                    <div className="w-full bg-[#31353e] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#4edea3] h-full rounded-full" style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                ))}
                {!patternProficiency.length && <p className="text-xs text-[#908fa0]">Pattern progress will appear after evaluations.</p>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
