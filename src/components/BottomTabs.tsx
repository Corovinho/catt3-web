import React from 'react';
import { SubstanceCategory } from '../types/thermo';

interface BottomTabsProps {
  category: SubstanceCategory;
  setCategory: (c: SubstanceCategory) => void;
  substanceId: string;
  setSubstanceId: (id: string) => void;
  statusText?: string;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({
  category,
  setCategory,
  substanceId,
  setSubstanceId,
  statusText,
}) => {
  const tabs: { id: SubstanceCategory; label: string }[] = [
    { id: 'WATER', label: 'Water' },
    { id: 'REFRIGERANTS', label: 'Refrigerants' },
    { id: 'CRYOGENICS', label: 'Cryogenics' },
    { id: 'AIR', label: 'Air' },
    { id: 'IDEAL_GASES', label: 'Ideal Gases' },
    { id: 'COMPRESSIBILITY', label: 'Compressibility' },
    { id: 'PSYCHROMETRICS', label: 'Psychrometrics' },
  ];

  return (
    <div className="border-t-2 border-slate-900 bg-[#e0e0e0] font-mono select-none">
      {/* Substances Tabs row matching CATT3 bottom tabs */}
      <div className="flex items-center overflow-x-auto no-scrollbar border-b border-slate-400 bg-[#d8d8d8] text-xs">
        {tabs.map((tab) => {
          const isSelected = category === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCategory(tab.id);
                if (tab.id === 'WATER') setSubstanceId('water');
                else if (tab.id === 'REFRIGERANTS') setSubstanceId('r134a');
                else if (tab.id === 'CRYOGENICS') setSubstanceId('nh3');
                else if (tab.id === 'AIR') setSubstanceId('air');
                else if (tab.id === 'IDEAL_GASES') setSubstanceId('co2');
                else if (tab.id === 'COMPRESSIBILITY') setSubstanceId('compressibility');
                else if (tab.id === 'PSYCHROMETRICS') setSubstanceId('psychrometrics');
              }}
              className={`px-3 py-1.5 border-r border-slate-400 text-xs font-mono font-bold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-white text-black border-t-2 border-t-black -mb-px'
                  : 'bg-[#d8d8d8] text-slate-700 hover:bg-[#e8e8e8]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-selector if Refrigerants or Ideal Gases */}
      {(category === 'REFRIGERANTS' || category === 'IDEAL_GASES') && (
        <div className="px-3 py-1 bg-white border-b border-slate-300 flex items-center gap-2 text-xs">
          <span className="text-slate-600 font-bold uppercase text-[10px]">
            {category === 'REFRIGERANTS' ? 'Fluido Refrigerante:' : 'Gás Ideal:'}
          </span>
          <select
            value={substanceId}
            onChange={(e) => setSubstanceId(e.target.value)}
            className="border border-slate-400 px-2 py-0.5 text-xs bg-white text-black font-mono cursor-pointer"
          >
            {category === 'REFRIGERANTS' ? (
              <>
                <option value="r134a">R-134a (Tetrafluoroetano)</option>
                <option value="r22">R-22 (Clorodifluorometano)</option>
              </>
            ) : (
              <>
                <option value="co2">CO₂ (Dióxido de Carbono)</option>
                <option value="co">CO (Monóxido de Carbono)</option>
                <option value="n2">N₂ (Nitrogênio)</option>
                <option value="o2">O₂ (Oxigênio)</option>
                <option value="h2">H₂ (Hidrogênio)</option>
                <option value="h2o_gas">H₂O (Vapor Gás Ideal)</option>
                <option value="ch4">CH₄ (Metano)</option>
                <option value="no">NO (Monóxido de Nitrogênio)</option>
                <option value="no2">NO₂ (Dióxido de Nitrogênio)</option>
              </>
            )}
          </select>
        </div>
      )}

      {/* Bottom Status bar matching Image 3 */}
      <div className="px-3 py-1 bg-[#f0f0f0] border-t border-slate-300 text-[11px] text-slate-700 flex items-center justify-between">
        <span>{statusText || 'Pronto para calcular.'}</span>
        <span className="text-slate-500 text-[10px]">CATT3 Standard &bull; IAPWS-IF97 &bull; NIST</span>
      </div>
    </div>
  );
};
