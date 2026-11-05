import React, { useState } from 'react';
import { ThermodynamicState, UnitSystem, SubstanceCategory } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { Download, Trash2, Copy, Check } from 'lucide-react';
import { GAS_CATALOG } from '../engine/idealGases';

interface StateLogTableProps {
  states: ThermodynamicState[];
  unitSystem: UnitSystem;
  activeCategory: SubstanceCategory;
  onClear: () => void;
  onDeleteState: (id: string) => void;
  onUpdateLabel?: (id: string, label: string) => void;
}

export const StateLogTable: React.FC<StateLogTableProps> = ({
  states,
  unitSystem,
  activeCategory,
  onClear,
  onDeleteState,
}) => {
  const [copied, setCopied] = useState(false);
  const units = UnitConverter.getUnitLabels(unitSystem);

  const formatNumber = (num: number | undefined | null, minDec: number = 2, maxDec: number = 4) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(3);
    return num.toLocaleString('pt-BR', {
      useGrouping: false,
      minimumFractionDigits: minDec,
      maximumFractionDigits: maxDec,
    });
  };

  const formatV = (v: number | undefined | null) => {
    if (v === null || v === undefined || isNaN(v)) return '-';
    return v.toLocaleString('pt-BR', {
      useGrouping: false,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const exportCSV = () => {
    if (states.length === 0) return;
    let header = '';
    let rows = '';

    if (activeCategory === 'AIR') {
      header = `#;Temp (${units.T});Pressão (${units.P});Entropia Mássica (${units.s});Entalpia Mássica (${units.h});Energia Interna (${units.u});Entropia Molar (kJ/kmol/K);Entalpia Molar (kJ/kmol);Energia Molar (kJ/kmol);Pressão Rel. (Pr);Volume Rel. (vr);Pressão Ref. P° (${units.P});Entropia Ref. s° (${units.s});Entropia Ref. Molar (kJ/kmol/K);Massa Molar (kg/kmol);Constante R (${units.s})\n`;
      rows = states.map((s, idx) => {
        const mw = s.molarMass ?? 28.9669;
        const dispT = UnitConverter.fromInternalT(s.T, units.T);
        const dispP = UnitConverter.fromInternalP(s.P_MPa, units.P);
        const dispS = UnitConverter.fromInternalEntropy(s.s, units.s, mw);
        const dispH = UnitConverter.fromInternalEnergy(s.h, units.h, mw);
        const dispU = UnitConverter.fromInternalEnergy(s.u, units.u, mw);
        const sMol = s.s_mole ?? (s.s * mw);
        const hMol = s.h_mole ?? (s.h * mw);
        const uMol = s.u_mole ?? (s.u * mw);
        const s0Mol = s.s0_mole ?? ((s.s0 ?? 0) * mw);
        const rVal = UnitConverter.fromInternalEntropy(s.gasConstant ?? 0.287, units.s, mw);
        const p0Disp = UnitConverter.fromInternalP(s.P0 ?? 0.1, units.P);
        const s0Disp = s.s0 !== undefined ? UnitConverter.fromInternalEntropy(s.s0, units.s, mw) : '';
        return `${idx + 1};${dispT};${dispP};${dispS};${dispH};${dispU};${sMol.toFixed(1)};${hMol.toFixed(0)};${uMol.toFixed(0)};${s.Pr ?? ''};${s.vr ?? ''};${p0Disp};${s0Disp};${s0Mol.toFixed(1)};${mw.toFixed(2)};${rVal.toFixed(4)}`;
      }).join('\n');
    } else if (activeCategory === 'IDEAL_GASES') {
      header = `#;Gás;Temp (${units.T});Pressão (${units.P});Volume Específico (${units.v});Entropia (${units.s});Entalpia (${units.h});Energia Interna (${units.u});Entropia Molar (kJ/kmol/K);Entalpia Molar (kJ/kmol);Energia Molar (kJ/kmol);Massa Molar (kg/kmol);Constante R (kJ/kg/K)\n`;
      rows = states.map((s, idx) => {
        const gas = GAS_CATALOG[s.substanceId] || GAS_CATALOG['co2'];
        const M = gas.M;
        const R = 8.314462618 / M;
        const dispT = UnitConverter.fromInternalT(s.T, units.T);
        const dispP = UnitConverter.fromInternalP(s.P_MPa, units.P);
        const dispV = UnitConverter.fromInternalV(s.v, units.v, M);
        const dispS = UnitConverter.fromInternalEntropy(s.s, units.s, M);
        const dispH = UnitConverter.fromInternalEnergy(s.h, units.h, M);
        const dispU = UnitConverter.fromInternalEnergy(s.u, units.u, M);
        return `${idx + 1};${gas.name};${dispT};${dispP};${dispV};${dispS};${dispH};${dispU};${(s.s * M).toFixed(1)};${(s.h * M).toFixed(0)};${(s.u * M).toFixed(0)};${M};${R.toFixed(4)}`;
      }).join('\n');
    } else if (activeCategory === 'COMPRESSIBILITY') {
      header = `#;Tr;Pr;Fator Acêntrico (ω);Fator Z;Z(0);Z(1);(H*-H)/RTc;(S*-S)/R;ln(f/P);Fase\n`;
      rows = states.map((s, idx) => {
        return `${idx + 1};${s.Tr ?? ''};${s.Pr_red ?? ''};${s.acentricFactor ?? 0};${s.Z ?? ''};${s.Z0 ?? s.Z ?? ''};${s.Z1 ?? 0};${s.h_departure ?? ''};${s.s_departure ?? ''};${s.fugacity_ln ?? ''};${UnitConverter.formatPhasePtBr(s.phase)}`;
      }).join('\n');
    } else if (activeCategory === 'PSYCHROMETRICS') {
      header = `#;Bulbo Seco (${units.T});Bulbo Úmido (${units.T});Ponto Orvalho (${units.T});UR (%);ω (g/kg);Entalpia (kJ/kg);Volume (m³/kg);Pressão (${units.P})\n`;
      rows = states.map((s, idx) => {
        const tdb = UnitConverter.fromInternalT(s.Tdb ?? s.T, units.T);
        const twb = s.Twb !== undefined ? UnitConverter.fromInternalT(s.Twb, units.T) : '';
        const tdp = s.Tdp !== undefined ? UnitConverter.fromInternalT(s.Tdp, units.T) : '';
        const pTot = UnitConverter.fromInternalP(s.P_MPa, units.P);
        return `${idx + 1};${tdb};${twb};${tdp};${s.RH ?? ''};${s.w ? (s.w * 1000).toFixed(2) : ''};${s.h_psychro ?? s.h};${s.v_psychro ?? s.v};${pTot}`;
      }).join('\n');
    } else {
      header = `#;Substância;Temp (${units.T});Pressão (${units.P});Volume Específico (${units.v});Energia Interna (${units.u});Entalpia Específica (${units.h});Entropia Específica (${units.s});Título (x);Fase\n`;
      rows = states.map((s, idx) => {
        const dispT = UnitConverter.fromInternalT(s.T, units.T);
        const dispP = UnitConverter.fromInternalP(s.P_MPa, units.P);
        const dispV = UnitConverter.fromInternalV(s.v, units.v, s.molarMass);
        const dispU = UnitConverter.fromInternalEnergy(s.u, units.u, s.molarMass);
        const dispH = UnitConverter.fromInternalEnergy(s.h, units.h, s.molarMass);
        const dispS = UnitConverter.fromInternalEntropy(s.s, units.s, s.molarMass);
        const dispX = s.x !== null && s.x !== undefined ? s.x : '';
        return `${idx + 1};${s.substanceName};${dispT};${dispP};${dispV};${dispU};${dispH};${dispS};${dispX};${UnitConverter.formatPhasePtBr(s.phase)}`;
      }).join('\n');
    }

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EntroLab_Estados_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyTableMarkdown = () => {
    if (states.length === 0) return;
    let md = `| # | Substância | Temp [${units.T}] | Pressão [${units.P}] | Volume Específico [${units.v}] | Energia Interna [${units.u}] | Entalpia Específica [${units.h}] | Entropia Específica [${units.s}] | Título | Fase |\n`;
    md += `|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n`;
    states.forEach((s, idx) => {
      const mm = s.molarMass ?? 18.015;
      const dispT = formatNumber(UnitConverter.fromInternalT(s.T, units.T), 2, 2);
      const dispP = formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 2, 4);
      const dispV = formatV(UnitConverter.fromInternalV(s.v, units.v, mm));
      const dispU = formatNumber(UnitConverter.fromInternalEnergy(s.u, units.u, mm), 2, 2);
      const dispH = formatNumber(UnitConverter.fromInternalEnergy(s.h, units.h, mm), 2, 2);
      const dispS = formatNumber(UnitConverter.fromInternalEntropy(s.s, units.s, mm), 3, 4);
      const dispX = s.x !== null && s.x !== undefined ? formatNumber(s.x, 4, 4) : '';
      md += `| ${idx + 1} | ${s.substanceName} | ${dispT} | ${dispP} | ${dispV} | ${dispU} | ${dispH} | ${dispS} | ${dispX} | ${UnitConverter.formatPhasePtBr(s.phase)} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-2 border-slate-900 p-3 sm:p-4 shadow-sm space-y-3 font-mono">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-300 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase text-slate-900 tracking-wider">
            Tabela de Histórico (Estados Avaliados)
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 border border-slate-300 font-mono">
            {states.length} estado(s)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={copyTableMarkdown}
            disabled={states.length === 0}
            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-400 text-slate-800 disabled:opacity-40 text-[11px] font-bold flex items-center gap-1 uppercase cursor-pointer"
            title="Copiar tabela"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Copiar</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={states.length === 0}
            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-400 text-slate-800 disabled:opacity-40 text-[11px] font-bold flex items-center gap-1 uppercase cursor-pointer"
            title="Exportar como CSV para Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={onClear}
            disabled={states.length === 0}
            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-400 text-rose-800 disabled:opacity-40 text-[11px] font-bold flex items-center gap-1 uppercase cursor-pointer"
            title="Limpar estados desta substância"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      {states.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs">
          Nenhum estado adicionado ao log desta substância ainda. Calcule propriedades para registrar estados.
        </div>
      ) : (
        <div className="border border-slate-400 overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-xs font-mono border-collapse whitespace-nowrap">
            <thead className="bg-[#e8e8e8] text-slate-900 border-b border-slate-400 text-[11px] font-bold sticky top-0 shadow-xs">
              {activeCategory === 'AIR' ? (
                <>
                  <tr className="border-b border-slate-300 text-slate-900">
                    <th className="py-1 px-2 text-center border-r border-slate-300 w-8">#</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Temp. (T)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Pressão (P)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entropia (s)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entalpia (h)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Energia Int. (u)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entropia Molar</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entalpia Molar</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Energia Molar</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Pr</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">vr</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">P° Ref.</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">s° (Massa)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">s° (Molar)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">M</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">R</th>
                    <th className="py-1 px-1 text-center w-8"></th>
                  </tr>
                  <tr className="bg-[#dfdfdf] text-[10px] text-slate-600 font-normal border-b border-slate-400">
                    <th className="py-0.5 px-2 text-center border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.T}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.P}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.s}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.h}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.u}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kmol/K</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kmol</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kmol</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.P}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.s}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kmol/K</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kg/kmol</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.s}</th>
                    <th className="py-0.5 px-1 text-center"></th>
                  </tr>
                </>
              ) : activeCategory === 'IDEAL_GASES' ? (
                <>
                  <tr className="border-b border-slate-300 text-slate-900">
                    <th className="py-1 px-2 text-center border-r border-slate-300 w-8">#</th>
                    <th className="py-1 px-2 text-left border-r border-slate-300">Gás</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Temp. (T)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Pressão (P)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Volume Esp. (v)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entropia (s)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entalpia (h)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Energia Int. (u)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entropia Molar</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entalpia Molar</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Energia Molar</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">M</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">R</th>
                    <th className="py-1 px-1 text-center w-8"></th>
                  </tr>
                  <tr className="bg-[#dfdfdf] text-[10px] text-slate-600 font-normal border-b border-slate-400">
                    <th className="py-0.5 px-2 text-center border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-left border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.T}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.P}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.v}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.s}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.h}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.u}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kmol/K</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kmol</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kmol</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kg/kmol</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kg/K</th>
                    <th className="py-0.5 px-1 text-center"></th>
                  </tr>
                </>
              ) : activeCategory === 'COMPRESSIBILITY' ? (
                <>
                  <tr className="border-b border-slate-300 text-slate-900">
                    <th className="py-1 px-2 text-center border-r border-slate-300 w-8">#</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Temp. Red. (Tr)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Press. Red. (Pr)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Fator Acêntrico (ω)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300 font-bold">Fator Z</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Z(0) Simples</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Z(1) Desvio</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">v'r</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">(H* - H) / (R·Tc)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">(S* - S) / R</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">ln(f / P)</th>
                    <th className="py-1 px-2 text-left">Fase</th>
                    <th className="py-1 px-1 text-center w-8"></th>
                  </tr>
                  <tr className="bg-[#dfdfdf] text-[10px] text-slate-600 font-normal border-b border-slate-400">
                    <th className="py-0.5 px-2 text-center border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">-</th>
                    <th className="py-0.5 px-2 text-left">-</th>
                    <th className="py-0.5 px-1 text-center"></th>
                  </tr>
                </>
              ) : activeCategory === 'PSYCHROMETRICS' ? (
                <>
                  <tr className="border-b border-slate-300 text-slate-900">
                    <th className="py-1 px-2 text-center border-r border-slate-300 w-8">#</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Bulbo Seco (Tbs)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Bulbo Úmido (Tbu)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Ponto Orvalho (Tpo)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Umidade Rel. (φ)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Razão Umidade (ω)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entalpia (h)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Volume Esp. (v)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Pressão Total (P)</th>
                    <th className="py-1 px-1 text-center w-8"></th>
                  </tr>
                  <tr className="bg-[#dfdfdf] text-[10px] text-slate-600 font-normal border-b border-slate-400">
                    <th className="py-0.5 px-2 text-center border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.T}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.T}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.T}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">%</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">g/kg ar</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kg ar</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">m³/kg ar</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.P}</th>
                    <th className="py-0.5 px-1 text-center"></th>
                  </tr>
                </>
              ) : (
                <>
                  <tr className="border-b border-slate-300 text-slate-900">
                    <th className="py-1 px-2 text-center border-r border-slate-300 w-8">#</th>
                    <th className="py-1 px-2 text-left border-r border-slate-300">Substância</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Temp. (T)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Pressão (P)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Volume Esp. (v)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Energia Int. (u)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entalpia Esp. (h)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Entropia Esp. (s)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Título (x)</th>
                    <th className="py-1 px-2 text-left border-r border-slate-300">Fase</th>
                    <th className="py-1 px-1 text-center w-8"></th>
                  </tr>
                  <tr className="bg-[#dfdfdf] text-[10px] text-slate-600 font-normal border-b border-slate-400">
                    <th className="py-0.5 px-2 text-center border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-left border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.T}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.P}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.v}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.u}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.h}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.s}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">0 ≤ x ≤ 1</th>
                    <th className="py-0.5 px-2 text-left border-r border-slate-300"></th>
                    <th className="py-0.5 px-1 text-center"></th>
                  </tr>
                </>
              )}
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-900">
              {states.map((s, idx) => {
                if (activeCategory === 'AIR') {
                  const mw = s.molarMass ?? 28.9669;
                  const sMol = s.s_mole ?? (s.s * mw);
                  const hMol = s.h_mole ?? (s.h * mw);
                  const uMol = s.u_mole ?? (s.u * mw);
                  const s0Mol = s.s0_mole ?? ((s.s0 ?? 0) * mw);
                  const rVal = UnitConverter.fromInternalEntropy(s.gasConstant ?? 0.287, units.s, mw);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalT(s.T, units.T), 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 2, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEntropy(s.s, units.s, mw), 3, 3)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.h, units.h, mw), 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.u, units.u, mw), 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(sMol, 0, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(hMol, 0, 0)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(uMol, 0, 0)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.Pr, 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.vr, 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalP(s.P0 ?? 0.1, units.P), 1, 3)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{s.s0 !== undefined ? formatNumber(UnitConverter.fromInternalEntropy(s.s0, units.s, mw), 3, 3) : '-'}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s0Mol, 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(mw, 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(rVal, 3, 4)}</td>
                      <td className="py-1 px-1 text-center">
                        <button onClick={() => onDeleteState(s.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer" title="Remover">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                if (activeCategory === 'IDEAL_GASES') {
                  const gas = GAS_CATALOG[s.substanceId] || GAS_CATALOG['co2'];
                  const M = gas.M;
                  const R = 8.314462618 / M;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                      <td className="py-1 px-2 text-left border-r border-slate-200 font-bold">{gas.name}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalT(s.T, units.T), 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 2, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatV(UnitConverter.fromInternalV(s.v, units.v, M))}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEntropy(s.s, units.s, M), 3, 3)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.h, units.h, M), 1, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.u, units.u, M), 1, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.s * M, 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.h * M, 0, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.u * M, 0, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(M, 2, 3)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(R, 4, 4)}</td>
                      <td className="py-1 px-1 text-center">
                        <button onClick={() => onDeleteState(s.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer" title="Remover">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                if (activeCategory === 'COMPRESSIBILITY') {
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(s.Tr, 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(s.Pr_red, 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.acentricFactor ?? 0, 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold text-black">{formatNumber(s.Z, 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.Z0 ?? s.Z, 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.Z1 ?? 0, 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.v, 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.h_departure ?? (s.Tr && s.Z ? Math.max(0, (1 - s.Z) * 2.5) : 0), 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.s_departure ?? (s.Tr && s.Z ? Math.max(0, -Math.log(Math.max(0.01, s.Z)) * 1.5) : 0), 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.fugacity_ln ?? (s.Z ? s.Z - 1 - Math.log(Math.max(0.01, s.Z)) : 0), 4, 4)}</td>
                      <td className="py-1 px-2 text-left border-r border-slate-200 text-[11px] truncate">{UnitConverter.formatPhasePtBr(s.phase)}</td>
                      <td className="py-1 px-1 text-center">
                        <button onClick={() => onDeleteState(s.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer" title="Remover">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                if (activeCategory === 'PSYCHROMETRICS') {
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalT(s.Tdb ?? s.T, units.T), 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{s.Twb !== undefined ? formatNumber(UnitConverter.fromInternalT(s.Twb, units.T), 2, 2) : '-'}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{s.Tdp !== undefined ? formatNumber(UnitConverter.fromInternalT(s.Tdp, units.T), 2, 2) : '-'}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(s.RH, 1, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{s.w ? formatNumber(s.w * 1000, 2, 2) : '-'}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.h_psychro ?? s.h, 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatV(s.v_psychro ?? s.v)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 2, 4)}</td>
                      <td className="py-1 px-1 text-center">
                        <button onClick={() => onDeleteState(s.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer" title="Remover">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-1 px-2 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                    <td className="py-1 px-2 text-left border-r border-slate-200 font-bold truncate max-w-[150px]">{s.substanceName}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalT(s.T, units.T), 2, 2)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 2, 4)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatV(UnitConverter.fromInternalV(s.v, units.v, s.molarMass))}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.u, units.u, s.molarMass), 2, 2)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.h, units.h, s.molarMass), 2, 2)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEntropy(s.s, units.s, s.molarMass), 3, 4)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{s.x !== null && s.x !== undefined ? formatNumber(s.x, 4, 4) : '-'}</td>
                    <td className="py-1 px-2 text-left border-r border-slate-200 text-[11px] truncate">{UnitConverter.formatPhasePtBr(s.phase)}</td>
                    <td className="py-1 px-1 text-center">
                      <button onClick={() => onDeleteState(s.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer" title="Remover">
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
    </div>
  );
};
