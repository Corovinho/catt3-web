import React, { useState, useEffect } from 'react';
import {
  CalcMode,
  SubstanceCategory,
  ThermodynamicState,
  UnitSystem,
} from './types/thermo';
import { Navbar } from './components/Navbar';
import { SubstanceSelector } from './components/SubstanceSelector';
import { PropertiesInput } from './components/PropertiesInput';
import { CurrentStateDisplay } from './components/CurrentStateDisplay';
import { StateLogTable } from './components/StateLogTable';
import { DiagramView } from './components/DiagramView';
import { ProcessModal } from './components/ProcessModal';
import { WaterEngine } from './engine/water';
import { RefrigerantEngine } from './engine/refrigerants';
import { AirEngine } from './engine/air';
import { IdealGasEngine } from './engine/idealGases';
import { CompressibilityEngine } from './engine/compressibility';
import { PsychrometricsEngine } from './engine/psychrometrics';
import { UnitConverter } from './engine/units';

export const App: React.FC = () => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('SI');
  const [activeView, setActiveView] = useState<'calc' | 'log' | 'diagram'>('calc');
  const [category, setCategory] = useState<SubstanceCategory>('WATER');
  const [substanceId, setSubstanceId] = useState<string>('water');
  const [mode, setMode] = useState<CalcMode>('GENERAL');

  // General 2-phase inputs (Default: P = 1 bar, T = 100 °C)
  const [prop1Name, setProp1Name] = useState('P');
  const [prop1Value, setProp1Value] = useState('1');
  const [prop2Name, setProp2Name] = useState('T');
  const [prop2Value, setProp2Value] = useState('100');

  // Saturation mode inputs
  const [satBasis, setSatBasis] = useState<'T' | 'P'>('P');
  const [satBasisValue, setSatBasisValue] = useState('1');
  const [satSecondProp, setSatSecondProp] = useState<'x' | 'v' | 'u' | 'h' | 's'>('x');
  const [satSecondValue, setSatSecondValue] = useState('1');

  // Air inputs
  const [airProp, setAirProp] = useState<'T' | 'h' | 'Pr' | 'u' | 'vr' | 's0'>('T');
  const [airVal, setAirVal] = useState('300');
  const [airPressure, setAirPressure] = useState('1');

  // Ideal Gas inputs
  const [gasT, setGasT] = useState('25');
  const [gasP, setGasP] = useState('1');

  // Compressibility inputs
  const [compPr, setCompPr] = useState('1.5');
  const [compTr, setCompTr] = useState('1.2');

  // Psychrometrics inputs
  const [psyTdb, setPsyTdb] = useState('25');
  const [psyMode, setPsyMode] = useState<'RH' | 'Twb' | 'Tdp' | 'w'>('RH');
  const [psyVal, setPsyVal] = useState('50');

  // State management
  const [currentState, setCurrentState] = useState<ThermodynamicState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statesLog, setStatesLog] = useState<ThermodynamicState[]>(() => {
    try {
      const saved = localStorage.getItem('catt3_states_log');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('catt3_states_log', JSON.stringify(statesLog));
    } catch {
      // ignore
    }
  }, [statesLog]);

  // Initial calculation on load
  useEffect(() => {
    handleCalculate();
  }, [category, substanceId]);

  const handleCalculate = () => {
    setError(null);
    try {
      let st: ThermodynamicState;

      if (category === 'WATER') {
        if (mode === 'GENERAL') {
          const props: any = {};
          const p1 = parseFloat(prop1Value);
          const p2 = parseFloat(prop2Value);
          if (isNaN(p1) || isNaN(p2)) throw new Error('Insira valores numéricos válidos.');

          // Map prop 1
          if (prop1Name === 'P') props.P_MPa = UnitConverter.toInternalP(p1, 'bar');
          else if (prop1Name === 'T') props.T = UnitConverter.toInternalT(p1, 'C');
          else if (prop1Name === 'h') props.h = UnitConverter.toInternalEnergy(p1, 'kJ/kg');
          else if (prop1Name === 's') props.s = UnitConverter.toInternalEntropy(p1, 'kJ/kg.K');
          else if (prop1Name === 'v') props.v = UnitConverter.toInternalV(p1, 'm3/kg');
          else if (prop1Name === 'x') props.x = Math.max(0, Math.min(1, p1));

          // Map prop 2
          if (prop2Name === 'P') props.P_MPa = UnitConverter.toInternalP(p2, 'bar');
          else if (prop2Name === 'T') props.T = UnitConverter.toInternalT(p2, 'C');
          else if (prop2Name === 'h') props.h = UnitConverter.toInternalEnergy(p2, 'kJ/kg');
          else if (prop2Name === 's') props.s = UnitConverter.toInternalEntropy(p2, 'kJ/kg.K');
          else if (prop2Name === 'v') props.v = UnitConverter.toInternalV(p2, 'm3/kg');
          else if (prop2Name === 'x') props.x = Math.max(0, Math.min(1, p2));

          st = WaterEngine.solveGeneral(props);
        } else {
          const baseVal = parseFloat(satBasisValue);
          const secVal = parseFloat(satSecondValue);
          if (isNaN(baseVal) || isNaN(secVal)) throw new Error('Insira valores numéricos válidos.');

          const internalBase = satBasis === 'P'
            ? UnitConverter.toInternalP(baseVal, 'bar')
            : UnitConverter.toInternalT(baseVal, 'C');

          st = WaterEngine.solveSaturation({
            type: satBasis,
            value: internalBase,
            secondProp: satSecondProp,
            secondVal: secVal,
          });
        }
      } else if (category === 'REFRIGERANTS' || category === 'CRYOGENICS') {
        const val1 = parseFloat(mode === 'GENERAL' ? prop1Value : satBasisValue);
        const val2 = parseFloat(mode === 'GENERAL' ? prop2Value : satSecondValue);
        if (isNaN(val1) || isNaN(val2)) throw new Error('Insira valores numéricos válidos.');

        st = RefrigerantEngine.solve(substanceId, {
          mode,
          type: (mode === 'GENERAL' ? prop1Name : satBasis) as any,
          value: val1,
          secondProp: (mode === 'GENERAL' ? prop2Name : satSecondProp) as any,
          secondVal: val2,
        });
      } else if (category === 'AIR') {
        const v = parseFloat(airVal);
        const p = parseFloat(airPressure);
        if (isNaN(v) || isNaN(p)) throw new Error('Insira valores numéricos válidos.');
        st = AirEngine.solve(airProp as any, v, p);
      } else if (category === 'IDEAL_GASES') {
        const t = parseFloat(gasT);
        const p = parseFloat(gasP);
        if (isNaN(t) || isNaN(p)) throw new Error('Insira valores numéricos válidos.');
        st = IdealGasEngine.solve(substanceId, t, p);
      } else if (category === 'COMPRESSIBILITY') {
        const pr = parseFloat(compPr);
        const tr = parseFloat(compTr);
        if (isNaN(pr) || isNaN(tr)) throw new Error('Insira valores numéricos válidos.');
        st = CompressibilityEngine.solve(pr, tr);
      } else if (category === 'PSYCHROMETRICS') {
        const tdb = parseFloat(psyTdb);
        const v = parseFloat(psyVal);
        if (isNaN(tdb) || isNaN(v)) throw new Error('Insira valores numéricos válidos.');
        st = PsychrometricsEngine.solve({
          Tdb: tdb,
          inputMode: psyMode,
          value: v,
        });
      } else {
        throw new Error('Categoria não reconhecida.');
      }

      setCurrentState(st);
    } catch (err: any) {
      setError(err.message || 'Erro no cálculo termodinâmico. Verifique os valores de entrada.');
    }
  };

  const handleAddStateToLog = (st: ThermodynamicState) => {
    const newState: ThermodynamicState = {
      ...st,
      id: Math.random().toString(36).substring(2, 9),
      stateNumber: statesLog.length + 1,
      label: `Estado ${statesLog.length + 1}`,
      timestamp: Date.now(),
    };
    setStatesLog((prev) => [...prev, newState]);
  };

  const handleClearLog = () => {
    if (confirm('Deseja limpar todos os estados do histórico?')) {
      setStatesLog([]);
    }
  };

  const handleDeleteState = (id: string) => {
    setStatesLog((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setStatesLog((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)));
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar
        unitSystem={unitSystem}
        setUnitSystem={setUnitSystem}
        activeView={activeView}
        setActiveView={setActiveView}
        logCount={statesLog.length}
        onOpenProcess={() => setIsProcessModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
        {/* Substance Navigation */}
        <SubstanceSelector
          category={category}
          setCategory={setCategory}
          substanceId={substanceId}
          setSubstanceId={setSubstanceId}
        />

        {/* View: CALCULATOR */}
        {activeView === 'calc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Input Column */}
            <div className="lg:col-span-5 space-y-3">
              <PropertiesInput
                category={category}
                mode={mode}
                setMode={setMode}
                unitSystem={unitSystem}
                prop1Name={prop1Name}
                setProp1Name={setProp1Name}
                prop1Value={prop1Value}
                setProp1Value={setProp1Value}
                prop2Name={prop2Name}
                setProp2Name={setProp2Name}
                prop2Value={prop2Value}
                setProp2Value={setProp2Value}
                satBasis={satBasis}
                setSatBasis={setSatBasis}
                satBasisValue={satBasisValue}
                setSatBasisValue={setSatBasisValue}
                satSecondProp={satSecondProp}
                setSatSecondProp={setSatSecondProp}
                satSecondValue={satSecondValue}
                setSatSecondValue={setSatSecondValue}
                airProp={airProp}
                setAirProp={setAirProp}
                airVal={airVal}
                setAirVal={setAirVal}
                airPressure={airPressure}
                setAirPressure={setAirPressure}
                gasT={gasT}
                setGasT={setGasT}
                gasP={gasP}
                setGasP={setGasP}
                compPr={compPr}
                setCompPr={setCompPr}
                compTr={compTr}
                setCompTr={setCompTr}
                psyTdb={psyTdb}
                setPsyTdb={setPsyTdb}
                psyMode={psyMode}
                setPsyMode={setPsyMode}
                psyVal={psyVal}
                setPsyVal={setPsyVal}
                onCalculate={handleCalculate}
                error={error}
              />
            </div>

            {/* Results Column */}
            <div className="lg:col-span-7 space-y-3">
              <CurrentStateDisplay
                state={currentState}
                unitSystem={unitSystem}
                onAddState={handleAddStateToLog}
              />
            </div>
          </div>
        )}

        {/* View: LOG / CYCLES SPREADSHEET */}
        {activeView === 'log' && (
          <StateLogTable
            states={statesLog}
            unitSystem={unitSystem}
            onClear={handleClearLog}
            onDeleteState={handleDeleteState}
            onUpdateLabel={handleUpdateLabel}
          />
        )}

        {/* View: DIAGRAM */}
        {activeView === 'diagram' && (
          <DiagramView
            states={statesLog}
            currentSubstance={substanceId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-3 px-4 text-center text-xs text-slate-500 font-mono">
        <p>CATT3 Web &bull; Computer-Aided Thermodynamic Tables 3 &bull; Formulações IAPWS-IF97 &bull; NIST Standard &bull; ASHRAE</p>
      </footer>

      {/* Process Wizard Modal */}
      <ProcessModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        currentState={currentState}
        onAddState={handleAddStateToLog}
      />
    </div>
  );
};

export default App;
