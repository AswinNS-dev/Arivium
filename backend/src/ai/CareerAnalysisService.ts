import ResumeParserService from './ResumeParserService';
import ReadinessService from './ReadinessService';
import RoleRecommendationService from './RoleRecommendationService';
import ProjectRecommendationService from './ProjectRecommendationService';
import SkillGraphService from './SkillGraphService';
import GeminiRoadmapService from './GeminiRoadmapService';
import { AnalysisResult } from './types';
import { buildDomainAnalysis, getRoleDomain } from './domain/RoleDomainRegistry';

export class CareerAnalysisService {
  async analyzeStudent(resumeFile: string, targetRole: string): Promise<AnalysisResult> {
    const parsed = ResumeParserService.parsePdf(resumeFile);
    const skills: string[] = parsed.skills || [];

    const roles = RoleRecommendationService.recommendRoles(targetRole, 10);
    const domain = getRoleDomain(targetRole);

    if (domain) {
      return buildDomainAnalysis(domain, skills, targetRole, roles);
    }

    const readiness = ReadinessService.evaluate(skills, targetRole);
    const missing = readiness.missingSkills || { critical: [], important: [], advanced: [], other: [] };
    const projects = ProjectRecommendationService.recommendProjects([missing]);
    const graph = SkillGraphService.buildGraph(readiness.matchedSkills || skills, missing);
    const roadmap = GeminiRoadmapService.generateRoadmap({ skills, targetRole, missing, projects });

    const result: AnalysisResult = {
      readinessScore: readiness.readinessScore || 0,
      matchedSkills: readiness.matchedSkills || [],
      missingSkills: missing,
      recommendedRoles: roles.slice(0, 5),
      recommendedProjects: projects,
      roadmap,
      targetRole,
      resolvedRole: readiness.role,
      requiredSkills: readiness.requiredSkills || [],
      skillGraph: graph,
      weeklyTasks: roadmap.weeklyTasks || [],
      assessmentQuestions: roadmap.assessmentQuestions || [],
      interviewQuestions: roadmap.interviewQuestions || [],
      learningResources: roadmap.learningResources || [],
    };

    return result;
  }
}

export default new CareerAnalysisService();
