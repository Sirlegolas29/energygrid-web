import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Battery, Activity } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function CapacitoresPage() {
  const { capInputs, setCapInputs, capResults, setCapResults } = useStore();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCapInputs({ ...capInputs, [name]: parseFloat(value) || 0 });
  };

  const calcular = async () => {
    setLoading(true);
    try {
      const res = await client.post('/api/capacitores/calcular', capInputs);
      setCapResults(res.data);
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-[#141430] border border-[#252550] border-l-4 border-l-[#00BFFF] rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/30 flex items-center justify-center text-[#00BFFF] shadow-[0_0_15px_rgba(0,191,255,0.25)]">
            <Battery size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide">
              COMPENSACIÓN DE REACTIVOS Y BANCOS
            </h1>
            <p className="text-xs text-[#7070A0] mt-1 font-sans">
              Corrección del factor de potencia (cos φ) y selección de banco comercial
            </p>
          </div>
        </div>

        <button onClick={calcular} disabled={loading} className="btn-primary flex items-center space-x-2 py-3 px-6 text-sm">
          <Battery size={18} />
          <span>{loading ? "CALCULANDO..." : "CALCULAR BANCO"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 card border-t-2 border-t-[#00BFFF] space-y-4">
          <h2 className="text-sm font-bold text-[#00BFFF] uppercase pb-2 border-b border-[#252550]">Parámetros de Potencia y Factor</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Potencia Activa P [kW]</label>
              <input type="number" name="potencia_kw" value={capInputs.potencia_kw} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Tensión Servicio [V]</label>
              <input type="number" name="V_servicio" value={capInputs.V_servicio} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>FP Actual (cos φ₁)</label>
              <input type="number" step="0.01" min="0.5" max="0.99" name="fp_actual" value={capInputs.fp_actual} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>FP Objetivo (cos φ₂)</label>
              <input type="number" step="0.01" min="0.8" max="1.0" name="fp_objetivo" value={capInputs.fp_objetivo} onChange={handleChange} className="input-field font-mono" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 card border-t-2 border-t-[#7B2FFF] space-y-4">
          <h2 className="text-sm font-bold text-[#7B2FFF] uppercase pb-2 border-b border-[#252550]">Banco Recomendado</h2>
          
          {capResults ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <MetricCard title="Q Calculado" value={(capResults.Q_kvar_calculado || 0).toFixed(1)} unit="kVAR" color="warning" />
                <MetricCard title="Banco Sugerido" value={(capResults.banco_sugerido_kvar || 0).toFixed(0)} unit="kVAR" color="primary" />
                <MetricCard title="Corriente Banco" value={(capResults.I_banco_A || 0).toFixed(1)} unit="A" color="secondary" />
              </div>

              <div className="bg-[#080818] border border-[#252550] rounded-lg p-3 text-xs font-mono space-y-1">
                <div className="text-[#00BFFF] font-bold">--- BALANCE DE POTENCIA REACTIVA ---</div>
                <div>• Potencia Activa: {capResults.P_kw} kW</div>
                <div>• Factor Inicial: {capResults.fp_actual} → Factor Deseado: {capResults.fp_objetivo}</div>
                <div>• Banco Estándar Recomendado: <span className="text-[#39FF14] font-bold">{capResults.banco_sugerido_kvar} kVAR</span></div>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-[#7070A0]">
              <Activity size={36} className="mb-2 opacity-40 animate-pulse text-[#00BFFF]" />
              <p className="text-xs">Ingresa los datos y presiona Calcular</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}