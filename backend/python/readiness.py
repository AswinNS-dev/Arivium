import sys
import json
from pathlib import Path
import pickle
from collections import Counter
import re
from difflib import get_close_matches

skills = json.loads(sys.argv[1]) if len(sys.argv) > 1 else []
target = sys.argv[2] if len(sys.argv) > 2 else ''
role_skill_freq_path = sys.argv[3] if len(sys.argv) > 3 else ''
career_profiles_path = sys.argv[4] if len(sys.argv) > 4 else ''

TECH_SKILLS = {
    "Python", "SQL", "Machine Learning", "TensorFlow", "PyTorch", "Spark", "Hadoop",
    "AWS", "Docker", "Kubernetes", "Java", "JavaScript", "TypeScript", "React",
    "Node.js", "Scala", "C/C++", "Natural Language Processing", "Data Mining",
    "Computer Vision", "Big Data", "AI", "NoSQL", "Kafka", "Hive", "R",
    "HTML", "CSS", "MongoDB", "PostgreSQL", "MySQL", "Express", "REST", "GraphQL",
    "Git", "Linux", "Azure", "GCP", "Pandas", "NumPy", "Scikit-learn", "Deep Learning"
}

TIER1 = {
    "Python", "Machine Learning", "SQL", "TensorFlow", "PyTorch", "JavaScript",
    "TypeScript", "React", "Node.js", "REST", "AI", "Natural Language Processing"
}
TIER2 = {"Spark", "AWS", "Docker", "Kubernetes", "Kafka", "Hadoop", "MongoDB", "PostgreSQL", "Git", "Deep Learning"}
TIER3 = {"Scala", "Hive", "Big Data", "R", "NoSQL", "Computer Vision", "Data Mining", "Azure", "GCP"}

CURATED_ROLE_PROFILES = {
    'full stack engineer': Counter({
        'JavaScript': 20, 'TypeScript': 18, 'React': 18, 'Node.js': 16, 'REST': 14,
        'SQL': 12, 'MongoDB': 10, 'PostgreSQL': 10, 'HTML': 9, 'CSS': 9,
        'Git': 8, 'Docker': 7, 'AWS': 6, 'Python': 5, 'GraphQL': 5, 'Express': 5,
    }),
    'full stack developer': Counter({
        'JavaScript': 20, 'TypeScript': 18, 'React': 18, 'Node.js': 16, 'REST': 14,
        'SQL': 12, 'MongoDB': 10, 'PostgreSQL': 10, 'HTML': 9, 'CSS': 9,
        'Git': 8, 'Docker': 7, 'AWS': 6, 'Python': 5, 'GraphQL': 5, 'Express': 5,
    }),
    'fullstack engineer': Counter({
        'JavaScript': 20, 'TypeScript': 18, 'React': 18, 'Node.js': 16, 'REST': 14,
        'SQL': 12, 'MongoDB': 10, 'PostgreSQL': 10, 'HTML': 9, 'CSS': 9,
        'Git': 8, 'Docker': 7, 'AWS': 6, 'Python': 5, 'GraphQL': 5, 'Express': 5,
    }),
}

ROLE_ALIASES = {
    "python ai engineer": "AI Engineer",
    "ai engineer": "AI Engineer",
    "artificial intelligence engineer": "AI Engineer",
    "ml engineer": "Machine Learning Engineer",
    "machine learning engineer": "Machine Learning Engineer",
    "data scientist": "Data Scientist",
    "full stack": "Software Engineer",
    "fullstack": "Software Engineer",
    "full stack developer": "Software Engineer",
    "full stack engineer": "Software Engineer",
    "software engineer": "Software Engineer",
    "frontend developer": "Software Engineer",
    "backend developer": "Software Engineer",
}


def load_pickle(path_value, default):
    try:
        if not path_value:
            return default
        path = Path(path_value)
        if not path.exists():
            return default
        with path.open('rb') as f:
            return pickle.load(f)
    except Exception:
        return default


def clean_text(value):
    value = str(value or '').lower()
    value = re.sub(r'[^a-z0-9+#.\s]', ' ', value)
    return ' '.join(value.split())


def normalize_skill(value):
    value = str(value or '').strip()
    return ' '.join(value.split())


def canonical_skill_map(*counters):
    mapping = {}
    for counter in counters:
        if not isinstance(counter, Counter):
            counter = Counter(counter or {})
        for skill in counter.keys():
            normalized = clean_text(skill)
            if normalized and normalized not in mapping:
                mapping[normalized] = normalize_skill(skill)
    for skill in TECH_SKILLS:
        mapping.setdefault(clean_text(skill), skill)
    return mapping


def resolve_profile(target_role, career_profiles, role_skill_freq):
    normalized_target = clean_text(target_role)
    alias = ROLE_ALIASES.get(normalized_target)

    if normalized_target in CURATED_ROLE_PROFILES:
        return target_role or normalized_target, Counter(CURATED_ROLE_PROFILES[normalized_target])

    if normalized_target == 'full stack':
        return target_role or 'Full Stack Engineer', Counter(CURATED_ROLE_PROFILES['full stack engineer'])

    if alias and alias in career_profiles:
        return alias, Counter(career_profiles[alias])

    for role, counter in career_profiles.items():
        if clean_text(role) == normalized_target:
            return role, Counter(counter)

    profile_keys = list(career_profiles.keys())
    profile_lookup = {clean_text(role): role for role in profile_keys}
    close = get_close_matches(normalized_target, list(profile_lookup.keys()), n=1, cutoff=0.74)
    if close:
        role = profile_lookup[close[0]]
        return role, Counter(career_profiles[role])

    role_counter = Counter()
    target_tokens = set(normalized_target.split())
    for role, counter in role_skill_freq.items():
        clean_role = clean_text(role)
        if not clean_role or not counter:
            continue
        role_tokens = set(clean_role.split())
        if normalized_target in clean_role or clean_role in normalized_target or len(target_tokens & role_tokens) >= min(2, len(target_tokens)):
            role_counter.update(counter)

    if role_counter:
        return target_role or 'Custom Role', role_counter

    fallback = alias if alias in career_profiles else 'Software Engineer'
    if fallback in career_profiles:
        return fallback, Counter(career_profiles[fallback])

    if career_profiles:
        role = next(iter(career_profiles.keys()))
        return role, Counter(career_profiles[role])

    return target_role or 'Unknown Role', Counter()


def calculate_weighted_readiness(target_role, student_skills, career_profiles, role_skill_freq, top_skills=20):
    resolved_role, profile = resolve_profile(target_role, career_profiles, role_skill_freq)
    required = profile.most_common(top_skills)

    skill_name_map = canonical_skill_map(profile)
    normalized_student = {clean_text(skill) for skill in student_skills if clean_text(skill)}

    total_weight = sum(freq for _, freq in required)
    matched_weight = 0
    matched = []
    missing = []

    for skill, freq in required:
        normalized_required = clean_text(skill)
        canonical = skill_name_map.get(normalized_required, normalize_skill(skill))
        if normalized_required in normalized_student:
            matched_weight += freq
            matched.append(canonical)
        else:
            missing.append(canonical)

    readiness = (matched_weight / total_weight) * 100 if total_weight else 0

    def unique(values):
        seen = set()
        out = []
        for value in values:
            key = clean_text(value)
            if key and key not in seen:
                out.append(value)
                seen.add(key)
        return out

    critical = [s for s in missing if s in TIER1]
    important = [s for s in missing if s in TIER2]
    advanced = [s for s in missing if s in TIER3]
    other = [s for s in missing if s not in TIER1 and s not in TIER2 and s not in TIER3]

    return {
        'role': resolved_role,
        'targetRole': target_role,
        'requiredSkills': [normalize_skill(skill) for skill, _ in required],
        'readinessScore': round(readiness, 2),
        'matchedSkills': unique(matched),
        'missingSkills': {
            'critical': unique(critical),
            'important': unique(important),
            'advanced': unique(advanced),
            'other': unique(other),
        },
    }


role_skill_freq = load_pickle(role_skill_freq_path, {})
career_profiles = load_pickle(career_profiles_path, {})

if not isinstance(role_skill_freq, dict):
    role_skill_freq = {}
if not isinstance(career_profiles, dict):
    career_profiles = {}

print(json.dumps(calculate_weighted_readiness(target, skills, career_profiles, role_skill_freq)))
