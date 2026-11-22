import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageSkeleton } from '@/components/common/PageSkeleton';
import { ToastProvider } from '@/components/common/ToastProvider';
import { AppShell } from '@/components/layout/AppShell';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import LoginPage from '@/features/auth/LoginPage';
import { DashboardStateProvider } from '@/features/dashboard-state/DashboardStateContext';
import { SplashScreen } from '@/features/splash/SplashScreen';

const OverviewPage = lazy(() => import('@/features/overview/OverviewPage'));
const ForecastPage = lazy(() => import('@/features/forecast/ForecastPage'));
const AlertsPage = lazy(() => import('@/features/alerts/AlertsPage'));
const RecommendationsPage = lazy(() => import('@/features/recommendations/RecommendationsPage'));
const InsightsPage = lazy(() => import('@/features/insights/InsightsPage'));
const AdminPage = lazy(() => import('@/features/admin/AdminPage'));

function LoginRoute() {
  const { status } = useAuth();
  return status === 'authenticated' ? <Navigate to="/dashboard/overview" replace /> : <LoginPage />;
}

function AppContent() {
  const { status } = useAuth();
  const [showSplash, setShowSplash] = useState(() => {
    try {
      const seen = sessionStorage.getItem('vms.splashSeen') === '1';
      sessionStorage.setItem('vms.splashSeen', '1');
      return !seen;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (status !== 'loading') {
      try {
        sessionStorage.setItem('vms.splashAuthStatus', status);
      } catch {
        /* Session storage can be unavailable. */
      }
    }
  }, [status]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {showSplash && <SplashScreen key="vms-splash" status={status} onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AppShell />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="forecast" element={<ForecastPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="recommendations" element={<RecommendationsPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
        </Routes>
      </Suspense>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <DashboardStateProvider>
              <AppContent />
            </DashboardStateProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
