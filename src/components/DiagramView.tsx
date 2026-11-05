import React from 'react';
import { ThermodynamicState, SubstanceCategory, ProcessCurve, UnitSystem } from '../types/thermo';
import { FLUID_CATALOG } from '../engine/refrigerants';
import { GAS_CATALOG } from '../engine/idealGases';
import { WATER_TS_DOME, WATER_PV_DOME } from '../engine/waterDome';
import { UnitConverter } from '../engine/units';
import { X } from 'lucide-react';

interface DiagramViewProps {
  states: ThermodynamicState[];
  category: SubstanceCategory;
  currentSubstance: string;
  diagramType: 'Ts' | 'Pv';
  setDiagramType: (d: 'Ts' | 'Pv') => void;
  unitSystem?: UnitSystem;
  processCurves?: ProcessCurve[];
  onClearProcessCurves?: () => void;
  onDeleteProcessCurve?: (id: string) => void;
}

export const DiagramView: React.FC<DiagramViewProps> = ({
  states,
  category,
  currentSubstance,
  diagramType,
  setDiagramType,
  unitSystem = 'SI',
  processCurves = [],
  onClearProcessCurves,
  onDeleteProcessCurve,
}) => {
  const width = 640;
  const height = 370;
  const padL = 65;
  const padR = 35;
  const padT = 35;
  const padB = 55;

  const units = UnitConverter.getUnitLabels(unitSystem);

  // Plotted states already filtered by App, sorted chronologically (#1 -> #2 -> #3)
  const plottedStates = [...states]
    .filter((s) => s.category === category)
    .sort((a, b) => (a.stateNumber ?? 0) - (b.stateNumber ?? 0) || (a.timestamp ?? 0) - (b.timestamp ?? 0));

  const activeCurves = processCurves.filter((c) => c.category === category);

  // =========================================================================
  // 1. FLUIDS & GASES SCALES (T-s & P-v) WITH DYNAMIC OVERFLOW AUTO-RANGE
  // =========================================================================
  const tsDomeWater = WATER_TS_DOME;
  const pvDomeWater = WATER_PV_DOME;

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
  let minT = 0, maxT = 400;
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

  // Expand bounds ONLY if plotted states or process curves exceed default bounds
  let defaultScaleUnchanged = true;
  if (category === 'WATER' || category === 'REFRIGERANTS' || category === 'CRYOGENICS' || category === 'AIR' || category === 'IDEAL_GASES') {
    const sampleTs: number[] = [];
    const sampleSs: number[] = [];
    const samplePs: number[] = [];
    const sampleVs: number[] = [];

    plottedStates.forEach((st) => {
      if (Number.isFinite(st.T)) sampleTs.push(st.T);
      if (Number.isFinite(st.s)) sampleSs.push(st.s);
      if (Number.isFinite(st.P_MPa)) samplePs.push(st.P_MPa);
      if (Number.isFinite(st.v) && st.v > 0) sampleVs.push(st.v);
    });
    activeCurves.forEach((c) => {
      c.path.forEach((pt) => {
        if (Number.isFinite(pt.T)) sampleTs.push(pt.T);
        if (Number.isFinite(pt.s)) sampleSs.push(pt.s);
        if (Number.isFinite(pt.P)) samplePs.push(pt.P * 0.1);
        if (Number.isFinite(pt.v) && pt.v > 0) sampleVs.push(pt.v);
      });
    });

    if (sampleTs.length > 0) {
      const obsMinT = Math.min(...sampleTs);
      const obsMaxT = Math.max(...sampleTs);
      if (obsMinT < minT) {
        minT = Math.floor((obsMinT - 20) / 50) * 50;
        defaultScaleUnchanged = false;
      }
      if (obsMaxT > maxT) {
        maxT = Math.ceil((obsMaxT * 1.1 + 20) / 50) * 50;
        defaultScaleUnchanged = false;
      }
    }

    if (sampleSs.length > 0) {
      const obsMinS = Math.min(...sampleSs);
      const obsMaxS = Math.max(...sampleSs);
      if (obsMinS < minS) {
        minS = Math.floor((obsMinS - 0.5) * 2) / 2;
        defaultScaleUnchanged = false;
      }
      if (obsMaxS > maxS) {
        maxS = Math.ceil(obsMaxS * 1.12);
        defaultScaleUnchanged = false;
      }
    }

    if (samplePs.length > 0) {
      const obsMaxP = Math.max(...samplePs);
      if (obsMaxP > maxP) {
        maxP = Math.ceil(obsMaxP * 1.15);
        defaultScaleUnchanged = false;
      }
    }

    if (sampleVs.length > 0) {
      const obsMinLogV = Math.log10(Math.max(1e-6, Math.min(...sampleVs)));
      const obsMaxLogV = Math.log10(Math.max(...sampleVs));
      if (obsMinLogV < minLogV) minLogV = Math.floor((obsMinLogV - 0.2) * 2) / 2;
      if (obsMaxLogV > maxLogV) maxLogV = Math.ceil((obsMaxLogV + 0.2) * 2) / 2;
    }
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
  // 2. PSYCHROMETRIC CHART SCALES (with auto-range if out of bounds)
  // =========================================================================
  let minTdb = -10, maxTdb = 50;
  let minW = 0, maxW = 30;
  if (category === 'PSYCHROMETRICS' && plottedStates.length > 0) {
    const maxObsTdb = Math.max(...plottedStates.map((s) => s.Tdb ?? s.T));
    const minObsTdb = Math.min(...plottedStates.map((s) => s.Tdb ?? s.T));
    const maxObsW = Math.max(...plottedStates.map((s) => (s.w ?? 0) * 1000));
    if (maxObsTdb > maxTdb) maxTdb = Math.ceil((maxObsTdb + 5) / 10) * 10;
    if (minObsTdb < minTdb) minTdb = Math.floor((minObsTdb - 5) / 10) * 10;
    if (maxObsW > maxW) maxW = Math.ceil((maxObsW + 5) / 10) * 10;
  }
  const toXPsych = (t: number) => padL + ((t - minTdb) / (maxTdb - minTdb || 1)) * (width - padL - padR);
  const toYPsych = (w_g: number) => height - padB - ((w_g - minW) / (maxW - minW || 1)) * (height - padT - padB);

  const generateRhPath = (rhPercent: number) => {
    const pts: { x: number; y: number }[] = [];
    for (let t = minTdb; t <= maxTdb; t += 2) {
      const pvs = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
      const pv = (rhPercent / 100) * pvs;
      const w_kg = 0.62198 * (pv / Math.max(1, 101.325 - pv));
      const w_g = Math.min(maxW, Math.max(0, w_kg * 1000));
      pts.push({ x: toXPsych(t), y: toYPsych(w_g) });
    }
    return pts.reduce((acc, pt, idx) => idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');
  };

  // =========================================================================
  // 3. COMPRESSIBILITY CHART SCALES (with auto-range if out of bounds)
  // =========================================================================
  let minPr = 0, maxPr = 10;
  let minZ = 0, maxZ = 1.2;
  if (category === 'COMPRESSIBILITY' && plottedStates.length > 0) {
    const maxObsPr = Math.max(...plottedStates.map((s) => s.Pr_red ?? s.P));
    const maxObsZ = Math.max(...plottedStates.map((s) => s.Z ?? 1.0));
    if (maxObsPr > maxPr) maxPr = Math.ceil(maxObsPr * 1.15);
    if (maxObsZ > maxZ) maxZ = Math.ceil(maxObsZ * 10 + 1) / 10;
  }
  const toXCompr = (pr: number) => padL + ((pr - minPr) / (maxPr - minPr || 1)) * (width - padL - padR);
  const toYCompr = (z: number) => height - padB - ((z - minZ) / (maxZ - minZ || 1)) * (height - padT - padB);

  const generateZCurve = (Tr: number) => {
    const pts: { x: number; y: number }[] = [];
    const step = maxPr / 50;
    for (let pr = 0.05; pr <= maxPr; pr += step) {
      const B0 = 0.083 - 0.422 / Math.pow(Tr, 1.6);
      let z = 1 + B0 * (pr / Tr);
      if (pr > 0.6) {
        z = Math.max(0.15, Math.min(maxZ, 1 + B0 * (pr / Tr) + 0.05 * Math.pow(pr / Tr, 2)));
      }
      pts.push({ x: toXCompr(pr), y: toYCompr(z) });
    }
    return pts.reduce((acc, pt, idx) => idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');
  };

  // Helper: Directional Arrowhead (1 -> 2) at midpoint of a screen-space polyline
  const renderDirectionArrow = (screenPts: { x: number; y: number }[]) => {
    if (screenPts.length < 2) return null;
    const midIdx = Math.floor(screenPts.length / 2);
    let p1 = screenPts[Math.max(0, midIdx - 1)];
    let p2 = screenPts[Math.min(screenPts.length - 1, midIdx + 1)];
    if (Math.hypot(p2.x - p1.x, p2.y - p1.y) < 4) {
      p1 = screenPts[0];
      p2 = screenPts[screenPts.length - 1];
    }
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    if (Math.hypot(dx, dy) < 3) return null;

    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const cx = screenPts[midIdx].x;
    const cy = screenPts[midIdx].y;

    return (
      <polygon
        points="6,0 -5,-4.5 -3,0 -5,4.5"
        transform={`translate(${cx}, ${cy}) rotate(${angleDeg})`}
        fill="#dc2626"
        stroke="#ffffff"
        strokeWidth="1"
      />
    );
  };

  // Helper: Render Process Curves in T-s coordinates
  const renderTsProcessCurves = () =>
    activeCurves.map((c) => {
      if (c.path.length < 2) return null;
      const screenPts = c.path.map((pt) => ({ x: toXTs(pt.s), y: toYTs(pt.T) }));
      const d = screenPts.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
      const midPt = screenPts[Math.floor(screenPts.length / 2)];
      return (
        <g key={c.id}>
          <path d={d} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
          {renderDirectionArrow(screenPts)}
          <circle cx={toXTs(c.state1.s)} cy={toYTs(c.state1.T)} r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx={toXTs(c.state2.s)} cy={toYTs(c.state2.T)} r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
          <text
            x={midPt.x}
            y={midPt.y - 10}
            fill="#b91c1c"
            fontSize="9"
            fontWeight="bold"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
            stroke="#ffffff"
            strokeWidth="3"
            paintOrder="stroke fill"
          >
            {c.label}
          </text>
        </g>
      );
    });

  // Grid ticks for T-s and P-v
  const tTicks = (category === 'WATER' || category === 'AIR' || category === 'IDEAL_GASES') && defaultScaleUnchanged
    ? (category === 'WATER' ? [100, 200, 300] : [100, 200, 300, 400])
    : [0.2, 0.4, 0.6, 0.8].map((f) => Math.round(minT + f * (maxT - minT)));

  const sTicks = (category === 'WATER' || category === 'AIR' || category === 'IDEAL_GASES') && defaultScaleUnchanged
    ? [2, 4, 6, 8]
    : [0.2, 0.4, 0.6, 0.8].map((f) => Number((minS + f * (maxS - minS)).toFixed(2)));

  const pTicks = category === 'WATER' && maxP === 25
    ? [5, 10, 15, 20]
    : [0.2, 0.4, 0.6, 0.8].map((f) => Number((minP + f * (maxP - minP)).toFixed(2)));

  const idealGasFormula = category === 'IDEAL_GASES'
    ? (GAS_CATALOG[currentSubstance]?.formula || currentSubstance.toUpperCase())
    : '';

  return (
    <div className="bg-white border-2 border-slate-900 p-3 sm:p-5 shadow-sm space-y-3 font-mono flex flex-col justify-between h-full">
      {/* Header & Diagram Selector */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
        <div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">
            {category === 'PSYCHROMETRICS'
              ? 'Carta Psicrométrica (Ar Úmido)'
              : category === 'COMPRESSIBILITY'
              ? 'Carta Generalizada de Compressibilidade (Z vs. Pr)'
              : category === 'AIR' || category === 'IDEAL_GASES'
              ? `Diagrama T - s (${category === 'AIR' ? 'Ar' : `Gás Ideal — ${idealGasFormula}`})`
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
              className={`px-3 py-1 transition-colors uppercase font-bold text-xs cursor-pointer ${
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
              className={`px-3 py-1 transition-colors uppercase font-bold text-xs cursor-pointer ${
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

      {/* SVG Canvas */}
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
              {[1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1].map((f) => Math.round(f * maxW)).map((wg) => (
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

              {Array.from({ length: Math.round((maxTdb - minTdb) / 10) + 1 }, (_, i) => minTdb + i * 10).map((t) => (
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

              {[10, 30, 50, 70, 100].map((rh) => (
                <g key={rh}>
                  <path
                    d={generateRhPath(rh)}
                    fill="none"
                    stroke={rh === 100 ? '#0284c7' : '#94a3b8'}
                    strokeWidth={rh === 100 ? '2' : '1'}
                    strokeDasharray={rh === 100 ? 'none' : '3 3'}
                  />
                  <text
                    x={toXPsych(Math.min(maxTdb - 8, 38))}
                    y={toYPsych(Math.min(maxW - 2, (rh / 100) * 45))}
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
                Razão de Umidade, ω [g água / kg ar seco]
              </text>
            </>
          )}

          {/* =========================================================================
              VIEW B: COMPRESSIBILITY CHART (Z vs Pr)
             ========================================================================= */}
          {category === 'COMPRESSIBILITY' && (
            <>
              {[0.2, 0.4, 0.6, 0.8, 1.0, 1.2].filter((z) => z <= maxZ + 0.01).map((z) => (
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

              {[0.2, 0.4, 0.6, 0.8, 1.0].map((f) => Number((f * maxPr).toFixed(1))).map((pr) => (
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

              {[0.8, 1.0, 1.2, 1.5, 2.0].map((tr) => (
                <g key={tr}>
                  <path
                    d={generateZCurve(tr)}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <text
                    x={toXCompr(maxPr * 0.75)}
                    y={toYCompr(Math.min(maxZ - 0.05, 1 + (0.083 - 0.422 / Math.pow(tr, 1.6)) * ((maxPr * 0.75) / tr))) - 4}
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
              VIEW C: AIR & IDEAL GASES (T-s DIAGRAM WITH PROCESS CURVES)
             ========================================================================= */}
          {(category === 'AIR' || category === 'IDEAL_GASES') && (
            <>
              {tTicks.map((T) => (
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

              {sTicks.map((s) => (
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

              {/* Plotted Thermodynamic Process Curves (T-s) */}
              {renderTsProcessCurves()}

              {/* Dashed state connectors when no process curve is plotted */}
              {activeCurves.length === 0 &&
                plottedStates.map((st, i) => {
                  if (i === 0) return null;
                  const prev = plottedStates[i - 1];
                  if (!Number.isFinite(prev.s) || !Number.isFinite(prev.T) || !Number.isFinite(st.s) || !Number.isFinite(st.T)) return null;
                  return (
                    <line
                      key={`air-line-${i}`}
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

              {/* Plotted States */}
              {plottedStates.map((st, idx) => {
                const cx = toXTs(st.s ?? 6.8);
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
              VIEW D: FLUIDS (WATER, REFRIGERANTS, CRYOGENICS) T-s DIAGRAM
             ========================================================================= */}
          {(category === 'WATER' || category === 'REFRIGERANTS' || category === 'CRYOGENICS') && diagramType === 'Ts' && (
            <>
              {tTicks.map((T) => (
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

              {sTicks.map((s) => (
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

              {/* T-s Saturation Dome */}
              <path d={domePathTs} fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="square" />
              <path d={`${domePathTs} Z`} fill="rgba(2, 132, 199, 0.05)" />

              {/* Critical Point Marker */}
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

              {/* Plotted Thermodynamic Process Curves (T-s) */}
              {renderTsProcessCurves()}

              {/* Dashed state connectors when no process curve is plotted */}
              {activeCurves.length === 0 &&
                plottedStates.map((st, i) => {
                  if (i === 0) return null;
                  const prev = plottedStates[i - 1];
                  if (!Number.isFinite(prev.s) || !Number.isFinite(prev.T) || !Number.isFinite(st.s) || !Number.isFinite(st.T)) return null;
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
              {pTicks.map((P) => (
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
              ))}

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

              {/* Critical Point Marker (P-v) */}
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

              {/* Plotted Thermodynamic Process Curves (P-v) with Directional Arrowhead */}
              {activeCurves.map((c) => {
                if (c.path.length < 2) return null;
                const screenPts = c.path.map((pt) => ({ x: toXPv(pt.v), y: toYPv(pt.P * 0.1) }));
                const d = screenPts.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
                const midPt = screenPts[Math.floor(screenPts.length / 2)];
                return (
                  <g key={c.id}>
                    <path d={d} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                    {renderDirectionArrow(screenPts)}
                    <circle cx={toXPv(c.state1.v)} cy={toYPv(c.state1.P_MPa)} r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx={toXPv(c.state2.v)} cy={toYPv(c.state2.P_MPa)} r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x={midPt.x}
                      y={midPt.y - 10}
                      fill="#b91c1c"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                      stroke="#ffffff"
                      strokeWidth="3"
                      paintOrder="stroke fill"
                    >
                      {c.label}
                    </text>
                  </g>
                );
              })}

              {/* Dashed state connectors when no process curve is plotted */}
              {activeCurves.length === 0 &&
                plottedStates.map((st, i) => {
                  if (i === 0) return null;
                  const prev = plottedStates[i - 1];
                  if (!Number.isFinite(prev.v) || !Number.isFinite(prev.P_MPa) || !Number.isFinite(st.v) || !Number.isFinite(st.P_MPa)) return null;
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
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            {category !== 'AIR' && category !== 'IDEAL_GASES' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-sky-600 inline-block"></span>
                {category === 'PSYCHROMETRICS'
                  ? 'Curvas de Saturação e UR'
                  : category === 'COMPRESSIBILITY'
                  ? 'Isotermas Reduzidas (Tr)'
                  : 'Domo de Saturação'}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-black inline-block"></span>
              Estados Registrados
            </span>
            {activeCurves.length > 0 && (
              <span className="flex items-center gap-1.5 text-rose-700 font-bold">
                <span className="w-3 h-0.5 bg-rose-600 inline-block"></span>
                Processos Traçados ({activeCurves.length})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeCurves.length > 0 && onClearProcessCurves && (
              <button
                onClick={onClearProcessCurves}
                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-[10px] uppercase cursor-pointer"
                title="Limpar processos traçados desta substância"
              >
                Limpar Traçado
              </button>
            )}
            <span>Total: {plottedStates.length} ponto(s) plotados</span>
          </div>
        </div>

        {/* Plotted Processes Summary Strip (Work w & Heat q) */}
        {activeCurves.length > 0 && (
          <div className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 space-y-1 text-[11px]">
            {activeCurves.map((c, idx) => {
              const mm = c.state1.molarMass ?? 18.015;
              const wDisp = UnitConverter.fromInternalEnergy(c.work, units.h, mm).toLocaleString('pt-BR', {
                useGrouping: false,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              const qDisp = UnitConverter.fromInternalEnergy(c.heat, units.h, mm).toLocaleString('pt-BR', {
                useGrouping: false,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              return (
                <div key={c.id} className="flex items-center justify-between gap-2 border-b last:border-b-0 border-slate-200 pb-0.5 last:pb-0">
                  <span className="font-bold text-rose-800 truncate">
                    P{idx + 1}: {c.label}
                  </span>
                  <div className="flex items-center gap-3 shrink-0 text-slate-800">
                    <span>
                      w = <strong>{wDisp} {units.h}</strong>
                    </span>
                    <span>
                      q = <strong>{qDisp} {units.h}</strong>
                    </span>
                    {onDeleteProcessCurve && (
                      <button
                        onClick={() => onDeleteProcessCurve(c.id)}
                        className="text-slate-400 hover:text-rose-700 cursor-pointer"
                        title="Remover este processo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
