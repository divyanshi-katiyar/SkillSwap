/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Award, Calendar, Check, Clock, Star, Users, X, ArrowUpRight, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { User, Session, SessionStatus, Notification } from "../types";
import { StatsSkeleton } from "../components/Skeletons";

interface DashboardProps {
  currentUser: User | null;
  token: string | null;
  onProfileUpdate: () => void;
}

export default function Dashboard({ currentUser, token, onProfileUpdate }: DashboardProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  // Review states
  const [reviewingSessionId, setReviewingSessionId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, notifsRes] = await Promise.all([
        fetch("/api/dashboard/sessions", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (sessionsRes.ok) {
        const sessionData = await sessionsRes.json();
        setSessions(sessionData);
      }
      if (notifsRes.ok) {
        const notifData = await notifsRes.json();
        setNotifications(notifData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = async (sessionId: string, action: string, rating?: number, text?: string) => {
    setSubmittingAction(sessionId + "-" + action);
    try {
      const res = await fetch("/api/dashboard/sessions/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId, action, reviewRating: rating, reviewText: text })
      });

      if (res.ok) {
        // Refresh local dashboard and user stats
        await fetchDashboardData();
        onProfileUpdate();
        if (action === "review") {
          setReviewingSessionId(null);
          setReviewText("");
          setReviewRating(5);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getProfileCompletion = () => {
    if (!currentUser) return 0;
    let score = 20; // registration
    if (currentUser.bio && currentUser.bio !== "Passionate student looking to learn and grow peer-to-peer on SkillSwap.") score += 20;
    if (currentUser.skillsOffered.length > 0) score += 20;
    if (currentUser.skillsWanted.length > 0) score += 20;
    if (currentUser.availability && currentUser.availability !== "Flexible weekdays") score += 20;
    return score;
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Please authenticate to see your learning dashboard.</p>
      </div>
    );
  }

  const pendingSessions = sessions.filter(s => s.status === SessionStatus.PENDING);
  const activeSessions = sessions.filter(s => s.status === SessionStatus.ACCEPTED);
  const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED);

  return (
    <div className="space-y-6">
      {/* Welcome Header Banner */}
      <div className="relative p-6 md:p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl overflow-hidden shadow-lg border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-44 h-44 bg-cyan-500/20 rounded-full blur-2xl" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full border-2 border-white/50 bg-white shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">Welcome back, {currentUser.name}!</h2>
              <p className="text-sm text-indigo-100 mt-0.5 max-w-md">
                Grow your knowledge, teach your classmates, and review session guidelines.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center min-w-[140px]">
            <p className="text-[10px] text-indigo-200 uppercase font-semibold tracking-wider">Campus Rank</p>
            <p className="text-2xl font-bold text-white mt-0.5">#{currentUser.stats.globalRank}</p>
          </div>
        </div>
      </div>

      {/* Stats Bento Box Grid */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Taught</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                {currentUser.stats.hoursTaught.toFixed(1)} hrs
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Learned</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                {currentUser.stats.hoursLearned.toFixed(1)} hrs
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Swaps Completed</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                {currentUser.stats.sessionsCompleted} sessions
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-500 rounded-2xl">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Average Rating</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                {currentUser.rating.toFixed(1)} / 5.0
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Main Grid Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Sessions List */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" /> Active Swap Sessions
                </h3>
                <p className="text-xs text-slate-400">Track pending requests, accepted swaps, and reviews.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                {sessions.length} sessions
              </span>
            </div>

            {loading ? (
              <div className="space-y-4 py-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No session bookings found</p>
                <p className="text-xs text-slate-400">Head over to the Peer Marketplace to search for swap partners.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {sessions.map((session) => {
                  const isTeacher = session.teacherId === currentUser.id;
                  const partnerName = isTeacher ? session.studentName : session.teacherName;
                  const roleLabel = isTeacher ? "Teaching" : "Learning";

                  return (
                    <div
                      key={session.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isTeacher 
                              ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                              : "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300"
                          }`}>
                            {roleLabel}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {session.skillName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Partner: <strong className="text-slate-700 dark:text-slate-300">{partnerName}</strong>
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-1">
                          <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {session.date}</span>
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {session.timeSlot}</span>
                        </div>
                      </div>

                      {/* Action buttons based on status */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {session.status === SessionStatus.PENDING && (
                          <>
                            {isTeacher ? (
                              <>
                                <button
                                  id={`action-accept-${session.id}`}
                                  disabled={submittingAction !== null}
                                  onClick={() => handleSessionAction(session.id, "accept")}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] rounded-lg transition"
                                >
                                  Accept
                                </button>
                                <button
                                  id={`action-decline-${session.id}`}
                                  disabled={submittingAction !== null}
                                  onClick={() => handleSessionAction(session.id, "cancel")}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium text-[11px] rounded-lg transition"
                                >
                                  Decline
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-200/50 px-2 py-1 rounded-md font-medium">
                                Awaiting Approval
                              </span>
                            )}
                          </>
                        )}

                        {session.status === SessionStatus.ACCEPTED && (
                          <>
                            <button
                              id={`action-complete-${session.id}`}
                              disabled={submittingAction !== null}
                              onClick={() => handleSessionAction(session.id, "complete")}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] rounded-lg transition"
                            >
                              Mark Completed
                            </button>
                            <button
                              id={`action-cancel-${session.id}`}
                              disabled={submittingAction !== null}
                              onClick={() => handleSessionAction(session.id, "cancel")}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 font-medium text-[11px] rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {session.status === SessionStatus.COMPLETED && (
                          <>
                            {!isTeacher && !session.review && (
                              <button
                                id={`action-review-trigger-${session.id}`}
                                onClick={() => {
                                  setReviewingSessionId(session.id);
                                  setReviewText("");
                                }}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium text-[11px] border border-indigo-200/50 rounded-lg transition"
                              >
                                Leave Review
                              </button>
                            )}

                            {session.review ? (
                              <div className="flex items-center space-x-1 text-amber-500 text-[11px] font-medium">
                                <Star className="w-3.5 h-3.5 fill-amber-500" />
                                <span>{session.review.rating} / 5</span>
                              </div>
                            ) : isTeacher ? (
                              <span className="text-[10px] text-slate-400 italic">Completed</span>
                            ) : null}
                          </>
                        )}

                        {session.status === SessionStatus.CANCELLED && (
                          <span className="text-[10px] bg-rose-50 dark:bg-rose-950/20 text-rose-500 px-2 py-0.5 rounded font-medium">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Review Modal Form */}
          {reviewingSessionId && (
            <GlassCard className="border border-indigo-500/20 p-5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Leave Peer Swap Review
                </h4>
                <button onClick={() => setReviewingSessionId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rate Teacher:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        id={`review-star-btn-${stars}`}
                        type="button"
                        onClick={() => setReviewRating(stars)}
                        className="transition duration-150 transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            stars <= reviewRating ? "text-amber-500 fill-amber-500" : "text-slate-300 dark:text-slate-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Write helpful review details</label>
                  <textarea
                    id="review-textarea"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us what you learned, what went well, or what could be improved..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setReviewingSessionId(null)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-850 text-slate-500 hover:text-slate-600 text-xs rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-review-btn"
                    onClick={() => handleSessionAction(reviewingSessionId, "review", reviewRating, reviewText)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg font-medium transition"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Showcase Badges & Achievements */}
          <GlassCard className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" /> Earned Peer Achievements
            </h3>
            {currentUser.badges.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No badges unlocked yet. Teach sessions and help out peers to gain your first badge!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {currentUser.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 bg-gradient-to-br from-indigo-50/50 to-cyan-50/30 dark:from-indigo-950/20 dark:to-cyan-950/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl flex items-center space-x-3 text-left"
                  >
                    <div className="p-2 bg-white dark:bg-slate-900 text-indigo-500 rounded-lg shadow-sm shrink-0 border border-slate-100 dark:border-slate-800">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{badge.title}</h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight line-clamp-2">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right column: Notifications, Profile Progress */}
        <div className="space-y-6">
          {/* Notifications Panel */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertCircle className="w-4.5 h-4.5 text-indigo-500" /> Real-Time Notifications
              </h3>
              {notifications.length > 0 && (
                <button
                  id="clear-notifications-btn"
                  onClick={handleClearNotifications}
                  className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 italic">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-start space-x-2.5 text-left"
                  >
                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 rounded-lg shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Profile Completion Card */}
          <GlassCard className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Completion</h3>
              <p className="text-[11px] text-slate-400">Complete your profile setup to rank higher on results!</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Progress</span>
                <span className="text-indigo-600 dark:text-indigo-400">{getProfileCompletion()}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${getProfileCompletion()}%` }}
                />
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${currentUser.bio && currentUser.bio !== "Passionate student looking to learn and grow peer-to-peer on SkillSwap." ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span>Add customized detailed bio (20%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${currentUser.skillsOffered.length > 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span>Specify offered swap skills (20%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${currentUser.skillsWanted.length > 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span>Specify wanted skills to learn (20%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${currentUser.availability && currentUser.availability !== "Flexible weekdays" ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span>Configure custom time availability (20%)</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
