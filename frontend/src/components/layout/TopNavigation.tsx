import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1XODk_DVmbs-IflKdUVo5At9C_j4xKUxirinYm_7wIplqGnsrN-nZIJkle8rn901271owCu0UITlHclJetSq8PvQZ_XaYcp6xw0D-HdGHsXZ-3KSU2EbzfTGwm5BQPAPhPDXU8kbfpxKN97u-bj0kcJ4E97dWhLcVBzunc1Mcya-9RXf2zpY69JAPTXWHbeAbIS6ZvAHfcyRVCzP59rzCrm3CBtdIKCMKYQZfmvFJq3Z7oyOZrjmM0r';

export const AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD_XYErBzq-6SqYSbftSHr7i32NHmbjVR_VIxaSN1-ZFZbaPuxVBe-a-m7WFdpxdohfnK5nidrfi2p5DiQyG1k4wAgfuOqGacZyN2bTdPyDOHV3hKbFvv0WPR7F-RISrHMWMi2Tc6vkWkTMCbff5RuZ9_T0LSXJlhvYrnDGPPQCaOupmwiPzFOxOhG-IgUR5wSLasYdjcXi-OK57-ViS7o14K9aBAHLIKjH4eHadw4SS_U4ykzbpFA';

export const TopNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Problem Library', path: '/problems' },
    { name: 'Workspace', path: '/workspace' },
    { name: 'Evaluation Studio', path: '/evaluation' },
    { name: 'Attempt History', path: '/attempts' }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0a0e16]/90 backdrop-blur-xl border-b border-[#464554]/40">
      <div className="h-16 w-full px-layout-margin-desktop flex items-center justify-between gap-space-lg">
        {/* Left Brand + Desktop Nav */}
        <div className="flex items-center gap-space-xl">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-space-sm group">
            <img
              alt="LLD Mentor Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src={LOGO_URL}
            />
            <span className="font-headline-sm text-headline-sm text-[#dfe2ee] tracking-tight font-semibold">
              LLD <span className="text-[#c0c1ff]">Mentor</span>
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-space-xs p-space-2xs bg-[#181c24]/70 rounded-lg border border-[#464554]/30">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-space-md py-space-xs rounded font-label-ui text-label-ui transition-colors ${
                    isActive
                      ? 'bg-[#262a33] text-[#c0c1ff] font-medium border border-[#464554]/60 shadow-sm'
                      : 'text-[#c7c4d7] hover:text-[#dfe2ee] hover:bg-[#262a33]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Status + Profile */}
        <div className="flex items-center gap-space-md">
          <div className="h-6 w-px bg-[#464554]/40 hidden sm:block"></div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-space-sm pl-space-xs text-left focus:outline-none"
              type="button"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-[#464554]/60"
                src={user?.avatarUrl || AVATAR_URL}
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-ui text-label-ui text-[#dfe2ee] font-medium leading-none">
                  {user?.name || 'Alex Rivera'}
                </span>
              </div>
              <span className="material-symbols-outlined text-sm text-[#908fa0] hidden sm:inline">
                expand_more
              </span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#1c2028] border border-[#464554] shadow-xl py-1 z-50 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                    navigate('/login', { replace: true });
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#ffb4ab] hover:bg-[#262a33] text-left"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Log out
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-[#c7c4d7] hover:bg-[#262a33] hover:text-white"
            type="button"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0f131c] border-b border-[#464554] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-[#262a33] text-[#c0c1ff]'
                    : 'text-[#c7c4d7] hover:bg-[#1c2028] hover:text-[#dfe2ee]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
