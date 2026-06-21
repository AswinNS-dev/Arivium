// Base Types for the application

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  domain?: string;
  role?: string;
  xp?: number;
  level?: number;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  progress: number;
}

export interface Phase {
  id: string;
  roadmapId: string;
  title: string;
  order: number;
}

export interface Topic {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  status: 'locked' | 'in-progress' | 'completed';
}

export interface Assessment {
  id: string;
  topicId: string;
  title: string;
  durationMinutes: number;
}

export interface Question {
  id: string;
  assessmentId: string;
  text: string;
  type: 'multiple-choice' | 'coding';
}

export interface GapReport {
  id: string;
  studentId: string;
  overallScore: number;
  criticalGaps: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardXP: number;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface Badge {
  id: string;
  name: string;
  iconUrl: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  title: string;
  issueDate: string;
  verifyUrl: string;
}
