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
  const isBritish = unitSystem === 'BRITISH' || unitSystem === 'BRITISH_MOLE';
  const uSMol = isBritish ? 'Btu/lbmol/R' : 'kJ/kmol/K';
  const uSMass = isBritish ? 'Btu/lbm/R' : 'kJ/kg/K';
  const uEMol = isBritish ? 'Btu/lbmol' : 'kJ/kmol';
  const uEMass = isBritish ? 'Btu/lbm' : 'kJ/kg';

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
    if (category === 'AIR') return 'Tabela de Ar (Gás Ideal)';
    if (category === 'IDEAL_GASES') return state?.substanceName || 'Gás Ideal';
    if (category === 'COMPRESSIBILITY') return 'Compressibilidade Generalizada (Z)';
    return 'Psicrometria (Ar Úmido)';
  };

  return (
    <div className="bg-white border-2 border-slate-900 p-3 sm:p-4 font-mono shadow-sm flex flex-col justify-between h-full">
      {/* Box Header */}
      <div className="border-b border-slate-300 pb-2 mb-2 flex items-center justify-between">
        <span className="font-bold text-xs uppercase text-slate-900 tracking-wider">
          Propriedades: {getTitle()}
        </span>
        <button
          onClick={onOpenCalculate}
          className="px-2.5 py-1 bg-black hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 uppercase transition-colors cursor-pointer"
          title="Abrir janela de cálculo de propriedades (F2)"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Calcular</span>
        </button>
      </div>

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
              {state ? formatV(UnitConverter.fromInternalV(state.v, units.v, state.molarMass)) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.v}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Energia Interna (u)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalEnergy(state.u, units.u, state.molarMass), 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.u}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Entalpia Específica (h)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalEnergy(state.h, units.h, state.molarMass), 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.h}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Entropia Específica (s)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalEntropy(state.s, units.s, state.molarMass), 3, 4) : '-'}
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
                <span>vf = {formatV(UnitConverter.fromInternalV(state.vf, units.v, state.molarMass))} {units.v}</span>
                <span>vg = {formatV(UnitConverter.fromInternalV(state.vg ?? 0, units.v, state.molarMass))} {units.v}</span>
                {state.uf !== undefined && (
                  <>
                    <span>uf = {formatNumber(UnitConverter.fromInternalEnergy(state.uf, units.u, state.molarMass), 2)} {units.u}</span>
                    <span>ug = {formatNumber(UnitConverter.fromInternalEnergy(state.ug ?? 0, units.u, state.molarMass), 2)} {units.u}</span>
                  </>
                )}
                <span>hf = {formatNumber(UnitConverter.fromInternalEnergy(state.hf ?? 0, units.h, state.molarMass), 2)} {units.h}</span>
                <span>hg = {formatNumber(UnitConverter.fromInternalEnergy(state.hg ?? 0, units.h, state.molarMass), 2)} {units.h}</span>
                <span>sf = {formatNumber(UnitConverter.fromInternalEntropy(state.sf ?? 0, units.s, state.molarMass), 4)} {units.s}</span>
                <span>sg = {formatNumber(UnitConverter.fromInternalEntropy(state.sg ?? 0, units.s, state.molarMass), 4)} {units.s}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== 2. AIR ===================== */}
      {category === 'AIR' && (
        <div className="space-y-2.5 text-xs flex-1">
          {(() => {
            const MW_AIR = 28.9669;
            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="border border-slate-400 bg-slate-50 p-2 space-y-1">
                    <span className="block font-bold text-[11px] text-slate-900 border-b border-slate-300 pb-0.5 mb-1 uppercase">
                      Propriedades do Ar
                    </span>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Temperatura (T)</span>
                      <span className="font-bold text-slate-900">{state ? formatNumber(UnitConverter.fromInternalT(state.T, units.T), 2, 2) : '-'} <span className="font-normal text-slate-600">{units.T}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Pressão (P)</span>
                      <span className="font-bold text-slate-900">{state ? formatNumber(UnitConverter.fromInternalP(state.P_MPa, units.P), 2, 4) : '-'} <span className="font-normal text-slate-600">{units.P}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Pressão Rel. (Pr)</span>
                      <span className="font-bold text-slate-900">{state?.Pr !== undefined ? formatNumber(state.Pr, 4, 4) : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Volume Rel. (vr)</span>
                      <span className="font-bold text-slate-900">{state?.vr !== undefined ? formatNumber(state.vr, 1, 2) : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-t border-slate-200">
                      <span className="text-slate-800 font-bold">Volume Esp. (v)</span>
                      <span className="font-bold text-slate-900">{state ? formatV(UnitConverter.fromInternalV(state.v, units.v, MW_AIR)) : '-'} <span className="font-normal text-slate-600">{units.v}</span></span>
                    </div>
                  </div>

                  <div className="border border-slate-400 bg-slate-50 p-2 space-y-1">
                    <span className="block font-bold text-[11px] text-slate-900 border-b border-slate-300 pb-0.5 mb-1 uppercase">
                      Constantes do Ar
                    </span>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">M (Massa Molar)</span>
                      <span className="font-bold text-slate-900">28,97 <span className="font-normal text-slate-600">kg/kmol</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">R</span>
                      <span className="font-bold text-slate-900">{formatNumber(UnitConverter.fromInternalEntropy(0.2870, uSMass, MW_AIR), 3, 4)} <span className="font-normal text-slate-600">{uSMass}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">P° (Ref.)</span>
                      <span className="font-bold text-slate-900">{formatNumber(UnitConverter.fromInternalP(0.1, units.P), 1, 3)} <span className="font-normal text-slate-600">{units.P}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-t border-slate-200">
                      <span className="text-slate-800 font-bold">Fase</span>
                      <span className="font-bold text-slate-900">Gás Ideal</span>
                    </div>
                  </div>
                </div>

                {/* Lower Section: Dual Basis Table */}
                <div className="border border-slate-400 bg-white p-2">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-800">
                        <th className="py-1 text-left"></th>
                        <th className="py-1 text-right font-bold pr-3">Base Molar</th>
                        <th className="py-1 text-right font-bold">Base Mássica</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-1 font-bold text-slate-900">Entropia Ref. (s°)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state?.s0 !== undefined ? formatNumber(UnitConverter.fromInternalEntropy(state.s0, uSMol, MW_AIR), 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uSMol}</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state?.s0 !== undefined ? formatNumber(UnitConverter.fromInternalEntropy(state.s0, uSMass, MW_AIR), 3, 4) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uSMass}</span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-1 font-bold text-slate-900">Entropia (s)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEntropy(state.s, uSMol, MW_AIR), 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uSMol}</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEntropy(state.s, uSMass, MW_AIR), 3, 4) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uSMass}</span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-1 font-bold text-slate-900">Entalpia (h)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEnergy(state.h, uEMol, MW_AIR), 0, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uEMol}</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEnergy(state.h, uEMass, MW_AIR), 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uEMass}</span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-1 font-bold text-slate-900">Energia Int. (u)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEnergy(state.u, uEMol, MW_AIR), 0, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uEMol}</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEnergy(state.u, uEMass, MW_AIR), 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uEMass}</span>
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

      {/* ===================== 3. IDEAL GASES ===================== */}
      {category === 'IDEAL_GASES' && (
        <div className="space-y-2.5 text-xs flex-1">
          {(() => {
            const gas = state ? (GAS_CATALOG[state.substanceId] || GAS_CATALOG['co2']) : GAS_CATALOG['co2'];
            const M = gas.M;
            const R = 8.314462618 / M;
            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="border border-slate-400 bg-slate-50 p-2 space-y-1">
                    <span className="block font-bold text-[11px] text-slate-900 border-b border-slate-300 pb-0.5 mb-1 uppercase">
                      Propriedades ({gas.name})
                    </span>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Temperatura (T)</span>
                      <span className="font-bold text-slate-900">{state ? formatNumber(UnitConverter.fromInternalT(state.T, units.T), 2, 2) : '-'} <span className="font-normal text-slate-600">{units.T}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Pressão (P)</span>
                      <span className="font-bold text-slate-900">{state ? formatNumber(UnitConverter.fromInternalP(state.P_MPa, units.P), 2, 4) : '-'} <span className="font-normal text-slate-600">{units.P}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Volume Esp. (v)</span>
                      <span className="font-bold text-slate-900">{state ? formatV(UnitConverter.fromInternalV(state.v, units.v, M)) : '-'} <span className="font-normal text-slate-600">{units.v}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">Densidade (ρ)</span>
                      <span className="font-bold text-slate-900">{state ? formatNumber(1 / state.v, 3, 4) : '-'} <span className="font-normal text-slate-600">kg/m³</span></span>
                    </div>
                  </div>

                  <div className="border border-slate-400 bg-slate-50 p-2 space-y-1">
                    <span className="block font-bold text-[11px] text-slate-900 border-b border-slate-300 pb-0.5 mb-1 uppercase">
                      Constantes ({gas.formula || gas.name})
                    </span>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">M</span>
                      <span className="font-bold text-slate-900">{formatNumber(M, 2, 3)} <span className="font-normal text-slate-600">kg/kmol</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">R</span>
                      <span className="font-bold text-slate-900">{formatNumber(UnitConverter.fromInternalEntropy(R, uSMass, M), 4, 4)} <span className="font-normal text-slate-600">{uSMass}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">cp</span>
                      <span className="font-bold text-slate-900">{state?.cp !== undefined ? formatNumber(UnitConverter.fromInternalEntropy(state.cp, uSMass, M), 3, 3) : '-'} <span className="font-normal text-slate-600">{uSMass}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-bold">k (cp/cv)</span>
                      <span className="font-bold text-slate-900">{state?.k_ratio !== undefined ? formatNumber(state.k_ratio, 3, 3) : '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Lower Section: Dual Basis Table */}
                <div className="border border-slate-400 bg-white p-2">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-800">
                        <th className="py-1 text-left"></th>
                        <th className="py-1 text-right font-bold pr-3">Base Molar</th>
                        <th className="py-1 text-right font-bold">Base Mássica</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-1 font-bold text-slate-900">Entropia Ref. (s°)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state?.s0 !== undefined ? formatNumber(UnitConverter.fromInternalEntropy(state.s0, uSMol, M), 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uSMol}</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state?.s0 !== undefined ? formatNumber(UnitConverter.fromInternalEntropy(state.s0, uSMass, M), 3, 4) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uSMass}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold text-slate-900">Entropia (s)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEntropy(state.s, uSMol, M), 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uSMol}</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEntropy(state.s, uSMass, M), 3, 4) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uSMass}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold text-slate-900">Entalpia (h)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEnergy(state.h, uEMol, M), 0, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uEMol}</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEnergy(state.h, uEMass, M), 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uEMass}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold text-slate-900">Energia Int. (u)</td>
                        <td className="py-1 text-right pr-3 font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEnergy(state.u, uEMol, M), 0, 1) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uEMol}</span>
                        </td>
                        <td className="py-1 text-right font-bold text-slate-900">
                          {state ? formatNumber(UnitConverter.fromInternalEnergy(state.u, uEMass, M), 1, 2) : '-'} <span className="font-normal text-slate-500 text-[10px]">{uEMass}</span>
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

      {/* ===================== 4. COMPRESSIBILITY ===================== */}
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

      {/* ===================== 5. PSYCHROMETRICS ===================== */}
      {category === 'PSYCHROMETRICS' && (
        <div className="space-y-1.5 text-xs flex-1">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Bulbo Seco (Tbs)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Tdb !== undefined ? formatNumber(UnitConverter.fromInternalT(state.Tdb, units.T), 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.T}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Bulbo Úmido (Tbu)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Twb !== undefined ? formatNumber(UnitConverter.fromInternalT(state.Twb, units.T), 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.T}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Ponto de Orvalho (Tpo)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Tdp !== undefined ? formatNumber(UnitConverter.fromInternalT(state.Tdp, units.T), 2, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.T}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b-2 border-slate-900 bg-slate-50 px-1">
            <span className="w-40 font-bold text-black text-sm">Umidade Relativa (φ)</span>
            <span className="flex-1 text-right font-bold text-black text-base">
              {state?.RH !== undefined ? formatNumber(state.RH, 1, 2) : '-'}
            </span>
            <span className="w-20 text-right text-slate-600 text-[11px] font-bold">%</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-40 font-bold text-slate-900">Umidade Absoluta (ω)</span>
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
            <span className="w-40 font-bold text-slate-900">Pressão Total (P)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-xs">
              {state ? formatNumber(UnitConverter.fromInternalP(state.P_MPa, units.P), 2, 4) : formatNumber(UnitConverter.fromInternalP(0.101325, units.P), 2, 4)}
            </span>
            <span className="w-20 text-right text-slate-500 text-[11px]">{units.P}</span>
          </div>
        </div>
      )}

      {/* Action buttons below properties */}
      {state && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-200 mt-2">
          <button
            onClick={() => onAddState(state)}
            className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-900 text-[11px] font-bold flex items-center justify-center gap-1 uppercase transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Adicionar ao Log</span>
          </button>

          <button
            onClick={() => {
              const mm = state.molarMass ?? 18.015;
              const text = `${state.substanceName}: T=${formatNumber(UnitConverter.fromInternalT(state.T, units.T), 2)} ${units.T}, P=${formatNumber(UnitConverter.fromInternalP(state.P_MPa, units.P), 4)} ${units.P}, v=${formatV(UnitConverter.fromInternalV(state.v, units.v, mm))} ${units.v}, h=${formatNumber(UnitConverter.fromInternalEnergy(state.h, units.h, mm), 2)} ${units.h}, s=${formatNumber(UnitConverter.fromInternalEntropy(state.s, units.s, mm), 4)} ${units.s}`;
              navigator.clipboard.writeText(text);
              alert('Propriedades do estado copiadas para a área de transferência!');
            }}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-900 cursor-pointer"
            title="Copiar dados do estado"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
