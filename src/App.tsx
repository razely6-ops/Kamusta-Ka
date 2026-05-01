/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import CounselorDashboard from './pages/CounselorDashboard';
import SessionRoom from './pages/SessionRoom';

function ProtectedRoute({ children, role }: { children: ReactNode; role?: 'client' | 'counselor' }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-brand-cream flex items-center justify-center font-serif text-3xl italic opacity-50">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (!profile) return <Navigate to="/register" />;
  if (role && profile.role !== role) return <Navigate to={profile.role === 'counselor' ? '/counselor/dashboard' : '/client/dashboard'} />;

  return children;
}

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={user && !profile ? <Register /> : <Navigate to="/" />} />
      <Route 
        path="/client/dashboard" 
        element={
          <ProtectedRoute role="client">
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/counselor/dashboard" 
        element={
          <ProtectedRoute role="counselor">
            <CounselorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/session/:sessionId" 
        element={
          <ProtectedRoute>
            <SessionRoom />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

