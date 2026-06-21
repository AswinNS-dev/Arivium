import { Request, Response } from 'express';
import CareerService from '../services/career.service';
import fs from 'fs';
import path from 'path';

class CareerController {
  static async analyze(req: Request, res: Response) {
    try {
      // expect file is uploaded to tmp path and available as req.file.path
      const file = (req as any).file;
      if (!file) return res.status(400).json({ success: false, message: 'Missing resume file' });
      const targetRole = req.body.targetRole || req.body.target_role;
      const result = await CareerService.analyze(file.path, targetRole);
      return res.json({ success: true, message: 'Career analysis completed', data: result, meta: {} });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Internal error', error: String(err) });
    }
  }
}

export default CareerController;
