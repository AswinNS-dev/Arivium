import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';
import AssetLoader from './AssetLoader';

export class GeminiRoadmapService {
  private root: string;
  constructor() {
    this.root = path.resolve(__dirname, '../../../');
  }

  generateRoadmap(context: any) {
    const promptPath = path.join(this.root, 'src', 'prompts', 'roadmap_prompt.txt');
    const prompt = fs.existsSync(promptPath) ? fs.readFileSync(promptPath, 'utf8') : '';

    const py = path.join(this.root, 'backend', 'python', 'roadmap.py');
    const args = [py, JSON.stringify(context), prompt];
    const res = spawnSync('python', args, { encoding: 'utf8' });
    if (res.error) throw res.error;
    if (res.status !== 0) throw new Error(res.stderr || 'roadmap failed');

    try {
      return JSON.parse(res.stdout);
    } catch (err) {
      throw new Error('Failed to parse roadmap output: ' + err);
    }
  }
}

export default new GeminiRoadmapService();
