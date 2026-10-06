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

  const width = 600;
  const height = 360;
  const padding = 50;

  const minS = 0;
  const maxS = 10;
  const minT = 0;
  const maxT = 450;

  const toX = (s: number) => padding + ((s - minS) / (maxS - minS)) * (width - 2 * padding);
  const toY = (T: number) => height - padding - ((T - minT) / (maxT - minT)) * (height - 2 * padding);

  const domePath = tsDomeWater.reduce((acc, pt, idx) => {
    const x = toX(pt.s);
    const y = toY(pt.T);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const plottedStates = states.filter(s => s.category === 'WATER' || s.category === 'REFRIGERANTS');

  return (
    <div className="bg-white border border-slate-300 p-3 sm:p-5 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base uppercase tracking-tight">Diagrama de Estado Termodinâmico</h3>
          <p className="text-[11px] text-slate-500 font-mono">Visualização do domo de saturação e pontos de estado do ciclo</p>
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 border border-slate-300 text-xs font-mono">
          <button
            onClick={() => setDiagramType('Ts')}
            className={`px-3 py-1 transition-colors uppercase ${
              diagramType === 'Ts' ? 'bg-black text-white font-bold' : 'text-slate-600 hover:text-black'
            }`}
          >
            T - s
          </button>
          <button
            onClick={() => setDiagramType('Pv')}
            className={`px-3 py-1 transition-colors uppercase ${
              diagramType === 'Pv' ? 'bg-black text-white font-bold' : 'text-slate-600 hover:text-black'
            }`}
          >
            P - v
          </button>
        </div>
      </div>

      {/* SVG Canvas with Clean White Engineering Background */}
      <div className="bg-white border border-slate-300 p-2 flex items-center justify-center overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[400px]">
          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#0f172a" strokeWidth="1.5" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#0f172a" strokeWidth="1.5" />

          {/* Subgrid */}
          {[100, 200, 300, 400].map(T => (
            <g key={T}>
              <line x1={padding} y1={toY(T)} x2={width - padding} y2={toY(T)} stroke="#e2e8f0" strokeDasharray="2 2" />
              <text x={padding - 8} y={toY(T) + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="JetBrains Mono">{T}°C</text>
            </g>
          ))}
          {[2, 4, 6, 8].map(s => (
            <g key={s}>
              <line x1={toX(s)} y1={padding} x2={toX(s)} y2={height - padding} stroke="#e2e8f0" strokeDasharray="2 2" />
              <text x={toX(s)} y={height - padding + 15} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">{s}</text>
            </g>
          ))}

          {/* Saturation Dome */}
          <path d={domePath} fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="square" />
          <path d={`${domePath} Z`} fill="rgba(2, 132, 199, 0.05)" />

          {/* Critical Point Marker */}
          <circle cx={toX(4.412)} cy={toY(373.95)} r="3.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
          <text x={toX(4.412)} y={toY(373.95) - 8} fill="#0f172a" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="bold">
            PONTO CRÍTICO
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
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            );
          })}

          {/* Plotted State Points */}
          {plottedStates.map((st, idx) => {
            const cx = toX(st.s);
            const cy = toY(st.T);
            return (
              <g key={st.id} className="cursor-pointer group">
                <circle cx={cx} cy={cy} r="5" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
                <text x={cx} y={cy - 9} fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                  #{idx + 1}
                </text>
              </g>
            );
          })}

          {/* Axes labels */}
          <text x={width / 2} y={height - 10} fill="#0f172a" fontSize="11" textAnchor="middle" fontFamily="sans-serif" fontWeight="500">
            Entropia Específica, s [kJ/(kg·K)]
          </text>
          <text x={-height / 2} y={16} fill="#0f172a" fontSize="11" textAnchor="middle" transform="rotate(-90)" fontFamily="sans-serif" fontWeight="500">
            Temperatura, T [°C]
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-sky-600 inline-block"></span>
            Domo de Saturação
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-black inline-block"></span>
            Estados do Ciclo
          </span>
        </div>
        <span>Total: {plottedStates.length} ponto(s) plotados</span>
      </div>
    </div>
  );
};
