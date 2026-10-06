import { ThermodynamicState } from '../types/thermo';

export class CompressibilityEngine {
  /**
   * Lee-Kesler / Pitzer formulation for Compressibility Factor Z
   * @param Pr Reduced pressure (P / Pc)
   * @param Tr Reduced temperature (T / Tc)
   * @param omega Pitzer acentric factor (default 0 for simple fluid, or standard ~0.05)
   */
  static calculateZ(Pr: number, Tr: number, omega: number = 0.01): number {
    if (Pr <= 0 || Tr <= 0) return 1.0;

    // Second virial coefficient: B0(Tr)
    const B0 = 0.083 - 0.422 / Math.pow(Tr, 1.6);
    // B1(Tr)
    const B1 = 0.139 - 0.172 / Math.pow(Tr, 4.2);

    if (Pr < 0.6) {
      // Pitzer truncated virial equation (standard chemical/mechanical engineering)
      const Z0 = 1 + B0 * (Pr / Tr);
      const Z1 = B1 * (Pr / Tr);
      return Math.max(0.01, Z0 + omega * Z1);
    }

    // High pressure Redlich-Kwong / Peng-Robinson cubic solver for reduced coordinates
    // Z^3 - Z^2 + (A - B - B^2)*Z - A*B = 0
    const a_alpha = 0.42748 / Math.pow(Tr, 2.5);
    const b = 0.08664 / Tr;
    const A = a_alpha * Pr;
    const B = b * Pr;

    // Cubic solver for Z^3 - Z^2 + (A - B - B^2)*Z - A*B = 0
    const a2 = -1;
    const a1 = A - B - B * B;
    const a0 = -A * B;

    // Cardano's solution for the largest real root (vapor-like) or liquid
    const p = a1 - (a2 * a2) / 3;
    const q = (2 * Math.pow(a2, 3)) / 27 - (a2 * a1) / 3 + a0;
    const D = (q * q) / 4 + Math.pow(p, 3) / 27;

    let Z = 1.0;
    if (D >= 0) {
      const u = Math.cbrt(-q / 2 + Math.sqrt(D));
      const v = Math.cbrt(-q / 2 - Math.sqrt(D));
      Z = u + v - a2 / 3;
    } else {
      const r = Math.sqrt(-Math.pow(p, 3) / 27);
      const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
      // Vapor phase is the largest root
      const z1 = 2 * Math.cbrt(r) * Math.cos(phi / 3) - a2 / 3;
      const z2 = 2 * Math.cbrt(r) * Math.cos((phi + 2 * Math.PI) / 3) - a2 / 3;
      const z3 = 2 * Math.cbrt(r) * Math.cos((phi + 4 * Math.PI) / 3) - a2 / 3;
      Z = Math.max(z1, z2, z3);
    }

    return Math.max(0.05, Math.min(5.0, Z));
  }

  static solve(Pr: number, Tr: number): ThermodynamicState {
    const Z = this.calculateZ(Pr, Tr);
    // Ideal reduced volume: v'_r = Z * Tr / Pr
    const v_prime_r = (Z * Tr) / Pr;

    return {
      id: Math.random().toString(36).substring(2, 9),
      stateNumber: 1,
      timestamp: Date.now(),
      substanceId: 'compressibility',
      substanceName: 'Compressibilidade Generalizada (Z-Chart)',
      category: 'COMPRESSIBILITY',
      mode: 'GENERAL',
      T: Tr, // display Tr
      P: Pr, // display Pr
      P_MPa: Pr * 0.1,
      v: v_prime_r,
      u: 0,
      h: 0,
      s: 0,
      phase: Z < 0.3 ? 'Subcooled Liquid' : (Z > 0.8 ? 'Gas' : 'Saturated Mixture'),
      Tr,
      Pr_red: Pr,
      Z
    };
  }
}
