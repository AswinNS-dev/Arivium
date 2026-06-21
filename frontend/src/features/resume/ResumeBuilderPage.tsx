import { useState, useRef } from 'react';
import { Button, Input, Textarea } from '../../components';
import { CheckCircle, Download, Upload } from 'lucide-react';
import styles from './Resume.module.css';

export function ResumeBuilderPage() {
  const [resumeData, setResumeData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'San Francisco, CA',
    summary: 'A passionate Frontend Developer with 2 years of experience building scalable web applications using React and TypeScript.',
    experience: [
      { company: 'Tech Corp', role: 'Frontend Developer', duration: '2024 - Present', desc: 'Developed the main dashboard leading to a 20% increase in user engagement.' }
    ],
    education: [
      { school: 'University of Technology', degree: 'B.S. Computer Science', year: '2022 - 2026' }
    ],
    skills: 'JavaScript, TypeScript, React, Node.js, CSS'
  });

  const [targetRole, setTargetRole] = useState(() => localStorage.getItem('arivium:targetRole') || 'Python AI Engineer');
  const [atsScore, setAtsScore] = useState(85);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const uploadResumeFile = async (file: File) => {
    setIsParsing(true);
    setUploadError('');
    setUploadMessage('Uploading resume...');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      const selectedRole = targetRole.trim() || localStorage.getItem('arivium:targetRole') || 'Python AI Engineer';
      formData.append('targetRole', selectedRole);

      const response = await fetch(`${apiBaseUrl}/api/v1/career/analyze`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        const message = result?.message || 'Career analysis failed';
        setUploadError(message);
        setUploadMessage('Upload failed');
        console.error('Career analysis failed', result);
        return;
      }

      const data = result.data;
      localStorage.setItem('arivium:latestAnalysis', JSON.stringify(data));
      setAtsScore(Math.round(data.readiness_score || data.readinessScore || 0));
      setResumeData((prev) => ({
        ...prev,
        skills: Array.isArray(data.matchedSkills) ? data.matchedSkills.join(', ') : prev.skills,
        summary: `Ready for ${targetRole.trim() || 'selected role'} with ${Math.round(data.readiness_score || data.readinessScore || 0)}% readiness.`,
      }));
      setUploadMessage('Resume uploaded successfully');
    } catch (error) {
      console.error('Upload error', error);
      setUploadError('Upload failed. Check console for details.');
      setUploadMessage('Upload failed');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadResumeFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    uploadResumeFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>ATS Resume Builder</h1>
          <p className={styles.subtitle}>Build a machine-readable resume guaranteed to pass Applicant Tracking Systems.</p>
        </div>
        <div className={styles.headerActions}>
          <input 
            type="file" 
            accept=".pdf,.docx" 
            ref={fileInputRef} 
            className={styles.fileInput} 
            onChange={handleFileUpload} 
            aria-label="Upload resume file"
            title="Upload resume file"
          />
          <Button 
            variant="outline" 
            leftIcon={<Upload size={16} />} 
            onClick={() => fileInputRef.current?.click()}
            isLoading={isParsing}
            disabled={isParsing}
          >
            {isParsing ? 'Parsing...' : 'Upload Existing Resume'}
          </Button>
          <div className={styles.scorePill}>
            <CheckCircle size={16} /> ATS Match: {atsScore}%
          </div>
          <Button variant="primary" leftIcon={<Download size={16} />}>Export PDF</Button>
        </div>
        <div 
          className={styles.dropZone}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          Drag & drop your resume here, or click to browse
        </div>
        {uploadMessage && <div className={styles.uploadMessage}>{uploadMessage}</div>}
        {uploadError && <div className={styles.uploadError}>{uploadError}</div>}
      </header>

      <div className={styles.mainContent}>
        {/* Editor Form */}
        <div className={styles.editorPanel}>
          <div className={styles.section}>
            <h3>Personal Information</h3>
            <Input label="Full Name" value={resumeData.name} onChange={e => setResumeData({...resumeData, name: e.target.value})} />
            <Input label="Email" value={resumeData.email} onChange={e => setResumeData({...resumeData, email: e.target.value})} />
            <Input label="Phone" value={resumeData.phone} onChange={e => setResumeData({...resumeData, phone: e.target.value})} />
            <Input label="Location" value={resumeData.location} onChange={e => setResumeData({...resumeData, location: e.target.value})} />
          </div>

          <div className={styles.section}>
            <h3>Professional Summary</h3>
            <Textarea
              label="Summary"
              value={resumeData.summary}
              onChange={e => setResumeData({...resumeData, summary: e.target.value})}
              rows={4}
            />
          </div>

          <div className={styles.section}>
            <h3>Target Role</h3>
            <Input
              label="Target role"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
            />
          </div>

          <div className={styles.section}>
            <h3>Skills</h3>
            <Textarea
              label="Skills"
              value={resumeData.skills}
              onChange={e => setResumeData({...resumeData, skills: e.target.value})}
              rows={2}
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className={styles.previewPanel}>
          <div className={styles.documentPreview}>
            <div className={styles.docHeader}>
              <h1 className={styles.docName}>{resumeData.name || 'Your Name'}</h1>
              <div className={styles.docContact}>
                {resumeData.email} • {resumeData.phone} • {resumeData.location}
              </div>
            </div>

            <div className={styles.docSection}>
              <h2 className={styles.docSectionTitle}>SUMMARY</h2>
              <p className={styles.docText}>{resumeData.summary}</p>
            </div>

            <div className={styles.docSection}>
              <h2 className={styles.docSectionTitle}>EXPERIENCE</h2>
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className={styles.docItem}>
                  <div className={styles.docItemHeader}>
                    <strong>{exp.role}</strong>
                    <span>{exp.duration}</span>
                  </div>
                  <div className={styles.docItemSub}>{exp.company}</div>
                  <p className={styles.docText}>• {exp.desc}</p>
                </div>
              ))}
            </div>

            <div className={styles.docSection}>
              <h2 className={styles.docSectionTitle}>EDUCATION</h2>
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className={styles.docItem}>
                  <div className={styles.docItemHeader}>
                    <strong>{edu.school}</strong>
                    <span>{edu.year}</span>
                  </div>
                  <div className={styles.docItemSub}>{edu.degree}</div>
                </div>
              ))}
            </div>

            <div className={styles.docSection}>
              <h2 className={styles.docSectionTitle}>SKILLS</h2>
              <p className={styles.docText}>{resumeData.skills}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
