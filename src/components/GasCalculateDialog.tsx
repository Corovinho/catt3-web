import React, { useState } from 'react';
import { UnitSystem } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { Check, X, HelpCircle } from 'lucide-react';
import { GAS_CATALOG } from '../engine/idealGases';

interface GasCalculateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unitSystem: UnitSystem;
  substanceId: string;
  setSubstanceId: (id: string) => void;
  onCalculate: (data: {
    gasId: string;
    temperatureC: number;
    pressureBar: number;
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
  const [valT, setValT] = useState<string>('25'); // °C
  const [valP, setValP] = useState<string>('0.101325'); // MPa default (1 atm)

  if (!isOpen) return null;

  const units = UnitConverter.getUnitLabels(unitSystem);

  const handleOK = () => {
    const tUser = parseFloat(valT);
    if (isNaN(tUser)) return alert('Insira uma temperatura válida.');
    const tC = UnitConverter.toInternalT(tUser, units.T);

    const pUser = parseFloat(valP);
    if (isNaN(pUser) || pUser <= 0) return alert('Insira uma pressão válida (> 0).');
    const pBar = UnitConverter.toInternalP(pUser, units.P) * 10; // MPa -> bar

    onCalculate({
      gasId: substanceId,
      temperatureC: tC,
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
            Propriedades de Gases Ideais (CATT3)
          </span>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400">
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Substance Selector Dropdown */}
        <div className="border border-slate-400 bg-white p-3 space-y-2">
          <label className="block text-[11px] font-bold uppercase text-slate-700">
            Selecione o Gás Ideal
          </label>
          <select
            value={substanceId}
            onChange={(e) => setSubstanceId(e.target.value)}
            className="w-full border border-slate-400 bg-white text-slate-950 px-2 py-1 text-xs font-mono font-bold"
          >
            {Object.values(GAS_CATALOG).map((g) => (
              <option key={g.id} value={g.id}>
                {g.formula} - {g.name} (M = {g.M} kg/kmol)
              </option>
            ))}
          </select>
        </div>

        {/* Inputs */}
        <div className="border border-slate-400 bg-white p-3 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="w-32 text-[11px] font-bold text-black">
              Temperatura (T)
            </span>
            <input
              type="number"
              step="any"
              value={valT}
              onChange={(e) => setValT(e.target.value)}
              className="w-28 px-1.5 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
            />
            <span className="w-12 text-[11px] font-mono text-slate-600">{units.T}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="w-32 text-[11px] font-bold text-black">
              Pressão (P)
            </span>
            <input
              type="number"
              step="any"
              value={valP}
              onChange={(e) => setValP(e.target.value)}
              className="w-28 px-1.5 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
            />
            <span className="w-12 text-[11px] font-mono text-slate-600">{units.P}</span>
          </div>
        </div>

        {/* Action Buttons */}
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
            onClick={() => alert('Na aba de Gases Ideais do CATT3, são calculadas as funções termodinâmicas (Entalpia h, Energia u, Entropia s e s°) em base molar e base mássica com calores específicos dependentes da temperatura.')}
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
