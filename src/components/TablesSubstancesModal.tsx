import React from 'react';
import { SubstanceCategory } from '../types/thermo';
import { X, Droplets, Wind, Flame, Gauge, CloudRain, Cpu } from 'lucide-react';

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
      title: '2. Fluidos Refrigerantes (Refrigerants)',
      icon: Wind,
      description: 'Gases e fluidos utilizados em ciclos de refrigeração e bombas de calor.',
      substances: [
        { id: 'r134a', name: 'R-134a (Tetrafluoroetano - CF₃CH₂F)' },
        { id: 'r22', name: 'R-22 (Clorodifluorometano - CHClF₂)' },
        { id: 'r12', name: 'R-12 (Diclorodifluorometano - CCl₂F₂)' },
        { id: 'r11', name: 'R-11 (Triclorofluorometano - CCl₃F)' },
        { id: 'nh3', name: 'R-717 (Amônia - NH₃)' },
      ],
    },
    {
      id: 'CRYOGENICS' as SubstanceCategory,
      title: '3. Fluidos Criogênicos (Cryogenics)',
      icon: Cpu,
      description: 'Fluidos em temperaturas ultrabaixas para criogenia e gases liquefeitos.',
      substances: [
        { id: 'nh3', name: 'Amônia Anidra (NH₃)' },
        { id: 'ch4', name: 'Metano Liquefeito (CH₄)' },
        { id: 'n2', name: 'Nitrogênio Líquido (N₂)' },
        { id: 'o2', name: 'Oxigênio Líquido (O₂)' },
        { id: 'h2', name: 'Hidrogênio Criogênico (H₂)' },
      ],
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
      title: '5. Gases Ideais (Ideal Gases)',
      icon: Flame,
      description: 'Termodinâmica de gases ideais com calores específicos variáveis por polinômios de Shomate / NIST.',
      substances: [
        { id: 'co2', name: 'Dióxido de Carbono (CO₂)' },
        { id: 'co', name: 'Monóxido de Carbono (CO)' },
        { id: 'n2', name: 'Nitrogênio (N₂)' },
        { id: 'o2', name: 'Oxigênio (O₂)' },
        { id: 'h2', name: 'Hidrogênio (H₂)' },
        { id: 'h2o_gas', name: 'Vapor d\'Água Gás Ideal (H₂O)' },
        { id: 'ch4', name: 'Metano (CH₄)' },
        { id: 'no', name: 'Monóxido de Nitrogênio (NO)' },
        { id: 'no2', name: 'Dióxido de Nitrogênio (NO₂)' },
      ],
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
      <div className="bg-white border-2 border-slate-900 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
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
                        className={`px-2.5 py-1 text-xs border transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-black text-white border-black font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-200 border-slate-300 text-slate-800'
                        }`}
                      >
                        <span>{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-300 px-4 py-2.5 bg-[#f0f0f0] flex items-center justify-between text-xs text-slate-600">
          <span>Selecione a substância para carregar a aba e suas tabelas dedicadas.</span>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-white hover:bg-slate-100 border border-slate-400 font-bold text-slate-900"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
