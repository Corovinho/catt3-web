import React from 'react';
import { CalcMode, SubstanceCategory, UnitSystem } from '../types/thermo';
import { UnitConverter } from '../engine/units';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface PropertiesInputProps {
  category: SubstanceCategory;
  mode: CalcMode;
  setMode: (m: CalcMode) => void;
  unitSystem: UnitSystem;

  // General 2-phase inputs
  prop1Name: string;
  setProp1Name: (s: string) => void;
  prop1Value: string;
  setProp1Value: (s: string) => void;

  prop2Name: string;
  setProp2Name: (s: string) => void;
  prop2Value: string;
  setProp2Value: (s: string) => void;

  // Saturation mode inputs
  satBasis: 'T' | 'P';
  setSatBasis: (b: 'T' | 'P') => void;
  satBasisValue: string;
  setSatBasisValue: (s: string) => void;
  satSecondProp: 'x' | 'v' | 'u' | 'h' | 's';
  setSatSecondProp: (p: 'x' | 'v' | 'u' | 'h' | 's') => void;
  satSecondValue: string;
  setSatSecondValue: (s: string) => void;

  // Air input
  airProp: 'T' | 'h' | 'Pr' | 'u' | 'vr' | 's0';
  setAirProp: (p: 'T' | 'h' | 'Pr' | 'u' | 'vr' | 's0') => void;
  airVal: string;
  setAirVal: (s: string) => void;
  airPressure: string;
  setAirPressure: (s: string) => void;

  // Ideal Gas input
  gasT: string;
  setGasT: (s: string) => void;
  gasP: string;
  setGasP: (s: string) => void;

  // Compressibility input
  compPr: string;
  setCompPr: (s: string) => void;
  compTr: string;
  setCompTr: (s: string) => void;

  // Psychrometrics input
  psyTdb: string;
  setPsyTdb: (s: string) => void;
  psyMode: 'RH' | 'Twb' | 'Tdp' | 'w';
  setPsyMode: (m: 'RH' | 'Twb' | 'Tdp' | 'w') => void;
  psyVal: string;
  setPsyVal: (s: string) => void;

  onCalculate: () => void;
  error?: string | null;
}

export const PropertiesInput: React.FC<PropertiesInputProps> = ({
  category,
  mode,
  setMode,
  unitSystem,
  prop1Name,
  setProp1Name,
  prop1Value,
  setProp1Value,
  prop2Name,
  setProp2Name,
  prop2Value,
  setProp2Value,
  satBasis,
  setSatBasis,
  satBasisValue,
  setSatBasisValue,
  satSecondProp,
  setSatSecondProp,
  satSecondValue,
  setSatSecondValue,
  airProp,
  setAirProp,
  airVal,
  setAirVal,
  airPressure,
  setAirPressure,
  gasT,
  setGasT,
  gasP,
  setGasP,
  compPr,
  setCompPr,
  compTr,
  setCompTr,
  psyTdb,
  setPsyTdb,
  psyMode,
  setPsyMode,
  psyVal,
  setPsyVal,
  onCalculate,
  error,
}) => {
  const units = UnitConverter.getUnitLabels(unitSystem, 'bar');

  const isTwoPhaseFluid = category === 'WATER' || category === 'REFRIGERANTS' || category === 'CRYOGENICS';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-lg backdrop-blur-sm space-y-3.5">
      {/* Mode Switch for 2-phase fluids */}
      {isTwoPhaseFluid && (
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('GENERAL')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                mode === 'GENERAL'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Propriedades Gerais
            </button>
            <button
              type="button"
              onClick={() => setMode('SATURATION')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                mode === 'SATURATION'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Saturação
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            {mode === 'GENERAL' ? '2 propriedades livres' : 'Domo de vapor (T ou P)'}
          </span>
        </div>
      )}

      {/* FORM INPUTS */}
      {isTwoPhaseFluid && mode === 'GENERAL' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Property 1 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>Propriedade 1:</span>
                <select
                  value={prop1Name}
                  onChange={(e) => setProp1Name(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-sky-300 font-mono rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="P">Pressão (P) [{units.P}]</option>
                  <option value="T">Temperatura (T) [{units.T}]</option>
                  <option value="h">Entalpia (h) [{units.h}]</option>
                  <option value="s">Entropia (s) [{units.s}]</option>
                  <option value="v">Volume (v) [{units.v}]</option>
                  <option value="x">Título (x)</option>
                </select>
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={prop1Value}
                onChange={(e) => setProp1Value(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder="Ex: 10"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">
                {prop1Name === 'P' ? units.P : prop1Name === 'T' ? units.T : prop1Name === 'x' ? '-' : units.h}
              </span>
            </div>
          </div>

          {/* Property 2 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>Propriedade 2:</span>
                <select
                  value={prop2Name}
                  onChange={(e) => setProp2Name(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-sky-300 font-mono rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="T">Temperatura (T) [{units.T}]</option>
                  <option value="P">Pressão (P) [{units.P}]</option>
                  <option value="x">Título (x) [0 a 1]</option>
                  <option value="h">Entalpia (h) [{units.h}]</option>
                  <option value="s">Entropia (s) [{units.s}]</option>
                  <option value="v">Volume (v) [{units.v}]</option>
                </select>
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={prop2Value}
                onChange={(e) => setProp2Value(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder="Ex: 300"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">
                {prop2Name === 'T' ? units.T : prop2Name === 'P' ? units.P : prop2Name === 'x' ? '-' : units.s}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Saturation Mode Inputs */}
      {isTwoPhaseFluid && mode === 'SATURATION' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Base Saturation (T or P) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>Base de Saturação:</span>
                <select
                  value={satBasis}
                  onChange={(e) => setSatBasis(e.target.value as 'T' | 'P')}
                  className="bg-slate-950 border border-slate-800 text-sky-300 font-mono rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="P">Pressão (Psat) [{units.P}]</option>
                  <option value="T">Temperatura (Tsat) [{units.T}]</option>
                </select>
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={satBasisValue}
                onChange={(e) => setSatBasisValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder={satBasis === 'P' ? 'Ex: 1' : 'Ex: 100'}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">
                {satBasis === 'P' ? units.P : units.T}
              </span>
            </div>
          </div>

          {/* Second Saturation Property (x, v, u, h, s) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>Segunda Propriedade:</span>
                <select
                  value={satSecondProp}
                  onChange={(e) => setSatSecondProp(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-sky-300 font-mono rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="x">Título (x) [0 = Líq, 1 = Vap]</option>
                  <option value="h">Entalpia (h) [{units.h}]</option>
                  <option value="s">Entropia (s) [{units.s}]</option>
                  <option value="v">Volume (v) [{units.v}]</option>
                  <option value="u">Energia Interna (u) [{units.u}]</option>
                </select>
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={satSecondValue}
                onChange={(e) => setSatSecondValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder={satSecondProp === 'x' ? '0 a 1 (Ex: 0.85)' : 'Valor'}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">
                {satSecondProp === 'x' ? '-' : units[satSecondProp]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AIR INPUTS */}
      {category === 'AIR' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>Propriedade Conhecida:</span>
                <select
                  value={airProp}
                  onChange={(e) => setAirProp(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-sky-300 font-mono rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="T">Temperatura (T) [K]</option>
                  <option value="h">Entalpia (h) [kJ/kg]</option>
                  <option value="Pr">Pressão Relativa (Pr)</option>
                  <option value="u">Energia Interna (u) [kJ/kg]</option>
                  <option value="vr">Volume Relativo (vr)</option>
                  <option value="s0">Entropia Padrão (s°) [kJ/kg·K]</option>
                </select>
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={airVal}
                onChange={(e) => setAirVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder="Ex: 300"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">
                {airProp}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium">Pressão do Ar (P) [{units.P}]:</label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={airPressure}
                onChange={(e) => setAirPressure(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder="Ex: 1"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">
                {units.P}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* IDEAL GAS INPUTS */}
      {category === 'IDEAL_GASES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Temperatura (T) [{units.T}]:</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={gasT}
                onChange={(e) => setGasT(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder="Ex: 25"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">{units.T}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Pressão (P) [{units.P}]:</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={gasP}
                onChange={(e) => setGasP(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder="Ex: 1"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">{units.P}</span>
            </div>
          </div>
        </div>
      )}

      {/* COMPRESSIBILITY INPUTS */}
      {category === 'COMPRESSIBILITY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Pressão Reduzida (Pr = P / Pc):</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={compPr}
                onChange={(e) => setCompPr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder="Ex: 1.5"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">Pr</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Temperatura Reduzida (Tr = T / Tc):</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={compTr}
                onChange={(e) => setCompTr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder="Ex: 1.2"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">Tr</span>
            </div>
          </div>
        </div>
      )}

      {/* PSYCHROMETRICS INPUTS */}
      {category === 'PSYCHROMETRICS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Temperatura de Bulbo Seco (Tbs) [°C]:</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={psyTdb}
                onChange={(e) => setPsyTdb(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder="Ex: 25"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">°C</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>Segunda Propriedade:</span>
                <select
                  value={psyMode}
                  onChange={(e) => setPsyMode(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-sky-300 font-mono rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="RH">Umidade Relativa (UR%)</option>
                  <option value="Twb">Bulbo Úmido (Tbu) [°C]</option>
                  <option value="Tdp">Ponto de Orvalho (Tpo) [°C]</option>
                  <option value="w">Razão de Umidade (w) [kg/kg]</option>
                </select>
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={psyVal}
                onChange={(e) => setPsyVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                placeholder={psyMode === 'RH' ? '0 a 100 (Ex: 50)' : 'Valor'}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">
                {psyMode === 'RH' ? '%' : psyMode === 'w' ? 'kg/kg' : '°C'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* QUICK PRESET CHIPS (Convenient for mobile during class) */}
      {isTwoPhaseFluid && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] font-mono text-slate-400">
          <span className="text-slate-500 text-[10px] uppercase font-sans font-semibold mr-1">Atalhos:</span>
          <button
            type="button"
            onClick={() => {
              if (mode === 'GENERAL') {
                setProp1Name('P'); setProp1Value('1');
                setProp2Name('T'); setProp2Value('100');
              } else {
                setSatBasis('P'); setSatBasisValue('1');
                setSatSecondProp('x'); setSatSecondValue('1');
              }
              setTimeout(onCalculate, 10);
            }}
            className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-300 transition-colors"
          >
            1 bar (atm)
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === 'GENERAL') {
                setProp1Name('P'); setProp1Value('10');
                setProp2Name('T'); setProp2Value('300');
              } else {
                setSatBasis('P'); setSatBasisValue('10');
                setSatSecondProp('x'); setSatSecondValue('1');
              }
              setTimeout(onCalculate, 10);
            }}
            className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-300 transition-colors"
          >
            10 bar
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === 'GENERAL') {
                setProp1Name('P'); setProp1Value('1');
                setProp2Name('x'); setProp2Value('0');
              } else {
                setSatSecondProp('x'); setSatSecondValue('0');
              }
              setTimeout(onCalculate, 10);
            }}
            className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-300 transition-colors"
          >
            x = 0 (Líq. Sat)
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === 'GENERAL') {
                setProp1Name('P'); setProp1Value('1');
                setProp2Name('x'); setProp2Value('1');
              } else {
                setSatSecondProp('x'); setSatSecondValue('1');
              }
              setTimeout(onCalculate, 10);
            }}
            className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-300 transition-colors"
          >
            x = 1 (Vap. Sat)
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Calculate Button */}
      <button
        type="button"
        onClick={onCalculate}
        className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-950/50"
      >
        <span>Calcular Estado</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
