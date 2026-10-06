import React, { useState } from 'react';
import { UnitSystem } from '../types/thermo';
import { Check, X, HelpCircle } from 'lucide-react';

interface UnitsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnitSystem: UnitSystem;
  onSelectUnitSystem: (system: UnitSystem) => void;
}

export const UnitsDialog: React.FC<UnitsDialogProps> = ({
  isOpen,
  onClose,
  currentUnitSystem,
  onSelectUnitSystem,
}) => {
  const [selected, setSelected] = useState<UnitSystem>(currentUnitSystem);

  if (!isOpen) return null;

  const handleOK = () => {
    onSelectUnitSystem(selected);
    onClose();
  };

  const rows: { id: UnitSystem; num: number; T: string; P: string; V: string; UH: string; S: string }[] = [
    { id: 'SI', num: 1, T: 'C', P: 'MPa', V: 'm3/kg', UH: 'kJ/kg', S: 'kJ/kg/K' },
    { id: 'SI_MOLE', num: 2, T: 'K', P: 'MPa', V: 'dm3/mol', UH: 'kJ/kmol', S: 'kJ/kmol/K' },
    { id: 'BRITISH', num: 3, T: 'F', P: 'psia', V: 'ft3/lbm', UH: 'Btu/lbm', S: 'Btu/lbm/R' },
    { id: 'BRITISH_MOLE', num: 4, T: 'R', P: 'psia', V: 'ft3/lbmol', UH: 'Btu/lbmol', S: 'Btu/lbmol/R' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs font-mono">
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-lg w-full p-4 shadow-2xl text-slate-900 space-y-4">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2">
          <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
            Units
          </span>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400">
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Units Matrix matching Image 2 */}
        <div className="border border-slate-400 bg-white p-3 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-300 text-blue-700 font-bold">
                <th className="py-1 px-2 w-16"></th>
                <th className="py-1 px-2">T</th>
                <th className="py-1 px-2">P</th>
                <th className="py-1 px-2">V</th>
                <th className="py-1 px-2">U/H</th>
                <th className="py-1 px-2">S</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r.id)}
                  className={`cursor-pointer hover:bg-slate-100 transition-colors ${
                    selected === r.id ? 'bg-slate-100 font-bold' : ''
                  }`}
                >
                  <td className="py-2 px-2 flex items-center gap-2">
                    <span className="text-slate-900 font-mono">{r.num}.</span>
                    <input
                      type="radio"
                      name="unitRow"
                      checked={selected === r.id}
                      onChange={() => setSelected(r.id)}
                      className="accent-black w-3.5 h-3.5 cursor-pointer"
                    />
                  </td>
                  <td className="py-2 px-2 text-slate-900">{r.T}</td>
                  <td className="py-2 px-2 text-slate-900 font-semibold">{r.P}</td>
                  <td className="py-2 px-2 text-slate-900">{r.V}</td>
                  <td className="py-2 px-2 text-slate-900">{r.UH}</td>
                  <td className="py-2 px-2 text-slate-900">{r.S}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons matching Image 2: OK, Cancel, Help */}
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
            <span>Cancel</span>
          </button>

          <button
            onClick={() => alert('Selecione uma das 4 linhas de unidades pré-definidas do CATT3.')}
            className="px-4 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border-2 border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <HelpCircle className="w-4 h-4 text-sky-700 stroke-[3]" />
            <span>Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};
