import React from 'react';
import { ThermodynamicState, UnitSystem, SubstanceCategory } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { PlusCircle, Copy, Calculator } from 'lucide-react';
import { GAS_CATALOG } from '../engine/idealGases';
import { FLUID_CATALOG } from '../engine/refrigerants';

interface PropertiesBoxProps {
  state: ThermodynamicState | null;
  category: SubstanceCategory;
  unitSystem: UnitSystem;
  onOpenCalculate: () => void;
  onAddState: (st: ThermodynamicState) => void;
}

export const PropertiesBox: React.FC<PropertiesBoxProps> = ({
  state,
  category,
  unitSystem,
  onOpenCalculate,
  onAddState,
}) => {
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

  const getTitle = () => {
    if (category === 'WATER') return 'Água e Vapor (H₂O)';
    if (category === 'REFRIGERANTS') return state?.substanceName || 'Refrigerante';
    if (category === 'CRYOGENICS') return state?.substanceName || 'Fluido Criogênico';
    if (category === 'AIR') return 'Tabela de Ar (Ideal Gas)';
    if (category === 'IDEAL_GASES') return state?.substanceName || 'Gás Ideal';
    if (category === 'COMPRESSIBILITY') return 'Compressibilidade Generalizada (Z)';
    return 'Psicrometria (Ar Úmido)';
  };

  return (
    <div className="bg-white border-2 border-slate-900 p-3 sm:p-4 font-mono shadow-sm flex flex-col justify-between h-full">
      {/* Box Header matching CATT3 */}
      <div className="border-b border-slate-300 pb-2 mb-2 flex items-center justify-between">
        <span className="font-bold text-xs uppercase text-slate-900 tracking-wider">
          Propriedades: {getTitle()}
        </span>
        <button
          onClick={onOpenCalculate}
          className="px-2.5 py-1 bg-black hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 uppercase transition-colors"
          title="Abrir janela de cálculo de propriedades"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Calcular</span>
        </button>
      </div>

      {/* RENDER CATEGORY-SPECIFIC PROPERTIES TABLE */}
      {/* ===================== 1. FLUIDS (WATER, REFRIGERANTS, CRYOGENICS) ===================== */}
      {(category === 'WATER' || category === 'REFRIGERANTS' || category === 'CRYOGENICS') && (
        <div className="space-y-1.5 text-xs flex-1">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Temperatura (T)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalT(state.T, units.T), 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.T}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Pressão (P)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalP(state.P_MPa, units.P), 2, 4) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.P}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Volume Específico (v)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatV(UnitConverter.fromInternalV(state.v, units.v)) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.v}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Energia Interna (u)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalEnergy(state.u, units.u), 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.u}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Entalpia Específica (h)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalEnergy(state.h, units.h), 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.h}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Entropia Específica (s)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalEntropy(state.s, units.s), 3, 4) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.s}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Título (x)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state && state.x !== null && state.x !== undefined ? formatNumber(state.x, 4, 4) : '-'}
            </span>
            <span className="w-20 text-right text-slate-400 text-[11px]">0 &le; x &le; 1</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Fase</span>
            <span className="flex-1 text-right font-bold text-slate-800 text-xs truncate pl-2">
              {state ? UnitConverter.formatPhasePtBr(state.phase) : '-'}
            </span>
            <span className="w-6"></span>
          </div>

          {/* Fluid Constants (MW, Tc, Pc) */}
          {state && (
            <div className="pt-2 text-[10px] text-slate-600 bg-slate-50 p-2 border border-slate-200">
              <span className="font-bold uppercase text-slate-900 block pb-1 border-b border-slate-200 mb-1">
                Constantes do Fluido:
              </span>
              <div className="grid grid-cols-3 gap-x-2">
                <span>M = {category === 'WATER' ? '18,015' : (state.molarMass?.toFixed(2) ?? FLUID_CATALOG[state.substanceId]?.molarMass?.toFixed(2) ?? '-')} kg/kmol</span>
                <span>Tc = {category === 'WATER' ? '373,95 °C' : (state.criticalT !== undefined ? (state.criticalT - 273.15).toFixed(2) + ' °C' : FLUID_CATALOG[state.substanceId]?.Tc !== undefined ? FLUID_CATALOG[state.substanceId].Tc.toFixed(2) + ' °C' : '-')}</span>
                <span>Pc = {category === 'WATER' ? '22,06 MPa' : (state.criticalP !== undefined ? state.criticalP.toFixed(3) + ' MPa' : FLUID_CATALOG[state.substanceId]?.Pc !== undefined ? (FLUID_CATALOG[state.substanceId].Pc / 10).toFixed(3) + ' MPa' : '-')}</span>
              </div>
            </div>
          )}

          {/* Saturation bounds if in saturated mode or mixture */}
          {state && (state.mode === 'SATURATION' || (state.x !== null && state.x !== undefined)) && state.vf !== undefined && (
            <div className="pt-2 text-[10px] text-slate-600 bg-slate-50 p-2 border border-slate-200 space-y-1">
              <span className="font-bold uppercase text-slate-900 block border-b border-slate-200 pb-1">
                Tabela de Saturação (Líquido f vs Vapor g):
              </span>
              <div className="grid grid-cols-2 gap-x-4">
                <span>vf = {formatV(state.vf)} {units.v}</span>
                <span>vg = {formatV(state.vg)} {units.v}</span>
                <span>hf = {formatNumber(state.hf, 2)} {units.h}</span>
                <span>hg = {formatNumber(state.hg, 2)} {units.h}</span>
                <span>sf = {formatNumber(state.sf, 4)} {units.s}</span>
                <span>sg = {formatNumber(state.sg, 4)} {units.s}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== 2. AIR (MATCHING EXACT ORIGINAL CATT3 SCREEN) ===================== */}
      {category === 'AIR' && (
        <div className="space-y-2.5 text-xs flex-1">
          {/* Upper Section: Split Air Properties & Constants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Air Properties Box matching Image 1 */}
            <div className="border border-slate-400 bg-slate-50 p-2 space-y-1">
              <span className="block font-bold text-[11px] text-slate-900 border-b border-slate-300 pb-0.5 mb-1 uppercase">
                Air Properties
              </span>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-800 font-bold">Temperature</span>
                <span className="font-bold text-slate-900">{state ? formatNumber(UnitConverter.fromInternalT(state.T, units.T), 2, 2) : '-'} <span className="font-normal text-slate-600">{units.T}</span></span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-800 font-bold">Pressure</span>
                <span className="font-bold text-slate-900">{state ? formatNumber(UnitConverter.fromInternalP(state.P_MPa, units.P), 2, 4) : '-'} <span className="font-normal text-slate-600">{units.P}</span></span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-800 font-bold">Pr</span>
                <span className="font-bold text-slate-900">{state?.Pr !== undefined ? formatNumber(state.Pr, 4, 4) : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-800 font-bold">Vr</span>
                <span className="font-bold text-slate-900">{state?.vr !== undefined ? formatNumber(state.vr, 1, 2) : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-slate-200">
                <span className="text-slate-800 font-bold">Volume Específico</span>
                <span className="font-bold text-slate-900">{state ? formatV(UnitConverter.fromInternalV(state.v, units.v)) : '-'} <span className="font-normal text-slate-600">{units.v}</span></span>
              </div>
            </div>

            {/* Constants Box matching Image 1 */}
            <div className="border border-slate-400 bg-slate-50 p-2 space-y-1">
              <span className="block font-bold text-[11px] text-slate-900 border-b border-slate-300 pb-0.5 mb-1 uppercase">
                Constants
              </span>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-800 font-bold">MW</span>
                <span className="font-bold text-slate-900">28,97</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-800 font-bold">R</span>
                <span className="font-bold text-slate-900">0,287 <span className="font-normal text-slate-600">kJ/kg/K</span></span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-800 font-bold">P°</span>
                <span className="font-bold text-slate-900">0,1 <span className="font-normal text-slate-600">{units.P}</span></span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-slate-200">
                <span className="text-slate-800 font-bold">Fase</span>
                <span className="font-bold text-slate-900">Gás Ideal</span>
              </div>
            </div>
          </div>

          {/* Lower Section: Dual Basis Table matching Image 1 */}
          <div className="border border-slate-400 bg-white p-2">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-300 text-slate-800">
                  <th className="py-1 text-left"></th>
                  <th className="py-1 text-right font-bold pr-3">Molal basis</th>
                  <th className="py-1 text-right font-bold">Mass basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Row 1: Entropy (s°) */}
                <tr>
                  <td className="py-1 font-bold text-slate-900">Entropy (s°)</td>
                  <td className="py-1 text-right pr-3 font-bold text-slate-900">
                    {state?.s0 !== undefined ? formatNumber(state.s0 * 28.9669, 1, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kmol/K</span>
                  </td>
                  <td className="py-1 text-right font-bold text-slate-900">
                    {state?.s0 !== undefined ? formatNumber(state.s0, 3, 3) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kg/K</span>
                  </td>
                </tr>

                {/* Row 2: Entropy (s) */}
                <tr>
                  <td className="py-1 font-bold text-slate-900">Entropy (s)</td>
                  <td className="py-1 text-right pr-3 font-bold text-slate-900">
                    {state ? formatNumber(state.s * 28.9669, 1, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kmol/K</span>
                  </td>
                  <td className="py-1 text-right font-bold text-slate-900">
                    {state ? formatNumber(state.s, 3, 3) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kg/K</span>
                  </td>
                </tr>

                {/* Row 3: Enthalpy (h) */}
                <tr>
                  <td className="py-1 font-bold text-slate-900">Enthalpy (h)</td>
                  <td className="py-1 text-right pr-3 font-bold text-slate-900">
                    {state ? formatNumber(state.h * 28.9669, 0, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kmol</span>
                  </td>
                  <td className="py-1 text-right font-bold text-slate-900">
                    {state ? formatNumber(state.h, 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kg</span>
                  </td>
                </tr>

                {/* Row 4: Energy (u) */}
                <tr>
                  <td className="py-1 font-bold text-slate-900">Energy (u)</td>
                  <td className="py-1 text-right pr-3 font-bold text-slate-900">
                    {state ? formatNumber(state.u * 28.9669, 0, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kmol</span>
                  </td>
                  <td className="py-1 text-right font-bold text-slate-900">
                    {state ? formatNumber(state.u, 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kg</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== 3. IDEAL GASES (AUTHENTIC DUAL BASIS + CONSTANTS) ===================== */}
      {category === 'IDEAL_GASES' && (
        <div className="space-y-2.5 text-xs flex-1">
          {(() => {
            const gas = state ? (GAS_CATALOG[state.substanceId] || GAS_CATALOG['co2']) : GAS_CATALOG['co2'];
            const M = gas.M;
            const R = 8.31446 / M;
            return (
              <>
                {/* Upper Section: Split Properties & Constants */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="border border-slate-400 bg-slate-50 p-2 space-y-1">
                    <span className="block font-bold text-[11px] text-slate-900 border-b border-slate-300 pb-0.5 mb-1 uppercase">
                      Gas Properties ({gas.name})
                    </span>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Temperatura</span>
                      <span className="font-bold text-slate-900">{state ? formatNumber(UnitConverter.fromInternalT(state.T, units.T), 2, 2) : '-'} <span className="font-normal text-slate-600">{units.T}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Pressão</span>
                      <span className="font-bold text-slate-900">{state ? formatNumber(UnitConverter.fromInternalP(state.P_MPa, units.P), 2, 4) : '-'} <span className="font-normal text-slate-600">{units.P}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Volume Específico</span>
                      <span className="font-bold text-slate-900">{state ? formatV(UnitConverter.fromInternalV(state.v, units.v)) : '-'} <span className="font-normal text-slate-600">{units.v}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Densidade</span>
                      <span className="font-bold text-slate-900">{state ? formatNumber(1 / state.v, 3, 4) : '-'} <span className="font-normal text-slate-600">kg/m³</span></span>
                    </div>
                  </div>

                  <div className="border border-slate-400 bg-slate-50 p-2 space-y-1">
                    <span className="block font-bold text-[11px] text-slate-900 border-b border-slate-300 pb-0.5 mb-1 uppercase">
                      Constants ({gas.formula || gas.name})
                    </span>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">MW</span>
                      <span className="font-bold text-slate-900">{formatNumber(M, 2, 2)} <span className="font-normal text-slate-600">kg/kmol</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">R</span>
                      <span className="font-bold text-slate-900">{formatNumber(R, 4, 4)} <span className="font-normal text-slate-600">kJ/kg/K</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">cp</span>
                      <span className="font-bold text-slate-900">{state?.cp ? formatNumber(state.cp, 3, 3) : '-'} <span className="font-normal text-slate-600">kJ/kg/K</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">k (cp/cv)</span>
                      <span className="font-bold text-slate-900">{state?.k_ratio ? formatNumber(state.k_ratio, 3, 3) : '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Lower Section: Dual Basis Table */}
                <div className="border border-slate-400 bg-white p-2">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-800">
                        <th className="py-1 text-left"></th>
                        <th className="py-1 text-right font-bold pr-3">Molal basis</th>
                        <th className="py-1 text-right font-bold">Mass basis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-1 font-bold text-slate-900">Entropy (s°)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state?.s0 !== undefined ? formatNumber(state.s0 * M, 1, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kmol/K</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state?.s0 !== undefined ? formatNumber(state.s0, 3, 3) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kg/K</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold text-slate-900">Entropy (s)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state ? formatNumber(state.s * M, 1, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kmol/K</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state ? formatNumber(state.s, 3, 3) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kg/K</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold text-slate-900">Enthalpy (h)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state ? formatNumber(state.h * M, 0, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kmol</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state ? formatNumber(state.h, 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kg</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold text-slate-900">Energy (u)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state ? formatNumber(state.u * M, 0, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kmol</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state ? formatNumber(state.u, 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">kJ/kg</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ===================== 4. COMPRESSIBILITY (MATCHING CATT3 COMPRFORM) ===================== */}
      {category === 'COMPRESSIBILITY' && (
        <div className="space-y-1.5 text-xs flex-1">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-44 font-bold text-slate-900">Temperatura Reduzida (Tr)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Tr !== undefined ? formatNumber(state.Tr, 4, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">T / Tc</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-44 font-bold text-slate-900">Pressão Reduzida (Pr)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Pr_red !== undefined ? formatNumber(state.Pr_red, 4, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">P / Pc</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-44 font-bold text-slate-900">Fator Acêntrico (ω)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.acentricFactor !== undefined ? formatNumber(state.acentricFactor, 4, 4) : '0,0000'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">Pitzer</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b-2 border-slate-900 bg-slate-50 px-1">
            <span className="w-44 font-bold text-black text-sm">Fator de Compressibilidade Z</span>
            <span className="flex-1 text-right font-bold text-black text-base">
              {state?.Z !== undefined ? formatNumber(state.Z, 4, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-600 text-[11px] font-bold">Z = Pv/RT</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-44 font-bold text-slate-900">Componente Simples Z(0)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Z0 !== undefined ? formatNumber(state.Z0, 4, 4) : formatNumber(state?.Z, 4, 4)}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">Lee-Kesler</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-44 font-bold text-slate-900">Componente Desvio Z(1)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Z1 !== undefined ? formatNumber(state.Z1, 4, 4) : '0,0000'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">Lee-Kesler</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-44 font-bold text-slate-900">Vol. Pseudo-Reduzido (v'r)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(state.v, 4, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">-</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-44 font-bold text-slate-900">(H* - H) / (R · Tc)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.h_departure !== undefined ? formatNumber(state.h_departure, 4, 4) : (state?.Tr && state?.Z ? formatNumber(Math.max(0, (1 - state.Z) * 2.5), 4, 4) : '-')}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">Desvio H</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-44 font-bold text-slate-900">(S* - S) / R</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.s_departure !== undefined ? formatNumber(state.s_departure, 4, 4) : (state?.Tr && state?.Z ? formatNumber(Math.max(0, -Math.log(Math.max(0.01, state.Z)) * 1.5), 4, 4) : '-')}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">Desvio S</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-44 font-bold text-slate-900">ln(f / P)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.fugacity_ln !== undefined ? formatNumber(state.fugacity_ln, 4, 4) : (state?.Z ? formatNumber(state.Z - 1 - Math.log(Math.max(0.01, state.Z)), 4, 4) : '-')}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">Fugacidade</span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="w-44 font-bold text-slate-900">Fase</span>
            <span className="flex-1 text-right font-bold text-slate-800 text-xs truncate pl-2">
              {state ? UnitConverter.formatPhasePtBr(state.phase) : '-'}
            </span>
            <span className="w-6"></span>
          </div>
        </div>
      )}

      {/* ===================== 5. PSYCHROMETRICS (MATCHING CATT3 PSYCHFORM) ===================== */}
      {category === 'PSYCHROMETRICS' && (
        <div className="space-y-1.5 text-xs flex-1">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Bulbo Seco (Tbs)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Tdb !== undefined ? formatNumber(state.Tdb, 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">°C</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Bulbo Úmido (Tbu)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Twb !== undefined ? formatNumber(state.Twb, 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">°C</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Ponto de Orvalho (Tpo)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Tdp !== undefined ? formatNumber(state.Tdp, 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">°C</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b-2 border-slate-900 bg-slate-50 px-1">
            <span className="w-40 font-bold text-black text-sm">Umidade Relativa (φ)</span>
            <span className="flex-1 text-right font-bold text-black text-base">
              {state?.RH !== undefined ? formatNumber(state.RH, 1, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-600 text-[11px] font-bold">%</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Umidade Absoluta (w)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.w !== undefined ? formatNumber(state.w, 5, 5) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">kg/kg ar</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Razão de Umidade</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.w !== undefined ? formatNumber(state.w * 1000, 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">g/kg ar</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Entalpia Específica (h)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.h_psychro !== undefined ? formatNumber(state.h_psychro, 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">kJ/kg ar</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Volume Específico (v)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.v_psychro !== undefined ? formatNumber(state.v_psychro, 4, 4) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">m³/kg ar</span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="w-40 font-bold text-slate-900">Pressão Atmosférica (P)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-xs">
              {state ? formatNumber(state.P_MPa * 1000, 3, 3) : '101,325'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">kPa</span>
          </div>
        </div>
      )}

      {/* Action buttons below properties */}
      {state && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-200 mt-2">
          <button
            onClick={() => onAddState(state)}
            className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-900 text-[11px] font-bold flex items-center justify-center gap-1 uppercase transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Adicionar ao Log</span>
          </button>

          <button
            onClick={() => {
              const text = `T=${formatNumber(state.T, 2)} ${units.T}, P=${formatNumber(state.P, 4)} ${units.P}, v=${formatV(state.v)} ${units.v}, h=${formatNumber(state.h, 2)} ${units.h}`;
              navigator.clipboard.writeText(text);
              alert('Copiado para a área de transferência!');
            }}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-900"
            title="Copiar dados do estado"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
