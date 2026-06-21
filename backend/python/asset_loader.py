import sys
import json
from pathlib import Path
import pickle

# Usage: python asset_loader.py <project_root>
root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('.').resolve()
models_dir = root / 'models'

required = {
    # repo uses these filenames
    'roles': models_dir / 'arivium_roles.pkl',
    'career_profiles': models_dir / 'career_profiles.pkl',
    'role_skill_freq': models_dir / 'role_skill_freq.pkl',
    'embeddings': models_dir / 'arivium_role_embeddings.npy',
    'faiss': models_dir / 'arivium_faiss.index',
}

out = {
    'rolesPath': str(required['roles']),
    'careerProfilesPath': str(required['career_profiles']),
    'roleSkillFreqPath': str(required['role_skill_freq']),
    'embeddingsPath': str(required['embeddings']),
    'faissIndexPath': str(required['faiss']),
}

# Load pickles lightly to ensure they exist and are parseable
for k in ['roles', 'career_profiles', 'role_skill_freq']:
    p = required[k]
    if not p.exists():
        print(json.dumps({'error': f'missing {k} at {p}'}))
        sys.exit(2)
    try:
        with p.open('rb') as f:
            pickle.load(f)
    except Exception as e:
        print(json.dumps({'error': f'failed to load {p}: {e}'}))
        sys.exit(3)

# Ensure embeddings and faiss index exist
for k in ['embeddings', 'faissIndex']:
    if not Path(out[k + 'Path']).exists():
        print(json.dumps({'error': f'missing {k} at {out[k + "Path"]}'}))
        sys.exit(4)

print(json.dumps(out))
