import React from 'react';
import { ThermodynamicState, UnitSystem } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { PlusCircle, Copy, Calculator } from 'lucide-react';

interface PropertiesBoxProps {
  state: ThermodynamicState | null;
  unitSystem: UnitSystem;
  onOpenCalculate: () => void;
  onAddState: (st: ThermodynamicState) => void;
}

export const PropertiesBox: React.FC<PropertiesBoxProps> = ({
  state,
  unitSystem,
  onOpenCalculate,
  onAddState,
}) => {
  const units = UnitConverter.getUnitLabels(unitSystem);

  const formatNumber = (num: number, maxDecimals: number = 4) => {
    if (isNaN(num) || num === null || num === undefined) return '';
    if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(4);
    // Don't force trailing zeroes if integer or fewer decimals, up to maxDecimals
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: maxDecimals });
  };

  const formatV = (v: number | null) => {
    if (v === null || isNaN(v)) return '';
    if (v >= 0.05) return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 6 });
  };

  const dispT = state ? UnitConverter.fromInternalT(state.T, units.T) : null;
  const dispP = state ? UnitConverter.fromInternalP(state.P_MPa, units.P) : null;
  const dispV = state ? UnitConverter.fromInternalV(state.v, units.v) : null;
  const dispU = state ? UnitConverter.fromInternalEnergy(state.u, units.u) : null;
  const dispH = state ? UnitConverter.fromInternalEnergy(state.h, units.h) : null;
  const dispS = state ? UnitConverter.fromInternalEntropy(state.s, units.s) : null;
  const dispX = state && state.x !== null && state.x !== undefined ? state.x : null;

  return (
    <div className="bg-white border-2 border-slate-900 p-3 sm:p-4 font-mono shadow-sm flex flex-col justify-between h-full">
      {/* Box Header matching CATT3 */}
      <div className="border-b border-slate-300 pb-2 mb-2 flex items-center justify-between">
        <span className="font-bold text-xs uppercase text-slate-900 tracking-wider">
          {state ? `${state.substanceName} Properties` : 'Substance Properties'}
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

      {/* Properties Table matching Image 3 */}
      <div className="space-y-1.5 text-xs">
        {/* T */}
        <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
          <span className="w-16 font-bold text-slate-900">T</span>
          <span className="flex-1 text-right font-bold text-slate-900 text-sm">
            {dispT !== null ? formatNumber(dispT, 2) : '-'}
          </span>
          <span className="w-16 text-right text-slate-500 text-[11px]">{units.T}</span>
        </div>

        {/* P */}
        <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
          <span className="w-16 font-bold text-slate-900">P</span>
          <span className="flex-1 text-right font-bold text-slate-900 text-sm">
            {dispP !== null ? formatNumber(dispP, 4) : '-'}
          </span>
          <span className="w-16 text-right text-slate-500 text-[11px]">{units.P}</span>
        </div>

        {/* V */}
        <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
          <span className="w-16 font-bold text-slate-900">V</span>
          <span className="flex-1 text-right font-bold text-slate-900 text-sm">
            {dispV !== null ? formatV(dispV) : '-'}
          </span>
          <span className="w-16 text-right text-slate-500 text-[11px]">{units.v}</span>
        </div>

        {/* U */}
        <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
          <span className="w-16 font-bold text-slate-900">U</span>
          <span className="flex-1 text-right font-bold text-slate-900 text-sm">
            {dispU !== null ? formatNumber(dispU, 2) : '-'}
          </span>
          <span className="w-16 text-right text-slate-500 text-[11px]">{units.u}</span>
        </div>

        {/* H */}
        <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
          <span className="w-16 font-bold text-slate-900">H</span>
          <span className="flex-1 text-right font-bold text-slate-900 text-sm">
            {dispH !== null ? formatNumber(dispH, 2) : '-'}
          </span>
          <span className="w-16 text-right text-slate-500 text-[11px]">{units.h}</span>
        </div>

        {/* S */}
        <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
          <span className="w-16 font-bold text-slate-900">S</span>
          <span className="flex-1 text-right font-bold text-slate-900 text-sm">
            {dispS !== null ? formatNumber(dispS, 4) : '-'}
          </span>
          <span className="w-16 text-right text-slate-500 text-[11px]">{units.s}</span>
        </div>

        {/* X */}
        <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
          <span className="w-16 font-bold text-slate-900">X</span>
          <span className="flex-1 text-right font-bold text-slate-900 text-sm">
            {dispX !== null ? formatNumber(dispX, 4) : ''}
          </span>
          <span className="w-16 text-right text-slate-400 text-[11px]">{dispX !== null ? '' : ''}</span>
        </div>

        {/* Phase */}
        <div className="flex items-center justify-between py-0.5">
          <span className="w-16 font-bold text-slate-900">Phase</span>
          <span className="flex-1 text-right font-bold text-slate-800 text-xs truncate pl-2">
            {state ? state.phase : '-'}
          </span>
          <span className="w-6"></span>
        </div>
      </div>

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
              const text = `T=${dispT} ${units.T}, P=${dispP} ${units.P}, v=${dispV} ${units.v}, u=${dispU} ${units.u}, h=${dispH} ${units.h}, s=${dispS} ${units.s}`;
              navigator.clipboard.writeText(text);
              alert('Copiado!');
            }}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-900"
            title="Copiar dados"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
