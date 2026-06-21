import express from 'express';
import IntelligenceController from '../controllers/intelligence.controller';

const router = express.Router();
router.post('/resources', IntelligenceController.resources);
router.post('/activity', IntelligenceController.activity);
router.get('/profiles/:profileId', IntelligenceController.profile);
router.get('/analytics', IntelligenceController.analytics);
router.post('/challenges', IntelligenceController.challenges);
router.post('/coach', IntelligenceController.coach);

export default router;
