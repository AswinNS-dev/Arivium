#!/usr/bin/env python3
import argparse
import os
import pickle
import json
import sys
import re
from collections import Counter

from difflib import get_close_matches

try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None

try:
    import google.generativeai as genai
except Exception:
    genai = None

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if genai and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception:
        pass


def load_pickle(name):
    p = os.path.join(MODELS_DIR, name)
    if not os.path.exists(p):
        return None
    with open(p, 'rb') as f:
        return pickle.load(f)


def extract_text(pdf_path):
    # prefer PyMuPDF if available
    if fitz and pdf_path.lower().endswith('.pdf'):
        try:
            doc = fitz.open(pdf_path)
            text = ''
            for page in doc:
                text += page.get_text()
            return text
        except Exception:
            pass

    # fallback simple read
    try:
        with open(pdf_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return ''


# Load assets once
_ROLE_SKILL_FREQ = None
_CAREER_PROFILES = None
_ROLES = None
_TECH_SKILLS = None
_PROJECT_IDEAS = None
_ROADMAP_DB = None
_TIER1 = None
_TIER2 = None
_TIER3 = None


def ensure_assets_loaded():
    global _ROLE_SKILL_FREQ, _CAREER_PROFILES, _ROLES
    global _TECH_SKILLS, _PROJECT_IDEAS, _ROADMAP_DB
    global _TIER1, _TIER2, _TIER3

    if _ROLE_SKILL_FREQ is None:
        _ROLE_SKILL_FREQ = load_pickle('role_skill_freq.pkl') or {}
    if _CAREER_PROFILES is None:
        _CAREER_PROFILES = load_pickle('career_profiles.pkl') or {}
    if _ROLES is None:
        # roles may be saved as arivium_roles.pkl or roles.pkl
        _ROLES = load_pickle('roles.pkl') or load_pickle('arivium_roles.pkl') or []

    # static constants from notebook
    if _TECH_SKILLS is None:
        _TECH_SKILLS = {
            "Python",
            "SQL",
            "Machine Learning",
            "TensorFlow",
            "PyTorch",
            "Spark",
            "Hadoop",
            "AWS",
            "Docker",
            "Kubernetes",
            "Java",
            "Scala",
            "C/C++",
            "Natural Language Processing",
            "Data Mining",
            "Computer Vision",
            "Big Data",
            "AI",
            "NoSQL",
            "Kafka",
            "Hive",
            "R"
        }

    if _PROJECT_IDEAS is None:
        _PROJECT_IDEAS = {
            "Python": [
                "Build a web scraper for data collection",
                "Develop a Flask/Django web application",
                "Create a data analysis tool with Pandas and NumPy"
            ],
            "SQL": [
                "Design and optimize a relational database schema",
                "Perform complex data aggregations and reporting",
                "Develop stored procedures and triggers for a database"
            ],
            "Machine Learning": [
                "Implement a sentiment analysis model using scikit-learn",
                "Build a predictive model for customer churn",
                "Develop a recommendation system"
            ],
            "TensorFlow": [
                "Create a neural network for image classification (e.g., MNIST)",
                "Build a custom object detection model",
                "Implement a sequence-to-sequence model with Transformers"
            ],
            "Natural Language Processing": [
                "Develop a text summarization tool",
                "Build a RAG (Retrieval-Augmented Generation) chatbot",
                "Create a named entity recognition (NER) system"
            ],
            "AWS": [
                "Deploy a serverless web application using AWS Lambda and API Gateway",
                "Set up a data lake on S3 with Glue and Athena",
                "Automate infrastructure with CloudFormation"
            ]
        }

    if _ROADMAP_DB is None:
        _ROADMAP_DB = {
            "Python": ["Python Basics", "OOP", "NumPy", "Pandas"],
            "Machine Learning": ["Regression", "Classification", "Clustering", "Feature Engineering"],
            "TensorFlow": ["Neural Networks", "CNN", "Transformers"],
            "Natural Language Processing": ["Tokenization", "Embeddings", "Transformers", "RAG"],
            "AWS": ["S3", "EC2", "Lambda"]
        }

    if _TIER1 is None:
        _TIER1 = {"Python", "Machine Learning", "SQL", "TensorFlow", "Natural Language Processing"}
    if _TIER2 is None:
        _TIER2 = {"Spark", "AWS", "Docker", "Kafka", "Hadoop"}
    if _TIER3 is None:
        _TIER3 = {"Scala", "Hive", "Big Data", "R"}


def calculate_weighted_readiness(target_role, student_skills, top_skills=20):
    ensure_assets_loaded()
    # career_profiles entries are Counter-like
    profiles = _CAREER_PROFILES
    if target_role not in profiles:
        # fallback: try fuzzy match
        matches = get_close_matches(target_role, list(profiles.keys()), n=1, cutoff=0.5)
        if matches:
            target_role = matches[0]
        else:
            return {
                "readiness_score": 0.0,
                "missing_skills": {"critical": [], "important": [], "advanced": [], "other": []}
            }

    skills = profiles[target_role].most_common(top_skills) if hasattr(profiles[target_role], 'most_common') else list(profiles[target_role].items())
    total_weight = sum(freq for _, freq in skills)

    matched_weight = 0
    missing_skills_list = []

    for skill, freq in skills:
        if skill in student_skills:
            matched_weight += freq
        else:
            missing_skills_list.append(skill)

    readiness = (matched_weight / total_weight) * 100 if total_weight > 0 else 0

    critical_missing = [s for s in missing_skills_list if s in _TIER1]
    important_missing = [s for s in missing_skills_list if s in _TIER2]
    advanced_missing = [s for s in missing_skills_list if s in _TIER3]
    other_missing = [s for s in missing_skills_list if s not in _TIER1 and s not in _TIER2 and s not in _TIER3]

    result = {
        "readiness_score": round(readiness, 2),
        "missing_skills": {
            "critical": critical_missing,
            "important": important_missing,
            "advanced": advanced_missing,
            "other": other_missing
        }
    }
    return result


def generate_roadmap(missing_skills):
    ensure_assets_loaded()
    recommended_projects = []
    for skill in missing_skills:
        if skill in _PROJECT_IDEAS:
            recommended_projects.extend(_PROJECT_IDEAS[skill])
    return list(dict.fromkeys(recommended_projects))


def analyze_student(pdf_path, target_role, top_skills=20):
    ensure_assets_loaded()
    resume_text = extract_text(pdf_path)

    # Extract skills by keyword matching against TECH_SKILLS
    extracted_student_skills = set()
    for skill in _TECH_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', resume_text, re.IGNORECASE):
            extracted_student_skills.add(skill)

    readiness_result = calculate_weighted_readiness(target_role, list(extracted_student_skills), top_skills=top_skills)

    all_missing_skills = []
    for tier_skills in readiness_result["missing_skills"].values():
        all_missing_skills.extend(tier_skills)

    recommended_projects = generate_roadmap(all_missing_skills)

    final_result = {
        "goal_role": target_role,
        "readiness_score": readiness_result["readiness_score"],
        "matched_skills": list(extracted_student_skills),
        "missing_skills": readiness_result["missing_skills"],
        "recommended_projects": recommended_projects
    }
    return final_result


def recommend_roles(student_skills):
    ensure_assets_loaded()
    results = []
    for role_name in _CAREER_PROFILES.keys():
        readiness_info = calculate_weighted_readiness(role_name, student_skills)
        score = readiness_info["readiness_score"]
        results.append((role_name, score))
    return sorted(results, key=lambda x: x[1], reverse=True)


def recommend_skills(goal_role, search_k=100, top_skills=20):
    ensure_assets_loaded()
    # Try to use FAISS and embeddings if available
    try:
        import numpy as np
        import faiss
        roles = _ROLES if isinstance(_ROLES, list) else list(_ROLES)
        emb_path = os.path.join(MODELS_DIR, 'arivium_role_embeddings.npy')
        idx_path = os.path.join(MODELS_DIR, 'arivium_faiss.index')
        if os.path.exists(emb_path) and os.path.exists(idx_path):
            role_embeddings = np.load(emb_path)
            index = faiss.read_index(idx_path)
            # Need a text->embedding model; notebook used sentence-transformers model BAAI/bge-small-en-v1.5
            try:
                from sentence_transformers import SentenceTransformer
                model = SentenceTransformer('BAAI/bge-small-en-v1.5')
                q_emb = model.encode([goal_role], normalize_embeddings=True)
                scores, indices = index.search(q_emb.astype('float32'), search_k)
                skill_counter = Counter()
                matched_roles = []
                for score, idx in zip(scores[0], indices[0]):
                    role = roles[idx]
                    if role in _ROLE_SKILL_FREQ:
                        role_skills = _ROLE_SKILL_FREQ[role]
                        matched_roles.append((role, float(score)))
                        skill_counter.update(role_skills)
                return {"matched_roles": matched_roles[:10], "skills": skill_counter.most_common(top_skills)}
            except Exception:
                pass
    except Exception:
        pass

    # Fallback: aggregate from role_skill_freq for roles matching keyword
    matched = []
    skill_counter = Counter()
    for role in _ROLE_SKILL_FREQ:
        if goal_role.lower() in role.lower():
            matched.append(role)
            skill_counter.update(_ROLE_SKILL_FREQ[role])
    return {"matched_roles": [(r, 1.0) for r in matched], "skills": skill_counter.most_common(top_skills)}


def generate_career_coaching_output_with_gemini(student_analysis):
    # Use Gemini via google.generativeai if configured
    if genai is None:
        return {"error": "Gemini library not installed"}

    if GEMINI_API_KEY is None:
        return {"error": "GEMINI_API_KEY not set in environment"}

    prompt = f"""
You are an expert career coach for AI/ML professionals. Your task is to provide a comprehensive career coaching output for a student based on their skills analysis. The output should be in JSON format.

Student's Goal: {student_analysis.get('goal_role')}
Student's Readiness Score: {student_analysis.get('readiness_score')}
Matched Skills: {', '.join(student_analysis.get('matched_skills', []))}
Missing Skills: {json.dumps(student_analysis.get('missing_skills', {}))}
Recommended Projects: {', '.join(student_analysis.get('recommended_projects', []))}

Produce a JSON object with keys: 12_week_roadmap, project_ideas, interview_questions, learning_resources.
"""

    model = genai.GenerativeModel('gemini-2.5') if hasattr(genai, 'GenerativeModel') else None
    try:
        if model:
            response = model.generate_content(prompt)
            text = getattr(response, 'text', None) or response
            # try parse JSON
            try:
                # extract JSON from response.text if wrapped in markdown
                import re
                m = re.search(r'```json\n([\s\S]*?)\n```', str(text))
                if m:
                    payload = json.loads(m.group(1))
                else:
                    payload = json.loads(str(text))
                return payload
            except Exception:
                return {"error": "Failed to parse Gemini response", "raw": str(text)}
        else:
            return {"error": "Gemini model interface not found"}
    except Exception as e:
        return {"error": f"Gemini call failed: {e}"}


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='cmd')

    p_extract = sub.add_parser('extract_text')
    p_extract.add_argument('--path', required=True)

    p_search = sub.add_parser('search_roles')
    p_search.add_argument('--query', required=True)
    p_search.add_argument('--topk', type=int, default=5)

    p_read = sub.add_parser('readiness')
    p_read.add_argument('--role', required=True)
    p_read.add_argument('--skills', required=True)

    p_an = sub.add_parser('analyze')
    p_an.add_argument('--path', required=False)
    p_an.add_argument('--text', required=False)
    p_an.add_argument('--target_role')

    p_recommend = sub.add_parser('recommend_skills')
    p_recommend.add_argument('--role', required=True)

    p_gemini = sub.add_parser('gemini')
    p_gemini.add_argument('--input', required=True)

    args = parser.parse_args()

    ensure_assets_loaded()

    if args.cmd == 'extract_text':
        text = extract_text(args.path)
        print(json.dumps({'text': text}))
        return

    if args.cmd == 'search_roles':
        # simple substring match from saved roles
        roles_list = _ROLES if isinstance(_ROLES, list) else list(_ROLES)
        q = args.query.lower()
        candidates = []
        for r in roles_list:
            name = r if isinstance(r, str) else r.get('role', '')
            if q in name.lower() or get_close_matches(q, [name], n=1, cutoff=0.6):
                candidates.append({'role': name, 'score': 50.0})
        print(json.dumps(candidates[:args.topk]))
        return

    if args.cmd == 'readiness':
        role = args.role
        skills = json.loads(args.skills)
        out = calculate_weighted_readiness(role, skills)
        print(json.dumps(out))
        return

    if args.cmd == 'recommend_skills':
        out = recommend_skills(args.role)
        print(json.dumps(out))
        return

    if args.cmd == 'analyze':
        text = None
        if args.path:
            text = extract_text(args.path)
        elif args.text:
            text = args.text
        else:
            print(json.dumps({'error': 'either --path or --text required'}))
            return

        target = args.target_role
        # If passed text, call analyze logic by writing to a temp file path for reuse of extract_text semantics
        if args.path:
            result = analyze_student(args.path, target)
        else:
            # write temp file
            tmp = os.path.join('/tmp', 'resume_temp.txt') if os.name != 'nt' else os.path.join(os.getcwd(), 'resume_temp.txt')
            with open(tmp, 'w', encoding='utf-8') as f:
                f.write(text)
            result = analyze_student(tmp, target)
            try:
                os.remove(tmp)
            except Exception:
                pass

        print(json.dumps(result))
        return

    if args.cmd == 'gemini':
        payload = json.loads(args.input)
        out = generate_career_coaching_output_with_gemini(payload)
        print(json.dumps(out))
        return

    parser.print_help()


if __name__ == '__main__':
    main()
