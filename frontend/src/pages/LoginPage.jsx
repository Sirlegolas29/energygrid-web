import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Zap, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
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
      setError(err.response?.data?.detail || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080818] relative overflow-hidden p-4">
      {/* Luces de fondo estilo neón */}
      <div className="absolute w-[500px] h-[500px] bg-[#00BFFF]/10 rounded-full blur-[120px] -top-32 -left-32 pointer-events-none"></div>
      <div className="absolute w-[450px] h-[450px] bg-[#7B2FFF]/10 rounded-full blur-[120px] -bottom-32 -right-32 pointer-events-none"></div>
      
      <div className="card w-full max-w-md z-10 border border-[#252550] border-t-4 border-t-[#00BFFF] bg-[#141430]/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#00BFFF]/10 border border-[#00BFFF]/40 flex items-center justify-center mx-auto mb-4 text-[#00BFFF] shadow-[0_0_25px_rgba(0,191,255,0.35)]">
            <Zap size={32} />
          </div>
          <h2 className="text-3xl font-bold font-display text-white tracking-widest">
            ENERGY<span className="text-[#00BFFF]">GRID</span>
          </h2>
          <p className="text-xs text-[#7070A0] mt-2 font-mono">
            Plataforma Web de Cálculo y Verificación Eléctrica
          </p>
        </div>

        {error && (
          <div className="bg-[#FF3347]/10 border border-[#FF3347]/40 text-[#FF3347] p-3 rounded-lg mb-6 text-xs text-center font-medium shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#00BFFF]">USUARIO</label>
            <input 
              type="text" 
              className="input-field font-mono text-sm"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#00BFFF]">CONTRASEÑA</label>
            <input 
              type="password" 
              className="input-field font-mono text-sm"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary w-full py-3 mt-6 flex justify-center items-center text-sm font-bold"
            disabled={loading}
          >
            {loading ? <span className="animate-pulse">AUTENTICANDO...</span> : 'INICIAR SESIÓN'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-[#252550] flex items-center justify-between text-[11px] text-[#7070A0]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#39FF14]" /> Acceso Seguro
          </span>
          <span className="font-mono">v3.0 Ultra</span>
        </div>
      </div>
    </div>
  );
}