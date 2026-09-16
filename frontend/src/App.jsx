import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ToolPage    from './pages/ToolPage';
import './index.css';

export default function App() {
  return (
    <Routes>
      <Route path="/"     element={<LandingPage />} />
      <Route path="/tool" element={<ToolPage />} />
      {/* Catch-all → home */}
      <Route path="*"     element={<LandingPage />} />
    </Routes>
  );
}
