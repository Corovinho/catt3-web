import React, { useState } from 'react';
import { ProcessType, ThermodynamicState } from '../types/thermo';
import { ProcessPlotter, ProcessResult } from '../engine/processPlotter';
import { X, Sparkles, PlusCircle } from 'lucide-react';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: ThermodynamicState | null;
  onAddState: (st: ThermodynamicState) => void;
}

export const ProcessModal: React.FC<ProcessModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onAddState,
}) => {
  const [processType, setProcessType] = useState<ProcessType>('ISENTROPIC');
  const [targetVal, setTargetVal] = useState<string>('1');
  const [result, setResult] = useState<ProcessResult | null>(null);

  if (!isOpen || !currentState) return null;

  const handleRunProcess = () => {
    const val = parseFloat(targetVal);
    if (isNaN(val)) return;
    try {
      const res = ProcessPlotter.calculateProcess(currentState, processType, val);
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular processo');
    }
  };

  const handleAddFinalState = () => {
    if (!result) return;
    onAddState({
      ...result.finalState,
      label: `Processo ${processType}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-900 max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-xl font-mono">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            <h3 className="font-bold text-slate-950 text-sm uppercase">Traçar Processo Termodinâmico</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* State 1 summary */}
        <div className="bg-slate-50 p-2.5 border border-slate-300 text-xs font-mono">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Estado Inicial (1):</span>
          <div className="flex items-center justify-between text-slate-900 mt-1 font-semibold">
            <span>T₁ = {currentState.T.toFixed(2)} °C</span>
            <span>P₁ = {currentState.P.toFixed(2)} bar</span>
            <span>h₁ = {currentState.h.toFixed(1)} kJ/kg</span>
            <span>s₁ = {currentState.s.toFixed(4)} kJ/kg·K</span>
          </div>
        </div>

        {/* Process Selector */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-700 font-bold uppercase text-[11px]">Tipo de Processo:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'ISENTROPIC', label: 'Isentrópico (s = cte)' },
              { type: 'ISOBARIC', label: 'Isobárico (P = cte)' },
              { type: 'ISOTHERMAL', label: 'Isotérmico (T = cte)' },
            ].map((p) => (
              <button
                key={p.type}
                type="button"
                onClick={() => setProcessType(p.type as ProcessType)}
                className={`p-2 border text-center transition-all text-xs font-mono uppercase ${
                  processType === p.type
                    ? 'bg-black border-black text-white font-bold'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-black'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target value input */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-700 font-bold uppercase text-[11px]">
            {processType === 'ISOBARIC' ? 'Temperatura Final (T₂) [°C]:' : 'Pressão Final (P₂) [bar]:'}
          </label>
          <input
            type="number"
            step="any"
            value={targetVal}
            onChange={(e) => setTargetVal(e.target.value)}
            className="w-full bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-black"
            placeholder="Ex: 2"
          />
        </div>

        <button
          type="button"
          onClick={handleRunProcess}
          className="w-full py-2.5 bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
        >
          <span>Calcular Estado 2 e Trabalho/Calor</span>
        </button>

        {/* Result */}
        {result && (
          <div className="bg-slate-50 p-3 border border-slate-300 space-y-2 text-xs font-mono">
            <span className="text-black block font-bold uppercase">Estado Final (2) Calculado:</span>
            <div className="grid grid-cols-2 gap-2 text-slate-800 text-[11px]">
              <div>T₂ = {result.finalState.T.toFixed(2)} °C</div>
              <div>P₂ = {result.finalState.P.toFixed(2)} bar</div>
              <div>h₂ = {result.finalState.h.toFixed(2)} kJ/kg</div>
              <div>s₂ = {result.finalState.s.toFixed(4)} kJ/kg·K</div>
            </div>

            <div className="border-t border-slate-300 pt-2 grid grid-cols-2 gap-2 font-mono">
              <div className="bg-white p-2 border border-slate-300">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Trabalho w (kJ/kg):</span>
                <span className="text-black font-bold text-sm">{result.work.toFixed(2)}</span>
              </div>
              <div className="bg-white p-2 border border-slate-300">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Calor q (kJ/kg):</span>
                <span className="text-black font-bold text-sm">{result.heat.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddFinalState}
              className="w-full mt-2 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Adicionar Estado 2 ao Histórico</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
