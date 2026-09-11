import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GenericAvatar } from '../components/layout/TopNavigation';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateTrack } = useAuth();
  const [activeTrack, setActiveTrack] = useState(user?.track || 'L6 Prep');
  const [savedNote, setSavedNote] = useState(false);
  const [stats, setStats] = useState<{ completed_attempts: number; average_score: number | null }>({ completed_attempts: 0, average_score: null });

  useEffect(() => { api.get<typeof stats>('/dashboard').then(setStats).catch(() => {}); }, []);

  const handleTrackChange = (newTrack: string) => {
    setActiveTrack(newTrack);
    updateTrack(newTrack);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2ee] pb-space-3xl">
      <div className="w-full px-layout-margin-desktop pt-space-2xl pb-space-xl">
        <div className="pb-space-lg border-b border-[#262a33]">
          <h1 className="font-headline-xl text-headline-xl text-[#dfe2ee] font-semibold">
            Engineer Profile &amp; Calibration
          </h1>
          <p className="font-body-md text-body-md text-[#c7c4d7] mt-space-xs">
            Manage your evaluation target level, benchmark standards, and personal progress analytics.
          </p>
        </div>

        <div className="mt-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column: User Card */}
          <div className="lg:col-span-4 bg-[#181c24] p-space-xl rounded-2xl border border-[#262a33] shadow-lg space-y-space-lg">
            <div className="flex items-center gap-space-md">
              <GenericAvatar className="w-16 h-16 border-2 border-[#8083ff]" />
              <div>
                <h2 className="font-headline-sm text-body-lg font-bold text-[#dfe2ee]">
                  {user?.name || 'Engineer'}
                </h2>
                <p className="text-xs text-[#908fa0]">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#8083ff]/20 text-[#c0c1ff] font-label-code text-[11px] font-semibold">
                  {activeTrack}
                </span>
              </div>
            </div>

            <div className="space-y-space-sm pt-space-sm border-t border-[#262a33] text-xs">
              <div className="flex justify-between text-[#c7c4d7]">
                <span>Registered Role</span>
                <span className="text-[#dfe2ee] font-medium">{user?.role || 'Staff Engineer'}</span>
              </div>
              <div className="flex justify-between text-[#c7c4d7]">
                <span>Practice Streak</span>
                <span className="text-amber-400 font-semibold">{user?.streakDays || 0} Consecutive Days</span>
              </div>
              <div className="flex justify-between text-[#c7c4d7]">
                <span>Evaluated Blueprints</span>
                <span className="text-[#4edea3] font-semibold">{stats.completed_attempts} Completed</span>
              </div>
              <div className="flex justify-between text-[#c7c4d7]">
                <span>Average Benchmark Score</span>
                <span className="text-[#c0c1ff] font-semibold">{stats.average_score ?? '—'} / 100</span>
              </div>
            </div>
          </div>

          {/* Right Column: Track & Settings */}
          <div className="lg:col-span-8 bg-[#181c24] p-space-xl rounded-2xl border border-[#262a33] shadow-lg space-y-space-xl">
            <div className="space-y-space-xs">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-[#dfe2ee]">
                Target Benchmark Track
              </h3>
              <p className="text-xs text-[#c7c4d7]">
                Selecting a track adjusts the strictness of the AST concurrency linter, lock granularity expectations, and rubric weighting.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              {[
                {
                  id: 'L5 Prep',
                  title: 'Senior Engineer (L5)',
                  desc: 'Focus on SOLID, design patterns, clean separation of concerns, and basic multi-threading.'
                },
                {
                  id: 'L6 Prep',
                  title: 'Staff Architect (L6)',
                  desc: 'Strict AST thread contention checks, Striped/Stamped locks, OCP decoupling, and high throughput SLAs.'
                },
                {
                  id: 'L7 Prep',
                  title: 'Principal / Lead (L7)',
                  desc: 'Fault-domain resilience, zero-downtime extensibility, lock-free algorithms, and deep failure mode trade-offs.'
                }
              ].map((track) => {
                const isSelected = activeTrack === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleTrackChange(track.id)}
                    className={`cursor-pointer p-space-md rounded-xl border transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[#1c2028] border-[#8083ff] ring-1 ring-[#8083ff] shadow-md'
                        : 'bg-[#0a0e16] border-[#262a33] hover:border-[#464554]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-xs font-bold text-[#dfe2ee]">
                        {track.title}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-xs text-[#4edea3]">check_circle</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#908fa0] leading-relaxed">{track.desc}</p>
                  </div>
                );
              })}
            </div>

            {savedNote && (
              <div className="p-2 rounded bg-[#00a572]/20 text-[#4edea3] text-xs font-label-code text-center">
                ✓ Track updated to {activeTrack}!
              </div>
            )}

            {/* Language Preferences */}
            <div className="pt-space-md border-t border-[#262a33] space-y-space-md">
              <h3 className="font-headline-sm text-body-lg font-semibold text-[#dfe2ee]">
                Language &amp; Runtime Settings
              </h3>
              <div className="flex flex-wrap gap-space-md text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="lang" defaultChecked className="accent-[#8083ff]" />
                  <span>Java 17 / 21 (Loom Virtual Threads enabled)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#908fa0]">
                  <input type="radio" name="lang" disabled className="accent-[#8083ff]" />
                  <span>C++ 20 (Coming Soon)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#908fa0]">
                  <input type="radio" name="lang" disabled className="accent-[#8083ff]" />
                  <span>Go 1.22 (Coming Soon)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
