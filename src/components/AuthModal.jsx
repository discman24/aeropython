import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';

const AUTH_STORAGE_KEY = 'aeropython-user';

/**
 * Simple local auth for V1.
 * Stores email + hashed password in localStorage.
 * V2: Replace with Supabase auth.
 */

// Simple hash for local-only password storage (NOT secure for production)
async function simpleHash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getStoredUser() {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return null;
}

export function clearStoredUser() {
  try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
}

export default function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.includes('@') || !email.includes('.')) {
      setError('Enter a valid email address');
      setLoading(false);
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      setLoading(false);
      return;
    }

    try {
      const hashedPw = await simpleHash(password);
      const usersKey = 'aeropython-users';
      const users = JSON.parse(localStorage.getItem(usersKey) || '{}');

      if (mode === 'signup') {
        if (users[email]) {
          setError('Account already exists. Try signing in.');
          setLoading(false);
          return;
        }
        users[email] = { passwordHash: hashedPw, createdAt: new Date().toISOString() };
        localStorage.setItem(usersKey, JSON.stringify(users));
      } else {
        const existing = users[email];
        if (!existing || existing.passwordHash !== hashedPw) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }
      }

      const user = { email, loggedInAt: new Date().toISOString() };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="caveman@python.quest"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-wider"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <><LogIn className="w-4 h-4" /> Sign In</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Create Account</>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-5">
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* V2 notice */}
        <p className="text-[8px] font-bold text-slate-700 text-center mt-4 uppercase tracking-wider">
          V1: Progress saves locally in your browser
        </p>
      </div>
    </div>
  );
}
