import fs from 'fs';
import path from 'path';
import { LearningProfile } from './types';

class ActivityStore {
  private readonly dataDir = path.resolve(__dirname, '../../.data');
  private readonly dataFile = path.join(this.dataDir, 'learning-profiles.json');

  private readAll(): Record<string, LearningProfile> {
    if (!fs.existsSync(this.dataFile)) return {};
    try {
      return JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
    } catch {
      return {};
    }
  }

  private writeAll(profiles: Record<string, LearningProfile>) {
    fs.mkdirSync(this.dataDir, { recursive: true });
    const temporary = `${this.dataFile}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(profiles, null, 2), 'utf8');
    fs.renameSync(temporary, this.dataFile);
  }

  get(profileId: string): LearningProfile | null {
    return this.readAll()[profileId] || null;
  }

  save(profile: LearningProfile): LearningProfile {
    const profiles = this.readAll();
    profiles[profile.id] = profile;
    this.writeAll(profiles);
    return profile;
  }

  list(): LearningProfile[] {
    return Object.values(this.readAll());
  }
}

export default new ActivityStore();
