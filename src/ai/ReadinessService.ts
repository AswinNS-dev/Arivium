import { spawnSync } from 'child_process';

export default class ReadinessService {
  static evaluate(targetRole: string, skills: string[]) {
    const cli = spawnSync('python', ['backend/ai_cli.py', 'readiness', '--role', targetRole, '--skills', JSON.stringify(skills)]);
    if (cli.error) throw cli.error;
    const out = cli.stdout?.toString() || '';
    try {
      return JSON.parse(out);
    } catch (e) {
      throw new Error('ReadinessService parse error: ' + out);
    }
  }
}
