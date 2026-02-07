import ReactDOM from 'react-dom/client';
import '../src/shared/ui/reset.scss';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/:lang" element={<LandingPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  </BrowserRouter>
);
