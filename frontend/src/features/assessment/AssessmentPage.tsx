import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Button } from '../../components';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Flag, Maximize } from 'lucide-react';
import styles from './Assessment.module.css';

export function AssessmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [code, setCode] = useState('function twoSum(nums, target) {\n  // Write your code here\n}');
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [warnings, setWarnings] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'violations'>('description');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setWarnings(prev => prev + 1);
    alert('Paste action is restricted during assessments.');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Navbar */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ChevronLeft size={20} /> Leave
          </button>
          <div className={styles.title}>Assessment: Core Algorithms ({id})</div>
        </div>
        <div className={styles.headerCenter}>
          <div className={`${styles.timer} ${timeLeft < 300 ? styles.timerDanger : ''}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.violationPill}>
            <AlertTriangle size={14} /> {warnings} Warnings
          </div>
          <button className={styles.iconBtn} onClick={toggleFullscreen} title="Fullscreen">
            <Maximize size={18} />
          </button>
          <Button variant="primary" onClick={() => setIsSubmitModalOpen(true)}>Submit Test</Button>
        </div>
      </header>

      {/* Main Layout */}
      <main className={styles.mainLayout}>
        {/* Left Panel: Question & Info */}
        <div className={styles.leftPanel}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'description' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'violations' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('violations')}
            >
              Violation Log
            </button>
          </div>

          <div className={styles.panelContent}>
            {activeTab === 'description' ? (
              <div className={styles.questionContent}>
                <h2>1. Two Sum</h2>
                <div className={styles.tags}>
                  <span className={styles.tagEasy}>Easy</span>
                  <span className={styles.tagTopic}>Arrays</span>
                  <span className={styles.tagTopic}>Hash Table</span>
                </div>
                <p className={styles.prose}>
                  Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                </p>
                <p className={styles.prose}>
                  You may assume that each input would have exactly one solution, and you may not use the same element twice.
                </p>
                <div className={styles.exampleBlock}>
                  <strong>Example 1:</strong><br />
                  Input: <code>nums = [2,7,11,15], target = 9</code><br />
                  Output: <code>[0,1]</code>
                </div>
              </div>
            ) : (
              <div className={styles.violationLog}>
                <h3>Activity Integrity Log</h3>
                <ul className={styles.logList}>
                  {warnings > 0 ? (
                    Array.from({ length: warnings }).map((_, i) => (
                      <li key={i} className={styles.logItem}>
                        <AlertTriangle size={14} color="var(--color-warning)" />
                        <span>Illegal Paste Attempt detected.</span>
                        <span className={styles.logTime}>10:4{i} AM</span>
                      </li>
                    ))
                  ) : (
                    <li className={styles.logEmpty}>No violations recorded. Keep up the good work!</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Footer of Left Panel */}
          <div className={styles.leftFooter}>
            <Button variant="outline" size="sm" leftIcon={<ChevronLeft size={16} />}>Prev</Button>
            <Button variant="ghost" size="sm" leftIcon={<Flag size={16} />}>Flag for Review</Button>
            <Button variant="outline" size="sm" rightIcon={<ChevronRight size={16} />}>Next</Button>
          </div>
        </div>

        {/* Right Panel: Editor */}
        <div className={styles.rightPanel} onPaste={handlePaste}>
          <div className={styles.editorHeader}>
            <select className={styles.langSelect} defaultValue="javascript">
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python 3</option>
              <option value="java">Java 17</option>
            </select>
          </div>
          <div className={styles.editorWrapper}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          <div className={styles.consolePanel}>
            <div className={styles.consoleHeader}>Console Output</div>
            <div className={styles.consoleBody}>
              Click "Run Code" to view test results.
            </div>
            <div className={styles.consoleActions}>
              <Button variant="secondary" size="sm">Run Code</Button>
            </div>
          </div>
        </div>
      </main>

      {/* Submit Modal Overlay */}
      {isSubmitModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Submit Assessment?</h2>
            <p>You have answered 1 of 5 questions. Are you sure you want to submit? You cannot undo this action.</p>
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => navigate('/app/dashboard')}>Confirm Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
