/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SkillLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced"
}

export interface SkillItem {
  name: string;
  level: SkillLevel;
}

export interface UserStats {
  hoursTaught: number;
  hoursLearned: number;
  sessionsCompleted: number;
  globalRank: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  skillsOffered: SkillItem[];
  skillsWanted: SkillItem[];
  badges: Badge[];
  rating: number;
  sessionsCompleted: number;
  stats: UserStats;
  availability: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export enum SessionStatus {
  PENDING = "Pending",
  ACCEPTED = "Accepted",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled"
}

export interface Session {
  id: string;
  teacherId: string;
  studentId: string;
  teacherName: string;
  studentName: string;
  skillName: string;
  date: string;
  timeSlot: string;
  status: SessionStatus;
  review?: {
    rating: number;
    text: string;
    createdAt: string;
  };
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isSeen: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: "session" | "message" | "badge" | "system";
  isRead: boolean;
  timestamp: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AIRecommendation {
  skillsToLearn: { skillName: string; reason: string }[];
  studyPlan: { day: string; task: string; duration: string }[];
  suggestedMentors: string[];
  quizzes?: QuizQuestion[];
}
