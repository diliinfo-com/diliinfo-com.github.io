import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import CompatibilityChecker from './components/CompatibilityChecker';

import Home from './pages/Home';
import About from './pages/About';
import Loan from './pages/Loan';
import Login from './pages/Login';
import Register from './pages/Register';
import UserCenter from './pages/UserCenter';
import Admin from './pages/Admin';
import { initAnalytics } from './utils/analytics';

function AppLayout() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-white">
      {!isAdminPage && <Navbar />}
      <main className={!isAdminPage ? 'pt-16' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/loan" element={<Loan />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user-center" element={<UserCenter />} />
          <Route path="/admin" element={<Admin />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  useEffect(() => {
    // 初始化页面访问统计
    try {
      initAnalytics();
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }, []);

  return (
    <CompatibilityChecker>
      <ErrorBoundary>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </ErrorBoundary>
    </CompatibilityChecker>
  );
}

export default App; 