import React from 'react';

export default function MetricCard({ title, value, unit, color = "primary" }) {
  const colorStyles = {
    primary: "text-[#00BFFF] border-t-[#00BFFF]",
    secondary: "text-[#7B2FFF] border-t-[#7B2FFF]",
    warning: "text-[#FFB300] border-t-[#FFB300]",
    success: "text-[#39FF14] border-t-[#39FF14]",
    danger: "text-[#FF3347] border-t-[#FF3347]"
  };

  const glowStyles = {
    primary: "shadow-[0_0_20px_rgba(0,191,255,0.15)]",
    secondary: "shadow-[0_0_20px_rgba(123,47,255,0.15)]",
    warning: "shadow-[0_0_20px_rgba(255,179,0,0.15)]",
    success: "shadow-[0_0_20px_rgba(57,255,20,0.15)]",
    danger: "shadow-[0_0_20px_rgba(255,51,71,0.15)]"
  };

  const chosenColor = colorStyles[color] || colorStyles.primary;
  const chosenGlow = glowStyles[color] || glowStyles.primary;

  return (
    <div className={`bg-[#0E0E28] border border-[#252550] border-t-4 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${chosenColor} ${chosenGlow}`}>
      <span className="text-xs font-semibold text-[#7070A0] uppercase tracking-wider mb-1">{title}</span>
      <span className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-white my-1">{value}</span>
      <span className="text-xs text-[#00BFFF] font-mono">{unit}</span>
    </div>
  );
}