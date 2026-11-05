import { ProcessType, ProcessPoint, ProcessCurve, ThermodynamicState } from '../types/thermo';
import { WaterEngine } from './water';
import { RefrigerantEngine } from './refrigerants';
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
        return IdealGasEngine.solveByInput(substanceId, 'vP', inputs.v, pBar);
      } else if (inputs.T !== undefined && inputs.v !== undefined) {
        return IdealGasEngine.solveByInput(substanceId, 'Tv', inputs.T, inputs.v);
      } else if (inputs.T !== undefined && inputs.s !== undefined) {
        const stRef = IdealGasEngine.solve(substanceId, inputs.T, 1.0);
        const calcP_bar = Math.max(1e-5, Math.min(1e5, Math.exp(((stRef.s0 ?? stRef.s) - inputs.s) / R)));
        return IdealGasEngine.solve(substanceId, inputs.T, calcP_bar);
      } else if (inputs.P_MPa !== undefined && inputs.s !== undefined) {
        return IdealGasEngine.solveByInput(substanceId, 'sP', inputs.s, pBar);
      } else if (inputs.P_MPa !== undefined && inputs.h !== undefined) {
        return IdealGasEngine.solveByInput(substanceId, 'hP', inputs.h, pBar);
      } else if (inputs.P_MPa !== undefined && inputs.u !== undefined) {
        return IdealGasEngine.solveByInput(substanceId, 'uP', inputs.u, pBar);
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
      } else if (inputs.T !== undefined && inputs.s !== undefined) {
        const stRef = AirEngine.solve('T', inputs.T + 273.15, 1.0);
        const calcP_bar = Math.max(1e-5, Math.min(1e5, Math.exp(((stRef.s0 ?? stRef.s) - inputs.s) / R)));
        return AirEngine.solve('T', inputs.T + 273.15, calcP_bar);
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
    return WaterEngine.solveGeneral({ T: inputs.T || 100, P_MPa: inputs.P_MPa || 0.101325 });
  }

  private static bisectPressureByConstProp(
    cat: ThermodynamicState['category'],
    subId: string,
    constProp: 's' | 'u',
    constVal: number,
    targetProp: 'T' | 'v',
    targetVal: number
  ): ThermodynamicState {
    // At constant s or u:
    // - v(P) is strictly decreasing with P
    // - T(P) is strictly increasing with P (for gases and fluids above 4°C)
    let logPLow = Math.log(0.0005); // 0.5 kPa
    let logPHigh = Math.log(50.0);  // 50 MPa
    for (let i = 0; i < 45; i++) {
      const logPMid = 0.5 * (logPLow + logPHigh);
      const pMid = Math.exp(logPMid);
      const stMid = this.solveState(cat, subId, { P_MPa: pMid, [constProp]: constVal });
      if (targetProp === 'v') {
        if (stMid.v > targetVal) logPLow = logPMid;
        else logPHigh = logPMid;
      } else {
        if (stMid.T < targetVal) logPLow = logPMid;
        else logPHigh = logPMid;
      }
    }
    const finalP = Math.exp(0.5 * (logPLow + logPHigh));
    return this.solveState(cat, subId, { P_MPa: finalP, [constProp]: constVal });
  }

  static calculateProcess(params: ProcessCalculationParams): ProcessCurve {
    const { state1, type, targetProperty, targetValue, polytropicN = 1.3 } = params;
    const cat = state1.category;
    const subId = state1.substanceId;
    const numPoints = 24;
    const path: ProcessPoint[] = [];

    let state2: ThermodynamicState;
    let work = 0; // kJ/kg
    let heat = 0; // kJ/kg

    if (type === 'ISOBARIC') {
      // P = const, target can be T, v, h, or s
      const P_MPa = state1.P_MPa;
      if (targetProperty === 'v') {
        state2 = this.solveState(cat, subId, { P_MPa, v: targetValue });
      } else if (targetProperty === 'h') {
        state2 = this.solveState(cat, subId, { P_MPa, h: targetValue });
      } else if (targetProperty === 's') {
        state2 = this.solveState(cat, subId, { P_MPa, s: targetValue });
      } else {
        state2 = this.solveState(cat, subId, { P_MPa, T: targetValue });
      }

      // Interpolate along enthalpy h so two-phase dome crossings are smooth and exact
      path.push({ T: state1.T, P: state1.P, v: state1.v, s: state1.s, h: state1.h, u: state1.u, x: state1.x });
      for (let i = 1; i < numPoints; i++) {
        const frac = i / numPoints;
        const curH = state1.h + frac * (state2.h - state1.h);
        const curPt = this.solveState(cat, subId, { P_MPa, h: curH });
        path.push({ T: curPt.T, P: state1.P, v: curPt.v, s: curPt.s, h: curPt.h, u: curPt.u, x: curPt.x });
      }
      path.push({ T: state2.T, P: state1.P, v: state2.v, s: state2.s, h: state2.h, u: state2.u, x: state2.x });

      work = (P_MPa * 1000) * (state2.v - state1.v);
      heat = state2.h - state1.h;
    } else if (type === 'ISOTHERMAL') {
      // T = const, target can be P, v, or s
      const T_C = state1.T;
      if (targetProperty === 'v') {
        state2 = this.solveState(cat, subId, { T: T_C, v: targetValue });
      } else if (targetProperty === 's') {
        state2 = this.solveState(cat, subId, { T: T_C, s: targetValue });
      } else {
        state2 = this.solveState(cat, subId, { P_MPa: targetValue, T: T_C });
      }

      const P2_MPa = state2.P_MPa;
      const isIsobaricDome = Math.abs(P2_MPa - state1.P_MPa) < 1e-5;

      path.push({ T: T_C, P: state1.P_MPa * 10, v: state1.v, s: state1.s, h: state1.h, u: state1.u });
      for (let i = 1; i < numPoints; i++) {
        const frac = i / numPoints;
        if (isIsobaricDome) {
          const curV = state1.v + frac * (state2.v - state1.v);
          const curPt = this.solveState(cat, subId, { T: T_C, v: curV });
          path.push({ T: T_C, P: curPt.P_MPa * 10, v: curPt.v, s: curPt.s, h: curPt.h, u: curPt.u });
        } else {
          const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
          const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, T: T_C });
          path.push({ T: T_C, P: curP_MPa * 10, v: curPt.v, s: curPt.s, h: curPt.h, u: curPt.u });
        }
      }
      path.push({ T: T_C, P: state2.P_MPa * 10, v: state2.v, s: state2.s, h: state2.h, u: state2.u });

      const deltaU = state2.u - state1.u;
      heat = (T_C + 273.15) * (state2.s - state1.s);
      work = heat - deltaU;
    } else if (type === 'ISOCHORIC') {
      // v = const, target can be P or T
      const v = state1.v;
      if (targetProperty === 'T') {
        state2 = this.solveState(cat, subId, { T: targetValue, v });
      } else {
        state2 = this.solveState(cat, subId, { P_MPa: targetValue, v });
      }

      path.push({ T: state1.T, P: state1.P_MPa * 10, v, s: state1.s, h: state1.h, u: state1.u });
      for (let i = 1; i < numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (state2.P_MPa - state1.P_MPa);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, v });
        path.push({ T: curPt.T, P: curP_MPa * 10, v, s: curPt.s, h: curPt.h, u: curPt.u });
      }
      path.push({ T: state2.T, P: state2.P_MPa * 10, v, s: state2.s, h: state2.h, u: state2.u });

      work = 0;
      heat = state2.u - state1.u;
    } else if (type === 'ISENTROPIC') {
      // s = const, target can be P, T, or v
      const s_target = state1.s;
      if (targetProperty === 'T') {
        if (cat === 'AIR' || cat === 'IDEAL_GASES') {
          state2 = this.solveState(cat, subId, { T: targetValue, s: s_target });
        } else {
          state2 = this.bisectPressureByConstProp(cat, subId, 's', s_target, 'T', targetValue);
        }
      } else if (targetProperty === 'v') {
        state2 = this.bisectPressureByConstProp(cat, subId, 's', s_target, 'v', targetValue);
      } else {
        state2 = this.solveState(cat, subId, { P_MPa: targetValue, s: s_target });
      }

      const P2_MPa = state2.P_MPa;
      path.push({ T: state1.T, P: state1.P_MPa * 10, v: state1.v, s: s_target, h: state1.h, u: state1.u });
      for (let i = 1; i < numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, s: s_target });
        path.push({ T: curPt.T, P: curP_MPa * 10, v: curPt.v, s: s_target, h: curPt.h, u: curPt.u });
      }
      path.push({ T: state2.T, P: P2_MPa * 10, v: state2.v, s: s_target, h: state2.h, u: state2.u });

      heat = 0;
      work = -(state2.u - state1.u);
    } else if (type === 'ISENTHALPIC') {
      // h = const (Joule-Thomson / estrangulamento), target is final P (MPa)
      const h_target = state1.h;
      const P2_MPa = targetValue;
      state2 = this.solveState(cat, subId, { P_MPa: P2_MPa, h: h_target });

      path.push({ T: state1.T, P: state1.P_MPa * 10, v: state1.v, s: state1.s, h: h_target, u: state1.u });
      for (let i = 1; i < numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, h: h_target });
        path.push({ T: curPt.T, P: curP_MPa * 10, v: curPt.v, s: curPt.s, h: h_target, u: curPt.u });
      }
      path.push({ T: state2.T, P: P2_MPa * 10, v: state2.v, s: state2.s, h: h_target, u: state2.u });

      work = 0;
      heat = 0;
    } else if (type === 'ISENERGIC') {
      // u = const, target can be P or v
      const u_target = state1.u;
      if (targetProperty === 'v') {
        state2 = this.bisectPressureByConstProp(cat, subId, 'u', u_target, 'v', targetValue);
      } else {
        state2 = this.solveState(cat, subId, { P_MPa: targetValue, u: u_target });
      }

      const P2_MPa = state2.P_MPa;
      path.push({ T: state1.T, P: state1.P_MPa * 10, v: state1.v, s: state1.s, h: state1.h, u: u_target });
      for (let i = 1; i < numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, u: u_target });
        path.push({ T: curPt.T, P: curP_MPa * 10, v: curPt.v, s: curPt.s, h: curPt.h, u: u_target });
      }
      path.push({ T: state2.T, P: P2_MPa * 10, v: state2.v, s: state2.s, h: state2.h, u: u_target });

      work = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const pAvg_kPa = 0.5 * (path[i].P + path[i + 1].P) * 100; // bar -> kPa
        work += pAvg_kPa * (path[i + 1].v - path[i].v);
      }
      heat = (state2.u - state1.u) + work;
    } else if (type === 'PINVERSE_V') {
      // P * v = const (C = P1 * v1)
      const C = state1.P_MPa * state1.v;
      const P2_MPa = targetProperty === 'v' ? C / Math.max(1e-8, targetValue) : targetValue;
      const v2 = C / P2_MPa;
      state2 = this.solveState(cat, subId, { P_MPa: P2_MPa, v: v2 });

      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const curP_MPa = state1.P_MPa + frac * (P2_MPa - state1.P_MPa);
        const curV = C / curP_MPa;
        const curPt = this.solveState(cat, subId, { P_MPa: curP_MPa, v: curV });
        path.push({ T: curPt.T, P: curP_MPa * 10, v: curV, s: curPt.s, h: curPt.h, u: curPt.u });
      }

      work = (C * 1000) * Math.log(v2 / state1.v);
      heat = (state2.u - state1.u) + work;
    } else if (type === 'POLYTROPIC') {
      // P * v^n = const
      const n = polytropicN;
      let P2_MPa: number;
      let v2: number;

      if (targetProperty === 'v') {
        v2 = Math.max(1e-8, targetValue);
        P2_MPa = state1.P_MPa * Math.pow(state1.v / v2, n);
      } else if (targetProperty === 'T' && Math.abs(n - 1.0) > 1e-4) {
        let logVLow = Math.log(state1.v * 0.02);
        let logVHigh = Math.log(state1.v * 50.0);
        const pAtLow = state1.P_MPa * Math.pow(state1.v / Math.exp(logVLow), n);
        const pAtHigh = state1.P_MPa * Math.pow(state1.v / Math.exp(logVHigh), n);
        const tAtLow = this.solveState(cat, subId, { P_MPa: pAtLow, v: Math.exp(logVLow) }).T;
        const tAtHigh = this.solveState(cat, subId, { P_MPa: pAtHigh, v: Math.exp(logVHigh) }).T;
        const increasingWithV = tAtHigh > tAtLow;

        for (let i = 0; i < 45; i++) {
          const logVMid = 0.5 * (logVLow + logVHigh);
          const vMid = Math.exp(logVMid);
          const pMid = state1.P_MPa * Math.pow(state1.v / vMid, n);
          const stMid = this.solveState(cat, subId, { P_MPa: pMid, v: vMid });
          if (increasingWithV) {
            if (stMid.T < targetValue) logVLow = logVMid;
            else logVHigh = logVMid;
          } else {
            if (stMid.T > targetValue) logVLow = logVMid;
            else logVHigh = logVMid;
          }
        }
        v2 = Math.exp(0.5 * (logVLow + logVHigh));
        P2_MPa = state1.P_MPa * Math.pow(state1.v / v2, n);
      } else {
        P2_MPa = targetValue;
        v2 = state1.v * Math.pow(state1.P_MPa / P2_MPa, 1 / n);
      }

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

      work = ((state1.P_MPa + P2_MPa) * 1000 / 2) * (v2 - state1.v);
      heat = (state2.u - state1.u) + work;
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      type,
      label: this.getProcessNamePtBr(type),
      substanceId: state1.substanceId,
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
