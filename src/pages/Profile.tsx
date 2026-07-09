/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, SkillItem, SkillLevel } from "../types";
import GlassCard from "../components/GlassCard";
import { Save, Plus, Trash2, Award, BookOpen, Clock, AlignLeft, ShieldCheck, Check } from "lucide-react";

interface ProfileProps {
  currentUser: User | null;
  token: string | null;
  onProfileUpdate: () => void;
}

export default function Profile({ currentUser, token, onProfileUpdate }: ProfileProps) {
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [availability, setAvailability] = useState(currentUser?.availability || "");
  const [linkedin, setLinkedin] = useState(currentUser?.socialLinks?.linkedin || "");
  const [github, setGithub] = useState(currentUser?.socialLinks?.github || "");

  // Skill Offerd/Wanted draft managers
  const [offeredSkills, setOfferedSkills] = useState<SkillItem[]>(currentUser?.skillsOffered || []);
  const [wantedSkills, setWantedSkills] = useState<SkillItem[]>(currentUser?.skillsWanted || []);

  // Inline add state
  const [newOfferedSkillName, setNewOfferedSkillName] = useState("");
  const [newOfferedSkillLevel, setNewOfferedSkillLevel] = useState<SkillLevel>(SkillLevel.BEGINNER);

  const [newWantedSkillName, setNewWantedSkillName] = useState("");
  const [newWantedSkillLevel, setNewWantedSkillLevel] = useState<SkillLevel>(SkillLevel.BEGINNER);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Please authenticate to see and edit your learner profile.</p>
      </div>
    );
  }

  const handleAddOfferedSkill = () => {
    if (!newOfferedSkillName.trim()) return;
    if (offeredSkills.some((s) => s.name.toLowerCase() === newOfferedSkillName.trim().toLowerCase())) {
      return;
    }
    setOfferedSkills([...offeredSkills, { name: newOfferedSkillName.trim(), level: newOfferedSkillLevel }]);
    setNewOfferedSkillName("");
  };

  const handleRemoveOfferedSkill = (name: string) => {
    setOfferedSkills(offeredSkills.filter((s) => s.name !== name));
  };

  const handleAddWantedSkill = () => {
    if (!newWantedSkillName.trim()) return;
    if (wantedSkills.some((s) => s.name.toLowerCase() === newWantedSkillName.trim().toLowerCase())) {
      return;
    }
    setWantedSkills([...wantedSkills, { name: newWantedSkillName.trim(), level: newWantedSkillLevel }]);
    setNewWantedSkillName("");
  };

  const handleRemoveWantedSkill = (name: string) => {
    setWantedSkills(wantedSkills.filter((s) => s.name !== name));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: bio.trim(),
          avatar: avatar.trim(),
          availability: availability.trim(),
          skillsOffered: offeredSkills,
          skillsWanted: wantedSkills,
          socialLinks: {
            linkedin: linkedin.trim(),
            github: github.trim()
          }
        })
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Profile settings saved successfully!" });
        onProfileUpdate();
      } else {
        const errData = await res.json();
        setStatus({ type: "error", message: errData.error || "Failed to update profile settings." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h2>
          <p className="text-xs text-slate-500">Configure your campus learning presence and swap listings.</p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Information */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" /> Basic Metadata
            </h3>

            {status && (
              <div
                id="profile-save-status"
                className={`p-3 rounded-xl text-xs font-semibold border ${
                  status.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-200/50"
                    : "bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border-rose-200/50"
                }`}
              >
                <p>{status.message}</p>
              </div>
            )}

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Avatar Image Link</label>
              <input
                id="profile-avatar-input"
                type="text"
                placeholder="https://example.com/photo.jpg"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
              />
              <div className="flex items-center space-x-3 mt-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <img
                  src={avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}
                  alt="Avatar Preview"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] text-slate-400">Previewing avatar from link</span>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-500" /> Availability Slots
              </label>
              <input
                id="profile-availability-input"
                type="text"
                placeholder="e.g. Mon, Wed, Fri (2:00 PM - 6:00 PM)"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Social Links */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">LinkedIn handle</label>
              <input
                id="profile-linkedin-input"
                type="text"
                placeholder="linkedin.com/in/username"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="pt-2">
              <button
                id="profile-save-submit"
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow"
              >
                {saving ? (
                  <span>Saving Profile...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Metadata</span>
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Columns: Bio, Skills offered & wanted */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Bio */}
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <AlignLeft className="w-4.5 h-4.5 text-indigo-500" /> Student Profile bio
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Empathy-driven student description</label>
              <textarea
                id="profile-bio-textarea"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your major, academic interests, your core technical experience, and what peer-to-peer swap goals you want to focus on..."
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 leading-relaxed"
              />
            </div>
          </GlassCard>

          {/* Skill Manager split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Can Teach (Offered) */}
            <GlassCard className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Award className="w-4.5 h-4.5 text-indigo-500" /> Skills You Can Teach
                </h3>

                {/* List skills */}
                <div className="space-y-2 mt-3 max-h-[160px] overflow-y-auto pr-1">
                  {offeredSkills.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No teaching skills listed yet.</p>
                  ) : (
                    offeredSkills.map((sk) => (
                      <div
                        key={sk.name}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{sk.name}</p>
                          <p className="text-[10px] text-slate-400">{sk.level}</p>
                        </div>
                        <button
                          id={`remove-offered-${sk.name}`}
                          type="button"
                          onClick={() => handleRemoveOfferedSkill(sk.name)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add form */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Add New Teaching Skill</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    id="add-offered-skill-name"
                    type="text"
                    placeholder="e.g. React Native, Go"
                    value={newOfferedSkillName}
                    onChange={(e) => setNewOfferedSkillName(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                  />
                  <select
                    id="add-offered-skill-level"
                    value={newOfferedSkillLevel}
                    onChange={(e) => setNewOfferedSkillLevel(e.target.value as SkillLevel)}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                  >
                    <option value={SkillLevel.BEGINNER}>Beginner</option>
                    <option value={SkillLevel.INTERMEDIATE}>Intermediate</option>
                    <option value={SkillLevel.ADVANCED}>Advanced</option>
                  </select>
                </div>
                <button
                  id="add-offered-skill-btn"
                  type="button"
                  onClick={handleAddOfferedSkill}
                  className="w-full flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium text-xs py-1.5 border border-indigo-200/40 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>
            </GlassCard>

            {/* Want to Learn (Wanted) */}
            <GlassCard className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <BookOpen className="w-4.5 h-4.5 text-cyan-500" /> Skills You Want to Learn
                </h3>

                {/* List skills */}
                <div className="space-y-2 mt-3 max-h-[160px] overflow-y-auto pr-1">
                  {wantedSkills.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No learning goals listed yet.</p>
                  ) : (
                    wantedSkills.map((sk) => (
                      <div
                        key={sk.name}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{sk.name}</p>
                          <p className="text-[10px] text-slate-400">{sk.level}</p>
                        </div>
                        <button
                          id={`remove-wanted-${sk.name}`}
                          type="button"
                          onClick={() => handleRemoveWantedSkill(sk.name)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add form */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Add Learning Goal</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    id="add-wanted-skill-name"
                    type="text"
                    placeholder="e.g. Figma, Swift"
                    value={newWantedSkillName}
                    onChange={(e) => setNewWantedSkillName(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                  />
                  <select
                    id="add-wanted-skill-level"
                    value={newWantedSkillLevel}
                    onChange={(e) => setNewWantedSkillLevel(e.target.value as SkillLevel)}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                  >
                    <option value={SkillLevel.BEGINNER}>Beginner</option>
                    <option value={SkillLevel.INTERMEDIATE}>Intermediate</option>
                    <option value={SkillLevel.ADVANCED}>Advanced</option>
                  </select>
                </div>
                <button
                  id="add-wanted-skill-btn"
                  type="button"
                  onClick={handleAddWantedSkill}
                  className="w-full flex items-center justify-center gap-1 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 font-medium text-xs py-1.5 border border-cyan-200/40 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </form>
    </div>
  );
}
