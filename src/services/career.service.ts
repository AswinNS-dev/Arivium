import CareerAnalysisService from '../ai/CareerAnalysisService';

class CareerService {
  static async analyze(resumeFilePath: string, targetRole?: string) {
    return CareerAnalysisService.analyzeStudent(resumeFilePath, targetRole);
  }
}

export default CareerService;
