/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BookOpen, Trophy, Sparkles, Award, User, LogOut, LogIn, LayoutDashboard, Sun, Moon, ArrowRight, CheckCircle2, ShieldAlert, Zap, Globe, MessageSquare, Star, Users } from "lucide-react";
import GlassCard from "./components/GlassCard";
import AuthModal from "./components/AuthModal";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import AICoach from "./pages/AICoach";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import { User as UserType } from "./types";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authActionType, setAuthActionType] = useState<"login" | "register">("login");

  // Load auth state from local storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("skillswap_token");
    const savedUser = localStorage.getItem("skillswap_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setCurrentUser(JSON.parse(savedUser));
        setActiveTab("dashboard");
      } catch (err) {
        localStorage.clear();
      }
    }
  }, []);

  // Update profile from backend to maintain absolute state synchronization
  const fetchFreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const freshUser = await res.json();
        setCurrentUser(freshUser);
        localStorage.setItem("skillswap_user", JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error("Failed to sync fresh profile stats:", err);
    }
  };

  const handleAuthSuccess = (newToken: string, newUser: UserType) => {
    setToken(newToken);
    setCurrentUser(newUser);
    localStorage.setItem("skillswap_token", newToken);
    localStorage.setItem("skillswap_user", JSON.stringify(newUser));
    setShowAuthModal(false);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("skillswap_token");
    localStorage.removeItem("skillswap_user");
    setActiveTab("landing");
  };

  // Toggle Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode ? "bg-[#0B0F19] text-slate-100 dark" : "bg-[#F8FAFC] text-slate-800"
    }`}>
      {/* Header Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/75 dark:bg-[#0B0F19]/75 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 px-4 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => setActiveTab(currentUser ? "dashboard" : "landing")}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
                SkillSwap
              </span>
              <span className="text-[10px] block font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">
                Peer Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation list */}
          {currentUser && (
            <nav className="hidden md:flex items-center space-x-1.5">
              <button
                id="nav-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === "dashboard"
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-marketplace"
                onClick={() => setActiveTab("marketplace")}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === "marketplace"
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Peer Marketplace</span>
              </button>

              <button
                id="nav-coach"
                onClick={() => setActiveTab("coach")}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === "coach"
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Study Coach</span>
              </button>

              <button
                id="nav-leaderboard"
                onClick={() => setActiveTab("leaderboard")}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === "leaderboard"
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </button>

              <button
                id="nav-profile"
                onClick={() => setActiveTab("profile")}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === "profile"
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>
          )}

          {/* Action Center (Light/Dark, Login/Logout) */}
          <div className="flex items-center space-x-2">
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:text-indigo-500 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-indigo-500/30"
                  referrerPolicy="no-referrer"
                />
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="hidden md:flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => {
                  setAuthActionType("login");
                  setShowAuthModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <LogIn className="w-4 h-4" />
                <span>Student Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* LANDING PAGE FOR GUESTS */}
        {activeTab === "landing" && !currentUser && (
          <div className="space-y-20 py-4 md:py-8">
            {/* Hero Grid Block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold rounded-full border border-indigo-100 dark:border-indigo-900/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Interactive Peer Study Ecosystem</span>
                </span>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  Teach React.<br />
                  Learn System Design.<br />
                  <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                    Swap Your Skills.
                  </span>
                </h1>

                <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Join the campus marketplace built for student peer coaching. Connect with classmates who can teach Java, UI/UX Figma design, data structures, or languages in a 1:1 barter-swap. Earn achievements, gain badges, and consult your server-side AI Coach!
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                    id="hero-cta-register"
                    onClick={() => {
                      setAuthActionType("register");
                      setShowAuthModal(true);
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Start Swapping Skills</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    id="hero-cta-marketplace"
                    onClick={() => {
                      setAuthActionType("login");
                      setShowAuthModal(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl font-bold text-xs transition text-center"
                  >
                    Explore Peer Profiles
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 pt-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>100% Student Barter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>Gemini AI Tutor Support</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>Campus Merit Badges</span>
                  </div>
                </div>
              </div>

              {/* Graphical Hero Right side card */}
              <div className="lg:col-span-5 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                
                <GlassCard className="relative p-6 max-w-sm mx-auto space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-4.5 h-4.5 text-indigo-500" /> Dynamic Campus Swap Match
                    </h3>
                  </div>

                  {/* Seed card visual */}
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">J</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Jane Doe</p>
                          <p className="text-[10px] text-slate-400">CS Junior</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-bold">Teaches: React & Next.js</span>
                    </div>

                    <div className="flex items-center justify-center text-slate-400 dark:text-slate-600 py-1.5">
                      <div className="h-0.5 bg-slate-200 dark:bg-slate-800 w-12" />
                      <span className="px-2.5 text-[10px] uppercase font-bold tracking-widest text-indigo-500">SWAP MATCH</span>
                      <div className="h-0.5 bg-slate-200 dark:bg-slate-800 w-12" />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-rose-500 text-white flex items-center justify-center font-bold text-xs">S</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Sarah Chen</p>
                          <p className="text-[10px] text-slate-400">Product Design Major</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded text-[9px] font-bold">Teaches: Figma UI/UX</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-100/40 dark:bg-slate-900/20 p-3 rounded-xl">
                    ✨ Both students schedule online bartered swaps. No credit card or currency required!
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Statistics Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-100 dark:border-slate-800/80">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">500+</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Registered Students</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">1,200+</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Swap Hours Logged</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">5.0★</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Average Peer Rating</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">98%</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Success Match Score</p>
              </div>
            </div>

            {/* Features Grid Section */}
            <div className="space-y-12">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Built Like a Real Startup Product</h2>
                <p className="text-sm text-slate-500 max-w-lg mx-auto">Explore key system modules that optimize peer-to-peer student swaps.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6 space-y-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Active Discovery Arena</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Search, filter, and discover student profile pages based on categories, ratings, experience levels, and current timeslot availability.
                  </p>
                </GlassCard>

                <GlassCard className="p-6 space-y-4">
                  <div className="p-3 bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 rounded-xl w-fit">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">AI Learning Coach</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Get custom study plan courses, interactive checks, and quizzes generated instantly from server-side Gemini 3.5-flash models.
                  </p>
                </GlassCard>

                <GlassCard className="p-6 space-y-4">
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 rounded-xl w-fit">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Campus Gamification</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Unlock official badges (Top Mentor, Rising Star, Fast Learner) based on completed swaps, and scale rank on campus-wide leaderboards.
                  </p>
                </GlassCard>
              </div>
            </div>

            {/* Bottom Call to Action block */}
            <div className="p-8 md:p-12 bg-gradient-to-br from-[#1E1B4B] to-slate-950 rounded-3xl text-center space-y-6 relative overflow-hidden border border-slate-800 shadow">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
              <div className="max-w-2xl mx-auto space-y-4">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">Ready to learn, teach, and level up?</h3>
                <p className="text-sm text-slate-400">
                  Build your campus merit profile, unlock real-time peer matching, and swap skills without spending any capital.
                </p>
                <div className="pt-4 flex items-center justify-center">
                  <button
                    id="landing-cta-final"
                    onClick={() => {
                      setAuthActionType("register");
                      setShowAuthModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow flex items-center gap-1.5"
                  >
                    <span>Create Your Student Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE PAGES RENDER FOR LOGGED IN USERS */}
        {currentUser && (
          <div className="space-y-6">
            {activeTab === "dashboard" && (
              <Dashboard 
                currentUser={currentUser} 
                token={token} 
                onProfileUpdate={fetchFreshProfile} 
              />
            )}
            {activeTab === "marketplace" && (
              <Marketplace 
                currentUser={currentUser} 
                token={token} 
                onBookingSuccess={fetchFreshProfile} 
              />
            )}
            {activeTab === "coach" && (
              <AICoach 
                currentUser={currentUser} 
                token={token} 
              />
            )}
            {activeTab === "leaderboard" && (
              <Leaderboard />
            )}
            {activeTab === "profile" && (
              <Profile 
                currentUser={currentUser} 
                token={token} 
                onProfileUpdate={fetchFreshProfile} 
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation for Mobile views */}
      {currentUser && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 md:hidden flex items-center justify-around py-2.5 px-4 shadow-[0_-4px_24px_0_rgba(0,0,0,0.05)]">
          <button
            id="mobile-nav-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === "dashboard" ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            id="mobile-nav-marketplace"
            onClick={() => setActiveTab("marketplace")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === "marketplace" ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Marketplace</span>
          </button>

          <button
            id="mobile-nav-coach"
            onClick={() => setActiveTab("coach")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === "coach" ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>AI Coach</span>
          </button>

          <button
            id="mobile-nav-leaderboard"
            onClick={() => setActiveTab("leaderboard")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === "leaderboard" ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>Leaderboard</span>
          </button>

          <button
            id="mobile-nav-profile"
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              activeTab === "profile" ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            <User className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      )}

      {/* Centered Auth Modal Panel (Pop-up/Dialog) */}
      {showAuthModal && (
        <AuthModal
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
