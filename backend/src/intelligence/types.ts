export type MasteryLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type ActivityType =
  | 'resource_opened'
  | 'learning_time'
  | 'resource_completed'
  | 'assessment_completed'
  | 'challenge_completed'
  | 'project_completed';

export interface ResourceRecommendation {
  type: 'Documentation' | 'Course' | 'YouTube' | 'Project' | 'Practice';
  title: string;
  url: string;
  reason?: string;
}

export interface ResourceRequest {
  profileId: string;
  role: string;
  readiness: number;
  skill: string;
  mastery: MasteryLevel;
  week: string;
  missingSkills?: string[];
}

export interface LearningEvent {
  type: ActivityType;
  skill: string;
  week?: string;
  minutesSpent?: number;
  assessmentScore?: number;
  resourceUrl?: string;
  completed?: boolean;
}

export interface RoadmapTopicProgress {
  topic: string;
  week: string;
  startedAt: string | null;
  completedAt: string | null;
  progress: number;
  assessmentScore: number | null;
  mastery: MasteryLevel;
  minutesSpent: number;
  resourceClicks: number;
}

export interface ReadinessHistoryPoint {
  score: number;
  at: string;
  reason: ActivityType | 'initialized';
}

export interface LearningProfile {
  id: string;
  role: string;
  initialReadiness: number;
  currentReadiness: number;
  missingSkills: string[];
  topics: RoadmapTopicProgress[];
  readinessHistory: ReadinessHistoryPoint[];
  activity: Array<LearningEvent & { at: string }>;
  completedChallenges: string[];
  completedProjects: string[];
  updatedAt: string;
}
