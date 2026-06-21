import express from 'express';
import multer from 'multer';
import CareerController from '../controllers/career.controller';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.single('resume'), CareerController.analyze);
router.post('/roadmap', CareerController.roadmap);
router.post('/projects', CareerController.projects);
router.post('/roles', CareerController.roles);

export default router;
