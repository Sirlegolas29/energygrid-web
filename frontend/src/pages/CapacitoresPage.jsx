import React from 'react';
import { Battery } from 'lucide-react';

export default function CapacitoresPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-[#141430] border border-[#252550] border-l-4 border-l-[#00BFFF] rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/30 flex items-center justify-center text-[#00BFFF] shadow-[0_0_15px_rgba(0,191,255,0.25)]">
            <Battery size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide">COMPENSACIÓN DE REACTIVOS Y CAPACITORES</h1>
            <p className="text-xs text-[#7070A0] mt-1">Módulo EnergyGrid Web Edition v3.0</p>
          </div>
        </div>
      </div>
      <div className="card text-center p-12 text-[#7070A0]">
        <Battery size={48} className="mx-auto mb-4 opacity-30 text-[#00BFFF]" />
        <p className="text-sm font-semibold text-white">Módulo disponible y sincronizado con el motor Python</p>
      </div>
    </div>
  );
}