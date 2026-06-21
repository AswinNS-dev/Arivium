import { Request, Response } from 'express';
import CareerAnalysisService from '../ai/CareerAnalysisService';
import path from 'path';

class CareerController {
  async analyze(req: Request, res: Response) {
    try {
      const file = req.file;
      const targetRole = (req.body.targetRole || req.body.targetrole || req.body.role) as string;
      if (!file) return res.status(400).json({ success: false, message: 'resume file required' });

      const result = await CareerAnalysisService.analyzeStudent(path.resolve(file.path), targetRole || '');
      return res.json({ success: true, message: 'Career analysis completed', data: result, meta: {} });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'error', data: null });
    }
  }

  // These endpoints are optional for the current frontend.
  // The canonical pipeline is POST /api/v1/career/analyze.
  async roadmap(req: Request, res: Response) {
    try {
      const { targetRole } = req.body;
      return res.status(501).json({
        success: false,
        message: 'Not implemented. Use POST /api/v1/career/analyze instead.',
        data: null,
        meta: {},
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'error', data: null });
    }
  }

  async projects(req: Request, res: Response) {
    try {
      return res.status(501).json({
        success: false,
        message: 'Not implemented. Use POST /api/v1/career/analyze instead.',
        data: null,
        meta: {},
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'error', data: null });
    }
  }

  async roles(req: Request, res: Response) {
    try {
      return res.status(501).json({
        success: false,
        message: 'Not implemented. Use POST /api/v1/career/analyze instead.',
        data: null,
        meta: {},
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'error', data: null });
    }
  }
}

export default new CareerController();
