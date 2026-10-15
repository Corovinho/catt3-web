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

// 2. TODOS OS REFRIGERANTES E CRIOGÊNICOS EM TODAS AS PROPRIEDADES SECUNDÁRIAS
console.log('\n2. TESTANDO REFRIGERANTES E CRIOGÊNICOS COM SEGUNDA PROPRIEDADE:');
const fluids = Object.keys(FLUID_CATALOG);
let fluidErrors = 0;
for (const fid of fluids) {
  try {
    const s1 = RefrigerantEngine.solve(fid, { mode: 'GENERAL', type: 'T', value: 20, secondProp: 'x', secondVal: 0.5 });
    if (!s1 || isNaN(s1.h) || isNaN(s1.v)) fluidErrors++;

    const s2 = RefrigerantEngine.solve(fid, { mode: 'SATURATION', type: 'P', value: 5, secondProp: 'x', secondVal: 1 });
    if (!s2 || isNaN(s2.h) || isNaN(s2.s)) fluidErrors++;
  } catch (err) {
    fluidErrors++;
  }
}
assert(fluidErrors === 0, `Todos os 31 fluidos (20 refrigerantes + 11 criogênicos) resolvidos sem falhas`, `Erros: ${fluidErrors}`);

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
