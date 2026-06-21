import sys
import json

context = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
target = context.get('targetRole') or context.get('role') or 'Target Role'
missing = context.get('missing', {}) or {}
projects = context.get('projects', []) or []

all_missing = []
for tier in ['critical', 'important', 'advanced', 'other']:
    all_missing.extend(missing.get(tier, []))
all_missing = list(dict.fromkeys(all_missing))
if not all_missing:
    all_missing = ['Portfolio polish', 'Interview practice', 'System design basics']

week_ranges = ['Week 1-2', 'Week 3-4', 'Week 5-6', 'Week 7-8', 'Week 9-10', 'Week 11-12']
roadmap = []
for idx, label in enumerate(week_ranges):
    focus = all_missing[idx::len(week_ranges)] or [all_missing[min(idx, len(all_missing) - 1)]]
    roadmap.append({
        'week': label,
        'focus_skills': focus[:2],
        'objectives': [f'Build fundamentals in {skill}' for skill in focus[:2]],
        'task': f'Learn {", ".join(focus[:2])} and apply it in a small project',
    })

assessment_questions = []
for skill in all_missing[:6]:
    assessment_questions.append({'skill': skill, 'type': 'MCQ', 'question': f'Which concept is most important in {skill}?'} )
    assessment_questions.append({'skill': skill, 'type': 'Scenario', 'question': f'How would you use {skill} in a {target} project?'} )

out = {
    'roadmap': roadmap,
    'weeklyTasks': [{'week': item['week'], 'task': item['task']} for item in roadmap],
    'interviewQuestions': [f'Explain how {skill} is used by a {target}.' for skill in all_missing[:8]],
    'assessmentQuestions': assessment_questions,
    'learningResources': [
        {'skill': skill, 'name': f'{skill} official docs and guided practice', 'type': 'Documentation'}
        for skill in all_missing[:8]
    ],
    'mentorPrompt': f'Guide this student toward {target} using their skill gaps: {", ".join(all_missing[:8])}.',
    'projectIdeas': projects,
}
print(json.dumps(out))
