import { Request, Response } from 'express';
import AuthService from '../services/auth.service';

class AuthController {
  signup(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
      const user = AuthService.register(name, email, password);
      const token = AuthService.createSession(user.id);
      return res.status(201).json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email } } });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
      const user = AuthService.login(email, password);
      const token = AuthService.createSession(user.id);
      return res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email } } });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  me(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Missing auth token' });
    const user = AuthService.getUserByToken(token);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid auth token' });
    return res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email } } });
  }

  logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) AuthService.logout(token);
    return res.json({ success: true, data: { message: 'Logged out' } });
  }
}

export default new AuthController();
