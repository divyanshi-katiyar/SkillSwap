/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, User, Sparkles, BookOpen, ChevronRight, AlertCircle } from "lucide-react";
import GlassCard from "./GlassCard";

interface AuthModalProps {
  onAuthSuccess: (token: string, user: any) => void;
  onClose?: () => void;
  inline?: boolean;
}

export default function AuthModal({ onAuthSuccess, onClose, inline = false }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [startingTeach, setStartingTeach] = useState("");
  const [startingLearn, setStartingLearn] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = activeTab === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = activeTab === "login" 
      ? { email, password }
      : {
          name,
          email,
          password,
          bio,
          skillsOffered: startingTeach ? [{ name: startingTeach, level: "Intermediate" }] : [],
          skillsWanted: startingLearn ? [{ name: startingLearn, level: "Beginner" }] : []
        };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        onAuthSuccess(data.token, data.user);
      } else {
        setError(data.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err) {
      setError("Failed to reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      {error && (
        <div id="auth-error-alert" className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-xs font-semibold flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {activeTab === "register" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                id="auth-register-name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Campus Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              id="auth-email-input"
              type="email"
              placeholder="jane@skillswap.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              id="auth-password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
              required
            />
          </div>
        </div>

        {activeTab === "register" && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Profile Bio</label>
              <textarea
                id="auth-register-bio"
                placeholder="CS Major. I build frontends and want to learn Figma..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Start Teach Skill
                </label>
                <input
                  id="auth-register-teach"
                  type="text"
                  placeholder="e.g. React"
                  value={startingTeach}
                  onChange={(e) => setStartingTeach(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-0.5">
                  <BookOpen className="w-3 h-3 text-cyan-500" /> Start Learn Target
                </label>
                <input
                  id="auth-register-learn"
                  type="text"
                  placeholder="e.g. Figma"
                  value={startingLearn}
                  onChange={(e) => setStartingLearn(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </>
        )}

        <div className="pt-3">
          <button
            id="auth-submit-button"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow hover:shadow-md"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : activeTab === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to SkillSwap</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Campus Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  if (inline) {
    return (
      <div className="space-y-4">
        {/* Tab selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            id="auth-tab-login"
            onClick={() => {
              setActiveTab("login");
              setError("");
            }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
              activeTab === "login"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Login Session
          </button>
          <button
            id="auth-tab-register"
            onClick={() => {
              setActiveTab("register");
              setError("");
            }}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
              activeTab === "register"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Register Student
          </button>
        </div>

        {formContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Campus Student Portal</h3>
            <p className="text-[10px] text-slate-400">Unlock scheduling, swap dashboards, and AI coaching.</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Close
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex border-b border-slate-100 dark:border-slate-800 pb-1">
            <button
              id="modal-tab-login"
              onClick={() => {
                setActiveTab("login");
                setError("");
              }}
              className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 transition ${
                activeTab === "login"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              id="modal-tab-register"
              onClick={() => {
                setActiveTab("register");
                setError("");
              }}
              className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 transition ${
                activeTab === "register"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          {formContent}
        </div>
      </div>
    </div>
  );
}
