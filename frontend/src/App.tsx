import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProblemLibraryPage } from './pages/ProblemLibraryPage';
import { ProblemWorkspacePage } from './pages/ProblemWorkspacePage';
import { EvaluationPage } from './pages/EvaluationPage';
import { AttemptHistoryPage } from './pages/AttemptHistoryPage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing / Marketing Overview */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Application Layout with TopNavigation */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/problems" element={<ProblemLibraryPage />} />
            <Route path="/workspace" element={<ProblemWorkspacePage />} />
            <Route path="/workspace/:attemptId" element={<ProblemWorkspacePage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/evaluation/:evaluationId" element={<EvaluationPage />} />
            <Route path="/attempts" element={<AttemptHistoryPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
