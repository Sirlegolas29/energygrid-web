import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Zap, Cpu, Activity } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function TransformadorPage() {
  const { trafoInputs, setTrafoInputs, trafoResults, setTrafoResults } = useStore();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrafoInputs({ ...trafoInputs, [name]: parseFloat(value) || 0 });
  };

  const calcular = async () => {
    setLoading(true);
    try {
      const res = await client.post('/api/transformador/calcular', trafoInputs);
      setTrafoResults(res.data);
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-[#141430] border border-[#252550] border-l-4 border-l-[#7B2FFF] rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#7B2FFF]/10 border border-[#7B2FFF]/30 flex items-center justify-center text-[#7B2FFF] shadow-[0_0_15px_rgba(123,47,255,0.25)]">
            <Zap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide">
              TRANSFORMADOR DE POTENCIA
            </h1>
            <p className="text-xs text-[#7070A0] mt-1">
              Impedancia de cortocircuito (Zt, Rt, Xt) y corrientes nominales BT / MT
            </p>
          </div>
        </div>

        <button onClick={calcular} disabled={loading} className="btn-primary flex items-center space-x-2 py-3 px-6 text-sm">
          <Cpu size={18} />
          <span>{loading ? "CALCULANDO..." : "CALCULAR IMPEDANCIA"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 card border-t-2 border-t-[#7B2FFF] space-y-4">
          <h2 className="text-sm font-bold text-[#7B2FFF] uppercase pb-2 border-b border-[#252550]">Parámetros del Transformador</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Potencia Nominal S [kVA]</label>
              <input type="number" name="S_kva" value={trafoInputs.S_kva} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Tensión L-L [V]</label>
              <input type="number" name="V_ll" value={trafoInputs.V_ll} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Tensión MT [kV]</label>
              <input type="number" step="0.1" name="V_mt_kv" value={trafoInputs.V_mt_kv} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Tensión Cortocircuito ucc [%]</label>
              <input type="number" step="0.1" name="ucc_pct" value={trafoInputs.ucc_pct} onChange={handleChange} className="input-field font-mono" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 card border-t-2 border-t-[#00BFFF] space-y-4">
          <h2 className="text-sm font-bold text-[#00BFFF] uppercase pb-2 border-b border-[#252550]">Resultados</h2>
          
          {trafoResults ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard title="Zt (Total)" value={(trafoResults.impedancia?.Zt_mOhm || 0).toFixed(2)} unit="mΩ" color="primary" />
                <MetricCard title="Xt (Reactancia)" value={(trafoResults.impedancia?.Xt_mOhm || 0).toFixed(2)} unit="mΩ" color="secondary" />
                <MetricCard title="I Nominal BT" value={(trafoResults.potencia?.I_nom_bt || 0).toFixed(1)} unit="A" color="warning" />
                <MetricCard title="I Nominal MT" value={(trafoResults.potencia?.I_nom_mt || 0).toFixed(2)} unit="A" color="success" />
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-[#7070A0]">
              <Activity size={36} className="mb-2 opacity-40 animate-pulse text-[#7B2FFF]" />
              <p className="text-xs">Ingresa los datos y presiona Calcular</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}