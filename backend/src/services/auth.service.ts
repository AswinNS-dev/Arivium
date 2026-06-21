import path from 'path';
import fs from 'fs';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStore {
  [email: string]: AuthUser;
}

class AuthService {
  private usersFile = path.join(__dirname, '../../data/users.json');
  private sessions: Record<string, string> = {};

  private loadUsers(): UserStore {
    try {
      if (!fs.existsSync(this.usersFile)) {
        this.saveUsers({});
      }
      const raw = fs.readFileSync(this.usersFile, 'utf8');
      return JSON.parse(raw) as UserStore;
    } catch {
      return {};
    }
  }

  private saveUsers(users: UserStore) {
    const directory = path.dirname(this.usersFile);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2), 'utf8');
  }

  register(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = this.loadUsers();
    if (users[normalizedEmail]) {
      throw new Error('User already exists');
    }
    const user: AuthUser = {
      id: normalizedEmail.replace(/[^a-z0-9._-]+/g, '-'),
      name: name.trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users[normalizedEmail] = user;
    this.saveUsers(users);
    return user;
  }

  login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = this.loadUsers();
    const user = users[normalizedEmail];
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }
    return user;
  }

  createSession(userId: string) {
    const token = `${userId}-${Math.random().toString(36).slice(2, 12)}`;
    this.sessions[token] = userId;
    return token;
  }

  getUserByToken(token: string) {
    const userId = this.sessions[token];
    if (!userId) return null;
    const users = this.loadUsers();
    return Object.values(users).find((user) => user.id === userId) || null;
  }

  logout(token: string) {
    delete this.sessions[token];
  }
}

export default new AuthService();
