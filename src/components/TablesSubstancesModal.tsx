import React from 'react';
import { SubstanceCategory } from '../types/thermo';
import { X, Droplets, Wind, Flame, Gauge, CloudRain, Cpu } from 'lucide-react';
import { REFRIGERANTS_LIST, CRYOGENICS_LIST, IDEAL_GASES_LIST } from './BottomTabs';

interface TablesSubstancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategory: SubstanceCategory;
  currentSubstanceId: string;
  onSelect: (category: SubstanceCategory, substanceId: string) => void;
}

export const TablesSubstancesModal: React.FC<TablesSubstancesModalProps> = ({
  isOpen,
  onClose,
  currentCategory,
  currentSubstanceId,
  onSelect,
}) => {
  if (!isOpen) return null;

  const categories = [
    {
      id: 'WATER' as SubstanceCategory,
      title: '1. Água e Vapor (Water & Steam)',
      icon: Droplets,
      description: 'Propriedades termodinâmicas da água de alta precisão (IAPWS-IF97). Regiões de líquido comprimido, mistura saturada e vapor superaquecido.',
      substances: [{ id: 'water', name: 'Água / Vapor d\'Água (H₂O)' }],
    },
    {
      id: 'REFRIGERANTS' as SubstanceCategory,
      title: '2. Fluidos Refrigerantes (Refrigerants - 20 Substâncias)',
      icon: Wind,
      description: 'Fluidos e misturas azeotrópicas e zeotrópicas para ciclos de refrigeração e bombas de calor.',
      substances: REFRIGERANTS_LIST.map((r) => ({ id: r.id, name: r.label })),
    },
    {
      id: 'CRYOGENICS' as SubstanceCategory,
      title: '3. Fluidos Criogênicos (Cryogenics - 11 Substâncias)',
      icon: Cpu,
      description: 'Fluidos e gases liquefeitos em temperaturas ultrabaixas para criogenia.',
      substances: CRYOGENICS_LIST.map((c) => ({ id: c.id, name: c.label })),
    },
    {
      id: 'AIR' as SubstanceCategory,
      title: '4. Tabela de Ar (Air Tables)',
      icon: Wind,
      description: 'Propriedades do ar como gás ideal com calores específicos variáveis dependentes da temperatura (Tabela A-17 / A-22).',
      substances: [{ id: 'air', name: 'Ar Atmosférico Padrão' }],
    },
    {
      id: 'IDEAL_GASES' as SubstanceCategory,
      title: '5. Gases Ideais (Ideal Gases - 12 Substâncias)',
      icon: Flame,
      description: 'Termodinâmica de gases ideais com calores específicos variáveis calculados por polinômios de Shomate / NIST.',
      substances: IDEAL_GASES_LIST.map((g) => ({ id: g.id, name: g.label })),
    },
    {
      id: 'COMPRESSIBILITY' as SubstanceCategory,
      title: '6. Fator de Compressibilidade (Compressibility)',
      icon: Gauge,
      description: 'Carta e equações generalizadas de compressibilidade (Nelson-Obert / Lee-Kesler / Pitzer) para gases reais.',
      substances: [{ id: 'compressibility', name: 'Gráfico e Fator Z Generalizado (Tr, Pr, ω)' }],
    },
    {
      id: 'PSYCHROMETRICS' as SubstanceCategory,
      title: '7. Psicrometria (Psychrometrics)',
      icon: CloudRain,
      description: 'Propriedades do ar úmido e carta psicrométrica para condicionamento de ar, climatização e secagem.',
      substances: [{ id: 'psychrometrics', name: 'Carta Psicrométrica (Ar Úmido)' }],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs font-mono">
      <div className="bg-white border-2 border-slate-900 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-300 px-4 py-3 bg-[#e8e8e8]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
              Menu de Tabelas e Substâncias (CATT3)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-300 border border-slate-400 text-slate-800"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: List of Categories & Sub-options */}
        <div className="p-4 overflow-y-auto space-y-4 divide-y divide-slate-200">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isCatActive = currentCategory === cat.id;

            return (
              <div key={cat.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-800" />
                  <h4 className="font-bold text-xs uppercase text-slate-950">
                    {cat.title}
                  </h4>
                  {isCatActive && (
                    <span className="text-[10px] bg-black text-white px-1.5 py-0.2 uppercase font-bold">
                      Aba Ativa
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {cat.description}
                </p>

                {/* Substances Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.substances.map((sub) => {
                    const isSelected = isCatActive && currentSubstanceId === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          onSelect(cat.id, sub.id);
                          onClose();
                        }}
                        className={`px-2.5 py-1 text-xs border transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-black text-white border-black font-bold shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-300 p-3 bg-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-400 hover:bg-slate-200 text-xs font-bold uppercase shadow-2xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
