import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import UsersController from '../controllers/users.controller';

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware as any);

router.get('/search', UsersController.search);
router.get('/:id', UsersController.getProfile);
router.get('/', UsersController.getAll);

export default router;
