import React, { useState } from 'react';
import { ProcessType, ProcessCurve, ThermodynamicState, UnitSystem } from '../types/thermo';
import { ProcessPlotter } from '../engine/processPlotter';
import { UnitConverter } from '../engine/units';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: ThermodynamicState | null;
  statesLog: ThermodynamicState[];
  unitSystem: UnitSystem;
  onAddProcess: (curve: ProcessCurve) => void;
  onAddStateToLog: (st: ThermodynamicState) => void;
}

const PROCESS_LIST: { type: ProcessType; labelPt: string; formula: string; desc: string }[] = [
  { type: 'ISOTHERMAL', labelPt: 'Temperatura Constante', formula: 'T = cte', desc: 'Processo isotérmico' },
  { type: 'ISOBARIC', labelPt: 'Pressão Constante', formula: 'P = cte', desc: 'Processo isobárico' },
  { type: 'ISOCHORIC', labelPt: 'Volume Específico Constante', formula: 'v = cte', desc: 'Processo isocórico / isovolumétrico' },
  { type: 'ISENTROPIC', labelPt: 'Entropia Específica Constante', formula: 's = cte', desc: 'Processo isentrópico / adiabático reversível' },
  { type: 'ISENERGIC', labelPt: 'Energia Específica Constante', formula: 'u = cte', desc: 'Energia interna específica constante' },
  { type: 'ISENTHALPIC', labelPt: 'Entalpia Específica Constante', formula: 'h = cte', desc: 'Processo isentálpico / estrangulamento' },
  { type: 'PINVERSE_V', labelPt: 'P Inverso em v', formula: 'P · v = cte', desc: 'Pressão inversamente proporcional ao volume' },
  { type: 'POLYTROPIC', labelPt: 'Processo Politrópico', formula: 'P · vⁿ = cte', desc: 'Expansão/compressão com expoente politrópico n' },
  { type: 'LINEAR_PV', labelPt: 'Pressão Linear em Volume', formula: 'P = a + b·v', desc: 'Êmbolo com mola / deformação linear' },
];

export const ProcessModal: React.FC<ProcessModalProps> = ({
  isOpen,
  onClose,
  currentState,
  statesLog,
  unitSystem,
  onAddProcess,
  onAddStateToLog,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedProcess, setSelectedProcess] = useState<ProcessType>('ISENTROPIC');
  const [selectedStateIdx, setSelectedStateIdx] = useState<number>(-1); // -1 = currentState
  const [targetVal, setTargetVal] = useState<string>('0.5'); // default value
  const [polytropicN, setPolytropicN] = useState<string>('1.3');
  const [linearV2, setLinearV2] = useState<string>('0.2');
  const [calculatedCurve, setCalculatedCurve] = useState<ProcessCurve | null>(null);

  if (!isOpen) return null;

  const units = UnitConverter.getUnitLabels(unitSystem);

  // Active state 1
  const state1: ThermodynamicState = selectedStateIdx === -1
    ? (currentState || {
        id: 'default',
        stateNumber: 1,
        timestamp: Date.now(),
        substanceId: 'water',
        substanceName: 'Água / Vapor (H₂O)',
        category: 'WATER',
        mode: 'GENERAL',
        T: 100,
        P: 1.01325,
        P_MPa: 0.101325,
        v: 1.673,
        u: 2506,
        h: 2676,
        s: 7.361,
        phase: 'Saturated Vapor',
      })
    : (statesLog[selectedStateIdx] || currentState!);

  const handleCalculateAndPlot = () => {
    const rawVal = parseFloat(targetVal);
    if (isNaN(rawVal)) {
      alert('Por favor, informe um valor alvo numérico válido.');
      return;
    }

    try {
      let targetProp: 'P' | 'T' | 'v' | 's' | 'h' = 'P';
      let internalTarget = rawVal;

      if (selectedProcess === 'ISOBARIC') {
        targetProp = 'T';
        internalTarget = UnitConverter.toInternalT(rawVal, units.T);
      } else {
        // P in MPa
        targetProp = 'P';
        internalTarget = UnitConverter.toInternalP(rawVal, units.P);
      }

      const nVal = parseFloat(polytropicN) || 1.3;
      const v2Lin = parseFloat(linearV2) || (state1.v * 1.5);

      const curve = ProcessPlotter.calculateProcess({
        state1,
        type: selectedProcess,
        targetProperty: targetProp,
        targetValue: internalTarget,
        polytropicN: nVal,
        targetV2Linear: v2Lin,
      });

      setCalculatedCurve(curve);
      onAddProcess(curve);
      onAddStateToLog({
        ...curve.state2,
        label: `Estado 2 (${curve.label})`,
      });
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular processo termodinâmico.');
    }
  };

  const handleFinish = () => {
    onClose();
    setStep(1);
    setCalculatedCurve(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs font-mono select-none">
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-xl w-full p-4 sm:p-5 shadow-2xl text-slate-900 space-y-4">
        {/* Title Bar matching CATT3 TfPlotProcessWiz */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
              Traçar Processo Termodinâmico (Plot Process)
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400">
            <X className="w-4 h-4 text-slate-800" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-3 gap-1 border-b border-slate-300 pb-2 text-center text-xs">
          <div className={`p-1.5 border font-bold ${step === 1 ? 'bg-black text-white border-black' : 'bg-white border-slate-300 text-slate-600'}`}>
            1. Seleção do Processo
          </div>
          <div className={`p-1.5 border font-bold ${step === 2 ? 'bg-black text-white border-black' : 'bg-white border-slate-300 text-slate-600'}`}>
            2. Estado Inicial (1)
          </div>
          <div className={`p-1.5 border font-bold ${step === 3 ? 'bg-black text-white border-black' : 'bg-white border-slate-300 text-slate-600'}`}>
            3. Estado Final (2)
          </div>
        </div>

        {/* ================= STEP 1: Process Selection ================= */}
        {step === 1 && (
          <div className="border border-slate-400 bg-white p-3 space-y-2 max-h-[320px] overflow-y-auto">
            <span className="block font-bold text-xs uppercase text-slate-700 border-b border-slate-200 pb-1 mb-2">
              Selecione o Tipo de Processo Termodinâmico:
            </span>
            {PROCESS_LIST.map((p, idx) => (
              <label
                key={p.type}
                className={`flex items-center justify-between p-2 border transition-none cursor-pointer ${
                  selectedProcess === p.type
                    ? 'bg-[#0078d7] text-white border-[#0078d7]'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="procSelection"
                    value={p.type}
                    checked={selectedProcess === p.type}
                    onChange={() => setSelectedProcess(p.type)}
                    className="accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-xs">
                      {idx + 1}. {p.labelPt}
                    </span>
                    <span className="block text-[10px] opacity-80">{p.desc}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[11px] font-bold border ${selectedProcess === p.type ? 'bg-white/20 border-white text-white' : 'bg-white border-slate-400 text-slate-800'}`}>
                  {p.formula}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* ================= STEP 2: Initial State ================= */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="border border-slate-400 bg-white p-3 space-y-2">
              <span className="block font-bold text-xs uppercase text-slate-700 border-b border-slate-200 pb-1">
                Escolher Estado Inicial (1):
              </span>
              <select
                value={selectedStateIdx}
                onChange={(e) => setSelectedStateIdx(Number(e.target.value))}
                className="w-full border border-slate-400 bg-white text-slate-900 px-2 py-1.5 text-xs font-mono font-bold"
              >
                <option value={-1}>
                  Estado Ativo Atual ({state1.substanceName})
                </option>
                {statesLog.map((st, i) => (
                  <option key={st.id} value={i}>
                    #{i + 1} - {st.substanceName} | T = {st.T.toFixed(1)}°C, P = {st.P_MPa.toFixed(3)} MPa
                  </option>
                ))}
              </select>
            </div>

            {/* State 1 Properties Summary Card */}
            <div className="border border-slate-400 bg-white p-3 space-y-2">
              <span className="block font-bold text-xs uppercase text-slate-900 border-b border-slate-200 pb-1">
                Propriedades Termodinâmicas do Estado 1:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 p-1.5 border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">Temperatura (T₁)</span>
                  <span className="font-bold text-black">{UnitConverter.fromInternalT(state1.T, units.T).toFixed(2)} {units.T}</span>
                </div>
                <div className="bg-slate-50 p-1.5 border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">Pressão (P₁)</span>
                  <span className="font-bold text-black">{UnitConverter.fromInternalP(state1.P_MPa, units.P).toFixed(4)} {units.P}</span>
                </div>
                <div className="bg-slate-50 p-1.5 border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">Volume Esp. (v₁)</span>
                  <span className="font-bold text-black">{UnitConverter.fromInternalV(state1.v, units.v).toFixed(5)} {units.v}</span>
                </div>
                <div className="bg-slate-50 p-1.5 border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">Entalpia (h₁)</span>
                  <span className="font-bold text-black">{UnitConverter.fromInternalEnergy(state1.h, units.h).toFixed(2)} {units.h}</span>
                </div>
                <div className="bg-slate-50 p-1.5 border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">Entropia (s₁)</span>
                  <span className="font-bold text-black">{UnitConverter.fromInternalEntropy(state1.s, units.s).toFixed(4)} {units.s}</span>
                </div>
                <div className="bg-slate-50 p-1.5 border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">Energia Int. (u₁)</span>
                  <span className="font-bold text-black">{UnitConverter.fromInternalEnergy(state1.u, units.u).toFixed(2)} {units.u}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: Final State & Plot ================= */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="border border-slate-400 bg-white p-3 space-y-3">
              <span className="block font-bold text-xs uppercase text-slate-700 border-b border-slate-200 pb-1">
                Definir Alvo para o Estado Final (2) ({PROCESS_LIST.find((p) => p.type === selectedProcess)?.formula}):
              </span>

              {/* Input for target value */}
              <div className="flex items-center justify-between gap-2">
                <span className="w-56 text-xs font-bold text-slate-900">
                  {selectedProcess === 'ISOBARIC'
                    ? `Temperatura Final (T₂) [${units.T}]:`
                    : `Pressão Final (P₂) [${units.P}]:`}
                </span>
                <input
                  type="number"
                  step="any"
                  value={targetVal}
                  onChange={(e) => setTargetVal(e.target.value)}
                  className="w-32 px-2 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
                  placeholder="Ex: 0.5"
                />
              </div>

              {/* Extra input if Polytropic */}
              {selectedProcess === 'POLYTROPIC' && (
                <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
                  <span className="w-56 text-xs font-bold text-slate-900">
                    Expoente Politrópico (n):
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    value={polytropicN}
                    onChange={(e) => setPolytropicN(e.target.value)}
                    className="w-32 px-2 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
                    placeholder="Ex: 1.3"
                  />
                </div>
              )}

              {/* Extra input if Linear PV */}
              {selectedProcess === 'LINEAR_PV' && (
                <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
                  <span className="w-56 text-xs font-bold text-slate-900">
                    Volume Final (v₂) [{units.v}]:
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={linearV2}
                    onChange={(e) => setLinearV2(e.target.value)}
                    className="w-32 px-2 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
                    placeholder="Ex: 0.2"
                  />
                </div>
              )}
            </div>

            {/* Calculated Results Summary */}
            {calculatedCurve && (
              <div className="border-2 border-emerald-700 bg-emerald-50 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-950 font-bold border-b border-emerald-300 pb-1">
                  <span>✓ Processo Calculado e Traçado no Diagrama!</span>
                  <span>{calculatedCurve.label}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-900">
                  <div>T₂ = <strong>{UnitConverter.fromInternalT(calculatedCurve.state2.T, units.T).toFixed(2)} {units.T}</strong></div>
                  <div>P₂ = <strong>{UnitConverter.fromInternalP(calculatedCurve.state2.P_MPa, units.P).toFixed(4)} {units.P}</strong></div>
                  <div>v₂ = <strong>{UnitConverter.fromInternalV(calculatedCurve.state2.v, units.v).toFixed(5)} {units.v}</strong></div>
                  <div>s₂ = <strong>{UnitConverter.fromInternalEntropy(calculatedCurve.state2.s, units.s).toFixed(4)} {units.s}</strong></div>
                </div>

                <div className="border-t border-emerald-200 pt-2 grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 border border-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Trabalho (w):</span>
                    <span className="text-black font-bold text-sm">{calculatedCurve.work.toFixed(2)} kJ/kg</span>
                  </div>
                  <div className="bg-white p-2 border border-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Calor (q):</span>
                    <span className="text-black font-bold text-sm">{calculatedCurve.heat.toFixed(2)} kJ/kg</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Navigation Buttons matching CATT3 */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-300">
          <button
            onClick={() => setStep((prev) => (Math.max(1, prev - 1) as any))}
            disabled={step === 1}
            className="px-4 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] disabled:opacity-40 border border-slate-600 text-slate-900 font-bold text-xs flex items-center gap-1 shadow-sm uppercase"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>&lt;&lt; Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                onClick={() => setStep((prev) => (Math.min(3, prev + 1) as any))}
                className="px-5 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1 shadow-sm uppercase"
              >
                <span>Avançar &gt;&gt;</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : !calculatedCurve ? (
              <button
                onClick={handleCalculateAndPlot}
                className="px-5 py-1.5 bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calcular e Traçar</span>
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-6 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                <span>Concluir</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border border-slate-600 text-slate-900 font-bold text-xs shadow-sm uppercase"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
