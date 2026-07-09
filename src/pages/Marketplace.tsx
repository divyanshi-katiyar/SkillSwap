/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Calendar, Clock, Star, Award, BookOpen, ChevronRight, Check } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { User, SkillLevel } from "../types";
import { CardSkeleton } from "../components/Skeletons";

interface MarketplaceProps {
  currentUser: User | null;
  onBookingSuccess: () => void;
  token: string | null;
}

export default function Marketplace({ currentUser, onBookingSuccess, token }: MarketplaceProps) {
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("rank");
  const [bookingMentor, setBookingMentor] = useState<User | null>(null);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("4:00 PM - 5:00 PM");
  const [bookingStatus, setBookingStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, [search, levelFilter, sortOrder]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (levelFilter) query.append("level", levelFilter);
      if (sortOrder) query.append("sort", sortOrder);

      const res = await fetch(`/api/marketplace/skills?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // Don't show current logged in user in the swap listings
        const filtered = currentUser 
          ? data.filter((u: User) => u.id !== currentUser.id)
          : data;
        setMentors(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor || !selectedSkill || !bookingDate || !bookingTime) return;

    setSubmitting(true);
    setBookingStatus(null);

    try {
      const res = await fetch("/api/dashboard/sessions/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          teacherId: bookingMentor.id,
          skillName: selectedSkill,
          date: bookingDate,
          timeSlot: bookingTime
        })
      });

      const data = await res.json();

      if (res.ok) {
        setBookingStatus({
          type: "success",
          message: `Swap session for ${selectedSkill} successfully requested with ${bookingMentor.name}!`
        });
        setTimeout(() => {
          setBookingMentor(null);
          setSelectedSkill("");
          setBookingDate("");
          setBookingStatus(null);
          onBookingSuccess();
        }, 3000);
      } else {
        setBookingStatus({
          type: "error",
          message: data.error || "Failed to book session. Please try again."
        });
      }
    } catch (err) {
      setBookingStatus({
        type: "error",
        message: "Network error occurred."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDayLimits = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            id="marketplace-search-input"
            type="text"
            placeholder="Search skills (React, Java, UI/UX...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex w-full md:w-auto gap-3 items-center justify-end">
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter:</span>
          </div>

          <select
            id="marketplace-filter-level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
          >
            <option value="">All Levels</option>
            <option value={SkillLevel.BEGINNER}>Beginner</option>
            <option value={SkillLevel.INTERMEDIATE}>Intermediate</option>
            <option value={SkillLevel.ADVANCED}>Advanced</option>
          </select>

          <select
            id="marketplace-sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
          >
            <option value="rank">Best Rank</option>
            <option value="rating">Highest Rated</option>
            <option value="sessions">Most Swaps</option>
          </select>
        </div>
      </div>

      {/* Grid of Mentors */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <GlassCard className="text-center py-12 space-y-3">
          <div className="w-16 h-16 mx-auto bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">No Peer Mentors Found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
            Try adjusting your filters or typing a different search query.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((mentor) => (
            <GlassCard key={mentor.id} hoverEffect className="flex flex-col justify-between">
              <div>
                {/* Mentor info */}
                <div className="flex items-start space-x-4">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/20"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                        {mentor.name}
                      </h3>
                      <div className="flex items-center space-x-1 text-amber-500 text-sm font-medium shrink-0">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span>{mentor.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      Rank #{mentor.stats.globalRank} • {mentor.sessionsCompleted} sessions completed
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {mentor.bio}
                    </p>
                  </div>
                </div>

                {/* Offer and Wanted split */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-500" /> Can Teach:
                    </h4>
                    <div className="mt-1.5 space-y-1">
                      {mentor.skillsOffered.map((sk) => (
                        <div key={sk.name} className="flex flex-col">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{sk.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{sk.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-500" /> Wants to Learn:
                    </h4>
                    <div className="mt-1.5 space-y-1">
                      {mentor.skillsWanted.map((sk) => (
                        <div key={sk.name} className="flex flex-col">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{sk.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{sk.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Availability info */}
                <div className="mt-4 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span><strong className="text-slate-700 dark:text-slate-300">Availability:</strong> {mentor.availability}</span>
                </div>
              </div>

              {/* CTA Booking */}
              <div className="mt-5">
                {token ? (
                  <button
                    id={`book-btn-${mentor.id}`}
                    onClick={() => {
                      setBookingMentor(mentor);
                      setSelectedSkill(mentor.skillsOffered[0]?.name || "");
                    }}
                    className="w-full flex items-center justify-center gap-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition shadow-sm hover:shadow-md"
                  >
                    <span>Request Skill Swap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-1.5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    Log in to request a swap session
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule Swap Session</h3>
                <p className="text-[11px] text-slate-500">With {bookingMentor.name}</p>
              </div>
              <button
                id="close-booking-modal"
                onClick={() => setBookingMentor(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleBookSession} className="p-6 space-y-4">
              {bookingStatus && (
                <div
                  id="booking-status-alert"
                  className={`p-3.5 rounded-xl text-xs font-medium border ${
                    bookingStatus.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-200/50"
                      : "bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border-rose-200/50"
                  }`}
                >
                  <p>{bookingStatus.message}</p>
                </div>
              )}

              {/* Selection for Skill */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Choose Skill to Learn</label>
                <select
                  id="booking-skill-select"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  {bookingMentor.skillsOffered.map((sk) => (
                    <option key={sk.name} value={sk.name}>
                      {sk.name} ({sk.level})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Select Date
                </label>
                <input
                  id="booking-date-input"
                  type="date"
                  min={getDayLimits()}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              {/* Time Slot Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" /> Select Time Slot
                </label>
                <select
                  id="booking-timeslot-select"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="10:00 AM - 11:30 AM">Morning (10:00 AM - 11:30 AM)</option>
                  <option value="1:00 PM - 2:30 PM">Afternoon (1:00 PM - 2:30 PM)</option>
                  <option value="4:00 PM - 5:30 PM">Late Afternoon (4:00 PM - 5:30 PM)</option>
                  <option value="7:00 PM - 8:30 PM">Evening (7:00 PM - 8:30 PM)</option>
                </select>
              </div>

              <div className="pt-2 text-[10px] text-slate-400">
                * By requesting a swap, you agree to share your contact with this classmate to host an online session on Google Meet / Teams.
              </div>

              {/* Submit / Action */}
              <div className="pt-2">
                <button
                  id="submit-booking-request"
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium text-xs px-4 py-3 rounded-xl transition shadow"
                >
                  {submitting ? (
                    <span>Scheduling Request...</span>
                  ) : bookingStatus && bookingStatus.type === "success" ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Request Sent!</span>
                    </>
                  ) : (
                    <span>Submit Swap Proposal</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
