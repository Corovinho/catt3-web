import React, { useState } from 'react';
import { ThermodynamicState } from '../types/thermo';

interface DiagramViewProps {
  states: ThermodynamicState[];
  currentSubstance: string;
}

export const DiagramView: React.FC<DiagramViewProps> = ({
  states,
  currentSubstance,
}) => {
  const [diagramType, setDiagramType] = useState<'Ts' | 'Pv'>('Ts');

  // Precomputed saturation dome coordinates for Water / Steam
  // Ts dome: (s, T)
  const tsDomeWater = [
    { s: 0.0, T: 0.01 },
    { s: 0.367, T: 25 },
    { s: 0.704, T: 50 },
    { s: 1.026, T: 75 },
    { s: 1.307, T: 100 },
    { s: 1.842, T: 150 },
    { s: 2.331, T: 200 },
    { s: 2.797, T: 250 },
    { s: 3.255, T: 300 },
    { s: 3.800, T: 350 },
    { s: 4.412, T: 373.95 }, // Critical point
    { s: 5.000, T: 350 },
    { s: 5.705, T: 300 },
    { s: 6.287, T: 250 },
    { s: 6.838, T: 200 },
    { s: 7.359, T: 150 },
    { s: 7.355, T: 100 },
    { s: 7.638, T: 75 },
    { s: 8.076, T: 50 },
    { s: 8.558, T: 25 },
    { s: 9.156, T: 0.01 }
  ];

  // SVG dimensions
  const width = 600;
  const height = 360;
  const padding = 50;

  // Scale ranges
  const minS = 0;
  const maxS = 10;
  const minT = 0;
  const maxT = 450;

  const toX = (s: number) => padding + ((s - minS) / (maxS - minS)) * (width - 2 * padding);
  const toY = (T: number) => height - padding - ((T - minT) / (maxT - minT)) * (height - 2 * padding);

  // Generate path string for saturation dome
  const domePath = tsDomeWater.reduce((acc, pt, idx) => {
    const x = toX(pt.s);
    const y = toY(pt.T);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Filter states that belong to current category or water
  const plottedStates = states.filter(s => s.category === 'WATER' || s.category === 'REFRIGERANTS');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-lg backdrop-blur-sm space-y-3">
      {/* Header & Controls */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">Diagrama de Estado Termodinâmico</h3>
          <p className="text-[11px] text-slate-500 font-mono">Visualização do domo de saturação e pontos de estado do ciclo</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setDiagramType('Ts')}
            className={`px-2.5 py-1 rounded transition-colors ${
              diagramType === 'Ts' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'
            }`}
          >
            T - s
          </button>
          <button
            onClick={() => setDiagramType('Pv')}
            className={`px-2.5 py-1 rounded transition-colors ${
              diagramType === 'Pv' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'
            }`}
          >
            P - v
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2 flex items-center justify-center overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[400px]">
          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" strokeWidth="1" />

          {/* Subgrid */}
          {[100, 200, 300, 400].map(T => (
            <g key={T}>
              <line x1={padding} y1={toY(T)} x2={width - padding} y2={toY(T)} stroke="#1e293b" strokeDasharray="3 3" />
              <text x={padding - 8} y={toY(T) + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="JetBrains Mono">{T}°C</text>
            </g>
          ))}
          {[2, 4, 6, 8].map(s => (
            <g key={s}>
              <line x1={toX(s)} y1={padding} x2={toX(s)} y2={height - padding} stroke="#1e293b" strokeDasharray="3 3" />
              <text x={toX(s)} y={height - padding + 15} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">{s}</text>
            </g>
          ))}

          {/* Saturation Dome */}
          <path d={domePath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          <path d={`${domePath} Z`} fill="rgba(14, 165, 233, 0.04)" />

          {/* Critical Point Marker */}
          <circle cx={toX(4.412)} cy={toY(373.95)} r="4" fill="#38bdf8" />
          <text x={toX(4.412)} y={toY(373.95) - 8} fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
            Ponto Crítico
          </text>

          {/* Process Lines connecting states */}
          {plottedStates.map((st, i) => {
            if (i === 0) return null;
            const prev = plottedStates[i - 1];
            return (
              <line
                key={`line-${i}`}
                x1={toX(prev.s)}
                y1={toY(prev.T)}
                x2={toX(st.s)}
                y2={toY(st.T)}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.9"
              />
            );
          })}

          {/* Plotted State Points */}
          {plottedStates.map((st, idx) => {
            const cx = toX(st.s);
            const cy = toY(st.T);
            return (
              <g key={st.id} className="cursor-pointer group">
                <circle cx={cx} cy={cy} r="6" fill="#f59e0b" stroke="#090d16" strokeWidth="2" />
                <circle cx={cx} cy={cy} r="12" fill="rgba(245, 158, 11, 0.2)" className="animate-pulse" />
                <text x={cx} y={cy - 10} fill="#fde68a" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                  #{idx + 1}
                </text>
              </g>
            );
          })}

          {/* Axes labels */}
          <text x={width / 2} y={height - 10} fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">
            Entropia Específica, s [kJ/(kg·K)]
          </text>
          <text x={-height / 2} y={16} fill="#94a3b8" fontSize="11" textAnchor="middle" transform="rotate(-90)" fontFamily="sans-serif">
            Temperatura, T [°C]
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            Domo de Saturação
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Estados do Ciclo
          </span>
        </div>
        <span>Total: {plottedStates.length} ponto(s) no gráfico</span>
      </div>
    </div>
  );
};
