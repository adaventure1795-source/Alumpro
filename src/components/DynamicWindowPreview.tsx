/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MoveRight, MoveDown } from "lucide-react";

interface DynamicWindowPreviewProps {
  category: string;
  width: number;
  height: number;
  color: string;
  glassType: string;
}

export const DynamicWindowPreview: React.FC<DynamicWindowPreviewProps> = ({
  category,
  width,
  height,
  color,
  glassType
}) => {
  // Map aluminum color name to CSS hex values
  const getAluminumColors = (colorName: string) => {
    const norm = colorName.toLowerCase();
    if (norm.includes("blanco")) {
      return { fill: "#f8fafc", stroke: "#94a3b8", label: "Blanco (Pintado)" };
    }
    if (norm.includes("natural") || norm.includes("anodizado")) {
      return { fill: "#cbd5e1", stroke: "#64748b", label: "Natural Anodizado" };
    }
    if (norm.includes("negro")) {
      return { fill: "#1e293b", stroke: "#0f172a", label: "Negro Mate" };
    }
    if (norm.includes("bronce")) {
      return { fill: "#45322e", stroke: "#271c19", label: "Bronce Colonial" };
    }
    if (norm.includes("duranodick") || norm.includes("duranodic")) {
      return { fill: "#2e2528", stroke: "#1a1214", label: "Duranodick" };
    }
    if (norm.includes("champagne") || norm.includes("oro")) {
      return { fill: "#e2c994", stroke: "#9b7c3e", label: "Anodizado Oro/Champagne" };
    }
    if (norm.includes("nogal") || norm.includes("madera") || norm.includes("pino") || norm.includes("cerezo")) {
      return { fill: "#7c2d12", stroke: "#451a03", label: "Acabado Textura Madera" };
    }
    return { fill: "#64748b", stroke: "#334155", label: colorName };
  };

  const currentAlum = getAluminumColors(color);

  // SVG dimensions & viewbox
  const paddingX = 40;
  const paddingY = 40;
  const canvasWidth = 320;
  const canvasHeight = 220;
  
  const drawWidth = canvasWidth - paddingX * 2;
  const drawHeight = canvasHeight - paddingY * 2;

  // Render different schematics based on category
  const renderSchematic = () => {
    switch (category) {
      case "ventanas":
        return (
          <>
            {/* Outer Window Frame */}
            <rect
              x={paddingX}
              y={paddingY}
              width={drawWidth}
              height={drawHeight}
              fill="none"
              stroke={currentAlum.stroke}
              strokeWidth="6"
              rx="2"
            />
            {/* Glass Pane L (Fix or Slide Left) */}
            <rect
              x={paddingX + 3}
              y={paddingY + 3}
              width={drawWidth / 2 - 2}
              height={drawHeight - 6}
              fill="url(#glass-gradient)"
              stroke={currentAlum.stroke}
              strokeWidth="3"
            />
            {/* Glass Pane R (Slide Right) */}
            <rect
              x={paddingX + drawWidth / 2 - 1}
              y={paddingY + 3}
              width={drawWidth / 2 - 2}
              height={drawHeight - 6}
              fill="url(#glass-gradient-highlight)"
              stroke={currentAlum.stroke}
              strokeWidth="3"
            />
            {/* Traslape Central overlap */}
            <rect
              x={paddingX + drawWidth / 2 - 4}
              y={paddingY + 1}
              width="8"
              height={drawHeight - 2}
              fill={currentAlum.fill}
              stroke={currentAlum.stroke}
              strokeWidth="1.5"
            />
            
            {/* Slide Arrows to show standard horizontal function */}
            <g stroke="#2563eb" strokeWidth="1.5" fill="none">
              <path d={`M ${paddingX + drawWidth / 4 - 10} ${paddingY + drawHeight / 2} L ${paddingX + drawWidth / 4 + 10} ${paddingY + drawHeight / 2}`} />
              <path d={`M ${paddingX + drawWidth / 4 + 5} ${paddingY + drawHeight / 2 - 3} L ${paddingX + drawWidth / 4 + 10} ${paddingY + drawHeight / 2} L ${paddingX + drawWidth / 4 + 5} ${paddingY + drawHeight / 2 + 3}`} />
              
              <path d={`M ${paddingX + (3 * drawWidth) / 4 + 10} ${paddingY + drawHeight / 2} L ${paddingX + (3 * drawWidth) / 4 - 10} ${paddingY + drawHeight / 2}`} />
              <path d={`M ${paddingX + (3 * drawWidth) / 4 - 5} ${paddingY + drawHeight / 2 - 3} L ${paddingX + (3 * drawWidth) / 4 - 10} ${paddingY + drawHeight / 2} L ${paddingX + (3 * drawWidth) / 4 - 5} ${paddingY + drawHeight / 2 + 3}`} />
            </g>

            {/* Labels pointing to profiles */}
            <text x={paddingX + 10} y={paddingY + 16} fill={currentAlum.stroke} className="text-[7px] font-mono font-bold uppercase opacity-80 decoration-dotted">Cabezal</text>
            <text x={paddingX + 8} y={paddingY + drawHeight - 10} fill={currentAlum.stroke} className="text-[7px] font-mono font-bold uppercase opacity-80">Riel</text>
            <text x={paddingX + drawWidth / 2 - 20} y={paddingY + 15} fill="#2563eb" className="text-[6px] font-bold uppercase">Traslape</text>
          </>
        );

      case "canceles":
        return (
          <>
            {/* Outer Box */}
            <rect
              x={paddingX}
              y={paddingY}
              width={drawWidth}
              height={drawHeight}
              fill="none"
              stroke={currentAlum.stroke}
              strokeWidth="5"
            />
            {/* Left Fixed Glass panel */}
            <rect
              x={paddingX + 3}
              y={paddingY + 3}
              width={drawWidth / 2 - 3}
              height={drawHeight - 6}
              fill="url(#glass-gradient)"
              stroke={currentAlum.stroke}
              strokeWidth="2.5"
            />
            {/* Right Sliding Glass panel */}
            <rect
              x={paddingX + drawWidth / 2}
              y={paddingY + 3}
              width={drawWidth / 2 - 3}
              height={drawHeight - 6}
              fill="url(#glass-gradient-highlight)"
              stroke={currentAlum.stroke}
              strokeWidth="2.5"
            />
            {/* Elegant Towel bar / Pomo decoration */}
            <rect
              x={paddingX + drawWidth / 2 + 10}
              y={paddingY + drawHeight / 2 - 20}
              width="4"
              height="40"
              rx="1px"
              fill={currentAlum.fill}
              stroke={currentAlum.stroke}
              strokeWidth="1"
            />
            
            {/* Frosted / Semi luyo text label */}
            <rect
              x={paddingX + 10}
              y={paddingY + drawHeight / 2 - 10}
              width={drawWidth - 20}
              height="20"
              fill="#ffffff"
              fillOpacity="0.12"
              stroke="#ffffff"
              strokeWidth="0.5"
              strokeDasharray="2"
            />
            <text x={canvasWidth / 2} y={paddingY + drawHeight / 2 + 3} fill="#ffffff" textAnchor="middle" className="text-[7px] tracking-widest font-semibold uppercase opacity-90 drop-shadow">TEMPLADO SEGURIDAD</text>
          </>
        );

      case "fijos":
        return (
          <>
            {/* Classic 1-piece perimeter with heavy borders */}
            <rect
              x={paddingX}
              y={paddingY}
              width={drawWidth}
              height={drawHeight}
              fill="url(#glass-gradient-highlight)"
              stroke={currentAlum.stroke}
              strokeWidth="8"
            />
            {/* Inner glazing bead (Junquillo frame) */}
            <rect
              x={paddingX + 8}
              y={paddingY + 8}
              width={drawWidth - 16}
              height={drawHeight - 16}
              fill="none"
              stroke={currentAlum.stroke}
              strokeWidth="2"
              strokeDasharray="1"
            />
            
            {/* Decorative architectural crosshairs for fixed window glass */}
            <path
              d={`M ${paddingX + 15} ${paddingY + 15} L ${paddingX + 30} ${paddingY + 15} M ${paddingX + 15} ${paddingY + 15} L ${paddingX + 15} ${paddingY + 30}`}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d={`M ${paddingX + drawWidth - 15} ${paddingY + drawHeight - 15} L ${paddingX + drawWidth - 30} ${paddingY + drawHeight - 15} M ${paddingX + drawWidth - 15} ${paddingY + drawHeight - 15} L ${paddingX + drawWidth - 15} ${paddingY + drawHeight - 30}`}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <text x={canvasWidth / 2} y={paddingY + drawHeight / 2 + 4} fill={currentAlum.stroke} textAnchor="middle" className="text-[8px] font-mono font-bold tracking-wider opacity-60">FIJO DIRECTO</text>
          </>
        );

      case "puertas":
        return (
          <>
            {/* Door Frame */}
            <rect
              x={paddingX + 10}
              y={paddingY}
              width={drawWidth - 20}
              height={drawHeight}
              fill="none"
              stroke={currentAlum.stroke}
              strokeWidth="6"
            />
            {/* Internal Door Leaf panel */}
            <rect
              x={paddingX + 14}
              y={paddingY + 4}
              width={drawWidth - 28}
              height={drawHeight - 8}
              fill="url(#glass-gradient)"
              stroke={currentAlum.stroke}
              strokeWidth="3"
            />
            {/* Heavy bottom rail (Zoclo Puerta) */}
            <rect
              x={paddingX + 14}
              y={paddingY + drawHeight - 32}
              width={drawWidth - 28}
              height="28"
              fill={currentAlum.fill}
              stroke={currentAlum.stroke}
              strokeWidth="1.5"
            />
            {/* Door handle lever / lock set */}
            <circle cx={paddingX + 26} cy={paddingY + drawHeight / 2} r="3" fill={currentAlum.fill} stroke={currentAlum.stroke} strokeWidth="1" />
            <line x1={paddingX + 26} y1={paddingY + drawHeight / 2} x2={paddingX + 20} y2={paddingY + drawHeight / 2} stroke={currentAlum.stroke} strokeWidth="2.5" strokeLinecap="round" />

            {/* Door swing arc projection */}
            <path
              d={`M ${paddingX + drawWidth - 14} ${paddingY + drawHeight - 8} A ${drawWidth - 28} ${drawWidth - 28} 0 0 1 ${paddingX + 14} ${paddingY + drawHeight - 8}`}
              fill="none"
              stroke="#fb7185"
              strokeWidth="1"
              strokeDasharray="3"
            />
            <text x={paddingX + drawWidth / 2} y={paddingY + drawHeight - 12} fill="#ea580c" textAnchor="middle" className="text-[7px] font-bold font-mono">Zoclo de Puerta 3″</text>
          </>
        );

      case "portones":
        return (
          <>
            {/* Heavy Duty Gate outer shell */}
            <rect
              x={paddingX}
              y={paddingY}
              width={drawWidth}
              height={drawHeight}
              fill="none"
              stroke={currentAlum.stroke}
              strokeWidth="8"
              rx="3"
            />
            
            {/* Horizontal slates / Duela bars */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const yPos = paddingY + 6 + idx * ((drawHeight - 12) / 12);
              return (
                <rect
                  key={idx}
                  x={paddingX + 6}
                  y={yPos}
                  width={drawWidth - 12}
                  height={((drawHeight - 12) / 12) - 1.5}
                  fill={idx % 2 === 0 ? currentAlum.fill : "url(#aluminum-texture)"}
                  stroke={currentAlum.stroke}
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                />
              );
            })}
            
            {/* Double gates division line if width is large */}
            <line
              x1={canvasWidth / 2}
              y1={paddingY}
              x2={canvasWidth / 2}
              y2={paddingY + drawHeight}
              stroke={currentAlum.stroke}
              strokeWidth="2.5"
            />
            
            <text x={canvasWidth / 2} y={paddingY + drawHeight - 15} fill="#4f46e5" textAnchor="middle" className="text-[8px] font-bold tracking-wide uppercase bg-slate-100 rounded px-1">Sección de Duelas de Aluminio</text>
          </>
        );

      default:
        return (
          <rect
            x={paddingX}
            y={paddingY}
            width={drawWidth}
            height={drawHeight}
            fill="url(#glass-gradient)"
            stroke={currentAlum.stroke}
            strokeWidth="4"
          />
        );
    }
  };

  const hasNoGlass = glassType.toLowerCase().includes("sin") || glassType.toLowerCase().includes("ningun");
  const glassOpacity = hasNoGlass ? "0.02" : "0.45";
  const glassHighlightOpacity = hasNoGlass ? "0.02" : "0.55";

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
      
      {/* Absolute Badge for aluminum specs */}
      <span className="absolute top-3 left-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
        {currentAlum.label}
      </span>
      
      <span className="absolute top-3 right-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
        {hasNoGlass ? "Sin Cristal" : glassType.split(" ")[0]}
      </span>

      {/* SVG Container */}
      <svg
        width="100%"
        height="180px"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-[180px]"
      >
        <defs>
          {/* Glass Gradient */}
          <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity={glassOpacity} />
            <stop offset="40%" stopColor="#e0f2fe" stopOpacity={hasNoGlass ? "0.03" : "0.6"} />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity={hasNoGlass ? "0" : "0.3"} />
          </linearGradient>

          {/* Highlight Glass Gradient */}
          <linearGradient id="glass-gradient-highlight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity={glassHighlightOpacity} />
            <stop offset="30%" stopColor="#38bdf8" stopOpacity={hasNoGlass ? "0.02" : "0.35"} />
            <stop offset="100%" stopColor="#0284c7" stopOpacity={hasNoGlass ? "0" : "0.1"} />
          </linearGradient>

          {/* Aluminum Duela metallic texture gradient */}
          <linearGradient id="aluminum-texture" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={currentAlum.fill} stopOpacity="1" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor={currentAlum.stroke} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Dynamic Architectural Schematic Drawing */}
        {renderSchematic()}

        {/* DIMENSIONS HELPER LABELS & GUIDE LINES */}
        
        {/* WIDTH DIMENSION GUIDE (Horizontal) */}
        <g stroke="#64748b" strokeWidth="1" opacity="0.8">
          {/* Left extension line */}
          <line x1={paddingX} y1={paddingY - 5} x2={paddingX} y2={paddingY - 20} />
          {/* Right extension line */}
          <line x1={paddingX + drawWidth} y1={paddingY - 5} x2={paddingX + drawWidth} y2={paddingY - 20} />
          {/* Dimension Line */}
          <line x1={paddingX} y1={paddingY - 15} x2={paddingX + drawWidth} y2={paddingY - 15} />
        </g>
        {/* Arrow left */}
        <path d={`M ${paddingX} ${paddingY - 15} L ${paddingX + 5} ${paddingY - 18} M ${paddingX} ${paddingY - 15} L ${paddingX + 5} ${paddingY - 12}`} stroke="#64748b" strokeWidth="1" />
        {/* Arrow right */}
        <path d={`M ${paddingX + drawWidth} ${paddingY - 15} L ${paddingX + drawWidth - 5} ${paddingY - 18} M ${paddingX + drawWidth} ${paddingY - 15} L ${paddingX + drawWidth - 5} ${paddingY - 12}`} stroke="#64748b" strokeWidth="1" />
        
        {/* Width label text */}
        <rect x={canvasWidth / 2 - 32} y={paddingY - 23} width="64" height="13" fill="#ffffff" rx="3" stroke="#e2e8f0" strokeWidth="0.5" />
        <text
          x={canvasWidth / 2}
          y={paddingY - 13}
          fill="#334155"
          textAnchor="middle"
          className="text-[8px] font-bold font-mono"
        >
          {width} cm
        </text>

        {/* HEIGHT DIMENSION GUIDE (Vertical) */}
        <g stroke="#64748b" strokeWidth="1" opacity="0.8">
          {/* Top extension line */}
          <line x1={paddingX + drawWidth + 5} y1={paddingY} x2={paddingX + drawWidth + 20} y2={paddingY} />
          {/* Bottom extension line */}
          <line x1={paddingX + drawWidth + 5} y1={paddingY + drawHeight} x2={paddingX + drawWidth + 20} y2={paddingY + drawHeight} />
          {/* Dimension Line */}
          <line x1={paddingX + drawWidth + 15} y1={paddingY} x2={paddingX + drawWidth + 15} y2={paddingY + drawHeight} />
        </g>
        {/* Arrow top */}
        <path d={`M ${paddingX + drawWidth + 15} ${paddingY} L ${paddingX + drawWidth + 12} ${paddingY + 5} M ${paddingX + drawWidth + 15} ${paddingY} L ${paddingX + drawWidth + 18} ${paddingY + 5}`} stroke="#64748b" strokeWidth="1" />
        {/* Arrow bottom */}
        <path d={`M ${paddingX + drawWidth + 15} ${paddingY + drawHeight} L ${paddingX + drawWidth + 12} ${paddingY + drawHeight - 5} M ${paddingX + drawWidth + 15} ${paddingY + drawHeight} L ${paddingX + drawWidth + 18} ${paddingY + drawHeight - 5}`} stroke="#64748b" strokeWidth="1" />

        {/* Height label text */}
        <g transform={`translate(${paddingX + drawWidth + 24}, ${paddingY + drawHeight / 2})`}>
          <rect x="-8" y="-22" width="14" height="42" fill="#ffffff" rx="3" stroke="#e2e8f0" strokeWidth="0.5" />
          <text
            x="0"
            y="0"
            fill="#334155"
            textAnchor="middle"
            transform="rotate(90)"
            className="text-[8px] font-bold font-mono"
          >
            {height} cm
          </text>
        </g>
      </svg>
      
      {/* Schematic subtitle with glass selection */}
      <div className="w-full flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium px-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentAlum.fill, border: `1px solid ${currentAlum.stroke}` }}></span>
          Color: <strong className="text-slate-700 dark:text-slate-200 font-bold">{color}</strong>
        </span>
        <span className="truncate max-w-[160px]">
          Vidrio: <strong className="text-slate-700 dark:text-slate-200 font-bold">{glassType}</strong>
        </span>
      </div>
    </div>
  );
};
