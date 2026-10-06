import React, { useState } from 'react';
import { Calculator, Settings, Sparkles, PlusCircle, Trash2, Layers } from 'lucide-react';
import { CalcMode, SubstanceCategory } from '../types/thermo';
import { Catt3DesktopMenu } from './Catt3DesktopMenu';

interface MainToolbarProps {
  onOpenCalculate: () => void;
  onOpenUnits: () => void;
  onOpenProcess: () => void;
  onOpenTablesSubstancesModal: () => void;
  onSelectCategory: (category: SubstanceCategory, substanceId?: string) => void;
  onAddCurrentState: () => void;
  onClearLog: () => void;
  diagramType: 'Ts' | 'Pv';
  setDiagramType: (d: 'Ts' | 'Pv') => void;
  calcMode: CalcMode;
  setCalcMode: (m: CalcMode) => void;
  category: SubstanceCategory;
  substanceId: string;
  activeSubstanceName: string;
}

export const MainToolbar: React.FC<MainToolbarProps> = ({
  onOpenCalculate,
  onOpenUnits,
  onOpenProcess,
  onOpenTablesSubstancesModal,
  onSelectCategory,
  onAddCurrentState,
  onClearLog,
  diagramType,
  setDiagramType,
  calcMode,
  setCalcMode,
  category,
  substanceId,
  activeSubstanceName,
}) => {
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const isFluid = category === 'WATER' || category === 'REFRIGERANTS' || category === 'CRYOGENICS';

  return (
    <div className="border-b border-slate-300 bg-[#f5f5f5] font-mono select-none">
      {/* Top Menu Bar matching CATT3 */}
      <div className="flex items-center gap-4 px-3 py-1 text-xs border-b border-slate-300 text-slate-800 bg-white">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onOpenCalculate} className="hover:bg-slate-200 px-1.5 py-0.5">
            Arquivo
          </button>
          <button onClick={onClearLog} className="hover:bg-slate-200 px-1.5 py-0.5">
            Editar
          </button>

          {/* CATT3 Tables / Substances Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDesktopMenuOpen((prev) => !prev)}
              className={`px-1.5 py-0.5 font-bold border transition-none cursor-pointer flex items-center gap-1 ${
                isDesktopMenuOpen
                  ? 'bg-[#0078d7] text-white border-[#0078d7]'
                  : 'hover:bg-slate-200 text-black border-slate-300 bg-slate-50'
              }`}
            >
              <span>Tabelas / Substâncias</span>
            </button>

            <Catt3DesktopMenu
              isOpen={isDesktopMenuOpen}
              onClose={() => setIsDesktopMenuOpen(false)}
              currentCategory={category}
              currentSubstanceId={substanceId}
              onSelect={onSelectCategory}
            />
          </div>

          <button onClick={onOpenUnits} className="hover:bg-slate-200 px-1.5 py-0.5">
            Opções
          </button>
          <button
            onClick={() =>
              alert(
                'CATT3 Web - Computer-Aided Thermodynamic Tables 3.\nVersão completa e fiel para Engenharia Mecânica e Química.\nDesenvolvido com IAPWS-IF97, NIST Shomate e Tabelas de Moran & Shapiro / Çengel.'
              )
            }
            className="hover:bg-slate-200 px-1.5 py-0.5"
          >
            Ajuda
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isFluid && (
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 border border-slate-300 font-bold uppercase">
              Modo: {calcMode === 'GENERAL' ? 'Geral' : 'Saturação'}
            </span>
          )}
          <span className="text-[11px] text-slate-900 font-bold uppercase truncate max-w-[200px] sm:max-w-xs">
            {activeSubstanceName}
          </span>
        </div>
      </div>

      {/* Toolbar Icons matching CATT3 */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ebebeb] text-slate-800 flex-wrap">
        {/* Calculation Modes (General vs Saturation) - Authentic CATT3 feature for fluids */}
        {isFluid && (
          <div className="flex items-center border border-slate-400 bg-white p-0.5 text-xs mr-1">
            <button
              onClick={() => setCalcMode('GENERAL')}
              className={`px-2 py-1 text-[11px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer ${
                calcMode === 'GENERAL' ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Modo Propriedades Gerais (qualquer região termodinâmica)"
            >
              <span>Prop. Gerais</span>
            </button>
            <button
              onClick={() => setCalcMode('SATURATION')}
              className={`px-2 py-1 text-[11px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer ${
                calcMode === 'SATURATION' ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Modo Propriedades de Saturação (região bifásica / domo)"
            >
              <span>Prop. Saturação</span>
            </button>
          </div>
        )}

        {/* Calculate button (Calculator icon) */}
        <button
          onClick={onOpenCalculate}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
          title="Calcular Propriedades da Substância Ativa"
        >
          <Calculator className="w-4 h-4 text-black" />
          <span>Calcular</span>
        </button>

        {/* Tables / Substances quick button - toggles CATT3 desktop menu */}
        <button
          onClick={() => setIsDesktopMenuOpen((prev) => !prev)}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
          title="Menu CATT3 de Substâncias (Água, Refrigerantes, Criogênicos, Ar, Gases, etc.)"
        >
          <Layers className="w-4 h-4 text-black" />
          <span>Substâncias</span>
        </button>

        {/* Units button */}
        <button
          onClick={onOpenUnits}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
          title="Sistema de Unidades"
        >
          <Settings className="w-4 h-4 text-black" />
          <span>Unidades</span>
        </button>

        {/* Process Plotter */}
        <button
          onClick={onOpenProcess}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
          title="Traçar Processo Termodinâmico"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Processo</span>
        </button>

        <div className="h-5 w-px bg-slate-400 mx-1"></div>

        {/* Diagram Mode toggle (only for Fluids) */}
        {isFluid && (
          <div className="flex items-center border border-slate-400 bg-white p-0.5 text-xs">
            <button
              onClick={() => setDiagramType('Ts')}
              className={`px-2 py-0.5 cursor-pointer ${
                diagramType === 'Ts' ? 'bg-black text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              T-s
            </button>
            <button
              onClick={() => setDiagramType('Pv')}
              className={`px-2 py-0.5 cursor-pointer ${
                diagramType === 'Pv' ? 'bg-black text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              P-v
            </button>
          </div>
        )}

        <div className="h-5 w-px bg-slate-400 mx-1"></div>

        {/* Add to log (+) */}
        <button
          onClick={onAddCurrentState}
          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1 text-xs font-bold cursor-pointer"
          title="Adicionar estado atual ao log (+)"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">+ Log</span>
        </button>

        {/* Clear log */}
        <button
          onClick={onClearLog}
          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1 text-xs font-bold text-rose-700 cursor-pointer"
          title="Limpar log"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      </div>
    </div>
  );
};
