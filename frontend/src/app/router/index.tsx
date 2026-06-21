import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AssessmentLayout } from '../layouts/AssessmentLayout';
import { RequireAuth } from '../layouts/RequireAuth';
import { LandingPage } from '../../pages/LandingPage';
import { LoginPage } from '../../features/auth/LoginPage';
import { SignupPage } from '../../features/auth/SignupPage';
import { OnboardingPage } from '../../features/onboarding/OnboardingPage';
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { RoadmapPage } from '../../features/roadmap/RoadmapPage';
import { AssessmentPage } from '../../features/assessment/AssessmentPage';
import { ResumeBuilderPage } from '../../features/resume/ResumeBuilderPage';
import { CommunityPage } from '../../features/community/CommunityPage';
import { ProfilePage } from '../../features/profile/ProfilePage';
import { GapReportPage, PrepLoopPage, CertificatesPage } from '../../pages/FeaturePages';
import { CareerCoachPage, DynamicChallengesPage, LearningAnalyticsPage, ResourceIntelligencePage } from '../../pages/IntelligencePages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        path: '',
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'onboarding',
        element: <OnboardingPage />,
      }
    ],
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'roadmap',
        element: <RoadmapPage />,
      },
      {
        path: 'gap-report',
        element: <GapReportPage />,
      },
      {
        path: 'preploop',
        element: <PrepLoopPage />,
      },
      {
        path: 'resume-builder',
        element: <ResumeBuilderPage />,
      },
      {
        path: 'resources',
        element: <ResourceIntelligencePage />,
      },
      {
        path: 'community',
        element: <CommunityPage />,
      },
      {
        path: 'challenges',
        element: <DynamicChallengesPage />,
      },
      {
        path: 'certificates',
        element: <CertificatesPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'coach',
        element: <CareerCoachPage />,
      },
      {
        path: 'analytics',
        element: <LearningAnalyticsPage />,
      },
    ],
  },
  {
    path: '/assessment',
    element: <AssessmentLayout />,
    children: [
      {
        path: ':id',
        element: <AssessmentPage />,
      },
    ]
  }
]);
