import { ProcessType, ProcessPoint, ProcessCurve, ThermodynamicState } from '../types/thermo';
import { WaterEngine } from './water';
import { RefrigerantEngine, FLUID_CATALOG } from './refrigerants';
import { IdealGasEngine, GAS_CATALOG } from './idealGases';
import { AirEngine } from './air';

export interface ProcessCalculationParams {
  state1: ThermodynamicState;
  type: ProcessType;
  targetProperty: 'P' | 'T' | 'v' | 's' | 'h';
  targetValue: number;
  polytropicN?: number;
  targetV2Linear?: number;
}

export class ProcessPlotter {
  static solveState(
    cat: ThermodynamicState['category'],
    substanceId: string,
    inputs: { P_MPa?: number; T?: number; v?: number; s?: number; h?: number; u?: number }
  ): ThermodynamicState {
    if (cat === 'WATER') {
      return WaterEngine.solveGeneral(inputs);
    } else if (cat === 'REFRIGERANTS' || cat === 'CRYOGENICS') {
      const pBar = inputs.P_MPa !== undefined ? inputs.P_MPa * 10 : undefined;
      if (inputs.T !== undefined && pBar !== undefined) {
        return RefrigerantEngine.solve(substanceId, { mode: 'GENERAL', type: 'T', value: inputs.T, secondProp: 'P', secondVal: pBar });
      } else if (pBar !== undefined && inputs.h !== undefined) {
        return RefrigerantEngine.solve(substanceId, { mode: 'GENERAL', type: 'P', value: pBar, secondProp: 'h', secondVal: inputs.h });
      } else if (pBar !== undefined && inputs.u !== undefined) {
        return RefrigerantEngine.solve(substanceId, { mode: 'GENERAL', type: 'P', value: pBar, secondProp: 'u', secondVal: inputs.u });
      } else if (pBar !== undefined && inputs.s !== undefined) {
        return RefrigerantEngine.solve(substanceId, { mode: 'GENERAL', type: 'P', value: pBar, secondProp: 's', secondVal: inputs.s });
      } else if (pBar !== undefined && inputs.v !== undefined) {
        return RefrigerantEngine.solve(substanceId, { mode: 'GENERAL', type: 'P', value: pBar, secondProp: 'v', secondVal: inputs.v });
      } else if (inputs.T !== undefined && inputs.v !== undefined) {
        return RefrigerantEngine.solve(substanceId, { mode: 'GENERAL', type: 'T', value: inputs.T, secondProp: 'v', secondVal: inputs.v });
      } else if (inputs.T !== undefined && inputs.u !== undefined) {
        return RefrigerantEngine.solve(substanceId, { mode: 'GENERAL', type: 'T', value: inputs.T, secondProp: 'u', secondVal: inputs.u });
      } else if (inputs.T !== undefined && inputs.h !== undefined) {
        return RefrigerantEngine.solve(substanceId, { mode: 'GENERAL', type: 'T', value: inputs.T, secondProp: 'h', secondVal: inputs.h });
      } else if (inputs.T !== undefined && inputs.s !== undefined) {
        return RefrigerantEngine.solve(substanceId, { mode: 'GENERAL', type: 'T', value: inputs.T, secondProp: 's', secondVal: inputs.s });
      }
      return RefrigerantEngine.solve(substanceId, { mode: 'GENERAL', type: 'P', value: pBar || 1, secondProp: 'x', secondVal: 1 });
    } else if (cat === 'IDEAL_GASES') {
      const gas = GAS_CATALOG[substanceId] || GAS_CATALOG['co2'];
      const R = IdealGasEngine.R_UNIVERSAL / gas.M; // kJ/(kg·K)
      const pBar = inputs.P_MPa !== undefined ? inputs.P_MPa * 10 : 1.01325;

      if (inputs.T !== undefined && inputs.P_MPa !== undefined) {
        return IdealGasEngine.solve(substanceId, inputs.T, pBar);
      } else if (inputs.P_MPa !== undefined && inputs.v !== undefined) {
        const T_K = (inputs.P_MPa * 1000 * inputs.v) / R;
        return IdealGasEngine.solve(substanceId, T_K - 273.15, pBar);
      } else if (inputs.T !== undefined && inputs.v !== undefined) {
        const T_K = inputs.T + 273.15;
        const calcP_bar = (R * T_K) / (inputs.v * 100);
        return IdealGasEngine.solve(substanceId, inputs.T, calcP_bar);
      } else if (inputs.P_MPa !== undefined && (inputs.s !== undefined || inputs.h !== undefined || inputs.u !== undefined)) {
        const prop = inputs.s !== undefined ? 's' : inputs.h !== undefined ? 'h' : 'u';
        const target = (inputs as any)[prop] as number;
        let Tlow = -73.0;
        let Thigh = 2226.0;
        for (let i = 0; i < 35; i++) {
          const Tmid = 0.5 * (Tlow + Thigh);
          const stMid = IdealGasEngine.solve(substanceId, Tmid, pBar);
          if (stMid[prop] < target) Tlow = Tmid;
          else Thigh = Tmid;
        }
        return IdealGasEngine.solve(substanceId, 0.5 * (Tlow + Thigh), pBar);
      }
      return IdealGasEngine.solve(substanceId, inputs.T ?? 25, pBar);
    } else if (cat === 'AIR') {
      const R = AirEngine.R_AIR;
      const pBar = inputs.P_MPa !== undefined ? inputs.P_MPa * 10 : 1.01325;

      if (inputs.T !== undefined && inputs.P_MPa !== undefined) {
        return AirEngine.solve('T', inputs.T + 273.15, pBar);
      } else if (inputs.P_MPa !== undefined && inputs.v !== undefined) {
        const T_K = (inputs.P_MPa * 1000 * inputs.v) / R;
        return AirEngine.solve('T', T_K, pBar);
      } else if (inputs.T !== undefined && inputs.v !== undefined) {
        const T_K = inputs.T + 273.15;
        const calcP_bar = (R * T_K) / (inputs.v * 100);
        return AirEngine.solve('T', T_K, calcP_bar);
      } else if (inputs.P_MPa !== undefined && inputs.s !== undefined) {
        const s0 = inputs.s + R * Math.log(inputs.P_MPa / AirEngine.P0_AIR);
        return AirEngine.solve('s0', s0, pBar);
      } else if (inputs.P_MPa !== undefined && inputs.h !== undefined) {
        return AirEngine.solve('h', inputs.h, pBar);
      } else if (inputs.P_MPa !== undefined && inputs.u !== undefined) {
        return AirEngine.solve('u', inputs.u, pBar);
      }
      return AirEngine.solve('T', (inputs.T ?? 25) + 273.15, pBar);
    }
    // Fallback clone
    return WaterEngine.solveGeneral({ T: inputs.T || 100, P_MPa: inputs.P_MPa || 0.101325 });
  }

  static calculateProcess(params: ProcessCalculationParams): ProcessCurve {
    const { state1, type, targetValue, polytropicN = 1.3 } = params;
    const cat = state1.category;
    const subId = state1.substanceId;
    const numPoints = 20;
    const path: ProcessPoint[] = [];

    let state2: ThermodynamicState;
    let work = 0; // kJ/kg
    let heat = 0; // kJ/kg

    if (type === 'ISOBARIC') {
      // P = const, target is final T (°C) or final v
      const P_MPa = state1.P_MPa;
      const T2 = targetValue;
      state2 = this.solveState(cat, subId, { P_MPa, T: T2 });

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curT = state1.T + frac * (state2.T - state1.T);
        const curPt = this.solveState(cat, subId, { P_MPa, T: curT });
        path.push({ T: curPt.T, P: state1.P, v: curPt.v, s: curPt.s, h: curPt.h, u: curPt.u });
      }

      // w = P * (v2 - v1) (P in kPa -> w in kJ/kg)
      work = (P_MPa * 1000) * (state2.v - state1.v);
      heat = state2.h - state1.h;
    } else if (type === 'ISOTHERMAL') {
      // T = const, target is final P (MPa)
      const T_C = state1.T;
      const P2_MPa = targetValue;
      state2 = this.solveState(cat, subId, { P_MPa: P2_MPa, T: T_C });

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, T: T_C });
        path.push({ T: T_C, P: curP_MPa * 10, v: curPt.v, s: curPt.s, h: curPt.h, u: curPt.u });
      }

      const deltaU = state2.u - state1.u;
      heat = (T_C + 273.15) * (state2.s - state1.s);
      work = heat - deltaU;
    } else if (type === 'ISOCHORIC') {
      // v = const, target is final P (MPa) or final T (°C)
      const v = state1.v;
      if (params.targetProperty === 'T') {
        const T2 = targetValue;
        state2 = this.solveState(cat, subId, { T: T2, v });
      } else {
        const P2_MPa = targetValue;
        state2 = this.solveState(cat, subId, { P_MPa: P2_MPa, v });
      }

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (state2.P_MPa - state1.P_MPa);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, v });
        path.push({ T: curPt.T, P: curPt.P, v, s: curPt.s, h: curPt.h, u: curPt.u });
      }

      work = 0;
      heat = state2.u - state1.u;
    } else if (type === 'ISENTROPIC') {
      // s = const, target is final P (MPa)
      const s_target = state1.s;
      const P2_MPa = targetValue;
      state2 = this.solveState(cat, subId, { P_MPa: P2_MPa, s: s_target });

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, s: s_target });
        path.push({ T: curPt.T, P: curPt.P, v: curPt.v, s: s_target, h: curPt.h, u: curPt.u });
      }

      heat = 0;
      work = -(state2.u - state1.u);
    } else if (type === 'ISENTHALPIC') {
      // h = const (Joule-Thomson / estrangulamento), target is final P (MPa)
      const h_target = state1.h;
      const P2_MPa = targetValue;
      state2 = this.solveState(cat, subId, { P_MPa: P2_MPa, h: h_target });

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, h: h_target });
        path.push({ T: curPt.T, P: curPt.P, v: curPt.v, s: curPt.s, h: h_target, u: curPt.u });
      }

      work = 0;
      heat = 0;
    } else if (type === 'ISENERGIC') {
      // u = const, target is final P (MPa)
      const u_target = state1.u;
      const P2_MPa = targetValue;
      state2 = this.solveState(cat, subId, { P_MPa: P2_MPa, u: u_target });

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, u: u_target });
        path.push({ T: curPt.T, P: curPt.P, v: curPt.v, s: curPt.s, h: curPt.h, u: u_target });
      }

      // First Law with deltaU = 0: q = w = integral(P dv)
      work = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const pAvg_kPa = 0.5 * (path[i].P + path[i + 1].P) * 100; // bar -> kPa
        work += pAvg_kPa * (path[i + 1].v - path[i].v);
      }
      heat = (state2.u - state1.u) + work;
    } else if (type === 'PINVERSE_V') {
      // P * v = const (C = P1 * v1)
      const C = state1.P_MPa * state1.v;
      const P2_MPa = targetValue;
      const v2 = C / P2_MPa;
      state2 = this.solveState(cat, subId, { P_MPa: P2_MPa, v: v2 });

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curV = C / curP_MPa;
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, v: curV });
        path.push({ T: curPt.T, P: curP_MPa * 10, v: curV, s: curPt.s, h: curPt.h, u: curPt.u });
      }

      // w = C * ln(v2/v1) em kJ/kg (P em kPa -> * 1000)
      work = (C * 1000) * Math.log(v2 / state1.v);
      heat = (state2.u - state1.u) + work;
    } else if (type === 'POLYTROPIC') {
      // P * v^n = const
      const n = polytropicN;
      const P2_MPa = targetValue;
      const v2 = state1.v * Math.pow(state1.P_MPa / P2_MPa, 1 / n);
      state2 = this.solveState(cat, subId, { P_MPa: P2_MPa, v: v2 });

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curV = state1.v * Math.pow(state1.P_MPa / curP_MPa, 1 / n);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, v: curV });
        path.push({ T: curPt.T, P: curP_MPa * 10, v: curV, s: curPt.s, h: curPt.h, u: curPt.u });
      }

      if (Math.abs(n - 1.0) < 1e-5) {
        work = (state1.P_MPa * 1000 * state1.v) * Math.log(v2 / state1.v);
      } else {
        // w = (P2*v2 - P1*v1) / (1 - n) (em kJ/kg)
        work = ((P2_MPa * 1000 * v2) - (state1.P_MPa * 1000 * state1.v)) / (1 - n);
      }
      heat = (state2.u - state1.u) + work;
    } else {
      // LINEAR_PV (P = a + b*v)
      const P2_MPa = targetValue;
      const v2 = params.targetV2Linear !== undefined ? params.targetV2Linear : state1.v * 1.5;
      state2 = this.solveState(cat, subId, { P_MPa: P2_MPa, v: v2 });

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curV = state1.v + frac * (v2 - state1.v);
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, v: curV });
        path.push({ T: curPt.T, P: curP_MPa * 10, v: curV, s: curPt.s, h: curPt.h, u: curPt.u });
      }

      // w = (P1 + P2)/2 * (v2 - v1) (área do trapézio)
      work = ((state1.P_MPa + P2_MPa) * 1000 / 2) * (v2 - state1.v);
      heat = (state2.u - state1.u) + work;
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      type,
      label: this.getProcessNamePtBr(type),
      substanceName: state1.substanceName,
      category: state1.category,
      state1,
      state2,
      path,
      work,
      heat,
    };
  }

  static getProcessNamePtBr(type: ProcessType): string {
    switch (type) {
      case 'ISOTHERMAL': return 'Isotérmico (T = cte)';
      case 'ISOBARIC': return 'Isobárico (P = cte)';
      case 'ISOCHORIC': return 'Isocórico (v = cte)';
      case 'ISENTROPIC': return 'Isentrópico (s = cte)';
      case 'ISENERGIC': return 'Energia Interna cte (u = cte)';
      case 'ISENTHALPIC': return 'Isentálpico (h = cte)';
      case 'PINVERSE_V': return 'P proporcional a 1/v (P·v = cte)';
      case 'POLYTROPIC': return 'Politrópico (P·vⁿ = cte)';
      case 'LINEAR_PV': return 'Pressão linear com volume (P = a + b·v)';
      default: return 'Processo Termodinâmico';
    }
  }
}
