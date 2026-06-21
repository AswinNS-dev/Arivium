import fs from 'fs';
import path from 'path';

class AssetLoader {
  private static instance: AssetLoader | null = null;
  public assets: Record<string, string> = {};

  private constructor() {}

  static async initialize(basePath = process.cwd()) {
    if (AssetLoader.instance) return AssetLoader.instance;
    const loader = new AssetLoader();
    const modelDir = path.resolve(basePath, 'models');

    const files = {
      roles: 'roles.pkl',
      careerProfiles: 'career_profiles.pkl',
      roleSkillFreq: 'role_skill_freq.pkl',
      embeddings: 'arivium_role_embeddings.npy',
      faissIndex: 'arivium_faiss.index',
    };

    for (const [key, fname] of Object.entries(files)) {
      const p = path.join(modelDir, fname);
      if (!fs.existsSync(p)) {
        console.warn(`[AssetLoader] Warning: asset missing: ${p}`);
      }
      loader.assets[key] = p;
    }

    AssetLoader.instance = loader;
    return loader;
  }

  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) throw new Error('AssetLoader not initialized');
    return AssetLoader.instance;
  }
}

export default AssetLoader;
