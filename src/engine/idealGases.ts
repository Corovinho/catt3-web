import { ThermodynamicState } from '../types/thermo';

export interface GasSpecies {
  id: string;
  name: string;
  formula: string;
  M: number; // Molar mass g/mol or kg/kmol
  // NIST Shomate parameters [A, B, C, D, E, F, G, H] for T in [298, 1200] K
  // Cp = A + B*t + C*t^2 + D*t^3 + E/t^2 (J/(mol*K))
  // H° - H°_298 = A*t + B*t^2/2 + C*t^3/3 + D*t^4/4 - E/t + F - H (kJ/mol)
  // S° = A*ln(t) + B*t + C*t^2/2 + D*t^3/3 - E/(2*t^2) + G (J/(mol*K))
  // where t = T / 1000
  shomate: [number, number, number, number, number, number, number, number];
}

export const GAS_CATALOG: Record<string, GasSpecies> = {
  'co2': {
    id: 'co2',
    name: 'Dióxido de Carbono',
    formula: 'CO₂',
    M: 44.01,
    shomate: [24.99735, 55.18696, -33.69137, 7.948387, -0.136638, -403.6075, 228.2431, -393.5224]
  },
  'co': {
    id: 'co',
    name: 'Monóxido de Carbono',
    formula: 'CO',
    M: 28.01,
    shomate: [25.56759, 6.096130, 4.054656, -2.671301, 0.131021, -118.0089, 227.3665, -110.5271]
  },
  'n2': {
    id: 'n2',
    name: 'Nitrogênio',
    formula: 'N₂',
    M: 28.013,
    shomate: [26.09200, 8.218801, -1.976141, 0.159274, 0.044454, -7.989230, 221.0200, 0.0000]
  },
  'o2': {
    id: 'o2',
    name: 'Oxigênio',
    formula: 'O₂',
    M: 31.999,
    shomate: [29.65900, 6.137261, -1.186521, 0.095780, -0.219663, -9.861391, 237.9480, 0.0000]
  },
  'h2': {
    id: 'h2',
    name: 'Hidrogênio',
    formula: 'H₂',
    M: 2.016,
    shomate: [33.066178, -11.363417, 11.432816, -2.772874, -0.158558, -9.980797, 172.707974, 0.0000]
  },
  'h2o_gas': {
    id: 'h2o_gas',
    name: 'Vapor d\'Água (Gás Ideal)',
    formula: 'H₂O (g)',
    M: 18.015,
    shomate: [30.09200, 6.832514, 6.793435, -2.534480, 0.082139, -250.8810, 223.3967, -241.8264]
  },
  'ch4': {
    id: 'ch4',
    name: 'Metano',
    formula: 'CH₄',
    M: 16.04,
    shomate: [-0.703029, 108.4773, -42.52157, 5.862788, 0.678565, -76.84376, 214.3989, -74.87310]
  },
  'no': {
    id: 'no',
    name: 'Monóxido de Nitrogênio',
    formula: 'NO',
    M: 30.006,
    shomate: [29.83980, -2.628960, 4.887960, -1.822890, 0.048700, 83.12000, 240.2000, 90.2900]
  },
  'no2': {
    id: 'no2',
    name: 'Dióxido de Nitrogênio',
    formula: 'NO₂',
    M: 46.005,
    shomate: [27.70110, 48.75160, -32.55640, 8.423700, -0.160100, 22.84000, 273.7000, 33.1000]
  },
  'n': {
    id: 'n',
    name: 'Nitrogênio Monoatômico',
    formula: 'N',
    M: 14.0067,
    shomate: [20.786, 0.0, 0.0, 0.0, 0.0, 467.5, 153.3, 472.6]
  },
  'h': {
    id: 'h',
    name: 'Hidrogênio Monoatômico',
    formula: 'H',
    M: 1.008,
    shomate: [20.786, 0.0, 0.0, 0.0, 0.0, 212.0, 114.7, 218.0]
  },
  'o': {
    id: 'o',
    name: 'Oxigênio Monoatômico',
    formula: 'O',
    M: 15.9994,
    shomate: [21.90, -1.80, 0.90, -0.20, 0.0, 244.0, 161.0, 249.2]
  },
  'oh': {
    id: 'oh',
    name: 'Radical Hidroxila',
    formula: 'OH',
    M: 17.007,
    shomate: [29.80, -2.50, 4.50, -1.50, 0.05, 34.0, 183.0, 39.3]
  },
  'h2o': {
    id: 'h2o',
    name: 'Vapor d\'Água (Gás Ideal)',
    formula: 'H₂O',
    M: 18.015,
    shomate: [30.09200, 6.832514, 6.793435, -2.534480, 0.082139, -250.8810, 223.3967, -241.8264]
  }
};

export class IdealGasEngine {
  static readonly R_UNIVERSAL = 8.314462618; // kJ/(kmol·K)

  static solve(gasId: string, T_C: number, P_bar: number = 1.01325): ThermodynamicState {
    const gas = GAS_CATALOG[gasId] || GAS_CATALOG['co2'];
    const T_K = Math.max(200, Math.min(2500, T_C + 273.15));
    const t = T_K / 1000;
    const [A, B, C, D, E, F, G] = gas.shomate;

    // Enthalpy in kJ/mol -> convert to kJ/kg
    const H_molar = (A * t + (B * t * t) / 2 + (C * Math.pow(t, 3)) / 3 + (D * Math.pow(t, 4)) / 4 - E / t + F); // kJ/mol
    const h = (H_molar * 1000) / gas.M; // kJ/kg

    // Entropy in J/(mol·K) -> convert to kJ/(kg·K)
    const S0_molar = (A * Math.log(t) + B * t + (C * t * t) / 2 + (D * Math.pow(t, 3)) / 3 - E / (2 * t * t) + G); // J/(mol·K)
    const s0 = S0_molar / gas.M; // kJ/(kg·K)

    // Gas constant R_gas = R_u / M (kJ/(kg·K))
    const R_gas = this.R_UNIVERSAL / gas.M;

    // Internal energy u = h - R*T
    const u = h - R_gas * T_K;

    // Specific volume v = R*T / P (where P in kPa = P_bar * 100)
    const P_kPa = P_bar * 100;
    const v = (R_gas * T_K) / P_kPa;

    // Total entropy s = s0 - R_gas * ln(P / P0), P0 = 1 bar
    const s = s0 - R_gas * Math.log(P_bar);

    return {
      id: Math.random().toString(36).substring(2, 9),
      stateNumber: 1,
      timestamp: Date.now(),
      substanceId: gas.id,
      substanceName: `${gas.name} (${gas.formula})`,
      category: 'IDEAL_GASES',
      mode: 'GENERAL',
      T: T_C,
      P: P_bar,
      P_MPa: P_bar * 0.1,
      v,
      u,
      h,
      s,
      phase: 'Gas',
      s0
    };
  }
}
