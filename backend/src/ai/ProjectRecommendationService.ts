import { spawnSync } from 'child_process';
import path from 'path';
import AssetLoader from './AssetLoader';

export class ProjectRecommendationService {
  private root: string;
  constructor() {
    this.root = path.resolve(__dirname, '../../../');
  }

  recommendProjects(missingSkills: any[]) {
    const assets = AssetLoader.assets;
    if (!assets) throw new Error('Assets not initialized');

    const py = path.join(this.root, 'backend', 'python', 'project_recommend.py');
    const args = [py, JSON.stringify(missingSkills), assets.careerProfilesPath || ''];
    const res = spawnSync('python', args, { encoding: 'utf8' });
    if (res.error) throw res.error;
    if (res.status !== 0) throw new Error(res.stderr || 'project_recommend failed');

    try {
      return JSON.parse(res.stdout);
    } catch (err) {
      throw new Error('Failed to parse project_recommend output: ' + err);
    }
  }
}

export default new ProjectRecommendationService();
