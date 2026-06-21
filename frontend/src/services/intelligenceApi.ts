import { getAuthUser } from './authApi';
import { apiBaseUrl } from './apiConfig';

export function getAnalysis() {
  try { return JSON.parse(localStorage.getItem('arivium:latestAnalysis') || 'null'); } catch { return null; }
}

export function getProfileId() {
  const user = getAuthUser();
  let profile: Record<string, string> = {};
  try { profile = JSON.parse(localStorage.getItem('arivium:authUser') || '{}'); } catch { /* use anonymous id */ }
  const seed = user?.id || user?.email || user?.name || profile.email || profile.name || localStorage.getItem('arivium:profileId') || crypto.randomUUID();
  const id = seed.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  localStorage.setItem('arivium:profileId', id);
  return id;
}

export function flattenMissing(missing: Record<string, string[]> | undefined): string[] {
  return ['critical', 'important', 'advanced', 'other'].flatMap((tier) => missing?.[tier] || []);
}

export function learningContext() {
  const analysis = getAnalysis() || {};
  return {
    profileId: getProfileId(),
    role: analysis.targetRole || analysis.resolvedRole || 'Career Professional',
    readiness: Number(analysis.readinessScore || 0),
    missingSkills: analysis.missingSkills || {},
    roadmap: analysis.roadmap?.roadmap || [],
    assessments: analysis.assessmentQuestions || [],
    completedProjects: analysis.completedProjects || [],
  };
}

export async function intelligenceRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/api/v1/intelligence${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.message || 'Intelligence request failed');
  return payload.data as T;
}

export async function recordActivity(event: Record<string, unknown>) {
  const profile = await intelligenceRequest<{ currentReadiness: number; topics?: unknown[] }>('/activity', {
    method: 'POST',
    body: JSON.stringify({ ...learningContext(), event }),
  });
  const analysis = getAnalysis();
  if (analysis) {
    analysis.readinessScore = profile.currentReadiness;
    localStorage.setItem('arivium:latestAnalysis', JSON.stringify(analysis));
  }
  return profile;
}
