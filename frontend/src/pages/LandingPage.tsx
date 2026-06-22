import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components';
import styles from './LandingPage.module.css';

const features = [
  { icon: '🎯', title: 'Personalized Roadmaps', desc: 'AI generates a step-by-step career path from your skills and target role — not a generic template.' },
  { icon: '🧠', title: 'AI-Powered Assessments', desc: 'Fresh questions every attempt, generated from your specific gaps. No memorization possible.' },
  { icon: '📊', title: 'Gap Analysis Reports', desc: 'Know exactly which skills are holding you back with real-time readiness scoring.' },
  { icon: '🤝', title: 'Peer Community', desc: 'Connect with students in your domain, share resources, and grow together.' },
  { icon: '⚡', title: 'Weekly Challenges', desc: 'Structured challenges aligned to your career gaps keep you consistent and motivated.' },
  { icon: '🏆', title: 'Verified Certificates', desc: 'A shareable, verifiable certificate unlocks when your readiness hits 85%.' },
];

const steps = [
  { title: 'Build your profile', desc: 'No resume required. Answer a few questions about your domain, role, and skills.' },
  { title: 'Get your AI roadmap', desc: 'Groq instantly generates a phased roadmap tailored to your exact target role.' },
  { title: 'Practice & get assessed', desc: 'Work through topics, take LLM-generated assessments, and track your gap score.' },
  { title: 'Earn your certificate', desc: 'Hit 85% readiness and get a shareable, verified Job Readiness Certificate.' },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.logo}>Arivium</div>
        <div className={styles.navLinks}>
          <Link to="/login"><Button variant="ghost">Login</Button></Link>
          <Link to="/signup"><Button variant="primary">Get Started</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
        </div>

        <motion.div
          className={styles.heroContent}
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            AI-Powered · Free to Start · No Resume Required
          </motion.div>
          <motion.h1 variants={fadeUp} className={styles.heroTitle}>
            From Student to<br />
            <span className={styles.highlight}>Job-Ready.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className={styles.heroSubtitle}>
            Arivium maps your skills, identifies your gaps, and builds a personalized roadmap to get you hired — not just to finish a course.
          </motion.p>
          <motion.div variants={fadeUp} className={styles.ctaGroup}>
            <Link to="/signup">
              <Button size="lg" variant="primary">Start for Free →</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">View Dashboard</Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          className={styles.dashboardPreview}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className={styles.previewGlow} />
          <div className={styles.previewWindow}>
            <div className={styles.previewBar}>
              <div className={`${styles.dot} ${styles.dotRed}`} />
              <div className={`${styles.dot} ${styles.dotYellow}`} />
              <div className={`${styles.dot} ${styles.dotGreen}`} />
              <div className={styles.urlBar} />
            </div>
            <div className={styles.previewContent}>
              <div className={styles.previewSidebar}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={styles.previewNav} style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <div className={styles.previewMain}>
                <div className={styles.previewCard} />
                <div className={styles.previewCard} />
                <div className={styles.previewCard} />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Metrics */}
      <section className={styles.socialProof}>
        <div className={styles.socialProofText}>Trusted by students worldwide</div>
        <div className={styles.metrics}>
          {[['10k+', 'Students Placed'], ['95%', 'Success Rate'], ['500+', 'Hiring Partners'], ['85%', 'Avg. Readiness Gain']].map(([val, label]) => (
            <motion.div
              key={label}
              className={styles.metricPill}
              whileHover={{ y: -2 }}
            >
              <div className={styles.metricValue}>{val}</div>
              <div className={styles.metricLabel}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div>
          <span className={styles.sectionLabel}>Platform Features</span>
          <h2 className={styles.sectionTitle}>Everything to get you hired</h2>
          <p className={styles.sectionSubtitle}>One platform that replaces scattered tools with a single, intelligent career engine.</p>
        </div>
        <motion.div
          className={styles.featureGrid}
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <div className={styles.stepsWrapper}>
          <span className={styles.sectionLabel}>How it works</span>
          <h2 className={styles.sectionTitle}>From signup to job-ready in 4 steps</h2>
          <div className={styles.steps}>
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                className={styles.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepBody}>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to prove you're job-ready?</h2>
          <p>Join thousands of students who turned their skill gaps into career wins.</p>
          <Link to="/signup" className={styles.ctaButtonWhite}>
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>Arivium</div>
            <p>AI-powered career readiness for students who are serious about getting hired.</p>
          </div>
          <div>
            <h4>Platform</h4>
            <Link to="/signup">Roadmaps</Link>
            <Link to="/signup">Assessments</Link>
            <Link to="/signup">Certificates</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/">About</Link>
            <Link to="/">Blog</Link>
            <Link to="/">Contact</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link to="/">Privacy</Link>
            <Link to="/">Terms</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>© 2026 Arivium. All rights reserved.</div>
      </footer>
    </div>
  );
}
