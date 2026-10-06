import React from 'react';
import { SubstanceCategory } from '../types/thermo';
import { Droplet, Snowflake, Wind, Flame, BarChart2, CloudRain } from 'lucide-react';

interface SubstanceSelectorProps {
  category: SubstanceCategory;
  setCategory: (c: SubstanceCategory) => void;
  substanceId: string;
  setSubstanceId: (id: string) => void;
}

export const SubstanceSelector: React.FC<SubstanceSelectorProps> = ({
  category,
  setCategory,
  substanceId,
  setSubstanceId,
}) => {
  const categories: { id: SubstanceCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'WATER', label: 'Água / Vapor', icon: <Droplet className="w-3.5 h-3.5" /> },
    { id: 'REFRIGERANTS', label: 'Refrigerantes', icon: <Snowflake className="w-3.5 h-3.5" /> },
    { id: 'CRYOGENICS', label: 'Criogenia', icon: <Snowflake className="w-3.5 h-3.5" /> },
    { id: 'AIR', label: 'Tabela de Ar', icon: <Wind className="w-3.5 h-3.5" /> },
    { id: 'IDEAL_GASES', label: 'Gases Ideais', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'COMPRESSIBILITY', label: 'Compressibilidade (Z)', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: 'PSYCHROMETRICS', label: 'Psicrometria', icon: <CloudRain className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-2">
      {/* Scrollable category pills for mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((c) => {
          const isSelected = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                if (c.id === 'WATER') setSubstanceId('water');
                else if (c.id === 'REFRIGERANTS') setSubstanceId('r134a');
                else if (c.id === 'CRYOGENICS') setSubstanceId('nh3');
                else if (c.id === 'AIR') setSubstanceId('air');
                else if (c.id === 'IDEAL_GASES') setSubstanceId('co2');
                else if (c.id === 'COMPRESSIBILITY') setSubstanceId('compressibility');
                else if (c.id === 'PSYCHROMETRICS') setSubstanceId('psychrometrics');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border font-medium ${
                isSelected
                  ? 'bg-sky-500/10 border-sky-500/50 text-sky-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-substance picker if Refrigerants or Ideal Gases */}
      {category === 'REFRIGERANTS' && (
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Fluido:</span>
          <select
            value={substanceId}
            onChange={(e) => setSubstanceId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="r134a">R-134a (Tetrafluoroetano)</option>
            <option value="r22">R-22 (Clorodifluorometano)</option>
          </select>
        </div>
      )}

      {category === 'IDEAL_GASES' && (
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Gás:</span>
          <select
            value={substanceId}
            onChange={(e) => setSubstanceId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="co2">CO₂ (Dióxido de Carbono)</option>
            <option value="co">CO (Monóxido de Carbono)</option>
            <option value="n2">N₂ (Nitrogênio)</option>
            <option value="o2">O₂ (Oxigênio)</option>
            <option value="h2">H₂ (Hidrogênio)</option>
            <option value="h2o_gas">H₂O (Vapor Gás Ideal)</option>
            <option value="ch4">CH₄ (Metano)</option>
            <option value="no">NO (Monóxido de Nitrogênio)</option>
            <option value="no2">NO₂ (Dióxido de Nitrogênio)</option>
          </select>
        </div>
      )}
    </div>
  );
};
