import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Battery, Activity, Database, Shield } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { CAP_BANK_PROTECTION_DB, CAP_BANK_CABLE_DB } from '../constants/referenceData';

export default function CapacitoresPage() {
  const { capInputs, setCapInputs, capResults, setCapResults } = useStore();
  const [activeTab, setActiveTab] = useState('calculo'); // 'calculo', 'tablas'
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCapInputs({ ...capInputs, [name]: parseFloat(value) || 0 });
  };

  const calcular = async () => {
    setLoading(true);
    try {
      const res = await client.post('/api/capacitores/calcular', capInputs);
      const q = res.data.banco_sugerido_kvar || 90;
      
      // Obtener protecciones y cables de la base de datos
      const protec = CAP_BANK_PROTECTION_DB[q] || { "50kA": "NSX250N TM250D", "65kA": "NSX250H TM250D" };
      const cable = CAP_BANK_CABLE_DB[q] || { "In_A": res.data.I_banco_A || 136, "Cable": "1x 95 mm²" };

      setCapResults({
        ...res.data,
        proteccion: protec,
        cableado: cable
      });
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
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
              Corrección del factor de potencia (cos φ), selección de banco comercial y protecciones
            </p>
          </div>
        </div>

        <button onClick={calcular} disabled={loading} className="btn-primary flex items-center space-x-2 py-3 px-6 text-sm">
          <Battery size={18} />
          <span>{loading ? "CALCULANDO..." : "CALCULAR BANCO"}</span>
        </button>
      </div>

      {/* Sub-Pestañas */}
      <div className="flex space-x-2 border-b border-[#252550] pb-2">
        <button
          onClick={() => setActiveTab('calculo')}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-display tracking-wider transition-all ${
            activeTab === 'calculo'
              ? 'bg-[#00BFFF] text-black shadow-[0_0_15px_rgba(0,191,255,0.4)]'
              : 'text-[#7070A0] hover:bg-[#141430] hover:text-white'
          }`}
        >
          ⚡ 1. CÁLCULO DE POTENCIA REACTIVA
        </button>
        <button
          onClick={() => setActiveTab('tablas')}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-display tracking-wider transition-all ${
            activeTab === 'tablas'
              ? 'bg-[#7B2FFF] text-white shadow-[0_0_15px_rgba(123,47,255,0.4)]'
              : 'text-[#7070A0] hover:bg-[#141430] hover:text-white'
          }`}
        >
          📚 2. TABLAS DE PROTECCIÓN Y CABLEADO (SCHNEIDER)
        </button>
      </div>

      {activeTab === 'tablas' ? (
        /* TABLAS DE REFERENCIA DE CAPACITORES */
        <div className="card border-t-2 border-t-[#7B2FFF] space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-[#252550]">
            <Database size={20} className="text-[#7B2FFF]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Tablas de Selección de Interruptores y Cables para Bancos de Condensadores
            </h2>
          </div>

          <div className="overflow-x-auto max-h-[480px] overflow-y-auto rounded-lg border border-[#252550]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141430] text-[#00BFFF] sticky top-0 uppercase tracking-wider border-b border-[#252550]">
                <tr>
                  <th className="p-3">Banco [kVAR]</th>
                  <th className="p-3">Corriente In [A]</th>
                  <th className="p-3">Cable Recomendado</th>
                  <th className="p-3">Interruptor (50 kA)</th>
                  <th className="p-3">Interruptor (65 kA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252550] bg-[#080818]/60 text-slate-300">
                {Object.entries(CAP_BANK_PROTECTION_DB).map(([kvar, p]) => {
                  const cable = CAP_BANK_CABLE_DB[kvar] || { In_A: "-", Cable: "-" };
                  return (
                    <tr key={kvar} className="hover:bg-[#1E1E48]/50 transition-colors">
                      <td className="p-3 font-bold text-white">{kvar} kVAR</td>
                      <td className="p-3 text-[#FFB300]">{cable.In_A} A</td>
                      <td className="p-3 text-[#39FF14]">{cable.Cable}</td>
                      <td className="p-3 text-[#00BFFF]">{p["50kA"]}</td>
                      <td className="p-3 text-[#FF2D78]">{p["65kA"]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISTA DE CÁLCULO FORMULARIO / RESULTADOS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 card border-t-2 border-t-[#00BFFF] space-y-4">
            <h2 className="text-sm font-bold text-[#00BFFF] uppercase pb-2 border-b border-[#252550]">
              Parámetros de Potencia y Factor
            </h2>
            
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
            <h2 className="text-sm font-bold text-[#7B2FFF] uppercase pb-2 border-b border-[#252550]">
              Banco de Condensadores Recomendado
            </h2>
            
            {capResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard title="Q Calculado" value={(capResults.Q_kvar_calculado || 0).toFixed(1)} unit="kVAR" color="warning" />
                  <MetricCard title="Banco Sugerido" value={(capResults.banco_sugerido_kvar || 0).toFixed(0)} unit="kVAR" color="primary" />
                  <MetricCard title="Corriente In" value={(capResults.I_banco_A || 0).toFixed(1)} unit="A" color="secondary" />
                </div>

                {capResults.proteccion && (
                  <div className="bg-[#080818] border border-[#252550] rounded-lg p-3 text-xs font-mono space-y-2">
                    <div className="text-[#39FF14] font-bold pb-1 border-b border-[#252550]">
                      PROTECCIÓN Y CABLEADO SUGERIDO (SCHNEIDER ELECTRIC):
                    </div>
                    <div>• Cable sugerido: <span className="text-white font-bold">{capResults.cableado?.Cable}</span></div>
                    <div>• Interruptor (Poder de corte 50 kA): <span className="text-[#00BFFF] font-bold">{capResults.proteccion?.["50kA"]}</span></div>
                    <div>• Interruptor (Poder de corte 65 kA): <span className="text-[#FF2D78] font-bold">{capResults.proteccion?.["65kA"]}</span></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center text-[#7070A0]">
                <Activity size={36} className="mb-2 opacity-40 animate-pulse text-[#00BFFF]" />
                <p className="text-xs">Presiona "CALCULAR BANCO" para ver la selección y protecciones</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}