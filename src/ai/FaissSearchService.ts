import { spawnSync } from 'child_process';
import AssetLoader from './AssetLoader';

export default class FaissSearchService {
  static async searchRoles(query: string, topK = 5) {
    const cli = spawnSync('python', [
      'backend/ai_cli.py',
      'search_roles',
      '--query',
      query,
      '--topk',
      String(topK),
    ]);

    if (cli.error) throw cli.error;
    const out = cli.stdout?.toString() || '';
    try {
      return JSON.parse(out);
    } catch (e) {
      throw new Error('FaissSearchService parse error: ' + out);
    }
  }
}
