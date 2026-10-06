import React from 'react';
import { UnitSystem } from '../types/thermo';
import { Activity, Layers, LineChart, Sparkles } from 'lucide-react';

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
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Phase Diagram Logo */}
        <div className="flex items-center gap-3">
          {/* Minimalist Phase Diagram Logo */}
          <div className="w-8 h-8 bg-white border border-slate-900 flex items-center justify-center p-1 shadow-sm shrink-0">
            <svg viewBox="0 0 28 28" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Axes (L-shape) */}
              <line x1="3" y1="2" x2="3" y2="25" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="square" />
              <line x1="3" y1="25" x2="26" y2="25" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="square" />
              
              {/* Minimalist Phase Diagram / Vapor Dome */}
              <path
                d="M 5 24 C 9 17, 13 8, 15 8 C 17 8, 21 17, 25 24"
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
              
              {/* Critical Point Dot */}
              <circle cx="15" cy="8" r="1.8" fill="#0f172a" />
              
              {/* Isobar / Tie-line in two-phase region */}
              <line x1="8" y1="17" x2="22" y2="17" stroke="#64748b" strokeWidth="1" strokeDasharray="1.8 1.2" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-950 tracking-tight text-sm sm:text-base uppercase">CATT3 Web</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-300">v3.2</span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block font-mono tracking-tight">Tabelas Termodinâmicas Computacionais</p>
          </div>
        </div>

        {/* View Switcher (Tabs with Straight Edges) */}
        <div className="flex items-center bg-slate-200 border border-slate-400 p-0.5 text-xs font-mono">
          <button
            onClick={() => setActiveView('calc')}
            className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
              activeView === 'calc'
                ? 'bg-black text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-slate-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>CALCULAR</span>
          </button>

          <button
            onClick={() => setActiveView('log')}
            className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
              activeView === 'log'
                ? 'bg-black text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ESTADOS</span>
            {logCount > 0 && (
              <span className={`ml-0.5 px-1 py-0.2 text-[10px] font-mono ${
                activeView === 'log' ? 'bg-white text-black' : 'bg-black text-white'
              }`}>
                {logCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('diagram')}
            className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
              activeView === 'diagram'
                ? 'bg-black text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-slate-300'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>DIAGRAMA</span>
          </button>
        </div>

        {/* Action and Unit buttons (Straight Edges) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProcess}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 transition-colors font-mono"
            title="Traçar processo termodinâmico (Isotérmico, Isobárico, Isentrópico...)"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-700" />
            <span>PROCESSO</span>
          </button>

          {/* Unit Selector */}
          <select
            value={unitSystem}
            onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
            className="bg-white border border-slate-300 text-slate-900 text-xs px-2.5 py-1.5 focus:outline-none focus:border-black font-mono transition-colors cursor-pointer"
          >
            <option value="SI">SI (MPa / °C)</option>
            <option value="SI_MOLE">SI Molar (MPa / K)</option>
            <option value="BRITISH">Britânico / Imperial (psia / °F)</option>
            <option value="BRITISH_MOLE">Britânico Molar (psia / °R)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
