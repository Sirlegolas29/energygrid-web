import React, { useState } from 'react';
import useStore from '../store/useStore';
import client from '../api/client';
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MallaPage() {
  const { mallaInputs, setMallaInputs, mallaResults, setMallaResults } = useStore();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMallaInputs({ ...mallaInputs, [name]: parseFloat(value) || 0 });
  };

  const handleStrataChange = (index, field, value) => {
    const newStrata = [...mallaInputs.strata];
    newStrata[index][field] = parseFloat(value) || 0;
    setMallaInputs({ ...mallaInputs, strata: newStrata });
  };

  const calcular = async () => {
    setLoading(true);
    try {
      const res = await client.post('/api/malla/calcular', mallaInputs);
      setMallaResults(res.data);
    } catch (err) {
      alert("Error en el cálculo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30 text-blue-400">
          <Activity size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Resistencia de Malla</h1>
          <p className="text-slate-400">Cálculo según Schwarz, Laurent y Sverak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Inputs */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">Geometría de la Malla</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Largo (A) [m]</label>
                <input type="number" name="largo_A" value={mallaInputs.largo_A} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Ancho (B) [m]</label>
                <input type="number" name="ancho_B" value={mallaInputs.ancho_B} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Conductores dir A</label>
                <input type="number" name="n_conductores_A" value={mallaInputs.n_conductores_A} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Conductores dir B</label>
                <input type="number" name="n_conductores_B" value={mallaInputs.n_conductores_B} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Profundidad (h) [m]</label>
                <input type="number" name="profundidad_h" value={mallaInputs.profundidad_h} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Radio cond. [m]</label>
                <input type="number" name="radio_conductor_m" value={mallaInputs.radio_conductor_m} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Largo Total (L) [m]</label>
                <input type="number" name="largo_total_L" value={mallaInputs.largo_total_L} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Área (S) [m²]</label>
                <input type="number" name="area_S" value={mallaInputs.area_S} onChange={handleChange} className="input-field" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">Estratigrafía</h2>
            <div className="space-y-4">
              {mallaInputs.strata.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-slate-400 mb-1">Resistividad ρ {i+1} [Ω·m]</label>
                    <input type="number" value={s.rho} onChange={(e) => handleStrataChange(i, 'rho', e.target.value)} className="input-field" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-slate-400 mb-1">Espesor h {i+1} [m]</label>
                    <input type="number" value={s.h || ''} onChange={(e) => handleStrataChange(i, 'h', e.target.value)} placeholder="Infinito" className="input-field" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={calcular} disabled={loading} className="btn-primary w-full py-3 text-lg">
            {loading ? "Calculando..." : "Calcular Resistencia"}
          </button>
        </div>

        {/* Panel de Resultados */}
        <div>
          {mallaResults ? (
            <div className="card space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <h2 className="text-xl font-semibold text-white">Resultados</h2>
                <div className={`px-4 py-1.5 rounded-full flex items-center space-x-2 text-sm font-bold ${
                  mallaResults.cumple ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {mallaResults.cumple ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  <span>{mallaResults.cumple ? "CUMPLE (≤ 20 Ω)" : "NO CUMPLE (> 20 Ω)"}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4 flex justify-between items-center border border-slate-700">
                  <span className="text-slate-400">Resistividad Equivalente (ρ_eq)</span>
                  <span className="text-2xl font-bold text-white">{mallaResults.rho_eq.toFixed(2)} <span className="text-sm text-slate-500 font-normal">Ω·m</span></span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-lg p-4 border border-blue-500/30 shadow-inner">
                    <span className="block text-sm text-blue-400 mb-1">R. Schwarz (Referencia)</span>
                    <span className="text-3xl font-bold text-white">{mallaResults.R_schwarz.toFixed(3)} <span className="text-lg text-slate-500 font-normal">Ω</span></span>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <span className="block text-sm text-slate-400 mb-1">R. Sverak</span>
                    <span className="text-3xl font-bold text-slate-300">{mallaResults.R_sverak.toFixed(3)} <span className="text-lg text-slate-500 font-normal">Ω</span></span>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 col-span-2 flex justify-between items-center">
                    <span className="text-slate-400">R. Laurent</span>
                    <span className="text-xl font-bold text-slate-300">{mallaResults.R_laurent.toFixed(3)} Ω</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-64 flex flex-col items-center justify-center text-slate-500 border-dashed border-2 bg-transparent">
              <Activity size={48} className="mb-4 opacity-50" />
              <p>Ingresa los datos y presiona Calcular</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}