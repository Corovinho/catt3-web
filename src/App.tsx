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
import { FluidSatDialog } from './components/FluidSatDialog';
import { AirCalculateDialog, AirInputType } from './components/AirCalculateDialog';
import { GasCalculateDialog } from './components/GasCalculateDialog';
import { ComprCalculateDialog } from './components/ComprCalculateDialog';
import { PsychroCalculateDialog } from './components/PsychroCalculateDialog';
import { TablesSubstancesModal } from './components/TablesSubstancesModal';
import { UnitsDialog } from './components/UnitsDialog';
import { ProcessModal } from './components/ProcessModal';
import { WaterEngine } from './engine/water';
import { RefrigerantEngine, FLUID_CATALOG } from './engine/refrigerants';
import { AirEngine } from './engine/air';
import { IdealGasEngine, GAS_CATALOG } from './engine/idealGases';
import { CompressibilityEngine } from './engine/compressibility';
import { PsychrometricsEngine } from './engine/psychrometrics';
import { UnitConverter } from './engine/units';

export const App: React.FC = () => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('SI');
  const [category, setCategory] = useState<SubstanceCategory>('WATER');
  const [substanceId, setSubstanceId] = useState<string>('water');
  const [calcMode, setCalcMode] = useState<CalcMode>('GENERAL');
  const [diagramType, setDiagramType] = useState<'Ts' | 'Pv'>('Ts');
  const [activeView, setActiveView] = useState<'calc' | 'log' | 'diagram'>('calc');

  // Dialog open states
  const [isGeneralPropsOpen, setIsGeneralPropsOpen] = useState(false);
  const [isFluidSatOpen, setIsFluidSatOpen] = useState(false);
  const [isAirCalcOpen, setIsAirCalcOpen] = useState(false);
  const [isGasCalcOpen, setIsGasCalcOpen] = useState(false);
  const [isComprCalcOpen, setIsComprCalcOpen] = useState(false);
  const [isPsychroCalcOpen, setIsPsychroCalcOpen] = useState(false);
  const [isTablesSubstancesOpen, setIsTablesSubstancesOpen] = useState(false);
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

  // Update default state when category or substance changes
  const handleCategoryChange = (newCat: SubstanceCategory, newSubId?: string) => {
    setCategory(newCat);
    let sid = newSubId;
    if (!sid) {
      if (newCat === 'WATER') sid = 'water';
      else if (newCat === 'REFRIGERANTS') sid = 'r134a';
      else if (newCat === 'CRYOGENICS') sid = 'nh3';
      else if (newCat === 'AIR') sid = 'air';
      else if (newCat === 'IDEAL_GASES') sid = 'co2';
      else if (newCat === 'COMPRESSIBILITY') sid = 'compressibility';
      else sid = 'psychrometrics';
    }
    setSubstanceId(sid);

    // Calculate a default initial state for that category
    try {
      let st: ThermodynamicState;
      if (newCat === 'WATER') {
        st = WaterEngine.solveGeneral({ T: 100, P_MPa: 0.101325 });
      } else if (newCat === 'REFRIGERANTS' || newCat === 'CRYOGENICS') {
        st = RefrigerantEngine.solve(sid, { mode: 'GENERAL', type: 'T', value: 20, secondProp: 'x', secondVal: 1 });
      } else if (newCat === 'AIR') {
        st = AirEngine.solve('T', 298.15, 1.01325);
      } else if (newCat === 'IDEAL_GASES') {
        st = IdealGasEngine.solve(sid, 25, 1.01325);
      } else if (newCat === 'COMPRESSIBILITY') {
        st = CompressibilityEngine.solve(1.5, 1.2);
      } else {
        st = PsychrometricsEngine.solve({ Tdb: 25, inputMode: 'RH', value: 50 });
      }
      setCurrentState(st);
    } catch {
      // ignore
    }
  };

  // Open calculation dialog router based on active category & mode
  const handleOpenCalculate = () => {
    if (category === 'WATER' || category === 'REFRIGERANTS' || category === 'CRYOGENICS') {
      if (calcMode === 'SATURATION') {
        setIsFluidSatOpen(true);
      } else {
        setIsGeneralPropsOpen(true);
      }
    } else if (category === 'AIR') {
      setIsAirCalcOpen(true);
    } else if (category === 'IDEAL_GASES') {
      setIsGasCalcOpen(true);
    } else if (category === 'COMPRESSIBILITY') {
      setIsComprCalcOpen(true);
    } else if (category === 'PSYCHROMETRICS') {
      setIsPsychroCalcOpen(true);
    }
  };

  // Handler: Fluid General Properties
  const handleCalculateFluidGeneral = (data: {
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
      } else {
        // Refrigerants / Cryogenics
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
      }

      setCurrentState(st);
      handleAddStateToLog(st);
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular propriedades.');
    }
  };

  // Handler: Fluid Saturation Properties
  const handleCalculateFluidSat = (data: {
    primaryType: 'T' | 'P';
    primaryValue: number;
    mixtureType: 'x' | 'sat_liq' | 'sat_vap' | 'h' | 's' | 'v';
    mixtureValue?: number;
  }) => {
    try {
      let st: ThermodynamicState;
      const units = UnitConverter.getUnitLabels(unitSystem);

      if (category === 'WATER') {
        const tC = data.primaryType === 'T' ? UnitConverter.toInternalT(data.primaryValue, units.T) : 100;
        const pMPa = data.primaryType === 'P' ? UnitConverter.toInternalP(data.primaryValue, units.P) : 0.101325;
        const x = data.mixtureType === 'sat_liq' ? 0 : (data.mixtureType === 'sat_vap' ? 1 : (data.mixtureValue ?? 0.5));

        st = WaterEngine.solveGeneral(data.primaryType === 'T' ? { T: tC, x } : { P_MPa: pMPa, x });
        st.mode = 'SATURATION';
      } else {
        const primVal = data.primaryType === 'T'
          ? UnitConverter.toInternalT(data.primaryValue, units.T)
          : UnitConverter.toInternalP(data.primaryValue, units.P) * 10;

        let secondProp: any = 'x';
        let secondVal = 0.5;

        if (data.mixtureType === 'sat_liq') {
          secondProp = 'x'; secondVal = 0;
        } else if (data.mixtureType === 'sat_vap') {
          secondProp = 'x'; secondVal = 1;
        } else if (data.mixtureType === 'x') {
          secondProp = 'x'; secondVal = data.mixtureValue ?? 0.5;
        } else if (data.mixtureType === 'h') {
          secondProp = 'h'; secondVal = data.mixtureValue ?? 200;
        } else if (data.mixtureType === 's') {
          secondProp = 's'; secondVal = data.mixtureValue ?? 1;
        } else if (data.mixtureType === 'v') {
          secondProp = 'v'; secondVal = data.mixtureValue ?? 0.05;
        }

        st = RefrigerantEngine.solve(substanceId, {
          mode: 'SATURATION',
          type: data.primaryType,
          value: primVal,
          secondProp,
          secondVal,
        });
      }

      setCurrentState(st);
      handleAddStateToLog(st);
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular propriedades de saturação.');
    }
  };

  // Handler: Air Properties
  const handleCalculateAir = (data: {
    inputType: AirInputType;
    value: number;
    pressureBar: number;
  }) => {
    try {
      const st = AirEngine.solve(data.inputType as any, data.value, data.pressureBar);
      setCurrentState(st);
      handleAddStateToLog(st);
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular propriedades do ar.');
    }
  };

  // Handler: Ideal Gas Properties
  const handleCalculateGas = (data: {
    gasId: string;
    temperatureC: number;
    pressureBar: number;
  }) => {
    try {
      const st = IdealGasEngine.solve(data.gasId, data.temperatureC, data.pressureBar);
      setCurrentState(st);
      handleAddStateToLog(st);
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular propriedades do gás ideal.');
    }
  };

  // Handler: Compressibility Z
  const handleCalculateCompr = (data: {
    Tr: number;
    Pr: number;
    omega: number;
  }) => {
    try {
      const st = CompressibilityEngine.solve(data.Pr, data.Tr);
      setCurrentState(st);
      handleAddStateToLog(st);
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular fator de compressibilidade.');
    }
  };

  // Handler: Psychrometric Properties
  const handleCalculatePsychro = (data: {
    P_atm_kPa: number;
    Tdb: number;
    inputMode: 'RH' | 'Twb' | 'Tdp' | 'w';
    value: number;
  }) => {
    try {
      const st = PsychrometricsEngine.solve(data);
      setCurrentState(st);
      handleAddStateToLog(st);
    } catch (err: any) {
      alert(err.message || 'Erro ao calcular propriedades psicrométricas.');
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
    setStatesLog((prev) => [newState, ...prev]);
  };

  const handleClearLog = () => {
    if (confirm('Deseja realmente limpar todos os estados avaliados do histórico?')) {
      setStatesLog([]);
    }
  };

  const handleDeleteState = (id: string) => {
    setStatesLog((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setStatesLog((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label } : s))
    );
  };

  const getSubstanceTitle = () => {
    if (category === 'WATER') return 'Água / Vapor (H₂O)';
    if (category === 'REFRIGERANTS') return FLUID_CATALOG[substanceId]?.name || 'R-134a';
    if (category === 'CRYOGENICS') return FLUID_CATALOG[substanceId]?.name || 'Amônia (NH₃)';
    if (category === 'AIR') return 'Ar (Tabela A-17)';
    if (category === 'IDEAL_GASES') return GAS_CATALOG[substanceId]?.name || 'CO₂';
    if (category === 'COMPRESSIBILITY') return 'Compressibilidade (Z)';
    return 'Psicrometria (Ar Úmido)';
  };

  const units = UnitConverter.getUnitLabels(unitSystem);

  const statusText = currentState
    ? `Valores Atuais: T = ${currentState.T.toFixed(2)} ${units.T}; P = ${currentState.P_MPa.toFixed(4)} ${units.P}; s = ${currentState.s.toFixed(4)} ${units.s}`
    : 'Pronto para calcular.';

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-slate-900 flex flex-col font-sans select-none">
      {/* Header with Minimalist Phase Diagram Logo & View Switcher */}
      <Navbar
        unitSystem={unitSystem}
        setUnitSystem={setUnitSystem}
        activeView={activeView}
        setActiveView={setActiveView}
        logCount={statesLog.length}
        onOpenProcess={() => setIsProcessOpen(true)}
      />

      {/* Main Menu & Toolbar matching CATT3 */}
      <MainToolbar
        onOpenCalculate={handleOpenCalculate}
        onOpenUnits={() => setIsUnitsOpen(true)}
        onOpenProcess={() => setIsProcessOpen(true)}
        onOpenTablesSubstances={() => setIsTablesSubstancesOpen(true)}
        onAddCurrentState={() => currentState && handleAddStateToLog(currentState)}
        onClearLog={handleClearLog}
        diagramType={diagramType}
        setDiagramType={setDiagramType}
        calcMode={calcMode}
        setCalcMode={setCalcMode}
        category={category}
        activeSubstanceName={getSubstanceTitle()}
      />

      {/* Main Workspace matching CATT3 Screen */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 space-y-3">
        {activeView === 'calc' && (
          <>
            {/* UPPER SECTION: Split Left (Properties Box) & Right (Diagram) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              {/* Upper Left: Properties Box dedicated per tab */}
              <div className="md:col-span-5 flex flex-col">
                <PropertiesBox
                  state={currentState}
                  category={category}
                  unitSystem={unitSystem}
                  onOpenCalculate={handleOpenCalculate}
                  onAddState={handleAddStateToLog}
                />
              </div>

              {/* Upper Right: Diagram dedicated per tab (T-s / P-v / Psychrometric / Compressibility) */}
              <div className="md:col-span-7 flex flex-col">
                <DiagramView
                  states={statesLog}
                  category={category}
                  currentSubstance={substanceId}
                  diagramType={diagramType}
                  setDiagramType={setDiagramType}
                />
              </div>
            </div>

            {/* LOWER SECTION: Spreadsheet Log Table */}
            <div>
              <StateLogTable
                states={statesLog}
                unitSystem={unitSystem}
                activeCategory={category}
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
                Visualização Expandida de Estados Avaliados
              </span>
              <button
                onClick={handleOpenCalculate}
                className="px-3 py-1 bg-black text-white text-xs font-bold uppercase hover:bg-slate-800 transition-colors"
              >
                + Calcular Novo Estado
              </button>
            </div>
            <StateLogTable
              states={statesLog}
              unitSystem={unitSystem}
              activeCategory={category}
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
              category={category}
              currentSubstance={substanceId}
              diagramType={diagramType}
              setDiagramType={setDiagramType}
            />
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: Substance Tabs & Status Bar matching CATT3 */}
      <BottomTabs
        category={category}
        substanceId={substanceId}
        onSelectCategory={(cat, sub) => handleCategoryChange(cat, sub)}
        statusText={statusText}
      />

      {/* ===================== MODALS & DIALOGS ===================== */}
      {/* Tables & Substances Picker Modal */}
      <TablesSubstancesModal
        isOpen={isTablesSubstancesOpen}
        onClose={() => setIsTablesSubstancesOpen(false)}
        currentCategory={category}
        currentSubstanceId={substanceId}
        onSelect={(cat, sub) => handleCategoryChange(cat, sub)}
      />

      {/* Fluid General Properties Dialog (Water, Refrigerants, Cryogenics) */}
      <GeneralPropertiesDialog
        isOpen={isGeneralPropsOpen}
        onClose={() => setIsGeneralPropsOpen(false)}
        unitSystem={unitSystem}
        substanceName={getSubstanceTitle()}
        onCalculate={handleCalculateFluidGeneral}
      />

      {/* Fluid Saturation Properties Dialog */}
      <FluidSatDialog
        isOpen={isFluidSatOpen}
        onClose={() => setIsFluidSatOpen(false)}
        unitSystem={unitSystem}
        substanceName={getSubstanceTitle()}
        onCalculate={handleCalculateFluidSat}
      />

      {/* Air Calculate Dialog */}
      <AirCalculateDialog
        isOpen={isAirCalcOpen}
        onClose={() => setIsAirCalcOpen(false)}
        unitSystem={unitSystem}
        onCalculate={handleCalculateAir}
      />

      {/* Ideal Gas Calculate Dialog */}
      <GasCalculateDialog
        isOpen={isGasCalcOpen}
        onClose={() => setIsGasCalcOpen(false)}
        unitSystem={unitSystem}
        substanceId={substanceId}
        setSubstanceId={setSubstanceId}
        onCalculate={handleCalculateGas}
      />

      {/* Compressibility Calculate Dialog */}
      <ComprCalculateDialog
        isOpen={isComprCalcOpen}
        onClose={() => setIsComprCalcOpen(false)}
        onCalculate={handleCalculateCompr}
      />

      {/* Psychrometric Calculate Dialog */}
      <PsychroCalculateDialog
        isOpen={isPsychroCalcOpen}
        onClose={() => setIsPsychroCalcOpen(false)}
        unitSystem={unitSystem}
        onCalculate={handleCalculatePsychro}
      />

      {/* Units Dialog */}
      <UnitsDialog
        isOpen={isUnitsOpen}
        onClose={() => setIsUnitsOpen(false)}
        currentSystem={unitSystem}
        onSelectSystem={setUnitSystem}
      />

      {/* Process Wizard Modal */}
      <ProcessModal
        isOpen={isProcessOpen}
        onClose={() => setIsProcessOpen(false)}
        states={statesLog}
        substanceId={substanceId}
        category={category}
        unitSystem={unitSystem}
      />
    </div>
  );
};

export default App;
