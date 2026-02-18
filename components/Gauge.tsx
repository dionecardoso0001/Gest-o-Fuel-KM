import React from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
  warningThreshold?: number; // if value <= threshold, show warning color
}

export const Gauge: React.FC<GaugeProps> = ({ value, max, label, unit, color = "text-racing-red", warningThreshold }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const rotation = (percentage / 100) * 180; // 0 to 180 degrees
  
  const isWarning = warningThreshold !== undefined && value <= warningThreshold;
  const displayColor = isWarning ? "text-yellow-500" : color;
  const strokeColor = isWarning ? "#eab308" : (color === 'text-racing-red' ? '#ff2b2b' : '#3b82f6');

  return (
    <div className="relative flex flex-col items-center justify-end h-32 w-48 mx-auto">
      {/* Semi-circle Gauge Background */}
      <div className="absolute top-0 w-40 h-20 overflow-hidden">
        <div className="w-40 h-40 rounded-full border-[12px] border-gray-800 box-border"></div>
      </div>
      
      {/* Gauge Fill - Rotating div approach for CSS simplicity without heavy SVG calc */}
      <div className="absolute top-0 w-40 h-20 overflow-hidden">
         <div 
           className="w-40 h-40 rounded-full border-[12px] border-transparent box-border transition-transform duration-1000 ease-out origin-center"
           style={{ 
             borderColor: `${strokeColor} transparent transparent transparent`, 
             transform: `rotate(${rotation - 135}deg)` // Offset to start from left
           }}
         ></div>
      </div>

      {/* Ticks */}
      <div className="absolute top-4 w-32 h-16 flex justify-between items-end px-1">
        <span className="text-xs text-gray-500 font-mono">0</span>
        <span className="text-xs text-gray-500 font-mono">{max}</span>
      </div>

      {/* Value */}
      <div className="z-10 text-center mt-8">
        <div className={`text-3xl font-bold font-mono tracking-tighter ${displayColor} drop-shadow-[0_0_8px_rgba(255,43,43,0.3)]`}>
            {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-gray-400 uppercase tracking-widest">{unit}</div>
      </div>
      
      <div className="text-xs font-semibold text-gray-300 mt-2 uppercase tracking-wide">{label}</div>
    </div>
  );
};