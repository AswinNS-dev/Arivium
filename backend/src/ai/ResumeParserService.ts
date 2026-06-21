import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import AssetLoader from './AssetLoader';

export class ResumeParserService {
  private root: string;
  constructor() {
    this.root = path.resolve(__dirname, '../../../');
  }

  parsePdf(filePath: string) {
    if (!fs.existsSync(filePath)) throw new Error('Resume file not found: ' + filePath);
    const assets = AssetLoader.assets;
    if (!assets) throw new Error('Assets not initialized');

    const py = path.join(this.root, 'backend', 'python', 'resume_parser.py');
    const res = spawnSync('python', [py, filePath, assets.roleSkillFreqPath, assets.careerProfilesPath], { encoding: 'utf8' });
    if (res.error) throw res.error;
    if (res.status !== 0) throw new Error(res.stderr || 'resume_parser failed');

    try {
      return JSON.parse(res.stdout);
    } catch (err) {
      throw new Error('Failed to parse resume_parser output: ' + err);
    }
  }
}

export default new ResumeParserService();
