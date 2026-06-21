import { spawnSync } from 'child_process';
import path from 'path';
import AssetLoader from './AssetLoader';

export class FaissSearchService {
  private root: string;
  constructor() {
    this.root = path.resolve(__dirname, '../../../');
  }

  search(query: string, topk = 5) {
    const assets = AssetLoader.assets;
    if (!assets) throw new Error('Assets not initialized');

    const py = path.join(this.root, 'backend', 'python', 'faiss_search.py');
    const args = [py, assets.faissIndexPath, assets.embeddingsPath, query, String(topk), assets.rolesPath];
    const res = spawnSync('python', args, { encoding: 'utf8' });
    if (res.error) throw res.error;
    if (res.status !== 0) throw new Error(res.stderr || 'faiss_search failed');

    try {
      return JSON.parse(res.stdout);
    } catch (err) {
      throw new Error('Failed to parse faiss_search output: ' + err);
    }
  }
}

export default new FaissSearchService();
