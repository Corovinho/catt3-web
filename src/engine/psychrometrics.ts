import { ThermodynamicState } from '../types/thermo';

export class PsychrometricsEngine {
  /**
   * Saturation vapor pressure of water over liquid in kPa (ASHRAE / Magnus-Tetens)
   */
  static satVaporPressure(T_C: number): number {
    if (T_C >= 0) {
      // 0.61078 * exp(17.27 * T / (T + 237.3))
      return 0.61078 * Math.exp((17.27 * T_C) / (T_C + 237.3));
    } else {
      // Over ice
      return 0.61078 * Math.exp((21.875 * T_C) / (T_C + 265.5));
    }
  }

  static dewPointFromPv(Pv_kPa: number): number {
    const a = 17.27;
    const b = 237.3;
    const alpha = Math.log(Math.max(1e-6, Pv_kPa) / 0.61078);
    return (b * alpha) / (a - alpha);
  }

  static solve(params: {
    P_atm_kPa?: number; // default 101.325 kPa
    Tdb: number; // °C
    inputMode: 'RH' | 'Twb' | 'Tdp' | 'w';
    value: number; // RH in %, Twb in °C, Tdp in °C, or w in kg/kg
  }): ThermodynamicState {
    const P = params.P_atm_kPa ?? 101.325;
    const Tdb = params.Tdb;
    const Pvs = this.satVaporPressure(Tdb);

    let Pv = 0;
    let RH = 50;
    let Twb = Tdb;
    let Tdp = Tdb;
    let w = 0;

    if (params.inputMode === 'RH') {
      RH = Math.max(0, Math.min(100, params.value));
      Pv = (RH / 100) * Pvs;
      Tdp = this.dewPointFromPv(Pv);
      w = 0.62198 * (Pv / (P - Pv));

      // Estimate Twb via Stull formula
      Twb = Tdb * Math.atan(0.151977 * Math.pow(RH + 8.313659, 0.5)) +
            Math.atan(Tdb + RH) -
            Math.atan(RH - 1.676331) +
            0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
            4.686035;
    } else if (params.inputMode === 'Twb') {
      Twb = Math.min(Tdb, params.value);
      const Pvs_wb = this.satVaporPressure(Twb);
      // Carrier equation
      Pv = Pvs_wb - ((P - Pvs_wb) * (Tdb - Twb)) / (1532.44 - 1.3077 * Twb);
      Pv = Math.max(0, Math.min(Pvs, Pv));
      RH = (Pv / Pvs) * 100;
      Tdp = this.dewPointFromPv(Pv);
      w = 0.62198 * (Pv / (P - Pv));
    } else if (params.inputMode === 'Tdp') {
      Tdp = Math.min(Tdb, params.value);
      Pv = this.satVaporPressure(Tdp);
      RH = (Pv / Pvs) * 100;
      w = 0.62198 * (Pv / (P - Pv));
      Twb = 0.5 * (Tdb + Tdp);
    } else if (params.inputMode === 'w') {
      w = Math.max(0, params.value);
      Pv = (P * w) / (0.62198 + w);
      RH = Math.min(100, (Pv / Pvs) * 100);
      Tdp = this.dewPointFromPv(Pv);
      Twb = 0.5 * (Tdb + Tdp);
    }

    // Specific volume v in m³/kg dry air
    // v = Ra * T / (P - Pv) = 0.287058 * (Tdb + 273.15) / (P - Pv)
    const Ra = 0.287058; // kJ/(kg·K)
    const v_dry = (Ra * (Tdb + 273.15)) / (P - Pv);

    // Moist air enthalpy in kJ/kg dry air
    // h = 1.006 * Tdb + w * (2501 + 1.86 * Tdb)
    const h_moist = 1.006 * Tdb + w * (2501 + 1.86 * Tdb);

    return {
      id: Math.random().toString(36).substring(2, 9),
      stateNumber: 1,
      timestamp: Date.now(),
      substanceId: 'psychrometrics',
      substanceName: 'Ar Úmido (Psicrometria)',
      category: 'PSYCHROMETRICS',
      mode: 'GENERAL',
      T: Tdb,
      P: P / 100, // bar
      P_MPa: P * 0.001,
      v: v_dry,
      u: h_moist - P * v_dry,
      h: h_moist,
      s: 0,
      phase: 'Moist Air',
      Tdb,
      Twb,
      RH,
      w,
      Tdp,
      v_psychro: v_dry,
      h_psychro: h_moist
    };
  }
}
