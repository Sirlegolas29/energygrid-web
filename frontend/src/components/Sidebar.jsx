import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Zap, Cable, ShieldAlert, CheckCircle, Battery, FileText } from 'lucide-react';
import useStore from '../store/useStore';

export default function Sidebar() {
  const setToken = useStore(state => state.setToken);

  const links = [
    { to: "/malla", icon: <Activity size={20} />, text: "1. Malla" },
    { to: "/transformador", icon: <Zap size={20} />, text: "2. Transformador" },
    { to: "/alimentador", icon: <Cable size={20} />, text: "3. Alimentador" },
    { to: "/tensiones", icon: <ShieldAlert size={20} />, text: "4. Tensiones" },
    { to: "/seccion", icon: <CheckCircle size={20} />, text: "5. Sección" },
    { to: "/capacitores", icon: <Battery size={20} />, text: "6. Capacitores" },
    { to: "/resumen", icon: <FileText size={20} />, text: "7. Resumen" },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-500 tracking-wider">ENERGY<span className="text-cyan-400">GRID</span></h1>
        <p className="text-xs text-slate-500 mt-1">Web Edition v3.0</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({isActive}) => 
              `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.text}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => setToken(null)}
          className="w-full py-2 text-sm text-slate-500 hover:text-red-400 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}