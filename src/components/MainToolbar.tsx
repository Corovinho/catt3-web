import React, { useState, useRef, useEffect } from 'react';
import {
  Calculator,
  Settings,
  Sparkles,
  PlusCircle,
  Trash2,
  Layers,
  Printer,
  ChevronDown,
  Check,
} from 'lucide-react';
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
  onPrint?: () => void;
  onExportCSV?: () => void;
  onCopyTable?: () => void;
  onOpenAbout?: () => void;
  onClearProcessCurves?: () => void;
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
  onPrint,
  onExportCSV,
  onCopyTable,
  onOpenAbout,
  onClearProcessCurves,
}) => {
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'tables' | 'options' | 'log' | 'help' | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const isFluid = category === 'WATER' || category === 'REFRIGERANTS' || category === 'CRYOGENICS';

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menu: 'file' | 'edit' | 'tables' | 'options' | 'log' | 'help') => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const closeMenu = () => setActiveMenu(null);

  return (
    <div ref={menuBarRef} className="border-b border-slate-300 bg-[#f5f5f5] font-mono select-none">
      {/* =========================================================================
          1. TOP WINDOWS DESKTOP MENU BAR (Arquivo, Editar, Tabelas, Opções, Log, Ajuda)
         ========================================================================= */}
      <div className="flex items-center gap-1 sm:gap-2 px-2 py-0.5 text-xs border-b border-slate-300 text-slate-800 bg-white">
        {/* Menu: Arquivo (File) */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('file')}
            className={`px-2 py-0.5 rounded-none cursor-pointer ${
              activeMenu === 'file' ? 'bg-[#0078d7] text-white' : 'hover:bg-slate-200 text-slate-900'
            }`}
          >
            Arquivo
          </button>
          {activeMenu === 'file' && (
            <div className="absolute top-full left-0 z-50 bg-[#f0f0f0] border border-[#7a7a7a] shadow-xl text-slate-900 text-[12px] py-1 min-w-[190px]">
              <button
                onClick={() => { closeMenu(); onPrint?.(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white flex items-center justify-between"
              >
                <span>Imprimir Relatório...</span>
                <span className="text-[10px] opacity-70">Ctrl+P</span>
              </button>
              <button
                onClick={() => { closeMenu(); onExportCSV?.(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white flex items-center justify-between"
              >
                <span>Exportar CSV...</span>
              </button>
              <div className="my-1 border-t border-slate-300"></div>
              <button
                onClick={() => { closeMenu(); onClearLog(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white"
              >
                Limpar Histórico
              </button>
            </div>
          )}
        </div>

        {/* Menu: Editar (Edit) */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('edit')}
            className={`px-2 py-0.5 rounded-none cursor-pointer ${
              activeMenu === 'edit' ? 'bg-[#0078d7] text-white' : 'hover:bg-slate-200 text-slate-900'
            }`}
          >
            Editar
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute top-full left-0 z-50 bg-[#f0f0f0] border border-[#7a7a7a] shadow-xl text-slate-900 text-[12px] py-1 min-w-[190px]">
              <button
                onClick={() => { closeMenu(); onCopyTable?.(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white flex items-center justify-between"
              >
                <span>Copiar Tabela</span>
                <span className="text-[10px] opacity-70">Ctrl+C</span>
              </button>
              <button
                onClick={() => { closeMenu(); onClearLog(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white"
              >
                Limpar Todos os Estados
              </button>
            </div>
          )}
        </div>

        {/* Menu: Tabelas / Substâncias (Tables/Substances) */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('tables')}
            className={`px-2 py-0.5 font-bold cursor-pointer ${
              activeMenu === 'tables' ? 'bg-[#0078d7] text-white' : 'hover:bg-slate-200 text-slate-900'
            }`}
          >
            Tabelas / Substâncias
          </button>

          <Catt3DesktopMenu
            isOpen={activeMenu === 'tables'}
            onClose={() => setActiveMenu(null)}
            currentCategory={category}
            currentSubstanceId={substanceId}
            onSelect={(cat, sub) => {
              onSelectCategory(cat, sub);
              closeMenu();
            }}
          />
        </div>

        {/* Menu: Opções (Options) */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('options')}
            className={`px-2 py-0.5 rounded-none cursor-pointer ${
              activeMenu === 'options' ? 'bg-[#0078d7] text-white' : 'hover:bg-slate-200 text-slate-900'
            }`}
          >
            Opções
          </button>
          {activeMenu === 'options' && (
            <div className="absolute top-full left-0 z-50 bg-[#f0f0f0] border border-[#7a7a7a] shadow-xl text-slate-900 text-[12px] py-1 min-w-[210px]">
              <button
                onClick={() => { closeMenu(); onOpenCalculate(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white flex items-center justify-between"
              >
                <span>Calcular Propriedades...</span>
              </button>
              <button
                onClick={() => { closeMenu(); onOpenUnits(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white"
              >
                Alterar Unidades...
              </button>

              {isFluid && (
                <>
                  <div className="my-1 border-t border-slate-300"></div>
                  <button
                    onClick={() => { closeMenu(); setCalcMode('GENERAL'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white flex items-center justify-between"
                  >
                    <span>Modo Prop. Gerais</span>
                    {calcMode === 'GENERAL' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                  <button
                    onClick={() => { closeMenu(); setCalcMode('SATURATION'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white flex items-center justify-between"
                  >
                    <span>Modo Prop. Saturação</span>
                    {calcMode === 'SATURATION' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                  <div className="my-1 border-t border-slate-300"></div>
                  <button
                    onClick={() => { closeMenu(); setDiagramType('Ts'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white flex items-center justify-between"
                  >
                    <span>Gráfico T - s</span>
                    {diagramType === 'Ts' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                  <button
                    onClick={() => { closeMenu(); setDiagramType('Pv'); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white flex items-center justify-between"
                  >
                    <span>Gráfico P - v</span>
                    {diagramType === 'Pv' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                </>
              )}

              <div className="my-1 border-t border-slate-300"></div>
              <button
                onClick={() => { closeMenu(); onOpenProcess(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white"
              >
                Traçar Processo (Plot Process)...
              </button>
              {onClearProcessCurves && (
                <button
                  onClick={() => { closeMenu(); onClearProcessCurves(); }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white text-rose-700 hover:text-white"
                >
                  Limpar Processos Traçados
                </button>
              )}
            </div>
          )}
        </div>

        {/* Menu: Log */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('log')}
            className={`px-2 py-0.5 rounded-none cursor-pointer ${
              activeMenu === 'log' ? 'bg-[#0078d7] text-white' : 'hover:bg-slate-200 text-slate-900'
            }`}
          >
            Log
          </button>
          {activeMenu === 'log' && (
            <div className="absolute top-full left-0 z-50 bg-[#f0f0f0] border border-[#7a7a7a] shadow-xl text-slate-900 text-[12px] py-1 min-w-[170px]">
              <button
                onClick={() => { closeMenu(); onCopyTable?.(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white"
              >
                Copiar
              </button>
              <button
                onClick={() => { closeMenu(); onExportCSV?.(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white"
              >
                Exportar CSV...
              </button>
              <div className="my-1 border-t border-slate-300"></div>
              <button
                onClick={() => { closeMenu(); onClearLog(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white"
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        {/* Menu: Ajuda (Help) */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            className={`px-2 py-0.5 rounded-none cursor-pointer ${
              activeMenu === 'help' ? 'bg-[#0078d7] text-white' : 'hover:bg-slate-200 text-slate-900'
            }`}
          >
            Ajuda
          </button>
          {activeMenu === 'help' && (
            <div className="absolute top-full left-0 z-50 bg-[#f0f0f0] border border-[#7a7a7a] shadow-xl text-slate-900 text-[12px] py-1 min-w-[200px]">
              <button
                onClick={() => { closeMenu(); onOpenAbout?.(); }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white"
              >
                Sobre o CATT3...
              </button>
              <button
                onClick={() => {
                  closeMenu();
                  alert(
                    'Instruções de Uso do CATT3:\n1. Selecione a substância desejada no menu "Tabelas / Substâncias" ou nas abas inferiores.\n2. Clique em "Calcular" para abrir o diálogo de propriedades e inserir as variáveis conhecidas.\n3. O estado será plotado no diagrama (T-s ou P-v) e registrado na tabela de histórico abaixo.\n4. Utilize "Processo" para traçar transformações termodinâmicas (isotérmica, isobárica, politrópica, etc.).'
                  );
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#0078d7] hover:text-white"
              >
                Como Usar o Aplicativo
              </button>
            </div>
          )}
        </div>

        {/* Active Substance & Mode Badge */}
        <div className="ml-auto flex items-center gap-2">
          {isFluid && (
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 border border-slate-300 font-bold uppercase">
              Modo: {calcMode === 'GENERAL' ? 'Geral' : 'Saturação'}
            </span>
          )}
          <span className="text-[11px] text-slate-900 font-bold uppercase truncate max-w-[200px] sm:max-w-xs">
            {activeSubstanceName}
          </span>
        </div>
      </div>

      {/* =========================================================================
          2. AUTHENTIC CATT3 TOOLBAR ICONS (Geral, Saturação, T-s, P-v, Calc, Unidades, Processo, Imprimir)
         ========================================================================= */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ebebeb] text-slate-800 flex-wrap">
        {/* Calculation Modes (General vs Saturation) */}
        {isFluid && (
          <div className="flex items-center border border-slate-400 bg-white p-0.5 text-xs mr-1">
            <button
              onClick={() => setCalcMode('GENERAL')}
              className={`px-2 py-1 text-[11px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer ${
                calcMode === 'GENERAL' ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Modo Propriedades Gerais (qualquer região termodinâmica)"
            >
              <span>Geral</span>
            </button>
            <button
              onClick={() => setCalcMode('SATURATION')}
              className={`px-2 py-1 text-[11px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer ${
                calcMode === 'SATURATION' ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Modo Propriedades de Saturação (região bifásica / domo)"
            >
              <span>Saturação</span>
            </button>
          </div>
        )}

        {/* Diagram Mode toggle (only for Fluids) */}
        {isFluid && (
          <div className="flex items-center border border-slate-400 bg-white p-0.5 text-xs mr-1">
            <button
              onClick={() => setDiagramType('Ts')}
              className={`px-2 py-1 cursor-pointer font-bold ${
                diagramType === 'Ts' ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Diagrama T - s"
            >
              T-s
            </button>
            <button
              onClick={() => setDiagramType('Pv')}
              className={`px-2 py-1 cursor-pointer font-bold ${
                diagramType === 'Pv' ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Diagrama P - v"
            >
              P-v
            </button>
          </div>
        )}

        {/* Calculate button (Calculator icon) */}
        <button
          onClick={onOpenCalculate}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
          title="Calcular Propriedades da Substância Ativa"
        >
          <Calculator className="w-4 h-4 text-black" />
          <span>Calcular</span>
        </button>

        {/* Tables / Substances quick button */}
        <button
          onClick={() => handleMenuClick('tables')}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
          title="Menu de Substâncias e Tabelas"
        >
          <Layers className="w-4 h-4 text-black" />
          <span>Substâncias</span>
        </button>

        {/* Units button */}
        <button
          onClick={onOpenUnits}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
          title="Configurar Sistema de Unidades"
        >
          <Settings className="w-4 h-4 text-black" />
          <span>Unidades</span>
        </button>

        {/* Process Plotter button */}
        <button
          onClick={onOpenProcess}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer text-indigo-900"
          title="Traçar Processo Termodinâmico no Diagrama (Plot Process)"
        >
          <Sparkles className="w-4 h-4 text-indigo-700" />
          <span>Processo</span>
        </button>

        {/* Print Report button */}
        {onPrint && (
          <button
            onClick={onPrint}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
            title="Imprimir Relatório de Estados e Cálculos"
          >
            <Printer className="w-4 h-4 text-black" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
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
          title="Limpar tabela de histórico"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      </div>
    </div>
  );
};
