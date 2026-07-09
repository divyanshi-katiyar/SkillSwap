/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Award, Star, Trophy, ArrowUpRight, ShieldCheck, Flame, BookOpen } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { User } from "../types";

export default function Leaderboard() {
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setBoard(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTrophyColor = (idx: number) => {
    if (idx === 0) return "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50";
    if (idx === 1) return "text-slate-400 bg-slate-50 dark:bg-slate-850 border border-slate-200/50";
    if (idx === 2) return "text-amber-700 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-800/30";
    return "text-slate-500 bg-slate-100 dark:bg-slate-900";
  };

  return (
    <div className="space-y-6">
      {/* Header introduction banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-700 to-cyan-600 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow border border-indigo-600/20">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300 animate-bounce" /> SkillSwap Campus Leaderboard
          </h2>
          <p className="text-xs text-indigo-100 max-w-md">
            Celebrating our top-performing peer mentors and active learners. Share knowledge and rise in ranks!
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 font-bold">
          <ShieldCheck className="w-4.5 h-4.5 text-cyan-200" />
          <span>Campus Verified Stats</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Spotlight Podium (Only if board has enough items) */}
          <div className="lg:col-span-1 space-y-4">
            <GlassCard className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" /> Spotlight Mentors
              </h3>
              <p className="text-xs text-slate-400">Podium finishes are updated daily based on session reviews and teach counts.</p>

              <div className="space-y-3 pt-2">
                {board.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center space-x-3 text-left"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${getTrophyColor(idx)}`}>
                      <Trophy className="w-4.5 h-4.5" />
                    </div>
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full border border-slate-200 bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</h4>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {item.sessionsCompleted} swaps completed
                      </p>
                    </div>
                    <div className="flex items-center text-amber-500 font-bold text-xs gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Full ranking table list */}
          <div className="lg:col-span-2">
            <GlassCard className="p-0 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Active Campus Leaderboard</h3>
                  <p className="text-xs text-slate-400">Comprehensive list of student contributors.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-5 w-16">Rank</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Primary Skills</th>
                      <th className="py-3 px-4 text-center">Swaps</th>
                      <th className="py-3 px-4 text-center">Rating</th>
                      <th className="py-3 px-4 text-center">Taught Hrs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {board.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                      >
                        <td className="py-3.5 px-5 font-bold text-slate-600 dark:text-slate-300">
                          {idx < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[11px] ${
                              idx === 0 ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                              idx === 1 ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" :
                              "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400"
                            }`}>
                              {idx + 1}
                            </span>
                          ) : (
                            <span className="pl-2">#{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-8 h-8 rounded-full border border-slate-100 bg-white"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">Rank #{item.stats.globalRank}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                          <div className="flex flex-wrap gap-1">
                            {item.skillsOffered.map((sk: any) => (
                              <span
                                key={sk.name}
                                className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded text-[9px] font-medium"
                              >
                                {sk.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                          {item.sessionsCompleted}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-0.5 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{item.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-300">
                          {item.stats.hoursTaught.toFixed(1)} hrs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
