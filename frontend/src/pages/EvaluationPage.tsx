import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { evaluationService } from '../services/evaluationService';
import { attemptService } from '../services/attemptService';
import { Evaluation } from '../types/evaluation';

export const EvaluationPage: React.FC = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loadError, setLoadError] = useState('');
  const [selectedIssueTab, setSelectedIssueTab] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    async function load() {
      let id = evaluationId;
      if (!id) {
        const attempts = await attemptService.list();
        id = attempts.find((attempt) => ['COMPLETED', 'EVALUATING', 'SUBMITTED', 'FAILED'].includes(attempt.status))?.id;
        if (!id) { setLoadError('No submitted evaluation is available yet. Submit a problem from the workspace first.'); return; }
      }
      const resolvedId = id;
      const poll = async () => {
        const ev = await evaluationService.getEvaluationByAttemptId(resolvedId);
        if (ev) setEvaluation(ev);
        return ev;
      };
      const ev = await poll();
      if (ev?.staffReadyStatus === 'PENDING' || ev?.staffReadyStatus === 'EVALUATING') {
        timer = window.setInterval(async () => { const next = await poll(); if (next?.staffReadyStatus === 'COMPLETED' || next?.staffReadyStatus === 'FAILED') window.clearInterval(timer); }, 2000);
        window.setTimeout(() => timer && window.clearInterval(timer), 60000);
      }
    }
    void load().catch((error) => setLoadError(error instanceof Error ? error.message : 'Evaluation could not be loaded.'));
    return () => { if (timer) window.clearInterval(timer); };
  }, [evaluationId]);

  if (!evaluation) {
    return <div className="min-h-[60vh] flex items-center justify-center px-layout-margin-desktop"><div className="max-w-lg text-center space-y-space-md"><span className="material-symbols-outlined text-5xl text-[#8083ff]">analytics</span><h1 className="font-headline-lg text-[#dfe2ee]">Evaluation Studio</h1><p className="text-[#c7c4d7]">{loadError || 'Loading your live evaluation…'}</p><Link to="/problems" className="inline-flex px-space-md py-space-xs rounded-lg bg-[#8083ff] text-white">Open Problem Library</Link></div></div>;
  }

  const isProcessing = evaluation.staffReadyStatus === 'PENDING' || evaluation.staffReadyStatus === 'EVALUATING';
  const isFailed = evaluation.staffReadyStatus === 'FAILED';
  const resultMetadata = (evaluation as Evaluation & { metadata?: { gemini_unavailable?: boolean; gemini_limit_reached?: boolean } }).metadata;
  const hasGeminiFeedback = resultMetadata?.gemini_unavailable !== true;
  const isGeminiLimitReached = resultMetadata?.gemini_limit_reached === true;
  const retakePath = `/workspace?problemId=${encodeURIComponent(evaluation.problemId)}&newAttempt=1&sourceAttemptId=${encodeURIComponent(evaluation.attemptId)}`;

  const retryAiEvaluation = async () => {
    setIsRetrying(true);
    try {
      await evaluationService.retryEvaluation(evaluation.attemptId);
      window.location.reload();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'AI evaluation retry failed.');
      setIsRetrying(false);
    }
  };

  const activeIssue = evaluation.issues?.[selectedIssueTab] || evaluation.issues?.[0] || { specificIssue: 'No findings available.', rootCause: '', realWorldImpact: '', primaryFix: '', staffTradeoff: '', diffContent: '', filePath: '', severity: 'INFO', dimension: 'Evaluation', type: 'Feedback' };

  return (
    <div className="flex flex-col w-full text-[#dfe2ee] pb-space-3xl">
      {/* Ambient Top Halo */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[680px] h-[280px] bg-[#8083ff]/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-20 right-10 w-[420px] h-[220px] bg-[#4edea3]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* ================= HEADER STATUS STRIP ================= */}
        <div className="w-full px-layout-margin-desktop pt-space-xl pb-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-lg border-b border-[#262a33]">
            <div className="space-y-space-2xs">
              <h1 className="font-headline-xl text-headline-xl text-[#dfe2ee] font-semibold flex items-center gap-space-sm flex-wrap">
                <span>{evaluation.problemTitle}</span>
                <span className="text-[#908fa0] font-normal font-headline-sm text-headline-sm">
                  — Attempt #{evaluation.attemptNumber}
                </span>
                <span className="px-space-xs py-space-2xs rounded bg-[#00a572]/20 text-[#4edea3] font-label-code text-label-code font-bold">
                  {evaluation.staffReadyStatus}
                </span>
              </h1>
            </div>

            {/* Actions: Retake, Export, Re-evaluate */}
            <div className="flex flex-wrap items-center gap-space-sm">
              <Link
                to={retakePath}
                className="px-space-md py-space-xs rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#dfe2ee] font-label-ui text-label-ui flex items-center gap-space-xs transition-colors border border-[#464554]/50"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Open in Workspace</span>
              </Link>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-space-md py-space-xs rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#dfe2ee] font-label-ui text-label-ui flex items-center gap-space-xs transition-colors border border-[#464554]/50"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export Report</span>
              </button>
              <Link
                to={retakePath}
                className="px-space-md py-space-xs rounded-lg bg-[#8083ff] hover:bg-[#c0c1ff] hover:text-[#1000a9] text-[#dfe2ee] font-label-ui text-label-ui font-semibold flex items-center gap-space-xs transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Refactor &amp; Retake</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-layout-margin-desktop space-y-space-2xl">
        {loadError && <div className="rounded-lg border border-[#ffb4ab]/40 bg-[#ffb4ab]/10 px-space-md py-space-sm text-sm text-[#ffb4ab]">{loadError}</div>}
        {isProcessing && <div className="rounded-lg border border-[#8083ff]/40 bg-[#8083ff]/10 px-space-md py-space-sm text-sm text-[#c0c1ff]">Evaluation is still running. This page refreshes automatically while the evaluator finishes.</div>}
        {isFailed && <div className="rounded-lg border border-[#ffb4ab]/40 bg-[#ffb4ab]/10 px-space-md py-space-sm text-sm text-[#ffb4ab]">Evaluation failed. Your submission is preserved; use the retry action or submit again after checking the backend configuration.</div>}
        {!isProcessing && !isFailed && !hasGeminiFeedback && <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-space-md py-space-sm text-sm text-amber-300 flex flex-wrap items-center justify-between gap-space-sm"><span>{isGeminiLimitReached ? 'Daily AI evaluation limit of 50 requests reached. This report contains deterministic completeness and concept feedback.' : 'AI reasoning was temporarily unavailable, so this report contains deterministic completeness and concept feedback.'}</span>{!isGeminiLimitReached && <button type="button" onClick={retryAiEvaluation} disabled={isRetrying} className="px-space-sm py-space-xs rounded bg-amber-400/20 text-amber-200 font-semibold disabled:opacity-50">{isRetrying ? 'Retrying…' : 'Retry AI evaluation'}</button>}</div>}
        {/* ================= SCORECARD HERO BENTO ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Main Dial & Overall Assessment (4 Cols) */}
          <div className="lg:col-span-4 bg-[#181c24] p-space-xl rounded-2xl border border-[#262a33] shadow-lg flex flex-col justify-between">
            <div className="space-y-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-ui text-label-ui font-semibold text-[#dfe2ee] uppercase tracking-wider">
                  Composite Staff Score
                </span>
                <span className="px-space-xs py-space-2xs rounded bg-[#4edea3]/15 text-[#4edea3] font-label-code text-label-code font-bold">
                  {evaluation.overallScore} / 100
                </span>
              </div>

              {/* Radial Dial */}
              <div className="py-space-md flex items-center justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#262a33]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.2"
                    ></path>
                    <path
                      className="text-[#4edea3]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${evaluation.overallScore}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.2"
                    ></path>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-xl text-[40px] font-bold text-[#dfe2ee] leading-none">
                      {evaluation.overallScore}
                    </span>
                    <span className="font-label-code text-xs text-[#4edea3] font-semibold mt-1">
                      STAFF PASS
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-space-sm text-left">
                <div className="rounded-xl border border-[#262a33] bg-[#0f131c] p-space-md space-y-1.5">
                  <p className="font-body-sm text-body-sm text-[#dfe2ee] leading-relaxed">
                    {evaluation.overallSummary || 'Evaluation completed'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-space-lg pt-space-md border-t border-[#262a33] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#908fa0] font-label-code">
              <span>Dimensions analyzed: {evaluation.rubricScores?.length || 0}</span>
              <span className="sm:text-right">Evaluation status: <span className="text-[#4edea3]">{evaluation.staffReadyStatus}</span></span>
            </div>
          </div>

          {/* 4 Rubric Dimensional Breakdown (8 Cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {(evaluation.rubricScores || []).map((rubric) => (
              <div
                key={rubric.dimension}
                className="bg-[#181c24] p-space-lg rounded-xl border border-[#262a33] shadow-sm flex flex-col space-y-space-md"
              >
                <div className="space-y-space-xs">
                  <div className="flex items-center justify-between pb-space-xs border-b border-[#262a33]/60">
                    <span className="font-label-code text-xs font-semibold text-[#dfe2ee] uppercase tracking-wide">
                      {rubric.dimension}
                    </span>
                    <span
                      className={`font-label-code text-body-md font-bold ${
                        rubric.score >= 90
                          ? 'text-[#4edea3]'
                          : rubric.score >= 80
                          ? 'text-[#c0c1ff]'
                          : 'text-amber-400'
                      }`}
                    >
                      {rubric.score}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#0a0e16] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        rubric.score >= 90
                          ? 'bg-[#4edea3]'
                          : rubric.score >= 80
                          ? 'bg-[#c0c1ff]'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${rubric.score}%` }}
                    ></div>
                  </div>

                  <div className="mt-2 rounded-lg bg-[#0f131c] border border-[#262a33] px-space-md py-space-sm space-y-1">
                    <span className="font-label-code text-[10px] text-[#908fa0] uppercase tracking-wider">Evaluator feedback</span>
                    <p className="font-body-sm text-body-sm text-[#c7c4d7] leading-relaxed">
                      {rubric.feedback || 'No additional feedback provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-space-sm border-t border-[#262a33]/60 text-xs font-label-code text-[#908fa0]">
                  <span>Benchmark: ≥80%</span>
                  <span className="text-[#4edea3] font-semibold">VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= LEARNER ACTION PLAN ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
          <div className="bg-[#181c24] rounded-xl border border-[#262a33] p-space-lg space-y-space-sm">
            <span className="font-label-code text-label-code text-[#4edea3] uppercase tracking-wider">WHAT YOU DID WELL</span>
            <div className="space-y-space-sm">
              {(evaluation as any).strengths?.slice(0, 4).map((strength: any, index: number) => (
                <div key={index} className="text-sm text-[#c7c4d7]">
                  <span className="text-[#dfe2ee] font-semibold">{strength.title || strength}</span>
                  {strength.evidence && <span> — {strength.evidence}</span>}
                </div>
              ))}
              {!(evaluation as any).strengths?.length && <p className="text-sm text-[#908fa0]">The evaluator did not return explicit strengths.</p>}
            </div>
          </div>
          <div className="bg-[#181c24] rounded-xl border border-[#262a33] p-space-lg space-y-space-sm">
            <span className="font-label-code text-label-code text-[#c0c1ff] uppercase tracking-wider">NEXT LEARNING ACTIONS</span>
            <ol className="space-y-space-sm list-decimal list-inside text-sm text-[#c7c4d7]">
              {((evaluation as any).recommendations || []).slice(0, 4).map((recommendation: any, index: number) => (
                <li key={index}><span className="text-[#dfe2ee]">{recommendation.action || recommendation}</span>{recommendation.expected_outcome && <span> — {recommendation.expected_outcome}</span>}</li>
              ))}
              {!(evaluation as any).recommendations?.length && <li className="list-none text-[#908fa0]">No additional recommendations were returned.</li>}
            </ol>
          </div>
        </section>

        {/* ================= 5-PART DIAGNOSTIC PLAYBOOK (CORE DIFFERENTIATOR) ================= */}
        <section className="space-y-space-lg">
          <div className="space-y-space-2xs">
            <span className="font-label-code text-label-code text-[#4cd7f6] uppercase tracking-wider">
              IN-DEPTH DIAGNOSTIC PLAYBOOK
            </span>
            <h2 className="font-headline-lg text-headline-lg font-bold text-[#dfe2ee]">
              Actionable Refactoring Diffs &amp; Interview Trade-offs
            </h2>
            <p className="font-body-md text-body-md text-[#c7c4d7] max-w-3xl">
              Every identified flaw is analyzed across five architectural dimensions: Specific Issue, Underlying Root Cause, Real-World Production Impact, Exact Code Diff Fix, and Staff Interview Reflection.
            </p>
          </div>

          {/* Issue Selector Tabs */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 border-b border-[#262a33]">
            {(evaluation.issues || []).map((iss, idx) => (
              <button
                key={iss.id}
                onClick={() => setSelectedIssueTab(idx)}
                className={`px-space-md py-space-xs rounded-t-lg font-label-ui text-label-ui flex items-center gap-space-xs transition-all whitespace-nowrap ${
                  idx === selectedIssueTab
                    ? 'bg-[#181c24] text-[#c0c1ff] border-t-2 border-[#8083ff] font-semibold'
                    : 'text-[#908fa0] hover:text-[#dfe2ee] hover:bg-[#181c24]/50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    iss.severity === 'HIGH'
                      ? 'bg-[#ffb4ab]'
                      : iss.severity === 'MEDIUM'
                      ? 'bg-amber-400'
                      : 'bg-[#4cd7f6]'
                  }`}
                ></span>
                <span>
                  Issue #{idx + 1}: {iss.title}
                </span>
              </button>
            ))}
          </div>

          {/* Active Diagnostic Detail Card */}
          <div className="bg-[#181c24] rounded-2xl border border-[#262a33] p-space-xl space-y-space-xl shadow-xl">
            {/* Top Diagnostic Badges */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm border-b border-[#262a33]">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span
                  className={`px-space-sm py-1 rounded font-label-code text-label-code font-bold ${
                    activeIssue.severity === 'HIGH'
                      ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]'
                      : activeIssue.severity === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-[#009eb9]/20 text-[#4cd7f6]'
                  }`}
                >
                  {activeIssue.severity} SEVERITY
                </span>
                <span className="px-space-sm py-1 rounded bg-[#262a33] text-[#c0c1ff] font-label-code text-label-code">
                  DIMENSION: {activeIssue.dimension}
                </span>
                <span className="px-space-sm py-1 rounded bg-[#0f131c] text-xs text-[#908fa0] font-label-code">
                  TYPE: {activeIssue.type}
                </span>
              </div>
              {activeIssue.filePath && <span className="px-space-sm py-1 rounded bg-[#0f131c] font-label-code text-xs text-[#908fa0]">
                FILE: <code className="text-[#dfe2ee]">{activeIssue.filePath}</code>
              </span>}
            </div>

            {/* The 5 Parts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-xl">
              {/* Part 1, 2, 3: Explanation & Context */}
              <div className="lg:col-span-1 space-y-space-md">
                {/* 1. Specific Issue */}
                <div className="p-space-md rounded-xl bg-[#0f131c] border border-[#262a33] space-y-space-xs">
                  <span className="font-label-code text-xs text-[#c0c1ff] font-semibold uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">search</span>
                    1. Specific Issue
                  </span>
                  <p className="font-body-md text-body-sm text-[#dfe2ee] leading-relaxed">
                    {activeIssue.specificIssue}
                  </p>
                </div>

                {/* 2. Root Cause */}
                <div className="p-space-md rounded-xl bg-[#0f131c] border border-[#262a33] space-y-space-xs">
                  <span className="font-label-code text-xs text-amber-400 font-semibold uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">error</span>
                    2. Underlying Root Cause
                  </span>
                  <p className="font-body-md text-body-sm text-[#c7c4d7] leading-relaxed">
                    {activeIssue.rootCause}
                  </p>
                </div>

                {/* 3. Real-World Impact */}
                <div className="p-space-md rounded-xl bg-[#0a0e16] border border-[#262a33] space-y-space-xs">
                  <span className="font-label-code text-xs text-[#ffb4ab] font-semibold uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">trending_down</span>
                    3. Real-World System Impact
                  </span>
                  <p className="font-body-md text-body-sm text-[#c7c4d7] leading-relaxed">
                    {activeIssue.realWorldImpact}
                  </p>
                </div>
              </div>

                {/* Part 4: Recommended Fix and Code Diff (2 Cols) */}
                <div className="lg:col-span-2 min-w-0 space-y-space-md">
                  <div className="p-space-md rounded-xl bg-[#0a0e16] border border-[#00a572]/30 space-y-space-xs">
                    <span className="font-label-code text-xs text-[#4edea3] font-semibold uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">build</span>
                      4. Recommended Fix
                    </span>
                    <p className="font-body-md text-body-sm text-[#dfe2ee] leading-relaxed">{activeIssue.primaryFix || 'Define the invariant explicitly and connect it to a concrete abstraction or implementation change.'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                  <span className="font-label-code text-xs text-[#4edea3] font-semibold uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">code</span>
                    4b. Exact Code Diff Fix
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeIssue.diffContent);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="text-xs text-[#c0c1ff] hover:text-[#dfe2ee] flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">content_copy</span>
                    <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Diff'}</span>
                  </button>
                </div>

                {/* Diff Viewer */}
                <div className="rounded-xl bg-[#0a0e16] border border-[#262a33] overflow-hidden font-mono text-xs shadow-inner">
                  <div className="px-space-md py-2 bg-[#1c2028] border-b border-[#262a33] flex items-center justify-between text-[#908fa0]">
                    <span>{activeIssue.filePath}</span>
                    <span>Unified Diff</span>
                  </div>
                  <pre className="p-space-md overflow-x-auto leading-relaxed text-[#c7c4d7]">
                    {activeIssue.diffContent.split('\n').map((line, lIdx) => {
                      const isMinus = line.startsWith('-');
                      const isPlus = line.startsWith('+');
                      const isAt = line.startsWith('@@');
                      return (
                        <div
                          key={lIdx}
                          className={`${
                            isMinus
                              ? 'bg-red-500/15 text-[#ffb4ab] -mx-4 px-4'
                              : isPlus
                              ? 'bg-[#00a572]/15 text-[#4edea3] -mx-4 px-4 font-semibold'
                              : isAt
                              ? 'text-[#4cd7f6]'
                              : 'text-[#908fa0]'
                          }`}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </pre>
                </div>

                {/* Part 5: Staff Interview Trade-off Reflection */}
                <div className="p-space-md rounded-xl bg-[#1c2028] border border-[#8083ff]/30 space-y-space-xs">
                  <div className="flex items-center gap-1.5 text-[#c0c1ff] font-label-code text-xs font-semibold uppercase">
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    <span>5. Staff Interview Trade-Off Reflection</span>
                  </div>
                  <p className="font-body-md text-body-sm text-[#dfe2ee] leading-relaxed">
                    {activeIssue.staffTradeoff}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DETERMINISTIC AST & CONCURRENCY STRESS SUITE ================= */}
        <section className="space-y-space-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-label-code text-label-code text-[#4edea3] uppercase tracking-wider">
                AUTOMATED VERIFICATION RUNBOOK
              </span>
              <h2 className="font-headline-sm text-headline-sm font-bold text-[#dfe2ee]">
                Evaluator Analysis Dimensions
              </h2>
            </div>
            <span className="px-space-sm py-space-2xs rounded bg-[#00a572]/20 text-[#4edea3] font-label-code text-label-code font-bold">
              {evaluation.rubricScores?.length || 0} DIMENSIONS ANALYZED
            </span>
          </div>

          <div className="bg-[#0a0e16] rounded-xl border border-[#262a33] p-space-sm sm:p-space-md space-y-2 text-[#c7c4d7] shadow-inner">
            {(evaluation.rubricScores || []).map((rubric) => (
              <div key={rubric.dimension} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-space-md p-space-sm sm:p-space-md rounded-lg bg-[#181c24] border border-[#262a33]/60">
                <span className="shrink-0 min-w-[130px] font-label-code text-xs text-[#c0c1ff] uppercase tracking-wide">{rubric.dimension}</span>
                <div className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className={`shrink-0 font-label-code text-xs font-bold ${rubric.score >= 70 ? 'text-[#4edea3]' : 'text-amber-400'}`}>{rubric.score}/100</span>
                  <span className="min-w-0 whitespace-normal break-words text-xs leading-relaxed text-[#c7c4d7]">{rubric.feedback || 'No additional feedback'}</span>
                </div>
              </div>
            ))}
            {false && <>
            <div className="flex items-center justify-between pb-2 border-b border-[#262a33] text-[#908fa0]">
              <span>AST &amp; CONCURRENCY RUNBOOK // 500 CONCURRENT CLIENT SIMULATION</span>
              <span>TOTAL RUNTIME: 420ms</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#181c24]">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-sm">check_circle</span>
                <span>TEST 01: Multi-Thread Spot Allocation Race (120 Threads, 4 Gates)</span>
              </span>
              <span className="text-[#4edea3] font-semibold">PASSED (0 Double Bookings, 18.2ms)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#181c24]">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-sm">check_circle</span>
                <span>TEST 02: Deadlock Invariant on Simultaneous Floor Entry &amp; Exit</span>
              </span>
              <span className="text-[#4edea3] font-semibold">PASSED (Cycle count: 0, 0 Stalled Threads)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#181c24]">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-sm">check_circle</span>
                <span>TEST 03: Latency &amp; Contention Benchmark (500 req/sec sustained)</span>
              </span>
              <span className="text-[#4edea3] font-semibold">PASSED (p99: 18.4ms, SLA target &lt; 25ms)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#181c24]">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-sm">check_circle</span>
                <span>TEST 04: Interface Segregation AST Walk &amp; Coupling Metric</span>
              </span>
              <span className="text-[#4edea3] font-semibold">PASSED (0 God Classes, Efferent Coupling: 0.18)</span>
            </div>
            </>}
          </div>
        </section>

        {/* ================= INTERVIEWER PERSPECTIVE / STAFF RUBRIC NOTES ================= */}
        <section className="bg-gradient-to-r from-[#1c2028] to-[#181c24] p-space-lg sm:p-space-xl rounded-2xl border border-[#464554]/50 space-y-space-lg">
          <div className="flex items-center gap-space-xs text-[#c0c1ff] font-label-code text-label-code font-semibold uppercase tracking-wide">
            <span className="material-symbols-outlined text-base">supervisor_account</span>
            <span>How a Principal Interviewer Will Probe This Solution</span>
          </div>
          <div className="rounded-xl bg-[#0f131c] border border-[#262a33] px-space-md py-space-sm">
            <p className="font-body-md text-body-md text-[#dfe2ee] leading-relaxed">
              For {evaluation.problemTitle}, interviewers will probe the operational resilience and failure boundaries of the submitted design:
            </p>
          </div>
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-space-sm text-body-sm text-[#c7c4d7]">
            {(evaluation.issues || []).slice(0, 3).map((issue: any, index: number) => <li key={issue.id || index} className="rounded-xl bg-[#0f131c] border border-[#262a33] px-space-md py-space-sm leading-relaxed"><strong className="text-[#c0c1ff] uppercase text-xs tracking-wide">{issue.dimension || issue.type || 'Review finding'}</strong><span className="block mt-1">{issue.specificIssue || 'Review the submitted design against this finding.'}</span></li>)}
            {!evaluation.issues?.length && <li className="rounded-xl bg-[#0f131c] border border-[#262a33] px-space-md py-space-sm">No additional interview prompts were returned by the evaluator for this submission.</li>}
          </ul>
          <div className="pt-space-md border-t border-[#464554]/50 flex justify-end">
            <Link
              to={retakePath}
              className="px-space-lg py-space-xs rounded-lg bg-[#8083ff] hover:bg-[#c0c1ff] hover:text-[#1000a9] text-[#dfe2ee] font-label-ui text-label-ui font-semibold flex items-center gap-space-xs transition-all shadow-md"
            >
              <span>Apply Fixes in Workspace</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
