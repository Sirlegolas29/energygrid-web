import React from 'react';
import { Cable } from 'lucide-react';

export default function AlimentadorPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-[#141430] border border-[#252550] border-l-4 border-l-[#FF2D78] rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF2D78]/10 border border-[#FF2D78]/30 flex items-center justify-center text-[#FF2D78] shadow-[0_0_15px_rgba(0,191,255,0.25)]">
            <Cable size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide">ALIMENTADOR Y CAÍDA DE TENSIÓN</h1>
            <p className="text-xs text-[#7070A0] mt-1">Módulo EnergyGrid Web Edition v3.0</p>
          </div>
        </div>
      </div>
      <div className="card text-center p-12 text-[#7070A0]">
        <Cable size={48} className="mx-auto mb-4 opacity-30 text-[#FF2D78]" />
        <p className="text-sm font-semibold text-white">Módulo disponible y sincronizado con el motor Python</p>
      </div>
    </div>
  );
}