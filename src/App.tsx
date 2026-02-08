import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/dashboard/Dashboard';
import LandingPage from './pages/landing/LandingPage';
import { ThemeProvider } from '@d2d-ui/theme-provider';
import { AuthRedirect } from './shared/components/AuthRedirect';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { BuilderProtectedRoute } from './shared/components/BuilderProtectedRoute';
import { LoginPage } from './pages/d2d/login/LoginPage';
import { ServerSelectionPage } from './pages/d2d/server-selection/ServerSelectionPage';
import { D2DDashboard } from './pages/d2d/dashboard/D2DDashboard';
import { CampaignsPage } from './pages/d2d/campaigns/CampaignsPage';
import { HeadersPage } from './pages/d2d/headers/HeadersPage';

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* D2D Routes */}
        <Route path="/" element={<AuthRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/server-selection" element={<ProtectedRoute><ServerSelectionPage /></ProtectedRoute>} />
        <Route path="/d2d-dashboard" element={<ProtectedRoute><D2DDashboard /></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />
        <Route path="/headers" element={<ProtectedRoute><HeadersPage /></ProtectedRoute>} />

        {/* Builder Routes */}
        <Route path="/dashboard" element={<BuilderProtectedRoute><DashboardPage /></BuilderProtectedRoute>} />
        <Route path="/:lang" element={<BuilderProtectedRoute><LandingPage /></BuilderProtectedRoute>} />
      </Routes>
    </ThemeProvider>
  );
}
