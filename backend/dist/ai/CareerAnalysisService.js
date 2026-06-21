"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareerAnalysisService = void 0;
const ResumeParserService_1 = __importDefault(require("./ResumeParserService"));
const ReadinessService_1 = __importDefault(require("./ReadinessService"));
const RoleRecommendationService_1 = __importDefault(require("./RoleRecommendationService"));
const ProjectRecommendationService_1 = __importDefault(require("./ProjectRecommendationService"));
const SkillGraphService_1 = __importDefault(require("./SkillGraphService"));
const GeminiRoadmapService_1 = __importDefault(require("./GeminiRoadmapService"));
const RoleDomainRegistry_1 = require("./domain/RoleDomainRegistry");
class CareerAnalysisService {
    async analyzeStudent(resumeFile, targetRole) {
        const parsed = ResumeParserService_1.default.parsePdf(resumeFile);
        const skills = parsed.skills || [];
        const roles = RoleRecommendationService_1.default.recommendRoles(targetRole, 10);
        const domain = (0, RoleDomainRegistry_1.getRoleDomain)(targetRole);
        if (domain) {
            return (0, RoleDomainRegistry_1.buildDomainAnalysis)(domain, skills, targetRole, roles);
        }
        const readiness = ReadinessService_1.default.evaluate(skills, targetRole);
        const missing = readiness.missingSkills || { critical: [], important: [], advanced: [], other: [] };
        const projects = ProjectRecommendationService_1.default.recommendProjects([missing]);
        const graph = SkillGraphService_1.default.buildGraph(readiness.matchedSkills || skills, missing);
        const roadmap = GeminiRoadmapService_1.default.generateRoadmap({ skills, targetRole, missing, projects });
        const result = {
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
exports.CareerAnalysisService = CareerAnalysisService;
exports.default = new CareerAnalysisService();
