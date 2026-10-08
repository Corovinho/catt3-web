import React, { useState } from 'react';
import { UnitSystem } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { AirEngine } from '../engine/air';
import { Check, X, HelpCircle } from 'lucide-react';

export type AirInputType = 'T' | 'u' | 'h' | 's0' | 'Pr' | 'vr';

interface AirCalculateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unitSystem: UnitSystem;
  onCalculate: (data: {
    inputType: AirInputType;
    value: number;
    pressureBar: number;
  }) => void;
}

export const AirCalculateDialog: React.FC<AirCalculateDialogProps> = ({
  isOpen,
  onClose,
  unitSystem,
  onCalculate,
}) => {
  const [inputType, setInputType] = useState<AirInputType>('T');
  const [valT, setValT] = useState<string>('25'); // °C
  const [valU, setValU] = useState<string>('213'); // kJ/kg
  const [valH, setValH] = useState<string>('298'); // kJ/kg
  const [valS0, setValS0] = useState<string>('6.863'); // kJ/(kg·K)
  const [valPr, setValPr] = useState<string>('1.09');
  const [valVr, setValVr] = useState<string>('182');
  const [valP, setValP] = useState<string>('0.1'); // MPa default (1 atm ~ 0.1 MPa)

  if (!isOpen) return null;

  const units = UnitConverter.getUnitLabels(unitSystem);

  const handleOK = () => {
    let propVal = 0;
    if (inputType === 'T') {
      const t = parseFloat(valT);
      if (isNaN(t)) return alert('Insira uma temperatura válida.');
      // internal engine expects T in Kelvin for solve(propName, value)
      propVal = UnitConverter.toInternalT(t, units.T) + 273.15;
    } else if (inputType === 'u') {
      const num = parseFloat(valU);
      if (isNaN(num)) return alert('Insira uma energia interna válida.');
      propVal = UnitConverter.toInternalEnergy(num, units.u, AirEngine.MW_AIR);
    } else if (inputType === 'h') {
      const num = parseFloat(valH);
      if (isNaN(num)) return alert('Insira uma entalpia válida.');
      propVal = UnitConverter.toInternalEnergy(num, units.h, AirEngine.MW_AIR);
    } else if (inputType === 's0') {
      const num = parseFloat(valS0);
      if (isNaN(num)) return alert('Insira uma entropia de referência válida.');
      propVal = UnitConverter.toInternalEntropy(num, units.s, AirEngine.MW_AIR);
    } else if (inputType === 'Pr') {
      propVal = parseFloat(valPr);
      if (isNaN(propVal) || propVal <= 0) return alert('Insira um valor válido de Pr (> 0).');
    } else if (inputType === 'vr') {
      propVal = parseFloat(valVr);
      if (isNaN(propVal) || propVal <= 0) return alert('Insira um valor válido de vr (> 0).');
    }

    const pUser = parseFloat(valP);
    if (isNaN(pUser) || pUser <= 0) return alert('Insira uma pressão válida (> 0).');
    // Convert to bar for air engine
    const pBar = UnitConverter.toInternalP(pUser, units.P) * 10; // MPa -> bar

    onCalculate({
      inputType,
      value: propVal,
      pressureBar: pBar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs font-mono">
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-lg w-full p-4 shadow-2xl text-slate-900 space-y-4">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2">
          <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
            Propriedades do Ar (Tabela de Ar CATT3)
          </span>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400">
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Form Body matching CATT3 AirDialog */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Left panel: Input selection */}
          <div className="sm:col-span-5 border border-slate-400 bg-white p-3 space-y-2">
            <span className="block font-bold text-[11px] border-b border-slate-300 pb-1 mb-2 uppercase text-slate-700">
              Tipo de Entrada
            </span>
            {[
              { id: 'T', label: '1. Temperatura' },
              { id: 'u', label: '2. Energia Interna (u)' },
              { id: 'h', label: '3. Entalpia Específica (h)' },
              { id: 's0', label: '4. Entropia de Ref. (s°)' },
              { id: 'Pr', label: '5. Pressão Reduzida (Pr)' },
              { id: 'vr', label: '6. Volume Reduzido (vr)' },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-slate-100 px-1"
              >
                <input
                  type="radio"
                  name="airInputType"
                  value={opt.id}
                  checked={inputType === opt.id}
                  onChange={() => setInputType(opt.id as AirInputType)}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`font-mono text-xs ${inputType === opt.id ? 'font-bold text-black' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Right panel: Inputs with values */}
          <div className="sm:col-span-7 border border-slate-400 bg-white p-3 space-y-2.5">
            {/* Pressure (always present) */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <span className="w-32 text-[11px] font-bold text-black">
                Pressão (P)
              </span>
              <input
                type="number"
                step="any"
                value={valP}
                onChange={(e) => setValP(e.target.value)}
                className="w-24 px-1.5 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.P}</span>
            </div>

            {/* Temperature */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] ${inputType === 'T' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Temperatura
              </span>
              <input
                type="number"
                step="any"
                disabled={inputType !== 'T'}
                value={inputType === 'T' ? valT : ''}
                onChange={(e) => setValT(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  inputType === 'T' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.T}</span>
            </div>

            {/* Internal Energy */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] ${inputType === 'u' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Energia (u)
              </span>
              <input
                type="number"
                step="any"
                disabled={inputType !== 'u'}
                value={inputType === 'u' ? valU : ''}
                onChange={(e) => setValU(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  inputType === 'u' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.u}</span>
            </div>

            {/* Enthalpy */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] ${inputType === 'h' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Entalpia (h)
              </span>
              <input
                type="number"
                step="any"
                disabled={inputType !== 'h'}
                value={inputType === 'h' ? valH : ''}
                onChange={(e) => setValH(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  inputType === 'h' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.h}</span>
            </div>

            {/* Entropy s0 */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] ${inputType === 's0' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Entropia Padrão (s°)
              </span>
              <input
                type="number"
                step="any"
                disabled={inputType !== 's0'}
                value={inputType === 's0' ? valS0 : ''}
                onChange={(e) => setValS0(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  inputType === 's0' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.s}</span>
            </div>

            {/* Pr */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] ${inputType === 'Pr' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Pressão Relativa (Pr)
              </span>
              <input
                type="number"
                step="any"
                disabled={inputType !== 'Pr'}
                value={inputType === 'Pr' ? valPr : ''}
                onChange={(e) => setValPr(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  inputType === 'Pr' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-400">-</span>
            </div>

            {/* vr */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-32 text-[11px] ${inputType === 'vr' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Volume Relativo (vr)
              </span>
              <input
                type="number"
                step="any"
                disabled={inputType !== 'vr'}
                value={inputType === 'vr' ? valVr : ''}
                onChange={(e) => setValVr(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  inputType === 'vr' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-400">-</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
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
            onClick={() => alert('Na Tabela de Ar do CATT3, você pode definir uma propriedade conhecida (Temperatura, Energia, Entalpia, s°, Pr ou vr) junto com a pressão do estado para obter todas as demais propriedades.')}
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
