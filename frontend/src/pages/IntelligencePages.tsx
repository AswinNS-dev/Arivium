import { useEffect, useState } from 'react';
import { ExternalLink, Send, Sparkles } from 'lucide-react';
import { Button } from '../components';
import { flattenMissing, getAnalysis, getProfileId, intelligenceRequest, learningContext, recordActivity } from '../services/intelligenceApi';
import styles from './IntelligencePages.module.css';

interface Resource { type: string; title: string; url: string; reason?: string }
interface Challenge { title: string; skill: string; difficulty: string; brief: string; deliverables: string[]; successCriteria: string[]; estimatedHours: number }
interface Topic { topic: string; progress: number; mastery: string; minutesSpent: number; resourceClicks: number }
interface Profile { currentReadiness: number; readinessHistory: Array<{ score: number; at: string }>; topics: Topic[] }
interface Analytics { students: number; resourceClicks: number; learningMinutes: number; assessmentsCompleted: number; averageAssessmentScore: number; challengesCompleted: number; projectsCompleted: number; averageReadiness: number; profiles: Profile[] }

function PageHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return <header className={styles.header}><div><h1>{title}</h1><p>{subtitle}</p></div>{children}</header>;
}

export function ResourceIntelligencePage() {
  const analysis = getAnalysis();
  const skills = flattenMissing(analysis?.missingSkills);
  const [skill, setSkill] = useState(skills[0] || 'Career fundamentals');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true); setError('');
    try {
      const step = (analysis?.roadmap?.roadmap || []).find((item: { focus_skills?: string[] }) => item.focus_skills?.includes(skill));
      const data = await intelligenceRequest<{ resources: Resource[] }>('/resources', { method: 'POST', body: JSON.stringify({ ...learningContext(), skill, mastery: 'Beginner', week: step?.week || 'Current week' }) });
      setResources(data.resources);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not generate resources'); }
    finally { setLoading(false); }
  };

  return <div className={styles.page}>
    <PageHeader title="Resource Intelligence" subtitle="Recommendations adapt to your role, current gap, roadmap position, and mastery.">
      <div className={styles.toolbar}><select className={styles.select} value={skill} onChange={(event) => setSkill(event.target.value)}>{skills.map((item: string) => <option key={item}>{item}</option>)}</select><Button onClick={generate} isLoading={loading} leftIcon={<Sparkles size={16} />}>Generate</Button></div>
    </PageHeader>
    {error && <div className={styles.error}>{error}</div>}
    <div className={styles.grid}>{resources.map((resource) => <article className={styles.card} key={`${resource.type}-${resource.url}`}><span className={styles.type}>{resource.type}</span><h3>{resource.title}</h3><p className={styles.muted}>{resource.reason}</p><Button variant="outline" leftIcon={<ExternalLink size={16} />} onClick={() => { window.open(resource.url, '_blank', 'noopener,noreferrer'); void recordActivity({ type: 'resource_opened', skill, resourceUrl: resource.url }); }}>Open Resource</Button></article>)}</div>
  </div>;
}

export function DynamicChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const generate = async () => { setLoading(true); setError(''); try { const data = await intelligenceRequest<{ challenges: Challenge[] }>('/challenges', { method: 'POST', body: JSON.stringify(learningContext()) }); setChallenges(data.challenges); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not generate challenges'); } finally { setLoading(false); } };
  return <div className={styles.page}><PageHeader title="Adaptive Challenges" subtitle="Groq generates portfolio work from your current gaps and readiness."><Button onClick={generate} isLoading={loading} leftIcon={<Sparkles size={16} />}>Generate Challenges</Button></PageHeader>{error && <div className={styles.error}>{error}</div>}<div className={styles.grid}>{challenges.map((item) => <article className={styles.card} key={item.title}><span className={styles.type}>{item.difficulty} · {item.estimatedHours}h</span><h3>{item.title}</h3><p>{item.brief}</p><p className={styles.muted}>{item.deliverables.join(' · ')}</p><Button variant="outline" onClick={() => void recordActivity({ type: 'challenge_completed', skill: item.skill, completed: true })}>Mark Complete</Button></article>)}</div></div>;
}

export function CareerCoachPage() {
  const [question, setQuestion] = useState('What should I focus on this week?');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ask = async () => { setLoading(true); setError(''); try { const data = await intelligenceRequest<{ answer: string }>('/coach', { method: 'POST', body: JSON.stringify({ ...learningContext(), question }) }); setAnswer(data.answer); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Coach is unavailable'); } finally { setLoading(false); } };
  return <div className={styles.page}><PageHeader title="Career Coach" subtitle="Advice grounded in your gaps, activity, assessments, roadmap, and completed work."/><section className={styles.card}><textarea className={styles.textarea} value={question} onChange={(event) => setQuestion(event.target.value)} /><Button onClick={ask} isLoading={loading} leftIcon={<Send size={16} />}>Ask Coach</Button></section>{error && <div className={styles.error}>{error}</div>}{answer && <section className={`${styles.card} ${styles.answer}`}>{answer}</section>}</div>;
}

export function LearningAnalyticsPage() {
  const [scope, setScope] = useState<'student' | 'college'>('student');
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { intelligenceRequest<Analytics>(`/analytics${scope === 'student' ? `?profileId=${encodeURIComponent(getProfileId())}` : ''}`).then(setData).catch((reason) => setError(reason.message)); }, [scope]);
  const profile = data?.profiles?.[0];
  const metrics = data ? [['Readiness', `${Math.round(data.averageReadiness)}%`], ['Resource clicks', data.resourceClicks], ['Learning time', `${data.learningMinutes} min`], ['Assessment average', `${Math.round(data.averageAssessmentScore)}%`], ['Challenges', data.challengesCompleted], ['Projects', data.projectsCompleted]] : [];
  return <div className={styles.page}><PageHeader title="Learning Analytics" subtitle="Evidence from learning activity and readiness growth."><div className={styles.toolbar}><Button variant={scope === 'student' ? 'primary' : 'outline'} onClick={() => setScope('student')}>Student</Button><Button variant={scope === 'college' ? 'primary' : 'outline'} onClick={() => setScope('college')}>College</Button></div></PageHeader>{error && <div className={styles.error}>{error}</div>}<div className={styles.grid}>{metrics.map(([label, value]) => <article className={styles.card} key={label}><span className={styles.muted}>{label}</span><strong className={styles.metric}>{value}</strong></article>)}</div>{profile?.readinessHistory?.length ? <section className={styles.card}><h3>Readiness history</h3><div className={styles.history}>{profile.readinessHistory.map((point) => <span key={point.at} className={styles.historyBar} data-score={`${point.score}%`} style={{ height: `${Math.max(4, point.score)}%` }} />)}</div></section> : null}{profile?.topics?.length ? <section className={styles.card}><h3>Roadmap mastery</h3>{profile.topics.map((topic) => <div key={topic.topic}><div className={styles.toolbar}><strong>{topic.topic}</strong><span className={styles.muted}>{topic.mastery} · {topic.minutesSpent} min · {topic.resourceClicks} opens</span></div><div className={styles.progress}><span style={{ width: `${topic.progress}%` }} /></div></div>)}</section> : null}</div>;
}
