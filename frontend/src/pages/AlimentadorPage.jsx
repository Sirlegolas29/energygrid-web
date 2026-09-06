import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Cable, Activity, Database, CheckCircle, Search } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { DATA_RIC_4, DATA_RVK_MONOPOLAR, CABLE_RESISTANCE_OHM_KM } from '../constants/referenceData';

export default function AlimentadorPage() {
  const { alimInputs, setAlimInputs, alimResults, setAlimResults } = useStore();
  const [activeTab, setActiveTab] = useState('nominal'); // 'nominal', 'conductor', 'falla'
  const [activeRefTable, setActiveRefTable] = useState('ric'); // 'ric', 'rvk'
  const [searchTerm, setSearchTerm] = useState('');
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
      {/* Header */}
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
              Caída de tensión (ΔV), selección por ampacidad normativo (RIC N°4 / RV-K) y cortocircuito
            </p>
          </div>
        </div>

        <button onClick={calcular} disabled={loading} className="btn-primary flex items-center space-x-2 py-3 px-6 text-sm">
          <Cable size={18} />
          <span>{loading ? "CALCULANDO..." : "CALCULAR TODO"}</span>
        </button>
      </div>

      {/* Sub-Pestañas de la sección */}
      <div className="flex space-x-2 border-b border-[#252550] pb-2">
        <button
          onClick={() => setActiveTab('nominal')}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-display tracking-wider transition-all ${
            activeTab === 'nominal'
              ? 'bg-[#00BFFF] text-black shadow-[0_0_15px_rgba(0,191,255,0.4)]'
              : 'text-[#7070A0] hover:bg-[#141430] hover:text-white'
          }`}
        >
          ⚡ 1. CORRIENTE NOMINAL & ΔV
        </button>
        <button
          onClick={() => setActiveTab('conductor')}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-display tracking-wider transition-all ${
            activeTab === 'conductor'
              ? 'bg-[#FF2D78] text-white shadow-[0_0_15px_rgba(255,45,120,0.4)]'
              : 'text-[#7070A0] hover:bg-[#141430] hover:text-white'
          }`}
        >
          📚 2. TABLAS DE CONDUCTOR (RIC N°4 / RV-K)
        </button>
        <button
          onClick={() => setActiveTab('falla')}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-display tracking-wider transition-all ${
            activeTab === 'falla'
              ? 'bg-[#FFB300] text-black shadow-[0_0_15px_rgba(255,179,0,0.4)]'
              : 'text-[#7070A0] hover:bg-[#141430] hover:text-white'
          }`}
        >
          💥 3. CORRIENTES DE CORTOCIRCUITO
        </button>
      </div>

      {/* Contenido según pestaña activa */}
      {activeTab === 'conductor' ? (
        /* VISTA COMPLETA DE TABLAS DE REFERENCIA NORMATIVAS */
        <div className="card border-t-2 border-t-[#FF2D78] space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#252550]">
            <div className="flex items-center space-x-3">
              <Database size={20} className="text-[#FF2D78]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Tablas Normativas de Ampacidad y Resistencia
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveRefTable('ric')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeRefTable === 'ric' ? 'bg-[#00BFFF] text-black' : 'bg-[#0E0E28] text-[#7070A0] border border-[#252550]'
                }`}
              >
                TABLA RIC N°4 (SEC)
              </button>
              <button
                onClick={() => setActiveRefTable('rvk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeRefTable === 'rvk' ? 'bg-[#FF2D78] text-white' : 'bg-[#0E0E28] text-[#7070A0] border border-[#252550]'
                }`}
              >
                FABRICANTE RV-K (TOP CABLE)
              </button>
            </div>
          </div>

          {/* Tabla interactiva con scroll */}
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto rounded-lg border border-[#252550]">
            {activeRefTable === 'ric' ? (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#141430] text-[#00BFFF] sticky top-0 uppercase tracking-wider border-b border-[#252550]">
                  <tr>
                    <th className="p-3">Sección [mm²]</th>
                    <th className="p-3">AWG/MCM</th>
                    <th className="p-3">Método D1 (20°C) [A]</th>
                    <th className="p-3">Método D2 (20°C) [A]</th>
                    <th className="p-3">Método E (30°C) [A]</th>
                    <th className="p-3">Método F (30°C) [A]</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252550] bg-[#080818]/60 text-slate-300">
                  {Object.entries(DATA_RIC_4).map(([secc, d]) => (
                    <tr key={secc} className="hover:bg-[#1E1E48]/50 transition-colors">
                      <td className="p-3 font-bold text-white">{secc} mm²</td>
                      <td className="p-3 text-[#FFB300]">{d.AWG}</td>
                      <td className="p-3">{d.D1} A</td>
                      <td className="p-3">{d.D2} A</td>
                      <td className="p-3">{d.E} A</td>
                      <td className="p-3">{d.F ? `${d.F} A` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#141430] text-[#FF2D78] sticky top-0 uppercase tracking-wider border-b border-[#252550]">
                  <tr>
                    <th className="p-3">Sección [mm²]</th>
                    <th className="p-3">Calibre AWG</th>
                    <th className="p-3">En Aire 30°C [A]</th>
                    <th className="p-3">Enterrado 30°C [A]</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252550] bg-[#080818]/60 text-slate-300">
                  {Object.entries(DATA_RVK_MONOPOLAR).map(([secc, d]) => (
                    <tr key={secc} className="hover:bg-[#1E1E48]/50 transition-colors">
                      <td className="p-3 font-bold text-white">{secc} mm²</td>
                      <td className="p-3 text-[#FFB300]">{d.AWG}</td>
                      <td className="p-3 text-[#39FF14]">{d["En Aire 30°"]} A</td>
                      <td className="p-3 text-[#00BFFF]">{d["Enterrado 30°"]} A</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* VISTA DE CÁLCULO FORMULARIO / RESULTADOS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 card border-t-2 border-t-[#FF2D78] space-y-4">
            <h2 className="text-sm font-bold text-[#FF2D78] uppercase pb-2 border-b border-[#252550]">
              {activeTab === 'nominal' ? "Parámetros del Alimentador" : "Parámetros de Falla"}
            </h2>
            
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
            <h2 className="text-sm font-bold text-[#00BFFF] uppercase pb-2 border-b border-[#252550]">
              Resultados de Verificación
            </h2>
            
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
                  <div className="text-[#FF2D78] font-bold">--- DIAGNÓSTICO DE CAÍDA DE TENSIÓN Y FALLA ---</div>
                  <div>• Caída Porcentual: {(alimResults.caida_tension?.pct || 0).toFixed(2)}% {(alimResults.caida_tension?.pct || 0) <= 3.0 ? "✅ Cumple recomendación RIC N°4 (≤ 3%)" : "⚠️ Excede el 3%"}</div>
                  <div>• Factor Asimetría k3: {(alimResults.corrientes_falla?.k3 || 1).toFixed(3)}</div>
                  <div>• Icc3 Asimétrica Pico: {(alimResults.corrientes_falla?.I_cc3_asym_kA || 0).toFixed(2)} kA</div>
                  <div>• Icc1 Asimétrica: {(alimResults.corrientes_falla?.I_cc1_asym_kA || 0).toFixed(2)} kA</div>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center text-[#7070A0]">
                <Activity size={36} className="mb-2 opacity-40 animate-pulse text-[#FF2D78]" />
                <p className="text-xs">Presiona "CALCULAR TODO" para procesar el alimentador</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}