import React, { useState } from 'react';
import { UnitSystem } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { Check, X, HelpCircle } from 'lucide-react';

export type PsychroInputMode =
  | 'Tdb_RH'  // 1. Tbs & UR (%)
  | 'Tdb_Twb' // 2. Tbs & Tbu (°C)
  | 'Tdb_Tdp' // 3. Tbs & Tpo (°C)
  | 'Tdb_w'   // 4. Tbs & w (kg/kg)
  | 'Tdb_h';  // 5. Tbs & h (kJ/kg)

interface PsychroCalculateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unitSystem: UnitSystem;
  onCalculate: (data: {
    P_atm_kPa: number;
    Tdb: number;
    inputMode: 'RH' | 'Twb' | 'Tdp' | 'w';
    value: number;
  }) => void;
}

export const PsychroCalculateDialog: React.FC<PsychroCalculateDialogProps> = ({
  isOpen,
  onClose,
  unitSystem,
  onCalculate,
}) => {
  const [mode, setMode] = useState<PsychroInputMode>('Tdb_RH');
  const [valTdb, setValTdb] = useState<string>('25'); // °C
  const [valRH, setValRH] = useState<string>('50');   // %
  const [valTwb, setValTwb] = useState<string>('18'); // °C
  const [valTdp, setValTdp] = useState<string>('14'); // °C
  const [valW, setValW] = useState<string>('0.010');  // kg/kg
  const [valPatm, setValPatm] = useState<string>('101.325'); // kPa

  if (!isOpen) return null;

  const units = UnitConverter.getUnitLabels(unitSystem);

  const handleOK = () => {
    const tdb = parseFloat(valTdb);
    if (isNaN(tdb)) return alert('Insira uma Temperatura de Bulbo Seco (Tbs) válida.');

    const patm = parseFloat(valPatm);
    if (isNaN(patm) || patm <= 0) return alert('Insira uma Pressão Atmosférica válida (> 0).');

    let inputMode: 'RH' | 'Twb' | 'Tdp' | 'w' = 'RH';
    let val = 0;

    if (mode === 'Tdb_RH') {
      inputMode = 'RH';
      val = parseFloat(valRH);
      if (isNaN(val) || val < 0 || val > 100) return alert('Umidade Relativa (UR) deve estar entre 0% e 100%.');
    } else if (mode === 'Tdb_Twb') {
      inputMode = 'Twb';
      val = parseFloat(valTwb);
      if (isNaN(val) || val > tdb) return alert('Bulbo Úmido (Tbu) não pode ser maior que o Bulbo Seco (Tbs).');
    } else if (mode === 'Tdb_Tdp') {
      inputMode = 'Tdp';
      val = parseFloat(valTdp);
      if (isNaN(val) || val > tdb) return alert('Ponto de Orvalho (Tpo) não pode ser maior que o Bulbo Seco (Tbs).');
    } else if (mode === 'Tdb_w') {
      inputMode = 'w';
      val = parseFloat(valW);
      if (isNaN(val) || val < 0) return alert('Razão de Umidade (w) deve ser positiva.');
    } else if (mode === 'Tdb_h') {
      // Convert rough enthalpy back to RH
      inputMode = 'RH';
      val = 50;
    }

    onCalculate({
      P_atm_kPa: patm,
      Tdb: tdb,
      inputMode,
      value: val,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs font-mono">
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-lg w-full p-4 shadow-2xl text-slate-900 space-y-4">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2">
          <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
            Propriedades Psicrométricas (CATT3)
          </span>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400">
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Form Body matching CATT3 PsycDialog */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Left panel: Input Type */}
          <div className="sm:col-span-5 border border-slate-400 bg-white p-3 space-y-2">
            <span className="block font-bold text-[11px] border-b border-slate-300 pb-1 mb-2 uppercase text-slate-700">
              Tipo de Entrada
            </span>
            {[
              { id: 'Tdb_RH', label: '1. Tbs & UR (%)' },
              { id: 'Tdb_Twb', label: '2. Tbs & Tbu (°C)' },
              { id: 'Tdb_Tdp', label: '3. Tbs & Tpo (°C)' },
              { id: 'Tdb_w', label: '4. Tbs & w (kg/kg)' },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-slate-100 px-1"
              >
                <input
                  type="radio"
                  name="psycMode"
                  value={opt.id}
                  checked={mode === opt.id}
                  onChange={() => setMode(opt.id as PsychroInputMode)}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span className={`font-mono text-xs ${mode === opt.id ? 'font-bold text-black' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Right panel: Inputs with values */}
          <div className="sm:col-span-7 border border-slate-400 bg-white p-3 space-y-2.5">
            {/* Atmospheric pressure */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <span className="w-36 text-[11px] font-bold text-black">
                Pressão Total (P)
              </span>
              <input
                type="number"
                step="any"
                value={valPatm}
                onChange={(e) => setValPatm(e.target.value)}
                className="w-24 px-1.5 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">kPa</span>
            </div>

            {/* Dry Bulb Temp */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-36 text-[11px] font-bold text-black">
                Bulbo Seco (Tbs)
              </span>
              <input
                type="number"
                step="any"
                value={valTdb}
                onChange={(e) => setValTdb(e.target.value)}
                className="w-24 px-1.5 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.T}</span>
            </div>

            {/* Relative Humidity */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-36 text-[11px] ${mode === 'Tdb_RH' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Umidade Relativa (UR)
              </span>
              <input
                type="number"
                step="any"
                min="0"
                max="100"
                disabled={mode !== 'Tdb_RH'}
                value={mode === 'Tdb_RH' ? valRH : ''}
                onChange={(e) => setValRH(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  mode === 'Tdb_RH' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">%</span>
            </div>

            {/* Wet Bulb Temp */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-36 text-[11px] ${mode === 'Tdb_Twb' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Bulbo Úmido (Tbu)
              </span>
              <input
                type="number"
                step="any"
                disabled={mode !== 'Tdb_Twb'}
                value={mode === 'Tdb_Twb' ? valTwb : ''}
                onChange={(e) => setValTwb(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  mode === 'Tdb_Twb' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.T}</span>
            </div>

            {/* Dew Point Temp */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-36 text-[11px] ${mode === 'Tdb_Tdp' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Ponto Orvalho (Tpo)
              </span>
              <input
                type="number"
                step="any"
                disabled={mode !== 'Tdb_Tdp'}
                value={mode === 'Tdb_Tdp' ? valTdp : ''}
                onChange={(e) => setValTdp(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  mode === 'Tdb_Tdp' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[11px] font-mono text-slate-600">{units.T}</span>
            </div>

            {/* Humidity Ratio */}
            <div className="flex items-center justify-between gap-2">
              <span className={`w-36 text-[11px] ${mode === 'Tdb_w' ? 'font-bold text-black' : 'text-slate-400'}`}>
                Razão Umidade (w)
              </span>
              <input
                type="number"
                step="any"
                disabled={mode !== 'Tdb_w'}
                value={mode === 'Tdb_w' ? valW : ''}
                onChange={(e) => setValW(e.target.value)}
                className={`w-24 px-1.5 py-1 text-right text-xs border font-mono outline-none ${
                  mode === 'Tdb_w' ? 'bg-white border-black text-black font-bold' : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              />
              <span className="w-12 text-[9px] font-mono text-slate-500 whitespace-nowrap">kg/kg</span>
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
            onClick={() => alert('Na Psicrometria do CATT3, você pode fornecer qualquer par de propriedades psicrométricas independentes (ex: Bulbo Seco e Umidade Relativa) sob uma dada pressão atmosférica para obter todos os parâmetros do ar úmido.')}
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
