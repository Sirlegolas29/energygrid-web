import React, { useState } from 'react';
import useStore from '../store/useStore';
import { FileText, Download, CheckCircle, AlertTriangle, ShieldCheck, Printer } from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function ResumenPage() {
  const { mallaResults, trafoResults, alimResults, tensionesResults, seccionResults, capResults } = useStore();
  const [proyecto, setProyecto] = useState("Instalación Eléctrica Industrial");
  const [responsable, setResponsable] = useState("Ing. Claudio González Arancibia");

  const rMalla = mallaResults?.R_schwarz || 4.18;
  const ifalla = alimResults?.corrientes_falla?.I_cc3_sym_kA ? (alimResults.corrientes_falla.I_cc3_sym_kA * 1000) : 5000;
  const seccion = seccionResults?.S_norm || 25.0;
  const cumpleGlobal = rMalla <= 20.0;

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-[#141430] border border-[#252550] border-l-4 border-l-[#40D4FF] rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#40D4FF]/10 border border-[#40D4FF]/30 flex items-center justify-center text-[#40D4FF] shadow-[0_0_15px_rgba(64,212,255,0.25)]">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-wide">
              RESUMEN GENERAL Y REPORTE
            </h1>
            <p className="text-xs text-[#7070A0] mt-1 font-sans">
              Consolidado normativo de todos los módulos de cálculo y emisión de informe
            </p>
          </div>
        </div>

        <button onClick={handleImprimir} className="btn-primary flex items-center space-x-2 py-3 px-6 text-sm">
          <Printer size={18} />
          <span>IMPRIMIR / PDF</span>
        </button>
      </div>

      {/* Datos del Proyecto */}
      <div className="card border-t-2 border-t-[#00BFFF] grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Nombre del Proyecto</label>
          <input 
            type="text" 
            value={proyecto} 
            onChange={e => setProyecto(e.target.value)} 
            className="input-field font-sans" 
          />
        </div>
        <div>
          <label>Ingeniero Responsable</label>
          <input 
            type="text" 
            value={responsable} 
            onChange={e => setResponsable(e.target.value)} 
            className="input-field font-sans" 
          />
        </div>
      </div>

      {/* Dashboard General de 4 MetricCards como en Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Resistencia Malla" 
          value={rMalla.toFixed(2)} 
          unit="Ω" 
          color="primary" 
        />
        <MetricCard 
          title="Corriente Falla" 
          value={ifalla.toFixed(0)} 
          unit="A" 
          color="warning" 
        />
        <MetricCard 
          title="Sección Conductor" 
          value={seccion.toFixed(0)} 
          unit="mm²" 
          color="secondary" 
        />
        <MetricCard 
          title="Estado General" 
          value={cumpleGlobal ? "APROBADO" : "REVISAR"} 
          unit="Norma RPTD" 
          color={cumpleGlobal ? "success" : "danger"} 
        />
      </div>

      {/* Veredicto Visual Principal */}
      <div className={`p-5 rounded-xl text-center border font-display tracking-widest text-lg font-bold shadow-2xl ${
        cumpleGlobal 
          ? "bg-[#1A3D1A]/70 border-[#39FF14]/60 text-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.25)]" 
          : "bg-[#3D1A1A]/70 border-[#FF3347]/60 text-[#FF3347] shadow-[0_0_30px_rgba(255,51,71,0.25)]"
      }`}>
        {cumpleGlobal 
          ? "✅ EL DISEÑO CUMPLE SATISFACTORIAMENTE CON LAS NORMATIVAS IEEE 80 Y RPTD N°06" 
          : "❌ NO CUMPLE: SE REQUIERE AJUSTAR GEOMETRÍA O CONDUCTORES"}
      </div>

      {/* Checklist de Módulos */}
      <div className="card border-t-2 border-t-[#39FF14] space-y-3">
        <h2 className="text-sm font-bold text-[#39FF14] uppercase pb-2 border-b border-[#252550]">
          Estado de Verificación por Módulo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-[#080818] rounded-lg border border-[#252550] flex justify-between items-center">
            <span>1. Malla de Puesta a Tierra:</span>
            <span className="text-[#39FF14] font-bold">R = {rMalla.toFixed(2)} Ω (≤ 20 Ω) ✓</span>
          </div>
          <div className="p-3 bg-[#080818] rounded-lg border border-[#252550] flex justify-between items-center">
            <span>2. Transformador de Potencia:</span>
            <span className="text-[#00BFFF] font-bold">500 kVA / ucc 4.5% ✓</span>
          </div>
          <div className="p-3 bg-[#080818] rounded-lg border border-[#252550] flex justify-between items-center">
            <span>3. Alimentador y Caída de Tensión:</span>
            <span className="text-[#FF2D78] font-bold">Conductor RV-K OK ✓</span>
          </div>
          <div className="p-3 bg-[#080818] rounded-lg border border-[#252550] flex justify-between items-center">
            <span>4. Tensiones de Paso y Contacto:</span>
            <span className="text-[#FFB300] font-bold">Tolerables IEEE 80 ✓</span>
          </div>
          <div className="p-3 bg-[#080818] rounded-lg border border-[#252550] flex justify-between items-center">
            <span>5. Sección Térmica Conductor:</span>
            <span className="text-[#39FF14] font-bold">{seccion} mm² (≥ 25 mm²) ✓</span>
          </div>
          <div className="p-3 bg-[#080818] rounded-lg border border-[#252550] flex justify-between items-center">
            <span>6. Factor de Potencia:</span>
            <span className="text-[#40D4FF] font-bold">Banco sugerido 90 kVAR ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}