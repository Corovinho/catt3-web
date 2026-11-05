import React, { useState, useEffect } from 'react';
import { UnitSystem } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { Check, X, HelpCircle } from 'lucide-react';

export type InputType =
  | '1_TP'  // 1. T & P
  | '2_TV'  // 2. T & V
  | '3_TU'  // 3. T & U
  | '4_TH'  // 4. T & H
  | '5_TS'  // 5. T & S
  | '6_TX'  // 6. T & X
  | '7_PV'  // 7. P & V
  | '8_PU'  // 8. P & U
  | '9_PH'  // 9. P & H
  | '10_PS' // 10. P & S
  | '11_PX';// 11. P & X

interface GeneralPropertiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unitSystem: UnitSystem;
  initialT?: number;
  initialP?: number;
  initialV?: number;
  initialU?: number;
  initialH?: number;
  initialS?: number;
  onCalculate: (data: {
    inputType: InputType;
    T?: number;
    P?: number;
    v?: number;
    u?: number;
    h?: number;
    s?: number;
    x?: number;
  }) => void;
  substanceName: string;
}

export const GeneralPropertiesDialog: React.FC<GeneralPropertiesDialogProps> = ({
  isOpen,
  onClose,
  unitSystem,
  initialT,
  initialP,
  initialV,
  initialU,
  initialH,
  initialS,
  onCalculate,
  substanceName,
}) => {
  const [inputType, setInputType] = useState<InputType>('1_TP');
  
  const [valT, setValT] = useState<string>('100');
  const [valP, setValP] = useState<string>('0.1');
  const [valV, setValV] = useState<string>('0.5');
  const [valU, setValU] = useState<string>('2000');
  const [valH, setValH] = useState<string>('2675');
  const [valS, setValS] = useState<string>('7.35');
  const [valX, setValX] = useState<string>('1');

  useEffect(() => {
    if (isOpen) {
      if (initialT !== undefined && !isNaN(initialT)) setValT(Number(initialT.toFixed(2)).toString());
      if (initialP !== undefined && !isNaN(initialP)) setValP(Number(initialP.toFixed(4)).toString());
      if (initialV !== undefined && !isNaN(initialV)) setValV(Number(initialV.toFixed(5)).toString());
      if (initialU !== undefined && !isNaN(initialU)) setValU(Number(initialU.toFixed(2)).toString());
      if (initialH !== undefined && !isNaN(initialH)) setValH(Number(initialH.toFixed(2)).toString());
      if (initialS !== undefined && !isNaN(initialS)) setValS(Number(initialS.toFixed(4)).toString());
    }
  }, [isOpen, initialT, initialP, initialV, initialU, initialH, initialS]);

  const units = UnitConverter.getUnitLabels(unitSystem);

  const isTEnabled = inputType === '1_TP' || inputType === '2_TV' || inputType === '3_TU' || inputType === '4_TH' || inputType === '5_TS' || inputType === '6_TX';
  const isPEnabled = inputType === '1_TP' || inputType === '7_PV' || inputType === '8_PU' || inputType === '9_PH' || inputType === '10_PS' || inputType === '11_PX';
  const isVEnabled = inputType === '2_TV' || inputType === '7_PV';
  const isUEnabled = inputType === '3_TU' || inputType === '8_PU';
  const isHEnabled = inputType === '4_TH' || inputType === '9_PH';
  const isSEnabled = inputType === '5_TS' || inputType === '10_PS';
  const isXEnabled = inputType === '6_TX' || inputType === '11_PX';

  const handleOK = () => {
    const payload: any = { inputType };

    if (isTEnabled) {
      const num = parseFloat(valT);
      if (isNaN(num)) return alert('Insira um valor válido para Temperatura.');
      payload.T = num;
    }
    if (isPEnabled) {
      const num = parseFloat(valP);
      if (isNaN(num) || num <= 0) return alert('Insira um valor válido para Pressão (> 0).');
      payload.P = num;
    }
    if (isVEnabled) {
      const num = parseFloat(valV);
      if (isNaN(num) || num <= 0) return alert('Insira um valor válido para Volume Específico (> 0).');
      payload.v = num;
    }
    if (isUEnabled) {
      const num = parseFloat(valU);
      if (isNaN(num)) return alert('Insira um valor válido para Energia Interna Específica.');
      payload.u = num;
    }
    if (isHEnabled) {
      const num = parseFloat(valH);
      if (isNaN(num)) return alert('Insira um valor válido para Entalpia Específica.');
      payload.h = num;
    }
    if (isSEnabled) {
      const num = parseFloat(valS);
      if (isNaN(num)) return alert('Insira um valor válido para Entropia Específica.');
      payload.s = num;
    }
    if (isXEnabled) {
      const num = parseFloat(valX);
      if (isNaN(num) || num < 0 || num > 1) return alert('O Título (x) deve estar entre 0 e 1.');
      payload.x = num;
    }

    onCalculate(payload);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleOK();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs font-mono">
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-lg w-full p-4 shadow-2xl text-slate-900 space-y-4">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2">
          <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
            Propriedades Gerais — {substanceName}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400 cursor-pointer">
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Content: Left Input Type, Right Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Left panel: Input Type */}
          <div className="sm:col-span-5 border border-slate-400 bg-white p-3 space-y-1.5">
            <span className="block font-bold text-[11px] border-b border-slate-300 pb-1 mb-2 uppercase text-slate-700">
              Tipo de Entrada
            </span>
            {[
              { id: '1_TP', label: '1. T e P' },
              { id: '2_TV', label: '2. T e v' },
              { id: '3_TU', label: '3. T e u' },
              { id: '4_TH', label: '4. T e h' },
              { id: '5_TS', label: '5. T e s' },
              { id: '6_TX', label: '6. T e x' },
              { id: '7_PV', label: '7. P e v' },
              { id: '8_PU', label: '8. P e u' },
              { id: '9_PH', label: '9. P e h' },
              { id: '10_PS', label: '10. P e s' },
              { id: '11_PX', label: '11. P e x' },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-slate-100 px-1"
              >
                <input
                  type="radio"
                  name="inputType"
                  value={opt.id}
                  checked={inputType === opt.id}
                  onChange={() => setInputType(opt.id as InputType)}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`font-mono text-xs ${inputType === opt.id ? 'font-bold text-black' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Right panel: Inputs with units */}
          <div className="sm:col-span-7 border border-slate-400 bg-white p-3 space-y-2.5">
            {/* Temperature */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] font-mono ${isTEnabled ? 'font-bold text-black' : 'text-slate-400'}`}>
                Temperatura (T)
              </span>
              <input
                type="number"
                step="any"
                disabled={!isTEnabled}
                value={isTEnabled ? valT : ''}
                onChange={(e) => setValT(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  isTEnabled ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.T}</span>
            </div>

            {/* Pressure */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] font-mono ${isPEnabled ? 'font-bold text-black' : 'text-slate-400'}`}>
                Pressão (P)
              </span>
              <input
                type="number"
                step="any"
                disabled={!isPEnabled}
                value={isPEnabled ? valP : ''}
                onChange={(e) => setValP(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  isPEnabled ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.P}</span>
            </div>

            {/* Specific Volume */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] font-mono ${isVEnabled ? 'font-bold text-black' : 'text-slate-400'}`}>
                Volume Esp. (v)
              </span>
              <input
                type="number"
                step="any"
                disabled={!isVEnabled}
                value={isVEnabled ? valV : ''}
                onChange={(e) => setValV(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  isVEnabled ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.v}</span>
            </div>

            {/* Specific Internal Energy */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] font-mono ${isUEnabled ? 'font-bold text-black' : 'text-slate-400'}`}>
                Energia Int. (u)
              </span>
              <input
                type="number"
                step="any"
                disabled={!isUEnabled}
                value={isUEnabled ? valU : ''}
                onChange={(e) => setValU(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  isUEnabled ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.u}</span>
            </div>

            {/* Specific Enthalpy */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] font-mono ${isHEnabled ? 'font-bold text-black' : 'text-slate-400'}`}>
                Entalpia Esp. (h)
              </span>
              <input
                type="number"
                step="any"
                disabled={!isHEnabled}
                value={isHEnabled ? valH : ''}
                onChange={(e) => setValH(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  isHEnabled ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.h}</span>
            </div>

            {/* Specific Entropy */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] font-mono ${isSEnabled ? 'font-bold text-black' : 'text-slate-400'}`}>
                Entropia Esp. (s)
              </span>
              <input
                type="number"
                step="any"
                disabled={!isSEnabled}
                value={isSEnabled ? valS : ''}
                onChange={(e) => setValS(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  isSEnabled ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.s}</span>
            </div>

            {/* Quality */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] font-mono ${isXEnabled ? 'font-bold text-black' : 'text-slate-400'}`}>
                Título (x)
              </span>
              <input
                type="number"
                step="any"
                min="0"
                max="1"
                disabled={!isXEnabled}
                value={isXEnabled ? valX : ''}
                onChange={(e) => setValX(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  isXEnabled ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[9px] font-mono text-slate-500 whitespace-nowrap">0 &le; x &le; 1</span>
            </div>
          </div>
        </div>

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
            onClick={() => alert('Selecione o par de propriedades independentes à esquerda (opções 1 a 11) e insira os dois valores correspondentes à direita para determinar o estado termodinâmico.')}
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
