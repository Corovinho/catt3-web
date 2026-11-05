import React, { useState, useEffect } from 'react';
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

type TargetPropKey = 'P' | 'T' | 'v' | 'h' | 's';

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

const ALLOWED_TARGETS: Record<ProcessType, TargetPropKey[]> = {
  ISOBARIC: ['T', 'v', 'h', 's'],
  ISOTHERMAL: ['P', 'v', 's'],
  ISOCHORIC: ['P', 'T'],
  ISENTROPIC: ['P', 'T', 'v'],
  ISENERGIC: ['P', 'v'],
  ISENTHALPIC: ['P'],
  PINVERSE_V: ['P', 'v'],
  POLYTROPIC: ['P', 'v', 'T'],
  LINEAR_PV: ['P'],
};

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
  const [targetProp, setTargetProp] = useState<TargetPropKey>('P');
  const [targetVal, setTargetVal] = useState<string>('0.5');
  const [polytropicN, setPolytropicN] = useState<string>('1.3');
  const [linearV2, setLinearV2] = useState<string>('0.2');
  const [calculatedCurve, setCalculatedCurve] = useState<ProcessCurve | null>(null);

  const units = UnitConverter.getUnitLabels(unitSystem);

  useEffect(() => {
    const allowed = ALLOWED_TARGETS[selectedProcess];
    if (!allowed.includes(targetProp)) {
      setTargetProp(allowed[0]);
    }
    setCalculatedCurve(null);
  }, [selectedProcess, targetProp]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCalculatedCurve(null);
      setSelectedStateIdx(-1);
    }
  }, [isOpen]);

  // Active state 1
  const state1: ThermodynamicState = selectedStateIdx === -1 || !statesLog[selectedStateIdx]
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
    : statesLog[selectedStateIdx];

  // Provide smart default value when entering step 3 or switching targetProp
  useEffect(() => {
    if (!isOpen) return;
    const M = state1.molarMass;
    if (targetProp === 'P') {
      const pSuggested = UnitConverter.fromInternalP(state1.P_MPa * 2, units.P);
      setTargetVal(pSuggested >= 10 ? pSuggested.toFixed(2) : pSuggested.toFixed(4));
    } else if (targetProp === 'T') {
      const tSuggested = UnitConverter.fromInternalT(state1.T + 100, units.T);
      setTargetVal(tSuggested.toFixed(1));
    } else if (targetProp === 'v') {
      const vSuggested = UnitConverter.fromInternalV(state1.v * 1.5, units.v, M);
      setTargetVal(vSuggested.toFixed(4));
    } else if (targetProp === 'h') {
      const hSuggested = UnitConverter.fromInternalEnergy(state1.h + 200, units.h, M);
      setTargetVal(hSuggested.toFixed(1));
    } else if (targetProp === 's') {
      const sSuggested = UnitConverter.fromInternalEntropy(state1.s + 0.5, units.s, M);
      setTargetVal(sSuggested.toFixed(3));
    }
    const vLinSuggested = UnitConverter.fromInternalV(state1.v * 1.5, units.v, M);
    setLinearV2(vLinSuggested.toFixed(4));
  }, [targetProp, selectedProcess, selectedStateIdx, unitSystem, isOpen]);

  const handleCalculateAndPlot = () => {
    const rawVal = parseFloat(targetVal);
    if (isNaN(rawVal)) {
      alert('Por favor, informe um valor alvo numérico válido.');
      return;
    }

    try {
      const M = state1.molarMass;
      let internalTarget = rawVal;

      if (targetProp === 'P') {
        if (rawVal <= 0) return alert('A pressão final deve ser maior que zero.');
        internalTarget = UnitConverter.toInternalP(rawVal, units.P);
      } else if (targetProp === 'T') {
        internalTarget = UnitConverter.toInternalT(rawVal, units.T);
      } else if (targetProp === 'v') {
        if (rawVal <= 0) return alert('O volume específico final deve ser maior que zero.');
        internalTarget = UnitConverter.toInternalV(rawVal, units.v, M);
      } else if (targetProp === 'h') {
        internalTarget = UnitConverter.toInternalEnergy(rawVal, units.h, M);
      } else if (targetProp === 's') {
        internalTarget = UnitConverter.toInternalEntropy(rawVal, units.s, M);
      }

      const nVal = parseFloat(polytropicN) || 1.3;
      const rawV2Lin = parseFloat(linearV2);
      const v2Lin = !isNaN(rawV2Lin) && rawV2Lin > 0
        ? UnitConverter.toInternalV(rawV2Lin, units.v, M)
        : (state1.v * 1.5);

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

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && (e.target as HTMLElement)?.tagName !== 'SELECT') {
        e.preventDefault();
        if (step < 3) setStep((prev) => (Math.min(3, prev + 1) as 1 | 2 | 3));
        else if (!calculatedCurve) handleCalculateAndPlot();
        else handleFinish();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!isOpen) return null;

  const allowedTargets = ALLOWED_TARGETS[selectedProcess];

  const getTargetLabel = (prop: TargetPropKey) => {
    switch (prop) {
      case 'P': return `Pressão Final (P₂) [${units.P}]`;
      case 'T': return `Temperatura Final (T₂) [${units.T}]`;
      case 'v': return `Volume Específico Final (v₂) [${units.v}]`;
      case 'h': return `Entalpia Final (h₂) [${units.h}]`;
      case 's': return `Entropia Final (s₂) [${units.s}]`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs font-mono select-none">
      <div className="bg-[#f0f0f0] border-2 border-slate-900 max-w-xl w-full p-4 sm:p-5 shadow-2xl text-slate-900 space-y-4">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
              Traçar Processo Termodinâmico
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-300 border border-slate-400 cursor-pointer">
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
                className="w-full border border-slate-400 bg-white text-slate-900 px-2 py-1.5 text-xs font-mono font-bold cursor-pointer"
              >
                <option value={-1}>
                  Estado Ativo Atual ({state1.substanceName})
                </option>
                {statesLog.map((st, i) => (
                  <option key={st.id} value={i}>
                    #{i + 1} - {st.substanceName} | T = {UnitConverter.fromInternalT(st.T, units.T).toFixed(1)} {units.T}, P = {UnitConverter.fromInternalP(st.P_MPa, units.P).toFixed(3)} {units.P}
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
                  <span className="font-bold text-black">{UnitConverter.fromInternalV(state1.v, units.v, state1.molarMass).toFixed(5)} {units.v}</span>
                </div>
                <div className="bg-slate-50 p-1.5 border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">Entalpia (h₁)</span>
                  <span className="font-bold text-black">{UnitConverter.fromInternalEnergy(state1.h, units.h, state1.molarMass).toFixed(2)} {units.h}</span>
                </div>
                <div className="bg-slate-50 p-1.5 border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">Entropia (s₁)</span>
                  <span className="font-bold text-black">{UnitConverter.fromInternalEntropy(state1.s, units.s, state1.molarMass).toFixed(4)} {units.s}</span>
                </div>
                <div className="bg-slate-50 p-1.5 border border-slate-300">
                  <span className="text-[10px] text-slate-500 block">Energia Int. (u₁)</span>
                  <span className="font-bold text-black">{UnitConverter.fromInternalEnergy(state1.u, units.u, state1.molarMass).toFixed(2)} {units.u}</span>
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
                Definir Propriedade Conhecida do Estado Final (2) ({PROCESS_LIST.find((p) => p.type === selectedProcess)?.formula}):
              </span>

              {allowedTargets.length > 1 && (
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">
                    Propriedade Final Conhecida:
                  </span>
                  <select
                    value={targetProp}
                    onChange={(e) => {
                      setTargetProp(e.target.value as TargetPropKey);
                      setCalculatedCurve(null);
                    }}
                    className="border border-slate-400 bg-white text-slate-900 px-2 py-1 text-xs font-mono font-bold cursor-pointer"
                  >
                    {allowedTargets.map((prop) => (
                      <option key={prop} value={prop}>
                        {getTargetLabel(prop)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Input for target value */}
              <div className="flex items-center justify-between gap-2">
                <span className="w-64 text-xs font-bold text-slate-900">
                  {getTargetLabel(targetProp)}:
                </span>
                <input
                  type="number"
                  step="any"
                  value={targetVal}
                  onChange={(e) => {
                    setTargetVal(e.target.value);
                    setCalculatedCurve(null);
                  }}
                  className="w-32 px-2 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
                />
              </div>

              {/* Extra input if Polytropic */}
              {selectedProcess === 'POLYTROPIC' && (
                <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
                  <span className="w-64 text-xs font-bold text-slate-900">
                    Expoente Politrópico (n):
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    value={polytropicN}
                    onChange={(e) => {
                      setPolytropicN(e.target.value);
                      setCalculatedCurve(null);
                    }}
                    className="w-32 px-2 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
                  />
                </div>
              )}

              {/* Extra input if Linear PV */}
              {selectedProcess === 'LINEAR_PV' && (
                <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
                  <span className="w-64 text-xs font-bold text-slate-900">
                    Volume Final (v₂) [{units.v}]:
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={linearV2}
                    onChange={(e) => {
                      setLinearV2(e.target.value);
                      setCalculatedCurve(null);
                    }}
                    className="w-32 px-2 py-1 text-right text-xs border border-black bg-white font-mono font-bold outline-none"
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

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-900">
                  <div>T₂ = <strong>{UnitConverter.fromInternalT(calculatedCurve.state2.T, units.T).toFixed(2)} {units.T}</strong></div>
                  <div>P₂ = <strong>{UnitConverter.fromInternalP(calculatedCurve.state2.P_MPa, units.P).toFixed(4)} {units.P}</strong></div>
                  <div>v₂ = <strong>{UnitConverter.fromInternalV(calculatedCurve.state2.v, units.v, state1.molarMass).toFixed(5)} {units.v}</strong></div>
                  <div>u₂ = <strong>{UnitConverter.fromInternalEnergy(calculatedCurve.state2.u, units.u, state1.molarMass).toFixed(2)} {units.u}</strong></div>
                  <div>h₂ = <strong>{UnitConverter.fromInternalEnergy(calculatedCurve.state2.h, units.h, state1.molarMass).toFixed(2)} {units.h}</strong></div>
                  <div>s₂ = <strong>{UnitConverter.fromInternalEntropy(calculatedCurve.state2.s, units.s, state1.molarMass).toFixed(4)} {units.s}</strong></div>
                </div>

                <div className="border-t border-emerald-200 pt-2 grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 border border-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Trabalho (w):</span>
                    <span className="text-black font-bold text-sm">
                      {UnitConverter.fromInternalEnergy(calculatedCurve.work, units.h, state1.molarMass).toFixed(2)} {units.h}
                    </span>
                  </div>
                  <div className="bg-white p-2 border border-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Calor (q):</span>
                    <span className="text-black font-bold text-sm">
                      {UnitConverter.fromInternalEnergy(calculatedCurve.heat, units.h, state1.molarMass).toFixed(2)} {units.h}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-300">
          <button
            onClick={() => setStep((prev) => (Math.max(1, prev - 1) as any))}
            disabled={step === 1}
            className="px-4 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] disabled:opacity-40 border border-slate-600 text-slate-900 font-bold text-xs flex items-center gap-1 shadow-sm uppercase cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>&lt;&lt; Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                onClick={() => setStep((prev) => (Math.min(3, prev + 1) as any))}
                className="px-5 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border border-slate-700 text-slate-900 font-bold text-xs flex items-center gap-1 shadow-sm uppercase cursor-pointer"
              >
                <span>Avançar &gt;&gt;</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : !calculatedCurve ? (
              <button
                onClick={handleCalculateAndPlot}
                className="px-5 py-1.5 bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calcular e Traçar</span>
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-6 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm uppercase tracking-wider cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Concluir</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#e1e1e1] hover:bg-[#d0d0d0] border border-slate-600 text-slate-900 font-bold text-xs shadow-sm uppercase cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
