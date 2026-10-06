import React from 'react';
import { UnitSystem } from '../types/thermo';
import { Activity, BookOpen, Layers, LineChart, Sparkles } from 'lucide-react';

interface NavbarProps {
  unitSystem: UnitSystem;
  setUnitSystem: (u: UnitSystem) => void;
  activeView: 'calc' | 'log' | 'diagram';
  setActiveView: (v: 'calc' | 'log' | 'diagram') => void;
  logCount: number;
  onOpenProcess: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  unitSystem,
  setUnitSystem,
  activeView,
  setActiveView,
  logCount,
  onOpenProcess,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-600/40 flex items-center justify-center text-sky-400 font-bold text-sm tracking-wider shadow-inner">
            C3
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 tracking-tight text-sm sm:text-base">CATT3 Web</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">v3.2</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Computer-Aided Thermodynamic Tables</p>
          </div>
        </div>

        {/* View Switcher (Tabs) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveView('calc')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'calc'
                ? 'bg-slate-800 text-sky-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Calcular</span>
          </button>

          <button
            onClick={() => setActiveView('log')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'log'
                ? 'bg-slate-800 text-sky-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Estados</span>
            {logCount > 0 && (
              <span className="ml-0.5 px-1 py-0.2 rounded-full text-[10px] bg-sky-950 text-sky-400 border border-sky-800/60 font-mono">
                {logCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('diagram')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'diagram'
                ? 'bg-slate-800 text-sky-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Diagrama</span>
          </button>
        </div>

        {/* Unit and Process Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProcess}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-sky-300 transition-colors"
            title="Traçar processo termodinâmico (Isotérmico, Isobárico, Isentrópico...)"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Processo</span>
          </button>

          {/* Unit Selector */}
          <select
            value={unitSystem}
            onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono transition-colors"
          >
            <option value="SI">SI (bar / °C)</option>
            <option value="SI_MOLE">SI Mole (MPa / K)</option>
            <option value="BRITISH">British (psia / °F)</option>
            <option value="BRITISH_MOLE">British Mole (°R)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
