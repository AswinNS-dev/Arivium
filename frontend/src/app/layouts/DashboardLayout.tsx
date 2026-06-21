import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Map, PieChart, Target, BookOpen, Users, Award, Bell, Search, Menu, Bot, BarChart3, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { Avatar, Input } from '../../components';
import { logout } from '../../services/authApi';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import styles from './DashboardLayout.module.css';

const navItems = [
  { name: 'Dashboard', path: '/app/dashboard', icon: <Home size={20} /> },
  { name: 'Roadmap', path: '/app/roadmap', icon: <Map size={20} /> },
  { name: 'Gap Report', path: '/app/gap-report', icon: <PieChart size={20} /> },
  { name: 'Resume Builder', path: '/app/resume-builder', icon: <BookOpen size={20} /> },
  { name: 'Prep Loop', path: '/app/preploop', icon: <Target size={20} /> },
  { name: 'Resources', path: '/app/resources', icon: <BookOpen size={20} /> },
  { name: 'Community', path: '/app/community', icon: <Users size={20} /> },
  { name: 'Challenges', path: '/app/challenges', icon: <Target size={20} /> },
  { name: 'Career Coach', path: '/app/coach', icon: <Bot size={20} /> },
  { name: 'Analytics', path: '/app/analytics', icon: <BarChart3 size={20} /> },
  { name: 'Certificates', path: '/app/certificates', icon: <Award size={20} /> },
];

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const onboardingProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem('arivium:onboardingProfile') || '{}');
    } catch {
      return {};
    }
  })();

  const displayName = user?.name || onboardingProfile.name || 'Student';
  const displayRole = onboardingProfile.role || onboardingProfile.domain || user?.role || user?.email || 'Career Professional';

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${isSidebarOpen ? '' : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>Arivium</div>
        </div>
        <nav className={styles.navMenu}>
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`${styles.navItem} ${location.pathname.startsWith(item.path) ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {isSidebarOpen && <span className={styles.navText}>{item.name}</span>}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link to="/app/profile" className={styles.userProfile}>
            <Avatar fallback={displayName[0]} size="sm" />
            {isSidebarOpen && (
              <div className={styles.userInfo}>
                <div className={styles.userName}>{displayName}</div>
                <div className={styles.userRole}>{displayRole}</div>
              </div>
            )}
          </Link>
        </div>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.searchBar}>
            <button
              className={`${styles.actionBtn} ${styles.sidebarToggle}`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <Input
              placeholder="Search anything..."
              leftIcon={<Search size={16} />}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.actionBtn} onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className={styles.actionBtn} aria-label="View notifications">
              <Bell size={20} />
            </button>
            <div className={styles.userMenu}>
              <button type="button" className={styles.userMenuButton} onClick={() => setIsMenuOpen((open) => !open)} aria-label="Open user menu">
                <Avatar fallback={displayName[0]} size="sm" />
              </button>
              {isMenuOpen && (
                <div className={styles.menuDropdown}>
                  <button className={styles.menuItem} type="button" onClick={() => { setIsMenuOpen(false); navigate('/app/profile'); }}>
                    <UserIcon size={16} /> Profile
                  </button>
                  <button className={styles.menuItem} type="button" onClick={() => { setIsMenuOpen(false); navigate('/app/profile'); }}>
                    <Settings size={16} /> Settings
                  </button>
                  <div className={styles.menuDivider} />
                  <button className={styles.menuItem} type="button" onClick={async () => { await logout(); navigate('/login', { replace: true }); }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={styles.motionWrapper}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
