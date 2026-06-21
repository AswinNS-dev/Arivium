import { Outlet } from 'react-router-dom';

export function AssessmentLayout() {
  return (
    <div className="assessment-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Distraction-free header */}
      <header style={{ height: '60px', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between' }}>
        <div>Assessment Mode</div>
        <div>Timer (WIP)</div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
