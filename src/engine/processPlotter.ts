import { ProcessType, ThermodynamicState } from '../types/thermo';
import { WaterEngine } from './water';

export interface ProcessPoint {
  T: number;
  P: number;
  v: number;
  s: number;
  h: number;
}

export interface ProcessResult {
  type: ProcessType;
  initialState: ThermodynamicState;
  finalState: ThermodynamicState;
  path: ProcessPoint[];
  deltaH: number; // h2 - h1
  deltaU: number; // u2 - u1
  work: number;   // w (kJ/kg)
  heat: number;   // q (kJ/kg)
}

export class ProcessPlotter {
  static calculateProcess(
    state1: ThermodynamicState,
    type: ProcessType,
    targetValue: number, // e.g., final P (bar), final T (°C), or final v
    polytropicN: number = 1.3
  ): ProcessResult {
    const isWater = state1.category === 'WATER';
    const numPoints = 15;
    const path: ProcessPoint[] = [];

    let state2: ThermodynamicState;

    if (type === 'ISOBARIC') { // P = const
      const P_MPa = state1.P_MPa;
      const T2 = targetValue; // target T in °C
      if (isWater) {
        state2 = WaterEngine.solveGeneral({ P_MPa, T: T2 });
      } else {
        // default clone
        state2 = { ...state1, T: T2, h: state1.h + 1.005 * (T2 - state1.T) };
      }

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curT = state1.T + frac * (state2.T - state1.T);
        const curPt = isWater ? WaterEngine.solveGeneral({ P_MPa, T: curT }) : state1;
        path.push({ T: curT, P: state1.P, v: curPt.v, s: curPt.s, h: curPt.h });
      }
    } else if (type === 'ISOTHERMAL') { // T = const
      const T_C = state1.T;
      const P2_bar = targetValue;
      const P2_MPa = P2_bar * 0.1;
      if (isWater) {
        state2 = WaterEngine.solveGeneral({ P_MPa: P2_MPa, T: T_C });
      } else {
        state2 = { ...state1, P: P2_bar, P_MPa: P2_MPa };
      }

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curPt = isWater ? WaterEngine.solveGeneral({ P_MPa: curP_MPa, T: T_C }) : state1;
        path.push({ T: T_C, P: curP_MPa * 10, v: curPt.v, s: curPt.s, h: curPt.h });
      }
    } else if (type === 'ISENTROPIC') { // s = const
      const s_target = state1.s;
      const P2_bar = targetValue;
      const P2_MPa = P2_bar * 0.1;
      if (isWater) {
        state2 = WaterEngine.solveGeneral({ P_MPa: P2_MPa, s: s_target });
      } else {
        state2 = { ...state1, P: P2_bar, P_MPa: P2_MPa };
      }

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curPt = isWater ? WaterEngine.solveGeneral({ P_MPa: curP_MPa, s: s_target }) : state1;
        path.push({ T: curPt.T, P: curP_MPa * 10, v: curPt.v, s: s_target, h: curPt.h });
      }
    } else { // default
      state2 = { ...state1 };
      path.push({ T: state1.T, P: state1.P, v: state1.v, s: state1.s, h: state1.h });
    }

    const deltaH = state2.h - state1.h;
    const deltaU = state2.u - state1.u;
    let work = 0;
    let heat = 0;

    if (type === 'ISOBARIC') {
      // w = P * (v2 - v1) in kJ/kg (P in kPa)
      work = (state1.P * 100) * (state2.v - state1.v);
      heat = deltaH;
    } else if (type === 'ISENTROPIC') {
      heat = 0;
      work = -deltaU;
    } else if (type === 'ISOTHERMAL') {
      heat = (state1.T + 273.15) * (state2.s - state1.s);
      work = heat - deltaU;
    }

    return {
      type,
      initialState: state1,
      finalState: state2,
      path,
      deltaH,
      deltaU,
      work,
      heat
    };
  }
}
