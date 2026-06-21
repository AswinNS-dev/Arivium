"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleDomain = getRoleDomain;
exports.buildDomainAnalysis = buildDomainAnalysis;
const RoleSkillTaxonomy_1 = require("./RoleSkillTaxonomy");
const RoleRoadmapTemplates_1 = require("./RoleRoadmapTemplates");
const RoleProjectTemplates_1 = require("./RoleProjectTemplates");
const RoleInterviewTemplates_1 = require("./RoleInterviewTemplates");
const SKILL_ALIASES = {
    'rest api': 'REST API',
    'rest apis': 'REST APIs',
    'rest': 'REST API',
    'ci cd': 'CI/CD',
    cicd: 'CI/CD',
    nlp: 'NLP',
    'natural language processing': 'NLP',
    nodejs: 'Node.js',
    'node js': 'Node.js',
    nextjs: 'Next.js',
    'next js': 'Next.js',
    tailwind: 'Tailwind CSS',
    figma: 'Figma',
};
function normalize(value) {
    return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim().replace(/\s+/g, ' ');
}
function canonicalSkill(value) {
    const key = normalize(value);
    return SKILL_ALIASES[key] || value.trim();
}
function getRoleDomain(targetRole) {
    const target = normalize(targetRole);
    return RoleSkillTaxonomy_1.ROLE_SKILL_TAXONOMY.find((entry) => normalize(entry.role) === target || entry.aliases.some((alias) => normalize(alias) === target)) || null;
}
function bucketMissing(missing) {
    return {
        critical: missing.slice(0, 4),
        important: missing.slice(4, 7),
        advanced: missing.slice(7, 9),
        other: missing.slice(9),
    };
}
function isRelatedRole(domain, role) {
    const roleText = normalize(role);
    return domain.relatedRoleKeywords.some((keyword) => roleText.includes(normalize(keyword)));
}
function buildRecommendedRoles(domain, faissRoles) {
    const roles = [];
    const seen = new Set();
    for (const role of domain.relatedRoles) {
        const key = normalize(role);
        if (!seen.has(key)) {
            roles.push({ role, score: 100 - roles.length });
            seen.add(key);
        }
    }
    for (const item of faissRoles || []) {
        if (!item?.role || !isRelatedRole(domain, item.role))
            continue;
        const key = normalize(item.role);
        if (!seen.has(key)) {
            roles.push({ role: item.role, score: item.score });
            seen.add(key);
        }
    }
    return roles.slice(0, 5);
}
function buildAssessmentQuestions(missing, role) {
    return missing.flatMap((skill) => [
        { skill, type: 'MCQ', question: `Which concept is most important for ${skill} in a ${role} role?` },
        { skill, type: 'Scenario', question: `Describe how you would apply ${skill} in a ${role} project.` },
    ]).slice(0, 12);
}
function buildLearningResources(missing) {
    return missing.slice(0, 8).map((skill) => ({
        skill,
        name: `${skill} practical learning path`,
        type: 'Documentation and guided practice',
    }));
}
function buildDomainAnalysis(domain, studentSkills, targetRole, faissRoles) {
    const student = new Set(studentSkills.map(canonicalSkill).map(normalize));
    const matchedSkills = domain.requiredSkills.filter((skill) => student.has(normalize(canonicalSkill(skill))));
    const missing = domain.requiredSkills.filter((skill) => !student.has(normalize(canonicalSkill(skill))));
    const readinessScore = domain.requiredSkills.length
        ? Math.round((matchedSkills.length / domain.requiredSkills.length) * 10000) / 100
        : 0;
    const missingSkills = bucketMissing(missing);
    const roadmapSteps = RoleRoadmapTemplates_1.ROLE_ROADMAP_TEMPLATES[domain.role] || [];
    const recommendedProjects = RoleProjectTemplates_1.ROLE_PROJECT_TEMPLATES[domain.role] || [];
    const interviewQuestions = RoleInterviewTemplates_1.ROLE_INTERVIEW_TEMPLATES[domain.role] || [];
    const weeklyTasks = roadmapSteps.map((step) => ({
        week: step.week,
        task: `Learn ${step.focus_skills.join(', ')} and apply it in a ${domain.role} project`,
    }));
    return {
        readinessScore,
        matchedSkills,
        missingSkills,
        recommendedRoles: buildRecommendedRoles(domain, faissRoles),
        recommendedProjects,
        roadmap: {
            roadmap: roadmapSteps,
            weeklyTasks,
            interviewQuestions,
            assessmentQuestions: buildAssessmentQuestions(missing, domain.role),
            learningResources: buildLearningResources(missing),
            projectIdeas: recommendedProjects,
        },
        targetRole,
        resolvedRole: domain.role,
        requiredSkills: domain.requiredSkills,
        skillGraph: {
            nodes: [...matchedSkills, ...missing].map((skill) => ({ id: skill, label: skill, status: matchedSkills.includes(skill) ? 'matched' : 'missing' })),
            edges: [],
            missing: missingSkills,
        },
        weeklyTasks,
        assessmentQuestions: buildAssessmentQuestions(missing, domain.role),
        interviewQuestions,
        learningResources: buildLearningResources(missing),
    };
}
