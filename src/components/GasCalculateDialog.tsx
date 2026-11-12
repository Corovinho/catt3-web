import React, { useState, useEffect } from 'react';
import { UnitSystem } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { Check, X, HelpCircle } from 'lucide-react';
import { GAS_CATALOG, IdealGasInputMode } from '../engine/idealGases';
import { IDEAL_GASES_LIST } from './BottomTabs';

interface GasCalculateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unitSystem: UnitSystem;
  substanceId: string;
  setSubstanceId: (id: string) => void;
  onCalculate: (data: {
    gasId: string;
    mode: IdealGasInputMode;
    val1: number;
    val2: number;
  }) => void;
}

export const GasCalculateDialog: React.FC<GasCalculateDialogProps> = ({
  isOpen,
  onClose,
  unitSystem,
  substanceId,
  setSubstanceId,
  onCalculate,
}) => {
  const [mode, setMode] = useState<IdealGasInputMode>('TP');
  const [showHelp, setShowHelp] = useState(false);
  const [valT, setValT] = useState<string>('25');
  const [valP, setValP] = useState<string>('0.101325');
  const [valU, setValU] = useState<string>('-9000');
  const [valH, setValH] = useState<string>('-8900');
  const [valS0, setValS0] = useState<string>('4.85');
  const [valS, setValS] = useState<string>('4.85');
  const [valV, setValV] = useState<string>('0.55');

  const units = UnitConverter.getUnitLabels(unitSystem);
  const activeGas = GAS_CATALOG[substanceId] || GAS_CATALOG['co2'];

  useEffect(() => {
    if (isOpen) {
      const pInit = UnitConverter.fromInternalP(0.101325, units.P);
      setValP(pInit >= 10 ? pInit.toFixed(2) : pInit.toFixed(4));
      const tInit = UnitConverter.fromInternalT(25, units.T);
      setValT(tInit.toFixed(1));
    }
  }, [isOpen, unitSystem, units.P, units.T]);

  const handleOK = () => {
    const M = activeGas.M;
    const needsP = mode !== 'Tv';
    let pBar = 1.01325;

    if (needsP) {
      const pUser = parseFloat(valP);
      if (isNaN(pUser) || pUser <= 0) return alert('Insira uma pressão válida (> 0).');
      pBar = UnitConverter.toInternalP(pUser, units.P) * 10; // MPa -> bar
    }

    if (mode === 'TP') {
      const tUser = parseFloat(valT);
      if (isNaN(tUser)) return alert('Insira uma temperatura válida.');
      const tC = UnitConverter.toInternalT(tUser, units.T);
      onCalculate({ gasId: substanceId, mode, val1: tC, val2: pBar });
    } else if (mode === 'uP') {
      const uUser = parseFloat(valU);
      if (isNaN(uUser)) return alert('Insira uma energia interna válida.');
      const uInt = UnitConverter.toInternalEnergy(uUser, units.u, M);
      onCalculate({ gasId: substanceId, mode, val1: uInt, val2: pBar });
    } else if (mode === 'hP') {
      const hUser = parseFloat(valH);
      if (isNaN(hUser)) return alert('Insira uma entalpia válida.');
      const hInt = UnitConverter.toInternalEnergy(hUser, units.h, M);
      onCalculate({ gasId: substanceId, mode, val1: hInt, val2: pBar });
    } else if (mode === 's0P') {
      const s0User = parseFloat(valS0);
      if (isNaN(s0User)) return alert('Insira uma entropia padrão (s°) válida.');
      const s0Int = UnitConverter.toInternalEntropy(s0User, units.s, M);
      onCalculate({ gasId: substanceId, mode, val1: s0Int, val2: pBar });
    } else if (mode === 'sP') {
      const sUser = parseFloat(valS);
      if (isNaN(sUser)) return alert('Insira uma entropia (s) válida.');
      const sInt = UnitConverter.toInternalEntropy(sUser, units.s, M);
      onCalculate({ gasId: substanceId, mode, val1: sInt, val2: pBar });
    } else if (mode === 'vP') {
      const vUser = parseFloat(valV);
      if (isNaN(vUser) || vUser <= 0) return alert('Insira um volume específico válido (> 0).');
      const vInt = UnitConverter.toInternalV(vUser, units.v, M);
      onCalculate({ gasId: substanceId, mode, val1: vInt, val2: pBar });
    } else if (mode === 'Tv') {
      const tUser = parseFloat(valT);
      if (isNaN(tUser)) return alert('Insira uma temperatura válida.');
      const vUser = parseFloat(valV);
      if (isNaN(vUser) || vUser <= 0) return alert('Insira um volume específico válido (> 0).');
      const tC = UnitConverter.toInternalT(tUser, units.T);
      const vInt = UnitConverter.toInternalV(vUser, units.v, M);
      onCalculate({ gasId: substanceId, mode, val1: tC, val2: vInt });
    }

    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && (e.target as HTMLElement)?.tagName !== 'SELECT') {
        e.preventDefault();
        handleOK();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!isOpen) return null;

  const needsP = mode !== 'Tv';
  const needsT = mode === 'TP' || mode === 'Tv';
  const needsV = mode === 'vP' || mode === 'Tv';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs font-mono">
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-xl w-full p-4 shadow-2xl text-slate-900 space-y-3">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2">
          <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
            Propriedades de Gases Ideais — {activeGas.formula}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400 cursor-pointer">
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Substance Selector Dropdown */}
        <div className="border border-slate-400 bg-white p-2.5 flex items-center justify-between gap-3">
          <label className="text-[11px] font-bold uppercase text-slate-700 whitespace-nowrap">
            Espécie Gasosa:
          </label>
          <select
            value={substanceId === 'h2o_gas' ? 'h2o' : substanceId}
            onChange={(e) => setSubstanceId(e.target.value)}
            className="flex-1 border border-slate-400 bg-white text-slate-950 px-2 py-1 text-xs font-mono font-bold cursor-pointer"
          >
            {IDEAL_GASES_LIST.map((item) => {
              const g = GAS_CATALOG[item.id] || GAS_CATALOG['co2'];
              return (
                <option key={item.id} value={item.id}>
                  {item.label} (M = {g.M} kg/kmol)
                </option>
              );
            })}
          </select>
        </div>

        {/* 2-Column Body matching CATT3 Dialogs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Left panel: Input selection */}
          <div className="sm:col-span-5 border border-slate-400 bg-white p-3 space-y-1.5">
            <span className="block font-bold text-[11px] border-b border-slate-300 pb-1 mb-2 uppercase text-slate-700">
              Tipo de Entrada
            </span>
            {[
              { id: 'TP', label: '1. Temperatura (T) e P' },
              { id: 'uP', label: '2. Energia Int. (u) e P' },
              { id: 'hP', label: '3. Entalpia (h) e P' },
              { id: 's0P', label: '4. Entropia Ref. (s°) e P' },
              { id: 'sP', label: '5. Entropia (s) e P' },
              { id: 'vP', label: '6. Volume Esp. (v) e P' },
              { id: 'Tv', label: '7. Temperatura (T) e v' },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-slate-100 px-1"
              >
                <input
                  type="radio"
                  name="gasInputMode"
                  value={opt.id}
                  checked={mode === opt.id}
                  onChange={() => setMode(opt.id as IdealGasInputMode)}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`font-mono text-[11px] ${mode === opt.id ? 'font-bold text-black' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Right panel: Inputs */}
          <div className="sm:col-span-7 border border-slate-400 bg-white p-3 space-y-2">
            {/* Pressure */}
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
              <span className={`w-36 text-[11px] ${needsP ? 'font-bold text-black' : 'text-slate-400'}`}>
                Pressão (P)
              </span>
              <input
                type="number"
                step="any"
                disabled={!needsP}
                value={needsP ? valP : ''}
                onChange={(e) => setValP(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  needsP ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-16 text-[10px] font-mono text-slate-600">{units.P}</span>
            </div>

            {/* Temperature */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-36 text-[11px] ${needsT ? 'font-bold text-black' : 'text-slate-400'}`}>
                Temperatura (T)
              </span>
              <input
                type="number"
                step="any"
                disabled={!needsT}
                value={needsT ? valT : ''}
                onChange={(e) => setValT(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  needsT ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-16 text-[10px] font-mono text-slate-600">{units.T}</span>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-36 text-[11px] ${needsV ? 'font-bold text-black' : 'text-slate-400'}`}>
                Volume Esp. (v)
              </span>
              <input
                type="number"
                step="any"
                disabled={!needsV}
                value={needsV ? valV : ''}
                onChange={(e) => setValV(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  needsV ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-16 text-[10px] font-mono text-slate-600">{units.v}</span>
            </div>

            {/* Internal Energy */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-36 text-[11px] ${mode === 'uP' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Energia Int. (u)
              </span>
              <input
                type="number"
                step="any"
                disabled={mode !== 'uP'}
                value={mode === 'uP' ? valU : ''}
                onChange={(e) => setValU(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  mode === 'uP' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-16 text-[10px] font-mono text-slate-600">{units.u}</span>
            </div>

            {/* Enthalpy */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-36 text-[11px] ${mode === 'hP' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Entalpia (h)
              </span>
              <input
                type="number"
                step="any"
                disabled={mode !== 'hP'}
                value={mode === 'hP' ? valH : ''}
                onChange={(e) => setValH(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  mode === 'hP' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-16 text-[10px] font-mono text-slate-600">{units.h}</span>
            </div>

            {/* Standard Entropy s0 */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-36 text-[11px] ${mode === 's0P' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Entropia Ref. (s°)
              </span>
              <input
                type="number"
                step="any"
                disabled={mode !== 's0P'}
                value={mode === 's0P' ? valS0 : ''}
                onChange={(e) => setValS0(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  mode === 's0P' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-16 text-[10px] font-mono text-slate-600">{units.s}</span>
            </div>

            {/* Total Entropy s */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-36 text-[11px] ${mode === 'sP' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Entropia (s)
              </span>
              <input
                type="number"
                step="any"
                disabled={mode !== 'sP'}
                value={mode === 'sP' ? valS : ''}
                onChange={(e) => setValS(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  mode === 'sP' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-16 text-[10px] font-mono text-slate-600">{units.s}</span>
            </div>
          </div>
        </div>

        {showHelp && (
          <div className="bg-sky-50 border border-sky-300 p-2.5 text-[11px] text-slate-800 leading-relaxed">
            <strong>Como usar Gases Ideais:</strong> Escolha o gás no topo e selecione um dos <strong>7 pares de entrada</strong> à esquerda (<strong>T e P, u e P, h e P, s° e P, s e P, v e P ou T e v</strong>). O CATT-Web calcula h, u, s, s°, cp, cv e k = cp/cv via polinômios NIST Shomate.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-300">
          <button
            onClick={handleOK}
            className="px-5 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] active:bg-[#c0c0c0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
            <span>OK</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider cursor-pointer"
          >
            <X className="w-4 h-4 text-rose-700 stroke-[3]" />
            <span>Cancelar</span>
          </button>

          <button
            onClick={() => setShowHelp((v) => !v)}
            className="px-4 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-sky-700 stroke-[3]" />
            <span>Ajuda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
