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

  const units = UnitConverter.getUnitLabels(unitSystem, 'bar');

  const formatNumber = (num: number, decimals: number = 4) => {
    if (isNaN(num) || num === null || num === undefined) return '-';
    if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(3);
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: decimals });
  };

  const exportCSV = () => {
    if (states.length === 0) return;
    const header = `Estado;Rotulo;Substancia;Fase;T (${units.T});P (${units.P});v (${units.v});u (${units.u});h (${units.h});s (${units.s});x\n`;
    const rows = states.map((s, idx) => {
      const dispT = UnitConverter.fromInternalT(s.T, units.T);
      const dispP = UnitConverter.fromInternalP(s.P_MPa, units.P);
      const dispV = UnitConverter.fromInternalV(s.v, units.v);
      const dispU = UnitConverter.fromInternalEnergy(s.u, units.u);
      const dispH = UnitConverter.fromInternalEnergy(s.h, units.h);
      const dispS = UnitConverter.fromInternalEntropy(s.s, units.s);
      return `${idx + 1};${s.label || ''};${s.substanceName};${s.phase};${dispT};${dispP};${dispV};${dispU};${dispH};${dispS};${s.x ?? ''}`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CATT3_Estados_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyTableMarkdown = () => {
    if (states.length === 0) return;
    let md = `| Estado | Substância | Fase | T [${units.T}] | P [${units.P}] | h [${units.h}] | s [${units.s}] | v [${units.v}] | x |\n`;
    md += `|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|\n`;
    states.forEach((s, idx) => {
      const dispT = formatNumber(UnitConverter.fromInternalT(s.T, units.T), 2);
      const dispP = formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 4);
      const dispH = formatNumber(UnitConverter.fromInternalEnergy(s.h, units.h), 2);
      const dispS = formatNumber(UnitConverter.fromInternalEntropy(s.s, units.s), 4);
      const dispV = formatNumber(UnitConverter.fromInternalV(s.v, units.v), 6);
      const dispX = s.x !== null && s.x !== undefined ? formatNumber(s.x, 4) : '-';
      md += `| ${idx + 1} | ${s.substanceName} | ${s.phase} | ${dispT} | ${dispP} | ${dispH} | ${dispS} | ${dispV} | ${dispX} |\n`;
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-lg backdrop-blur-sm space-y-4">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">Histórico de Estados / Ciclos</h3>
          <p className="text-[11px] text-slate-500 font-mono">Tabela tipo planilha para acompanhar exercícios e processos</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={copyTableMarkdown}
            disabled={states.length === 0}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 text-xs font-medium flex items-center gap-1 transition-colors"
            title="Copiar tabela formatada"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Copiar Tabela</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={states.length === 0}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 text-xs font-medium flex items-center gap-1 transition-colors"
            title="Exportar como CSV para Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={onClear}
            disabled={states.length === 0}
            className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 disabled:opacity-40 text-xs font-medium flex items-center gap-1 transition-colors"
            title="Limpar todos os estados"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      {states.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs font-mono">
          Nenhum estado adicionado ainda. Calcule propriedades e clique em &quot;Salvar no Histórico&quot;.
        </div>
      ) : (
        <div className="border border-slate-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2 px-2.5 text-center">#</th>
                <th className="py-2 px-2.5">Descrição</th>
                <th className="py-2 px-2.5">Substância</th>
                <th className="py-2 px-2.5">Fase</th>
                <th className="py-2 px-2.5 text-right">T [{units.T}]</th>
                <th className="py-2 px-2.5 text-right">P [{units.P}]</th>
                <th className="py-2 px-2.5 text-right">h [{units.h}]</th>
                <th className="py-2 px-2.5 text-right">s [{units.s}]</th>
                <th className="py-2 px-2.5 text-right">v [{units.v}]</th>
                <th className="py-2 px-2.5 text-right">u [{units.u}]</th>
                <th className="py-2 px-2.5 text-right">x</th>
                <th className="py-2 px-2.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 bg-slate-950/40 text-slate-200">
              {states.map((s, idx) => {
                const dispT = UnitConverter.fromInternalT(s.T, units.T);
                const dispP = UnitConverter.fromInternalP(s.P_MPa, units.P);
                const dispH = UnitConverter.fromInternalEnergy(s.h, units.h);
                const dispS = UnitConverter.fromInternalEntropy(s.s, units.s);
                const dispV = UnitConverter.fromInternalV(s.v, units.v);
                const dispU = UnitConverter.fromInternalEnergy(s.u, units.u);

                return (
                  <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2 px-2.5 text-center font-bold text-sky-400">{idx + 1}</td>
                    <td className="py-2 px-2.5">
                      <input
                        type="text"
                        defaultValue={s.label || `Estado ${idx + 1}`}
                        onBlur={(e) => onUpdateLabel(s.id, e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-sky-500 text-slate-200 text-xs px-1 py-0.5 outline-none font-sans"
                      />
                    </td>
                    <td className="py-2 px-2.5 text-slate-300">{s.substanceName}</td>
                    <td className="py-2 px-2.5 text-[11px] text-slate-400">{s.phase}</td>
                    <td className="py-2 px-2.5 text-right">{formatNumber(dispT, 2)}</td>
                    <td className="py-2 px-2.5 text-right">{formatNumber(dispP, 4)}</td>
                    <td className="py-2 px-2.5 text-right text-sky-300 font-semibold">{formatNumber(dispH, 2)}</td>
                    <td className="py-2 px-2.5 text-right text-sky-300">{formatNumber(dispS, 4)}</td>
                    <td className="py-2 px-2.5 text-right">{formatNumber(dispV, 5)}</td>
                    <td className="py-2 px-2.5 text-right">{formatNumber(dispU, 2)}</td>
                    <td className="py-2 px-2.5 text-right font-medium text-amber-400">
                      {s.x !== null && s.x !== undefined ? formatNumber(s.x, 3) : '-'}
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      <button
                        onClick={() => onDeleteState(s.id)}
                        className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
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
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Calculator className="w-3.5 h-3.5 text-sky-400" />
            <span>Análise Rápida de Processo / Ciclo (Estado A → Estado B)</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Estado A (Inicial):</span>
              <select
                value={stateAIdx}
                onChange={(e) => setStateAIdx(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              >
                {states.map((s, idx) => (
                  <option key={s.id} value={idx}>#{idx + 1} ({s.label || `Estado ${idx + 1}`})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Estado B (Final):</span>
              <select
                value={stateBIdx}
                onChange={(e) => setStateBIdx(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              >
                {states.map((s, idx) => (
                  <option key={s.id} value={idx}>#{idx + 1} ({s.label || `Estado ${idx + 1}`})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Δh (Trabalho/Calor específico):</span>
              <span className="text-sky-300 font-bold text-sm">
                {formatNumber(deltaH, 2)} {units.h}
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Δs (Variação de Entropia):</span>
              <span className={`font-bold text-sm ${Math.abs(deltaS) < 0.001 ? 'text-emerald-400' : 'text-slate-200'}`}>
                {formatNumber(deltaS, 4)} {units.s}
              </span>
              {Math.abs(deltaS) < 0.001 && <span className="text-[10px] text-emerald-400 block">Isentrópico (s = cte)</span>}
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ΔT (Variação de Temp.):</span>
              <span className="text-slate-200 font-bold text-sm">
                {formatNumber(deltaT, 2)} {units.T}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
