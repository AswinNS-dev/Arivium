import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, CheckCircle, Code, ExternalLink, PlayCircle, Sparkles } from 'lucide-react';
import { Button } from '../../components';
import { getAnalysis, getProfileId, intelligenceRequest, learningContext, recordActivity } from '../../services/intelligenceApi';
import styles from './Roadmap.module.css';

interface Resource { type: string; title: string; url: string; reason?: string }
interface TopicProgress { topic: string; progress: number; mastery: string }
interface LearningProfile { currentReadiness: number; topics: TopicProgress[] }
interface RoadmapNode { id: number; title: string; skills: string[]; status: string; duration: string; description?: string; progress: number; mastery: string; problems: number }

export function RoadmapPage() {
  const analysis = getAnalysis();
  const roadmap = analysis?.roadmap?.roadmap || [];
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [selectedTopic, setSelectedTopic] = useState(1);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openedAt, setOpenedAt] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    intelligenceRequest<LearningProfile>(`/profiles/${encodeURIComponent(getProfileId())}`).then(setProfile).catch(() => undefined);
  }, []);

  const nodes: RoadmapNode[] = useMemo(() => roadmap.length ? roadmap.map((item: { week: string; focus_skills?: string[]; task?: string; objectives?: string[] }, index: number) => {
    const skills = item.focus_skills || [];
    const tracked = skills.map((skill) => profile?.topics.find((topic) => topic.topic.toLowerCase() === skill.toLowerCase())).filter(Boolean) as TopicProgress[];
    const progress = tracked.length ? tracked.reduce((total, topic) => total + topic.progress, 0) / tracked.length : 0;
    return { id: index + 1, title: skills.join(' + ') || item.task || item.week, skills, status: progress >= 100 ? 'completed' : 'active', duration: item.week, description: item.objectives?.join(' '), progress, mastery: tracked[0]?.mastery || 'Beginner', problems: (analysis.assessmentQuestions || []).filter((question: { skill: string }) => skills.includes(question.skill)).length };
  }) : [{ id: 1, title: 'Upload resume to generate roadmap', skills: [], status: 'active', duration: 'Now', description: 'Run resume analysis first.', progress: 0, mastery: 'Beginner', problems: 0 }], [analysis, profile, roadmap]);
  const activeData = nodes.find((node) => node.id === selectedTopic) || nodes[0];

  const generateResources = async () => {
    const skill = activeData.skills[0];
    if (!skill) return;
    setLoading(true); setError(''); setResources([]);
    try {
      const data = await intelligenceRequest<{ resources: Resource[] }>('/resources', { method: 'POST', body: JSON.stringify({ ...learningContext(), readiness: profile?.currentReadiness ?? analysis.readinessScore, skill, mastery: activeData.mastery, week: activeData.duration }) });
      setResources(data.resources);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not generate personalized resources'); }
    finally { setLoading(false); }
  };

  const openResource = (resource: Resource) => {
    setOpenedAt((current) => ({ ...current, [resource.url]: Date.now() }));
    window.open(resource.url, '_blank', 'noopener,noreferrer');
    void recordActivity({ type: 'resource_opened', skill: activeData.skills[0], week: activeData.duration, resourceUrl: resource.url }).then((next) => setProfile(next as LearningProfile));
  };

  const completeResource = async (resource: Resource) => {
    const minutesSpent = Math.max(1, Math.round((Date.now() - (openedAt[resource.url] || Date.now())) / 60000));
    await recordActivity({ type: 'learning_time', skill: activeData.skills[0], week: activeData.duration, resourceUrl: resource.url, minutesSpent });
    const next = await recordActivity({ type: 'resource_completed', skill: activeData.skills[0], week: activeData.duration, resourceUrl: resource.url, completed: true });
    setProfile(next as LearningProfile);
  };

  const readiness = Math.round(profile?.currentReadiness ?? analysis?.readinessScore ?? 0);
  return <div className={styles.container}>
    <header className={styles.header}><h1>{analysis?.targetRole || 'Personalized'} Roadmap</h1><p>Resources and progress adapt to your activity, mastery, and assessments.</p><div className={styles.progressSummary}><div className={styles.progressText}><span>Overall Readiness</span><span>{readiness}%</span></div><div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${readiness}%` }} /></div></div></header>
    <div className={styles.mainLayout}>
      <div className={styles.timelineContainer}>{nodes.map((node: RoadmapNode, index: number) => <div key={node.id} className={styles.timelineNode}>{index < nodes.length - 1 && <div className={`${styles.connector} ${node.status === 'completed' ? styles.connectorCompleted : ''}`} />}<motion.div className={`${styles.nodeCard} ${styles[node.status]} ${selectedTopic === node.id ? styles.selected : ''}`} onClick={() => { setSelectedTopic(node.id); setResources([]); setError(''); }} whileHover={{ scale: 1.02 }}><div className={styles.nodeIcon}>{node.status === 'completed' ? <CheckCircle size={24} color="var(--color-success)" /> : <PlayCircle size={24} color="white" fill="var(--color-primary)" />}</div><div className={styles.nodeInfo}><h3 className={styles.nodeTitle}>{node.title}</h3><div className={styles.nodeMeta}><span className={styles.duration}>{node.duration} · {Math.round(node.progress)}% · {node.mastery}</span></div></div></motion.div></div>)}</div>
      <div className={styles.detailsPanel}><AnimatePresence mode="wait"><motion.div key={activeData.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.detailsContent}><div className={styles.detailsHeader}><div className={styles.statusBadge} data-status={activeData.status}>{activeData.status.toUpperCase()}</div><h2>{activeData.title}</h2></div><div className={styles.detailsBody}><p className={styles.description}>{activeData.description}</p><div className={styles.statsGrid}><div className={styles.statBox}><BookOpen size={20} color="var(--color-primary)" /><div><div className={styles.statValue}>{activeData.skills.length}</div><div className={styles.statLabel}>Focus Skills</div></div></div><div className={styles.statBox}><Code size={20} color="var(--color-primary)" /><div><div className={styles.statValue}>{activeData.problems}</div><div className={styles.statLabel}>Assessments</div></div></div></div><div className={styles.actionSection}><Button onClick={generateResources} isLoading={loading} leftIcon={<Sparkles size={16} />}>Open Resource</Button><Button variant="outline" onClick={() => navigate(`/assessment/${encodeURIComponent(activeData.title)}`)}>Take Mini Assessment</Button></div>{error && <p className={styles.resourceError}>{error}</p>}<div className={styles.resourceList}>{resources.map((resource) => <article className={styles.resourceItem} key={`${resource.type}-${resource.url}`}><div><span>{resource.type}</span><h3>{resource.title}</h3><p>{resource.reason}</p></div><div className={styles.resourceActions}><Button size="sm" variant="outline" leftIcon={<ExternalLink size={14} />} onClick={() => openResource(resource)}>Open</Button><Button size="sm" variant="ghost" onClick={() => void completeResource(resource)}>Complete</Button></div></article>)}</div></div></motion.div></AnimatePresence></div>
    </div>
  </div>;
}
