import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/layout/TopNavigation';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const applicationPath = isAuthenticated ? '/dashboard' : '/login';
  const profilePath = isAuthenticated ? '/dashboard' : '/';
  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee] font-body-md antialiased selection:bg-[#8083ff] selection:text-[#0d0096]">
      {/* Top Fixed Header */}
      <header className="fixed inset-x-0 top-0 z-[100] h-20 overflow-visible bg-[#0f131c]/95 backdrop-blur-xl border-b border-[#262a33]/60 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="h-20 max-w-7xl mx-auto px-layout-margin-mobile lg:px-layout-margin-desktop flex items-center justify-between gap-space-lg">
          <Link to="/" className="flex items-center gap-space-sm group">
            <BrandLogo className="h-12 w-12 transition-transform group-hover:scale-105" />
            <span className="font-headline-sm text-headline-sm tracking-tight text-[#dfe2ee]">
              LLD<span className="text-[#8083ff] font-semibold">Lotion</span>
            </span>
          </Link>

          <div className="flex items-center gap-space-sm">
            <Link
              to="/login"
              className="px-space-md py-space-xs rounded-lg font-label-ui text-body-sm text-[#c7c4d7] hover:text-[#dfe2ee] hover:bg-[#262a33] border border-[#464554]/40 transition-all"
            >
              Sign In
            </Link>
            <Link
              to={applicationPath}
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-ui text-body-sm bg-[#8083ff] text-[#dfe2ee] hover:bg-[#c0c1ff] hover:text-[#1000a9] font-medium transition-all shadow-[0_0_12px_rgba(128,131,255,0.25)]"
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>Start Practice Free</span>
            </Link>
            <Link
              to={profilePath}
              className="w-8 h-8 rounded-full bg-[#c0c1ff] flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[#1000a9] text-[18px]">person</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-20 bg-[#0f131c]">
        <div className="flex flex-col w-full">
          {/* Ambient Light Accents */}
          <div className="relative w-full overflow-hidden">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-tr from-[#8083ff]/20 via-[#009eb9]/10 to-transparent blur-[120px] pointer-events-none rounded-full"></div>
            <div className="absolute top-96 -left-32 w-[380px] h-[380px] bg-[#00a572]/10 blur-[100px] pointer-events-none rounded-full"></div>

            {/* 1. HERO SECTION */}
            <section className="relative max-w-7xl mx-auto px-layout-margin-mobile lg:px-layout-margin-desktop pt-space-2xl pb-space-3xl">
              <div className="flex flex-col lg:flex-row gap-space-2xl items-center">
                <div className="w-full lg:w-1/2 max-w-2xl">
                <div className="hidden">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]"></span>
                  Built for L5–L7 machine coding interviews
                </div>
                <h1 className="mt-0 max-w-3xl font-headline-xl text-headline-xl sm:text-[52px] sm:leading-[58px] font-bold text-[#dfe2ee] tracking-tight">
                  Turn low-level design into <span className="text-[#c0c1ff]">interview-ready architecture.</span>
                </h1>
                <p className="font-body-lg text-body-lg text-[#c7c4d7] mt-space-sm max-w-2xl leading-relaxed">
                  The precision workbench engineered for senior software engineers preparing for L5–L7 machine coding screens. Deconstruct architectures with the 11-section blueprint and deterministic AST validation.
                </p>
                <div className="mt-space-3xl flex flex-wrap items-center gap-space-md">
                  <Link
                    to={applicationPath}
                    className="flex items-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-[#8083ff] text-[#dfe2ee] hover:bg-[#c0c1ff] hover:text-[#1000a9] font-label-ui text-label-ui font-semibold transition-all shadow-[0_0_20px_rgba(128,131,255,0.28)]"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    <span>Open Workspace</span>
                  </Link>
                  <Link
                    to="/problems"
                    className="flex items-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-transparent text-[#c7c4d7] hover:text-[#dfe2ee] hover:bg-[#1c2028] border border-[#464554]/70 font-label-ui text-label-ui transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    <span>Explore Problem Library</span>
                  </Link>
                </div>
                <div className="hidden">
                  <div className="flex-1"><p className="font-headline-sm text-headline-sm text-[#dfe2ee]">11-step</p><p className="mt-space-2xs font-body-sm text-body-sm text-[#908fa0]">design blueprint</p></div>
                  <div className="flex-1"><p className="font-headline-sm text-headline-sm text-[#dfe2ee]">Dual</p><p className="mt-space-2xs font-body-sm text-body-sm text-[#908fa0]">evaluation engine</p></div>
                  <div className="flex-1"><p className="font-headline-sm text-headline-sm text-[#dfe2ee]">&lt;3 sec</p><p className="mt-space-2xs font-body-sm text-body-sm text-[#908fa0]">actionable feedback</p></div>
                </div>
                </div>
                <div className="hidden lg:flex w-1/2 relative min-h-[250px] items-center justify-end">
                  <div className="absolute inset-8 rounded-full bg-[#8083ff]/10 blur-3xl"></div>
                  <div className="relative w-full max-w-[640px] rounded-2xl border border-[#464554]/70 bg-[#0a0e16]/90 p-space-md shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                    <div className="flex items-center justify-between border-b border-[#262a33] pb-space-sm"><span className="font-label-code text-label-code text-[#c7c4d7]">LIVE ARCHITECTURE REVIEW</span><span className="font-label-code text-label-code text-[#4edea3]">● RUNNING</span></div>
                    <div className="mt-space-md grid grid-cols-[1.1fr_0.9fr] gap-space-sm">
                      <div className="rounded-lg border border-[#262a33] bg-[#181c24] p-space-sm"><span className="font-label-code text-label-code text-[#908fa0]">CLASS GRAPH</span><div className="mt-space-md flex items-center justify-center gap-space-xs"><div className="rounded border border-[#4cd7f6]/50 bg-[#4cd7f6]/10 px-space-sm py-space-md text-center"><span className="block font-label-code text-label-code text-[#4cd7f6]">INTERFACE</span><span className="font-code-block text-code-block text-[#dfe2ee]">Payment</span></div><span className="text-[#908fa0]">→</span><div className="rounded border border-[#c0c1ff]/50 bg-[#8083ff]/10 px-space-sm py-space-md text-center"><span className="block font-label-code text-label-code text-[#c0c1ff]">SERVICE</span><span className="font-code-block text-code-block text-[#dfe2ee]">Checkout</span></div></div></div>
                      <div className="rounded-lg border border-[#262a33] bg-[#181c24] p-space-sm"><span className="font-label-code text-label-code text-[#908fa0]">QUALITY SCORE</span><div className="mt-space-sm flex items-end gap-space-sm"><span className="font-headline-xl text-headline-xl text-[#4edea3]">88</span><span className="mb-space-xs font-label-code text-label-code text-[#4edea3]">/ 100</span></div><div className="mt-space-sm h-1.5 rounded-full bg-[#262a33]"><div className="h-full w-[88%] rounded-full bg-[#4edea3]"></div></div><p className="mt-space-sm font-label-code text-label-code text-[#908fa0]">STAFF-READY SIGNALS</p></div>
                    </div>
                    <div className="mt-space-sm rounded-lg border border-[#4edea3]/20 bg-[#4edea3]/5 px-space-sm py-space-sm font-label-code text-label-code text-[#4edea3]">✓ No circular dependencies · ✓ Lock scope looks healthy</div>
                  </div>
                </div>
              </div>

              {/* Hero Mockup: High-Fidelity LLD Workspace from Stitch */}
              <div className="mt-space-xl rounded-xl bg-[#181c24] border border-[#464554]/60 shadow-2xl overflow-hidden" id="interactive-demo">
                {/* Workspace Top Status Strip */}
                <div className="px-space-lg py-space-sm bg-[#0a0e16] border-b border-[#262a33] flex flex-wrap items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="flex items-center gap-space-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#c0c1ff]/80"></span>
                    </div>
                    <span className="font-label-code text-label-code text-[#c7c4d7] font-medium">
                      SESSION // ARCH-PARKING-LOT-01
                    </span>
                    <span className="px-space-xs py-space-2xs rounded bg-[#1c2028] text-[#4edea3] font-label-code text-label-code">
                      CONCURRENCY ENGINE ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-space-md">
                    <span className="font-label-code text-label-code text-[#908fa0]">
                      TIME ELAPSED: <span className="text-[#dfe2ee]">34:12</span> / 60:00
                    </span>
                  </div>
                </div>

                {/* 3-Pane Workbench Architecture Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Left Pane: 11-Section Blueprint & Requirements */}
                  <div className="lg:col-span-3 bg-[#0a0e16] p-space-md border-r border-[#262a33] flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between pb-space-xs">
                      <span className="font-label-ui text-label-ui font-semibold text-[#dfe2ee] uppercase tracking-wider">
                        11-Section Blueprint
                      </span>
                      <span className="font-label-code text-label-code text-[#4edea3] font-semibold">
                        8/11 DONE
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-[#262a33] h-1.5 rounded-full overflow-hidden mb-space-xs">
                      <div className="bg-[#4edea3] h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    {/* Section Item List */}
                    <div className="flex flex-col gap-space-2xs font-label-code text-label-code overflow-hidden">
                      <div className="flex items-center justify-between p-space-xs rounded bg-[#1c2028] text-[#dfe2ee]">
                        <span className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[#4edea3] text-[14px]">check_circle</span>
                          01 Scope &amp; Capacity
                        </span>
                        <span className="text-[#908fa0]">100%</span>
                      </div>
                      <div className="flex items-center justify-between p-space-xs rounded bg-[#1c2028] text-[#dfe2ee]">
                        <span className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[#4edea3] text-[14px]">check_circle</span>
                          02 Core Entities
                        </span>
                        <span className="text-[#908fa0]">100%</span>
                      </div>
                      <div className="flex items-center justify-between p-space-xs rounded bg-[#1c2028] text-[#dfe2ee]">
                        <span className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[#4edea3] text-[14px]">check_circle</span>
                          03 Relationship Matrix
                        </span>
                        <span className="text-[#908fa0]">100%</span>
                      </div>
                      <div className="flex items-center justify-between p-space-xs rounded bg-[#1c2028] text-[#dfe2ee]">
                        <span className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[#4edea3] text-[14px]">check_circle</span>
                          04 Strategy Pattern
                        </span>
                        <span className="text-[#908fa0]">100%</span>
                      </div>
                      <div className="flex items-center justify-between p-space-xs rounded bg-[#8083ff]/20 text-[#c0c1ff]">
                        <span className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[14px] animate-pulse">radio_button_checked</span>
                          05 Concurrency Control
                        </span>
                        <span className="font-semibold">IN REVIEW</span>
                      </div>
                      <div className="flex items-center justify-between p-space-xs rounded bg-[#181c24] text-[#908fa0]">
                        <span className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[14px]">radio_button_unchecked</span>
                          06 Locking Bottlenecks
                        </span>
                        <span>PENDING</span>
                      </div>
                      <div className="flex items-center justify-between p-space-xs rounded bg-[#181c24] text-[#908fa0]">
                        <span className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[14px]">radio_button_unchecked</span>
                          07 Exception Hierarchy
                        </span>
                        <span>PENDING</span>
                      </div>
                    </div>
                    {/* Active Scenario Card */}
                    <div className="mt-space-sm p-space-sm rounded-lg bg-[#1c2028] border border-[#262a33] flex flex-col gap-space-xs">
                      <span className="font-label-code text-label-code text-[#c0c1ff] uppercase">Active Scenario</span>
                      <p className="font-body-sm text-body-sm text-[#c7c4d7] line-clamp-3">
                        Support multi-floor capacity. Ensure thread-safe spot reservations during burst arrivals without global lock contention on the ParkingFloor instance.
                      </p>
                    </div>
                  </div>

                  {/* Center Pane: Interactive UML & Architectural Graph Canvas */}
                  <div className="lg:col-span-5 bg-[#1c2028] p-space-md flex flex-col justify-between relative overflow-hidden border-r border-[#262a33]">
                    {/* Canvas HUD Toolbar */}
                    <div className="flex items-center justify-between mb-space-sm z-10">
                      <div className="flex items-center gap-space-xs">
                        <span className="px-space-xs py-space-2xs rounded bg-[#0a0e16] text-[#dfe2ee] font-label-code text-label-code">
                          CANVAS: CLASS_GRAPH
                        </span>
                        <span className="text-[#908fa0] font-label-code text-label-code">ZOOM: 100%</span>
                      </div>
                      <div className="flex items-center gap-space-2xs bg-[#0a0e16] rounded-lg p-space-2xs text-[#c7c4d7]">
                        <button className="p-space-2xs hover:text-white" type="button">
                          <span className="material-symbols-outlined text-[16px]">pan_tool</span>
                        </button>
                        <button className="p-space-2xs hover:text-white" type="button">
                          <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                        </button>
                        <button className="p-space-2xs hover:text-white" type="button">
                          <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        </button>
                      </div>
                    </div>

                    {/* Simulated UML Interactive Nodes */}
                    <div className="flex flex-col gap-space-md my-auto py-space-md z-10">
                      {/* Class Node 1: Interface */}
                      <div className="max-w-xs mx-auto w-full bg-[#0a0e16] rounded-lg shadow-md overflow-hidden border border-[#262a33]">
                        <div className="bg-[#262a33] px-space-sm py-space-xs flex items-center justify-between">
                          <span className="font-label-code text-label-code text-[#4cd7f6]">
                            &lt;&lt;interface&gt;&gt; IParkingStrategy
                          </span>
                          <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">hub</span>
                        </div>
                        <div className="p-space-xs font-code-block text-code-block text-[#c7c4d7]">
                          <p className="text-[#4edea3]">+ allocate(SpotType): Spot</p>
                          <p className="text-[#4edea3]">+ release(Spot): void</p>
                        </div>
                      </div>

                      {/* Connecting Vector Graphic Wire */}
                      <div className="flex justify-center -my-space-xs">
                        <svg className="w-16 h-8 text-[#464554]" fill="none" viewBox="0 0 64 32">
                          <path
                            d="M32 0V32M32 32L26 22M32 32L38 22"
                            stroke="currentColor"
                            strokeDasharray="3 3"
                            strokeWidth="1.5"
                          ></path>
                        </svg>
                      </div>

                      {/* Class Node 2: Concrete Implementation */}
                      <div className="max-w-xs mx-auto w-full bg-[#0a0e16] rounded-lg shadow-md overflow-hidden ring-1 ring-[#c0c1ff]/40 border border-[#8083ff]/30">
                        <div className="bg-[#8083ff]/20 px-space-sm py-space-xs flex items-center justify-between">
                          <span className="font-label-code text-label-code text-[#c0c1ff] font-semibold">
                            NearestFirstStrategy
                          </span>
                          <span className="px-space-2xs rounded bg-[#c0c1ff]/20 text-[#c0c1ff] font-label-code text-label-code">
                            OCP VERIFIED
                          </span>
                        </div>
                        <div className="p-space-xs font-code-block text-code-block text-[#c7c4d7] flex flex-col gap-space-2xs">
                          <p className="text-[#908fa0]">- floorQueues: ConcurrentSkipListMap</p>
                          <p className="text-[#dfe2ee]">
                            + allocate(SpotType): Spot{' '}
                            <span className="text-[#4edea3] font-semibold">/* Lock-free CAS */</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[#908fa0] font-label-code text-label-code pt-space-xs z-10 border-t border-[#262a33]">
                      <span>DESIGN PATTERN: STRATEGY + CONCURRENT SKIPLIST</span>
                      <span className="text-[#4edea3]">AST VERIFIED: VALID</span>
                    </div>
                  </div>

                  {/* Right Pane: Live Evaluator Scorecard & AST Telemetry */}
                  <div className="lg:col-span-4 bg-[#0a0e16] p-space-md flex flex-col justify-between">
                    <div className="flex flex-col gap-space-md">
                      <div className="flex items-center justify-between">
                        <span className="font-label-ui text-label-ui font-semibold text-[#dfe2ee] uppercase tracking-wider">
                          Live Evaluation Rubric
                        </span>
                        <span className="px-space-xs py-space-2xs rounded bg-[#4edea3]/10 text-[#4edea3] font-label-code text-label-code font-bold">
                          STAFF CALIBRATED
                        </span>
                      </div>

                      {/* Score Indicator Card */}
                      <div className="p-space-md rounded-xl bg-[#1c2028] border border-[#262a33] flex items-center gap-space-lg">
                        {/* SVG Score Dial */}
                        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-[#262a33]"
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
                              strokeDasharray="88, 100"
                              strokeLinecap="round"
                              strokeWidth="3.5"
                            ></path>
                          </svg>
                          <span className="absolute font-headline-sm text-headline-sm font-bold text-[#dfe2ee]">88</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-body-lg font-bold text-[#dfe2ee]">Staff Ready (L6+)</span>
                          <span className="font-body-sm text-body-sm text-[#908fa0]">Target threshold: &gt;85/100</span>
                          <span className="font-label-code text-label-code text-[#4edea3] font-semibold">
                            AST Pass 14/14 • LLM Score: 9.1
                          </span>
                        </div>
                      </div>

                      {/* Rubric Breakdown Rows */}
                      <div className="flex flex-col gap-space-xs">
                        <div>
                          <div className="flex justify-between font-label-code text-label-code text-[#c7c4d7] mb-space-2xs">
                            <span>SOLID - Open/Closed (OCP)</span>
                            <span className="text-[#4edea3]">95%</span>
                          </div>
                          <div className="w-full bg-[#262a33] h-1 rounded-full overflow-hidden">
                            <div className="bg-[#4edea3] h-full" style={{ width: '95%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between font-label-code text-label-code text-[#c7c4d7] mb-space-2xs">
                            <span>Concurrency &amp; Thread Safety</span>
                            <span className="text-[#c0c1ff]">85%</span>
                          </div>
                          <div className="w-full bg-[#262a33] h-1 rounded-full overflow-hidden">
                            <div className="bg-[#c0c1ff] h-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between font-label-code text-label-code text-[#c7c4d7] mb-space-2xs">
                            <span>Extensibility &amp; Decoupling</span>
                            <span className="text-[#4cd7f6]">92%</span>
                          </div>
                          <div className="w-full bg-[#262a33] h-1 rounded-full overflow-hidden">
                            <div className="bg-[#4cd7f6] h-full" style={{ width: '92%' }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Real-time Diagnostic alert */}
                      <div className="p-space-sm rounded-lg bg-[#262a33] border border-[#31353e] flex flex-col gap-space-2xs">
                        <div className="flex items-center gap-space-xs text-[#c0c1ff] font-label-code text-label-code font-semibold">
                          <span className="material-symbols-outlined text-[14px]">tune</span>
                          <span>OPT-SUGGESTION: SECTION 05</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-[#c7c4d7]">
                          Replaced coarse synchronized block with Striped Locks per floor. Contention latency reduced by 74% in AST test suite.
                        </p>
                      </div>
                    </div>

                    {/* Terminal Run Indicator */}
                    <div className="pt-space-sm flex items-center justify-between font-label-code text-label-code text-[#908fa0] border-t border-[#262a33]">
                      <span className="flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span> 120/120 Stress Threads OK
                      </span>
                      <span>18ms LATENCY</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 2. THE PROBLEM WITH CURRENT PREP (CONTRAST MATRIX) */}
          <section className="w-full bg-[#0a0e16] py-space-3xl border-t border-b border-[#262a33]/60">
            <div className="max-w-7xl mx-auto px-layout-margin-mobile lg:px-layout-margin-desktop">
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-2xl">
                <h2 className="font-headline-lg text-headline-lg text-[#dfe2ee] font-bold mb-space-sm">
                  Why 80% of Senior Candidates Fail the Machine Coding Round
                </h2>
                <p className="font-body-md text-body-md text-[#c7c4d7]">
                  Interviews for L5-L7 roles evaluate architecture elasticity, design pattern appropriateness, and thread-safety under heavy concurrency. Generic advice doesn't prepare you for real technical scrutiny.
                </p>
              </div>

              {/* Contrast Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl">
                {/* The Traditional Way Card */}
                <div className="p-space-xl rounded-xl bg-[#181c24] border border-[#262a33] flex flex-col justify-between">
                  <div className="flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-body-lg font-bold text-[#908fa0]">The Traditional Way</span>
                      <span className="px-space-sm py-space-2xs rounded bg-[#93000a]/20 text-[#ffb4ab] font-label-code text-label-code font-semibold">
                        AMBIGUOUS &amp; FRAGILE
                      </span>
                    </div>
                    <ul className="flex flex-col gap-space-md font-body-md text-body-md text-[#c7c4d7]">
                      <li className="flex items-start gap-space-sm">
                        <span className="material-symbols-outlined text-[#ffb4ab] text-[20px] shrink-0 mt-0.5">close</span>
                        <span>
                          <strong>Passive YouTube Consumption:</strong> Watching 2-hour video lectures without writing a single line of interface contracts or state machines.
                        </span>
                      </li>
                      <li className="flex items-start gap-space-sm">
                        <span className="material-symbols-outlined text-[#ffb4ab] text-[20px] shrink-0 mt-0.5">close</span>
                        <span>
                          <strong>Toy Problem LeetCode Threads:</strong> Memorizing code snippets without understanding class coupling, inversion of control, or separation of concerns.
                        </span>
                      </li>
                      <li className="flex items-start gap-space-sm">
                        <span className="material-symbols-outlined text-[#ffb4ab] text-[20px] shrink-0 mt-0.5">close</span>
                        <span>
                          <strong>No Deterministic Feedback:</strong> Zero automated checking for thread contention, deadlocks, or violation of the Open-Closed Principle.
                        </span>
                      </li>
                      <li className="flex items-start gap-space-sm">
                        <span className="material-symbols-outlined text-[#ffb4ab] text-[20px] shrink-0 mt-0.5">close</span>
                        <span>
                          <strong>Subjective Guesswork:</strong> Stepping into a 60-minute interview with no structured time management strategy or rubric awareness.
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-space-xl p-space-md rounded-lg bg-[#31353e]/40 text-[#908fa0] font-label-code text-label-code">
                    RESULT: Candidate defaults to god-classes, gets rejected for rigid code and race conditions.
                  </div>
                </div>

                {/* The LLD Lotion Standard Card */}
                <div className="p-space-xl rounded-xl bg-[#1c2028] border border-[#464554] flex flex-col justify-between shadow-xl">
                  <div className="flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-body-lg font-bold text-[#dfe2ee]">The LLD Lotion Standard</span>
                      <span className="px-space-sm py-space-2xs rounded bg-[#00a572]/20 text-[#4edea3] font-label-code text-label-code font-semibold">
                        ENGINEERED FOR L6+
                      </span>
                    </div>
                    <ul className="flex flex-col gap-space-md font-body-md text-body-md text-[#c7c4d7]">
                      <li className="flex items-start gap-space-sm">
                        <span className="material-symbols-outlined text-[#4edea3] text-[20px] shrink-0 mt-0.5">check_circle</span>
                        <span>
                          <strong>The 11-Section Blueprint:</strong> A repeatable, step-by-step framework to decompose, architect, and code any problem in under 45 minutes.
                        </span>
                      </li>
                      <li className="flex items-start gap-space-sm">
                        <span className="material-symbols-outlined text-[#4edea3] text-[20px] shrink-0 mt-0.5">check_circle</span>
                        <span>
                          <strong>Deterministic AST Validation:</strong> Programmatic analysis parses your class tree to check for tight coupling, circular dependencies, and correct pattern implementations.
                        </span>
                      </li>
                      <li className="flex items-start gap-space-sm">
                        <span className="material-symbols-outlined text-[#4edea3] text-[20px] shrink-0 mt-0.5">check_circle</span>
                        <span>
                          <strong>Zero-Temperature LLM Evaluation:</strong> Deep contextual reasoning evaluates extensibility, clean architecture, and staff-calibrated trade-offs.
                        </span>
                      </li>
                      <li className="flex items-start gap-space-sm">
                        <span className="material-symbols-outlined text-[#4edea3] text-[20px] shrink-0 mt-0.5">check_circle</span>
                        <span>
                          <strong>5-Part Diagnostic Playbook:</strong> Instant actionable diffs show you the precise code changes needed to elevate your solution from Senior to Staff.
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-space-xl p-space-md rounded-lg bg-[#00a572]/15 border border-[#00a572]/30 text-[#4edea3] font-label-code text-label-code font-semibold">
                    RESULT: Predictable, test-passing solutions that interviewers cite as exemplary architecture.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. CORE FEATURE PILLARS */}
          <section className="w-full py-space-3xl">
            <div className="max-w-7xl mx-auto px-layout-margin-mobile lg:px-layout-margin-desktop">
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-3xl">
                <h2 className="font-headline-lg text-headline-lg text-[#dfe2ee] font-bold mb-space-sm">
                  Three Pillars Built for Engineering Rigor
                </h2>
                <p className="font-body-md text-body-md text-[#c7c4d7]">
                  We rebuilt the machine coding interview workspace from the ground up for software architects.
                </p>
              </div>

              {/* Bento Grid of Pillars */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-xl">
                {/* Pillar 1 */}
                <div className="p-space-xl rounded-xl bg-[#1c2028] border border-[#262a33] flex flex-col justify-between shadow-md">
                  <div className="flex flex-col gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-[#8083ff]/20 text-[#c0c1ff] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">format_list_bulleted_add</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-[#dfe2ee]">
                      The 11-Section Blueprint
                    </h3>
                    <p className="font-body-md text-body-md text-[#c7c4d7]">
                      Never freeze staring at an empty editor again. Follow our standardized framework from Requirements clarification, Entity Modeling, and Contract Definition to Thread-Safety Isolation and Clean Implementation.
                    </p>
                  </div>
                  <div className="mt-space-lg pt-space-md bg-[#0a0e16] p-space-sm rounded-lg flex flex-col gap-space-xs font-label-code text-label-code border border-[#262a33]">
                    <span className="text-[#908fa0]">FRAMEWORK SEQUENCE:</span>
                    <span className="text-[#c0c1ff] font-semibold">
                      01 Requirements → 04 Interfaces → 08 Locking → 11 Tests
                    </span>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="p-space-xl rounded-xl bg-[#1c2028] border border-[#262a33] flex flex-col justify-between shadow-md">
                  <div className="flex flex-col gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-[#00a572]/20 text-[#4edea3] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">account_tree</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-[#dfe2ee]">
                      Dual Evaluation Engine
                    </h3>
                    <p className="font-body-md text-body-md text-[#c7c4d7]">
                      A hybrid verification system. Fast deterministic AST static analysis validates design pattern structures, interface segregations, and thread locks, paired with strict LLM reasoning for architectural edge cases.
                    </p>
                  </div>
                  <div className="mt-space-lg pt-space-md bg-[#0a0e16] p-space-sm rounded-lg flex flex-col gap-space-xs font-label-code text-label-code border border-[#262a33]">
                    <span className="text-[#908fa0]">HYBRID PIPELINE:</span>
                    <span className="text-[#4edea3] font-semibold">
                      AST (Pattern Parser) + LLM (Staff Rubric Benchmark)
                    </span>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="p-space-xl rounded-xl bg-[#1c2028] border border-[#262a33] flex flex-col justify-between shadow-md">
                  <div className="flex flex-col gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-[#009eb9]/20 text-[#4cd7f6] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">rate_review</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-[#dfe2ee]">
                      5-Part Diagnostic Playbook
                    </h3>
                    <p className="font-body-md text-body-md text-[#c7c4d7]">
                      Generic "your code is slow" messages are useless. Our diagnostics break down every flaw into: Specific Issue, Underlying Root Cause, Real-World System Impact, Exact Code Diff Fix, and Staff Interview Trade-off.
                    </p>
                  </div>
                  <div className="mt-space-lg pt-space-md bg-[#0a0e16] p-space-sm rounded-lg flex flex-col gap-space-xs font-label-code text-label-code border border-[#262a33]">
                    <span className="text-[#908fa0]">DIAGNOSTIC OUTPUT:</span>
                    <span className="text-[#4cd7f6] font-semibold">
                      Issue • Root Cause • Impact • Diff Fix • Trade-off
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. HOW THE EVALUATION WORKS (STEP-BY-STEP WORKFLOW) */}
          <section className="w-full py-space-3xl bg-[#0a0e16] border-t border-b border-[#262a33]/60">
            <div className="max-w-7xl mx-auto px-layout-margin-mobile lg:px-layout-margin-desktop">
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-3xl">
                <h2 className="font-headline-lg text-headline-lg text-[#dfe2ee] font-bold mb-space-sm">
                  How the Evaluation Engine Works
                </h2>
                <p className="font-body-md text-body-md text-[#c7c4d7]">
                  From your first interface definition to comprehensive Staff-level diagnostic report in under 3 seconds.
                </p>
              </div>

              {/* 3 Flow Steps Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-xl relative">
                {/* Step 1 */}
                <div className="p-space-xl rounded-xl bg-[#1c2028] border border-[#262a33] flex flex-col gap-space-md shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-code text-body-lg font-bold text-[#c0c1ff]">STEP 01</span>
                    <span className="px-space-xs py-space-2xs rounded bg-[#31353e] text-[#c7c4d7] font-label-code text-label-code">
                      INPUT
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-[#dfe2ee]">
                    Draft Your Blueprint
                  </h3>
                  <p className="font-body-md text-body-md text-[#c7c4d7]">
                    Structure your solution through the 11-section framework. Design your interfaces, declare contract boundaries, and write clean idiomatic Java, C++, or Python code.
                  </p>
                  <div className="p-space-sm rounded-lg bg-[#0a0e16] font-code-block text-code-block text-[#c7c4d7] flex flex-col gap-space-2xs border border-[#262a33]">
                    <span className="text-[#4cd7f6]">public interface IEvictionPolicy&lt;K&gt; &#123;</span>
                    <span className="text-[#dfe2ee] pl-space-sm">void keyAccessed(K key);</span>
                    <span className="text-[#dfe2ee] pl-space-sm">K evictKey();</span>
                    <span className="text-[#4cd7f6]">&#125;</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-space-xl rounded-xl bg-[#1c2028] border border-[#262a33] flex flex-col gap-space-md shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-code text-body-lg font-bold text-[#4edea3]">STEP 02</span>
                    <span className="px-space-xs py-space-2xs rounded bg-[#00a572]/20 text-[#4edea3] font-label-code text-label-code">
                      ANALYSIS
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-[#dfe2ee]">
                    Deterministic AST &amp; Thread Harness
                  </h3>
                  <p className="font-body-md text-body-md text-[#c7c4d7]">
                    Our Abstract Syntax Tree parser traverses your type hierarchy. It verifies pattern adherence, circular dependencies, and runs concurrent load simulations against race conditions.
                  </p>
                  <div className="p-space-sm rounded-lg bg-[#0a0e16] font-code-block text-code-block text-[#4edea3] flex flex-col gap-space-2xs border border-[#262a33]">
                    <span>&gt; AST: AST_TREE_VALIDATED (0 violations)</span>
                    <span>&gt; THREAD_POOL: 50 concurrent writers spawned</span>
                    <span>&gt; RACE_DETECTOR: Zero data races caught</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-space-xl rounded-xl bg-[#1c2028] border border-[#262a33] flex flex-col gap-space-md shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-code text-body-lg font-bold text-[#4cd7f6]">STEP 03</span>
                    <span className="px-space-xs py-space-2xs rounded bg-[#009eb9]/20 text-[#4cd7f6] font-label-code text-label-code">
                      OUTPUT
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-[#dfe2ee]">
                    Staff Scorecard &amp; Diagnostic Diff
                  </h3>
                  <p className="font-body-md text-body-md text-[#c7c4d7]">
                    Receive your categorized 5-part feedback. Review line-by-line diffs showing how to decouple your concrete implementations and eliminate subtle performance bottlenecks.
                  </p>
                  <div className="p-space-sm rounded-lg bg-[#0a0e16] font-code-block text-code-block flex flex-col gap-space-2xs border border-[#262a33]">
                    <span className="text-[#ffb4ab] line-through">- synchronized(this) &#123; ... &#125;</span>
                    <span className="text-[#4edea3]">+ stripedLock.get(key).lock();</span>
                    <span className="text-[#908fa0] text-label-code">Bottleneck eliminated: +62% throughput</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. FINAL HIGH-IMPACT CTA BANNER */}
          <section className="w-full py-space-3xl relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-layout-margin-mobile lg:px-layout-margin-desktop text-center">
              <div className="p-space-2xl rounded-2xl bg-gradient-to-b from-[#1c2028] to-[#0a0e16] border border-[#8083ff]/30 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#8083ff]/10 rounded-full blur-2xl pointer-events-none"></div>
                <span className="px-space-sm py-space-2xs rounded-full bg-[#00a572]/20 text-[#4edea3] font-label-code text-label-code font-bold uppercase tracking-wider">
                  START YOUR CALIBRATION
                </span>
                <h2 className="font-headline-lg text-headline-lg font-bold text-[#dfe2ee] mt-space-sm">
                  Ready to Benchmark Your Low-Level Design?
                </h2>
                <p className="font-body-md text-body-md text-[#c7c4d7] mt-space-xs max-w-xl mx-auto">
                  Take on the Parking Lot System, Distributed Rate Limiter, or Elevator Dispatcher right now with instant deterministic AST grading.
                </p>
                <div className="mt-space-lg flex flex-wrap justify-center gap-space-md">
                  <Link
                    to={applicationPath}
                    className="px-space-xl py-space-sm rounded-lg bg-[#8083ff] text-[#dfe2ee] hover:bg-[#c0c1ff] hover:text-[#1000a9] font-label-ui text-label-ui font-semibold transition-all shadow-lg shadow-[#8083ff]/30"
                  >
                    Open Live Attempt #3
                  </Link>
                  <Link
                    to={applicationPath}
                    className="px-space-xl py-space-sm rounded-lg bg-[#262a33] text-[#dfe2ee] hover:bg-[#31353e] font-label-ui text-label-ui transition-all"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full overflow-hidden bg-[#080c14] border-t border-[#262a33]/60">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8083ff]/70 to-transparent"></div>
        <div className="absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-[#4cd7f6]/5 blur-3xl pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-layout-margin-mobile lg:px-layout-margin-desktop py-space-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] gap-space-2xl lg:gap-space-3xl mb-space-3xl">
            <div className="flex flex-col gap-space-md">
              <div className="flex items-center gap-space-sm">
                <BrandLogo className="h-10 w-10" />
                <span className="font-headline-sm text-headline-sm text-[#dfe2ee] font-semibold">LLD<span className="text-[#c0c1ff]">Lotion</span></span>
              </div>
              <span className="font-label-code text-label-code uppercase tracking-wider text-[#8083ff]">Practice with precision</span>
              <p className="text-[#c7c4d7] font-body-md text-body-md max-w-sm">
                The interactive workbench for senior software engineers preparing for Staff+ and Principal Object-Oriented Design, Concurrency, and System Architecture interviews.
              </p>
              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <span className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded bg-[#181c24] border border-[#4edea3]/30 text-[#4edea3] font-label-code text-label-code">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                  ENGINE ONLINE
                </span>
                <span className="text-[#908fa0] font-label-code text-label-code">SUB-100MS SIMULATOR</span>
              </div>
            </div>

            <div>
              <h4 className="font-headline-sm text-body-md text-[#dfe2ee] font-semibold uppercase tracking-wider mb-space-lg">
                Problem Catalogue
              </h4>
              <ul className="flex flex-col gap-space-md font-body-sm text-body-sm text-[#aeadc0]">
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">
                  <Link to={applicationPath}>Parking Lot Architecture (Tier 1)</Link>
                </li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">
                  <Link to="/problems">Elevator Dispatch Control System</Link>
                </li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">
                  <Link to="/problems">Distributed Token Bucket Rate Limiter</Link>
                </li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">
                  <Link to="/problems">In-Memory Key-Value Store</Link>
                </li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">
                  <Link to="/problems">Pub-Sub Event Broker with Dead Letter</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline-sm text-body-md text-[#dfe2ee] font-semibold uppercase tracking-wider mb-space-lg">
                Benchmarking
              </h4>
              <ul className="flex flex-col gap-space-md font-body-sm text-body-sm text-[#aeadc0]">
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">LLD Lotion vs. LeetCode</li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">LLD vs High-Level System Design</li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">Staff Engineer Interview Rubrics</li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">SOLID &amp; GoF Pattern Matrix</li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">Thread Safety &amp; Lock-Free Runbook</li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline-sm text-body-md text-[#dfe2ee] font-semibold uppercase tracking-wider mb-space-lg">
                Resources &amp; Social
              </h4>
              <ul className="flex flex-col gap-space-md font-body-sm text-body-sm text-[#aeadc0]">
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">Interactive UML Cheatsheet</li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">Technical Blog &amp; Postmortems</li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">Discord Architecture Guild</li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">GitHub Example Repositories</li>
                <li className="hover:text-[#c0c1ff] transition-colors cursor-pointer">API &amp; CLI Tooling Documentation</li>
              </ul>
            </div>
          </div>

          <div className="pt-space-xl border-t border-[#262a33]/70 flex flex-col sm:flex-row items-center justify-between gap-space-lg">
            <div className="flex items-center gap-space-md font-body-sm text-body-sm text-[#908fa0]">
              <p>© 2025 LLD Lotion Labs Inc. Designed for Engineering Architects.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-space-lg gap-y-space-sm font-body-sm text-body-sm text-[#aeadc0]">
              <span className="hover:text-[#dfe2ee] transition-colors cursor-pointer">System Status: 99.99%</span>
              <span className="hover:text-[#dfe2ee] transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-[#dfe2ee] transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-[#dfe2ee] transition-colors cursor-pointer">Security Bug Bounty</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
