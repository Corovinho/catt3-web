import React from 'react';
import { ThermodynamicState, UnitSystem, SubstanceCategory } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { PlusCircle, Copy, Calculator } from 'lucide-react';
import { GAS_CATALOG } from '../engine/idealGases';

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
            <span className="w-16 font-bold text-slate-900">T</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalT(state.T, units.T), 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.T}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-16 font-bold text-slate-900">P</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalP(state.P_MPa, units.P), 2, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.P}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-16 font-bold text-slate-900">V</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatV(UnitConverter.fromInternalV(state.v, units.v)) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.v}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-16 font-bold text-slate-900">U</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalEnergy(state.u, units.u), 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.u}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-16 font-bold text-slate-900">H</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalEnergy(state.h, units.h), 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.h}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-16 font-bold text-slate-900">S</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalEntropy(state.s, units.s), 3, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.s}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-16 font-bold text-slate-900">X</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state && state.x !== null && state.x !== undefined ? formatNumber(state.x, 4, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">0 &le; x &le; 1</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-16 font-bold text-slate-900">Fase</span>
            <span className="flex-1 text-right font-bold text-slate-800 text-xs truncate pl-2">
              {state ? UnitConverter.formatPhasePtBr(state.phase) : '-'}
            </span>
            <span className="w-6"></span>
          </div>

          {/* Saturation bounds if in saturated mode */}
          {state && state.mode === 'SATURATION' && state.vf !== undefined && (
            <div className="pt-2 text-[10px] text-slate-600 bg-slate-50 p-2 border border-slate-200 space-y-1">
              <span className="font-bold uppercase text-slate-900 block">Limites de Saturação:</span>
              <div className="grid grid-cols-2 gap-x-2">
                <span>vf = {formatV(state.vf)}</span>
                <span>vg = {formatV(state.vg)}</span>
                <span>hf = {formatNumber(state.hf, 2)}</span>
                <span>hg = {formatNumber(state.hg, 2)}</span>
                <span>sf = {formatNumber(state.sf, 4)}</span>
                <span>sg = {formatNumber(state.sg, 4)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== 2. AIR (AIR TABLES / MORAN & SHAPIRO A-22) ===================== */}
      {category === 'AIR' && (
        <div className="space-y-1.5 text-xs flex-1">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">T</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(state.T, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.T} ({state ? formatNumber(state.T + 273.15, 2) : '-'} K)</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">P</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalP(state.P_MPa, units.P), 2, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.P}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Entalpia (h)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(state.h, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.h}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Energia (u)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(state.u, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.u}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Entropia (s°)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.s0 !== undefined ? formatNumber(state.s0, 4, 5) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.s}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Entropia (s)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(state.s, 4, 5) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.s}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Pressão Rel. (Pr)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Pr !== undefined ? formatNumber(state.Pr, 3, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">-</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Vol. Rel. (vr)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.vr !== undefined ? formatNumber(state.vr, 2, 3) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">-</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Volume (v)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatV(state.v) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.v}</span>
          </div>

          {/* Molar Basis Summary box */}
          {state && (
            <div className="pt-2 text-[10px] text-slate-600 bg-slate-50 p-2 border border-slate-200">
              <span className="font-bold uppercase text-slate-900 block pb-1 border-b border-slate-200 mb-1">
                Base Molar (M = 28,97 kg/kmol):
              </span>
              <div className="grid grid-cols-2 gap-x-2">
                <span>h = {formatNumber(state.h * 28.97, 1)} kJ/kmol</span>
                <span>u = {formatNumber(state.u * 28.97, 1)} kJ/kmol</span>
                <span>s° = {state.s0 ? formatNumber(state.s0 * 28.97, 3) : '-'} kJ/kmol·K</span>
                <span>s = {formatNumber(state.s * 28.97, 3)} kJ/kmol·K</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== 3. IDEAL GASES ===================== */}
      {category === 'IDEAL_GASES' && (
        <div className="space-y-1.5 text-xs flex-1">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">T</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(state.T, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.T} ({state ? formatNumber(state.T + 273.15, 2) : '-'} K)</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">P</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(UnitConverter.fromInternalP(state.P_MPa, units.P), 2, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.P}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Entalpia (h)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(state.h, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.h}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Energia (u)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(state.u, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.u}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Entropia (s°)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.s0 !== undefined ? formatNumber(state.s0, 4, 5) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.s}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Entropia (s)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(state.s, 4, 5) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.s}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-20 font-bold text-slate-900">Volume (v)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatV(state.v) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">{units.v}</span>
          </div>

          {/* Molecular Weight and R */}
          {state && (
            <div className="pt-2 text-[10px] text-slate-600 bg-slate-50 p-2 border border-slate-200">
              {(() => {
                const gas = GAS_CATALOG[state.substanceId] || GAS_CATALOG['co2'];
                const M = gas.M;
                const R = 8.31446 / M;
                return (
                  <>
                    <span className="font-bold uppercase text-slate-900 block pb-1 border-b border-slate-200 mb-1">
                      Constantes ({gas.name}):
                    </span>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span>M = {M} kg/kmol</span>
                      <span>R = {formatNumber(R, 4)} kJ/kg·K</span>
                      <span>h_mol = {formatNumber(state.h * M, 1)} kJ/kmol</span>
                      <span>s_mol = {formatNumber(state.s * M, 3)} kJ/kmol·K</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ===================== 4. COMPRESSIBILITY ===================== */}
      {category === 'COMPRESSIBILITY' && (
        <div className="space-y-1.5 text-xs flex-1">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-24 font-bold text-slate-900">Tr (T / Tc)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Tr !== undefined ? formatNumber(state.Tr, 3, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">-</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-24 font-bold text-slate-900">Pr (P / Pc)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Pr_red !== undefined ? formatNumber(state.Pr_red, 3, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">-</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b-2 border-slate-900 bg-slate-50 px-1">
            <span className="w-24 font-bold text-black text-sm">Fator Z</span>
            <span className="flex-1 text-right font-bold text-black text-base">
              {state?.Z !== undefined ? formatNumber(state.Z, 4, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px] font-bold">Z = Pv/RT</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-24 font-bold text-slate-900">Vol. Pseudorred. (v'r)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state ? formatNumber(state.v, 4, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">-</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-24 font-bold text-slate-900">(h* - h) / R·Tc</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Tr && state?.Z ? formatNumber(Math.max(0, (1 - state.Z) * 2.5), 3, 3) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">Residual</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-24 font-bold text-slate-900">(s* - s) / R</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Tr && state?.Z ? formatNumber(Math.max(0, -Math.log(Math.max(0.01, state.Z)) * 1.5), 3, 3) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">Residual</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-24 font-bold text-slate-900">ln(f / P)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Z ? formatNumber(state.Z - 1 - Math.log(Math.max(0.01, state.Z)), 3, 3) : '-'}
            </span>
            <span className="w-16 text-right text-slate-400 text-[11px]">Fugacidade</span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="w-24 font-bold text-slate-900">Região Indicada</span>
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
            <span className="w-32 font-bold text-slate-900">Bulbo Seco (Tbs)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Tdb !== undefined ? formatNumber(state.Tdb, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">°C</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-32 font-bold text-slate-900">Bulbo Úmido (Tbu)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Twb !== undefined ? formatNumber(state.Twb, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">°C</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-32 font-bold text-slate-900">Ponto Orvalho (Tpo)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.Tdp !== undefined ? formatNumber(state.Tdp, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">°C</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b-2 border-slate-900 bg-slate-50 px-1">
            <span className="w-32 font-bold text-black text-sm">Umidade Relativa (φ)</span>
            <span className="flex-1 text-right font-bold text-black text-base">
              {state?.RH !== undefined ? formatNumber(state.RH, 1, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-600 text-[11px] font-bold">%</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-32 font-bold text-slate-900">Razão Umidade (w)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.w !== undefined ? formatNumber(state.w, 4, 5) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">kg/kg</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-32 font-bold text-slate-900">Razão Umidade (w)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.w !== undefined ? formatNumber(state.w * 1000, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">g/kg</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-32 font-bold text-slate-900">Entalpia Total (h)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.h_psychro !== undefined ? formatNumber(state.h_psychro, 2, 2) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">kJ/kg ar</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
            <span className="w-32 font-bold text-slate-900">Volume Específico (v)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-sm">
              {state?.v_psychro !== undefined ? formatNumber(state.v_psychro, 4, 4) : '-'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">m³/kg ar</span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="w-32 font-bold text-slate-900">Pressão Atmosférica (P)</span>
            <span className="flex-1 text-right font-bold text-slate-900 text-xs">
              {state ? formatNumber(state.P_MPa * 1000, 3, 3) : '101,325'}
            </span>
            <span className="w-16 text-right text-slate-500 text-[11px]">kPa</span>
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
