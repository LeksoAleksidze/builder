import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/dashboard/Dashboard';
import LandingPage from './pages/landing/LandingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/:lang" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
