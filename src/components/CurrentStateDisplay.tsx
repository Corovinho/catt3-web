import React, { useState } from 'react';
import { ThermodynamicState, UnitSystem } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { Check, Copy, PlusCircle, ShieldCheck } from 'lucide-react';

interface CurrentStateDisplayProps {
  state: ThermodynamicState | null;
  unitSystem: UnitSystem;
  onAddState: (st: ThermodynamicState) => void;
}

export const CurrentStateDisplay: React.FC<CurrentStateDisplayProps> = ({
  state,
  unitSystem,
  onAddState,
}) => {
  const [copied, setCopied] = useState(false);

  if (!state) {
    return (
      <div className="bg-white border border-slate-300 p-6 text-center text-slate-400 text-xs font-mono">
        Insira as propriedades acima e clique em CALCULAR para avaliar o estado.
      </div>
    );
  }

  const units = UnitConverter.getUnitLabels(unitSystem, 'bar');

  // Convert values for display
  const dispT = UnitConverter.fromInternalT(state.T, units.T);
  const dispP = UnitConverter.fromInternalP(state.P_MPa, units.P);
  const dispV = UnitConverter.fromInternalV(state.v, units.v);
  const dispU = UnitConverter.fromInternalEnergy(state.u, units.u);
  const dispH = UnitConverter.fromInternalEnergy(state.h, units.h);
  const dispS = UnitConverter.fromInternalEntropy(state.s, units.s);

  const formatNumber = (num: number, decimals: number = 4) => {
    if (isNaN(num) || num === null || num === undefined) return '-';
    if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(4);
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: decimals });
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case 'Superheated Vapor':
        return <span className="px-2 py-0.5 text-[11px] bg-slate-100 text-emerald-800 border border-emerald-600 font-mono font-medium">Vapor Superaquecido</span>;
      case 'Saturated Mixture':
        return <span className="px-2 py-0.5 text-[11px] bg-amber-50 text-amber-900 border border-amber-600 font-mono font-medium">Mistura Saturada</span>;
      case 'Saturated Liquid':
        return <span className="px-2 py-0.5 text-[11px] bg-blue-50 text-blue-900 border border-blue-600 font-mono font-medium">Líquido Saturado</span>;
      case 'Saturated Vapor':
        return <span className="px-2 py-0.5 text-[11px] bg-cyan-50 text-cyan-900 border border-cyan-600 font-mono font-medium">Vapor Saturado Seco</span>;
      case 'Subcooled Liquid':
        return <span className="px-2 py-0.5 text-[11px] bg-indigo-50 text-indigo-900 border border-indigo-600 font-mono font-medium">Líquido Comprimido</span>;
      case 'Supercritical':
        return <span className="px-2 py-0.5 text-[11px] bg-purple-50 text-purple-900 border border-purple-600 font-mono font-medium">Supercrítico</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-800 border border-slate-300 font-mono font-medium">{phase}</span>;
    }
  };

  const copyToClipboard = () => {
    const text = `--- Estado Termodinâmico ---
Substância: ${state.substanceName}
Fase: ${state.phase}
T = ${formatNumber(dispT, 2)} ${units.T}
P = ${formatNumber(dispP, 4)} ${units.P}
v = ${formatNumber(dispV, 6)} ${units.v}
u = ${formatNumber(dispU, 2)} ${units.u}
h = ${formatNumber(dispH, 2)} ${units.h}
s = ${formatNumber(dispS, 4)} ${units.s}
${state.x !== null && state.x !== undefined ? `x = ${formatNumber(state.x, 4)}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-300 p-3 sm:p-5 shadow-sm space-y-4">
      {/* Header with Substance and Phase */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight uppercase">{state.substanceName}</h3>
            <span className="flex items-center gap-1 text-[10px] text-slate-700 font-mono bg-slate-100 px-1.5 py-0.5 border border-slate-300">
              <ShieldCheck className="w-3 h-3 text-black" />
              100% NIST / IF97
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Modo: {state.mode === 'GENERAL' ? 'Propriedades Gerais' : 'Saturação'}</p>
        </div>
        <div>{getPhaseBadge(state.phase)}</div>
      </div>

      {/* Grid of Thermodynamic Properties (Straight Edges & Clean Borders) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Temperature */}
        <div className="bg-slate-50/60 border border-slate-300 p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-mono uppercase font-semibold">Temperatura (T)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-slate-900">{formatNumber(dispT, 2)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.T}</span>
          </div>
        </div>

        {/* Pressure */}
        <div className="bg-slate-50/60 border border-slate-300 p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-mono uppercase font-semibold">Pressão (P)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-slate-900">{formatNumber(dispP, 4)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.P}</span>
          </div>
        </div>

        {/* Specific Volume */}
        <div className="bg-slate-50/60 border border-slate-300 p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-mono uppercase font-semibold">Volume Específico (v)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-slate-900">{formatNumber(dispV, 6)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.v}</span>
          </div>
        </div>

        {/* Internal Energy */}
        <div className="bg-slate-50/60 border border-slate-300 p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-mono uppercase font-semibold">Energia Interna (u)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-slate-900">{formatNumber(dispU, 2)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.u}</span>
          </div>
        </div>

        {/* Enthalpy */}
        <div className="bg-slate-50/60 border border-slate-300 p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-mono uppercase font-semibold">Entalpia (h)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-black">{formatNumber(dispH, 2)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.h}</span>
          </div>
        </div>

        {/* Entropy */}
        <div className="bg-slate-50/60 border border-slate-300 p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-mono uppercase font-semibold">Entropia (s)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-black">{formatNumber(dispS, 4)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.s}</span>
          </div>
        </div>
      </div>

      {/* Extra properties if Quality or Air or Compressibility or Psychrometrics */}
      {state.x !== null && state.x !== undefined && (
        <div className="bg-slate-50 border border-slate-300 p-2.5 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600 font-medium uppercase">Título / Qualidade de Vapor (x):</span>
          <span className="text-black font-bold text-sm">{formatNumber(state.x, 4)}</span>
        </div>
      )}

      {state.category === 'AIR' && (
        <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-300 p-2.5 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Pr (Pressão Rel.):</span>
            <span className="text-slate-900 font-bold">{formatNumber(state.Pr ?? 0, 3)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">vr (Volume Rel.):</span>
            <span className="text-slate-900 font-bold">{formatNumber(state.vr ?? 0, 2)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">s° (kJ/kg·K):</span>
            <span className="text-slate-900 font-bold">{formatNumber(state.s0 ?? 0, 4)}</span>
          </div>
        </div>
      )}

      {state.category === 'COMPRESSIBILITY' && (
        <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-300 p-2.5 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Fator Z:</span>
            <span className="text-black font-bold text-sm">{formatNumber(state.Z ?? 1, 4)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Pr:</span>
            <span className="text-slate-900 font-bold">{formatNumber(state.Pr_red ?? 1, 3)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Tr:</span>
            <span className="text-slate-900 font-bold">{formatNumber(state.Tr ?? 1, 3)}</span>
          </div>
        </div>
      )}

      {state.category === 'PSYCHROMETRICS' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-300 p-2.5 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Umidade Rel. (UR):</span>
            <span className="text-black font-bold">{formatNumber(state.RH ?? 0, 1)}%</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Bulbo Úmido (Tbu):</span>
            <span className="text-slate-900 font-bold">{formatNumber(state.Twb ?? 0, 1)}°C</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Razão Umid. (w):</span>
            <span className="text-slate-900 font-bold">{formatNumber(state.w ?? 0, 5)} kg/kg</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Ponto Orvalho (Tpo):</span>
            <span className="text-slate-900 font-bold">{formatNumber(state.Tdp ?? 0, 1)}°C</span>
          </div>
        </div>
      )}

      {/* Saturation Table Decomposition */}
      {state.vf !== undefined && state.vg !== undefined && (
        <div className="border border-slate-300 overflow-x-auto text-[11px] font-mono">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 uppercase text-[10px]">
              <tr>
                <th className="py-1.5 px-2.5">Fase</th>
                <th className="py-1.5 px-2.5">v [{units.v}]</th>
                <th className="py-1.5 px-2.5">u [{units.u}]</th>
                <th className="py-1.5 px-2.5">h [{units.h}]</th>
                <th className="py-1.5 px-2.5">s [{units.s}]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
              <tr>
                <td className="py-1.5 px-2.5 font-bold text-blue-800">Líquido Sat. (f)</td>
                <td className="py-1.5 px-2.5">{formatNumber(state.vf, 6)}</td>
                <td className="py-1.5 px-2.5">{formatNumber(state.uf ?? 0, 2)}</td>
                <td className="py-1.5 px-2.5">{formatNumber(state.hf ?? 0, 2)}</td>
                <td className="py-1.5 px-2.5">{formatNumber(state.sf ?? 0, 4)}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2.5 font-bold text-cyan-800">Vapor Sat. (g)</td>
                <td className="py-1.5 px-2.5">{formatNumber(state.vg, 6)}</td>
                <td className="py-1.5 px-2.5">{formatNumber(state.ug ?? 0, 2)}</td>
                <td className="py-1.5 px-2.5">{formatNumber(state.hg ?? 0, 2)}</td>
                <td className="py-1.5 px-2.5">{formatNumber(state.sg ?? 0, 4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Action buttons (Straight Edges) */}
      <div className="flex items-center gap-2 pt-1 font-mono">
        <button
          type="button"
          onClick={() => onAddState(state)}
          className="flex-1 py-2 px-3 bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Salvar no Histórico (Estado)</span>
        </button>

        <button
          type="button"
          onClick={copyToClipboard}
          className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
          title="Copiar dados para a área de transferência"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
    </div>
  );
};
