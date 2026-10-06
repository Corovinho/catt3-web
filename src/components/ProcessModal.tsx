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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Traçar Processo Termodinâmico</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* State 1 summary */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">Estado Inicial (1):</span>
          <div className="flex items-center justify-between text-slate-300 mt-1">
            <span>T₁ = {currentState.T.toFixed(2)} °C</span>
            <span>P₁ = {currentState.P.toFixed(2)} bar</span>
            <span>h₁ = {currentState.h.toFixed(1)} kJ/kg</span>
            <span>s₁ = {currentState.s.toFixed(4)} kJ/kg·K</span>
          </div>
        </div>

        {/* Process Selector */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-medium">Tipo de Processo:</label>
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
                className={`p-2 rounded-lg border text-center transition-all ${
                  processType === p.type
                    ? 'bg-sky-500/15 border-sky-500 text-sky-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target value input */}
        <div className="space-y-1.5 text-xs">
          <label className="text-slate-300 font-medium">
            {processType === 'ISOBARIC' ? 'Temperatura Final (T₂) [°C]:' : 'Pressão Final (P₂) [bar]:'}
          </label>
          <input
            type="number"
            step="any"
            value={targetVal}
            onChange={(e) => setTargetVal(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500"
            placeholder="Ex: 2"
          />
        </div>

        <button
          type="button"
          onClick={handleRunProcess}
          className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Calcular Estado 2 e Trabalho/Calor</span>
        </button>

        {/* Result */}
        {result && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
            <span className="text-emerald-400 block font-semibold">Estado Final (2) Calculado com Sucesso:</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
              <div>T₂ = {result.finalState.T.toFixed(2)} °C</div>
              <div>P₂ = {result.finalState.P.toFixed(2)} bar</div>
              <div>h₂ = {result.finalState.h.toFixed(2)} kJ/kg</div>
              <div>s₂ = {result.finalState.s.toFixed(4)} kJ/kg·K</div>
            </div>

            <div className="border-t border-slate-800 pt-2 grid grid-cols-2 gap-2 font-mono">
              <div className="bg-slate-900 p-1.5 rounded">
                <span className="text-slate-500 block text-[10px]">Trabalho w (kJ/kg):</span>
                <span className="text-sky-300 font-bold">{result.work.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900 p-1.5 rounded">
                <span className="text-slate-500 block text-[10px]">Calor q (kJ/kg):</span>
                <span className="text-amber-300 font-bold">{result.heat.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddFinalState}
              className="w-full mt-2 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Adicionar Estado 2 ao Histórico de Ciclos</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
