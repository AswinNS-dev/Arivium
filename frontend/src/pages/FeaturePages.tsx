import { Button } from '../components';

function getLatestAnalysis() {
  try { return JSON.parse(localStorage.getItem('arivium:latestAnalysis') || 'null'); } catch { return null; }
}

const PageLayout = ({ title, description, data, renderData }: any) => (
  <div style={{ padding: 'var(--space-8)', maxWidth: '1200px', margin: '0 auto' }}>
    <header style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-8)', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      <h1 style={{ fontSize: '32px', marginBottom: 'var(--space-2)' }}>{title}</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
    </header>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
      {data.map(renderData)}
    </div>
  </div>
);

function flattenGaps(missing: any) {
  const rows: any[] = [];
  ['critical', 'important', 'advanced', 'other'].forEach((tier) => {
    (missing?.[tier] || []).forEach((skill: string) => rows.push({ skill, tier }));
  });
  return rows;
}

export function GapReportPage() {
  const analysis = getLatestAnalysis();
  const data = flattenGaps(analysis?.missingSkills);
  const rows = data.length ? data : [{ skill: 'Upload resume to generate gap report', tier: 'pending' }];
  return <PageLayout title="Gap Report" description="Model-backed missing skills for your selected target role." data={rows} renderData={(item: any) => {
    const score = item.tier === 'critical' ? 20 : item.tier === 'important' ? 45 : item.tier === 'advanced' ? 60 : 75;
    return <div key={`${item.tier}-${item.skill}`} style={{ padding: 'var(--space-6)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}><strong style={{ fontSize: '18px' }}>{item.skill}</strong><span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{item.tier}</span></div>
      <div style={{ height: '8px', background: 'var(--color-bg-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', background: score < 40 ? 'var(--color-error)' : score < 65 ? 'var(--color-warning)' : 'var(--color-success)', width: `${score}%`, borderRadius: '4px' }} /></div>
      <Button style={{ marginTop: 'var(--space-6)', width: '100%' }} variant="outline">Generate Assessment</Button>
    </div>;
  }} />;
}

export function PrepLoopPage() {
  const analysis = getLatestAnalysis();
  const questions = analysis?.assessmentQuestions || [];
  const data = questions.length ? questions.slice(0, 8) : [{ skill: 'Resume Analysis', type: 'Setup', question: 'Upload your resume to generate personalized assessments.' }];
  return <PageLayout title="Assessment Engine" description="MCQ and scenario questions generated from weak skills." data={data} renderData={(item: any, index: number) => (
    <div key={`${item.skill}-${index}`} style={{ padding: 'var(--space-6)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div><strong style={{ fontSize: '18px' }}>{item.skill}</strong><div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{item.type}</div></div>
      <p>{item.question}</p><Button variant="primary">Start Assessment</Button>
    </div>
  )} />;
}

export function ChallengesPage() {
  const analysis = getLatestAnalysis();
  const role = analysis?.targetRole || 'Career';
  const gaps = flattenGaps(analysis?.missingSkills).slice(0, 4);
  const data = (gaps.length ? gaps : [{ skill: 'AI', tier: 'weekly' }]).map((gap: any, index: number) => ({ title: `${gap.skill} Challenge`, participants: 80 + index * 37, role }));
  return <PageLayout title="Challenges" description="Weekly challenges aligned with your career gaps." data={data} renderData={(item: any) => (
    <div key={item.title} style={{ padding: 'var(--space-6)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div><strong style={{ fontSize: '18px' }}>{item.title}</strong><div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{item.participants} Participants ? {item.role}</div></div><Button variant="outline">Join Now</Button>
    </div>
  )} />;
}

export function CertificatesPage() {
  const analysis = getLatestAnalysis();
  const score = Math.round(analysis?.readinessScore || 0);
  const data = [{ id: 1, name: `${analysis?.targetRole || 'Career'} Readiness Certificate`, date: score >= 70 ? 'Ready to issue' : `Unlock at 70%. Current: ${score}%` }];
  return <PageLayout title="Certificates" description="Verified readiness certificates based on your progress." data={data} renderData={(item: any) => (
    <div key={item.id} style={{ padding: 'var(--space-6)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>?</div>
      <div><strong style={{ fontSize: '18px' }}>{item.name}</strong><div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{item.date}</div></div><Button variant="outline" style={{ width: '100%' }}>View Details</Button>
    </div>
  )} />;
}

export function ResourcesPage() {
  const analysis = getLatestAnalysis();
  const data = analysis?.learningResources?.length ? analysis.learningResources : [{ skill: 'Resume Analysis', name: 'Upload a resume to get resources', type: 'Setup' }];
  return <PageLayout title="Resources" description="Learning resources generated from your skill gaps." data={data} renderData={(item: any) => (
    <div key={`${item.skill}-${item.name}`} style={{ padding: 'var(--space-6)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div><strong style={{ fontSize: '18px' }}>{item.name}</strong><div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--color-bg-surface-hover)', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>{item.skill} ? {item.type}</div></div><Button variant="ghost">Open Resource</Button>
    </div>
  )} />;
}
