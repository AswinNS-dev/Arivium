import sys
import json

missing = json.loads(sys.argv[1]) if len(sys.argv) > 1 else []

PROJECTS = {
    'SQL': ['Employee Analytics SQL Dashboard', 'Customer Churn SQL Feature Store'],
    'Machine Learning': ['Customer Churn Prediction', 'Loan Default Prediction'],
    'TensorFlow': ['Image Classifier with TensorFlow', 'Text Intent Classifier'],
    'PyTorch': ['Neural Network from PyTorch', 'Resume Skill Classifier'],
    'Natural Language Processing': ['RAG Chatbot', 'AI Interview Assistant'],
    'NLP': ['RAG Chatbot', 'AI Interview Assistant'],
    'AWS': ['Deploy ML API on AWS', 'Serverless Resume Analyzer'],
    'Docker': ['Dockerized ML Inference API', 'Full Stack App Containerization'],
    'Spark': ['Big Data Job Trend Analyzer', 'Spark ETL Pipeline'],
    'React': ['Career Dashboard Frontend', 'Assessment Portal UI'],
    'Node.js': ['Assessment API Backend', 'Resume Parser API'],
    'JavaScript': ['Interactive Skill Tracker', 'Coding Challenge Runner'],
    'TypeScript': ['Typed Career Roadmap App', 'Assessment Engine UI'],
    'REST': ['Career Mentor REST API', 'Project Recommendation API'],
    'MongoDB': ['Student Progress Tracker', 'Community Matching Backend'],
    'PostgreSQL': ['Readiness Analytics Warehouse', 'Leaderboard Service'],
    'Git': ['Portfolio CI Workflow', 'Team Project Collaboration'],
}
DEFAULTS = ['Resume Analyzer', 'Recommendation System', 'AI Mentor Chatbot', 'Skill Gap Dashboard', 'Assessment Generator']


def flatten_missing(value):
    out = []
    if isinstance(value, dict):
        for tier in ['critical', 'important', 'advanced', 'other']:
            out.extend(value.get(tier, []))
    elif isinstance(value, list):
        for item in value:
            out.extend(flatten_missing(item))
    elif isinstance(value, str):
        out.append(value)
    return out

skills = flatten_missing(missing)
projects = []
for skill in skills:
    projects.extend(PROJECTS.get(skill, [f'{skill} Practice Capstone']))
projects.extend(DEFAULTS)
print(json.dumps(list(dict.fromkeys(projects))[:8]))
