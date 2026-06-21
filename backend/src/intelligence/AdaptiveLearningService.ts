import ActivityStore from './ActivityStore';
import { LearningEvent, LearningProfile, MasteryLevel, RoadmapTopicProgress } from './types';

interface ProfileContext {
  profileId: string;
  role: string;
  readiness: number;
  missingSkills?: string[];
  roadmap?: Array<{ week?: string; focus_skills?: string[] }>;
}

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, Math.round(value * 100) / 100));
}

export function masteryFromScore(score: number): MasteryLevel {
  if (score >= 86) return 'Expert';
  if (score >= 61) return 'Advanced';
  if (score >= 31) return 'Intermediate';
  return 'Beginner';
}

function createTopic(topic: string, week = 'Unscheduled'): RoadmapTopicProgress {
  return {
    topic,
    week,
    startedAt: null,
    completedAt: null,
    progress: 0,
    assessmentScore: null,
    mastery: 'Beginner',
    minutesSpent: 0,
    resourceClicks: 0,
  };
}

class AdaptiveLearningService {
  ensureProfile(context: ProfileContext): LearningProfile {
    const id = context.profileId.trim();
    if (!id) throw new Error('profileId is required');
    const existing = ActivityStore.get(id);
    if (existing) return existing;

    const topics = new Map<string, RoadmapTopicProgress>();
    for (const step of context.roadmap || []) {
      for (const skill of step.focus_skills || []) {
        if (!topics.has(skill.toLowerCase())) topics.set(skill.toLowerCase(), createTopic(skill, step.week));
      }
    }
    for (const skill of context.missingSkills || []) {
      if (!topics.has(skill.toLowerCase())) topics.set(skill.toLowerCase(), createTopic(skill));
    }

    const now = new Date().toISOString();
    return ActivityStore.save({
      id,
      role: context.role,
      initialReadiness: clamp(context.readiness),
      currentReadiness: clamp(context.readiness),
      missingSkills: context.missingSkills || [],
      topics: [...topics.values()],
      readinessHistory: [{ score: clamp(context.readiness), at: now, reason: 'initialized' }],
      activity: [],
      completedChallenges: [],
      completedProjects: [],
      updatedAt: now,
    });
  }

  record(context: ProfileContext, event: LearningEvent): LearningProfile {
    const profile = this.ensureProfile(context);
    const now = new Date().toISOString();
    let topic = profile.topics.find((item) => item.topic.toLowerCase() === event.skill.toLowerCase());
    if (!topic) {
      topic = createTopic(event.skill, event.week);
      profile.topics.push(topic);
    }
    topic.startedAt ||= now;

    if (event.type === 'resource_opened') {
      topic.resourceClicks += 1;
      topic.progress = clamp(topic.progress + 3);
    }
    if (event.type === 'learning_time') {
      topic.minutesSpent += Math.max(0, event.minutesSpent || 0);
      topic.progress = clamp(topic.progress + Math.min(20, (event.minutesSpent || 0) / 6));
    }
    if (event.type === 'resource_completed') topic.progress = clamp(topic.progress + 15);
    if (event.type === 'assessment_completed' && event.assessmentScore !== undefined) {
      topic.assessmentScore = clamp(event.assessmentScore);
      topic.progress = clamp(Math.max(topic.progress, topic.assessmentScore));
    }
    if (event.type === 'challenge_completed') {
      topic.progress = clamp(topic.progress + 20);
      if (!profile.completedChallenges.includes(event.skill)) profile.completedChallenges.push(event.skill);
    }
    if (event.type === 'project_completed') {
      topic.progress = clamp(topic.progress + 30);
      if (!profile.completedProjects.includes(event.skill)) profile.completedProjects.push(event.skill);
    }

    topic.mastery = masteryFromScore(topic.assessmentScore ?? topic.progress);
    if (event.completed || topic.progress >= 100) topic.completedAt ||= now;
    profile.activity.push({ ...event, at: now });

    const averageProgress = profile.topics.length
      ? profile.topics.reduce((total, item) => total + item.progress, 0) / profile.topics.length
      : 0;
    const evidenceBonus = Math.min(10, profile.completedChallenges.length * 2 + profile.completedProjects.length * 4);
    profile.currentReadiness = clamp(
      profile.initialReadiness + (100 - profile.initialReadiness) * (averageProgress / 100) * 0.7 + evidenceBonus
    );
    const previous = profile.readinessHistory[profile.readinessHistory.length - 1]?.score;
    if (previous !== profile.currentReadiness) {
      profile.readinessHistory.push({ score: profile.currentReadiness, at: now, reason: event.type });
    }
    profile.updatedAt = now;
    return ActivityStore.save(profile);
  }

  get(profileId: string) {
    return ActivityStore.get(profileId);
  }

  analytics(profileId?: string) {
    const profiles = profileId ? [ActivityStore.get(profileId)].filter(Boolean) as LearningProfile[] : ActivityStore.list();
    const activity = profiles.flatMap((profile) => profile.activity);
    return {
      scope: profileId ? 'student' : 'college',
      students: profiles.length,
      resourceClicks: activity.filter((item) => item.type === 'resource_opened').length,
      learningMinutes: activity.reduce((total, item) => total + (item.minutesSpent || 0), 0),
      assessmentsCompleted: activity.filter((item) => item.type === 'assessment_completed').length,
      averageAssessmentScore: (() => {
        const scores = activity.flatMap((item) => item.assessmentScore === undefined ? [] : [item.assessmentScore]);
        return scores.length ? clamp(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      })(),
      challengesCompleted: profiles.reduce((total, item) => total + item.completedChallenges.length, 0),
      projectsCompleted: profiles.reduce((total, item) => total + item.completedProjects.length, 0),
      averageReadiness: profiles.length ? clamp(profiles.reduce((total, item) => total + item.currentReadiness, 0) / profiles.length) : 0,
      profiles,
    };
  }
}

export default new AdaptiveLearningService();
