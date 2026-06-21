import ResumeParserService from './ResumeParserService';
import ReadinessService from './ReadinessService';
import { CareerAnalysisResult } from './types';
import { spawnSync } from 'child_process';

export default class CareerAnalysisService {
  static async analyzeStudent(resumeFilePath: string, targetRole?: string): Promise<CareerAnalysisResult> {
    // extract text
    const text = ResumeParserService.extractTextFromPdf(resumeFilePath);

    // call python analyze action
    const args = ['backend/ai_cli.py', 'analyze', '--text', text];
    if (targetRole) {
      args.push('--target_role', targetRole);
    }

    const cli = spawnSync('python', args);
    if (cli.error) throw cli.error;
    const out = cli.stdout?.toString() || '';
    try {
      const parsed = JSON.parse(out);
      return parsed as CareerAnalysisResult;
    } catch (e) {
      throw new Error('CareerAnalysisService parse error: ' + out);
    }
  }
}
