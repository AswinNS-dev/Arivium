import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { Assets } from './types';

const ROOT = path.resolve(__dirname, '../../../');

export class AssetLoader {
  private static instance: AssetLoader;
  public assets: Assets | null = null;

  private constructor() {}

  static getInstance() {
    if (!AssetLoader.instance) AssetLoader.instance = new AssetLoader();
    return AssetLoader.instance;
  }

  async initialize(): Promise<Assets> {
    if (this.assets) return this.assets;

    const py = path.join(ROOT, 'backend', 'python', 'asset_loader.py');
    if (!fs.existsSync(py)) throw new Error('Python asset loader not found: ' + py);

    const res = spawnSync('python', [py, ROOT], { encoding: 'utf8' });
    if (res.error) throw res.error;
    if (res.status !== 0) throw new Error(res.stderr || 'asset_loader failed');

    try {
      const parsed = JSON.parse(res.stdout);
      this.assets = parsed as Assets;
      return this.assets;
    } catch (err) {
      throw new Error('Failed to parse asset loader output: ' + err);
    }
  }
}

export default AssetLoader.getInstance();
