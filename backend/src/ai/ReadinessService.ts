import { spawnSync } from 'child_process';
import path from 'path';
import AssetLoader from './AssetLoader';

export class ReadinessService {
  private root: string;
  constructor() {
    this.root = path.resolve(__dirname, '../../../');
  }

  evaluate(skills: string[], targetRole: string) {
    const assets = AssetLoader.assets;
    if (!assets) throw new Error('Assets not initialized');

    const py = path.join(this.root, 'backend', 'python', 'readiness.py');
    const args = [py, JSON.stringify(skills), targetRole, assets.roleSkillFreqPath, assets.careerProfilesPath];
    const res = spawnSync('python', args, { encoding: 'utf8' });
    if (res.error) throw res.error;
    if (res.status !== 0) throw new Error(res.stderr || 'readiness failed');

    try {
      return JSON.parse(res.stdout);
    } catch (err) {
      throw new Error('Failed to parse readiness output: ' + err);
    }
  }
}

export default new ReadinessService();
