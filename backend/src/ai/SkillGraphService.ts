export class SkillGraphService {
  // Placeholder for skill graph generation logic using existing assets.
  buildGraph(matchedSkills: string[], missingSkills: any) {
    return {
      nodes: matchedSkills.map((s) => ({ id: s, label: s })),
      edges: [],
      missing: missingSkills,
    };
  }
}

export default new SkillGraphService();
