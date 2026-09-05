import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import MallaPage from './pages/MallaPage';

function ProtectedRoute({ children }) {
  const token = useStore(state => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const token = useStore(state => state.token);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/malla" /> : <LoginPage />} />
        <Route path="/malla" element={<ProtectedRoute><MallaPage /></ProtectedRoute>} />
        {/* Agrega las demas rutas aqui */}
        <Route path="*" element={<Navigate to={token ? "/malla" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}