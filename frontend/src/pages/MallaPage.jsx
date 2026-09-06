import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Activity, CheckCircle, AlertTriangle, Layers, Compass, BarChart2 } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function MallaPage() {
  const { mallaInputs, setMallaInputs, mallaResults, setMallaResults } = useStore();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMallaInputs({ ...mallaInputs, [name]: parseFloat(value) || 0 });
  };

  const calcular = async () => {
    setLoading(true);
    try {
      const res = await client.post('/api/malla/calcular', mallaInputs);
      setMallaResults(res.data);
    } catch (err) {
      alert("Error en el cálculo: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header estilo Orbitron / ModernStyle */}
      <div className="bg-[#141430] border border-[#252550] border-l-4 border-l-[#00BFFF] rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/30 flex items-center justify-center text-[#00BFFF] shadow-[0_0_15px_rgba(0,191,255,0.25)]">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide flex items-center gap-2">
              RESISTENCIA DE MALLA
              <span className="text-xs font-sans px-2.5 py-0.5 rounded bg-[#00BFFF]/20 text-[#00BFFF] border border-[#00BFFF]/40">
                IEEE Std 80-2013 / RPTD N°06
              </span>
            </h1>
            <p className="text-xs text-[#7070A0] mt-1 font-sans">
              Cálculo de resistividad equivalente y resistencia de puesta a tierra (Laurent, Sverak, Schwarz)
            </p>
          </div>
        </div>

        <button 
          onClick={calcular} 
          disabled={loading}
          className="btn-primary flex items-center space-x-2 py-3 px-6 text-sm"
        >
          <Activity size={18} />
          <span>{loading ? "CALCULANDO..." : "CALCULAR MALLA"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Parámetros (7 columnas) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Estratigrafía (3 Estratos) */}
          <div className="card border-t-2 border-t-[#00BFFF]">
            <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-[#252550]">
              <Layers size={18} className="text-[#00BFFF]" />
              <h2 className="text-sm font-bold font-sans tracking-wider text-[#00BFFF] uppercase">
                Parámetros del Terreno (Modelo 3 Estratos)
              </h2>
            </div>

            <p className="text-xs text-[#7070A0] mb-4">
              Definición de capas de resistividad: Estrato 1 (superficial), Estrato 2 (intermedio), Estrato 3 (profundo semi-infinito).
            </p>

            <div className="grid grid-cols-3 gap-4">
              {/* Estrato 1 */}
              <div className="bg-[#0E0E28] p-3 rounded-lg border border-[#252550]">
                <span className="text-xs font-bold text-[#39FF14] block mb-2">Estrato 1 (superf.)</span>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-[#7070A0]">ρ₁ [Ω·m]</label>
                    <input type="number" name="rho1" value={mallaInputs.rho1} onChange={handleChange} className="input-field text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#7070A0]">h₁ [m]</label>
                    <input type="number" name="h1" value={mallaInputs.h1} onChange={handleChange} className="input-field text-sm font-mono" />
                  </div>
                </div>
              </div>

              {/* Estrato 2 */}
              <div className="bg-[#0E0E28] p-3 rounded-lg border border-[#252550]">
                <span className="text-xs font-bold text-[#FFB300] block mb-2">Estrato 2 (interm.)</span>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-[#7070A0]">ρ₂ [Ω·m]</label>
                    <input type="number" name="rho2" value={mallaInputs.rho2} onChange={handleChange} className="input-field text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#7070A0]">h₂ [m]</label>
                    <input type="number" name="h2" value={mallaInputs.h2} onChange={handleChange} className="input-field text-sm font-mono" />
                  </div>
                </div>
              </div>

              {/* Estrato 3 */}
              <div className="bg-[#0E0E28] p-3 rounded-lg border border-[#252550] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#7B2FFF] block mb-2">Estrato 3 (prof.)</span>
                  <div>
                    <label className="text-[11px] text-[#7070A0]">ρ₃ [Ω·m]</label>
                    <input type="number" name="rho3" value={mallaInputs.rho3} onChange={handleChange} className="input-field text-sm font-mono" />
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-[#7070A0] bg-[#141430] p-1.5 rounded text-center border border-[#252550]/50">
                  h₃: Semi-infinito (∞)
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Geometría */}
          <div className="card border-t-2 border-t-[#7B2FFF]">
            <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-[#252550]">
              <Compass size={18} className="text-[#7B2FFF]" />
              <h2 className="text-sm font-bold font-sans tracking-wider text-[#7B2FFF] uppercase">
                Geometría de la Malla y Conductores
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Largo A [m]</label>
                <input type="number" name="largo_A" value={mallaInputs.largo_A} onChange={handleChange} className="input-field font-mono" />
              </div>
              <div>
                <label>Ancho B [m]</label>
                <input type="number" name="ancho_B" value={mallaInputs.ancho_B} onChange={handleChange} className="input-field font-mono" />
              </div>

              <div>
                <label>N° Cond. Lado A</label>
                <input type="number" name="n_conductores_A" value={mallaInputs.n_conductores_A} onChange={handleChange} className="input-field font-mono" />
              </div>
              <div>
                <label>N° Cond. Lado B</label>
                <input type="number" name="n_conductores_B" value={mallaInputs.n_conductores_B} onChange={handleChange} className="input-field font-mono" />
              </div>

              <div>
                <label>Profundidad h [m]</label>
                <input type="number" step="0.1" name="profundidad_h" value={mallaInputs.profundidad_h} onChange={handleChange} className="input-field font-mono" />
              </div>
              <div>
                <label>Radio conductor r [m]</label>
                <input type="number" step="0.0001" name="radio_conductor_m" value={mallaInputs.radio_conductor_m} onChange={handleChange} className="input-field font-mono" />
              </div>

              <div className="col-span-2">
                <label>Barras Verticales L_R (Opcional)</label>
                <input type="number" name="L_R_barras" value={mallaInputs.L_R_barras} onChange={handleChange} className="input-field font-mono" placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Dashboard de Resultados (5 columnas) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card border-t-2 border-t-[#39FF14] h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#252550]">
                <div className="flex items-center space-x-2">
                  <BarChart2 size={18} className="text-[#39FF14]" />
                  <h2 className="text-sm font-bold font-sans tracking-wider text-[#39FF14] uppercase">
                    Resultados del Diseño
                  </h2>
                </div>
                {mallaResults && (
                  <span className="text-[10px] text-[#7070A0] font-mono">
                    L_tot: {mallaResults.L_total}m | S: {mallaResults.S_area}m²
                  </span>
                )}
              </div>

              {mallaResults ? (
                <div className="space-y-4">
                  {/* 4 MetricCards exactamente como el software de escritorio */}
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard 
                      title="ρeq (Equivalente)" 
                      value={mallaResults.rho_eq.toFixed(2)} 
                      unit="Ω·m" 
                      color="primary" 
                    />
                    <MetricCard 
                      title="R. Laurent" 
                      value={mallaResults.R_laurent.toFixed(3)} 
                      unit="Ω" 
                      color="secondary" 
                    />
                    <MetricCard 
                      title="R. Sverak" 
                      value={mallaResults.R_sverak.toFixed(3)} 
                      unit="Ω" 
                      color="warning" 
                    />
                    <MetricCard 
                      title="R. Schwarz (Ref)" 
                      value={mallaResults.R_schwarz.toFixed(3)} 
                      unit="Ω" 
                      color={mallaResults.cumple ? "success" : "danger"} 
                    />
                  </div>

                  {/* Veredicto Visual Grande */}
                  <div className={`p-4 rounded-xl text-center border font-display tracking-wider text-base font-bold transition-all shadow-lg ${
                    mallaResults.cumple 
                      ? "bg-[#1A3D1A]/60 border-[#39FF14]/50 text-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]" 
                      : "bg-[#3D1A1A]/60 border-[#FF3347]/50 text-[#FF3347] shadow-[0_0_20px_rgba(255,51,71,0.2)]"
                  }`}>
                    {mallaResults.cumple 
                      ? "✅ DISEÑO APROBADO: CUMPLE R ≤ 20 Ω" 
                      : "❌ NO CUMPLE: R_MALLA > 20 Ω (Normativa RPTD N°06)"}
                  </div>

                  {/* Detalle tipo Consola como en Tkinter */}
                  <div className="bg-[#080818] border border-[#252550] rounded-lg p-3 text-[11px] font-mono text-[#D8D8F0] space-y-1 overflow-x-auto max-h-48 overflow-y-auto">
                    <div className="text-[#00BFFF] font-bold pb-1 border-b border-[#252550]">--- DETALLE METODOLÓGICO IEEE 80 ---</div>
                    <div>• Método Schwarz Ref: <span className="text-[#39FF14] font-bold">{mallaResults.R_schwarz.toFixed(4)} Ω</span></div>
                    <div>• Método Sverak: {mallaResults.R_sverak.toFixed(4)} Ω</div>
                    <div>• Método Laurent: {mallaResults.R_laurent.toFixed(4)} Ω</div>
                    <div>• IEEE 80 Simple: {mallaResults.R_ieee.toFixed(4)} Ω</div>
                    <div>• Área Total (S): {mallaResults.S_area} m²</div>
                    <div>• Longitud Conductor (L): {mallaResults.L_total} m</div>
                    {mallaResults.detalles?.denom_str && (
                      <div className="pt-1 text-[#7070A0] text-[10px]">
                        Burgsdorf Denom: {mallaResults.detalles.denom_str}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#252550] rounded-xl">
                  <Activity size={40} className="text-[#00BFFF]/40 mb-3 animate-pulse" />
                  <p className="text-sm font-semibold text-[#D8D8F0]">Esperando ejecución...</p>
                  <p className="text-xs text-[#7070A0] mt-1">Presiona "CALCULAR MALLA" para procesar las ecuaciones de puesta a tierra.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#252550] text-[11px] text-[#7070A0] flex justify-between">
              <span>EnergyGrid Engine v3.0</span>
              <span className="text-[#00BFFF]">RPTD N°06 / IEEE 80</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}