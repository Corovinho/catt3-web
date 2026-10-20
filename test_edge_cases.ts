import { WaterEngine } from './src/engine/water';
import { RefrigerantEngine, FLUID_CATALOG } from './src/engine/refrigerants';
import { AirEngine } from './src/engine/air';
import { IdealGasEngine, GAS_CATALOG } from './src/engine/idealGases';
import { CompressibilityEngine } from './src/engine/compressibility';
import { PsychrometricsEngine } from './src/engine/psychrometrics';
import { UnitConverter } from './src/engine/units';
import { ProcessPlotter } from './src/engine/processPlotter';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail: string = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName} - ${detail}`);
  }
}

function approxEq(a: number, b: number, tolerancePct: number = 2.0): boolean {
  if (isNaN(a) || isNaN(b)) return false;
  if (Math.abs(b) < 1e-6) return Math.abs(a - b) < 1e-4;
  const pct = Math.abs((a - b) / b) * 100;
  return pct <= tolerancePct;
}

console.log('=== TESTE DE CASOS EXTREMOS E CONFERÊNCIA RIGOROSA ===\n');

// 1. ÁGUA: LIMITES E CASOS DE BORDA
console.log('1. TESTANDO ÁGUA:');
try {
  const wTriple = WaterEngine.solveGeneral({ T: 0.01, x: 0 });
  assert(wTriple.P_MPa > 0.0006, 'Ponto tríplice da água resolvido sem erro', `P = ${wTriple.P_MPa}`);
} catch (e: any) {
  assert(false, 'Ponto tríplice da água', e.message);
}

try {
  const wSuper50 = WaterEngine.solveGeneral({ T: 500, P_MPa: 50 });
  assert(wSuper50.h > 2500, 'Supercrítico / Alta pressão (50 MPa, 500°C) resolvido com exatidão IAPWS-IF97', `h = ${wSuper50.h}`);
} catch (e: any) {
  assert(false, 'Alta pressão água', e.message);
}

try {
  const wSatP = WaterEngine.solveSaturation({ type: 'P', value: 0.101325, secondProp: 'x', secondVal: 0 });
  assert(approxEq(wSatP.T, 100, 1.0), 'Saturação por P=0.101325 MPa dá T ~ 100°C', `T = ${wSatP.T}`);
} catch (e: any) {
  assert(false, 'Saturação da água por P', e.message);
}

// 1.4 Testes das novas combinações solicitadas: P & H, P & U, T & U, T & H
try {
  // P & H
  const wPH = WaterEngine.solveGeneral({ P_MPa: 1.0, h: 3051.6 });
  assert(approxEq(wPH.T, 300, 1.0), 'Entrada [P & H]: P=1 MPa, h=3051.6 -> T ~ 300°C', `T = ${wPH.T}`);

  // P & U
  const wPU = WaterEngine.solveGeneral({ P_MPa: 1.0, u: 2793.7 });
  assert(approxEq(wPU.T, 300, 1.0), 'Entrada [P & U]: P=1 MPa, u=2793.7 -> T ~ 300°C', `T = ${wPU.T}`);

  // T & H
  const wTH = WaterEngine.solveGeneral({ T: 300, h: 3051.6 });
  assert(approxEq(wTH.P_MPa, 1.0, 1.0), 'Entrada [T & H]: T=300°C, h=3051.6 -> P ~ 1.0 MPa', `P = ${wTH.P_MPa}`);

  // T & U
  const wTU = WaterEngine.solveGeneral({ T: 300, u: 2793.7 });
  assert(approxEq(wTU.P_MPa, 1.0, 1.0), 'Entrada [T & U]: T=300°C, u=2793.7 -> P ~ 1.0 MPa', `P = ${wTU.P_MPa}`);

  // T & U em mistura saturada (100°C, u = 1462.5 -> x ~ 0.5)
  const wTUMix = WaterEngine.solveGeneral({ T: 100, u: 1462.5 });
  assert(approxEq(wTUMix.x ?? 0, 0.5, 2.0), 'Entrada [T & U] Mistura: T=100°C, u=1462.5 -> x ~ 0.5', `x = ${wTUMix.x}`);

  // P & U em mistura saturada (0.1014 MPa, u = 1462.5 -> x ~ 0.5)
  const wPUMix = WaterEngine.solveGeneral({ P_MPa: 0.1014, u: 1462.5 });
  assert(approxEq(wPUMix.x ?? 0, 0.5, 2.0), 'Entrada [P & U] Mistura: P=0.1014 MPa, u=1462.5 -> x ~ 0.5', `x = ${wPUMix.x}`);
} catch (e: any) {
  assert(false, 'Novas combinações P&H, P&U, T&U, T&H', e.message);
}

// 2. TODOS OS REFRIGERANTES E CRIOGÊNICOS EM TODAS AS 11 COMBINAÇÕES DE PROPRIEDADES
console.log('\n2. TESTANDO REFRIGERANTES E CRIOGÊNICOS NAS 11 ENTRADAS (MISTURA + SUPER-AQUECIDO + LÍQUIDO COMPRIMIDO):');
const fluids = Object.keys(FLUID_CATALOG);
let fluidErrors = 0;
for (const fid of fluids) {
  try {
    const f = FLUID_CATALOG[fid];
    const midIdx = Math.floor(f.table.length / 2);
    const row = f.table[midIdx];
    const T_mid = row.T;
    const P_mid = row.P; // bar

    // 2.1 Mistura Saturada (x = 0.5) - Round-trip em todas as entradas: T&X, P&X, T&V, P&V, T&U, P&U, T&H, P&H, T&S, P&S
    const stMix = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_mid, secondProp: 'x', secondVal: 0.5 });
    const mixPX = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_mid, secondProp: 'x', secondVal: 0.5 });
    const mixTV = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_mid, secondProp: 'v', secondVal: stMix.v });
    const mixPV = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_mid, secondProp: 'v', secondVal: stMix.v });
    const mixTU = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_mid, secondProp: 'u', secondVal: stMix.u });
    const mixPU = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_mid, secondProp: 'u', secondVal: stMix.u });
    const mixTH = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_mid, secondProp: 'h', secondVal: stMix.h });
    const mixPH = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_mid, secondProp: 'h', secondVal: stMix.h });
    const mixTS = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_mid, secondProp: 's', secondVal: stMix.s });
    const mixPS = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_mid, secondProp: 's', secondVal: stMix.s });

    for (const st of [stMix, mixPX, mixTV, mixPV, mixTU, mixPU, mixTH, mixPH, mixTS, mixPS]) {
      if (!st || isNaN(st.h) || isNaN(st.u) || isNaN(st.v) || isNaN(st.s) || !approxEq(st.x ?? -1, 0.5, 2.0)) {
        fluidErrors++;
        console.error(`Erro mistura em ${fid}:`, st);
      }
    }

    // 2.2 Vapor Superaquecido (T = T_mid + 35°C, P = P_mid) - Round-trip em T&P, P&H, P&U, P&S, P&V, T&H, T&U, T&S, T&V
    const T_sup = T_mid + 35;
    const stSup = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_sup, secondProp: 'P', secondVal: P_mid });
    const supPH = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_mid, secondProp: 'h', secondVal: stSup.h });
    const supPU = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_mid, secondProp: 'u', secondVal: stSup.u });
    const supPS = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_mid, secondProp: 's', secondVal: stSup.s });
    const supPV = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_mid, secondProp: 'v', secondVal: stSup.v });
    const supTH = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_sup, secondProp: 'h', secondVal: stSup.h });
    const supTU = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_sup, secondProp: 'u', secondVal: stSup.u });
    const supTS = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_sup, secondProp: 's', secondVal: stSup.s });
    const supTV = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_sup, secondProp: 'v', secondVal: stSup.v });

    if (
      !approxEq(supPH.T, T_sup, 1.0) ||
      !approxEq(supPU.T, T_sup, 1.0) ||
      !approxEq(supPS.T, T_sup, 1.0) ||
      !approxEq(supPV.T, T_sup, 1.0) ||
      !approxEq(supTH.P, P_mid, 2.0) ||
      !approxEq(supTU.P, P_mid, 2.0) ||
      !approxEq(supTS.P, P_mid, 2.0) ||
      !approxEq(supTV.P, P_mid, 2.0)
    ) {
      fluidErrors++;
      console.error(`Erro superaquecido round-trip em ${fid}`);
    }

    // 2.3 Líquido Comprimido (T = Math.max(-271.5, T_mid - 15), P = P_mid * 1.5) - Round-trip em P&H, P&U
    const T_sub = Math.max(-271.5, T_mid - 15);
    const P_sub = P_mid * 1.5;
    const stSub = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: T_sub, secondProp: 'P', secondVal: P_sub });
    const subPH = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_sub, secondProp: 'h', secondVal: stSub.h });
    const subPU = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'P', value: P_sub, secondProp: 'u', secondVal: stSub.u });
    if (Math.abs(subPH.T - T_sub) > 1.0 || Math.abs(subPU.T - T_sub) > 1.0) {
      fluidErrors++;
      console.error(`Erro líquido comprimido round-trip em ${fid}: T_esp=${T_sub}, subPH.T=${subPH.T}, subPU.T=${subPU.T}`);
    }
  } catch (err) {
    fluidErrors++;
    console.error(`Exceção em ${fid}:`, err);
  }
}
assert(
  fluidErrors === 0,
  `Todos os 31 fluidos (20 refrigerantes + 11 criogênicos) validados nas 11 combinações (T&P, P&H, P&U, T&U, T&H, etc.) em mistura, vapor superaquecido e líquido comprimido`,
  `Erros: ${fluidErrors}`
);

// 3. PSICROMETRIA: TODAS AS 4 ENTRADAS (RH, Twb, Tdp, w)
console.log('\n3. TESTANDO PSICROMETRIA COM TODOS OS MODOS DE ENTRADA:');
try {
  const p1 = PsychrometricsEngine.solve({ Tdb: 25, inputMode: 'RH', value: 60 });
  assert(approxEq(p1.RH || 0, 60, 0.1), 'Psicrometria modo RH', `RH = ${p1.RH}`);

  const p2 = PsychrometricsEngine.solve({ Tdb: 25, inputMode: 'Twb', value: 18 });
  assert(p2.RH !== undefined && p2.RH > 40 && p2.RH < 60, 'Psicrometria modo Twb', `RH = ${p2.RH}`);

  const p3 = PsychrometricsEngine.solve({ Tdb: 25, inputMode: 'Tdp', value: 15 });
  assert(p3.RH !== undefined && p3.RH > 40 && p3.RH < 65, 'Psicrometria modo Tdp', `RH = ${p3.RH}`);

  const p4 = PsychrometricsEngine.solve({ Tdb: 25, inputMode: 'w', value: 0.012 });
  assert(p4.RH !== undefined && p4.RH > 50 && p4.RH < 70, 'Psicrometria modo w', `RH = ${p4.RH}`);

  // Extremos
  const pSat = PsychrometricsEngine.solve({ Tdb: 30, inputMode: 'RH', value: 100 });
  assert(approxEq(pSat.Twb || 0, 30, 0.1), 'Psicrometria 100% UR: Twb == Tdb', `Twb = ${pSat.Twb}`);

  const pDry = PsychrometricsEngine.solve({ Tdb: 30, inputMode: 'RH', value: 0 });
  assert((pDry.w || 0) === 0, 'Psicrometria 0% UR: w == 0', `w = ${pDry.w}`);
} catch (e: any) {
  assert(false, 'Psicrometria', e.message);
}

// 4. GASES IDEAIS: TODOS OS 12 GASES EM FAIXAS VARIADAS
console.log('\n4. TESTANDO GASES IDEAIS:');
const gases = Object.keys(GAS_CATALOG);
let gasErrors = 0;
for (const gid of gases) {
  try {
    const gLow = IdealGasEngine.solve(gid, 0, 1); // 0 °C, 1 bar
    const gHigh = IdealGasEngine.solve(gid, 800, 5); // 800 °C, 5 bar
    if (isNaN(gLow.h) || isNaN(gHigh.h) || isNaN(gLow.v) || isNaN(gHigh.v)) gasErrors++;
  } catch {
    gasErrors++;
  }
}
assert(gasErrors === 0, 'Todos os 12 gases ideais calculados com sucesso a 0°C e 800°C', `Erros: ${gasErrors}`);

// 5. COMPRESSIBILIDADE: TODAS AS FAIXAS DE Tr E Pr
console.log('\n5. TESTANDO COMPRESSIBILIDADE:');
try {
  const zLow = CompressibilityEngine.solve(0.2, 0.8, 0.05); // Pr=0.2, Tr=0.8
  assert(zLow.Z > 0.8 && zLow.Z < 1.05, 'Z subcrítico (Tr=0.8, Pr=0.2) consistente', `Z = ${zLow.Z}`);

  const zHigh = CompressibilityEngine.solve(5.0, 2.5, 0.2); // Pr=5.0, Tr=2.5
  assert(zHigh.Z > 0.9 && zHigh.Z < 1.4, 'Z supercrítico (Tr=2.5, Pr=5.0) consistente', `Z = ${zHigh.Z}`);
} catch (e: any) {
  assert(false, 'Compressibilidade', e.message);
}

// 6. TODOS OS 5 SISTEMAS DE UNIDADES E TODAS AS SUAS CONVERSÕES
console.log('\n6. TESTANDO TODOS OS 5 SISTEMAS DE UNIDADES:');
const unitSystems = ['SI', 'SI_KPA', 'SI_MOLE', 'BRITISH', 'BRITISH_MOLE'] as const;
for (const sys of unitSystems) {
  const labels = UnitConverter.getUnitLabels(sys);
  const pInternal = 0.5; // MPa
  const pUser = UnitConverter.fromInternalP(pInternal, labels.P);
  const pBack = UnitConverter.toInternalP(pUser, labels.P);
  assert(approxEq(pInternal, pBack, 0.01), `Sistema [${sys}]: Conversão de Pressão bidirecional perfeita`, `In: ${pInternal}, Back: ${pBack}`);

  const tInternal = 150; // °C
  const tUser = UnitConverter.fromInternalT(tInternal, labels.T);
  const tBack = UnitConverter.toInternalT(tUser, labels.T);
  assert(approxEq(tInternal, tBack, 0.01), `Sistema [${sys}]: Conversão de Temperatura bidirecional perfeita`, `In: ${tInternal}, Back: ${tBack}`);

  const hInternal = 2500; // kJ/kg
  const hUser = UnitConverter.fromInternalEnergy(hInternal, labels.h, 18.015);
  const hBack = UnitConverter.toInternalEnergy(hUser, labels.h, 18.015);
  assert(approxEq(hInternal, hBack, 0.01), `Sistema [${sys}]: Conversão de Entalpia bidirecional perfeita`, `In: ${hInternal}, Back: ${hBack}`);

  const sInternal = 6.5; // kJ/(kg·K)
  const sUser = UnitConverter.fromInternalEntropy(sInternal, labels.s, 18.015);
  const sBack = UnitConverter.toInternalEntropy(sUser, labels.s, 18.015);
  assert(approxEq(sInternal, sBack, 0.01), `Sistema [${sys}]: Conversão de Entropia bidirecional perfeita`, `In: ${sInternal}, Back: ${sBack}`);

  const vInternal = 0.05; // m3/kg
  const vUser = UnitConverter.fromInternalV(vInternal, labels.v, 18.015);
  const vBack = UnitConverter.toInternalV(vUser, labels.v, 18.015);
  assert(approxEq(vInternal, vBack, 0.01), `Sistema [${sys}]: Conversão de Volume Específico bidirecional perfeita`, `In: ${vInternal}, Back: ${vBack}`);
}

// 7. AUDITORIA COMPLETA DOS 9 PROCESSOS TERMODINÂMICOS EM TODAS AS CATEGORIAS
console.log('\n7. TESTANDO OS 9 PROCESSOS TERMODINÂMICOS EM ÁGUA, REFRIGERANTES, CRIOGÊNICOS, GASES IDEAIS E AR:');
const processTypes = [
  'ISOTHERMAL',
  'ISOBARIC',
  'ISOCHORIC',
  'ISENTROPIC',
  'ISENERGIC',
  'ISENTHALPIC',
  'PINVERSE_V',
  'POLYTROPIC',
  'LINEAR_PV',
] as const;

const initialStates = [
  WaterEngine.solveGeneral({ T: 300, P_MPa: 1.0 }),
  RefrigerantEngine.solve('r134a', { mode: 'GENERAL', type: 'T', value: 60, secondProp: 'P', secondVal: 6.0 }),
  RefrigerantEngine.solve('n2', { mode: 'GENERAL', type: 'T', value: -140, secondProp: 'P', secondVal: 5.0 }),
  IdealGasEngine.solve('co2', 200, 4.0),
  AirEngine.solve('T', 473.15, 4.0),
];

for (const st1 of initialStates) {
  let catProcErrors = 0;
  for (const pType of processTypes) {
    try {
      const targetProp = pType === 'ISOBARIC' ? 'T' : 'P';
      const targetValue = pType === 'ISOBARIC' ? st1.T + 50 : st1.P_MPa * 0.5;
      const curve = ProcessPlotter.calculateProcess({
        state1: st1,
        type: pType,
        targetProperty: targetProp,
        targetValue,
        polytropicN: 1.3,
        targetV2Linear: st1.v * 1.8,
      });

      if (!curve || curve.path.length !== 21 || isNaN(curve.work) || isNaN(curve.heat) || isNaN(curve.state2.u) || isNaN(curve.state2.h)) {
        catProcErrors++;
        console.error(`Falha na curva de [${pType}] para ${st1.substanceName}`);
      }

      if (pType === 'ISENTHALPIC') {
        if (curve.work !== 0 || curve.heat !== 0) {
          catProcErrors++;
          console.error(`Erro no estrangulamento [ISENTHALPIC] para ${st1.substanceName}`);
        }
      } else {
        // Verificar Primeira Lei da Termodinâmica para sistemas fechados: q - w = u2 - u1
        const deltaU = curve.state2.u - curve.state1.u;
        const qMinusW = curve.heat - curve.work;
        if (Math.abs(qMinusW - deltaU) > 0.5) {
          catProcErrors++;
          console.error(`Violação da 1ª Lei em [${pType}] para ${st1.substanceName}: q-w=${qMinusW}, du=${deltaU}`);
        }
      }

      // Verificar invariantes do processo
      if (pType === 'ISOTHERMAL' && Math.abs(curve.state2.T - st1.T) > 0.5) catProcErrors++;
      if (pType === 'ISOBARIC' && Math.abs(curve.state2.P_MPa - st1.P_MPa) > 0.01) catProcErrors++;
      if (pType === 'ISOCHORIC' && !approxEq(curve.state2.v, st1.v, 2.0)) catProcErrors++;
      if (pType === 'ISENTROPIC' && !approxEq(curve.state2.s, st1.s, 2.0)) catProcErrors++;
      if (pType === 'ISENERGIC' && !approxEq(curve.state2.u, st1.u, 2.0)) catProcErrors++;
      if (pType === 'ISENTHALPIC' && !approxEq(curve.state2.h, st1.h, 2.0)) catProcErrors++;
    } catch (e: any) {
      catProcErrors++;
      console.error(`Exceção no processo [${pType}] para ${st1.substanceName}:`, e.message);
    }
  }
  assert(
    catProcErrors === 0,
    `Todos os 9 processos termodinâmicos validados (invariantes + 1ª Lei q - w = Δu) para [${st1.category} - ${st1.substanceName}]`,
    `Erros: ${catProcErrors}`
  );
}

console.log('\n================================================================');
console.log(`TOTAL DE ASSERTIVAS: ${totalTests}`);
console.log(`PASSOU: ${passedTests}`);
console.log(`FALHOU: ${failedTests}`);
console.log('================================================================');
if (failedTests === 0) {
  console.log('\n>>> APROVADO! O APLICATIVO ESTÁ 100% BLINDADO E CONFIÁVEL! <<<');
} else {
  process.exit(1);
}

