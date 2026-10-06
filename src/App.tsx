import React, { useState, useEffect } from 'react';
import {
  CalcMode,
  SubstanceCategory,
  ThermodynamicState,
  UnitSystem,
} from './types/thermo';
import { Navbar } from './components/Navbar';
import { MainToolbar } from './components/MainToolbar';
import { PropertiesBox } from './components/PropertiesBox';
import { StateLogTable } from './components/StateLogTable';
import { DiagramView } from './components/DiagramView';
import { BottomTabs } from './components/BottomTabs';
import { GeneralPropertiesDialog, InputType } from './components/GeneralPropertiesDialog';
import { UnitsDialog } from './components/UnitsDialog';
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
  const [category, setCategory] = useState<SubstanceCategory>('WATER');
  const [substanceId, setSubstanceId] = useState<string>('water');
  const [diagramType, setDiagramType] = useState<'Ts' | 'Pv'>('Ts');
  const [activeView, setActiveView] = useState<'calc' | 'log' | 'diagram'>('calc');

  // Dialog states
  const [isGeneralPropsOpen, setIsGeneralPropsOpen] = useState(false);
  const [isUnitsOpen, setIsUnitsOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);

  // States
  const [currentState, setCurrentState] = useState<ThermodynamicState | null>(null);
  const [statesLog, setStatesLog] = useState<ThermodynamicState[]>(() => {
    try {
      const saved = localStorage.getItem('catt3_states_log');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('catt3_states_log', JSON.stringify(statesLog));
    } catch {
      // ignore
    }
  }, [statesLog]);

  // Initial calculation on load (Water at 100 C, 0.1 MPa)
  useEffect(() => {
    try {
      const initial = WaterEngine.solveGeneral({ T: 100, P_MPa: 0.101325 });
      setCurrentState(initial);
    } catch {
      // ignore
    }
  }, []);

  const handleCalculateFromDialog = (data: {
    inputType: InputType;
    T?: number;
    P?: number;
    v?: number;
    h?: number;
    s?: number;
    x?: number;
  }) => {
    try {
      let st: ThermodynamicState;

      if (category === 'WATER') {
        const props: any = {};
        if (data.T !== undefined) props.T = UnitConverter.toInternalT(data.T, UnitConverter.getUnitLabels(unitSystem).T);
        if (data.P !== undefined) props.P_MPa = UnitConverter.toInternalP(data.P, UnitConverter.getUnitLabels(unitSystem).P);
        if (data.v !== undefined) props.v = UnitConverter.toInternalV(data.v, UnitConverter.getUnitLabels(unitSystem).v);
        if (data.h !== undefined) props.h = UnitConverter.toInternalEnergy(data.h, UnitConverter.getUnitLabels(unitSystem).h);
        if (data.s !== undefined) props.s = UnitConverter.toInternalEntropy(data.s, UnitConverter.getUnitLabels(unitSystem).s);
        if (data.x !== undefined) props.x = data.x;

        st = WaterEngine.solveGeneral(props);
      } else if (category === 'REFRIGERANTS' || category === 'CRYOGENICS') {
        let type: 'T' | 'P' = 'P';
        let value = data.P ? UnitConverter.toInternalP(data.P, UnitConverter.getUnitLabels(unitSystem).P) * 10 : 1;
        let secondProp: any = 'x';
        let secondVal = data.x ?? 1;

        if (data.inputType.startsWith('1_') || data.inputType.startsWith('2_') || data.inputType.startsWith('3_') || data.inputType.startsWith('4_')) {
          type = 'T';
          value = data.T ? UnitConverter.toInternalT(data.T, UnitConverter.getUnitLabels(unitSystem).T) : 25;
          if (data.v !== undefined) { secondProp = 'v'; secondVal = data.v; }
          else if (data.s !== undefined) { secondProp = 's'; secondVal = data.s; }
          else if (data.x !== undefined) { secondProp = 'x'; secondVal = data.x; }
          else if (data.P !== undefined) { secondProp = 'P'; secondVal = data.P * 10; }
        } else {
          type = 'P';
          value = data.P ? UnitConverter.toInternalP(data.P, UnitConverter.getUnitLabels(unitSystem).P) * 10 : 1;
          if (data.v !== undefined) { secondProp = 'v'; secondVal = data.v; }
          else if (data.h !== undefined) { secondProp = 'h'; secondVal = data.h; }
          else if (data.s !== undefined) { secondProp = 's'; secondVal = data.s; }
          else if (data.x !== undefined) { secondProp = 'x'; secondVal = data.x; }
        }

        st = RefrigerantEngine.solve(substanceId, {
          mode: 'GENERAL',
          type,
          value,
          secondProp,
          secondVal,
        });
      } else if (category === 'AIR') {
        const tVal = data.T ?? 300;
        st = AirEngine.solve('T', tVal, (data.P ?? 0.1) * 10);
      } else if (category === 'IDEAL_GASES') {
        const tVal = data.T ?? 25;
        const pVal = (data.P ?? 0.1) * 10;
        st = IdealGasEngine.solve(substanceId, tVal, pVal);
      } else if (category === 'COMPRESSIBILITY') {
        const pr = data.P ?? 1.5;
        const tr = data.T ?? 1.2;
        st = CompressibilityEngine.solve(pr, tr);
      } else if (category === 'PSYCHROMETRICS') {
        const tdb = data.T ?? 25;
        const rh = (data.x !== undefined ? data.x * 100 : 50);
        st = PsychrometricsEngine.solve({ Tdb: tdb, inputMode: 'RH', value: rh });
      } else {
        throw new Error('Categoria não reconhecida');
      }

      setCurrentState(st);
      handleAddStateToLog(st);
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular propriedades.');
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
    if (confirm('Deseja limpar todos os valores do log?')) {
      setStatesLog([]);
    }
  };

  const handleDeleteState = (id: string) => {
    setStatesLog((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setStatesLog((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)));
  };

  const getSubstanceTitle = () => {
    if (category === 'WATER') return 'Water';
    if (category === 'REFRIGERANTS') return substanceId === 'r134a' ? 'R-134a' : 'R-22';
    if (category === 'CRYOGENICS') return 'Ammonia (NH3)';
    if (category === 'AIR') return 'Air';
    if (category === 'IDEAL_GASES') return substanceId.toUpperCase();
    if (category === 'COMPRESSIBILITY') return 'Compressibility';
    return 'Psychrometrics';
  };

  const units = UnitConverter.getUnitLabels(unitSystem);

  const statusText = currentState
    ? `Values: S = ${currentState.s.toFixed(4)} ${units.s}; T = ${currentState.T.toFixed(2)} ${units.T}; P = ${currentState.P_MPa.toFixed(4)} ${units.P}`
    : 'Pronto para calcular.';

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-slate-900 flex flex-col font-sans select-none">
      {/* Header with Minimalist Phase Diagram Logo */}
      <Navbar
        unitSystem={unitSystem}
        setUnitSystem={setUnitSystem}
        activeView={activeView}
        setActiveView={setActiveView}
        logCount={statesLog.length}
        onOpenProcess={() => setIsProcessOpen(true)}
      />

      {/* Main Menu & Toolbar matching Image 3 */}
      <MainToolbar
        onOpenCalculate={() => setIsGeneralPropsOpen(true)}
        onOpenUnits={() => setIsUnitsOpen(true)}
        onOpenProcess={() => setIsProcessOpen(true)}
        onAddCurrentState={() => currentState && handleAddStateToLog(currentState)}
        onClearLog={handleClearLog}
        diagramType={diagramType}
        setDiagramType={setDiagramType}
        activeSubstanceName={getSubstanceTitle()}
      />

      {/* Main Workspace matching CATT3 Screen in Image 3 */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 space-y-3">
        {activeView === 'calc' && (
          <>
            {/* UPPER SECTION: Split Left (Properties Box) & Right (Diagram) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              {/* Upper Left: Properties Box (Image 3) */}
              <div className="md:col-span-5 flex flex-col">
                <PropertiesBox
                  state={currentState}
                  unitSystem={unitSystem}
                  onOpenCalculate={() => setIsGeneralPropsOpen(true)}
                  onAddState={handleAddStateToLog}
                />
              </div>

              {/* Upper Right: T-S / P-v Diagram (Image 3) */}
              <div className="md:col-span-7 flex flex-col">
                <DiagramView
                  states={statesLog}
                  currentSubstance={substanceId}
                  diagramType={diagramType}
                  setDiagramType={setDiagramType}
                />
              </div>
            </div>

            {/* LOWER SECTION: Spreadsheet Log Table (Image 3) */}
            <div>
              <StateLogTable
                states={statesLog}
                unitSystem={unitSystem}
                onClear={handleClearLog}
                onDeleteState={handleDeleteState}
                onUpdateLabel={handleUpdateLabel}
              />
            </div>
          </>
        )}

        {activeView === 'log' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white border border-slate-300 p-2.5 font-mono">
              <span className="text-xs font-bold uppercase text-slate-800">
                Visualização Expandida de Estados
              </span>
              <button
                onClick={() => setIsGeneralPropsOpen(true)}
                className="px-3 py-1 bg-black text-white text-xs font-bold uppercase hover:bg-slate-800 transition-colors"
              >
                + Calcular Novo Estado
              </button>
            </div>
            <StateLogTable
              states={statesLog}
              unitSystem={unitSystem}
              onClear={handleClearLog}
              onDeleteState={handleDeleteState}
              onUpdateLabel={handleUpdateLabel}
            />
          </div>
        )}

        {activeView === 'diagram' && (
          <div className="space-y-3">
            <DiagramView
              states={statesLog}
              currentSubstance={substanceId}
              diagramType={diagramType}
              setDiagramType={setDiagramType}
            />
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: Substance Tabs & Status Bar (Image 3) */}
      <BottomTabs
        category={category}
        setCategory={setCategory}
        substanceId={substanceId}
        setSubstanceId={setSubstanceId}
        statusText={statusText}
      />

      {/* DIALOGS: General Properties (Image 1) */}
      <GeneralPropertiesDialog
        isOpen={isGeneralPropsOpen}
        onClose={() => setIsGeneralPropsOpen(false)}
        unitSystem={unitSystem}
        onCalculate={handleCalculateFromDialog}
        substanceName={getSubstanceTitle()}
      />

      {/* DIALOGS: Units (Image 2) */}
      <UnitsDialog
        isOpen={isUnitsOpen}
        onClose={() => setIsUnitsOpen(false)}
        currentUnitSystem={unitSystem}
        onSelectUnitSystem={setUnitSystem}
      />

      {/* DIALOGS: Process Plotter Wizard */}
      <ProcessModal
        isOpen={isProcessOpen}
        onClose={() => setIsProcessOpen(false)}
        currentState={currentState}
        onAddState={handleAddStateToLog}
      />
    </div>
  );
};

export default App;
