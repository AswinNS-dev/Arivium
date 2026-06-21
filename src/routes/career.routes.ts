import { Router } from 'express';
import CareerController from '../controllers/career.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'tmp/' });

router.post('/analyze', upload.single('resume'), CareerController.analyze);

// Roadmap, projects, roles endpoints can be added similarly and call into CareerService
router.post('/roadmap', (req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.post('/projects', (req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.post('/roles', (req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));

export default router;
