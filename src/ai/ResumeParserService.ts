import { spawnSync } from 'child_process';

export default class ResumeParserService {
  static extractTextFromPdf(pdfPath: string): string {
    const cli = spawnSync('python', ['backend/ai_cli.py', 'extract_text', '--path', pdfPath]);
    if (cli.error) throw cli.error;
    const out = cli.stdout?.toString() || '';
    try {
      const parsed = JSON.parse(out);
      return parsed.text || '';
    } catch (e) {
      throw new Error('ResumeParserService parse error: ' + out);
    }
  }
}
