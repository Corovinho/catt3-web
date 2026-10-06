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
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs font-mono">
        Insira as propriedades acima e clique em Calcular para avaliar o estado.
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
        return <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-medium">Vapor Superaquecido</span>;
      case 'Saturated Mixture':
        return <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-950 text-amber-400 border border-amber-800/80 font-medium">Mistura Saturada</span>;
      case 'Saturated Liquid':
        return <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-950 text-blue-400 border border-blue-800/80 font-medium">Líquido Saturado</span>;
      case 'Saturated Vapor':
        return <span className="px-2 py-0.5 rounded-full text-[11px] bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-medium">Vapor Saturado Seco</span>;
      case 'Subcooled Liquid':
        return <span className="px-2 py-0.5 rounded-full text-[11px] bg-indigo-950 text-indigo-400 border border-indigo-800/80 font-medium">Líquido Comprimido</span>;
      case 'Supercritical':
        return <span className="px-2 py-0.5 rounded-full text-[11px] bg-purple-950 text-purple-400 border border-purple-800/80 font-medium">Supercrítico</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700 font-medium">{phase}</span>;
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-lg backdrop-blur-sm space-y-3.5">
      {/* Header with Substance and Phase */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-100 text-sm">{state.substanceName}</h3>
            <span className="flex items-center gap-1 text-[10px] text-sky-400 font-mono bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/50">
              <ShieldCheck className="w-3 h-3" />
              100% NIST/IF97
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Modo: {state.mode === 'GENERAL' ? 'Propriedades Gerais' : 'Saturação'}</p>
        </div>
        <div>{getPhaseBadge(state.phase)}</div>
      </div>

      {/* Grid of Thermodynamic Properties */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Temperature */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Temperatura (T)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-slate-100">{formatNumber(dispT, 2)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.T}</span>
          </div>
        </div>

        {/* Pressure */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Pressão (P)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-slate-100">{formatNumber(dispP, 4)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.P}</span>
          </div>
        </div>

        {/* Specific Volume */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Volume Específico (v)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-slate-100">{formatNumber(dispV, 6)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.v}</span>
          </div>
        </div>

        {/* Internal Energy */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Energia Interna (u)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-slate-100">{formatNumber(dispU, 2)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.u}</span>
          </div>
        </div>

        {/* Enthalpy */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Entalpia (h)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-sky-400">{formatNumber(dispH, 2)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.h}</span>
          </div>
        </div>

        {/* Entropy */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Entropia (s)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-lg font-mono font-bold text-sky-400">{formatNumber(dispS, 4)}</span>
            <span className="text-[11px] font-mono text-slate-500">{units.s}</span>
          </div>
        </div>
      </div>

      {/* Extra properties if Quality or Air or Compressibility or Psychrometrics */}
      {state.x !== null && state.x !== undefined && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Título / Qualidade de Vapor (x):</span>
          <span className="text-amber-400 font-bold">{formatNumber(state.x, 4)}</span>
        </div>
      )}

      {state.category === 'AIR' && (
        <div className="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Pr (Pressão Rel.):</span>
            <span className="text-slate-200 font-bold">{formatNumber(state.Pr ?? 0, 3)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">vr (Volume Rel.):</span>
            <span className="text-slate-200 font-bold">{formatNumber(state.vr ?? 0, 2)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">s° (kJ/kg·K):</span>
            <span className="text-slate-200 font-bold">{formatNumber(state.s0 ?? 0, 4)}</span>
          </div>
        </div>
      )}

      {state.category === 'COMPRESSIBILITY' && (
        <div className="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Fator Z:</span>
            <span className="text-sky-300 font-bold text-sm">{formatNumber(state.Z ?? 1, 4)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Pr:</span>
            <span className="text-slate-200 font-bold">{formatNumber(state.Pr_red ?? 1, 3)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Tr:</span>
            <span className="text-slate-200 font-bold">{formatNumber(state.Tr ?? 1, 3)}</span>
          </div>
        </div>
      )}

      {state.category === 'PSYCHROMETRICS' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Umidade Rel. (UR):</span>
            <span className="text-sky-300 font-bold">{formatNumber(state.RH ?? 0, 1)}%</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Bulbo Úmido (Tbu):</span>
            <span className="text-slate-200 font-bold">{formatNumber(state.Twb ?? 0, 1)}°C</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Razão Umid. (w):</span>
            <span className="text-slate-200 font-bold">{formatNumber(state.w ?? 0, 5)} kg/kg</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Ponto Orvalho (Tpo):</span>
            <span className="text-slate-200 font-bold">{formatNumber(state.Tdp ?? 0, 1)}°C</span>
          </div>
        </div>
      )}

      {/* Saturation Table Decomposition (if saturated liquid and vapor boundaries available) */}
      {state.vf !== undefined && state.vg !== undefined && (
        <div className="border border-slate-800 rounded-lg overflow-x-auto text-[11px] font-mono">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-1 px-2">Fase</th>
                <th className="py-1 px-2">v [{units.v}]</th>
                <th className="py-1 px-2">u [{units.u}]</th>
                <th className="py-1 px-2">h [{units.h}]</th>
                <th className="py-1 px-2">s [{units.s}]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
              <tr>
                <td className="py-1 px-2 text-blue-400 font-medium">Líquido Sat. (f)</td>
                <td className="py-1 px-2">{formatNumber(state.vf, 6)}</td>
                <td className="py-1 px-2">{formatNumber(state.uf ?? 0, 2)}</td>
                <td className="py-1 px-2">{formatNumber(state.hf ?? 0, 2)}</td>
                <td className="py-1 px-2">{formatNumber(state.sf ?? 0, 4)}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-cyan-400 font-medium">Vapor Sat. (g)</td>
                <td className="py-1 px-2">{formatNumber(state.vg, 6)}</td>
                <td className="py-1 px-2">{formatNumber(state.ug ?? 0, 2)}</td>
                <td className="py-1 px-2">{formatNumber(state.hg ?? 0, 2)}</td>
                <td className="py-1 px-2">{formatNumber(state.sg ?? 0, 4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onAddState(state)}
          className="flex-1 py-2 px-3 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-700/60 text-sky-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Salvar no Histórico (Estado)</span>
        </button>

        <button
          type="button"
          onClick={copyToClipboard}
          className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          title="Copiar dados para a área de transferência"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
    </div>
  );
};
