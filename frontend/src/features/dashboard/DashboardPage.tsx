import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';

const fallbackAnalysis = {
  readinessScore: 0,
  targetRole: 'Select a target role',
  resolvedRole: '',
  matchedSkills: [],
  missingSkills: { critical: [], important: [], advanced: [], other: [] },
  weeklyTasks: [],
  recommendedProjects: [],
};

const progressData = [
  { name: 'Start', readiness: 0 },
  { name: 'Now', readiness: 0 },
  { name: '30d', readiness: 0 },
  { name: '60d', readiness: 0 },
];

function getLatestAnalysis() {
  try {
    return JSON.parse(localStorage.getItem('arivium:latestAnalysis') || 'null') || fallbackAnalysis;
  } catch {
    return fallbackAnalysis;
  }
}

function readinessLevel(score: number) {
  if (score >= 70) return 'Advanced';
  if (score >= 40) return 'Intermediate';
  return 'Beginner';
}

export function DashboardPage() {
  const navigate = useNavigate();
  const analysis = getLatestAnalysis();
  const profile = JSON.parse(localStorage.getItem('arivium:onboardingProfile') || '{}');
  const score = Math.round(analysis.readinessScore || 0);
  const chartData = progressData.map((item, index) => ({
    ...item,
    readiness: Math.min(100, index === 0 ? Math.max(0, score - 10) : score + index * 8),
  }));
  const gaps = [
    ...(analysis.missingSkills?.critical || []),
    ...(analysis.missingSkills?.important || []),
    ...(analysis.missingSkills?.advanced || []),
  ].slice(0, 3);
  const tasks = analysis.weeklyTasks?.slice(0, 2) || [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Welcome back, {profile.name || 'Student'}</h1>
          <p className={styles.subtitle}>{analysis.targetRole || profile.role || 'Your role'} readiness is {score}%. Level: {readinessLevel(score)}.</p>
        </div>
        <div className={styles.readinessRing} style={{ background: `conic-gradient(var(--color-primary) ${score}%, var(--color-bg-surface-hover) 0)` }}>
          <div className={styles.ringValue}>{score}%</div>
          <div className={styles.ringLabel}>Job Ready</div>
        </div>
      </header>

      <div className={styles.grid}>
        <motion.div className={styles.card} style={{ gridColumn: 'span 2' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className={styles.cardTitle}>Readiness Progress</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="readiness" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-primary)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className={styles.cardTitle}>Up Next in Roadmap</h3>
          {(tasks.length ? tasks : [{ week: 'Upload resume', task: 'Upload your resume to generate AI tasks' }]).map((task: any) => (
            <div className={styles.taskItem} key={task.week}>
              <div className={styles.taskIcon} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>{String(task.week).replace('Week ', 'W')}</div>
              <div className={styles.taskInfo}>
                <h4>{task.task}</h4>
                <p>{task.week}</p>
              </div>
              {!tasks.length && <button className={styles.taskBtn} onClick={() => navigate('/app/resume-builder')}>Upload</button>}
            </div>
          ))}
        </motion.div>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className={styles.cardTitle}>Top Critical Gaps</h3>
          <ul className={styles.gapList}>
            {(gaps.length ? gaps : ['Upload resume for gap analysis']).map((gap: string, index: number) => (
              <li key={gap}>
                <div className={styles.gapHeader}>
                  <span>{gap}</span>
                  <span className={styles.gapScore}>{index === 0 ? 'Critical' : 'Gap'}</span>
                </div>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${Math.max(15, 45 - index * 10)}%`, backgroundColor: index === 0 ? 'var(--color-error)' : 'var(--color-warning)' }} /></div>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className={styles.cardTitle}>Recommended Projects</h3>
          {(analysis.recommendedProjects || []).slice(0, 3).map((project: string) => (
            <div className={styles.challengeItem} key={project}>
              <div className={styles.challengeInfo}>
                <h4>{project}</h4>
                <p>Based on your current gaps</p>
              </div>
            </div>
          )) || null}
        </motion.div>
      </div>
    </div>
  );
}
