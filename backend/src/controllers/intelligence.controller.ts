import { Request, Response } from 'express';
import AdaptiveLearningService from '../intelligence/AdaptiveLearningService';
import GroqIntelligenceService from '../intelligence/GroqIntelligenceService';

function gaps(value: any): string[] {
  if (Array.isArray(value)) return value;
  return ['critical', 'important', 'advanced', 'other'].flatMap((tier) => value?.[tier] || []);
}

function context(body: any) {
  return {
    profileId: String(body.profileId || ''),
    role: String(body.role || ''),
    readiness: Number(body.readiness || 0),
    missingSkills: gaps(body.missingSkills),
    roadmap: body.roadmap || [],
  };
}

class IntelligenceController {
  async resources(req: Request, res: Response) {
    try {
      const body = req.body;
      if (!body.profileId || !body.role || !body.skill || !body.week || !body.mastery) return res.status(400).json({ success: false, message: 'profileId, role, skill, mastery and week are required' });
      AdaptiveLearningService.ensureProfile(context(body));
      const data = await GroqIntelligenceService.resources({ ...body, readiness: Number(body.readiness || 0), missingSkills: gaps(body.missingSkills) });
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  activity(req: Request, res: Response) {
    try {
      if (!req.body.event?.type || !req.body.event?.skill) return res.status(400).json({ success: false, message: 'event type and skill are required' });
      return res.json({ success: true, data: AdaptiveLearningService.record(context(req.body), req.body.event) });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  profile(req: Request, res: Response) {
    const data = AdaptiveLearningService.get(req.params.profileId);
    return data ? res.json({ success: true, data }) : res.status(404).json({ success: false, message: 'Learning profile not found' });
  }

  analytics(req: Request, res: Response) {
    return res.json({ success: true, data: AdaptiveLearningService.analytics(req.query.profileId as string | undefined) });
  }

  async challenges(req: Request, res: Response) {
    try {
      const profile = AdaptiveLearningService.ensureProfile(context(req.body));
      return res.json({ success: true, data: await GroqIntelligenceService.challenges({ ...req.body, profile }) });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async coach(req: Request, res: Response) {
    try {
      if (!req.body.question) return res.status(400).json({ success: false, message: 'question is required' });
      const profile = AdaptiveLearningService.ensureProfile(context(req.body));
      return res.json({ success: true, data: await GroqIntelligenceService.coach({ ...req.body, profile }, req.body.question) });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}

export default new IntelligenceController();
