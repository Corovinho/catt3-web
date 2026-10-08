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
      header = `#;Temp (${units.T});Pressure (${units.P});Specific Entropy (Mass) (${units.s});Specific Enthalpy (Mass) (${units.h});Internal Energy (Mass) (${units.u});Specific Entropy (Mole) (kJ/kmol/K);Specific Enthalpy (Mole) (kJ/kmol);Internal Energy (Mole) (kJ/kmol);Reduced Pressure (Pr);Reduced Volume (Vr);Reference Pressure (${units.P});Reference Entropy (Mass) (${units.s});Reference Entropy (Mole) (kJ/kmol/K);Molecular Weight;Gas Constant (${units.s})\n`;
      rows = states.map((s, idx) => {
        const dispT = UnitConverter.fromInternalT(s.T, units.T);
        const dispP = UnitConverter.fromInternalP(s.P_MPa, units.P);
        const dispS = UnitConverter.fromInternalEntropy(s.s, units.s);
        const dispH = UnitConverter.fromInternalEnergy(s.h, units.h);
        const dispU = UnitConverter.fromInternalEnergy(s.u, units.u);
        const mw = s.molarMass ?? 28.97;
        const sMol = s.s_mole ?? (s.s * mw);
        const hMol = s.h_mole ?? (s.h * mw);
        const uMol = s.u_mole ?? (s.u * mw);
        const s0Mol = s.s0_mole ?? ((s.s0 ?? 0) * mw);
        const rVal = s.gasConstant ?? 0.287;
        return `${idx + 1};${dispT};${dispP};${dispS};${dispH};${dispU};${sMol.toFixed(1)};${hMol.toFixed(0)};${uMol.toFixed(0)};${s.Pr ?? ''};${s.vr ?? ''};${s.P0 ?? 0.1};${s.s0 ?? ''};${s0Mol.toFixed(1)};${mw.toFixed(2)};${rVal.toFixed(3)}`;
      }).join('\n');
    } else if (activeCategory === 'IDEAL_GASES') {
      header = `#;Gás;Temp (${units.T});Pressure (${units.P});Specific Volume (${units.v});Specific Entropy (Mass) (${units.s});Specific Enthalpy (Mass) (${units.h});Internal Energy (Mass) (${units.u});Specific Entropy (Mole) (kJ/kmol/K);Specific Enthalpy (Mole) (kJ/kmol);Internal Energy (Mole) (kJ/kmol);Molecular Weight;Gas Constant (kJ/kg/K)\n`;
      rows = states.map((s, idx) => {
        const gas = GAS_CATALOG[s.substanceId] || GAS_CATALOG['co2'];
        const M = gas.M;
        const R = 8.31446 / M;
        const dispT = UnitConverter.fromInternalT(s.T, units.T);
        const dispP = UnitConverter.fromInternalP(s.P_MPa, units.P);
        const dispV = UnitConverter.fromInternalV(s.v, units.v);
        const dispS = UnitConverter.fromInternalEntropy(s.s, units.s);
        const dispH = UnitConverter.fromInternalEnergy(s.h, units.h);
        const dispU = UnitConverter.fromInternalEnergy(s.u, units.u);
        return `${idx + 1};${gas.name};${dispT};${dispP};${dispV};${dispS};${dispH};${dispU};${(s.s * M).toFixed(1)};${(s.h * M).toFixed(0)};${(s.u * M).toFixed(0)};${M};${R.toFixed(4)}`;
      }).join('\n');
    } else if (activeCategory === 'COMPRESSIBILITY') {
      header = `#;Tr;Pr;Fator Acentrico (w);Fator Z;Z(0);Z(1);(H*-H)/RTc;(S*-S)/R;ln(f/P);Fase\n`;
      rows = states.map((s, idx) => {
        return `${idx + 1};${s.Tr ?? ''};${s.Pr_red ?? ''};${s.acentricFactor ?? 0};${s.Z ?? ''};${s.Z0 ?? s.Z ?? ''};${s.Z1 ?? 0};${s.h_departure ?? ''};${s.s_departure ?? ''};${s.fugacity_ln ?? ''};${UnitConverter.formatPhasePtBr(s.phase)}`;
      }).join('\n');
    } else if (activeCategory === 'PSYCHROMETRICS') {
      header = `#;Bulbo Seco (C);Bulbo Umido (C);Ponto Orvalho (C);UR (%);w (g/kg);Entalpia (kJ/kg);Volume (m3/kg);Pressao (kPa)\n`;
      rows = states.map((s, idx) => {
        return `${idx + 1};${s.Tdb ?? s.T};${s.Twb ?? ''};${s.Tdp ?? ''};${s.RH ?? ''};${s.w ? (s.w * 1000).toFixed(2) : ''};${s.h_psychro ?? s.h};${s.v_psychro ?? s.v};${(s.P_MPa * 1000).toFixed(2)}`;
      }).join('\n');
    } else {
      header = `#;Substância;Temp (${units.T});Pressure (${units.P});Specific Volume (${units.v});Internal Energy (${units.u});Specific Enthalpy (${units.h});Specific Entropy (${units.s});Quality;Phase\n`;
      rows = states.map((s, idx) => {
        const dispT = UnitConverter.fromInternalT(s.T, units.T);
        const dispP = UnitConverter.fromInternalP(s.P_MPa, units.P);
        const dispV = UnitConverter.fromInternalV(s.v, units.v);
        const dispU = UnitConverter.fromInternalEnergy(s.u, units.u);
        const dispH = UnitConverter.fromInternalEnergy(s.h, units.h);
        const dispS = UnitConverter.fromInternalEntropy(s.s, units.s);
        const dispX = s.x !== null && s.x !== undefined ? s.x : '';
        return `${idx + 1};${s.substanceName};${dispT};${dispP};${dispV};${dispU};${dispH};${dispS};${dispX};${UnitConverter.formatPhasePtBr(s.phase)}`;
      }).join('\n');
    }

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
    let md = `| # | Substância | Temp [${units.T}] | Pressão [${units.P}] | Volume Específico [${units.v}] | Energia Interna [${units.u}] | Entalpia Específica [${units.h}] | Entropia Específica [${units.s}] | Título | Fase |\n`;
    md += `|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n`;
    states.forEach((s, idx) => {
      const dispT = formatNumber(UnitConverter.fromInternalT(s.T, units.T), 2, 2);
      const dispP = formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 2, 4);
      const dispV = formatV(UnitConverter.fromInternalV(s.v, units.v));
      const dispU = formatNumber(UnitConverter.fromInternalEnergy(s.u, units.u), 2, 2);
      const dispH = formatNumber(UnitConverter.fromInternalEnergy(s.h, units.h), 2, 2);
      const dispS = formatNumber(UnitConverter.fromInternalEntropy(s.s, units.s), 3, 4);
      const dispX = s.x !== null && s.x !== undefined ? formatNumber(s.x, 4, 4) : '';
      md += `| ${idx + 1} | ${s.substanceName} | ${dispT} | ${dispP} | ${dispV} | ${dispU} | ${dispH} | ${dispS} | ${dispX} | ${UnitConverter.formatPhasePtBr(s.phase)} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-2 border-slate-900 p-3 sm:p-4 shadow-sm space-y-3 font-mono">
      {/* Top Toolbar matching CATT3 */}
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

      {/* Main Table */}
      {states.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs">
          Nenhum estado adicionado ao log ainda. Calcule propriedades e adicione ao log.
        </div>
      ) : (
        <div className="border border-slate-400 overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-xs font-mono border-collapse whitespace-nowrap">
            <thead className="bg-[#e8e8e8] text-slate-900 border-b border-slate-400 text-[11px] font-bold sticky top-0 shadow-xs">
              {/* ==================== 1. AIR SPREADSHEET (EXACT PHOTO 1 MATCH) ==================== */}
              {activeCategory === 'AIR' ? (
                <>
                  <tr className="border-b border-slate-300 text-slate-900">
                    <th className="py-1 px-2 text-center border-r border-slate-300 w-8">#</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Temp</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Pressure</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Entropy (Mass)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Enthalpy (Mass)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Internal Energy</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Entropy (Mole)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Enthalpy (Mole)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Internal Energy (Mole)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Reduced Pressure</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Reduced Volume</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Reference Pressure</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Reference Entropy (Mass)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Reference Entropy (Mole)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Molecular Weight</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Gas Constant</th>
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
                    <th className="py-0.5 px-2 text-right border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.P}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.s}</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kmol/K</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">{units.s}</th>
                    <th className="py-0.5 px-1 text-center"></th>
                  </tr>
                </>
              ) : activeCategory === 'IDEAL_GASES' ? (
                <>
                  <tr className="border-b border-slate-300 text-slate-900">
                    <th className="py-1 px-2 text-center border-r border-slate-300 w-8">#</th>
                    <th className="py-1 px-2 text-left border-r border-slate-300">Gás</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Temp</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Pressure</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Volume</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Entropy (Mass)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Enthalpy (Mass)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Internal Energy (Mass)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Entropy (Mole)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Enthalpy (Mole)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Internal Energy (Mole)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Molecular Weight</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Gas Constant</th>
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
                    <th className="py-1 px-2 text-right border-r border-slate-300">Reduced Temp. (Tr)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Reduced Press. (Pr)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Acentric Factor (ω)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300 font-bold">Fator Z</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Z(0) Simples</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Z(1) Desvio</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">v'r</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">(H* - H) / R / Tc</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">(S* - S) / R</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">ln(f / P)</th>
                    <th className="py-1 px-2 text-left">Phase</th>
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
                    <th className="py-1 px-2 text-right border-r border-slate-300">Temp. (T)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Wet Bulb Temp (Twet)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Dew Point Temp (Tdew)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Relative Humidity (phi)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Absolute Humidity (w)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Enthalpy (h)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Volume (v)</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Total Pressure (P)</th>
                    <th className="py-1 px-1 text-center w-8"></th>
                  </tr>
                  <tr className="bg-[#dfdfdf] text-[10px] text-slate-600 font-normal border-b border-slate-400">
                    <th className="py-0.5 px-2 text-center border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">°C</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">°C</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">°C</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">%</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">g/kg ar</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kJ/kg</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">m³/kg</th>
                    <th className="py-0.5 px-2 text-right border-r border-slate-300">kPa</th>
                    <th className="py-0.5 px-1 text-center"></th>
                  </tr>
                </>
              ) : (
                /* ==================== 5. FLUID SPREADSHEET (WATER, REFRIGERANTS, CRYOGENICS - EXACT PHOTO 3 MATCH) ==================== */
                <>
                  <tr className="border-b border-slate-300 text-slate-900">
                    <th className="py-1 px-2 text-center border-r border-slate-300 w-8">#</th>
                    <th className="py-1 px-2 text-left border-r border-slate-300">Substância</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Temp</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Pressure</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Volume</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Internal Energy</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Enthalpy</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Specific Entropy</th>
                    <th className="py-1 px-2 text-right border-r border-slate-300">Quality</th>
                    <th className="py-1 px-2 text-left border-r border-slate-300">Phase</th>
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
                    <th className="py-0.5 px-2 text-right border-r border-slate-300"></th>
                    <th className="py-0.5 px-2 text-left border-r border-slate-300"></th>
                    <th className="py-0.5 px-1 text-center"></th>
                  </tr>
                </>
              )}
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-900">
              {states.map((s, idx) => {
                {/* 1. AIR ROW */}
                if (activeCategory === 'AIR') {
                  const mw = s.molarMass ?? 28.97;
                  const sMol = s.s_mole ?? (s.s * mw);
                  const hMol = s.h_mole ?? (s.h * mw);
                  const uMol = s.u_mole ?? (s.u * mw);
                  const s0Mol = s.s0_mole ?? ((s.s0 ?? 0) * mw);
                  const rVal = s.gasConstant ?? 0.287;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalT(s.T, units.T), 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 2, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEntropy(s.s, units.s), 3, 3)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.h, units.h), 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.u, units.u), 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(sMol, 0, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(hMol, 0, 0)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(uMol, 0, 0)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.Pr, 4, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.vr, 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.P0 ?? 0.1, 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.s0, 3, 3)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s0Mol, 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(mw, 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(rVal, 3, 4)}</td>
                      <td className="py-1 px-1 text-center">
                        <button onClick={() => onDeleteState(s.id)} className="text-slate-400 hover:text-rose-600" title="Remover">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                {/* 2. IDEAL GASES ROW */}
                if (activeCategory === 'IDEAL_GASES') {
                  const gas = GAS_CATALOG[s.substanceId] || GAS_CATALOG['co2'];
                  const M = gas.M;
                  const R = 8.31446 / M;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                      <td className="py-1 px-2 text-left border-r border-slate-200 font-bold">{gas.name}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalT(s.T, units.T), 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 2, 4)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatV(UnitConverter.fromInternalV(s.v, units.v))}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEntropy(s.s, units.s), 3, 3)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.h, units.h), 1, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.u, units.u), 1, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.s * M, 1, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.h * M, 0, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.u * M, 0, 1)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(M, 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(R, 4, 4)}</td>
                      <td className="py-1 px-1 text-center">
                        <button onClick={() => onDeleteState(s.id)} className="text-slate-400 hover:text-rose-600" title="Remover">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                {/* 3. COMPRESSIBILITY ROW */}
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
                        <button onClick={() => onDeleteState(s.id)} className="text-slate-400 hover:text-rose-600" title="Remover">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                {/* 4. PSYCHROMETRICS ROW */}
                if (activeCategory === 'PSYCHROMETRICS') {
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1 px-2 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(s.Tdb ?? s.T, 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.Twb, 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.Tdp, 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(s.RH, 1, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{s.w ? formatNumber(s.w * 1000, 2, 2) : '-'}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.h_psychro ?? s.h, 2, 2)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatV(s.v_psychro ?? s.v)}</td>
                      <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(s.P_MPa * 1000, 2, 2)}</td>
                      <td className="py-1 px-1 text-center">
                        <button onClick={() => onDeleteState(s.id)} className="text-slate-400 hover:text-rose-600" title="Remover">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                {/* 5. FLUIDS (WATER, REFRIGERANTS, CRYOGENICS) ROW - EXACT MATCH TO IMAGE 3 */}
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-1 px-2 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                    <td className="py-1 px-2 text-left border-r border-slate-200 font-bold truncate max-w-[150px]">{s.substanceName}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalT(s.T, units.T), 2, 2)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200 font-bold">{formatNumber(UnitConverter.fromInternalP(s.P_MPa, units.P), 2, 4)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatV(UnitConverter.fromInternalV(s.v, units.v))}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.u, units.u), 2, 2)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEnergy(s.h, units.h), 2, 2)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{formatNumber(UnitConverter.fromInternalEntropy(s.s, units.s), 3, 4)}</td>
                    <td className="py-1 px-2 text-right border-r border-slate-200">{s.x !== null && s.x !== undefined ? formatNumber(s.x, 4, 4) : '-'}</td>
                    <td className="py-1 px-2 text-left border-r border-slate-200 text-[11px] truncate">{UnitConverter.formatPhasePtBr(s.phase)}</td>
                    <td className="py-1 px-1 text-center">
                      <button onClick={() => onDeleteState(s.id)} className="text-slate-400 hover:text-rose-600" title="Remover">
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
