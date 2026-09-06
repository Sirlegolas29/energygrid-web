import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Zap, Cable, ShieldAlert, CheckCircle, Battery, FileText, LogOut } from 'lucide-react';
import useStore from '../store/useStore';

export default function Sidebar() {
  const setToken = useStore(state => state.setToken);

  const links = [
    { to: "/malla", icon: <Activity size={18} />, text: "1. Malla a Tierra", color: "text-[#00BFFF]" },
    { to: "/transformador", icon: <Zap size={18} />, text: "2. Transformador", color: "text-[#7B2FFF]" },
    { to: "/alimentador", icon: <Cable size={18} />, text: "3. Alimentador", color: "text-[#FF2D78]" },
    { to: "/tensiones", icon: <ShieldAlert size={18} />, text: "4. Tensiones", color: "text-[#FFB300]" },
    { to: "/seccion", icon: <CheckCircle size={18} />, text: "5. Sección Conductor", color: "text-[#39FF14]" },
    { to: "/capacitores", icon: <Battery size={18} />, text: "6. Capacitores", color: "text-[#00BFFF]" },
    { to: "/resumen", icon: <FileText size={18} />, text: "7. Resumen y Reporte", color: "text-[#40D4FF]" },
  ];

  return (
    <div className="w-64 h-screen bg-[#0E0E28] border-r border-[#252550] flex flex-col justify-between shadow-2xl z-20">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#252550]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#00BFFF]/20 border border-[#00BFFF] flex items-center justify-center text-[#00BFFF] shadow-[0_0_10px_rgba(0,191,255,0.4)]">
              ⚡
            </div>
            <h1 className="text-xl font-bold font-display tracking-wider text-white">
              ENERGY<span className="text-[#00BFFF]">GRID</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse shadow-[0_0_8px_#39FF14]"></span>
            <p className="text-[11px] font-mono text-[#7070A0]">v3.0 Premium Ultra</p>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({isActive}) => 
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#1E1E48] text-white border-l-4 border-l-[#00BFFF] border border-[#252550] shadow-[0_0_15px_rgba(0,191,255,0.2)]' 
                    : 'text-[#7070A0] hover:bg-[#141430] hover:text-[#D8D8F0]'
                }`
              }
            >
              <span className={link.color}>{link.icon}</span>
              <span>{link.text}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#252550]">
        <button 
          onClick={() => setToken(null)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold text-[#FF3347] bg-[#FF3347]/10 border border-[#FF3347]/30 hover:bg-[#FF3347] hover:text-white transition-all duration-200 shadow-sm"
        >
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}