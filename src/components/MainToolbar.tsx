import React from 'react';
import { Calculator, Settings, Sparkles, PlusCircle, Trash2, LineChart, Table } from 'lucide-react';

interface MainToolbarProps {
  onOpenCalculate: () => void;
  onOpenUnits: () => void;
  onOpenProcess: () => void;
  onAddCurrentState: () => void;
  onClearLog: () => void;
  diagramType: 'Ts' | 'Pv';
  setDiagramType: (d: 'Ts' | 'Pv') => void;
  activeSubstanceName: string;
}

export const MainToolbar: React.FC<MainToolbarProps> = ({
  onOpenCalculate,
  onOpenUnits,
  onOpenProcess,
  onAddCurrentState,
  onClearLog,
  diagramType,
  setDiagramType,
  activeSubstanceName,
}) => {
  return (
    <div className="border-b border-slate-300 bg-[#f5f5f5] font-mono select-none">
      {/* Top Menu Bar matching CATT3 */}
      <div className="flex items-center gap-4 px-3 py-1 text-xs border-b border-slate-300 text-slate-800 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={onOpenCalculate} className="hover:bg-slate-200 px-1.5 py-0.5">
            Arquivo
          </button>
          <button onClick={onClearLog} className="hover:bg-slate-200 px-1.5 py-0.5">
            Editar
          </button>
          <button onClick={onOpenCalculate} className="hover:bg-slate-200 px-1.5 py-0.5">
            Tabelas / Substâncias
          </button>
          <button onClick={onOpenUnits} className="hover:bg-slate-200 px-1.5 py-0.5">
            Opções
          </button>
          <button onClick={() => alert('CATT3 Web - Computer-Aided Thermodynamic Tables 3.\nVersão em Português para Termodinâmica de Engenharia.')} className="hover:bg-slate-200 px-1.5 py-0.5">
            Ajuda
          </button>
        </div>
        <div className="ml-auto text-[11px] text-slate-500 font-bold uppercase">
          {activeSubstanceName}
        </div>
      </div>

      {/* Toolbar Icons matching CATT3 */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-[#ebebeb] text-slate-800 flex-wrap">
        {/* Calculate button (Calculator icon) */}
        <button
          onClick={onOpenCalculate}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs"
          title="Calcular Propriedades Gerais"
        >
          <Calculator className="w-4 h-4 text-black" />
          <span>Calcular</span>
        </button>

        {/* Units button */}
        <button
          onClick={onOpenUnits}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs"
          title="Sistema de Unidades"
        >
          <Settings className="w-4 h-4 text-black" />
          <span>Unidades</span>
        </button>

        {/* Process Plotter */}
        <button
          onClick={onOpenProcess}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1.5 text-xs font-bold shadow-2xs"
          title="Traçar Processo Termodinâmico"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Processo</span>
        </button>

        <div className="h-5 w-px bg-slate-400 mx-1"></div>

        {/* Diagram Mode toggle */}
        <div className="flex items-center border border-slate-400 bg-white p-0.5 text-xs">
          <button
            onClick={() => setDiagramType('Ts')}
            className={`px-2 py-0.5 ${diagramType === 'Ts' ? 'bg-black text-white font-bold' : 'text-slate-700'}`}
          >
            T-s
          </button>
          <button
            onClick={() => setDiagramType('Pv')}
            className={`px-2 py-0.5 ${diagramType === 'Pv' ? 'bg-black text-white font-bold' : 'text-slate-700'}`}
          >
            P-v
          </button>
        </div>

        <div className="h-5 w-px bg-slate-400 mx-1"></div>

        {/* Add to log (+) */}
        <button
          onClick={onAddCurrentState}
          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1 text-xs font-bold"
          title="Adicionar estado atual ao log (+)"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">+ Log</span>
        </button>

        {/* Clear log */}
        <button
          onClick={onClearLog}
          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-400 flex items-center gap-1 text-xs font-bold text-rose-700"
          title="Limpar log"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      </div>
    </div>
  );
};
