import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Zap, Cpu, Activity, ShieldCheck, Database, Sliders } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { ECM_TC_DATABASE, ECM_TP_DATABASE, COOPER_FUSE_MT_SELECTION, COOPER_FUSE_MT_SPECS } from '../constants/referenceData';

export default function TransformadorPage() {
  const { trafoInputs, setTrafoInputs, trafoResults, setTrafoResults } = useStore();
  const [activeTab, setActiveTab] = useState('potencia'); // 'potencia', 'impedancia', 'ecm'
  const [loading, setLoading] = useState(false);

  // Estados específicos de ECM
  const [compania, setCompania] = useState('CGE');
  const [tensionMT, setTensionMT] = useState('12-13.2 kV');
  const [expansion, setExpansion] = useState('0%');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrafoInputs({ ...trafoInputs, [name]: parseFloat(value) || 0 });
  };

  const calcularTodo = async () => {
    setLoading(true);
    try {
      const res = await client.post('/api/transformador/calcular', trafoInputs);
      
      // Calcular localmente ECM y Fusible con las bases de datos de referencia exactas
      const kVA = trafoInputs.S_kva || 500;
      
      // TC
      let tcRatio = "N/A";
      if (ECM_TC_DATABASE[compania] && ECM_TC_DATABASE[compania][tensionMT]) {
        const potenciasTC = Object.keys(ECM_TC_DATABASE[compania][tensionMT]).map(Number).sort((a,b) => a - b);
        let matchKva = potenciasTC[potenciasTC.length - 1];
        for (let p of potenciasTC) {
          if (p >= kVA) { matchKva = p; break; }
        }
        tcRatio = ECM_TC_DATABASE[compania][tensionMT][matchKva]?.[expansion] || "N/A";
      }

      // TP
      const tpData = ECM_TP_DATABASE[compania]?.[tensionMT] || { "Relacion TP": "N/A", "Elementos": "N/A" };

      // Fusible Cooper MT
      const vLookup = tensionMT.includes('23') ? "23" : "13.8";
      let fuseType = "N/A";
      let fuseSpecs = null;
      if (COOPER_FUSE_MT_SELECTION[vLookup]) {
        const potenciasFus = Object.keys(COOPER_FUSE_MT_SELECTION[vLookup]).map(Number).sort((a,b) => a - b);
        let matchFusKva = potenciasFus[potenciasFus.length - 1];
        for (let p of potenciasFus) {
          if (p >= kVA) { matchFusKva = p; break; }
        }
        fuseType = COOPER_FUSE_MT_SELECTION[vLookup][matchFusKva];
        fuseSpecs = COOPER_FUSE_MT_SPECS["15.5"]?.[fuseType] || null;
      }

      setTrafoResults({
        ...res.data,
        ecm_data: {
          compania,
          tensionMT,
          expansion,
          tcRatio,
          tpData,
          fuseType,
          fuseSpecs
        }
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
      <div className="bg-[#141430] border border-[#252550] border-l-4 border-l-[#7B2FFF] rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#7B2FFF]/10 border border-[#7B2FFF]/30 flex items-center justify-center text-[#7B2FFF] shadow-[0_0_15px_rgba(123,47,255,0.25)]">
            <Zap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide">
              TRANSFORMADOR Y PROTECCIONES MT
            </h1>
            <p className="text-xs text-[#7070A0] mt-1 font-sans">
              Dimensionamiento, impedancias de cortocircuito y selección de protecciones ECM / Cooper
            </p>
          </div>
        </div>

        <button onClick={calcularTodo} disabled={loading} className="btn-primary flex items-center space-x-2 py-3 px-6 text-sm">
          <Cpu size={18} />
          <span>{loading ? "CALCULANDO..." : "CALCULAR TODO"}</span>
        </button>
      </div>

      {/* Navegación por Sub-Pestañas idéntica a la aplicación */}
      <div className="flex space-x-2 border-b border-[#252550] pb-2">
        <button
          onClick={() => setActiveTab('potencia')}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-display tracking-wider transition-all ${
            activeTab === 'potencia'
              ? 'bg-[#00BFFF] text-black shadow-[0_0_15px_rgba(0,191,255,0.4)]'
              : 'text-[#7070A0] hover:bg-[#141430] hover:text-white'
          }`}
        >
          ⚡ 1. POTENCIA
        </button>
        <button
          onClick={() => setActiveTab('impedancia')}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-display tracking-wider transition-all ${
            activeTab === 'impedancia'
              ? 'bg-[#7B2FFF] text-white shadow-[0_0_15px_rgba(123,47,255,0.4)]'
              : 'text-[#7070A0] hover:bg-[#141430] hover:text-white'
          }`}
        >
          🔌 2. IMPEDANCIA
        </button>
        <button
          onClick={() => setActiveTab('ecm')}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-display tracking-wider transition-all ${
            activeTab === 'ecm'
              ? 'bg-[#FF2D78] text-white shadow-[0_0_15px_rgba(255,45,120,0.4)]'
              : 'text-[#7070A0] hover:bg-[#141430] hover:text-white'
          }`}
        >
          🛡️ 3. ECM & FUSIBLE MT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Formularios de la Sub-Pestaña activa */}
        <div className="lg:col-span-6 space-y-6">
          {activeTab === 'potencia' && (
            <div className="card border-t-2 border-t-[#00BFFF] space-y-4">
              <h2 className="text-sm font-bold text-[#00BFFF] uppercase pb-2 border-b border-[#252550]">
                Parámetros de Potencia y Tensión
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Potencia Nominal S [kVA]</label>
                  <input type="number" name="S_kva" value={trafoInputs.S_kva} onChange={handleChange} className="input-field font-mono" />
                </div>
                <div>
                  <label>Tensión BT (L-L) [V]</label>
                  <input type="number" name="V_ll" value={trafoInputs.V_ll} onChange={handleChange} className="input-field font-mono" />
                </div>
                <div>
                  <label>Tensión MT [kV]</label>
                  <input type="number" step="0.1" name="V_mt_kv" value={trafoInputs.V_mt_kv} onChange={handleChange} className="input-field font-mono" />
                </div>
                <div>
                  <label>Factor de Potencia (FP)</label>
                  <input type="number" step="0.01" min="0.7" max="1" name="fp" value={trafoInputs.fp || 0.90} onChange={handleChange} className="input-field font-mono" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'impedancia' && (
            <div className="card border-t-2 border-t-[#7B2FFF] space-y-4">
              <h2 className="text-sm font-bold text-[#7B2FFF] uppercase pb-2 border-b border-[#252550]">
                Parámetros de Cortocircuito e Impedancia
              </h2>
              <div className="space-y-4">
                <div>
                  <label>Tensión de Cortocircuito ucc [%]</label>
                  <input type="number" step="0.1" name="ucc_pct" value={trafoInputs.ucc_pct} onChange={handleChange} className="input-field font-mono" />
                  <span className="text-[11px] text-[#7070A0] block mt-1">Estándar: 4.0% - 6.0% según IEC / ANSI</span>
                </div>
              </div>

              {/* Tabla de Referencia de ucc sugerida */}
              <div className="bg-[#080818] border border-[#252550] rounded-lg p-3 text-xs font-mono space-y-1">
                <div className="text-[#7B2FFF] font-bold pb-1 border-b border-[#252550]">TABLA DE REFERENCIA UCC (%)</div>
                <div className="flex justify-between py-0.5"><span>≤ 630 kVA:</span><span className="text-[#00BFFF]">4.0% - 4.5%</span></div>
                <div className="flex justify-between py-0.5"><span>800 - 1250 kVA:</span><span className="text-[#00BFFF]">5.0% - 5.5%</span></div>
                <div className="flex justify-between py-0.5"><span>≥ 1600 kVA:</span><span className="text-[#00BFFF]">6.0%</span></div>
              </div>
            </div>
          )}

          {activeTab === 'ecm' && (
            <div className="card border-t-2 border-t-[#FF2D78] space-y-4">
              <h2 className="text-sm font-bold text-[#FF2D78] uppercase pb-2 border-b border-[#252550]">
                Base de Datos y Selección ECM (Empalme MT)
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label>Compañía Distribuidora</label>
                  <select value={compania} onChange={e => setCompania(e.target.value)} className="input-field font-sans">
                    <option value="CGE">CGE</option>
                    <option value="ENEL (CHILECTRA)">ENEL (CHILECTRA)</option>
                    <option value="CHILQUINTA">CHILQUINTA</option>
                    <option value="SAESA">SAESA</option>
                  </select>
                </div>
                <div>
                  <label>Tensión de Servicio MT</label>
                  <select value={tensionMT} onChange={e => setTensionMT(e.target.value)} className="input-field font-sans">
                    <option value="12-13.2 kV">12 - 13.2 kV</option>
                    <option value="23 kV">23 kV</option>
                  </select>
                </div>
                <div>
                  <label>Expansión Futura</label>
                  <select value={expansion} onChange={e => setExpansion(e.target.value)} className="input-field font-sans">
                    <option value="0%">0% (Sin expansión)</option>
                    <option value="25%">25%</option>
                    <option value="50%">50%</option>
                    <option value="100%">100%</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Dashboard y Resultados Completos */}
        <div className="lg:col-span-6 space-y-6">
          <div className="card border-t-2 border-t-[#00BFFF] space-y-4">
            <h2 className="text-sm font-bold text-[#00BFFF] uppercase pb-2 border-b border-[#252550]">
              Resultados del Transformador y Protecciones
            </h2>
            
            {trafoResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard title="Zt (Total)" value={(trafoResults.impedancia?.Zt_mOhm || 0).toFixed(2)} unit="mΩ" color="primary" />
                  <MetricCard title="Xt (Reactancia)" value={(trafoResults.impedancia?.Xt_mOhm || 0).toFixed(2)} unit="mΩ" color="secondary" />
                  <MetricCard title="I Nominal BT" value={(trafoResults.potencia?.I_nom_bt || 0).toFixed(1)} unit="A" color="warning" />
                  <MetricCard title="I Nominal MT" value={(trafoResults.potencia?.I_nom_mt || 0).toFixed(2)} unit="A" color="success" />
                </div>

                {/* Desglose de ECM y Fusible si está calculado */}
                {trafoResults.ecm_data && (
                  <div className="bg-[#080818] border border-[#252550] rounded-lg p-3 text-xs font-mono space-y-2">
                    <div className="text-[#FF2D78] font-bold pb-1 border-b border-[#252550]">
                      SELECCIÓN NORMATIVA ECM & PROTECCIÓN MT:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>• Empresa: <span className="text-white">{trafoResults.ecm_data.compania}</span></div>
                      <div>• Tensión MT: <span className="text-white">{trafoResults.ecm_data.tensionMT}</span></div>
                      <div>• Relación TC: <span className="text-[#39FF14] font-bold">{trafoResults.ecm_data.tcRatio}</span></div>
                      <div>• Relación TP: <span className="text-[#00BFFF] font-bold">{trafoResults.ecm_data.tpData?.["Relacion TP"]}</span></div>
                    </div>
                    <div className="pt-2 border-t border-[#252550]/50">
                      • Fusible MT Cooper: <span className="text-[#FFB300] font-bold text-sm">{trafoResults.ecm_data.fuseType}</span>
                      {trafoResults.ecm_data.fuseSpecs && (
                        <span className="text-[#7070A0] block text-[10px] mt-0.5">
                          Ref: {trafoResults.ecm_data.fuseSpecs.Ref} | Poder de corte I1: {trafoResults.ecm_data.fuseSpecs.I1_kA} kA
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center text-[#7070A0]">
                <Activity size={36} className="mb-2 opacity-40 animate-pulse text-[#7B2FFF]" />
                <p className="text-xs">Presiona "CALCULAR TODO" para procesar el transformador y protecciones</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}