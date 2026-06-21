export interface Assets {
  rolesPath: string;
  careerProfilesPath: string;
  roleSkillFreqPath: string;
  embeddingsPath: string;
  faissIndexPath: string;
  roles?: any;
  careerProfiles?: any;
  roleSkillFreq?: any;
}

export interface AnalysisResult {
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: {
    critical: string[];
    important: string[];
    advanced: string[];
    other: string[];
  };
  recommendedRoles: { role: string; score: number }[];
  recommendedProjects: string[];
  roadmap: any;
  targetRole?: string;
  resolvedRole?: string;
  requiredSkills?: string[];
  skillGraph?: any;
  weeklyTasks?: any[];
  assessmentQuestions?: any[];
  interviewQuestions: string[];
  learningResources: any[];
}
