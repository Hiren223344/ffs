import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { useClerkContext } from './context/ClerkContext';
import { RefreshCw } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkContext();

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-[#FAF9F5] text-[#2d2c2a] flex flex-col items-center justify-center font-jakarta">
        <RefreshCw className="w-6 h-6 animate-spin text-[rgba(30,50,90,0.85)] mb-3" />
        <span className="text-xs font-semibold text-[#8a8984]">Initializing Fearch Auth Engine...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/signin" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
