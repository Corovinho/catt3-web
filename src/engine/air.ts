import { ThermodynamicState } from '../types/thermo';

export interface AirDataPoint {
  T: number; // K
  h: number; // kJ/kg
  Pr: number; // relative pressure
  u: number; // kJ/kg
  vr: number; // relative volume
  s0: number; // kJ/(kg·K)
}

// Table A-22 Moran & Shapiro / Çengel Table A-17: Ideal Gas Properties of Air
// Exact benchmark points from 100 K to 2500 K
export const AIR_TABLE: AirDataPoint[] = [
  { T: 200, h: 199.97, Pr: 0.3363, u: 142.56, vr: 1707.0, s0: 1.29559 },
  { T: 210, h: 209.97, Pr: 0.3987, u: 149.69, vr: 1512.0, s0: 1.34444 },
  { T: 220, h: 219.97, Pr: 0.4690, u: 156.82, vr: 1346.0, s0: 1.39105 },
  { T: 230, h: 230.02, Pr: 0.5477, u: 164.00, vr: 1205.0, s0: 1.43557 },
  { T: 240, h: 240.02, Pr: 0.6355, u: 171.13, vr: 1084.0, s0: 1.47824 },
  { T: 250, h: 250.05, Pr: 0.7329, u: 178.28, vr: 979.0,  s0: 1.51917 },
  { T: 260, h: 260.09, Pr: 0.8405, u: 185.45, vr: 887.8,  s0: 1.55848 },
  { T: 270, h: 270.11, Pr: 0.9590, u: 192.60, vr: 808.0,  s0: 1.59634 },
  { T: 280, h: 280.13, Pr: 1.0889, u: 199.75, vr: 738.0,  s0: 1.63279 },
  { T: 285, h: 285.14, Pr: 1.1584, u: 203.33, vr: 706.1,  s0: 1.65055 },
  { T: 290, h: 290.16, Pr: 1.2311, u: 206.91, vr: 676.1,  s0: 1.66802 },
  { T: 295, h: 295.17, Pr: 1.3068, u: 210.49, vr: 647.9,  s0: 1.68515 },
  { T: 300, h: 300.19, Pr: 1.3860, u: 214.07, vr: 621.2,  s0: 1.70203 },
  { T: 305, h: 305.22, Pr: 1.4686, u: 217.67, vr: 596.0,  s0: 1.71865 },
  { T: 310, h: 310.24, Pr: 1.5546, u: 221.25, vr: 572.3,  s0: 1.73498 },
  { T: 315, h: 315.27, Pr: 1.6442, u: 224.85, vr: 549.8,  s0: 1.75106 },
  { T: 320, h: 320.29, Pr: 1.7375, u: 228.42, vr: 528.6,  s0: 1.76690 },
  { T: 325, h: 325.31, Pr: 1.8345, u: 232.02, vr: 508.4,  s0: 1.78249 },
  { T: 330, h: 330.34, Pr: 1.9352, u: 235.61, vr: 489.4,  s0: 1.79783 },
  { T: 340, h: 340.42, Pr: 2.149,  u: 242.82, vr: 454.1,  s0: 1.82790 },
  { T: 350, h: 350.49, Pr: 2.379,  u: 250.02, vr: 422.2,  s0: 1.85708 },
  { T: 360, h: 360.58, Pr: 2.626,  u: 257.24, vr: 393.4,  s0: 1.88543 },
  { T: 370, h: 370.67, Pr: 2.892,  u: 264.46, vr: 367.2,  s0: 1.91313 },
  { T: 380, h: 380.77, Pr: 3.176,  u: 271.69, vr: 343.4,  s0: 1.94001 },
  { T: 390, h: 390.88, Pr: 3.481,  u: 278.93, vr: 321.5,  s0: 1.96633 },
  { T: 400, h: 400.98, Pr: 3.806,  u: 286.16, vr: 301.6,  s0: 1.99194 },
  { T: 410, h: 411.12, Pr: 4.153,  u: 293.43, vr: 283.3,  s0: 2.01699 },
  { T: 420, h: 421.26, Pr: 4.522,  u: 300.69, vr: 266.6,  s0: 2.04142 },
  { T: 430, h: 431.43, Pr: 4.915,  u: 307.99, vr: 251.1,  s0: 2.06533 },
  { T: 440, h: 441.61, Pr: 5.332,  u: 315.30, vr: 236.8,  s0: 2.08870 },
  { T: 450, h: 451.80, Pr: 5.775,  u: 322.62, vr: 223.6,  s0: 2.11161 },
  { T: 460, h: 462.02, Pr: 6.245,  u: 329.97, vr: 211.4,  s0: 2.13407 },
  { T: 470, h: 472.24, Pr: 6.742,  u: 337.32, vr: 200.1,  s0: 2.15604 },
  { T: 480, h: 482.49, Pr: 7.268,  u: 344.70, vr: 189.5,  s0: 2.17760 },
  { T: 490, h: 492.74, Pr: 7.824,  u: 352.08, vr: 179.7,  s0: 2.19876 },
  { T: 500, h: 503.02, Pr: 8.411,  u: 359.49, vr: 170.6,  s0: 2.21952 },
  { T: 520, h: 523.63, Pr: 9.684,  u: 374.36, vr: 154.1,  s0: 2.25997 },
  { T: 540, h: 544.35, Pr: 11.10,  u: 389.34, vr: 139.7,  s0: 2.29906 },
  { T: 560, h: 565.17, Pr: 12.66,  u: 404.42, vr: 127.0,  s0: 2.33685 },
  { T: 580, h: 586.04, Pr: 14.38,  u: 419.55, vr: 115.7,  s0: 2.37348 },
  { T: 600, h: 607.02, Pr: 16.278, u: 434.78, vr: 105.8,  s0: 2.40902 },
  { T: 620, h: 628.07, Pr: 18.36,  u: 450.09, vr: 96.92,  s0: 2.44356 },
  { T: 640, h: 649.22, Pr: 20.64,  u: 465.50, vr: 88.99,  s0: 2.47716 },
  { T: 660, h: 670.47, Pr: 23.13,  u: 481.01, vr: 81.89,  s0: 2.50985 },
  { T: 680, h: 691.82, Pr: 25.85,  u: 496.62, vr: 75.50,  s0: 2.54168 },
  { T: 700, h: 713.27, Pr: 28.80,  u: 512.33, vr: 69.76,  s0: 2.57277 },
  { T: 720, h: 734.82, Pr: 32.02,  u: 528.14, vr: 64.60,  s0: 2.60309 },
  { T: 740, h: 756.44, Pr: 35.50,  u: 544.05, vr: 59.93,  s0: 2.63276 },
  { T: 760, h: 778.18, Pr: 39.27,  u: 560.01, vr: 55.68,  s0: 2.66176 },
  { T: 780, h: 800.03, Pr: 43.35,  u: 576.12, vr: 51.82,  s0: 2.69013 },
  { T: 800, h: 821.95, Pr: 47.75,  u: 592.30, vr: 48.28,  s0: 2.71787 },
  { T: 850, h: 877.40, Pr: 60.14,  u: 633.20, vr: 40.64,  s0: 2.78440 },
  { T: 900, h: 932.93, Pr: 75.29,  u: 674.58, vr: 34.31,  s0: 2.84856 },
  { T: 950, h: 989.44, Pr: 93.49,  u: 716.48, vr: 29.17,  s0: 2.90977 },
  { T: 1000, h: 1046.04, Pr: 114.0,  u: 758.94, vr: 25.17, s0: 2.96770 },
  { T: 1050, h: 1103.68, Pr: 139.7,  u: 801.89, vr: 21.61, s0: 3.02324 },
  { T: 1100, h: 1161.07, Pr: 167.1,  u: 845.33, vr: 18.80, s0: 3.07732 },
  { T: 1150, h: 1219.25, Pr: 200.9,  u: 889.34, vr: 16.44, s0: 3.12900 },
  { T: 1200, h: 1277.79, Pr: 238.0,  u: 933.33, vr: 14.47, s0: 3.17888 },
  { T: 1300, h: 1395.97, Pr: 330.9,  u: 1022.82, vr: 11.35, s0: 3.27345 },
  { T: 1400, h: 1515.42, Pr: 450.5,  u: 1113.52, vr: 8.919, s0: 3.36200 },
  { T: 1500, h: 1635.97, Pr: 601.9,  u: 1205.41, vr: 7.152, s0: 3.44516 },
  { T: 1600, h: 1757.57, Pr: 791.2,  u: 1298.30, vr: 5.804, s0: 3.52353 },
  { T: 1700, h: 1880.1,  Pr: 1025.7, u: 1392.7,  vr: 4.761, s0: 3.5977 },
  { T: 1800, h: 2003.3,  Pr: 1310.0, u: 1487.2,  vr: 3.994, s0: 3.6684 },
  { T: 1900, h: 2127.4,  Pr: 1655.0, u: 1582.6,  vr: 3.395, s0: 3.7359 },
  { T: 2000, h: 2252.1,  Pr: 2068.0, u: 1678.7,  vr: 2.776, s0: 3.8005 },
  { T: 2100, h: 2377.7,  Pr: 2559.0, u: 1775.3,  vr: 2.356, s0: 3.8622 },
  { T: 2200, h: 2503.7,  Pr: 3138.0, u: 1872.4,  vr: 2.012, s0: 3.9212 },
  { T: 2300, h: 2630.7,  Pr: 3816.0, u: 1970.4,  vr: 1.727, s0: 3.9778 },
  { T: 2400, h: 2758.2,  Pr: 4606.0, u: 2068.9,  vr: 1.490, s0: 4.0322 },
  { T: 2500, h: 2886.4,  Pr: 5522.0, u: 2168.1,  vr: 1.291, s0: 4.0845 }
];

export class AirEngine {
  static readonly R_AIR = 0.287058; // kJ/(kg·K)

  /**
   * Interpolate properties from any single known property
   */
  static solve(propName: keyof AirDataPoint, value: number, pressureBar: number = 1.01325): ThermodynamicState {
    const table = AIR_TABLE;

    // Find interval in table
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

    const factor = (value - p1[propName]) / (p2[propName] - p1[propName]);
    const clampedFactor = Math.max(0, Math.min(1, factor));

    const interp = (k: keyof AirDataPoint) => p1[k] + clampedFactor * (p2[k] - p1[k]);

    const T_K = interp('T');
    const h = interp('h');
    const u = interp('u');
    const Pr = interp('Pr');
    const vr = interp('vr');
    const s0 = interp('s0');

    const P_kPa = pressureBar * 100;
    const v = (this.R_AIR * T_K) / P_kPa; // m3/kg
    // Total entropy s = s0 - R * ln(P / P0), where P0 = 1 bar = 100 kPa
    const s = s0 - this.R_AIR * Math.log(pressureBar);

    return {
      id: Math.random().toString(36).substring(2, 9),
      stateNumber: 1,
      timestamp: Date.now(),
      substanceId: 'air',
      substanceName: 'Ar Ideal (Air Table A-22)',
      category: 'AIR',
      mode: 'GENERAL',
      T: T_K - 273.15,
      P: pressureBar,
      P_MPa: pressureBar * 0.1,
      v,
      u,
      h,
      s,
      phase: 'Gas',
      Pr,
      vr,
      s0
    };
  }
}
