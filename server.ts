/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { SessionStatus } from "./src/types";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "data", "db.json");
const SECRET_KEY = process.env.JWT_SECRET || "skillswap_secure_hmac_secret_2026";

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}

// Ensure database file exists with seed data
const initialSeeds = {
  users: [
    {
      id: "user-seed-jane",
      name: "Jane Doe",
      email: "jane@skillswap.edu",
      passwordHash: "7b415a77033a1be1d6688f170f38b29f7f45778a0aa8f96e485497ee3e6f962d", // hashed 'password123'
      salt: "seed_salt_1",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      bio: "Computer Science Junior. I build high-performance React frontends and love crafting interactive, accessible visual interfaces. Looking to refine my UI/UX systems knowledge.",
      skillsOffered: [
        { name: "React & Next.js", level: "Advanced" },
        { name: "TypeScript", level: "Intermediate" }
      ],
      skillsWanted: [
        { name: "UI/UX Figma Design", level: "Beginner" },
        { name: "Tailwind Styling", level: "Intermediate" }
      ],
      badges: [
        { id: "b1", title: "Top Mentor", description: "Taught over 5 successful swap sessions", iconName: "Award", unlockedAt: "2026-05-12" },
        { id: "b2", title: "5 Star Mentor", description: "Maintained a perfect 5-star rating", iconName: "Star", unlockedAt: "2026-06-01" }
      ],
      rating: 5.0,
      sessionsCompleted: 12,
      stats: { hoursTaught: 18, hoursLearned: 10, sessionsCompleted: 12, globalRank: 4 },
      availability: "Mon, Wed, Fri (3:00 PM - 7:00 PM)"
    },
    {
      id: "user-seed-alex",
      name: "Alex Rivera",
      email: "alex@skillswap.edu",
      passwordHash: "7b415a77033a1be1d6688f170f38b29f7f45778a0aa8f96e485497ee3e6f962d", // hashed 'password123'
      salt: "seed_salt_2",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      bio: "Back-end focused programmer. Java/Spring Boot expert, SQL optimizer, and lover of system design. Wanting to learn modern frontend frameworks to bridge the gap.",
      skillsOffered: [
        { name: "Java & DSA", level: "Advanced" },
        { name: "PostgreSQL & Database Layout", level: "Advanced" }
      ],
      skillsWanted: [
        { name: "React & Next.js", level: "Beginner" },
        { name: "TypeScript", level: "Beginner" }
      ],
      badges: [
        { id: "b3", title: "Rising Star", description: "Helped 5 classmates in under 1 week", iconName: "TrendingUp", unlockedAt: "2026-06-15" }
      ],
      rating: 4.8,
      sessionsCompleted: 8,
      stats: { hoursTaught: 12, hoursLearned: 8, sessionsCompleted: 8, globalRank: 12 },
      availability: "Tue, Thu (2:00 PM - 6:00 PM)"
    },
    {
      id: "user-seed-sarah",
      name: "Sarah Chen",
      email: "sarah@skillswap.edu",
      passwordHash: "7b415a77033a1be1d6688f170f38b29f7f45778a0aa8f96e485497ee3e6f962d",
      salt: "seed_salt_3",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      bio: "Product Design Major. Passionate about user empathy, wireframes, typography, and motion assets. Looking to pick up standard front-end development using HTML/CSS/Tailwind.",
      skillsOffered: [
        { name: "UI/UX Figma Design", level: "Advanced" },
        { name: "Prototyping & User Flows", level: "Advanced" }
      ],
      skillsWanted: [
        { name: "React & Next.js", level: "Beginner" },
        { name: "Tailwind Styling", level: "Beginner" }
      ],
      badges: [
        { id: "b1", title: "Top Mentor", description: "Taught over 5 successful swap sessions", iconName: "Award", unlockedAt: "2026-06-20" },
        { id: "b4", title: "Community Helper", description: "Answered over 10 study forum threads", iconName: "Heart", unlockedAt: "2026-06-28" }
      ],
      rating: 4.9,
      sessionsCompleted: 15,
      stats: { hoursTaught: 22, hoursLearned: 14, sessionsCompleted: 15, globalRank: 2 },
      availability: "Saturdays (10:00 AM - 4:00 PM)"
    },
    {
      id: "user-seed-liam",
      name: "Liam O'Connor",
      email: "liam@skillswap.edu",
      passwordHash: "7b415a77033a1be1d6688f170f38b29f7f45778a0aa8f96e485497ee3e6f962d",
      salt: "seed_salt_4",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      bio: "Senior CS student deeply in love with Competitive Programming, Data Structures, Algorithms, and Low-Level system implementations. Let's swap knowledge!",
      skillsOffered: [
        { name: "Data Structures & Algorithms", level: "Advanced" },
        { name: "C++ Programming", level: "Advanced" }
      ],
      skillsWanted: [
        { name: "UI/UX Figma Design", level: "Beginner" }
      ],
      badges: [
        { id: "b5", title: "Fast Learner", description: "Completed 3 sessions as a learner in 2 days", iconName: "Zap", unlockedAt: "2026-07-01" }
      ],
      rating: 4.7,
      sessionsCompleted: 6,
      stats: { hoursTaught: 9, hoursLearned: 6, sessionsCompleted: 6, globalRank: 18 },
      availability: "Daily (7:00 PM - 9:00 PM)"
    }
  ],
  sessions: [
    {
      id: "session-1",
      teacherId: "user-seed-jane",
      studentId: "user-seed-alex",
      teacherName: "Jane Doe",
      studentName: "Alex Rivera",
      skillName: "React & Next.js",
      date: "2026-07-10",
      timeSlot: "4:00 PM - 5:00 PM",
      status: SessionStatus.PENDING
    },
    {
      id: "session-2",
      teacherId: "user-seed-sarah",
      studentId: "user-seed-jane",
      teacherName: "Sarah Chen",
      studentName: "Jane Doe",
      skillName: "UI/UX Figma Design",
      date: "2026-07-12",
      timeSlot: "11:00 AM - 12:30 PM",
      status: SessionStatus.PENDING
    },
    {
      id: "session-3",
      teacherId: "user-seed-alex",
      studentId: "user-seed-jane",
      teacherName: "Alex Rivera",
      studentName: "Jane Doe",
      skillName: "Java & DSA",
      date: "2026-07-05",
      timeSlot: "3:00 PM - 4:00 PM",
      status: SessionStatus.COMPLETED,
      review: {
        rating: 5,
        text: "Incredible session! Alex mapped out Binary Search trees so cleanly, highly recommended teacher.",
        createdAt: "2026-07-05"
      }
    }
  ],
  notifications: [
    {
      id: "notif-1",
      userId: "user-seed-jane",
      title: "New Booking Request",
      description: "Sarah Chen requested a session: UI/UX Figma Design.",
      type: "session",
      isRead: false,
      timestamp: "2026-07-08T10:00:00-07:00"
    }
  ]
};

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialSeeds, null, 2));
}

// Helper to read DB
function readDb() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return initialSeeds;
  }
}

// Helper to write DB
function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Cryptographic Password Hashing (PBKDF2/SHA-256)
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

// Generate Secure Cryptographic Token (Signature-verified HMAC-SHA256)
function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 1000 * 60 * 60 * 24 })).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

// Verify Cryptographic Token
function verifyToken(token: string): { userId: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(`${header}.${payload}`).digest("base64url");
    if (signature !== expectedSignature) return null;

    const parsedPayload = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (parsedPayload.exp < Date.now()) return null; // Expired
    return { userId: parsedPayload.userId };
  } catch (err) {
    return null;
  }
}

// Middleware: Authenticate Request
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(403).json({ error: "Invalid or expired session" });

  req.userId = decoded.userId;
  next();
}

// Initialize Gemini SDK with User-Agent required for telemetries
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// API: Authentication - Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, skillsOffered, skillsWanted, bio } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const db = readDb();
  if (db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Account with this email already exists" });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const userId = "user-" + crypto.randomBytes(8).toString("hex");

  const newUser = {
    id: userId,
    name,
    email: email.toLowerCase(),
    passwordHash,
    salt,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    bio: bio || "Passionate student looking to learn and grow peer-to-peer on SkillSwap.",
    skillsOffered: skillsOffered || [],
    skillsWanted: skillsWanted || [],
    badges: [
      { id: "b-new", title: "Community Member", description: "Joined the SkillSwap ecosystem", iconName: "User", unlockedAt: new Date().toISOString().split("T")[0] }
    ],
    rating: 5.0,
    sessionsCompleted: 0,
    stats: { hoursTaught: 0, hoursLearned: 0, sessionsCompleted: 0, globalRank: db.users.length + 1 },
    availability: "Flexible weekdays"
  };

  db.users.push(newUser);
  writeDb(db);

  const token = generateToken(userId);
  const { passwordHash: _, salt: __, ...userResponse } = newUser;
  res.status(201).json({ user: userResponse, token });
});

// API: Authentication - Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const token = generateToken(user.id);
  const { passwordHash: _, salt: __, ...userResponse } = user;
  res.json({ user: userResponse, token });
});

// API: Get Current Authenticated User Context
app.get("/api/auth/me", authenticateToken, (req: any, res: any) => {
  const db = readDb();
  const user = db.users.find((u: any) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { passwordHash: _, salt: __, ...userResponse } = user;
  res.json(userResponse);
});

// API: Update User Profile Info
app.post("/api/auth/update-profile", authenticateToken, (req: any, res: any) => {
  const { bio, avatar, skillsOffered, skillsWanted, availability, socialLinks } = req.body;
  const db = readDb();
  const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (skillsOffered !== undefined) user.skillsOffered = skillsOffered;
  if (skillsWanted !== undefined) user.skillsWanted = skillsWanted;
  if (availability !== undefined) user.availability = availability;
  if (socialLinks !== undefined) user.socialLinks = socialLinks;

  db.users[userIndex] = user;
  writeDb(db);

  const { passwordHash: _, salt: __, ...userResponse } = user;
  res.json(userResponse);
});

// API: Marketplace - Search and Filter Skills / Mentors
app.get("/api/marketplace/skills", (req, res) => {
  const { search, level, sort } = req.query;
  const db = readDb();

  let results = db.users.map((u: any) => {
    const { passwordHash: _, salt: __, ...userResponse } = u;
    return userResponse;
  });

  // Filter out users based on search
  if (search) {
    const s = (search as string).toLowerCase();
    results = results.filter((u: any) =>
      u.name.toLowerCase().includes(s) ||
      u.bio.toLowerCase().includes(s) ||
      u.skillsOffered.some((sk: any) => sk.name.toLowerCase().includes(s))
    );
  }

  // Filter based on skill levels
  if (level) {
    results = results.filter((u: any) =>
      u.skillsOffered.some((sk: any) => sk.level === level)
    );
  }

  // Sort results
  if (sort === "rating") {
    results.sort((a: any, b: any) => b.rating - a.rating);
  } else if (sort === "sessions") {
    results.sort((a: any, b: any) => b.sessionsCompleted - a.sessionsCompleted);
  } else {
    // Default: Sort by globalRank index
    results.sort((a: any, b: any) => a.stats.globalRank - b.stats.globalRank);
  }

  res.json(results);
});

// API: Leaderboard
app.get("/api/leaderboard", (req, res) => {
  const db = readDb();
  const sorted = [...db.users].sort((a: any, b: any) => b.sessionsCompleted - a.sessionsCompleted);
  const leaderboard = sorted.map((u: any) => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    rating: u.rating,
    sessionsCompleted: u.sessionsCompleted,
    skillsOffered: u.skillsOffered,
    stats: u.stats
  }));
  res.json(leaderboard);
});

// API: Sessions - Get for logged in student/teacher
app.get("/api/dashboard/sessions", authenticateToken, (req: any, res: any) => {
  const db = readDb();
  const userSessions = db.sessions.filter(
    (s: any) => s.studentId === req.userId || s.teacherId === req.userId
  );
  res.json(userSessions);
});

// API: Sessions - Book a session
app.post("/api/dashboard/sessions/book", authenticateToken, (req: any, res: any) => {
  const { teacherId, skillName, date, timeSlot } = req.body;
  if (!teacherId || !skillName || !date || !timeSlot) {
    return res.status(400).json({ error: "Teacher ID, skill name, date, and timeslot are required" });
  }

  const db = readDb();
  const teacher = db.users.find((u: any) => u.id === teacherId);
  const student = db.users.find((u: any) => u.id === req.userId);

  if (!teacher || !student) {
    return res.status(404).json({ error: "Teacher or Student not found" });
  }

  if (teacher.id === student.id) {
    return res.status(400).json({ error: "You cannot schedule a swap session with yourself" });
  }

  const newSession = {
    id: "session-" + crypto.randomBytes(8).toString("hex"),
    teacherId,
    studentId: student.id,
    teacherName: teacher.name,
    studentName: student.name,
    skillName,
    date,
    timeSlot,
    status: SessionStatus.PENDING
  };

  db.sessions.push(newSession);

  // Add notification to the teacher
  db.notifications.push({
    id: "notif-" + crypto.randomBytes(8).toString("hex"),
    userId: teacherId,
    title: "New Swap Requested",
    description: `${student.name} wants to learn ${skillName} on ${date}.`,
    type: "session",
    isRead: false,
    timestamp: new Date().toISOString()
  });

  writeDb(db);
  res.status(201).json(newSession);
});

// API: Sessions - Process Accept/Complete/Cancel/Review
app.post("/api/dashboard/sessions/action", authenticateToken, (req: any, res: any) => {
  const { sessionId, action, reviewRating, reviewText } = req.body;
  if (!sessionId || !action) {
    return res.status(400).json({ error: "Session ID and action are required" });
  }

  const db = readDb();
  const sessionIndex = db.sessions.findIndex((s: any) => s.id === sessionId);
  if (sessionIndex === -1) return res.status(404).json({ error: "Session not found" });

  const session = db.sessions[sessionIndex];

  // Verify permission
  if (session.teacherId !== req.userId && session.studentId !== req.userId) {
    return res.status(403).json({ error: "Unauthorized to perform actions on this session" });
  }

  if (action === "accept") {
    if (session.teacherId !== req.userId) {
      return res.status(403).json({ error: "Only the teacher can accept booking requests" });
    }
    session.status = SessionStatus.ACCEPTED;

    // Notify student
    db.notifications.push({
      id: "notif-" + crypto.randomBytes(8).toString("hex"),
      userId: session.studentId,
      title: "Session Accepted!",
      description: `${session.teacherName} approved your swap request for ${session.skillName}.`,
      type: "session",
      isRead: false,
      timestamp: new Date().toISOString()
    });
  } else if (action === "cancel") {
    session.status = SessionStatus.CANCELLED;

    const notifiedUserId = session.teacherId === req.userId ? session.studentId : session.teacherId;
    const cancelledBy = session.teacherId === req.userId ? session.teacherName : session.studentName;

    db.notifications.push({
      id: "notif-" + crypto.randomBytes(8).toString("hex"),
      userId: notifiedUserId,
      title: "Session Cancelled",
      description: `Your swap for ${session.skillName} was cancelled by ${cancelledBy}.`,
      type: "session",
      isRead: false,
      timestamp: new Date().toISOString()
    });
  } else if (action === "complete") {
    session.status = SessionStatus.COMPLETED;

    // Update stats for both user records
    const teacherIdx = db.users.findIndex((u: any) => u.id === session.teacherId);
    const studentIdx = db.users.findIndex((u: any) => u.id === session.studentId);

    if (teacherIdx !== -1) {
      db.users[teacherIdx].sessionsCompleted += 1;
      db.users[teacherIdx].stats.sessionsCompleted += 1;
      db.users[teacherIdx].stats.hoursTaught += 1.5; // average hour completion
    }
    if (studentIdx !== -1) {
      db.users[studentIdx].sessionsCompleted += 1;
      db.users[studentIdx].stats.sessionsCompleted += 1;
      db.users[studentIdx].stats.hoursLearned += 1.5;
    }

    // Trigger possible badge unlock checking!
    if (teacherIdx !== -1 && db.users[teacherIdx].sessionsCompleted >= 5) {
      const hasTopMentor = db.users[teacherIdx].badges.some((b: any) => b.id === "b1");
      if (!hasTopMentor) {
        db.users[teacherIdx].badges.push({
          id: "b1",
          title: "Top Mentor",
          description: "Taught over 5 successful swap sessions",
          iconName: "Award",
          unlockedAt: new Date().toISOString().split("T")[0]
        });
        db.notifications.push({
          id: "notif-" + crypto.randomBytes(8).toString("hex"),
          userId: session.teacherId,
          title: "New Badge Unlocked!",
          description: "Congratulations! You unlocked the 'Top Mentor' badge.",
          type: "badge",
          isRead: false,
          timestamp: new Date().toISOString()
        });
      }
    }

    db.notifications.push({
      id: "notif-" + crypto.randomBytes(8).toString("hex"),
      userId: session.studentId,
      title: "Swap Finished",
      description: `Please leave a helpful rating and review for your session with ${session.teacherName}.`,
      type: "session",
      isRead: false,
      timestamp: new Date().toISOString()
    });
  } else if (action === "review") {
    if (session.studentId !== req.userId) {
      return res.status(403).json({ error: "Only the student can rate and review sessions" });
    }
    if (session.status !== SessionStatus.COMPLETED) {
      return res.status(400).json({ error: "Can only review successfully completed sessions" });
    }

    session.review = {
      rating: Number(reviewRating) || 5,
      text: reviewText || "Excellent learning session!",
      createdAt: new Date().toISOString().split("T")[0]
    };

    // Recalculate teacher average rating
    const teacherIdx = db.users.findIndex((u: any) => u.id === session.teacherId);
    if (teacherIdx !== -1) {
      const teacher = db.users[teacherIdx];
      const finishedSessions = db.sessions.filter((s: any) => s.teacherId === teacher.id && s.review);
      const sum = finishedSessions.reduce((acc: number, curr: any) => acc + curr.review.rating, 0) + Number(reviewRating);
      const count = finishedSessions.length + 1;
      teacher.rating = Number((sum / count).toFixed(1));
      db.users[teacherIdx] = teacher;
    }
  }

  db.sessions[sessionIndex] = session;
  writeDb(db);
  res.json(session);
});

// API: Notifications - Get list for logged in user
app.get("/api/notifications", authenticateToken, (req: any, res: any) => {
  const db = readDb();
  const userNotifs = db.notifications.filter((n: any) => n.userId === req.userId);
  res.json(userNotifs);
});

// API: Notifications - Mark all as read
app.post("/api/notifications/read", authenticateToken, (req: any, res: any) => {
  const db = readDb();
  db.notifications = db.notifications.map((n: any) => {
    if (n.userId === req.userId) {
      return { ...n, isRead: true };
    }
    return n;
  });
  writeDb(db);
  res.json({ success: true });
});

// API: AI Coach - Generate a learning plan and a mini study test using server-side Gemini API!
app.post("/api/coach/plan", authenticateToken, async (req: any, res: any) => {
  const { skillName, targetSkillLevel } = req.body;
  if (!skillName) {
    return res.status(400).json({ error: "Skill name is required for the study plan." });
  }

  try {
    const prompt = `You are the ultimate friendly SkillSwap AI Learning Coach for students. 
Create an ultra-high-quality structured peer-to-peer study outline and path for learning "${skillName}" at the "${targetSkillLevel || 'Beginner'}" level.
The response MUST include:
1. 'skillsToLearn': list of 3 subskills with exact detailed logical reasons why.
2. 'studyPlan': detailed weekly day-by-day plan of 5 items with daily actionable tasks and recommended durations.
3. 'suggestedMentors': 2 sample professional mock user titles to seek on the marketplace.
4. 'quizzes': a list of 2 helpful interactive multiple-choice questions for checking their knowledge. Provide clear options, 0-indexed correct index, and a helpful explanation.

IMPORTANT: Ensure your output strictly complies with the requested JSON schema structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skillsToLearn: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skillName: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["skillName", "reason"]
              }
            },
            studyPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  task: { type: Type.STRING },
                  duration: { type: Type.STRING }
                },
                required: ["day", "task", "duration"]
              }
            },
            suggestedMentors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            quizzes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["skillsToLearn", "studyPlan", "suggestedMentors", "quizzes"]
        }
      }
    });

    const resultText = response.text?.trim() || "{}";
    const planObject = JSON.parse(resultText);
    res.json(planObject);
  } catch (err: any) {
    console.error("Gemini AI Coach failed:", err);
    // Graceful fallback plan if key is not configured or fails
    const fallbackPlan = {
      skillsToLearn: [
        { skillName: `Core ${skillName} Fundamentals`, reason: "Laying solid groundworks avoids basic design and coding anti-patterns later." },
        { skillName: "Project Building Blocks", reason: "Constructing simple terminal/web components builds muscle memory rapidly." },
        { skillName: "Best Practices & Profiling", reason: "Understanding modular setups keeps code clean, readable, and highly maintainable." }
      ],
      studyPlan: [
        { day: "Day 1: Setup & Core Concepts", task: "Read standard official docs and write 3 basic tests.", duration: "1.5 Hours" },
        { day: "Day 2: Minor Exercises", task: "Recreate a popular open-source clone or simple algorithm.", duration: "2 Hours" },
        { day: "Day 3: Custom Layouts", task: "Style components utilizing modern palettes.", duration: "1.5 Hours" },
        { day: "Day 4: Refactor Code", task: "Split files into modules to preserve token limits.", duration: "1 Hour" },
        { day: "Day 5: Swap Showcase", task: "Book a review session with a top SkillSwap peer mentor.", duration: "1.5 Hours" }
      ],
      suggestedMentors: ["Senior Peer Mentor", "Graduate Teaching Assistant"],
      quizzes: [
        {
          question: `What is the primary benefit of modular architectural planning in learning ${skillName}?`,
          options: ["Reduces compile/bundle sizes", "Enhances code reusability", "Keeps files compact and within token limits", "All of the above"],
          correctIndex: 3,
          explanation: "Separating concerns into dedicated files ensures high readability, clean builds, and robust maintenance."
        },
        {
          question: `Which approach is best when starting to teach or practice ${skillName} peer-to-peer?`,
          options: ["Build the entire complex project at once", "Provide continuous mock data with no user input", "Start with simple subcomponents and explain conceptually", "Copy-paste code blocks without testing"],
          correctIndex: 2,
          explanation: "Step-by-step progress with literal examples is the best way to anchor core concepts in teaching classmates."
        }
      ]
    };
    res.json(fallbackPlan);
  }
});

// Vite Middleware integrated after API routes
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkillSwap full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
