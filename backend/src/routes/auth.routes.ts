import express from 'express';
import AuthController from '../controllers/auth.controller';

const router = express.Router();
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/me', AuthController.me);
router.post('/logout', AuthController.logout);

export default router;
