export interface ReadinessResult {
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: {
    critical: string[];
    important: string[];
    advanced: string[];
    other: string[];
  };
}

export interface CareerAnalysisResult extends ReadinessResult {
  recommendedRoles: { role: string; score: number }[];
  recommendedProjects: string[];
  roadmap: any;
  interviewQuestions: string[];
  learningResources: any[];
}
