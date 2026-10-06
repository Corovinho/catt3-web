export type UnitSystem = 'SI' | 'SI_MOLE' | 'BRITISH' | 'BRITISH_MOLE';

export type PressureUnit = 'MPa' | 'bar' | 'kPa' | 'psia' | 'atm';
export type TemperatureUnit = 'C' | 'K' | 'F' | 'R';
export type VolumeUnit = 'm3/kg' | 'dm3/mol' | 'ft3/lbm' | 'ft3/lbm-mol';
export type EnergyUnit = 'kJ/kg' | 'kJ/kmol' | 'Btu/lbm' | 'Btu/lbm-mol';
export type EntropyUnit = 'kJ/kg.K' | 'kJ/kmol.K' | 'Btu/lbm.R' | 'Btu/lbm-mol.R';

export interface UnitConfig {
  system: UnitSystem;
  temperature: TemperatureUnit;
  pressure: PressureUnit;
  volume: VolumeUnit;
  energy: EnergyUnit;
  entropy: EntropyUnit;
}

export type SubstanceCategory = 
  | 'WATER'
  | 'REFRIGERANTS'
  | 'CRYOGENICS'
  | 'AIR'
  | 'IDEAL_GASES'
  | 'COMPRESSIBILITY'
  | 'PSYCHROMETRICS';

export interface SubstanceInfo {
  id: string;
  name: string;
  formula?: string;
  category: SubstanceCategory;
  molarMass?: number; // g/mol (or kg/kmol)
  criticalT?: number; // K
  criticalP?: number; // MPa
  criticalV?: number; // m3/kg
}

export type CalcMode = 'GENERAL' | 'SATURATION';

export type InputProperty = 
  | 'T' // Temperature
  | 'P' // Pressure
  | 'v' // Specific volume
  | 'u' // Internal energy
  | 'h' // Enthalpy
  | 's' // Entropy
  | 'x' // Quality (título)
  // For air:
  | 'Pr'
  | 'vr'
  | 's0'
  // For psychrometrics:
  | 'Tdb'
  | 'Twb'
  | 'RH'
  | 'Tdp'
  | 'w';

export type ThermodynamicPhase = 
  | 'Subcooled Liquid' // Líquido comprimido
  | 'Saturated Mixture' // Mistura saturada líquido-vapor
  | 'Saturated Liquid' // Líquido saturado (x = 0)
  | 'Saturated Vapor' // Vapor saturado seco (x = 1)
  | 'Superheated Vapor' // Vapor superaquecido
  | 'Supercritical' // Fluido supercrítico
  | 'Gas' // Gás ideal
  | 'Moist Air'; // Ar úmido

export interface ThermodynamicState {
  id: string;
  stateNumber: number;
  label?: string;
  timestamp: number;
  substanceId: string;
  substanceName: string;
  category: SubstanceCategory;
  mode: CalcMode;
  
  // Standard SI properties
  T: number; // °C
  P: number; // bar or MPa depending on display
  P_MPa: number; // internal standard MPa
  v: number; // m³/kg
  u: number; // kJ/kg
  h: number; // kJ/kg
  s: number; // kJ/(kg·K)
  x?: number | null; // quality [0, 1]
  phase: ThermodynamicPhase;
  
  // Saturation boundaries if in 2-phase or saturation mode
  vf?: number;
  vg?: number;
  uf?: number;
  ug?: number;
  hf?: number;
  hg?: number;
  sf?: number;
  sg?: number;

  // Air specific
  Pr?: number;
  vr?: number;
  s0?: number;

  // Compressibility specific
  Tr?: number;
  Pr_red?: number;
  Z?: number;

  // Psychrometric specific
  Tdb?: number; // °C
  Twb?: number; // °C
  RH?: number; // %
  w?: number; // kg water / kg dry air
  Tdp?: number; // °C
  v_psychro?: number; // m³/kg dry air
  h_psychro?: number; // kJ/kg dry air
}

export type ProcessType = 
  | 'ISOTHERMAL' // T = const
  | 'ISOBARIC'   // P = const
  | 'ISENTROPIC'  // s = const
  | 'ISOCHORIC'  // v = const
  | 'POLYTROPIC'; // P*v^n = const
