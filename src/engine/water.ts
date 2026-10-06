import * as if97 from 'iapws-if97';
import { ThermodynamicPhase, ThermodynamicState, CalcMode } from '../types/thermo';

export class WaterEngine {
  static readonly TC = 647.096; // K
  static readonly PC = 22.064; // MPa
  static readonly VC = 0.003106; // m3/kg

  /**
   * Determine thermodynamic phase based on P, T, and quality x
   */
  static determinePhase(P_MPa: number, T_K: number, x?: number | null): ThermodynamicPhase {
    if (P_MPa >= this.PC && T_K >= this.TC) {
      return 'Supercritical';
    }

    if (x !== undefined && x !== null) {
      if (Math.abs(x) < 1e-6) return 'Saturated Liquid';
      if (Math.abs(x - 1) < 1e-6) return 'Saturated Vapor';
      if (x > 0 && x < 1) return 'Saturated Mixture';
    }

    try {
      if (P_MPa < this.PC) {
        const sat = if97.solvePx(P_MPa, 0);
        const Tsat = sat.temperature;
        if (T_K < Tsat - 0.01) return 'Subcooled Liquid';
        if (T_K > Tsat + 0.01) return 'Superheated Vapor';
        return 'Saturated Mixture';
      }
    } catch {
      // ignore
    }

    return T_K > this.TC ? 'Superheated Vapor' : 'Subcooled Liquid';
  }

  /**
   * General Properties Mode: Solve from any 2 independent properties
   */
  static solveGeneral(props: {
    T?: number; // °C
    P_MPa?: number; // MPa
    v?: number; // m³/kg
    u?: number; // kJ/kg
    h?: number; // kJ/kg
    s?: number; // kJ/(kg·K)
    x?: number; // [0, 1]
  }): ThermodynamicState {
    const T_K = props.T !== undefined ? props.T + 273.15 : undefined;
    const P = props.P_MPa;
    const h = props.h;
    const s = props.s;
    const v = props.v;
    const u = props.u;
    const x = props.x;

    let res: any;

    if (P !== undefined && T_K !== undefined) {
      // Check if in 2-phase region
      if (P < this.PC) {
        const Tsat = if97.solvePx(P, 0).temperature;
        if (Math.abs(T_K - Tsat) < 0.02) {
          // If close to Tsat and x is given:
          if (x !== undefined) {
            res = if97.solvePx(P, x);
          } else {
            // Default to saturated vapor or solvePT
            res = if97.solvePT(P, T_K);
          }
        } else {
          res = if97.solvePT(P, T_K);
        }
      } else {
        res = if97.solvePT(P, T_K);
      }
    } else if (P !== undefined && h !== undefined) {
      res = if97.solvePH(P, h);
    } else if (P !== undefined && s !== undefined) {
      res = if97.solvePS(P, s);
    } else if (P !== undefined && x !== undefined) {
      res = if97.solvePx(P, Math.max(0, Math.min(1, x)));
    } else if (T_K !== undefined && x !== undefined) {
      res = if97.solveTx(T_K, Math.max(0, Math.min(1, x)));
    } else if (T_K !== undefined && h !== undefined) {
      res = if97.solveTH(T_K, h);
    } else if (T_K !== undefined && s !== undefined) {
      res = if97.solveTS(T_K, s);
    } else if (h !== undefined && s !== undefined) {
      res = if97.solveHS(h, s);
    } else if (P !== undefined && v !== undefined) {
      // Solve from (P, v)
      res = this.solvePv(P, v);
    } else if (T_K !== undefined && v !== undefined) {
      // Solve from (T, v)
      res = this.solveTv(T_K, v);
    } else if (P !== undefined && u !== undefined) {
      // Solve from (P, u)
      res = this.solvePu(P, u);
    } else {
      throw new Error("Combinação de propriedades não suportada. Forneça pelo menos 2 propriedades independentes.");
    }

    return this.buildState(res, 'GENERAL');
  }

  /**
   * Saturation Properties Mode
   */
  static solveSaturation(params: {
    type: 'T' | 'P';
    value: number; // T in °C or P in MPa
    secondProp: 'x' | 'v' | 'u' | 'h' | 's';
    secondVal: number;
  }): ThermodynamicState {
    let T_K: number;
    let P_MPa: number;

    if (params.type === 'T') {
      T_K = params.value + 273.15;
      if (T_K < 273.16 || T_K > this.TC) {
        throw new Error(`Temperatura deve estar entre 0.01 °C e ${this.TC - 273.15} °C na saturação.`);
      }
      const satLiq = if97.solveTx(T_K, 0);
      P_MPa = satLiq.pressure;
    } else {
      P_MPa = params.value;
      if (P_MPa <= 0 || P_MPa > this.PC) {
        throw new Error(`Pressão deve estar entre 0.000611 MPa e ${this.PC} MPa na saturação.`);
      }
      const satLiq = if97.solvePx(P_MPa, 0);
      T_K = satLiq.temperature;
    }

    const satLiq = if97.solvePx(P_MPa, 0);
    const satVap = if97.solvePx(P_MPa, 1);

    let x = 0;
    if (params.secondProp === 'x') {
      x = Math.max(0, Math.min(1, params.secondVal));
    } else if (params.secondProp === 'v') {
      x = (params.secondVal - satLiq.specificVolume) / (satVap.specificVolume - satLiq.specificVolume);
    } else if (params.secondProp === 'u') {
      x = (params.secondVal - satLiq.internalEnergy) / (satVap.internalEnergy - satLiq.internalEnergy);
    } else if (params.secondProp === 'h') {
      x = (params.secondVal - satLiq.enthalpy) / (satVap.enthalpy - satLiq.enthalpy);
    } else if (params.secondProp === 's') {
      x = (params.secondVal - satLiq.entropy) / (satVap.entropy - satLiq.entropy);
    }

    x = Math.max(0, Math.min(1, x));
    const res = if97.solvePx(P_MPa, x);

    const state = this.buildState(res, 'SATURATION');
    state.vf = satLiq.specificVolume;
    state.vg = satVap.specificVolume;
    state.uf = satLiq.internalEnergy;
    state.ug = satVap.internalEnergy;
    state.hf = satLiq.enthalpy;
    state.hg = satVap.enthalpy;
    state.sf = satLiq.entropy;
    state.sg = satVap.entropy;
    state.x = x;

    return state;
  }

  private static solvePv(P: number, targetV: number): any {
    if (P < this.PC) {
      const vf = if97.solvePx(P, 0).specificVolume;
      const vg = if97.solvePx(P, 1).specificVolume;
      if (targetV >= vf && targetV <= vg) {
        const x = (targetV - vf) / (vg - vf);
        return if97.solvePx(P, x);
      }
      if (targetV < vf) {
        // Subcooled liquid: search T in [273.15, Tsat]
        const Tsat = if97.solvePx(P, 0).temperature;
        return this.bisectionT(P, targetV, 273.15, Tsat);
      } else {
        // Superheated vapor: search T in [Tsat, 1073.15]
        const Tsat = if97.solvePx(P, 1).temperature;
        return this.bisectionT(P, targetV, Tsat, 1273.15);
      }
    } else {
      return this.bisectionT(P, targetV, 273.15, 1273.15);
    }
  }

  private static solveTv(T_K: number, targetV: number): any {
    if (T_K < this.TC) {
      const satLiq = if97.solveTx(T_K, 0);
      const satVap = if97.solveTx(T_K, 1);
      const vf = satLiq.specificVolume;
      const vg = satVap.specificVolume;
      if (targetV >= vf && targetV <= vg) {
        const x = (targetV - vf) / (vg - vf);
        return if97.solveTx(T_K, x);
      }
      if (targetV > vg) {
        // Superheated vapor: search P in [0.0001, Psat]
        return this.bisectionP(T_K, targetV, 0.0001, satVap.pressure);
      } else {
        // Subcooled liquid: search P in [Psat, 100]
        return this.bisectionP(T_K, targetV, satLiq.pressure, 100);
      }
    }
    return this.bisectionP(T_K, targetV, 0.001, 100);
  }

  private static solvePu(P: number, targetU: number): any {
    if (P < this.PC) {
      const uf = if97.solvePx(P, 0).internalEnergy;
      const ug = if97.solvePx(P, 1).internalEnergy;
      if (targetU >= uf && targetU <= ug) {
        const x = (targetU - uf) / (ug - uf);
        return if97.solvePx(P, x);
      }
      // Approximate via h = u + P*v
      const h_approx = targetU + P * 0.05 * 1000;
      return if97.solvePH(P, h_approx);
    }
    return if97.solvePT(P, 300);
  }

  private static bisectionT(P: number, targetV: number, Tlow: number, Thigh: number): any {
    for (let i = 0; i < 28; i++) {
      const Tmid = 0.5 * (Tlow + Thigh);
      const vmid = if97.solvePT(P, Tmid).specificVolume;
      if (vmid < targetV) {
        Tlow = Tmid;
      } else {
        Thigh = Tmid;
      }
    }
    return if97.solvePT(P, 0.5 * (Tlow + Thigh));
  }

  private static bisectionP(T_K: number, targetV: number, Plow: number, Phigh: number): any {
    for (let i = 0; i < 28; i++) {
      const Pmid = 0.5 * (Plow + Phigh);
      const vmid = if97.solvePT(Pmid, T_K).specificVolume;
      // In general, as P increases, v decreases
      if (vmid > targetV) {
        Plow = Pmid;
      } else {
        Phigh = Pmid;
      }
    }
    return if97.solvePT(0.5 * (Plow + Phigh), T_K);
  }

  private static buildState(res: any, mode: CalcMode): ThermodynamicState {
    const P_MPa = res.pressure;
    const T_K = res.temperature;
    const T_C = T_K - 273.15;
    const x = res.quality ?? null;
    const phase = this.determinePhase(P_MPa, T_K, x);

    let vf, vg, uf, ug, hf, hg, sf, sg;
    if (P_MPa < this.PC) {
      try {
        const satL = if97.solvePx(P_MPa, 0);
        const satV = if97.solvePx(P_MPa, 1);
        vf = satL.specificVolume;
        vg = satV.specificVolume;
        uf = satL.internalEnergy;
        ug = satV.internalEnergy;
        hf = satL.enthalpy;
        hg = satV.enthalpy;
        sf = satL.entropy;
        sg = satV.entropy;
      } catch {
        // ignore
      }
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      stateNumber: 1,
      timestamp: Date.now(),
      substanceId: 'water',
      substanceName: 'Água / Vapor (H₂O)',
      category: 'WATER',
      mode,
      T: T_C,
      P: P_MPa * 10, // default bar
      P_MPa,
      v: res.specificVolume,
      u: res.internalEnergy,
      h: res.enthalpy,
      s: res.entropy,
      x,
      phase,
      vf, vg, uf, ug, hf, hg, sf, sg
    };
  }
}
