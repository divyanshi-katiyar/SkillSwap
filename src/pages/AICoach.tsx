/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, BookOpen, GraduationCap, Calendar, HelpCircle, Check, AlertCircle, RefreshCw, X } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { AIRecommendation, User } from "../types";
import { CoachSkeleton } from "../components/Skeletons";

interface AICoachProps {
  currentUser: User | null;
  token: string | null;
}

export default function AICoach({ currentUser, token }: AICoachProps) {
  const [skillName, setSkillName] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [blueprint, setBlueprint] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Quiz interactive tracking
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState<{ [key: number]: boolean }>({});

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    setLoading(true);
    setError("");
    setBlueprint(null);
    setSelectedAnswers({});
    setSubmittedQuizzes({});

    try {
      const res = await fetch("/api/coach/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          skillName: skillName.trim(),
          targetSkillLevel: level
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBlueprint(data);
      } else {
        setError("Unable to connect with AI Coach. Please check your credentials.");
      }
    } catch (err) {
      setError("Network or server failure. Please retry shortly.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (submittedQuizzes[qIdx]) return; // locked once checked
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCheckQuiz = (qIdx: number) => {
    if (selectedAnswers[qIdx] === undefined) return;
    setSubmittedQuizzes((prev) => ({ ...prev, [qIdx]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Banner introduction */}
      <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-4 border border-violet-500/20 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" /> AI Skill Coach Blueprint
          </h2>
          <p className="text-xs text-violet-100 max-w-lg">
            Consult our server-side Gemini intelligence to map out personalized study structures, day-by-day actions, and take test quizzes before teaching classmates.
          </p>
        </div>
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-violet-200" />
          <span className="text-xs font-bold">Classroom Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Goal Form */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Configure Your Goal</h3>
            <p className="text-xs text-slate-400">Describe what you want to learn, and the AI Coach will construct your learning path.</p>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Skill Name</label>
                <input
                  id="coach-skill-input"
                  type="text"
                  placeholder="e.g. Docker Containers, Kubernetes, Node Streams"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Skill Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <button
                      key={lvl}
                      id={`coach-level-btn-${lvl}`}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`py-2 text-xs font-medium rounded-xl border transition ${
                        level === lvl
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="generate-coach-blueprint"
                type="submit"
                disabled={loading || !skillName.trim()}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium text-xs px-4 py-3 rounded-xl transition shadow disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Brainstorming Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate AI Blueprint</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start space-x-2 text-rose-800 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-2">
          {loading ? (
            <CoachSkeleton />
          ) : blueprint ? (
            <div className="space-y-6">
              {/* Part 1: Path Overview */}
              <GlassCard className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> Learning Path Subskills
                </h3>
                <div className="space-y-3">
                  {blueprint.skillsToLearn.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl"
                    >
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {idx + 1}. {item.skillName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Part 2: Weekly Day-by-day Tasks */}
              <GlassCard className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-500" /> Weekly Day-by-Day Study Schedule
                </h3>
                <div className="space-y-3">
                  {blueprint.studyPlan.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3.5 p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 rounded-xl"
                    >
                      <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 rounded-lg text-[10px] font-bold shrink-0">
                        {step.day.split(":")[0]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {step.task}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Recommended study: {step.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Part 3: Interactive Quiz */}
              {blueprint.quizzes && blueprint.quizzes.length > 0 && (
                <GlassCard className="space-y-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-500" /> AI Practice Quiz
                  </h3>

                  <div className="space-y-6">
                    {blueprint.quizzes.map((q, qIdx) => {
                      const isSubmitted = submittedQuizzes[qIdx];
                      const selectedOpt = selectedAnswers[qIdx];
                      const isCorrect = selectedOpt === q.correctIndex;

                      return (
                        <div
                          key={qIdx}
                          className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl space-y-3"
                        >
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Q{qIdx + 1}: {q.question}
                          </p>

                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = selectedOpt === oIdx;
                              let btnClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";

                              if (isSelected) {
                                btnClass = "bg-indigo-50 border-indigo-400 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800";
                              }

                              if (isSubmitted) {
                                if (oIdx === q.correctIndex) {
                                  btnClass = "bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800";
                                } else if (isSelected) {
                                  btnClass = "bg-rose-50 border-rose-400 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800";
                                } else {
                                  btnClass = "opacity-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  id={`quiz-q${qIdx}-o${oIdx}`}
                                  type="button"
                                  onClick={() => handleSelectOption(qIdx, oIdx)}
                                  className={`w-full text-left px-3 py-2.5 text-xs rounded-xl border font-medium transition ${btnClass}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {!isSubmitted ? (
                            <div className="flex justify-end pt-1">
                              <button
                                id={`quiz-submit-q${qIdx}`}
                                onClick={() => handleCheckQuiz(qIdx)}
                                disabled={selectedOpt === undefined}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition disabled:opacity-50"
                              >
                                Check Answer
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                                isCorrect
                                  ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 text-emerald-800 dark:text-emerald-400"
                                  : "bg-rose-50/50 dark:bg-rose-950/10 border-rose-200/50 text-rose-800 dark:text-rose-400"
                              }`}
                            >
                              <p className="font-bold flex items-center gap-1.5 mb-1">
                                {isCorrect ? (
                                  <>
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>Correct Option!</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 text-rose-600" />
                                    <span>Incorrect Option.</span>
                                  </>
                                )}
                              </p>
                              <p>{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              )}
            </div>
          ) : (
            <GlassCard className="text-center py-16 space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-3xl flex items-center justify-center text-white shadow">
                <Sparkles className="w-8 h-8 text-amber-200" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">AI Coach Vault is Idle</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Type a target topic in the goal settings block on the left (e.g. "C++ OOP", "React Hooks", "Figma AutoLayout") to get a tailored path blueprint!
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
