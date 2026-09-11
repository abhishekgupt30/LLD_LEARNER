import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/layout/TopNavigation';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('abhishek2005@gmail.com');
  const [name, setName] = useState('Abhishek Gupta');
  const [password, setPassword] = useState('Random123@@');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, name, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please start the backend and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#8083ff]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-space-xl z-10">
        <div className="text-center space-y-space-xs">
          <Link to="/" className="inline-flex items-center gap-space-sm group">
            <BrandLogo className="h-12 w-12 transition-transform group-hover:scale-105" />
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-[#dfe2ee]">
              LLD<span className="text-[#8083ff]">Lotion</span>
            </span>
          </Link>
          <h2 className="font-headline-lg text-headline-lg font-bold text-[#dfe2ee]">
            Sign in to your Workbench
          </h2>
          <p className="text-xs font-label-code text-[#908fa0] uppercase tracking-wider">
            STAFF / PRINCIPAL LLD EVALUATION ENGINE
          </p>
        </div>

        <div className="bg-[#181c24] border border-[#464554]/60 rounded-2xl p-space-xl shadow-2xl space-y-space-lg">
          <form onSubmit={handleSubmit} className="space-y-space-md">
            <div className="space-y-1">
              <label className="text-xs font-label-ui text-[#c7c4d7]">Engineer Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-space-md py-2 bg-[#0a0e16] border border-[#262a33] rounded-lg text-sm text-[#dfe2ee] outline-none focus:border-[#8083ff] focus:ring-1 focus:ring-[#8083ff]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-label-ui text-[#c7c4d7]">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-space-md py-2 bg-[#0a0e16] border border-[#262a33] rounded-lg text-sm text-[#dfe2ee] outline-none focus:border-[#8083ff]" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-label-ui text-[#c7c4d7]">Work / Candidate Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-space-md py-2 bg-[#0a0e16] border border-[#262a33] rounded-lg text-sm text-[#dfe2ee] outline-none focus:border-[#8083ff] focus:ring-1 focus:ring-[#8083ff]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-[#8083ff] hover:bg-[#c0c1ff] hover:text-[#1000a9] text-[#dfe2ee] font-label-ui text-sm font-semibold transition-all shadow-md active:scale-95 mt-space-sm"
            >
              {isSubmitting ? 'Signing in...' : 'Enter Evaluation Platform'}
            </button>
            {error && <p className="text-xs text-[#ffb4ab] text-center mt-space-sm">{error}</p>}
          </form>

          <div className="pt-space-sm border-t border-[#262a33] text-center">
            <p className="text-xs text-[#908fa0]">
              Development environment active. Use the prefilled test engineer credentials to sign in.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-xs text-[#c0c1ff] hover:underline">
            ← Back to Overview &amp; Specifications
          </Link>
        </div>
      </div>
    </div>
  );
};
