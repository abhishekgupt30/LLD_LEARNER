import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { problemService } from '../services/problemService';
import { Problem } from '../types/problem';

type DashboardStats = { total_attempts: number; completed_attempts: number; average_score: number | null; active_attempt: string | null };
type HistoryRow = { attempt_id: string; problem_id: string; problem_title: string; attempt_number: number; status: string; score: number | null };

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get<DashboardStats>('/dashboard'), api.get<HistoryRow[]>('/history'), problemService.getAllProblems()])
      .then(([dashboard, rows, catalog]) => { setStats(dashboard); setHistory(rows); setProblems(catalog); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Live dashboard data could not be loaded.'));
  }, []);

  const active = useMemo(() => history.find((row) => row.attempt_id === stats?.active_attempt), [history, stats]);
  const completed = stats?.completed_attempts ?? 0;
  const total = stats?.total_attempts ?? 0;

  return (
    <div className="flex flex-col w-full text-[#dfe2ee] pb-space-3xl">
      <div className="w-full px-layout-margin-desktop py-space-xl space-y-space-xl">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
          <div><h1 className="font-headline-xl text-headline-xl text-[#dfe2ee] tracking-tight font-semibold">Welcome back, <span className="text-[#c0c1ff]">{user?.name || 'Engineer'}</span></h1><p className="font-body-md text-body-md text-[#c7c4d7] mt-space-xs">Your dashboard is calculated from saved attempts and evaluations.</p></div>
          <div className="flex gap-space-sm"><Link to="/problems" className="px-space-md py-space-xs rounded-lg bg-[#262a33] text-[#dfe2ee] font-label-ui">Problem Library</Link><Link to="/workspace" className="px-space-md py-space-xs rounded-lg bg-[#8083ff] text-white font-label-ui font-semibold">Open Workspace</Link></div>
        </header>
        {error && <div className="rounded-lg border border-[#ffb4ab]/40 bg-[#ffb4ab]/10 px-space-md py-space-sm text-sm text-[#ffb4ab]">{error}</div>}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">{[['Total Attempts', total, 'runs'], ['Completed', completed, `of ${total}`], ['Average Score', stats?.average_score ?? '—', '/ 100'], ['Catalog Problems', problems.length, 'available']].map(([label, value, suffix]) => <div key={String(label)} className="bg-[#181c24] p-space-md rounded-xl border border-[#262a33]"><div className="text-[#908fa0] font-label-ui text-label-ui">{label}</div><div className="mt-space-sm flex items-baseline gap-space-xs"><span className="font-headline-lg text-headline-lg font-semibold text-[#dfe2ee]">{value}</span><span className="font-label-code text-label-code text-[#908fa0]">{suffix}</span></div></div>)}</section>
        <section className="rounded-xl bg-[#181c24] p-space-lg border border-[#262a33]"><div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md"><div><div className="font-label-code text-label-code text-[#4edea3] uppercase">Current workspace</div><h2 className="font-headline-lg text-headline-lg font-semibold mt-space-xs">{active?.problem_title || 'No active problem'}</h2><p className="text-[#c7c4d7] mt-space-xs">{active ? `Attempt #${active.attempt_number} · ${active.status}` : 'Select a problem from the live catalog to begin.'}</p></div><Link to={active ? `/workspace/${active.attempt_id}?problemId=${active.problem_id}` : '/problems'} className="px-space-md py-space-sm rounded-lg bg-[#8083ff] text-white font-label-ui font-semibold">{active ? 'Resume Workspace' : 'Choose Problem'}</Link></div></section>
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
          <div className="bg-[#181c24] rounded-xl border border-[#262a33] p-space-lg"><div className="flex items-center justify-between mb-space-md"><h2 className="font-headline-sm text-headline-sm font-semibold">Recent activity</h2><Link to="/history" className="text-[#c0c1ff] text-sm">View history</Link></div>{history.length ? <div className="space-y-space-sm">{history.slice(0, 5).map((row) => <div key={row.attempt_id} className="flex items-center justify-between gap-space-sm border-b border-[#262a33] pb-space-sm"><div><div className="font-label-ui text-label-ui">{row.problem_title}</div><div className="text-xs text-[#908fa0]">Attempt #{row.attempt_number} · {row.status}</div></div><div className="text-right">{row.score == null ? <span className="text-[#908fa0]">Not evaluated</span> : <span className="text-[#4edea3] font-semibold">{row.score}/100</span>}<div><Link to={row.score == null ? `/workspace/${row.attempt_id}` : `/evaluation/${row.attempt_id}`} className="text-xs text-[#c0c1ff]">{row.score == null ? 'Continue' : 'Review'}</Link></div></div></div>)}</div> : <p className="text-[#908fa0]">No attempts have been saved yet.</p>}</div>
          <div className="bg-[#181c24] rounded-xl border border-[#262a33] p-space-lg"><h2 className="font-headline-sm text-headline-sm font-semibold mb-space-md">Live problem catalog</h2>{problems.length ? <div className="space-y-space-sm">{problems.slice(0, 5).map((problem) => <Link key={problem.id} to="/problems" className="block rounded-lg bg-[#1c2028] px-space-md py-space-sm hover:bg-[#262a33]"><div className="flex justify-between gap-space-sm"><span>{problem.title}</span><span className="text-xs text-[#908fa0]">{problem.difficulty}</span></div><div className="text-xs text-[#908fa0] mt-1">{problem.patterns.slice(0, 3).join(' · ')}</div></Link>)}</div> : <p className="text-[#908fa0]">Loading the live catalog…</p>}</div>
        </section>
      </div>
    </div>
  );
};
