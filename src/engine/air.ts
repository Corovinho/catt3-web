import { ThermodynamicState } from '../types/thermo';
import { CATT3_AIR_TABLE, Catt3AirPoint } from './catt3AirTable';

export type AirDataKey = 'T' | 'h' | 'u' | 's0' | 'Pr' | 'vr';

export class AirEngine {
  // Constants exactly matching Catt3Tables.dll AIRX
  static readonly MW_AIR = 28.9669;   // kg/kmol (exibido como 28,97 no CATT3)
  static readonly R_AIR = 0.2870315;  // kJ/(kg·K) (exibido como 0,287 no CATT3)
  static readonly P0_AIR = 0.1;       // MPa (pressão de referência P° = 0,1 MPa)

  /**
   * Resolve propriedades do ar através da tabela exata do CATT3
   * @param propName Propriedade conhecida ('T', 'u', 'h', 's0', 'Pr', 'vr')
   * @param value Valor da propriedade (T em Kelvin ou valor correspondente)
   * @param pressureBar Pressão em bar (1 bar = 0,1 MPa)
   */
  static solve(propName: AirDataKey, value: number, pressureBar: number = 1.0): ThermodynamicState {
    const table = CATT3_AIR_TABLE;

    // Busca o intervalo na tabela amostrada do CATT3
    let idx = -1;
    for (let i = 0; i < table.length - 1; i++) {
      const v1 = table[i][propName];
      const v2 = table[i + 1][propName];
      if ((value >= v1 && value <= v2) || (value <= v1 && value >= v2)) {
        idx = i;
        break;
      }
    }

    if (idx === -1) {
      if (value < table[0][propName]) idx = 0;
      else idx = table.length - 2;
    }

    const p1 = table[idx];
    const p2 = table[idx + 1];

    const span = p2[propName] - p1[propName];
    const factor = span !== 0 ? (value - p1[propName]) / span : 0;
    const clampedFactor = Math.max(0, Math.min(1, factor));

    const interp = (k: keyof Catt3AirPoint) => p1[k] + clampedFactor * (p2[k] - p1[k]);

    const T_K = interp('T');
    const h = interp('h');
    const u = interp('u');
    const Pr = interp('Pr');
    const vr = interp('vr');
    const s0 = interp('s0');

    const P_MPa = pressureBar * 0.1;
    const P_kPa = pressureBar * 100;
    const v = (this.R_AIR * T_K) / P_kPa; // m3/kg
    // Entropia mássica total: s = s0 - R * ln(P / P0), onde P0 = 0.1 MPa
    const s = s0 - this.R_AIR * Math.log(P_MPa / this.P0_AIR);

    // Grandezas em base molar (Molal basis) exatas como no CATT3
    const h_mole = h * this.MW_AIR;
    const u_mole = u * this.MW_AIR;
    const s0_mole = s0 * this.MW_AIR;
    const s_mole = s * this.MW_AIR;

    return {
      id: Math.random().toString(36).substring(2, 9),
      stateNumber: 1,
      timestamp: Date.now(),
      substanceId: 'air',
      substanceName: 'Ar (Tabela de Ar)',
      category: 'AIR',
      mode: 'GENERAL',
      T: T_K - 273.15,
      P: pressureBar,
      P_MPa,
      v,
      u,
      h,
      s,
      phase: 'Gas',
      Pr,
      vr,
      s0,
      molarMass: this.MW_AIR,
      gasConstant: this.R_AIR,
      P0: this.P0_AIR,
      h_mole,
      u_mole,
      s0_mole,
      s_mole,
      density: 1 / v,
    };
  }
}
