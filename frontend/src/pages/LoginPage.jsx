import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Zap, ShieldCheck, Eye, EyeOff, UserPlus, LogIn, User, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const setToken = useStore(state => state.setToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isRegister) {
      // Validaciones en Registro
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      if (password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres.');
        setLoading(false);
        return;
      }

      try {
        const res = await client.post('/api/auth/register', {
          username: username.trim(),
          password: password,
          full_name: fullName.trim() || username.trim(),
          email: email.trim() || null
        });

        setSuccessMsg('¡Cuenta creada con éxito! Ingresando...');
        setToken(res.data.access_token, res.data.user);
      } catch (err) {
        setError(err.response?.data?.detail || 'Error al registrar el usuario.');
      } finally {
        setLoading(false);
      }
    } else {
      // Iniciar Sesión
      try {
        const res = await client.post('/api/auth/login', {
          username: username.trim(),
          password: password
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        setToken(res.data.access_token, res.data.user);
      } catch (err) {
        setError(err.response?.data?.detail || 'Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    }
  };

  const switchMode = (toRegister) => {
    setIsRegister(toRegister);
    setError('');
    setSuccessMsg('');
    if (toRegister) {
      if (username === 'admin') setUsername('');
      if (password === 'admin') setPassword('');
    } else {
      if (!username) setUsername('admin');
      if (!password) setPassword('admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080818] relative overflow-hidden p-4">
      {/* Luces de fondo estilo neón */}
      <div className="absolute w-[500px] h-[500px] bg-[#00BFFF]/10 rounded-full blur-[120px] -top-32 -left-32 pointer-events-none"></div>
      <div className="absolute w-[450px] h-[450px] bg-[#7B2FFF]/10 rounded-full blur-[120px] -bottom-32 -right-32 pointer-events-none"></div>
      
      <div className="card w-full max-w-md z-10 border border-[#252550] border-t-4 border-t-[#00BFFF] bg-[#141430]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#00BFFF]/10 border border-[#00BFFF]/40 flex items-center justify-center mx-auto mb-3 text-[#00BFFF] shadow-[0_0_25px_rgba(0,191,255,0.35)]">
            <Zap size={28} />
          </div>
          <h2 className="text-3xl font-bold font-display text-white tracking-widest">
            ENERGY<span className="text-[#00BFFF]">GRID</span>
          </h2>
          <p className="text-xs text-[#7070A0] mt-1 font-mono">
            Plataforma Web de Cálculo y Verificación Eléctrica
          </p>
        </div>

        {/* Selector de Modo: Login vs Registro */}
        <div className="grid grid-cols-2 gap-2 bg-[#0E0E28] p-1 rounded-xl border border-[#252550] mb-6">
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold font-display tracking-wider transition-all duration-200 ${
              !isRegister
                ? 'bg-[#00BFFF] text-black shadow-[0_0_15px_rgba(0,191,255,0.4)]'
                : 'text-[#7070A0] hover:text-white'
            }`}
          >
            <LogIn size={14} />
            <span>INICIAR SESIÓN</span>
          </button>
          
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold font-display tracking-wider transition-all duration-200 ${
              isRegister
                ? 'bg-[#7B2FFF] text-white shadow-[0_0_15px_rgba(123,47,255,0.4)]'
                : 'text-[#7070A0] hover:text-white'
            }`}
          >
            <UserPlus size={14} />
            <span>CREAR CUENTA</span>
          </button>
        </div>

        {/* Mensajes de Alerta */}
        {error && (
          <div className="bg-[#FF3347]/10 border border-[#FF3347]/40 text-[#FF3347] p-3 rounded-lg mb-5 text-xs text-center font-medium shadow-sm animate-in fade-in duration-300">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] p-3 rounded-lg mb-5 text-xs text-center font-medium shadow-sm animate-in fade-in duration-300">
            {successMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="text-xs font-semibold text-[#00BFFF] flex items-center gap-1.5">
                  <User size={13} /> NOMBRE COMPLETO
                </label>
                <input 
                  type="text" 
                  className="input-field text-sm"
                  placeholder="Ej. Ing. Claudio González"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#00BFFF] flex items-center gap-1.5">
                  <Mail size={13} /> CORREO ELECTRÓNICO (OPCIONAL)
                </label>
                <input 
                  type="email" 
                  className="input-field text-sm font-mono"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-[#00BFFF] flex items-center gap-1.5">
              <User size={13} /> USUARIO
            </label>
            <input 
              type="text" 
              className="input-field font-mono text-sm"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#00BFFF] flex items-center gap-1.5 mb-0">
                <Lock size={13} /> CONTRASEÑA
              </label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#7070A0] hover:text-[#00BFFF] flex items-center gap-1 transition-colors"
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              className="input-field font-mono text-sm"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-[#00BFFF] flex items-center gap-1.5">
                <Lock size={13} /> CONFIRMAR CONTRASEÑA
              </label>
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field font-mono text-sm"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full py-3 mt-4 flex justify-center items-center text-xs font-bold font-display tracking-widest uppercase transition-all duration-300 rounded-lg ${
              isRegister 
                ? 'bg-[#7B2FFF] hover:bg-[#601ACB] text-white shadow-[0_0_20px_rgba(123,47,255,0.4)] hover:shadow-[0_0_25px_rgba(123,47,255,0.6)]' 
                : 'btn-primary'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-pulse">PROCESANDO...</span>
            ) : isRegister ? (
              'CREAR CUENTA Y ENTRAR'
            ) : (
              'INICIAR SESIÓN'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-[#252550] flex items-center justify-between text-[11px] text-[#7070A0]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#39FF14]" /> Autenticación Segura
          </span>
          <span className="font-mono text-[#00BFFF]">v3.0 Ultra</span>
        </div>
      </div>
    </div>
  );
}