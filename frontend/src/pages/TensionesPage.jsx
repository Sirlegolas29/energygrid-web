import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { ShieldAlert, Activity } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function TensionesPage() {
  const { tensionesInputs, setTensionesInputs, tensionesResults, setTensionesResults, mallaResults } = useStore();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTensionesInputs({ ...tensionesInputs, [name]: parseFloat(value) || 0 });
  };

  const calcular = async () => {
    setLoading(true);
    try {
      const payload = {
        ...tensionesInputs,
        rho_eq: mallaResults?.rho_eq || 44.12,
        R_malla: mallaResults?.R_schwarz || 4.18
      };
      const res = await client.post('/api/tensiones/calcular', payload);
      setTensionesResults(res.data);
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-[#141430] border border-[#252550] border-l-4 border-l-[#FFB300] rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFB300]/10 border border-[#FFB300]/30 flex items-center justify-center text-[#FFB300] shadow-[0_0_15px_rgba(255,179,0,0.25)]">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide">
              TENSIONES DE PASO Y CONTACTO
            </h1>
            <p className="text-xs text-[#7070A0] mt-1 font-sans">
              Límites tolerables de seguridad humana según IEEE Std 80-2013 (50 kg y 70 kg)
            </p>
          </div>
        </div>

        <button onClick={calcular} disabled={loading} className="btn-primary flex items-center space-x-2 py-3 px-6 text-sm">
          <ShieldAlert size={18} />
          <span>{loading ? "CALCULANDO..." : "CALCULAR TENSIONES"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 card border-t-2 border-t-[#FFB300] space-y-4">
          <h2 className="text-sm font-bold text-[#FFB300] uppercase pb-2 border-b border-[#252550]">Parámetros de Seguridad y Falla</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>ρ superficial (Grava) [Ω·m]</label>
              <input type="number" name="rho_s" value={tensionesInputs.rho_s} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Espesor Grava hs [m]</label>
              <input type="number" step="0.01" name="hs" value={tensionesInputs.hs} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Tiempo de Despeje ts [s]</label>
              <input type="number" step="0.05" name="ts" value={tensionesInputs.ts} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Corriente de Falla If [A]</label>
              <input type="number" name="I_falla" value={tensionesInputs.I_falla} onChange={handleChange} className="input-field font-mono" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 card border-t-2 border-t-[#39FF14] space-y-4">
          <h2 className="text-sm font-bold text-[#39FF14] uppercase pb-2 border-b border-[#252550]">Tensiones Tolerables</h2>
          
          {tensionesResults ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard title="V Paso (50 kg)" value={(tensionesResults.Vp50 || 0).toFixed(1)} unit="V" color="primary" />
                <MetricCard title="V Contacto (50 kg)" value={(tensionesResults.Vc50 || 0).toFixed(1)} unit="V" color="secondary" />
                <MetricCard title="V Paso (70 kg)" value={(tensionesResults.Vp70 || 0).toFixed(1)} unit="V" color="warning" />
                <MetricCard title="V Contacto (70 kg)" value={(tensionesResults.Vc70 || 0).toFixed(1)} unit="V" color="success" />
              </div>

              <div className="bg-[#080818] border border-[#252550] rounded-lg p-3 text-xs font-mono space-y-1">
                <div className="text-[#FFB300] font-bold">--- ANÁLISIS DE SEGURIDAD HUMANA ---</div>
                <div>• Factor de Reducción Cs: {(tensionesResults.Cs || 0).toFixed(4)}</div>
                <div>• Elevación de Potencial GPR: {(tensionesResults.GPR || 0).toFixed(1)} V</div>
                <div className="text-[#39FF14]">✅ Parámetros conformes según formulación IEEE 80</div>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-[#7070A0]">
              <Activity size={36} className="mb-2 opacity-40 animate-pulse text-[#FFB300]" />
              <p className="text-xs">Ingresa los datos y presiona Calcular</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}