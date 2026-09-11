import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { problemService } from '../services/problemService';

export const AttemptHistoryPage: React.FC = () => {
  const [filterProblem, setFilterProblem] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [attempts, setAttempts] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  React.useEffect(() => { Promise.all([api.get<any[]>('/history'), problemService.getAllProblems()]).then(([rows, catalog]) => { setProblems(catalog); setAttempts(rows.map((r) => ({ ...r, id: r.attempt_id, problemId: r.problem_id, problemTitle: r.problem_title, date: new Date(r.started_at).toLocaleDateString(), timeSpent: '—', language: 'Java 17', status: r.status, score: r.score }))); }).catch(() => {}); }, []);

  const filteredAttempts = attempts.filter((att) => {
    if (filterProblem !== 'all' && att.problemId !== filterProblem) return false;
    if (filterStatus !== 'all' && att.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full text-[#dfe2ee] pb-space-3xl">
      <div className="w-full px-layout-margin-desktop pt-space-2xl pb-space-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-lg border-b border-[#262a33]">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-[#dfe2ee] font-semibold">
              Attempt History &amp; Benchmarks
            </h1>
            <p className="font-body-md text-body-md text-[#c7c4d7] mt-space-xs">
              Track your score trajectory across all Staff LLD system designs, AST passes, and rubric iterations.
            </p>
          </div>

          <div className="flex items-center gap-space-sm">
            <Link
              to="/workspace"
              className="px-space-md py-space-xs rounded-lg bg-[#8083ff] hover:bg-[#c0c1ff] hover:text-[#1000a9] text-[#dfe2ee] font-label-ui text-label-ui font-semibold flex items-center gap-space-xs transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-sm">terminal</span>
              <span>Resume Active Workspace</span>
            </Link>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="mt-space-lg p-space-md bg-[#181c24] rounded-xl border border-[#262a33] flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="text-xs text-[#908fa0] font-label-code uppercase">Problem:</span>
              <select
                value={filterProblem}
                onChange={(e) => setFilterProblem(e.target.value)}
                className="bg-[#0a0e16] border border-[#262a33] text-[#dfe2ee] text-xs font-label-ui px-space-sm py-1.5 rounded-lg outline-none cursor-pointer"
              >
            <option value="all">All Systems ({problems.length})</option>
                {problems.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-space-xs">
              <span className="text-xs text-[#908fa0] font-label-code uppercase">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#0a0e16] border border-[#262a33] text-[#dfe2ee] text-xs font-label-ui px-space-sm py-1.5 rounded-lg outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="COMPLETED">Completed (Graded)</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="NEEDS_REVISION">Needs Revision</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-[#908fa0] font-label-code">
            Showing {filteredAttempts.length} recorded runs
          </span>
        </div>

        {/* Table of Attempts */}
        <div className="mt-space-lg bg-[#181c24] rounded-2xl border border-[#262a33] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262a33] bg-[#0a0e16]/60 text-xs font-label-code text-[#908fa0] uppercase tracking-wider">
                  <th className="py-space-md px-space-lg">System / Run</th>
                  <th className="py-space-md px-space-md">Date</th>
                  <th className="py-space-md px-space-md">Time Spent</th>
                  <th className="py-space-md px-space-md">Language</th>
                  <th className="py-space-md px-space-md">Status</th>
                  <th className="py-space-md px-space-md">Staff Score</th>
                  <th className="py-space-md px-space-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a33] text-xs font-body-sm">
                {filteredAttempts.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1c2028] transition-colors group">
                    <td className="py-space-md px-space-lg">
                      <div className="font-semibold text-body-sm text-[#dfe2ee] group-hover:text-[#c0c1ff] transition-colors">
                        {item.problemTitle}
                      </div>
                      <div className="text-[11px] text-[#908fa0] font-label-code">
                        Attempt #{item.attemptNumber} • {item.id}
                      </div>
                    </td>
                    <td className="py-space-md px-space-md text-[#c7c4d7]">{item.date}</td>
                    <td className="py-space-md px-space-md font-label-code text-[#dfe2ee]">
                      {item.timeSpent}
                    </td>
                    <td className="py-space-md px-space-md">
                      <span className="px-1.5 py-0.5 rounded bg-[#0a0e16] border border-[#262a33] font-label-code text-[11px] text-[#c0c1ff]">
                        {item.language}
                      </span>
                    </td>
                    <td className="py-space-md px-space-md">
                      <span
                        className={`px-2 py-0.5 rounded-full font-label-code text-[11px] font-semibold ${
                          item.status === 'COMPLETED'
                            ? 'bg-[#00a572]/20 text-[#4edea3]'
                            : item.status === 'IN_PROGRESS'
                            ? 'bg-[#c0c1ff]/20 text-[#c0c1ff]'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-space-md px-space-md">
                      {item.score ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-headline-sm text-body-md font-bold ${
                              item.score >= 90
                                ? 'text-[#4edea3]'
                                : item.score >= 80
                                ? 'text-[#c0c1ff]'
                                : 'text-amber-400'
                            }`}
                          >
                            {item.score}
                          </span>
                          <span className="text-[#908fa0] text-[10px]">/ 100</span>
                        </div>
                      ) : (
                        <span className="text-[#908fa0]">—</span>
                      )}
                    </td>
                    <td className="py-space-md px-space-lg text-right space-x-2">
                      {item.score && (
                        <Link
                          to={`/evaluation/${item.id}`}
                          className="px-2.5 py-1 rounded bg-[#262a33] hover:bg-[#353942] text-[#dfe2ee] font-label-ui text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">assessment</span>
                          <span>Rubric</span>
                        </Link>
                      )}
                      <Link
                        to={`/workspace/${item.id}`}
                        className="px-2.5 py-1 rounded bg-[#8083ff] hover:bg-[#c0c1ff] hover:text-[#1000a9] text-[#dfe2ee] font-label-ui text-xs font-medium inline-flex items-center gap-1 transition-all"
                      >
                        <span className="material-symbols-outlined text-xs">code</span>
                        <span>Workspace</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Score Progression Insight */}
        <div className="mt-space-2xl grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          <div className="p-space-lg bg-[#181c24] rounded-xl border border-[#262a33] space-y-space-xs">
            <span className="font-label-code text-xs text-[#4edea3] uppercase">Trajectory Trend</span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-[#dfe2ee]">
              {filteredAttempts.length > 1 ? 'Score trajectory' : 'No score trajectory yet'}
            </h3>
            <p className="font-body-sm text-body-sm text-[#c7c4d7]">
              {filteredAttempts.length > 1 ? 'Scores and status are read from your saved evaluations.' : 'Submit an attempt to start building your evaluation history.'}
            </p>
          </div>

          <div className="p-space-lg bg-[#181c24] rounded-xl border border-[#262a33] space-y-space-xs">
            <span className="font-label-code text-xs text-[#c0c1ff] uppercase">Total Dedicated Hours</span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-[#dfe2ee]">
              {filteredAttempts.length} Recorded Attempts
            </h3>
            <p className="font-body-sm text-body-sm text-[#c7c4d7]">
              This count is loaded directly from the authenticated history endpoint.
            </p>
          </div>

          <div className="p-space-lg bg-[#181c24] rounded-xl border border-[#262a33] space-y-space-xs">
            <span className="font-label-code text-xs text-[#4cd7f6] uppercase">Staff Calibration</span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-[#dfe2ee]">
              {filteredAttempts.filter((item) => item.score != null).length} Evaluated Attempts
            </h3>
            <p className="font-body-sm text-body-sm text-[#c7c4d7]">
              Open a rubric report to inspect the real analysis returned for each evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
