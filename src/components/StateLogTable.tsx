import React, { useState } from 'react';
import { ThermodynamicState, UnitSystem } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { Download, Trash2, Copy, Check, Calculator } from 'lucide-react';

interface StateLogTableProps {
  states: ThermodynamicState[];
  unitSystem: UnitSystem;
  onClear: () => void;
  onDeleteState: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
}

export const StateLogTable: React.FC<StateLogTableProps> = ({
  states,
  unitSystem,
  onClear,
  onDeleteState,
  onUpdateLabel,
}) => {
  const [copied, setCopied] = useState(false);
  const [stateAIdx, setStateAIdx] = useState<number>(0);
  const [stateBIdx, setStateBIdx] = useState<number>(states.length > 1 ? 1 : 0);

  const units = UnitConverter.getUnitLabels(unitSystem);

  const formatNumber = (num: number, decimals: number = 4) => {
    if (isNaN(num) || num === null || num === undefined) return '-';
    if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(3);
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: decimals });
  };

  const exportCSV = () => {
    if (states.length === 0) return;
    const header = `#;Temp (${units.T});Pressure (${units.P});Specific Volume (${units.v});Internal Energy (${units.u});Specific Enthalpy (${units.h});Specific Entropy (${units.s});Quality;Phase\n`;
    const rows = states.map((s, idx) => {
      const dispT = UnitConverter.fromInternalT(s.T, units.T);
      const dispP = UnitConverter.fromInternalP(s.P_MPa, units.P);
      const dispV = UnitConverter.fromInternalV(s.v, units.v);
      const dispU = UnitConverter.fromInternalEnergy(s.u, units.u);
      const dispH = UnitConverter.fromInternalEnergy(s.h, units.h);
      const dispS = UnitConverter.fromInternalEntropy(s.s, units.s);
      const dispX = s.x !== null && s.x !== undefined ? s.x : '';
      return `${idx + 1};${dispT};${dispP};${dispV};${dispU};${dispH};${dispS};${dispX};${s.phase}`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CATT3_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyTableMarkdown = () => {
    if (states.length === 0) return;
    let md = `| # | Temp [${units.T}] | Pressure [${units.P}] | Specific Volume [${units.v}] | Internal Energy [${units.u}] | Specific Enthalpy [${units.h}] | Specific Entropy [${units.s}] | Quality | Phase |\n`;
    md += `|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n`;
    states.forEach((s, idx) => {
      const dispT = formatNumber(UnitConverter.fromInternalT(s.T, units.T), 2);
      const dispP = formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 4);
      const dispV = formatNumber(UnitConverter.fromInternalV(s.v, units.v), 6);
      const dispU = formatNumber(UnitConverter.fromInternalEnergy(s.u, units.u), 2);
      const dispH = formatNumber(UnitConverter.fromInternalEnergy(s.h, units.h), 2);
      const dispS = formatNumber(UnitConverter.fromInternalEntropy(s.s, units.s), 4);
      const dispX = s.x !== null && s.x !== undefined ? formatNumber(s.x, 4) : '-';
      md += `| ${idx + 1} | ${dispT} | ${dispP} | ${dispV} | ${dispU} | ${dispH} | ${dispS} | ${dispX} | ${s.phase} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Delta calculations between two selected states
  const stateA = states[stateAIdx] || states[0];
  const stateB = states[stateBIdx] || states[1];
  const deltaH = stateA && stateB ? stateB.h - stateA.h : 0;
  const deltaS = stateA && stateB ? stateB.s - stateA.s : 0;
  const deltaT = stateA && stateB ? stateB.T - stateA.T : 0;

  return (
    <div className="bg-white border-2 border-slate-900 p-3 sm:p-4 shadow-sm space-y-3 font-mono">
      {/* Top Toolbar matching CATT3 */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-300 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase text-slate-900 tracking-wider">
            Log Table (All Evaluated States)
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 border border-slate-300 font-mono">
            {states.length} estado(s)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={copyTableMarkdown}
            disabled={states.length === 0}
            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-400 text-slate-800 disabled:opacity-40 text-[11px] font-bold flex items-center gap-1 uppercase"
            title="Copiar tabela"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Copiar</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={states.length === 0}
            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-400 text-slate-800 disabled:opacity-40 text-[11px] font-bold flex items-center gap-1 uppercase"
            title="Exportar como CSV para Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={onClear}
            disabled={states.length === 0}
            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-400 text-rose-800 disabled:opacity-40 text-[11px] font-bold flex items-center gap-1 uppercase"
            title="Limpar todos os estados"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </div>

      {/* Main Table with the EXACT 9 CATT3 columns from Image 3 */}
      {states.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs">
          Nenhum estado adicionado ao log ainda. Calcule propriedades e adicione ao log.
        </div>
      ) : (
        <div className="border border-slate-400 overflow-x-auto max-h-[280px]">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#e8e8e8] text-slate-900 border-b border-slate-400 text-[11px] font-bold sticky top-0">
              <tr>
                <th className="py-1.5 px-2 text-center border-r border-slate-300 w-10">#</th>
                <th className="py-1.5 px-2 text-right border-r border-slate-300">Temp</th>
                <th className="py-1.5 px-2 text-right border-r border-slate-300">Pressure</th>
                <th className="py-1.5 px-2 text-right border-r border-slate-300">Specific Volume</th>
                <th className="py-1.5 px-2 text-right border-r border-slate-300">Internal Energy</th>
                <th className="py-1.5 px-2 text-right border-r border-slate-300">Specific Enthalpy</th>
                <th className="py-1.5 px-2 text-right border-r border-slate-300">Specific Entropy</th>
                <th className="py-1.5 px-2 text-right border-r border-slate-300">Quality</th>
                <th className="py-1.5 px-2 text-left">Phase</th>
                <th className="py-1.5 px-1 text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-900">
              {states.map((s, idx) => {
                const dispT = UnitConverter.fromInternalT(s.T, units.T);
                const dispP = UnitConverter.fromInternalP(s.P_MPa, units.P);
                const dispV = UnitConverter.fromInternalV(s.v, units.v);
                const dispU = UnitConverter.fromInternalEnergy(s.u, units.u);
                const dispH = UnitConverter.fromInternalEnergy(s.h, units.h);
                const dispS = UnitConverter.fromInternalEntropy(s.s, units.s);

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-1 px-2 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(dispT, 2)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200 font-semibold">{formatNumber(dispP, 4)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(dispV, 6)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(dispU, 2)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(dispH, 2)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(dispS, 4)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200 text-slate-800">
                      {s.x !== null && s.x !== undefined ? formatNumber(s.x, 4) : '-'}
                    </td>
                    <td className="py-1 px-2 text-left text-[11px] truncate">{s.phase}</td>
                    <td className="py-1 px-1 text-center">
                      <button
                        onClick={() => onDeleteState(s.id)}
                        className="text-slate-400 hover:text-rose-600"
                        title="Remover estado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cycle / Delta Calculator Widget */}
      {states.length >= 2 && (
        <div className="bg-slate-50 border border-slate-300 p-2.5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 uppercase text-[11px]">
            <Calculator className="w-3.5 h-3.5 text-black" />
            <span>Análise de Processo (Estado A → Estado B)</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Estado A:</span>
              <select
                value={stateAIdx}
                onChange={(e) => setStateAIdx(Number(e.target.value))}
                className="bg-white border border-slate-300 px-2 py-0.5 text-slate-900"
              >
                {states.map((s, idx) => (
                  <option key={s.id} value={idx}>#{idx + 1}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Estado B:</span>
              <select
                value={stateBIdx}
                onChange={(e) => setStateBIdx(Number(e.target.value))}
                className="bg-white border border-slate-300 px-2 py-0.5 text-slate-900"
              >
                {states.map((s, idx) => (
                  <option key={s.id} value={idx}>#{idx + 1}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pl-2">
              <span>Δh = <strong className="text-black">{formatNumber(deltaH, 2)} {units.h}</strong></span>
              <span>Δs = <strong className="text-black">{formatNumber(deltaS, 4)} {units.s}</strong></span>
              <span>ΔT = <strong className="text-black">{formatNumber(deltaT, 2)} {units.T}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
