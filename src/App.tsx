import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/dashboard/Dashboard.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<DashboardPage />} />

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
