import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Cable, Activity } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function AlimentadorPage() {
  const { alimInputs, setAlimInputs, alimResults, setAlimResults } = useStore();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlimInputs({ ...alimInputs, [name]: parseFloat(value) || 0 });
  };

  const calcular = async () => {
    setLoading(true);
    try {
      const res = await client.post('/api/alimentador/calcular', alimInputs);
      setAlimResults(res.data);
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-[#141430] border border-[#252550] border-l-4 border-l-[#FF2D78] rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF2D78]/10 border border-[#FF2D78]/30 flex items-center justify-center text-[#FF2D78] shadow-[0_0_15px_rgba(255,45,120,0.25)]">
            <Cable size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide">
              ALIMENTADOR Y CORRIENTES DE FALLA
            </h1>
            <p className="text-xs text-[#7070A0] mt-1 font-sans">
              Caída de tensión (ΔV), selección de conductor (RIC N°4) y corrientes Icc3 / Icc1
            </p>
          </div>
        </div>

        <button onClick={calcular} disabled={loading} className="btn-primary flex items-center space-x-2 py-3 px-6 text-sm">
          <Cable size={18} />
          <span>{loading ? "CALCULANDO..." : "CALCULAR ALIMENTADOR"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 card border-t-2 border-t-[#FF2D78] space-y-4">
          <h2 className="text-sm font-bold text-[#FF2D78] uppercase pb-2 border-b border-[#252550]">Parámetros del Alimentador</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Tensión Nominal [V]</label>
              <input type="number" name="V_ll" value={alimInputs.V_ll} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Longitud Alimentador [m]</label>
              <input type="number" name="longitud_m" value={alimInputs.longitud_m} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Corriente Nominal [A]</label>
              <input type="number" name="I_nom_bt" value={alimInputs.I_nom_bt} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Resistencia Malla R [Ω]</label>
              <input type="number" step="0.01" name="R_malla" value={alimInputs.R_malla} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>R Cable [Ω/km]</label>
              <input type="number" step="0.001" name="R_linea_ohm_km" value={alimInputs.R_linea_ohm_km} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>X Cable [Ω/km]</label>
              <input type="number" step="0.001" name="X_linea_ohm_km" value={alimInputs.X_linea_ohm_km} onChange={handleChange} className="input-field font-mono" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 card border-t-2 border-t-[#00BFFF] space-y-4">
          <h2 className="text-sm font-bold text-[#00BFFF] uppercase pb-2 border-b border-[#252550]">Resultados</h2>
          
          {alimResults ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard 
                  title="Caída ΔV Línea" 
                  value={(alimResults.caida_tension?.dVl || 0).toFixed(2)} 
                  unit="V" 
                  color="primary" 
                />
                <MetricCard 
                  title="Caída ΔV %" 
                  value={(alimResults.caida_tension?.pct || 0).toFixed(2)} 
                  unit="%" 
                  color={(alimResults.caida_tension?.pct || 0) <= 3.0 ? "success" : "warning"} 
                />
                <MetricCard 
                  title="Icc3 Simétrica" 
                  value={(alimResults.corrientes_falla?.I_cc3_sym_kA || 0).toFixed(2)} 
                  unit="kA" 
                  color="warning" 
                />
                <MetricCard 
                  title="Icc1 Simétrica" 
                  value={(alimResults.corrientes_falla?.I_cc1_sym_kA || 0).toFixed(2)} 
                  unit="kA" 
                  color="secondary" 
                />
              </div>

              <div className="bg-[#080818] border border-[#252550] rounded-lg p-3 text-xs font-mono space-y-1">
                <div className="text-[#FF2D78] font-bold">--- DIAGNÓSTICO DE CAÍDA DE TENSIÓN ---</div>
                <div>• Caída de Tensión: {(alimResults.caida_tension?.pct || 0).toFixed(2)}% {(alimResults.caida_tension?.pct || 0) <= 3.0 ? "✅ Cumple límite 3% RIC N°4" : "⚠️ Excede recomendación de 3%"}</div>
                <div>• Factor Asimetría k3: {(alimResults.corrientes_falla?.k3 || 1).toFixed(3)}</div>
                <div>• Icc3 Asimétrica Pico: {(alimResults.corrientes_falla?.I_cc3_asym_kA || 0).toFixed(2)} kA</div>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-[#7070A0]">
              <Activity size={36} className="mb-2 opacity-40 animate-pulse text-[#FF2D78]" />
              <p className="text-xs">Ingresa los datos y presiona Calcular</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}