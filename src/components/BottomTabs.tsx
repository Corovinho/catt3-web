import React from 'react';
import { SubstanceCategory } from '../types/thermo';

interface BottomTabsProps {
  category: SubstanceCategory;
  substanceId: string;
  onSelectCategory: (category: SubstanceCategory, substanceId?: string) => void;
  statusText?: string;
}

const defaultSubstances: Record<SubstanceCategory, string> = {
  WATER: 'water',
  REFRIGERANTS: 'r134a',
  CRYOGENICS: 'ammonia',
  AIR: 'air',
  IDEAL_GASES: 'co2',
  COMPRESSIBILITY: 'compressibility',
  PSYCHROMETRICS: 'psychrometrics',
};

export const REFRIGERANTS_LIST = [
  { id: 'co2', label: 'CO2 (Dióxido de Carbono - R-744)' },
  { id: 'r11', label: 'R-11 (Triclorofluorometano - CCl₃F)' },
  { id: 'r12', label: 'R-12 (Diclorodifluorometano - CCl₂F₂)' },
  { id: 'r13', label: 'R-13 (Clorotrifluorometano - CClF₃)' },
  { id: 'r14', label: 'R-14 (Tetrafluorometano - CF₄)' },
  { id: 'r21', label: 'R-21 (Diclorofluorometano - CHCl₂F)' },
  { id: 'r22', label: 'R-22 (Clorodifluorometano - CHClF₂)' },
  { id: 'r23', label: 'R-23 (Trifluorometano - CHF₃)' },
  { id: 'r113', label: 'R-113 (Triclorotrifluoroetano - C₂Cl₃F₃)' },
  { id: 'r114', label: 'R-114 (Diclorotetrafluoroetano - C₂Cl₂F₄)' },
  { id: 'r123', label: 'R-123 (Diclorotrifluoroetano - C₂HCl₂F₃)' },
  { id: 'r134a', label: 'R-134a (Tetrafluoroetano - CF₃CH₂F)' },
  { id: 'r152a', label: 'R-152a (Difluoroetano - C₂H₄F₂)' },
  { id: 'r404a', label: 'R-404a (Mistura R-125/143a/134a)' },
  { id: 'r407c', label: 'R-407c (Mistura R-32/125/134a)' },
  { id: 'r410a', label: 'R-410a (Mistura R-32/125)' },
  { id: 'r500', label: 'R-500 (Azeótropo R-12/152a)' },
  { id: 'r502', label: 'R-502 (Azeótropo R-22/115)' },
  { id: 'r507a', label: 'R-507a (Azeótropo R-125/143a)' },
  { id: 'rc318', label: 'R-c318 (Octafluorociclobutano - C₄F₈)' },
];

export const CRYOGENICS_LIST = [
  { id: 'ammonia', label: 'Ammonia (Amônia - NH₃)' },
  { id: 'argon', label: 'Argon (Argônio - Ar)' },
  { id: 'ethane', label: 'Ethane (Etano - C₂H₆)' },
  { id: 'ethylene', label: 'Ethylene (Etileno - C₂H₄)' },
  { id: 'helium', label: 'Helium (Hélio - He)' },
  { id: 'isobutane', label: 'Iso-Butane (Iso-Butano - i-C₄H₁₀)' },
  { id: 'methane', label: 'Methane (Metano - CH₄)' },
  { id: 'neon', label: 'Neon (Neônio - Ne)' },
  { id: 'nitrogen', label: 'Nitrogen (Nitrogênio - N₂)' },
  { id: 'oxygen', label: 'Oxygen (Oxigênio - O₂)' },
  { id: 'propane', label: 'Propane (Propano - C₃H₈)' },
];

export const IDEAL_GASES_LIST = [
  { id: 'co', label: 'CO (Monóxido de Carbono)' },
  { id: 'co2', label: 'CO2 (Dióxido de Carbono)' },
  { id: 'n', label: 'N (Nitrogênio Atômico)' },
  { id: 'n2', label: 'N2 (Nitrogênio Diatômico)' },
  { id: 'no', label: 'NO (Monóxido de Nitrogênio)' },
  { id: 'no2', label: 'NO2 (Dióxido de Nitrogênio)' },
  { id: 'h', label: 'H (Hidrogênio Atômico)' },
  { id: 'h2', label: 'H2 (Hidrogênio Diatômico)' },
  { id: 'h2o', label: 'H2O (Vapor de Água)' },
  { id: 'o', label: 'O (Oxigênio Atômico)' },
  { id: 'o2', label: 'O2 (Oxigênio Diatômico)' },
  { id: 'oh', label: 'OH (Radical Hidroxila)' },
];

export const BottomTabs: React.FC<BottomTabsProps> = ({
  category,
  substanceId,
  onSelectCategory,
  statusText,
}) => {
  const tabs: { id: SubstanceCategory; label: string }[] = [
    { id: 'WATER', label: 'Água / Vapor' },
    { id: 'REFRIGERANTS', label: 'Refrigerantes' },
    { id: 'CRYOGENICS', label: 'Criogênicos' },
    { id: 'AIR', label: 'Ar (Gás Real / A-17)' },
    { id: 'IDEAL_GASES', label: 'Gases Ideais' },
    { id: 'COMPRESSIBILITY', label: 'Compressibilidade (Z)' },
    { id: 'PSYCHROMETRICS', label: 'Psicrometria' },
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
              onClick={() => onSelectCategory(tab.id, defaultSubstances[tab.id])}
              className={`px-3 py-1.5 border-r border-slate-400 text-xs font-mono font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-black text-white border-t-2 border-t-black -mb-px shadow-xs'
                  : 'bg-[#d8d8d8] text-slate-800 hover:bg-white hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-selector for Refrigerants, Cryogenics, or Ideal Gases */}
      {(category === 'REFRIGERANTS' || category === 'CRYOGENICS' || category === 'IDEAL_GASES') && (
        <div className="px-3 py-1 bg-white border-b border-slate-300 flex items-center gap-2 text-xs flex-wrap">
          <span className="text-slate-700 font-bold uppercase text-[10px]">
            {category === 'REFRIGERANTS'
              ? 'Fluido Refrigerante:'
              : category === 'CRYOGENICS'
              ? 'Fluido Criogênico:'
              : 'Gás Ideal:'}
          </span>
          <select
            value={substanceId}
            onChange={(e) => onSelectCategory(category, e.target.value)}
            className="border border-slate-400 px-2 py-0.5 text-xs bg-white text-black font-mono font-bold cursor-pointer max-w-full"
          >
            {category === 'REFRIGERANTS' &&
              REFRIGERANTS_LIST.map((ref) => (
                <option key={ref.id} value={ref.id}>
                  {ref.label}
                </option>
              ))}
            {category === 'CRYOGENICS' &&
              CRYOGENICS_LIST.map((cryo) => (
                <option key={cryo.id} value={cryo.id}>
                  {cryo.label}
                </option>
              ))}
            {category === 'IDEAL_GASES' &&
              IDEAL_GASES_LIST.map((gas) => (
                <option key={gas.id} value={gas.id}>
                  {gas.label}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Bottom Status bar */}
      <div className="px-3 py-1 bg-[#f0f0f0] border-t border-slate-300 text-[11px] text-slate-700 flex items-center justify-between">
        <span>{statusText || 'Pronto para calcular.'}</span>
        <span className="text-slate-500 text-[10px]">CATT3 Padrão &bull; IAPWS-IF97 &bull; NIST</span>
      </div>
    </div>
  );
};
