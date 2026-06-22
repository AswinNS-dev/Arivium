"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
class AuthController {
    /**
     * POST /signup — Register with email/password (fallback)
     */
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Name, email and password are required' });
            }
            const user = await auth_service_1.default.register(name, email, password);
            // Sign in immediately to get a session token
            const session = await auth_service_1.default.login(email, password);
            return res.status(201).json({
                success: true,
                data: {
                    token: session.session?.access_token,
                    user: {
                        id: user?.id,
                        name,
                        email: user?.email,
                    },
                },
            });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    /**
     * POST /login — Sign in with email/password (fallback)
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }
            const data = await auth_service_1.default.login(email, password);
            return res.json({
                success: true,
                data: {
                    token: data.session?.access_token,
                    refreshToken: data.session?.refresh_token,
                    user: {
                        id: data.user?.id,
                        name: data.user?.user_metadata?.full_name ?? '',
                        email: data.user?.email,
                    },
                },
            });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    /**
     * GET /google — Initiate Google OAuth sign-in
     */
    async googleSignIn(req, res) {
        try {
            const redirectTo = req.query.redirectTo || `${req.protocol}://${req.get('host')}/api/v1/auth/callback`;
            const data = await auth_service_1.default.signInWithGoogle(redirectTo);
            return res.json({
                success: true,
                data: { url: data.url },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * GET /callback — Handle OAuth callback (exchange code for session)
     */
    async authCallback(req, res) {
        try {
            const code = req.query.code;
            if (!code) {
                return res.status(400).json({ success: false, message: 'Authorization code is required' });
            }
            const data = await auth_service_1.default.handleAuthCallback(code);
            // Set HttpOnly cookie with access token
            const token = data.session?.access_token;
            const refreshToken = data.session?.refresh_token;
            if (token) {
                res.cookie('auth_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
                });
            }
            if (refreshToken) {
                res.cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                });
            }
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            // Redirect to frontend home page (or dashboard)
            return res.redirect(`${frontendUrl}`);
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    /**
     * GET /me — Get the current authenticated user
     */
    async me(req, res) {
        const authHeader = req.headers.authorization;
        const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Missing auth token' });
        }
        try {
            const user = await auth_service_1.default.getUser(token);
            return res.json({ success: true, data: { user } });
        }
        catch (error) {
            return res.status(401).json({ success: false, message: error.message });
        }
    }
    /**
     * POST /logout — Sign out
     */
    async logout(req, res) {
        const authHeader = req.headers.authorization;
        const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;
        if (token) {
            try {
                await auth_service_1.default.logout(token);
            }
            catch {
                // Ignore logout errors
            }
        }
        return res.json({ success: true, data: { message: 'Logged out' } });
    }
}
exports.default = new AuthController();
