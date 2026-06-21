import sys
import json
import re
import pickle
from pathlib import Path
from collections import Counter

fp = Path(sys.argv[1]) if len(sys.argv) > 1 else None
role_skill_freq_path = Path(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] else None
career_profiles_path = Path(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] else None

TECH_SKILLS = {
    'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'HTML', 'CSS',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'NoSQL', 'GraphQL', 'REST',
    'Machine Learning', 'Deep Learning', 'AI', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Natural Language Processing', 'NLP', 'Computer Vision', 'Data Mining', 'Data Science',
    'Pandas', 'NumPy', 'R', 'Spark', 'Hadoop', 'Hive', 'Kafka', 'Big Data', 'Scala',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'Linux', 'C/C++', 'C#',
    'Tableau', 'Power BI', 'Data Warehouse', 'OOP', 'Design Patterns', 'System Design'
}
ALIASES = {
    'nlp': 'Natural Language Processing',
    'nodejs': 'Node.js',
    'node js': 'Node.js',
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'postgres': 'PostgreSQL',
    'sklearn': 'Scikit-learn',
}
STOP_SKILLS = {'A', 'I', 'IT', 'And', 'Or', 'The', 'To', 'In', 'On', 'For', 'Other'}


def load_pickle(path):
    if not path or not path.exists():
        return None
    try:
        with path.open('rb') as f:
            return pickle.load(f)
    except Exception:
        return None


def extract_text(path):
    if not path or not path.exists():
        print(json.dumps({'error': 'file not found'}))
        sys.exit(2)
    suffix = path.suffix.lower()
    if suffix == '.pdf':
        for module_name in ('pypdf', 'PyPDF2'):
            try:
                module = __import__(module_name, fromlist=['PdfReader'])
                reader = module.PdfReader(str(path))
                return '\n'.join(page.extract_text() or '' for page in reader.pages)
            except Exception:
                pass
    if suffix == '.docx':
        try:
            import docx
            document = docx.Document(str(path))
            return '\n'.join(p.text for p in document.paragraphs)
        except Exception:
            pass
    try:
        return path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return path.read_bytes().decode('latin1', errors='ignore')


def canonical(value):
    value = ' '.join(str(value or '').strip().split())
    return ALIASES.get(value.lower(), value)


def model_skill_candidates():
    candidates = set(TECH_SKILLS)
    career_profiles = load_pickle(career_profiles_path)
    if isinstance(career_profiles, dict):
        for counter in career_profiles.values():
            if isinstance(counter, Counter) or isinstance(counter, dict):
                candidates.update(counter.keys())
    role_skill_freq = load_pickle(role_skill_freq_path)
    if isinstance(role_skill_freq, dict):
        for counter in list(role_skill_freq.values())[:8000]:
            if isinstance(counter, Counter) or isinstance(counter, dict):
                candidates.update(counter.keys())
    clean = set()
    for skill in candidates:
        skill = canonical(skill)
        if not skill or skill in STOP_SKILLS:
            continue
        if len(skill) < 2 or len(skill) > 45:
            continue
        if re.fullmatch(r'[0-9\W_]+', skill):
            continue
        clean.add(skill)
    return sorted(clean, key=lambda s: (-len(s), s.lower()))


def find_skills(text):
    normalized_text = re.sub(r'\s+', ' ', text or '')
    lowered = normalized_text.lower()
    found = []
    seen = set()
    for skill in model_skill_candidates():
        key = skill.lower()
        if key in seen:
            continue
        if re.search(r'(?<![a-z0-9+#.])' + re.escape(key) + r'(?![a-z0-9+#.])', lowered, re.IGNORECASE):
            found.append(skill)
            seen.add(key)
    return found

text = extract_text(fp)
skills = find_skills(text)
print(json.dumps({'text': text, 'skills': skills[:80]}))
