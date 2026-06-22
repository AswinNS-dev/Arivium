"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const supabase_1 = require("../config/supabase");
/**
 * Middleware that validates the Supabase JWT from the Authorization header.
 * On success, attaches `req.user` with `{ id, email, name }`.
 */
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Missing auth token' });
    }
    try {
        const { data, error } = await supabase_1.supabaseAdmin.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ success: false, message: 'Invalid or expired auth token' });
        }
        const user = data.user;
        // Fetch profile name from our profiles table
        const { data: profile } = await supabase_1.supabaseAdmin
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
        req.user = {
            id: user.id,
            email: user.email ?? '',
            name: profile?.name ?? user.user_metadata?.full_name ?? user.email ?? '',
        };
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
}
