import React from 'react';
import { ThermodynamicState, SubstanceCategory } from '../types/thermo';
import { FLUID_CATALOG } from '../engine/refrigerants';

interface DiagramViewProps {
  states: ThermodynamicState[];
  category: SubstanceCategory;
  currentSubstance: string;
  diagramType: 'Ts' | 'Pv';
  setDiagramType: (d: 'Ts' | 'Pv') => void;
}

export const DiagramView: React.FC<DiagramViewProps> = ({
  states,
  category,
  currentSubstance,
  diagramType,
  setDiagramType,
}) => {
  const width = 640;
  const height = 370;
  const padL = 65;
  const padR = 35;
  const padT = 35;
  const padB = 55;

  // =========================================================================
  // 1. FLUIDS (WATER, REFRIGERANTS, CRYOGENICS) - T-s & P-v
  // =========================================================================
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

  const pvDomeWater = [
    { v: 0.001000, P: 0.000611 },
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

  // Fluid Dome selection & dynamic scale bounds
  const fluidDef = (category === 'REFRIGERANTS' || category === 'CRYOGENICS')
    ? (FLUID_CATALOG[currentSubstance] || FLUID_CATALOG['r134a'])
    : null;

  let tsDomePoints = tsDomeWater;
  let pvDomePoints = pvDomeWater;
  let critT = 373.95;
  let critS = 4.412;
  let critP = 22.064; // MPa
  let critV = 0.003106;

  let minS = 0, maxS = 10;
  let minT = 0, maxT = 450;
  let minP = 0, maxP = 25; // MPa
  let minLogV = -3.2, maxLogV = 1.0;

  if (fluidDef) {
    critT = fluidDef.Tc;
    critP = Number((fluidDef.Pc * 0.1).toFixed(4));
    const lastPt = fluidDef.table[fluidDef.table.length - 1];
    critS = Number(((lastPt.sf + lastPt.sg) / 2).toFixed(4));
    critV = Number(((lastPt.vf + lastPt.vg) / 2).toFixed(6));

    const liqLine = fluidDef.table.map((p) => ({ s: p.sf, T: p.T }));
    const vapLine = [...fluidDef.table].reverse().map((p) => ({ s: p.sg, T: p.T }));
    tsDomePoints = [...liqLine, { s: critS, T: critT }, ...vapLine];

    const liqPv = fluidDef.table.map((p) => ({ v: p.vf, P: p.P * 0.1 }));
    const vapPv = [...fluidDef.table].reverse().map((p) => ({ v: p.vg, P: p.P * 0.1 }));
    pvDomePoints = [...liqPv, { v: critV, P: critP }, ...vapPv];

    const allT = fluidDef.table.map((p) => p.T);
    const allS = [...fluidDef.table.map((p) => p.sf), ...fluidDef.table.map((p) => p.sg)];
    const allV = [...fluidDef.table.map((p) => p.vf), ...fluidDef.table.map((p) => p.vg)];

    const rawMinT = Math.min(...allT, critT);
    const rawMaxT = Math.max(...allT, critT);
    const spanT = Math.max(10, rawMaxT - rawMinT);
    minT = Math.floor((rawMinT - spanT * 0.1) / 10) * 10;
    maxT = Math.ceil((rawMaxT + spanT * 0.15) / 10) * 10;

    const rawMinS = Math.min(...allS, critS);
    const rawMaxS = Math.max(...allS, critS);
    const spanS = Math.max(0.5, rawMaxS - rawMinS);
    minS = Math.floor((rawMinS - spanS * 0.1) * 10) / 10;
    maxS = Math.ceil((rawMaxS + spanS * 0.15) * 10) / 10;

    maxP = Math.ceil(critP * 1.25);
    minP = 0;

    const rawMinV = Math.max(1e-5, Math.min(...allV));
    const rawMaxV = Math.max(...allV);
    minLogV = Math.floor(Math.log10(rawMinV) * 10) / 10;
    maxLogV = Math.ceil(Math.log10(rawMaxV) * 10) / 10;
  }

  const toXTs = (s: number) => padL + ((s - minS) / (maxS - minS || 1)) * (width - padL - padR);
  const toYTs = (T: number) => height - padB - ((T - minT) / (maxT - minT || 1)) * (height - padT - padB);

  const toXPv = (v: number) => {
    const safeV = Math.max(Math.pow(10, minLogV), Math.min(Math.pow(10, maxLogV), v));
    const logV = Math.log10(safeV);
    return padL + ((logV - minLogV) / (maxLogV - minLogV || 1)) * (width - padL - padR);
  };
  const toYPv = (P_MPa: number) => {
    const safeP = Math.max(0, Math.min(maxP, P_MPa));
    return height - padB - ((safeP - minP) / (maxP - minP || 1)) * (height - padT - padB);
  };

  const domePathTs = tsDomePoints.reduce((acc, pt, idx) => {
    const x = toXTs(pt.s);
    const y = toYTs(pt.T);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const domePathPv = pvDomePoints.reduce((acc, pt, idx) => {
    const x = toXPv(pt.v);
    const y = toYPv(pt.P);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // =========================================================================
  // 2. PSYCHROMETRIC CHART SCALES (Tdb: -10 to 50°C, w: 0 to 30 g/kg)
  // =========================================================================
  const minTdb = -10, maxTdb = 50;
  const minW = 0, maxW = 30; // g water / kg dry air
  const toXPsych = (t: number) => padL + ((t - minTdb) / (maxTdb - minTdb)) * (width - padL - padR);
  const toYPsych = (w_g: number) => height - padB - ((w_g - minW) / (maxW - minW)) * (height - padT - padB);

  // Saturation and RH curves for Psychrometrics
  const generateRhPath = (rhPercent: number) => {
    const pts: { x: number; y: number }[] = [];
    for (let t = -10; t <= 50; t += 2) {
      // Saturation pressure in kPa
      const pvs = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
      const pv = (rhPercent / 100) * pvs;
      const w_kg = 0.62198 * (pv / (101.325 - pv));
      const w_g = Math.min(30, Math.max(0, w_kg * 1000));
      pts.push({ x: toXPsych(t), y: toYPsych(w_g) });
    }
    return pts.reduce((acc, pt, idx) => idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');
  };

  // =========================================================================
  // 3. COMPRESSIBILITY CHART SCALES (Pr: 0 to 10, Z: 0 to 1.2)
  // =========================================================================
  const minPr = 0, maxPr = 10;
  const minZ = 0, maxZ = 1.2;
  const toXCompr = (pr: number) => padL + ((pr - minPr) / (maxPr - minPr)) * (width - padL - padR);
  const toYCompr = (z: number) => height - padB - ((z - minZ) / (maxZ - minZ)) * (height - padT - padB);

  const generateZCurve = (Tr: number) => {
    const pts: { x: number; y: number }[] = [];
    for (let pr = 0.05; pr <= 10; pr += 0.2) {
      const B0 = 0.083 - 0.422 / Math.pow(Tr, 1.6);
      let z = 1 + B0 * (pr / Tr);
      if (pr > 0.6) {
        z = Math.max(0.15, Math.min(1.2, 1 + B0 * (pr / Tr) + 0.05 * Math.pow(pr / Tr, 2)));
      }
      pts.push({ x: toXCompr(pr), y: toYCompr(z) });
    }
    return pts.reduce((acc, pt, idx) => idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');
  };

  // Plotted states filter
  const plottedStates = states.filter((s) => s.category === category);

  return (
    <div className="bg-white border-2 border-slate-900 p-3 sm:p-5 shadow-sm space-y-3 font-mono flex flex-col justify-between h-full">
      {/* Header & Diagram Selector */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
        <div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">
            {category === 'PSYCHROMETRICS'
              ? 'Carta Psicrométrica (Psychrometric Chart)'
              : category === 'COMPRESSIBILITY'
              ? 'Carta Generalizada de Compressibilidade (Z vs. Pr)'
              : category === 'AIR' || category === 'IDEAL_GASES'
              ? `Diagrama T - s (${category === 'AIR' ? 'Ar' : 'Gás Ideal'})`
              : diagramType === 'Ts' ? 'Diagrama T - s' : 'Diagrama P - v'}
          </h3>
          <p className="text-[10px] text-slate-500 font-mono">
            {category === 'PSYCHROMETRICS'
              ? 'Bulbo Seco [°C] vs. Razão de Umidade [g/kg ar seco] com curvas de UR (%)'
              : category === 'COMPRESSIBILITY'
              ? 'Pressão Reduzida (Pr) vs. Fator Z com isotermas reduzidas (Tr)'
              : category === 'AIR' || category === 'IDEAL_GASES'
              ? 'Temperatura [°C] vs. Entropia Específica [kJ/(kg·K)]'
              : diagramType === 'Ts'
              ? 'Temperatura [°C] vs. Entropia Específica [kJ/(kg·K)]'
              : 'Pressão [MPa] vs. Volume Específico [m³/kg] (Escala Log)'}
          </p>
        </div>

        {/* T-s and P-v Toggle buttons only for Fluids */}
        {(category === 'WATER' || category === 'REFRIGERANTS' || category === 'CRYOGENICS') && (
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
        )}
      </div>

      {/* SVG Canvas with Clean Engineering Look and Halo Anti-Collision */}
      <div className="bg-white border border-slate-300 p-1 flex items-center justify-center overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[360px]">
          {/* Main Coordinate Axes */}
          <line
            x1={padL}
            y1={height - padB}
            x2={width - padR}
            y2={height - padB}
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={height - padB}
            stroke="#0f172a"
            strokeWidth="1.5"
          />

          {/* =========================================================================
              VIEW A: PSYCHROMETRIC CHART
             ========================================================================= */}
          {category === 'PSYCHROMETRICS' && (
            <>
              {/* Horizontal w Gridlines */}
              {[5, 10, 15, 20, 25, 30].map((wg) => (
                <g key={wg}>
                  <line
                    x1={padL}
                    y1={toYPsych(wg)}
                    x2={width - padR}
                    y2={toYPsych(wg)}
                    stroke="#f1f5f9"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padL - 8}
                    y={toYPsych(wg) + 4}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="JetBrains Mono"
                  >
                    {wg}
                  </text>
                </g>
              ))}

              {/* Vertical Tdb Gridlines */}
              {[-10, 0, 10, 20, 30, 40, 50].map((t) => (
                <g key={t}>
                  <line
                    x1={toXPsych(t)}
                    y1={padT}
                    x2={toXPsych(t)}
                    y2={height - padB}
                    stroke="#f1f5f9"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={toXPsych(t)}
                    y={height - padB + 16}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    {t}°
                  </text>
                </g>
              ))}

              {/* Relative Humidity Curves (10%, 30%, 50%, 70%, 100%) */}
              {[10, 30, 50, 70, 100].map((rh) => (
                <g key={rh}>
                  <path
                    d={generateRhPath(rh)}
                    fill="none"
                    stroke={rh === 100 ? '#0284c7' : '#94a3b8'}
                    strokeWidth={rh === 100 ? '2' : '1'}
                    strokeDasharray={rh === 100 ? 'none' : '3 3'}
                  />
                  {/* RH Curve Label */}
                  <text
                    x={toXPsych(38)}
                    y={toYPsych(Math.min(28, (rh / 100) * 45))}
                    fill={rh === 100 ? '#0284c7' : '#64748b'}
                    fontSize="8"
                    fontWeight="bold"
                    stroke="white"
                    strokeWidth="3"
                    paintOrder="stroke fill"
                  >
                    φ={rh}%
                  </text>
                </g>
              ))}

              {/* Plotted Psychrometric State Points */}
              {plottedStates.map((st, idx) => {
                const cx = toXPsych(st.Tdb ?? st.T);
                const cy = toYPsych((st.w ?? 0) * 1000);
                return (
                  <g key={st.id}>
                    <circle cx={cx} cy={cy} r="4.5" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
                    <rect
                      x={cx - 16}
                      y={cy - 22}
                      width="32"
                      height="14"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 12}
                      fill="#000000"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      #{idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Axis Labels */}
              <text
                x={(width - padL - padR) / 2 + padL}
                y={height - 12}
                fill="#0f172a"
                fontSize="11"
                textAnchor="middle"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                Temperatura de Bulbo Seco, Tbs [°C]
              </text>
              <text
                x={-(height - padT - padB) / 2 - padT}
                y={18}
                fill="#0f172a"
                fontSize="11"
                textAnchor="middle"
                transform="rotate(-90)"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                Razão de Umidade, w [g água / kg ar seco]
              </text>
            </>
          )}

          {/* =========================================================================
              VIEW B: COMPRESSIBILITY CHART (Z vs Pr)
             ========================================================================= */}
          {category === 'COMPRESSIBILITY' && (
            <>
              {/* Horizontal Z Gridlines */}
              {[0.2, 0.4, 0.6, 0.8, 1.0, 1.2].map((z) => (
                <g key={z}>
                  <line
                    x1={padL}
                    y1={toYCompr(z)}
                    x2={width - padR}
                    y2={toYCompr(z)}
                    stroke={z === 1.0 ? '#cbd5e1' : '#f1f5f9'}
                    strokeWidth={z === 1.0 ? '1.5' : '1'}
                    strokeDasharray={z === 1.0 ? 'none' : '2 2'}
                  />
                  <text
                    x={padL - 8}
                    y={toYCompr(z) + 4}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="JetBrains Mono"
                  >
                    {z.toFixed(1)}
                  </text>
                </g>
              ))}

              {/* Vertical Pr Gridlines */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pr) => (
                <g key={pr}>
                  <line
                    x1={toXCompr(pr)}
                    y1={padT}
                    x2={toXCompr(pr)}
                    y2={height - padB}
                    stroke="#f1f5f9"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={toXCompr(pr)}
                    y={height - padB + 16}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    {pr}
                  </text>
                </g>
              ))}

              {/* Reduced Isotherms (Tr = 0.8, 1.0, 1.2, 1.5, 2.0) */}
              {[0.8, 1.0, 1.2, 1.5, 2.0].map((tr) => (
                <g key={tr}>
                  <path
                    d={generateZCurve(tr)}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <text
                    x={toXCompr(7.5)}
                    y={toYCompr(Math.min(1.15, 1 + (0.083 - 0.422 / Math.pow(tr, 1.6)) * (7.5 / tr))) - 4}
                    fill="#0284c7"
                    fontSize="8"
                    fontWeight="bold"
                    stroke="white"
                    strokeWidth="3"
                    paintOrder="stroke fill"
                  >
                    Tr={tr}
                  </text>
                </g>
              ))}

              {/* Plotted States */}
              {plottedStates.map((st, idx) => {
                const cx = toXCompr(st.Pr_red ?? st.P);
                const cy = toYCompr(st.Z ?? 1.0);
                return (
                  <g key={st.id}>
                    <circle cx={cx} cy={cy} r="4.5" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
                    <rect
                      x={cx - 16}
                      y={cy - 22}
                      width="32"
                      height="14"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 12}
                      fill="#000000"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      #{idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Axis Labels */}
              <text
                x={(width - padL - padR) / 2 + padL}
                y={height - 12}
                fill="#0f172a"
                fontSize="11"
                textAnchor="middle"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                Pressão Reduzida, Pr = P / Pc
              </text>
              <text
                x={-(height - padT - padB) / 2 - padT}
                y={18}
                fill="#0f172a"
                fontSize="11"
                textAnchor="middle"
                transform="rotate(-90)"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                Fator de Compressibilidade, Z
              </text>
            </>
          )}

          {/* =========================================================================
              VIEW C: AIR & IDEAL GASES (T-s DIAGRAM)
             ========================================================================= */}
          {(category === 'AIR' || category === 'IDEAL_GASES') && (
            <>
              {/* Horizontal T Grid */}
              {[100, 200, 300, 400].map((T) => (
                <g key={T}>
                  <line
                    x1={padL}
                    y1={toYTs(T)}
                    x2={width - padR}
                    y2={toYTs(T)}
                    stroke="#e2e8f0"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padL - 8}
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

              {/* Vertical s Grid */}
              {[2, 4, 6, 8].map((s) => (
                <g key={s}>
                  <line
                    x1={toXTs(s)}
                    y1={padT}
                    x2={toXTs(s)}
                    y2={height - padB}
                    stroke="#e2e8f0"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={toXTs(s)}
                    y={height - padB + 16}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    {s}
                  </text>
                </g>
              ))}

              {/* Plotted States with Clean Non-overlapping Badges */}
              {plottedStates.map((st, idx) => {
                const cx = toXTs(st.s || 6.8);
                const cy = toYTs(st.T);
                return (
                  <g key={st.id}>
                    <circle cx={cx} cy={cy} r="4.5" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
                    <rect
                      x={cx - 16}
                      y={cy - 22}
                      width="32"
                      height="14"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 12}
                      fill="#000000"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      #{idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Axis Labels */}
              <text
                x={(width - padL - padR) / 2 + padL}
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
                x={-(height - padT - padB) / 2 - padT}
                y={18}
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
          )}

          {/* =========================================================================
              VIEW D: FLUIDS (WATER, REFRIGERANTS, CRYOGENICS)
             ========================================================================= */}
          {(category === 'WATER' || category === 'REFRIGERANTS' || category === 'CRYOGENICS') && diagramType === 'Ts' && (
            <>
              {/* T Horizontal Grid Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((f) => {
                const T = Math.round(minT + f * (maxT - minT));
                return (
                  <g key={T}>
                    <line
                      x1={padL}
                      y1={toYTs(T)}
                      x2={width - padR}
                      y2={toYTs(T)}
                      stroke="#e2e8f0"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={padL - 8}
                      y={toYTs(T) + 4}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="JetBrains Mono"
                    >
                      {T}°C
                    </text>
                  </g>
                );
              })}

              {/* s Vertical Grid Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((f) => {
                const s = Number((minS + f * (maxS - minS)).toFixed(2));
                return (
                  <g key={s}>
                    <line
                      x1={toXTs(s)}
                      y1={padT}
                      x2={toXTs(s)}
                      y2={height - padB}
                      stroke="#e2e8f0"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={toXTs(s)}
                      y={height - padB + 16}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      {s}
                    </text>
                  </g>
                );
              })}

              {/* T-s Saturation Dome */}
              <path d={domePathTs} fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="square" />
              <path d={`${domePathTs} Z`} fill="rgba(2, 132, 199, 0.05)" />

              {/* Critical Point Marker (T-s) with White Halo to prevent overlapping curve */}
              <circle cx={toXTs(critS)} cy={toYTs(critT)} r="3.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
              <text
                x={toXTs(critS)}
                y={toYTs(critT) - 12}
                fill="#0f172a"
                fontSize="9"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
                stroke="white"
                strokeWidth="4"
                paintOrder="stroke fill"
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

              {/* Plotted State Points with Non-overlapping Badges */}
              {plottedStates.map((st, idx) => {
                const cx = toXTs(st.s);
                const cy = toYTs(st.T);
                return (
                  <g key={st.id} className="cursor-pointer">
                    <circle cx={cx} cy={cy} r="4.5" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
                    <rect
                      x={cx - 16}
                      y={cy - 22}
                      width="32"
                      height="14"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 12}
                      fill="#000000"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      #{idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Axes Labels with safe margin */}
              <text
                x={(width - padL - padR) / 2 + padL}
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
                x={-(height - padT - padB) / 2 - padT}
                y={18}
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
          )}

          {/* =========================================================================
              VIEW E: FLUIDS P-v DIAGRAM
             ========================================================================= */}
          {(category === 'WATER' || category === 'REFRIGERANTS' || category === 'CRYOGENICS') && diagramType === 'Pv' && (
            <>
              {/* P Horizontal Grid Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((f) => {
                const P = Number((minP + f * (maxP - minP)).toFixed(2));
                return (
                  <g key={P}>
                    <line
                      x1={padL}
                      y1={toYPv(P)}
                      x2={width - padR}
                      y2={toYPv(P)}
                      stroke="#e2e8f0"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={padL - 8}
                      y={toYPv(P) + 4}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="JetBrains Mono"
                    >
                      {P} MPa
                    </text>
                  </g>
                );
              })}

              {/* v Vertical Grid Lines (Log Scale) */}
              {Array.from({ length: Math.max(1, Math.floor(maxLogV) - Math.ceil(minLogV) + 1) }, (_, i) => {
                const p = Math.ceil(minLogV) + i;
                const val = Math.pow(10, p);
                const label = val >= 1 ? val.toString() : val.toFixed(Math.min(5, Math.abs(p))).replace('.', ',');
                return { val, label };
              }).map((vt) => (
                <g key={vt.val}>
                  <line
                    x1={toXPv(vt.val)}
                    y1={padT}
                    x2={toXPv(vt.val)}
                    y2={height - padB}
                    stroke="#e2e8f0"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={toXPv(vt.val)}
                    y={height - padB + 16}
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

              {/* Critical Point Marker (P-v) with halo */}
              <circle cx={toXPv(critV)} cy={toYPv(critP)} r="3.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
              <text
                x={toXPv(critV)}
                y={toYPv(critP) - 12}
                fill="#0f172a"
                fontSize="9"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
                stroke="white"
                strokeWidth="4"
                paintOrder="stroke fill"
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

              {/* Plotted State Points with clean badges */}
              {plottedStates.map((st, idx) => {
                const cx = toXPv(st.v);
                const cy = toYPv(st.P_MPa);
                return (
                  <g key={st.id} className="cursor-pointer">
                    <circle cx={cx} cy={cy} r="4.5" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
                    <rect
                      x={cx - 16}
                      y={cy - 22}
                      width="32"
                      height="14"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 12}
                      fill="#000000"
                      fontSize="9"
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
                x={(width - padL - padR) / 2 + padL}
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
                x={-(height - padT - padB) / 2 - padT}
                y={18}
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
            {category === 'PSYCHROMETRICS'
              ? 'Curvas de Saturação e UR'
              : category === 'COMPRESSIBILITY'
              ? 'Isotermas Reduzidas (Tr)'
              : 'Domo de Saturação'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-black inline-block"></span>
            Estados Registrados
          </span>
        </div>
        <span>Total: {plottedStates.length} ponto(s) plotados</span>
      </div>
    </div>
  );
};
