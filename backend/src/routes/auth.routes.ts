import express from 'express';
import AuthController from '../controllers/auth.controller';

const router = express.Router();

// Email/password auth (fallback)
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);

// Google OAuth
router.get('/google', AuthController.googleSignIn);
router.get('/callback', AuthController.authCallback);

// Session management
router.get('/me', AuthController.me);
router.post('/logout', AuthController.logout);

export default router;
