import { useRef, useState } from 'react';
import { getAuthUser } from '../../services/authApi';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Onboarding.module.css';

const steps = [
  'Personal', 'Academic', 'Domain', 'Role', 'Skills', 'Availability', 'Resume', 'Review'
];

const roleSkillLabels: Record<string, [string, string]> = {
  'python ai engineer': ['Python / Machine Learning', 'TensorFlow / PyTorch'],
  'ai engineer': ['Python / Machine Learning', 'TensorFlow / PyTorch'],
  'machine learning engineer': ['Machine Learning', 'Model Deployment'],
  'data scientist': ['Python / SQL', 'Statistics / Analytics'],
  'fullstack engineer': ['Frontend Engineering', 'Backend APIs'],
  'full stack engineer': ['Frontend Engineering', 'Backend APIs'],
  'full stack developer': ['Frontend Engineering', 'Backend APIs'],
  'frontend developer': ['JavaScript / TypeScript', 'React'],
  'backend developer': ['API Design', 'Databases'],
};

function getSkillLabels(role: string, domain: string): [string, string] {
  const key = role.trim().toLowerCase();
  if (roleSkillLabels[key]) return roleSkillLabels[key];
  if (key.includes('ai') || key.includes('python')) return roleSkillLabels['python ai engineer'];
  if (key.includes('full')) return roleSkillLabels['full stack engineer'];
  if (key.includes('data')) return roleSkillLabels['data scientist'];
  if (domain === 'Data Science') return roleSkillLabels['data scientist'];
  return roleSkillLabels['frontend developer'];
}

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [isResumeDragging, setIsResumeDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [formData, setFormData] = useState({
    phone: '', location: '',
    university: '', major: '', gradYear: '',
    domain: '', role: '',
    jsSkill: '5', reactSkill: '5',
    hours: '',
    resume: null as File | null
  });
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.phone.trim() !== '' && formData.location.trim() !== '';
      case 1: return formData.university.trim() !== '' && formData.major.trim() !== '' && formData.gradYear.trim() !== '';
      case 2: return formData.domain !== '';
      case 3: return formData.role !== '';
      case 4: return true; // Sliders always have a value
      case 5: return formData.hours.trim() !== '';
      case 6: return formData.resume !== null;
      case 7: return true;
      default: return false;
    }
  };

  const analyzeResumeAndEnterDashboard = async () => {
    if (!formData.resume) {
      setAnalysisError('Upload your resume before opening the dashboard.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');

    try {
      const auth = getAuthUser() || {};
      const profileToStore = {
        phone: formData.phone,
        location: formData.location,
        university: formData.university,
        major: formData.major,
        gradYear: formData.gradYear,
        domain: formData.domain,
        role: formData.role,
        jsSkill: formData.jsSkill,
        reactSkill: formData.reactSkill,
        hours: formData.hours,
        resumeFileName: formData.resume.name,
        name: auth.name,
        email: auth.email,
        role: auth.role || formData.role,
        domain: auth.domain || formData.domain,
      };

      const payload = new FormData();
      payload.append('resume', formData.resume);
      payload.append('targetRole', formData.role);

      const response = await fetch(`${apiBaseUrl}/api/v1/career/analyze`, {
        method: 'POST',
        body: payload,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result?.message || 'Resume analysis failed');
      }

      localStorage.setItem('arivium:onboardingProfile', JSON.stringify(profileToStore));
      localStorage.setItem('arivium:targetRole', formData.role);
      localStorage.setItem('arivium:latestAnalysis', JSON.stringify(result.data));
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Onboarding resume analysis failed', error);
      setAnalysisError(error instanceof Error ? error.message : 'Resume analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (!isStepValid()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      void analyzeResumeAndEnterDashboard();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const setResumeFile = (file: File | null) => {
    if (!file) return;
    setFormData(prev => ({ ...prev, resume: file }));
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResumeFile(event.target.files?.[0] || null);
  };

  const handleResumeDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsResumeDragging(false);
    setResumeFile(event.dataTransfer.files?.[0] || null);
  };

  const [primarySkillLabel, secondarySkillLabel] = getSkillLabels(formData.role, formData.domain);

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.wizardCard}>
        {/* Progress Header */}
        <div className={styles.progressHeader}>
          {steps.map((step, idx) => (
            <div key={idx} className={styles.stepIndicator}>
              <div className={`${styles.stepCircle} ${idx <= currentStep ? styles.active : ''}`}>
                {idx < currentStep ? '✓' : idx + 1}
              </div>
              <span className={styles.stepLabel} style={{ fontWeight: idx === currentStep ? 'bold' : 'normal', color: idx === currentStep ? 'var(--color-primary)' : '' }}>{step}</span>
              {idx < steps.length - 1 && (
                <div className={`${styles.stepLine} ${idx < currentStep ? styles.activeLine : ''}`} />
              )}
            </div>
          ))}
        </div>

        <div className={styles.stepContent}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <div>
                  <h2>Personal Details</h2>
                  <p>Let's start with the basics.</p>
                  <Input label="Phone Number" placeholder="+1 234 567 890" style={{ marginBottom: 'var(--space-4)' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  <Input label="Location" placeholder="City, Country" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              )}
              {currentStep === 1 && (
                <div>
                  <h2>Academic Details</h2>
                  <p>Tell us about your education.</p>
                  <Input label="University" placeholder="Enter your university" style={{ marginBottom: 'var(--space-4)' }} value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} />
                  <Input label="Major" placeholder="Computer Science" style={{ marginBottom: 'var(--space-4)' }} value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} />
                  <Input label="Graduation Year" placeholder="2026" type="number" value={formData.gradYear} onChange={e => setFormData({...formData, gradYear: e.target.value})} />
                </div>
              )}
              {currentStep === 2 && (
                <div>
                  <h2>Select Domain</h2>
                  <p>Choose the career path you want to pursue.</p>
                  <div className={styles.cardGrid}>
                    {['Software Engineering', 'Data Science', 'Product Management', 'UI/UX Design'].map(d => (
                      <div key={d} className={`${styles.selectableCard} ${formData.domain === d ? styles.selectedCard : ''}`} onClick={() => setFormData({...formData, domain: d})} style={formData.domain === d ? { borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' } : {}}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div>
                  <h2>Select Role</h2>
                  <p>What specific role are you aiming for?</p>
                  <Input label="Search Roles" placeholder="e.g. Frontend Developer, Backend Engineer..." value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                  <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                     {['Python AI Engineer', 'Data Scientist', 'Machine Learning Engineer', 'Full Stack Engineer', 'Frontend Developer', 'Backend Developer'].map(r => (
                       <span key={r} onClick={() => setFormData({...formData, role: r})} style={{ padding: '4px 12px', background: formData.role === r ? 'var(--color-primary)' : 'var(--color-bg-surface-hover)', color: formData.role === r ? 'white' : 'inherit', borderRadius: '16px', fontSize: '12px', cursor: 'pointer' }}>{r}</span>
                     ))}
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div>
                  <h2>Skill Assessment</h2>
                  <p>Self-rate your core skills from 1 to 10.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500' }}>{primarySkillLabel}: {formData.jsSkill}/10</label>
                      <input type="range" min="1" max="10" style={{ width: '100%', marginTop: 'var(--space-2)' }} value={formData.jsSkill} onChange={e => setFormData({...formData, jsSkill: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500' }}>{secondarySkillLabel}: {formData.reactSkill}/10</label>
                      <input type="range" min="1" max="10" style={{ width: '100%', marginTop: 'var(--space-2)' }} value={formData.reactSkill} onChange={e => setFormData({...formData, reactSkill: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 5 && (
                <div>
                  <h2>Time Availability</h2>
                  <p>How much time can you dedicate to your career growth?</p>
                  <Input label="Hours per week" type="number" placeholder="10" value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} />
                </div>
              )}
              {currentStep === 6 && (
                <div>
                  <h2>Resume Upload</h2>
                  <p>Upload your current resume. Arivium will parse it and create your roadmap from the extracted skills.</p>
                  <input
                    ref={resumeInputRef}
                    className={styles.fileInput}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    aria-label="Upload resume"
                  />
                  <div
                    className={`${styles.uploadBox} ${isResumeDragging ? styles.uploadBoxActive : ''}`}
                    onClick={() => resumeInputRef.current?.click()}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsResumeDragging(true);
                    }}
                    onDragLeave={() => setIsResumeDragging(false)}
                    onDrop={handleResumeDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') resumeInputRef.current?.click();
                    }}
                  >
                    <p style={{ fontWeight: '500' }}>
                      {formData.resume ? formData.resume.name : 'Click or drag your resume here'}
                    </p>
                    <p style={{ fontSize: '12px', marginTop: 'var(--space-2)' }}>
                      PDF, DOC, or DOCX. Required for AI roadmap, gap analysis, and assessments.
                    </p>
                  </div>
                </div>
              )}
              {currentStep === 7 && (
                <div>
                  <h2>Review Your Profile</h2>
                  <p>All looks good? You are ready to start your journey.</p>
                  <div style={{ padding: 'var(--space-6)', background: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Summary</h3>
                    <p><strong>Domain:</strong> {formData.domain || 'Not set'}</p>
                    <p><strong>Role:</strong> {formData.role || 'Not set'}</p>
                    <p><strong>Target Year:</strong> {formData.gradYear || 'Not set'}</p>
                    <p><strong>Resume:</strong> {formData.resume?.name || 'Not uploaded'}</p>
                  </div>
                  {analysisError && <p style={{ color: 'var(--color-error)', marginTop: 'var(--space-4)' }}>{analysisError}</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.wizardFooter}>
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            Back
          </Button>
          <Button variant="primary" onClick={handleNext} disabled={!isStepValid() || isAnalyzing} isLoading={isAnalyzing}>
            {currentStep === steps.length - 1 ? (isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume & Open Dashboard') : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
