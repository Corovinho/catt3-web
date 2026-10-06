import React, { useState, useRef, useEffect } from 'react';
import { SubstanceCategory } from '../types/thermo';
import { Check, ChevronRight } from 'lucide-react';

interface Catt3DesktopMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategory: SubstanceCategory;
  currentSubstanceId: string;
  onSelect: (category: SubstanceCategory, substanceId?: string) => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

// 20 Refrigerants in 2 Columns matching CATT3 screenshot
const REFRIGERANTS_COL1 = [
  { id: 'co2', label: 'CO2' },
  { id: 'r11', label: 'R-11' },
  { id: 'r12', label: 'R-12' },
  { id: 'r13', label: 'R-13' },
  { id: 'r14', label: 'R-14' },
  { id: 'r21', label: 'R-21' },
  { id: 'r22', label: 'R-22' },
  { id: 'r23', label: 'R-23' },
  { id: 'r113', label: 'R-113' },
  { id: 'r114', label: 'R-114' },
  { id: 'r123', label: 'R-123' },
];

const REFRIGERANTS_COL2 = [
  { id: 'r134a', label: 'R-134a' },
  { id: 'r152a', label: 'R-152a' },
  { id: 'r404a', label: 'R-404a' },
  { id: 'r407c', label: 'R-407c' },
  { id: 'r410a', label: 'R-410a' },
  { id: 'r500', label: 'R-500' },
  { id: 'r502', label: 'R-502' },
  { id: 'r507a', label: 'R-507a' },
  { id: 'rc318', label: 'R-c318' },
];

// 11 Cryogenics matching CATT3 screenshot
const CRYOGENICS_ITEMS = [
  { id: 'ammonia', label: 'Ammonia', alt: 'nh3' },
  { id: 'argon', label: 'Argon' },
  { id: 'ethane', label: 'Ethane' },
  { id: 'ethylene', label: 'Ethylene' },
  { id: 'helium', label: 'Helium' },
  { id: 'isobutane', label: 'Iso-Butane' },
  { id: 'methane', label: 'Methane', alt: 'ch4' },
  { id: 'neon', label: 'Neon' },
  { id: 'nitrogen', label: 'Nitrogen', alt: 'n2' },
  { id: 'oxygen', label: 'Oxygen', alt: 'o2' },
  { id: 'propane', label: 'Propane' },
];

// 12 Ideal Gases matching CATT3 screenshot
const IDEAL_GASES_ITEMS = [
  { id: 'co', label: 'CO' },
  { id: 'co2', label: 'CO2' },
  { id: 'n', label: 'N' },
  { id: 'n2', label: 'N2' },
  { id: 'no', label: 'NO' },
  { id: 'no2', label: 'NO2' },
  { id: 'h', label: 'H' },
  { id: 'h2', label: 'H2' },
  { id: 'h2o', label: 'H2O', alt: 'h2o_gas' },
  { id: 'o', label: 'O' },
  { id: 'o2', label: 'O2' },
  { id: 'oh', label: 'OH' },
];

export const Catt3DesktopMenu: React.FC<Catt3DesktopMenuProps> = ({
  isOpen,
  onClose,
  currentCategory,
  currentSubstanceId,
  onSelect,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<'refrigerants' | 'cryogenics' | 'idealgases' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (cat: SubstanceCategory, subId?: string) => {
    onSelect(cat, subId);
    onClose();
  };

  const isRefSelected = (id: string) =>
    currentCategory === 'REFRIGERANTS' && (currentSubstanceId === id || currentSubstanceId.toLowerCase() === id.toLowerCase());

  const isCryoSelected = (item: { id: string; alt?: string }) =>
    currentCategory === 'CRYOGENICS' &&
    (currentSubstanceId === item.id || (item.alt && currentSubstanceId === item.alt));

  const isGasSelected = (item: { id: string; alt?: string }) =>
    currentCategory === 'IDEAL_GASES' &&
    (currentSubstanceId === item.id || (item.alt && currentSubstanceId === item.alt));

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 z-50 bg-[#f0f0f0] border border-[#7a7a7a] shadow-xl text-slate-900 font-sans text-[12px] select-none py-0.5 min-w-[170px]"
      style={{
        boxShadow: '2px 3px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* 1. Water */}
      <button
        onClick={() => handleItemClick('WATER', 'water')}
        onMouseEnter={() => setActiveSubmenu(null)}
        className="w-full flex items-center px-1.5 py-1 hover:bg-[#0078d7] hover:text-white text-left cursor-default transition-none group"
      >
        <span className="w-5 flex items-center justify-center shrink-0">
          {currentCategory === 'WATER' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </span>
        <span className="grow">Water</span>
      </button>

      {/* 2. Refrigerants (Flyout Submenu with 2 Columns) */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('refrigerants')}
      >
        <button
          onClick={() => handleItemClick('REFRIGERANTS', currentSubstanceId || 'r134a')}
          className={`w-full flex items-center px-1.5 py-1 text-left cursor-default transition-none ${
            activeSubmenu === 'refrigerants'
              ? 'bg-[#0078d7] text-white'
              : 'hover:bg-[#0078d7] hover:text-white'
          }`}
        >
          <span className="w-5 flex items-center justify-center shrink-0">
            {currentCategory === 'REFRIGERANTS' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </span>
          <span className="grow">Refrigerants</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
        </button>

        {/* Flyout 2-column menu for Refrigerants */}
        {activeSubmenu === 'refrigerants' && (
          <div
            className="absolute top-0 left-full -ml-0.5 bg-[#f0f0f0] border border-[#7a7a7a] shadow-xl text-slate-900 text-[12px] py-0.5 flex z-50"
            style={{
              boxShadow: '2px 3px 8px rgba(0,0,0,0.3)',
            }}
          >
            {/* Column 1 */}
            <div className="min-w-[100px] border-r border-slate-300">
              {REFRIGERANTS_COL1.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick('REFRIGERANTS', item.id)}
                  className="w-full flex items-center px-1.5 py-0.5 hover:bg-[#0078d7] hover:text-white text-left cursor-default whitespace-nowrap"
                >
                  <span className="w-5 flex items-center justify-center shrink-0">
                    {isRefSelected(item.id) && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Column 2 */}
            <div className="min-w-[100px]">
              {REFRIGERANTS_COL2.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick('REFRIGERANTS', item.id)}
                  className="w-full flex items-center px-1.5 py-0.5 hover:bg-[#0078d7] hover:text-white text-left cursor-default whitespace-nowrap"
                >
                  <span className="w-5 flex items-center justify-center shrink-0">
                    {isRefSelected(item.id) && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Cryogenics (Flyout Submenu with 1 Column) */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('cryogenics')}
      >
        <button
          onClick={() => handleItemClick('CRYOGENICS', currentSubstanceId || 'ammonia')}
          className={`w-full flex items-center px-1.5 py-1 text-left cursor-default transition-none ${
            activeSubmenu === 'cryogenics'
              ? 'bg-[#0078d7] text-white'
              : 'hover:bg-[#0078d7] hover:text-white'
          }`}
        >
          <span className="w-5 flex items-center justify-center shrink-0">
            {currentCategory === 'CRYOGENICS' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </span>
          <span className="grow">Cryogenics</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
        </button>

        {/* Flyout 1-column menu for Cryogenics */}
        {activeSubmenu === 'cryogenics' && (
          <div
            className="absolute top-0 left-full -ml-0.5 bg-[#f0f0f0] border border-[#7a7a7a] shadow-xl text-slate-900 text-[12px] py-0.5 min-w-[120px] z-50"
            style={{
              boxShadow: '2px 3px 8px rgba(0,0,0,0.3)',
            }}
          >
            {CRYOGENICS_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick('CRYOGENICS', item.id)}
                className="w-full flex items-center px-1.5 py-0.5 hover:bg-[#0078d7] hover:text-white text-left cursor-default whitespace-nowrap"
              >
                <span className="w-5 flex items-center justify-center shrink-0">
                  {isCryoSelected(item) && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Air */}
      <button
        onClick={() => handleItemClick('AIR', 'air')}
        onMouseEnter={() => setActiveSubmenu(null)}
        className="w-full flex items-center px-1.5 py-1 hover:bg-[#0078d7] hover:text-white text-left cursor-default transition-none"
      >
        <span className="w-5 flex items-center justify-center shrink-0">
          {currentCategory === 'AIR' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </span>
        <span className="grow">Air</span>
      </button>

      {/* 5. Ideal Gases (Flyout Submenu with 1 Column) */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('idealgases')}
      >
        <button
          onClick={() => handleItemClick('IDEAL_GASES', currentSubstanceId || 'co2')}
          className={`w-full flex items-center px-1.5 py-1 text-left cursor-default transition-none ${
            activeSubmenu === 'idealgases'
              ? 'bg-[#0078d7] text-white'
              : 'hover:bg-[#0078d7] hover:text-white'
          }`}
        >
          <span className="w-5 flex items-center justify-center shrink-0">
            {currentCategory === 'IDEAL_GASES' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </span>
          <span className="grow">Ideal Gases</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
        </button>

        {/* Flyout 1-column menu for Ideal Gases */}
        {activeSubmenu === 'idealgases' && (
          <div
            className="absolute top-0 left-full -ml-0.5 bg-[#f0f0f0] border border-[#7a7a7a] shadow-xl text-slate-900 text-[12px] py-0.5 min-w-[100px] z-50"
            style={{
              boxShadow: '2px 3px 8px rgba(0,0,0,0.3)',
            }}
          >
            {IDEAL_GASES_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick('IDEAL_GASES', item.id)}
                className="w-full flex items-center px-1.5 py-0.5 hover:bg-[#0078d7] hover:text-white text-left cursor-default whitespace-nowrap"
              >
                <span className="w-5 flex items-center justify-center shrink-0">
                  {isGasSelected(item) && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 6. Compressibility */}
      <button
        onClick={() => handleItemClick('COMPRESSIBILITY', 'compressibility')}
        onMouseEnter={() => setActiveSubmenu(null)}
        className="w-full flex items-center px-1.5 py-1 hover:bg-[#0078d7] hover:text-white text-left cursor-default transition-none"
      >
        <span className="w-5 flex items-center justify-center shrink-0">
          {currentCategory === 'COMPRESSIBILITY' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </span>
        <span className="grow">Compressibility</span>
      </button>

      {/* 7. Psychrometrics (Pychrometrics) */}
      <button
        onClick={() => handleItemClick('PSYCHROMETRICS', 'psychrometrics')}
        onMouseEnter={() => setActiveSubmenu(null)}
        className="w-full flex items-center px-1.5 py-1 hover:bg-[#0078d7] hover:text-white text-left cursor-default transition-none"
      >
        <span className="w-5 flex items-center justify-center shrink-0">
          {currentCategory === 'PSYCHROMETRICS' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </span>
        <span className="grow">Pychrometrics</span>
      </button>
    </div>
  );
};
