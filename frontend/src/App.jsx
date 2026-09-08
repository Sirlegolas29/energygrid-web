import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import client from './api/client';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import MallaPage from './pages/MallaPage';
import TransformadorPage from './pages/TransformadorPage';
import AlimentadorPage from './pages/AlimentadorPage';
import TensionesPage from './pages/TensionesPage';
import SeccionPage from './pages/SeccionPage';
import CapacitoresPage from './pages/CapacitoresPage';
import ResumenPage from './pages/ResumenPage';

function ProtectedRoute({ children }) {
  const token = useStore(state => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen overflow-hidden bg-[#080818]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gradient-to-br from-[#0C0C22] to-[#080818]">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const token = useStore(state => state.token);
  const setUser = useStore(state => state.setUser);
  const logout = useStore(state => state.logout);

  useEffect(() => {
    if (token) {
      client.get('/api/auth/me')
        .then(res => {
          if (res.data) setUser(res.data);
        })
        .catch(err => {
          // Si el token es inválido o expiró
          if (err.response?.status === 401) {
            logout();
          }
        });
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/malla" /> : <LoginPage />} />
        <Route path="/malla" element={<ProtectedRoute><MallaPage /></ProtectedRoute>} />
        <Route path="/transformador" element={<ProtectedRoute><TransformadorPage /></ProtectedRoute>} />
        <Route path="/alimentador" element={<ProtectedRoute><AlimentadorPage /></ProtectedRoute>} />
        <Route path="/tensiones" element={<ProtectedRoute><TensionesPage /></ProtectedRoute>} />
        <Route path="/seccion" element={<ProtectedRoute><SeccionPage /></ProtectedRoute>} />
        <Route path="/capacitores" element={<ProtectedRoute><CapacitoresPage /></ProtectedRoute>} />
        <Route path="/resumen" element={<ProtectedRoute><ResumenPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={token ? "/malla" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}