import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { CheckCircle, Activity, Disc } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function SeccionPage() {
  const { seccionInputs, setSeccionInputs, seccionResults, setSeccionResults } = useStore();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSeccionInputs({ 
      ...seccionInputs, 
      [name]: name === 'material' ? value : (parseFloat(value) || 0) 
    });
  };

  const calcular = async () => {
    setLoading(true);
    try {
      const res = await client.post('/api/seccion/calcular', seccionInputs);
      setSeccionResults(res.data);
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const materiales = [
    "Cobre recocido sólido",
    "Cobre estañado (7 hilos)",
    "Cobre duro sólido",
    "Aluminio conductor sólido",
    "Acero galvanizado",
    "Cobre recubierto acero"
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-[#141430] border border-[#252550] border-l-4 border-l-[#39FF14] rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.25)]">
            <CheckCircle size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide">
              SECCIÓN MÍNIMA DEL CONDUCTOR
            </h1>
            <p className="text-xs text-[#7070A0] mt-1 font-sans">
              Dimensionamiento térmico del conductor de malla según IEEE Std 80 §11.3
            </p>
          </div>
        </div>

        <button onClick={calcular} disabled={loading} className="btn-primary flex items-center space-x-2 py-3 px-6 text-sm">
          <Disc size={18} />
          <span>{loading ? "CALCULANDO..." : "CALCULAR SECCIÓN"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 card border-t-2 border-t-[#39FF14] space-y-4">
          <h2 className="text-sm font-bold text-[#39FF14] uppercase pb-2 border-b border-[#252550]">Parámetros de Entrada</h2>
          
          <div className="space-y-4">
            <div>
              <label>Corriente de Falla If [A]</label>
              <input type="number" name="I_falla" value={seccionInputs.I_falla} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Tiempo de Despeje ts [s]</label>
              <input type="number" step="0.05" name="ts" value={seccionInputs.ts} onChange={handleChange} className="input-field font-mono" />
            </div>
            <div>
              <label>Material del Conductor</label>
              <select name="material" value={seccionInputs.material} onChange={handleChange} className="input-field font-sans">
                {materiales.map(m => (
                  <option key={m} value={m} className="bg-[#0E0E28] text-white">{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 card border-t-2 border-t-[#00BFFF] space-y-4">
          <h2 className="text-sm font-bold text-[#00BFFF] uppercase pb-2 border-b border-[#252550]">Sección Recomendada</h2>
          
          {seccionResults ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <MetricCard title="S Calculada" value={(seccionResults.S_calc || 0).toFixed(2)} unit="mm²" color="primary" />
                <MetricCard title="S Normalizada" value={(seccionResults.S_norm || 0).toFixed(1)} unit="mm²" color="success" />
                <MetricCard title="Factor K" value={(seccionResults.K || 0)} unit="" color="warning" />
              </div>

              <div className={`p-3 rounded-lg text-center text-xs font-bold border ${
                seccionResults.cumple_norma 
                  ? "bg-[#1A3D1A]/50 border-[#39FF14]/40 text-[#39FF14]" 
                  : "bg-[#3D1A1A]/50 border-[#FF3347]/40 text-[#FF3347]"
              }`}>
                {seccionResults.cumple_norma 
                  ? "✅ Sección cumple con el mínimo normativo de 25 mm² (RPTD N°06)" 
                  : "❌ Sección inferior al mínimo normativo (≥ 25 mm² requerido)"}
              </div>

              {/* Comparativa de materiales */}
              <div className="bg-[#080818] border border-[#252550] rounded-lg p-3 text-[11px] font-mono space-y-1.5">
                <div className="text-[#39FF14] font-bold pb-1 border-b border-[#252550]">COMPARATIVA POR MATERIAL (IEEE 80):</div>
                {seccionResults.comparativa?.map(c => (
                  <div key={c.material} className="flex justify-between items-center py-0.5">
                    <span className="text-slate-400">{c.material} (K={c.K}):</span>
                    <span className="text-white font-bold">{c.S_calc.toFixed(1)} mm² → <span className="text-[#00BFFF]">{c.S_norm} mm²</span></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-[#7070A0]">
              <Activity size={36} className="mb-2 opacity-40 animate-pulse text-[#39FF14]" />
              <p className="text-xs">Ingresa los datos y presiona Calcular</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}