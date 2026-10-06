import React, { useState } from 'react';
import { UnitSystem } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { Check, X, HelpCircle } from 'lucide-react';

interface FluidSatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unitSystem: UnitSystem;
  substanceName: string;
  initialT?: number;
  initialP?: number;
  onCalculate: (data: {
    primaryType: 'T' | 'P';
    primaryValue: number;
    mixtureType: 'x' | 'sat_liq' | 'sat_vap' | 'h' | 's' | 'v';
    mixtureValue?: number;
  }) => void;
}

export const FluidSatDialog: React.FC<FluidSatDialogProps> = ({
  isOpen,
  onClose,
  unitSystem,
  substanceName,
  initialT,
  initialP,
  onCalculate,
}) => {
  const [primaryType, setPrimaryType] = useState<'T' | 'P'>('T');
  const [valT, setValT] = useState<string>('100');
  const [valP, setValP] = useState<string>('0.101325'); // MPa default

  const [mixtureType, setMixtureType] = useState<'x' | 'sat_liq' | 'sat_vap' | 'h' | 's' | 'v'>('x');
  const [valMix, setValMix] = useState<string>('0.5');

  React.useEffect(() => {
    if (isOpen) {
      if (initialT !== undefined && !isNaN(initialT)) setValT(Number(initialT.toFixed(2)).toString());
      if (initialP !== undefined && !isNaN(initialP)) setValP(Number(initialP.toFixed(4)).toString());
    }
  }, [isOpen, initialT, initialP]);

  if (!isOpen) return null;

  const units = UnitConverter.getUnitLabels(unitSystem);

  const handleOK = () => {
    let primVal = 0;
    if (primaryType === 'T') {
      primVal = parseFloat(valT);
      if (isNaN(primVal)) return alert('Insira uma temperatura de saturação válida.');
    } else {
      primVal = parseFloat(valP);
      if (isNaN(primVal) || primVal <= 0) return alert('Insira uma pressão de saturação válida (> 0).');
    }

    let mixVal: number | undefined = undefined;
    if (mixtureType === 'sat_liq') {
      mixVal = 0;
    } else if (mixtureType === 'sat_vap') {
      mixVal = 1;
    } else {
      mixVal = parseFloat(valMix);
      if (isNaN(mixVal)) return alert('Insira um valor numérico para a condição de mistura.');
      if (mixtureType === 'x' && (mixVal < 0 || mixVal > 1)) {
        return alert('O título (Quality x) deve estar entre 0 e 1.');
      }
    }

    onCalculate({
      primaryType,
      primaryValue: primVal,
      mixtureType,
      mixtureValue: mixVal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs font-mono">
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-lg w-full p-4 shadow-2xl text-slate-900 space-y-4">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2">
          <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
            Propriedades de Saturação - {substanceName}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400">
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Content matching CATT3 FluidSatDialog */}
        <div className="space-y-3 text-xs">
          {/* Section 1: Entrada Primária (Primary Input) */}
          <div className="border border-slate-400 bg-white p-3 space-y-2.5">
            <span className="block font-bold text-[11px] border-b border-slate-300 pb-1 uppercase text-slate-700">
              1. Entrada Primária de Saturação
            </span>

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="primaryType"
                  value="T"
                  checked={primaryType === 'T'}
                  onChange={() => setPrimaryType('T')}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`font-mono ${primaryType === 'T' ? 'font-bold text-black' : 'text-slate-600'}`}>
                  Temperatura (T)
                </span>
              </label>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="any"
                  disabled={primaryType !== 'T'}
                  value={primaryType === 'T' ? valT : ''}
                  onChange={(e) => setValT(e.target.value)}
                  className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                    primaryType === 'T' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}
                />
                <span className="w-12 text-[11px] font-mono text-slate-600">{units.T}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="primaryType"
                  value="P"
                  checked={primaryType === 'P'}
                  onChange={() => setPrimaryType('P')}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`font-mono ${primaryType === 'P' ? 'font-bold text-black' : 'text-slate-600'}`}>
                  Pressão (P)
                </span>
              </label>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="any"
                  disabled={primaryType !== 'P'}
                  value={primaryType === 'P' ? valP : ''}
                  onChange={(e) => setValP(e.target.value)}
                  className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                    primaryType === 'P' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}
                />
                <span className="w-12 text-[11px] font-mono text-slate-600">{units.P}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Condição de Mistura / Título (Mixture Condition) */}
          <div className="border border-slate-400 bg-white p-3 space-y-2">
            <span className="block font-bold text-[11px] border-b border-slate-300 pb-1 uppercase text-slate-700">
              2. Condição da Mistura / Fase no Domo
            </span>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mixtureType"
                  value="sat_liq"
                  checked={mixtureType === 'sat_liq'}
                  onChange={() => setMixtureType('sat_liq')}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`text-xs ${mixtureType === 'sat_liq' ? 'font-bold text-black' : 'text-slate-700'}`}>
                  Líquido Saturado (x = 0)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mixtureType"
                  value="sat_vap"
                  checked={mixtureType === 'sat_vap'}
                  onChange={() => setMixtureType('sat_vap')}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`text-xs ${mixtureType === 'sat_vap' ? 'font-bold text-black' : 'text-slate-700'}`}>
                  Vapor Saturado (x = 1)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mixtureType"
                  value="x"
                  checked={mixtureType === 'x'}
                  onChange={() => setMixtureType('x')}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`text-xs ${mixtureType === 'x' ? 'font-bold text-black' : 'text-slate-700'}`}>
                  Título (0 &le; x &le; 1)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mixtureType"
                  value="h"
                  checked={mixtureType === 'h'}
                  onChange={() => setMixtureType('h')}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`text-xs ${mixtureType === 'h' ? 'font-bold text-black' : 'text-slate-700'}`}>
                  Entalpia (h) [{units.h}]
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mixtureType"
                  value="s"
                  checked={mixtureType === 's'}
                  onChange={() => setMixtureType('s')}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`text-xs ${mixtureType === 's' ? 'font-bold text-black' : 'text-slate-700'}`}>
                  Entropia (s) [{units.s}]
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mixtureType"
                  value="v"
                  checked={mixtureType === 'v'}
                  onChange={() => setMixtureType('v')}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`text-xs ${mixtureType === 'v' ? 'font-bold text-black' : 'text-slate-700'}`}>
                  Volume (v) [{units.v}]
                </span>
              </label>
            </div>

            {/* Input field for numerical mixture parameter */}
            {mixtureType !== 'sat_liq' && mixtureType !== 'sat_vap' && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 mt-2">
                <span className="text-[11px] font-bold text-slate-800">
                  Valor para {mixtureType === 'x' ? 'Título (x)' : mixtureType.toUpperCase()}:
                </span>
                <input
                  type="number"
                  step="any"
                  value={valMix}
                  onChange={(e) => setValMix(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOK()}
                  className="w-28 px-1.5 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: OK, Cancel, Help */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-300">
          <button
            onClick={handleOK}
            className="px-5 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] active:bg-[#c0c0c0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
            <span>OK</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <X className="w-4 h-4 text-rose-700 stroke-[3]" />
            <span>Cancelar</span>
          </button>

          <button
            onClick={() => alert('No modo Propriedades de Saturação do CATT3, você entra com a Temperatura ou Pressão no domo de vapor, e define o ponto de mistura (x, líquido saturado ou vapor saturado). Os valores de saturação vf, vg, hf, hg, etc. serão calculados.')}
            className="px-4 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <HelpCircle className="w-4 h-4 text-sky-700 stroke-[3]" />
            <span>Ajuda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
