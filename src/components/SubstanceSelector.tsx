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
      {/* Scrollable category tabs with straight edges */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
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
              className={`flex items-center gap-1.5 px-3 py-1.5 whitespace-nowrap transition-all border text-xs font-mono tracking-tight ${
                isSelected
                  ? 'bg-black border-black text-white font-bold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-black hover:border-slate-400'
              }`}
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-substance picker with straight edges */}
      {category === 'REFRIGERANTS' && (
        <div className="flex items-center gap-2 pt-0.5 text-xs font-mono">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Substância:</span>
          <select
            value={substanceId}
            onChange={(e) => setSubstanceId(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 px-2 py-1 text-xs focus:outline-none focus:border-black cursor-pointer font-mono"
          >
            <option value="r134a">R-134a (Tetrafluoroetano)</option>
            <option value="r22">R-22 (Clorodifluorometano)</option>
          </select>
        </div>
      )}

      {category === 'IDEAL_GASES' && (
        <div className="flex items-center gap-2 pt-0.5 text-xs font-mono">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Gás:</span>
          <select
            value={substanceId}
            onChange={(e) => setSubstanceId(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 px-2 py-1 text-xs focus:outline-none focus:border-black cursor-pointer font-mono"
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
