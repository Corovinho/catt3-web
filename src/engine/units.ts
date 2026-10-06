import { UnitSystem } from '../types/thermo';

export interface ConvertedState {
  T_str: string;
  P_str: string;
  v_str: string;
  u_str: string;
  h_str: string;
  s_str: string;
  units: {
    T: string;
    P: string;
    v: string;
    u: string;
    h: string;
    s: string;
  };
}

export class UnitConverter {
  // Convert from display unit to base internal SI (T in °C, P in MPa, v in m³/kg, etc.)
  static toInternalT(val: number, unit: string): number {
    switch (unit) {
      case 'C': return val;
      case 'K': return val - 273.15;
      case 'F': return (val - 32) * (5 / 9);
      case 'R': return (val - 491.67) * (5 / 9);
      default: return val;
    }
  }

  static fromInternalT(valC: number, unit: string): number {
    switch (unit) {
      case 'C': return valC;
      case 'K': return valC + 273.15;
      case 'F': return valC * (9 / 5) + 32;
      case 'R': return (valC + 273.15) * 1.8;
      default: return valC;
    }
  }

  static toInternalP(val: number, unit: string): number {
    switch (unit) {
      case 'MPa': return val;
      case 'bar': return val * 0.1;
      case 'kPa': return val * 0.001;
      case 'psia': return val * 0.006894757;
      case 'atm': return val * 0.101325;
      default: return val;
    }
  }

  static fromInternalP(valMPa: number, unit: string): number {
    switch (unit) {
      case 'MPa': return valMPa;
      case 'bar': return valMPa * 10;
      case 'kPa': return valMPa * 1000;
      case 'psia': return valMPa / 0.006894757;
      case 'atm': return valMPa / 0.101325;
      default: return valMPa;
    }
  }

  static toInternalV(val: number, unit: string, molarMass: number = 18.015): number {
    switch (unit) {
      case 'm3/kg': return val;
      case 'dm3/mol': return (val * 0.001) / (molarMass * 0.001); // (dm3/mol = 1e-3 m3/mol) / (kg/mol)
      case 'ft3/lbm': return val * 0.06242796;
      case 'ft3/lbm-mol': return (val * 0.06242796) / molarMass;
      default: return val;
    }
  }

  static fromInternalV(valM3Kg: number, unit: string, molarMass: number = 18.015): number {
    switch (unit) {
      case 'm3/kg': return valM3Kg;
      case 'dm3/mol': return (valM3Kg * (molarMass * 0.001)) / 0.001; // m3/kg * kg/mol / (1e-3)
      case 'ft3/lbm': return valM3Kg / 0.06242796;
      case 'ft3/lbm-mol': return (valM3Kg * molarMass) / 0.06242796;
      default: return valM3Kg;
    }
  }

  static toInternalEnergy(val: number, unit: string, molarMass: number = 18.015): number {
    switch (unit) {
      case 'kJ/kg': return val;
      case 'kJ/kmol': return val / molarMass;
      case 'Btu/lbm': return val * 2.326;
      case 'Btu/lbm-mol': return (val * 2.326) / molarMass;
      default: return val;
    }
  }

  static fromInternalEnergy(valKjKg: number, unit: string, molarMass: number = 18.015): number {
    switch (unit) {
      case 'kJ/kg': return valKjKg;
      case 'kJ/kmol': return valKjKg * molarMass;
      case 'Btu/lbm': return valKjKg / 2.326;
      case 'Btu/lbm-mol': return (valKjKg * molarMass) / 2.326;
      default: return valKjKg;
    }
  }

  static toInternalEntropy(val: number, unit: string, molarMass: number = 18.015): number {
    switch (unit) {
      case 'kJ/kg.K': return val;
      case 'kJ/kmol.K': return val / molarMass;
      case 'Btu/lbm.R': return val * 4.1868;
      case 'Btu/lbm-mol.R': return (val * 4.1868) / molarMass;
      default: return val;
    }
  }

  static fromInternalEntropy(valKjKgK: number, unit: string, molarMass: number = 18.015): number {
    switch (unit) {
      case 'kJ/kg.K': return valKjKgK;
      case 'kJ/kmol.K': return valKjKgK * molarMass;
      case 'Btu/lbm.R': return valKjKgK / 4.1868;
      case 'Btu/lbm-mol.R': return (valKjKgK * molarMass) / 4.1868;
      default: return valKjKgK;
    }
  }

  static getUnitLabels(system: UnitSystem, pressurePref: 'bar' | 'kPa' | 'MPa' = 'bar') {
    switch (system) {
      case 'SI':
        return {
          T: '°C',
          P: pressurePref,
          v: 'm³/kg',
          u: 'kJ/kg',
          h: 'kJ/kg',
          s: 'kJ/(kg·K)'
        };
      case 'SI_MOLE':
        return {
          T: 'K',
          P: 'MPa',
          v: 'dm³/mol',
          u: 'kJ/kmol',
          h: 'kJ/kmol',
          s: 'kJ/(kmol·K)'
        };
      case 'BRITISH':
        return {
          T: '°F',
          P: 'psia',
          v: 'ft³/lbm',
          u: 'Btu/lbm',
          h: 'Btu/lbm',
          s: 'Btu/(lbm·°R)'
        };
      case 'BRITISH_MOLE':
        return {
          T: '°R',
          P: 'psia',
          v: 'ft³/lbm-mol',
          u: 'Btu/lbm-mol',
          h: 'Btu/lbm-mol',
          s: 'Btu/(lbm-mol·°R)'
        };
    }
  }
}
