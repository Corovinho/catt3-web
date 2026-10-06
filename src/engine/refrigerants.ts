import { ThermodynamicPhase, ThermodynamicState, CalcMode } from '../types/thermo';

export interface SaturationPoint {
  T: number; // °C
  P: number; // bar
  vf: number; // m3/kg
  vg: number; // m3/kg
  uf: number; // kJ/kg
  ug: number; // kJ/kg
  hf: number; // kJ/kg
  hg: number; // kJ/kg
  sf: number; // kJ/(kg·K)
  sg: number; // kJ/(kg·K)
}

export interface FluidDefinition {
  id: string;
  name: string;
  formula: string;
  category: 'REFRIGERANTS' | 'CRYOGENICS';
  molarMass: number; // kg/kmol
  Tc: number; // °C
  Pc: number; // bar
  table: SaturationPoint[];
}

// Moran & Shapiro Table A-10 / Çengel Table A-11: Saturated R-134a
export const R134A_TABLE: SaturationPoint[] = [
  { T: -40, P: 0.5125, vf: 0.0007055, vg: 0.36081, uf: -0.04, ug: 204.45, hf: 0.00,   hg: 222.88, sf: 0.0000, sg: 0.9687 },
  { T: -36, P: 0.6300, vf: 0.0007113, vg: 0.29744, uf: 5.06,  ug: 206.87, hf: 5.10,   hg: 225.27, sf: 0.0218, sg: 0.9572 },
  { T: -32, P: 0.7677, vf: 0.0007172, vg: 0.24709, uf: 10.18, ug: 209.28, hf: 10.23,  hg: 227.65, sf: 0.0433, sg: 0.9467 },
  { T: -28, P: 0.9280, vf: 0.0007233, vg: 0.20677, uf: 15.31, ug: 211.69, hf: 15.38,  hg: 230.02, sf: 0.0646, sg: 0.9372 },
  { T: -24, P: 1.1135, vf: 0.0007296, vg: 0.17424, uf: 20.46, ug: 214.08, hf: 20.54,  hg: 232.38, sf: 0.0856, sg: 0.9286 },
  { T: -20, P: 1.3273, vf: 0.0007361, vg: 0.14777, uf: 25.64, ug: 216.47, hf: 25.74,  hg: 234.72, sf: 0.1064, sg: 0.9208 },
  { T: -16, P: 1.5721, vf: 0.0007428, vg: 0.12607, uf: 30.83, ug: 218.84, hf: 30.95,  hg: 237.04, sf: 0.1269, sg: 0.9137 },
  { T: -12, P: 1.8509, vf: 0.0007498, vg: 0.10816, uf: 36.05, ug: 221.20, hf: 36.19,  hg: 239.34, sf: 0.1472, sg: 0.9073 },
  { T: -8,  P: 2.1666, vf: 0.0007569, vg: 0.09328, uf: 41.30, ug: 223.54, hf: 41.46,  hg: 241.62, sf: 0.1673, sg: 0.9015 },
  { T: -4,  P: 2.5222, vf: 0.0007644, vg: 0.08085, uf: 46.57, ug: 225.86, hf: 46.76,  hg: 243.88, sf: 0.1872, sg: 0.8962 },
  { T: 0,   P: 2.9280, vf: 0.0007721, vg: 0.07033, uf: 51.86, ug: 228.16, hf: 52.09,  hg: 246.11, sf: 0.2070, sg: 0.8914 },
  { T: 4,   P: 3.3765, vf: 0.0007801, vg: 0.06138, uf: 57.19, ug: 230.43, hf: 57.45,  hg: 248.31, sf: 0.2265, sg: 0.8871 },
  { T: 8,   P: 3.8765, vf: 0.0007884, vg: 0.05372, uf: 62.54, ug: 232.68, hf: 62.85,  hg: 250.48, sf: 0.2458, sg: 0.8831 },
  { T: 12,  P: 4.4325, vf: 0.0007971, vg: 0.04713, uf: 67.93, ug: 234.90, hf: 68.28,  hg: 252.61, sf: 0.2650, sg: 0.8795 },
  { T: 16,  P: 5.0445, vf: 0.0008062, vg: 0.04145, uf: 73.34, ug: 237.09, hf: 73.75,  hg: 254.70, sf: 0.2840, sg: 0.8762 },
  { T: 20,  P: 5.7170, vf: 0.0008157, vg: 0.03653, uf: 78.79, ug: 239.24, hf: 79.26,  hg: 256.75, sf: 0.3028, sg: 0.8732 },
  { T: 24,  P: 6.4560, vf: 0.0008257, vg: 0.03226, uf: 84.28, ug: 241.35, hf: 84.81,  hg: 258.74, sf: 0.3216, sg: 0.8704 },
  { T: 28,  P: 7.2660, vf: 0.0008362, vg: 0.02854, uf: 89.81, ug: 243.41, hf: 90.42,  hg: 260.69, sf: 0.3401, sg: 0.8678 },
  { T: 32,  P: 8.1520, vf: 0.0008473, vg: 0.02528, uf: 95.38, ug: 245.43, hf: 96.07,  hg: 262.58, sf: 0.3586, sg: 0.8654 },
  { T: 36,  P: 9.1190, vf: 0.0008590, vg: 0.02242, uf: 101.00,ug: 247.38, hf: 101.78, hg: 264.40, sf: 0.3769, sg: 0.8631 },
  { T: 40,  P: 10.166, vf: 0.0008714, vg: 0.01990, uf: 106.67,ug: 249.27, hf: 107.56, hg: 266.15, sf: 0.3951, sg: 0.8610 },
  { T: 44,  P: 11.299, vf: 0.0008847, vg: 0.01768, uf: 112.40,ug: 251.08, hf: 113.40, hg: 267.82, sf: 0.4132, sg: 0.8589 },
  { T: 48,  P: 12.522, vf: 0.0008988, vg: 0.01571, uf: 118.20,ug: 252.81, hf: 119.33, hg: 269.41, sf: 0.4312, sg: 0.8569 },
  { T: 52,  P: 13.841, vf: 0.0009141, vg: 0.01396, uf: 124.08,ug: 254.43, hf: 125.35, hg: 270.89, sf: 0.4491, sg: 0.8549 },
  { T: 56,  P: 15.260, vf: 0.0009306, vg: 0.01241, uf: 130.04,ug: 255.94, hf: 131.46, hg: 272.26, sf: 0.4670, sg: 0.8528 },
  { T: 60,  P: 16.786, vf: 0.0009485, vg: 0.01101, uf: 136.11,ug: 257.32, hf: 137.70, hg: 273.49, sf: 0.4849, sg: 0.8507 },
  { T: 70,  P: 21.162, vf: 0.0010025, vg: 0.00810, uf: 151.79,ug: 259.98, hf: 153.91, hg: 275.63, sf: 0.5298, sg: 0.8443 },
  { T: 80,  P: 26.332, vf: 0.0010777, vg: 0.00588, uf: 168.54,ug: 260.67, hf: 171.38, hg: 276.15, sf: 0.5758, sg: 0.8354 },
  { T: 90,  P: 32.440, vf: 0.0011938, vg: 0.00405, uf: 187.20,ug: 257.70, hf: 191.07, hg: 273.45, sf: 0.6247, sg: 0.8202 },
  { T: 100, P: 39.724, vf: 0.0015030, vg: 0.00220, uf: 212.00,ug: 240.00, hf: 217.97, hg: 255.00, sf: 0.6860, sg: 0.7850 }
];

// Ammonia (R-717 / NH3) Saturation table
export const NH3_TABLE: SaturationPoint[] = [
  { T: -50, P: 0.4088, vf: 0.001424, vg: 2.6256, uf: -43.8,  ug: 1258.9, hf: -43.7,  hg: 1366.2, sf: -0.191, sg: 6.126 },
  { T: -40, P: 0.7177, vf: 0.001452, vg: 1.5524, uf: 0.0,    ug: 1271.7, hf: 0.1,    hg: 1383.1, sf: 0.000,  sg: 5.931 },
  { T: -30, P: 1.1995, vf: 0.001482, vg: 0.9638, uf: 44.5,   ug: 1284.1, hf: 44.7,   hg: 1399.7, sf: 0.187,  sg: 5.753 },
  { T: -20, P: 1.9008, vf: 0.001515, vg: 0.6237, uf: 89.4,   ug: 1295.9, hf: 89.7,   hg: 1414.5, sf: 0.368,  sg: 5.592 },
  { T: -10, P: 2.9057, vf: 0.001551, vg: 0.4185, uf: 134.7,  ug: 1307.0, hf: 135.2,  hg: 1428.6, sf: 0.543,  sg: 5.445 },
  { T: 0,   P: 4.2939, vf: 0.001589, vg: 0.2895, uf: 180.5,  ug: 1317.2, hf: 181.2,  hg: 1441.5, sf: 0.713,  sg: 5.310 },
  { T: 10,  P: 6.1495, vf: 0.001631, vg: 0.2055, uf: 226.7,  ug: 1326.5, hf: 227.7,  hg: 1453.1, sf: 0.879,  sg: 5.184 },
  { T: 20,  P: 8.5700, vf: 0.001678, vg: 0.1492, uf: 273.5,  ug: 1334.6, hf: 274.9,  hg: 1462.8, sf: 1.040,  sg: 5.066 },
  { T: 30,  P: 11.665, vf: 0.001730, vg: 0.1105, uf: 320.9,  ug: 1341.3, hf: 322.9,  hg: 1470.2, sf: 1.198,  sg: 4.954 },
  { T: 40,  P: 15.543, vf: 0.001789, vg: 0.0831, uf: 369.0,  ug: 1346.4, hf: 371.8,  hg: 1475.6, sf: 1.353,  sg: 4.846 },
  { T: 50,  P: 20.330, vf: 0.001857, vg: 0.0634, uf: 418.1,  ug: 1349.5, hf: 421.9,  hg: 1478.4, sf: 1.506,  sg: 4.741 }
];

// R-22 Saturation table
export const R22_TABLE: SaturationPoint[] = [
  { T: -40, P: 1.050, vf: 0.000694, vg: 0.2052, uf: -0.05, ug: 208.5, hf: 0.02,  hg: 230.0, sf: 0.000, sg: 0.987 },
  { T: -30, P: 1.636, vf: 0.000713, vg: 0.1360, uf: 11.10, ug: 213.6, hf: 11.22, hg: 235.8, sf: 0.048, sg: 0.973 },
  { T: -20, P: 2.449, vf: 0.000733, vg: 0.0928, uf: 22.40, ug: 218.4, hf: 22.58, hg: 241.1, sf: 0.094, sg: 0.957 },
  { T: -10, P: 3.543, vf: 0.000755, vg: 0.0653, uf: 33.90, ug: 222.8, hf: 34.17, hg: 245.9, sf: 0.138, sg: 0.943 },
  { T: 0,   P: 4.976, vf: 0.000779, vg: 0.0471, uf: 45.70, ug: 226.9, hf: 46.09, hg: 250.3, sf: 0.181, sg: 0.928 },
  { T: 10,  P: 6.807, vf: 0.000806, vg: 0.0347, uf: 57.80, ug: 230.5, hf: 58.35, hg: 254.1, sf: 0.222, sg: 0.914 },
  { T: 20,  P: 9.099, vf: 0.000837, vg: 0.0260, uf: 70.20, ug: 233.6, hf: 70.96, hg: 257.3, sf: 0.263, sg: 0.900 },
  { T: 30,  P: 11.92, vf: 0.000872, vg: 0.0197, uf: 83.00, ug: 236.1, hf: 84.04, hg: 259.6, sf: 0.302, sg: 0.884 },
  { T: 40,  P: 15.34, vf: 0.000914, vg: 0.0151, uf: 96.20, ug: 237.8, hf: 97.60, hg: 261.0, sf: 0.342, sg: 0.867 }
];

export const FLUID_CATALOG: Record<string, FluidDefinition> = {
  'r134a': {
    id: 'r134a',
    name: 'R-134a (Tetrafluoroetano)',
    formula: 'CF₃CH₂F',
    category: 'REFRIGERANTS',
    molarMass: 102.03,
    Tc: 101.06,
    Pc: 40.59,
    table: R134A_TABLE
  },
  'nh3': {
    id: 'nh3',
    name: 'Amônia (R-717)',
    formula: 'NH₃',
    category: 'CRYOGENICS',
    molarMass: 17.031,
    Tc: 132.25,
    Pc: 113.33,
    table: NH3_TABLE
  },
  'r22': {
    id: 'r22',
    name: 'R-22 (Clorodifluorometano)',
    formula: 'CHClF₂',
    category: 'REFRIGERANTS',
    molarMass: 86.47,
    Tc: 96.15,
    Pc: 49.90,
    table: R22_TABLE
  }
};

export class RefrigerantEngine {
  static solve(substanceId: string, params: {
    mode: CalcMode;
    type?: 'T' | 'P';
    value?: number;
    secondProp?: 'x' | 'v' | 'u' | 'h' | 's' | 'T' | 'P';
    secondVal?: number;
  }): ThermodynamicState {
    const fluid = FLUID_CATALOG[substanceId] || FLUID_CATALOG['r134a'];
    const table = fluid.table;

    let targetSat: SaturationPoint;

    // Check if we are querying by T or by P
    if (params.type === 'T' || (params.secondProp === 'T' && params.secondVal !== undefined)) {
      const targetT = params.type === 'T' ? (params.value ?? 0) : (params.secondVal ?? 0);
      targetSat = this.interpolateByT(table, targetT);
    } else {
      const targetP = params.type === 'P' ? (params.value ?? 1) : (params.secondVal ?? 1);
      targetSat = this.interpolateByP(table, targetP);
    }

    let x = 1.0;
    let phase: ThermodynamicPhase = 'Saturated Vapor';

    if (params.secondProp === 'x') {
      x = Math.max(0, Math.min(1, params.secondVal ?? 0));
      if (x === 0) phase = 'Saturated Liquid';
      else if (x === 1) phase = 'Saturated Vapor';
      else phase = 'Saturated Mixture';
    } else if (params.secondProp === 'v' && params.secondVal !== undefined) {
      if (params.secondVal < targetSat.vf) {
        phase = 'Subcooled Liquid';
        x = 0;
      } else if (params.secondVal > targetSat.vg) {
        phase = 'Superheated Vapor';
        x = 1;
      } else {
        phase = 'Saturated Mixture';
        x = (params.secondVal - targetSat.vf) / (targetSat.vg - targetSat.vf);
      }
    } else if (params.secondProp === 'h' && params.secondVal !== undefined) {
      if (params.secondVal < targetSat.hf) {
        phase = 'Subcooled Liquid';
        x = 0;
      } else if (params.secondVal > targetSat.hg) {
        phase = 'Superheated Vapor';
        x = 1;
      } else {
        phase = 'Saturated Mixture';
        x = (params.secondVal - targetSat.hf) / (targetSat.hg - targetSat.hf);
      }
    } else if (params.secondProp === 's' && params.secondVal !== undefined) {
      if (params.secondVal < targetSat.sf) {
        phase = 'Subcooled Liquid';
        x = 0;
      } else if (params.secondVal > targetSat.sg) {
        phase = 'Superheated Vapor';
        x = 1;
      } else {
        phase = 'Saturated Mixture';
        x = (params.secondVal - targetSat.sf) / (targetSat.sg - targetSat.sf);
      }
    }

    x = Math.max(0, Math.min(1, x));

    // Properties at (T, x)
    const v = targetSat.vf + x * (targetSat.vg - targetSat.vf);
    const u = targetSat.uf + x * (targetSat.ug - targetSat.uf);
    const h = targetSat.hf + x * (targetSat.hg - targetSat.hf);
    const s = targetSat.sf + x * (targetSat.sg - targetSat.sf);

    return {
      id: Math.random().toString(36).substring(2, 9),
      stateNumber: 1,
      timestamp: Date.now(),
      substanceId: fluid.id,
      substanceName: fluid.name,
      category: fluid.category,
      mode: params.mode,
      T: targetSat.T,
      P: targetSat.P,
      P_MPa: targetSat.P * 0.1,
      v,
      u,
      h,
      s,
      x: phase.includes('Saturated') ? x : null,
      phase,
      vf: targetSat.vf,
      vg: targetSat.vg,
      uf: targetSat.uf,
      ug: targetSat.ug,
      hf: targetSat.hf,
      hg: targetSat.hg,
      sf: targetSat.sf,
      sg: targetSat.sg
    };
  }

  private static interpolateByT(table: SaturationPoint[], T: number): SaturationPoint {
    let idx = 0;
    if (T <= table[0].T) return { ...table[0], T };
    if (T >= table[table.length - 1].T) return { ...table[table.length - 1], T };

    for (let i = 0; i < table.length - 1; i++) {
      if (T >= table[i].T && T <= table[i + 1].T) {
        idx = i;
        break;
      }
    }

    const p1 = table[idx];
    const p2 = table[idx + 1];
    const frac = (T - p1.T) / (p2.T - p1.T);

    return {
      T,
      P: p1.P + frac * (p2.P - p1.P),
      vf: p1.vf + frac * (p2.vf - p1.vf),
      vg: p1.vg + frac * (p2.vg - p1.vg),
      uf: p1.uf + frac * (p2.uf - p1.uf),
      ug: p1.ug + frac * (p2.ug - p1.ug),
      hf: p1.hf + frac * (p2.hf - p1.hf),
      hg: p1.hg + frac * (p2.hg - p1.hg),
      sf: p1.sf + frac * (p2.sf - p1.sf),
      sg: p1.sg + frac * (p2.sg - p1.sg)
    };
  }

  private static interpolateByP(table: SaturationPoint[], P: number): SaturationPoint {
    let idx = 0;
    if (P <= table[0].P) return { ...table[0], P };
    if (P >= table[table.length - 1].P) return { ...table[table.length - 1], P };

    for (let i = 0; i < table.length - 1; i++) {
      if (P >= table[i].P && P <= table[i + 1].P) {
        idx = i;
        break;
      }
    }

    const p1 = table[idx];
    const p2 = table[idx + 1];
    const frac = (P - p1.P) / (p2.P - p1.P);

    return {
      T: p1.T + frac * (p2.T - p1.T),
      P,
      vf: p1.vf + frac * (p2.vf - p1.vf),
      vg: p1.vg + frac * (p2.vg - p1.vg),
      uf: p1.uf + frac * (p2.uf - p1.uf),
      ug: p1.ug + frac * (p2.ug - p1.ug),
      hf: p1.hf + frac * (p2.hf - p1.hf),
      hg: p1.hg + frac * (p2.hg - p1.hg),
      sf: p1.sf + frac * (p2.sf - p1.sf),
      sg: p1.sg + frac * (p2.sg - p1.sg)
    };
  }
}
