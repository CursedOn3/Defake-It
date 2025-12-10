import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Detect from './pages/Detect';
import History from './pages/History';
import About from './pages/About';
import Result from './pages/Result';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function AppContent() {
  const location = useLocation();
  const hideNavFooter = ['/', '/login', '/signup', '/forgot-password'].includes(location.pathname) || 
                        location.pathname.startsWith('/reset-password');

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavFooter && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/detect" element={
            <ProtectedRoute>
              <Detect />
            </ProtectedRoute>
          } />
          <Route path="/result" element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      {!hideNavFooter && (
        <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p>© 2025 DeepFake Detector. Built with AI for a safer digital world.</p>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
