import sys
import json
import pickle
import os
import re
from pathlib import Path
from difflib import SequenceMatcher
import numpy as np

faiss_idx = Path(sys.argv[1])
emb_path = Path(sys.argv[2])
query = sys.argv[3] if len(sys.argv) > 3 else ''
topk = int(sys.argv[4]) if len(sys.argv) > 4 else 5
roles_path = Path(sys.argv[5]) if len(sys.argv) > 5 and sys.argv[5] else faiss_idx.with_name('arivium_roles.pkl')


def load_roles():
    try:
        with roles_path.open('rb') as f:
            return pickle.load(f)
    except Exception:
        return []


def clean(value):
    value = str(value or '').lower()
    value = re.sub(r'[^a-z0-9+#.\s]', ' ', value)
    return ' '.join(value.split())


def token_fallback(roles):
    query_clean = clean(query)
    q_tokens = set(query_clean.split())
    scored = []
    curated = ['AI Engineer', 'AI ML Engineer', 'Machine Learning Engineer', 'Artificial Intelligence Engineer', 'Data Scientist', 'Software Engineer', 'Full Stack Engineer']
    role_pool = list(roles) + [r for r in curated if r not in roles]
    for role in role_pool:
        role_clean = clean(role)
        if not role_clean:
            continue
        r_tokens = set(role_clean.split())
        overlap = len(q_tokens & r_tokens)
        contains = 2 if query_clean and (query_clean in role_clean or role_clean in query_clean) else 0
        ratio = SequenceMatcher(None, query_clean, role_clean).ratio()
        score = overlap * 20 + contains * 15 + ratio * 25
        if score > 8:
            scored.append((role, score))
    scored.sort(key=lambda item: item[1], reverse=True)
    out = []
    seen = set()
    for role, score in scored:
        key = clean(role)
        if key in seen:
            continue
        out.append({'role': role, 'score': round(float(score), 3), 'source': 'role-metadata'})
        seen.add(key)
        if len(out) >= topk:
            break
    return out

roles = load_roles()

if os.getenv('ARIVIUM_ENABLE_BGE_FAISS', '').lower() in {'1', 'true', 'yes'}:
    try:
        os.environ.setdefault('HF_HUB_OFFLINE', '1')
        import faiss
        from sentence_transformers import SentenceTransformer
        if faiss_idx.exists() and emb_path.exists() and roles:
            model = SentenceTransformer('BAAI/bge-small-en-v1.5', local_files_only=True)
            query_embedding = model.encode([query], normalize_embeddings=True).astype('float32')
            index = faiss.read_index(str(faiss_idx))
            scores, indices = index.search(query_embedding, topk)
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if 0 <= int(idx) < len(roles):
                    results.append({'role': roles[int(idx)], 'score': round(float(score), 4), 'source': 'faiss-bge'})
            if results:
                print(json.dumps(results))
                sys.exit(0)
    except Exception:
        pass

print(json.dumps(token_fallback(roles)))
