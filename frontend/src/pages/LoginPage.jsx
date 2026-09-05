import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useStore(state => state.setToken);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const res = await client.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      setToken(res.data.access_token);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -top-20 -left-20"></div>
      
      <div className="card w-full max-w-md z-10 border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="bg-blue-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30 shadow-lg shadow-blue-500/20">
            <Zap className="text-blue-400" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-wide">ENERGY<span className="text-cyan-400">GRID</span></h2>
          <p className="text-slate-400 mt-2">Acceso a la plataforma web</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Usuario</label>
            <input 
              type="text" 
              className="input-field"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Contraseña</label>
            <input 
              type="password" 
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary w-full py-3 mt-4 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? <span className="animate-pulse">Autenticando...</span> : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}