import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Navbar placeholder */}
      <nav className={styles.nav}>
        <div className={styles.logo}>Arivium</div>
        <div className={styles.navLinks}>
          <Link to="/login"><Button variant="ghost">Login</Button></Link>
          <Link to="/signup"><Button variant="primary">Sign Up</Button></Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={styles.heroTitle}>
            From Student to <span className={styles.highlight}>Job-Ready</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Arivium is the AI-powered Career Readiness Platform that bridges the gap between academics and industry.
          </p>
          <div className={styles.ctaGroup}>
            <Link to="/signup"><Button size="lg" variant="primary">Get Started for Free</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline">View Dashboard</Button></Link>
          </div>
        </motion.div>
        
        <motion.div 
          className={styles.dashboardPreview}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={styles.previewWindow}>
            {/* Fake dashboard UI representation */}
            <div className={styles.previewHeader}>
              <div className={styles.dots} />
            </div>
            <div className={styles.previewBody}>
              <div className={styles.skeletonBlock} style={{ width: '30%', height: '100px' }} />
              <div className={styles.skeletonBlock} style={{ width: '60%', height: '100px' }} />
              <div className={styles.skeletonBlock} style={{ width: '100%', height: '200px' }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Built for the Modern Learner</h2>
        <div className={styles.featureGrid}>
          {features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              className={styles.featureCard}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Success Metrics */}
      <section className={styles.metrics}>
        <div className={styles.metricItem}>
          <h3 className={styles.metricNumber}>10k+</h3>
          <p>Students Placed</p>
        </div>
        <div className={styles.metricItem}>
          <h3 className={styles.metricNumber}>95%</h3>
          <p>Success Rate</p>
        </div>
        <div className={styles.metricItem}>
          <h3 className={styles.metricNumber}>500+</h3>
          <p>Hiring Partners</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div>
            <h4>Arivium</h4>
            <p>Empowering students globally.</p>
          </div>
          <div>
            <h4>Platform</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          © 2026 Arivium. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const features = [
  { title: 'Personalized Roadmaps', desc: 'AI-driven paths tailored to your career goals.' },
  { title: 'AI Assessments', desc: 'Test your knowledge with real-world, dynamic scenarios.' },
  { title: 'Gap Reports', desc: 'Actionable insights to fill your skill gaps effectively.' },
  { title: 'Community', desc: 'Connect with peers and mentors in a professional network.' },
  { title: 'Challenges', desc: 'Participate in coding challenges and hackathons.' },
  { title: 'Certificates', desc: 'Earn verifiable certificates to boost your resume.' },
];
