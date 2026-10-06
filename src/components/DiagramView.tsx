import React from 'react';
import { ThermodynamicState } from '../types/thermo';

interface DiagramViewProps {
  states: ThermodynamicState[];
  currentSubstance: string;
  diagramType: 'Ts' | 'Pv';
  setDiagramType: (d: 'Ts' | 'Pv') => void;
}

export const DiagramView: React.FC<DiagramViewProps> = ({
  states,
  currentSubstance,
  diagramType,
  setDiagramType,
}) => {
  // Precomputed saturation dome coordinates for Water / Steam (T-s)
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
    { s: 4.412, T: 373.95 }, // Ponto Crítico T-s
    { s: 5.000, T: 350 },
    { s: 5.705, T: 300 },
    { s: 6.287, T: 250 },
    { s: 6.838, T: 200 },
    { s: 7.359, T: 150 },
    { s: 7.355, T: 100 },
    { s: 7.638, T: 75 },
    { s: 8.076, T: 50 },
    { s: 8.558, T: 25 },
    { s: 9.156, T: 0.01 },
  ];

  // Precomputed saturation dome coordinates for Water / Steam (P-v)
  const pvDomeWater = [
    // Ramo de Líquido Saturado (vf)
    { v: 0.001000, P: 0.000611 }, // Triplo
    { v: 0.001003, P: 0.00317 },
    { v: 0.001012, P: 0.01235 },
    { v: 0.001026, P: 0.03858 },
    { v: 0.001044, P: 0.101325 },
    { v: 0.001091, P: 0.476 },
    { v: 0.001157, P: 1.554 },
    { v: 0.001251, P: 3.974 },
    { v: 0.001404, P: 8.588 },
    { v: 0.001741, P: 16.53 },
    { v: 0.003106, P: 22.064 }, // Ponto Crítico P-v
    // Ramo de Vapor Saturado (vg)
    { v: 0.00881,  P: 16.53 },
    { v: 0.02167,  P: 8.588 },
    { v: 0.05013,  P: 3.974 },
    { v: 0.1274,   P: 1.554 },
    { v: 0.3928,   P: 0.476 },
    { v: 1.673,    P: 0.101325 },
    { v: 4.131,    P: 0.03858 },
    { v: 12.03,    P: 0.01235 },
    { v: 43.36,    P: 0.00317 },
    { v: 206.1,    P: 0.000611 },
  ];

  const width = 600;
  const height = 360;
  const padding = 55;

  // T-s Domain
  const minS = 0;
  const maxS = 10;
  const minT = 0;
  const maxT = 450;

  const toXTs = (s: number) => padding + ((s - minS) / (maxS - minS)) * (width - 2 * padding);
  const toYTs = (T: number) => height - padding - ((T - minT) / (maxT - minT)) * (height - 2 * padding);

  // P-v Domain (Log10 for volume, Linear for pressure in MPa)
  const minLogV = -3.2; // ~0.0006 m3/kg
  const maxLogV = 1.0;  // 10 m3/kg
  const minP = 0;
  const maxP = 25;      // MPa

  const toXPv = (v: number) => {
    const safeV = Math.max(0.0006, Math.min(10, v));
    const logV = Math.log10(safeV);
    return padding + ((logV - minLogV) / (maxLogV - minLogV)) * (width - 2 * padding);
  };

  const toYPv = (P_MPa: number) => {
    const safeP = Math.max(0, Math.min(maxP, P_MPa));
    return height - padding - ((safeP - minP) / (maxP - minP)) * (height - 2 * padding);
  };

  // Build Dome Paths
  const domePathTs = tsDomeWater.reduce((acc, pt, idx) => {
    const x = toXTs(pt.s);
    const y = toYTs(pt.T);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const domePathPv = pvDomeWater.reduce((acc, pt, idx) => {
    const x = toXPv(pt.v);
    const y = toYPv(pt.P);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const plottedStates = states.filter((s) => s.category === 'WATER' || s.category === 'REFRIGERANTS');

  const vTicks = [
    { val: 0.001, label: '0,001' },
    { val: 0.01, label: '0,01' },
    { val: 0.1, label: '0,1' },
    { val: 1, label: '1' },
    { val: 10, label: '10' },
  ];

  const pTicks = [5, 10, 15, 20, 25];
  const tTicks = [100, 200, 300, 400];
  const sTicks = [2, 4, 6, 8];

  return (
    <div className="bg-white border-2 border-slate-900 p-3 sm:p-5 shadow-sm space-y-3 font-mono flex flex-col justify-between h-full">
      {/* Header & Controls */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
        <div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">
            {diagramType === 'Ts' ? 'Diagrama T - s' : 'Diagrama P - v'}
          </h3>
          <p className="text-[10px] text-slate-500 font-mono">
            {diagramType === 'Ts'
              ? 'Temperatura [°C] vs. Entropia Específica [kJ/(kg·K)]'
              : 'Pressão [MPa] vs. Volume Específico [m³/kg]'}
          </p>
        </div>

        {/* T-s and P-v Toggle buttons */}
        <div className="flex items-center bg-white border border-slate-400 p-0.5 text-xs">
          <button
            onClick={() => setDiagramType('Ts')}
            className={`px-3 py-1 transition-colors uppercase font-bold text-xs ${
              diagramType === 'Ts'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
            title="Exibir Diagrama Temperatura-Entropia (T-s)"
          >
            T - s
          </button>
          <button
            onClick={() => setDiagramType('Pv')}
            className={`px-3 py-1 transition-colors uppercase font-bold text-xs ${
              diagramType === 'Pv'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
            title="Exibir Diagrama Pressão-Volume (P-v)"
          >
            P - v
          </button>
        </div>
      </div>

      {/* SVG Canvas with Clean White Engineering Background */}
      <div className="bg-white border border-slate-300 p-1 flex items-center justify-center overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[360px]">
          {/* Main Axes lines */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#0f172a"
            strokeWidth="1.5"
          />

          {diagramType === 'Ts' ? (
            /* ==================== T - s DIAGRAM ==================== */
            <>
              {/* T Horizontal Grid Lines */}
              {tTicks.map((T) => (
                <g key={T}>
                  <line
                    x1={padding}
                    y1={toYTs(T)}
                    x2={width - padding}
                    y2={toYTs(T)}
                    stroke="#e2e8f0"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding - 8}
                    y={toYTs(T) + 4}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="JetBrains Mono"
                  >
                    {T}°C
                  </text>
                </g>
              ))}

              {/* s Vertical Grid Lines */}
              {sTicks.map((s) => (
                <g key={s}>
                  <line
                    x1={toXTs(s)}
                    y1={padding}
                    x2={toXTs(s)}
                    y2={height - padding}
                    stroke="#e2e8f0"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={toXTs(s)}
                    y={height - padding + 15}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    {s}
                  </text>
                </g>
              ))}

              {/* T-s Saturation Dome */}
              <path d={domePathTs} fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="square" />
              <path d={`${domePathTs} Z`} fill="rgba(2, 132, 199, 0.05)" />

              {/* Critical Point Marker (T-s) */}
              <circle cx={toXTs(4.412)} cy={toYTs(373.95)} r="3.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
              <text
                x={toXTs(4.412)}
                y={toYTs(373.95) - 8}
                fill="#0f172a"
                fontSize="9"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                PONTO CRÍTICO
              </text>

              {/* Process Lines connecting states */}
              {plottedStates.map((st, i) => {
                if (i === 0) return null;
                const prev = plottedStates[i - 1];
                return (
                  <line
                    key={`line-${i}`}
                    x1={toXTs(prev.s)}
                    y1={toYTs(prev.T)}
                    x2={toXTs(st.s)}
                    y2={toYTs(st.T)}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                );
              })}

              {/* Plotted State Points */}
              {plottedStates.map((st, idx) => {
                const cx = toXTs(st.s);
                const cy = toYTs(st.T);
                return (
                  <g key={st.id} className="cursor-pointer group">
                    <circle cx={cx} cy={cy} r="4.5" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x={cx}
                      y={cy - 8}
                      fill="#000000"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      #{idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Axes Labels */}
              <text
                x={width / 2}
                y={height - 12}
                fill="#0f172a"
                fontSize="11"
                textAnchor="middle"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                Entropia Específica, s [kJ/(kg·K)]
              </text>
              <text
                x={-height / 2}
                y={16}
                fill="#0f172a"
                fontSize="11"
                textAnchor="middle"
                transform="rotate(-90)"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                Temperatura, T [°C]
              </text>
            </>
          ) : (
            /* ==================== P - v DIAGRAM ==================== */
            <>
              {/* P Horizontal Grid Lines */}
              {pTicks.map((P) => (
                <g key={P}>
                  <line
                    x1={padding}
                    y1={toYPv(P)}
                    x2={width - padding}
                    y2={toYPv(P)}
                    stroke="#e2e8f0"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding - 8}
                    y={toYPv(P) + 4}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="JetBrains Mono"
                  >
                    {P} MPa
                  </text>
                </g>
              ))}

              {/* v Vertical Grid Lines (Log Scale) */}
              {vTicks.map((vt) => (
                <g key={vt.val}>
                  <line
                    x1={toXPv(vt.val)}
                    y1={padding}
                    x2={toXPv(vt.val)}
                    y2={height - padding}
                    stroke="#e2e8f0"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={toXPv(vt.val)}
                    y={height - padding + 15}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    {vt.label}
                  </text>
                </g>
              ))}

              {/* P-v Saturation Dome */}
              <path d={domePathPv} fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="square" />
              <path d={`${domePathPv} Z`} fill="rgba(2, 132, 199, 0.05)" />

              {/* Critical Point Marker (P-v) */}
              <circle cx={toXPv(0.003106)} cy={toYPv(22.064)} r="3.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
              <text
                x={toXPv(0.003106)}
                y={toYPv(22.064) - 8}
                fill="#0f172a"
                fontSize="9"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                PONTO CRÍTICO
              </text>

              {/* Process Lines connecting states */}
              {plottedStates.map((st, i) => {
                if (i === 0) return null;
                const prev = plottedStates[i - 1];
                return (
                  <line
                    key={`line-${i}`}
                    x1={toXPv(prev.v)}
                    y1={toYPv(prev.P_MPa)}
                    x2={toXPv(st.v)}
                    y2={toYPv(st.P_MPa)}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                );
              })}

              {/* Plotted State Points */}
              {plottedStates.map((st, idx) => {
                const cx = toXPv(st.v);
                const cy = toYPv(st.P_MPa);
                return (
                  <g key={st.id} className="cursor-pointer group">
                    <circle cx={cx} cy={cy} r="4.5" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x={cx}
                      y={cy - 8}
                      fill="#000000"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      #{idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Axes Labels */}
              <text
                x={width / 2}
                y={height - 12}
                fill="#0f172a"
                fontSize="11"
                textAnchor="middle"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                Volume Específico, v [m³/kg] (Escala Logarítmica)
              </text>
              <text
                x={-height / 2}
                y={16}
                fill="#0f172a"
                fontSize="11"
                textAnchor="middle"
                transform="rotate(-90)"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                Pressão, P [MPa]
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Legend & Stats */}
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
