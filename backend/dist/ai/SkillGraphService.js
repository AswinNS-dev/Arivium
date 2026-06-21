"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillGraphService = void 0;
class SkillGraphService {
    // Placeholder for skill graph generation logic using existing assets.
    buildGraph(matchedSkills, missingSkills) {
        return {
            nodes: matchedSkills.map((s) => ({ id: s, label: s })),
            edges: [],
            missing: missingSkills,
        };
    }
}
exports.SkillGraphService = SkillGraphService;
exports.default = new SkillGraphService();
