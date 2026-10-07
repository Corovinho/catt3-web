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

console.log('================================================================');
console.log('BATERIA DE TESTES DE CONFIABILIDADE TERMODINÂMICA - CATT3 WEB');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. WATER & STEAM (IAPWS-IF97)
// -----------------------------------------------------------------------------
console.log('1. TESTANDO ÁGUA E VAPOR (IAPWS-IF97):');

// 1.1 Água saturada a 100 °C, x = 0 (Líquido saturado)
const wSatLiq = WaterEngine.solveGeneral({ T: 100, x: 0 });
assert(approxEq(wSatLiq.P_MPa, 0.101418, 0.5), 'Água Sat 100°C: P_sat ~ 0.1014 MPa', `Obtido: ${wSatLiq.P_MPa}`);
assert(approxEq(wSatLiq.vf || 0, 0.0010435, 1.0), 'Água Sat 100°C: vf ~ 0.0010435 m3/kg', `Obtido: ${wSatLiq.vf}`);
assert(approxEq(wSatLiq.hf || 0, 419.06, 0.5), 'Água Sat 100°C: hf ~ 419.06 kJ/kg', `Obtido: ${wSatLiq.hf}`);
assert(approxEq(wSatLiq.sf || 0, 1.3069, 0.5), 'Água Sat 100°C: sf ~ 1.3069 kJ/kg·K', `Obtido: ${wSatLiq.sf}`);
assert(wSatLiq.phase === 'Saturated Liquid', 'Fase correta: Saturated Liquid');

// 1.2 Água saturada a 100 °C, x = 1 (Vapor saturado)
const wSatVap = WaterEngine.solveGeneral({ T: 100, x: 1 });
assert(approxEq(wSatVap.vg || 0, 1.673, 1.0), 'Água Sat 100°C: vg ~ 1.673 m3/kg', `Obtido: ${wSatVap.vg}`);
assert(approxEq(wSatVap.hg || 0, 2676.0, 0.5), 'Água Sat 100°C: hg ~ 2676.0 kJ/kg', `Obtido: ${wSatVap.hg}`);
assert(approxEq(wSatVap.sg || 0, 7.355, 0.5), 'Água Sat 100°C: sg ~ 7.355 kJ/kg·K', `Obtido: ${wSatVap.sg}`);
assert(wSatVap.phase === 'Saturated Vapor', 'Fase correta: Saturated Vapor');

// 1.3 Água saturada a 100 °C, x = 0.5 (Mistura 50%)
const wMix = WaterEngine.solveGeneral({ T: 100, x: 0.5 });
const expectedHmix = 0.5 * (wSatLiq.hf || 419.06) + 0.5 * (wSatVap.hg || 2676.0);
assert(approxEq(wMix.h, expectedHmix, 0.1), 'Água Sat 100°C x=0.5: h = (hf + hg)/2', `Obtido: ${wMix.h}, Esperado: ${expectedHmix}`);
assert(wMix.phase === 'Saturated Mixture', 'Fase correta: Saturated Mixture');

// 1.4 Vapor Superaquecido: P = 1.0 MPa, T = 300 °C (Moran A-4 / Çengel A-6)
const wSup = WaterEngine.solveGeneral({ P_MPa: 1.0, T: 300 });
assert(approxEq(wSup.v, 0.2579, 1.0), 'Vapor Superaquecido 1 MPa, 300°C: v ~ 0.2579 m3/kg', `Obtido: ${wSup.v}`);
assert(approxEq(wSup.h, 3051.6, 0.5), 'Vapor Superaquecido 1 MPa, 300°C: h ~ 3051.6 kJ/kg', `Obtido: ${wSup.h}`);
assert(approxEq(wSup.s, 7.123, 0.5), 'Vapor Superaquecido 1 MPa, 300°C: s ~ 7.123 kJ/kg·K', `Obtido: ${wSup.s}`);
assert(wSup.phase === 'Superheated Vapor', 'Fase correta: Superheated Vapor');

// 1.5 Líquido Comprimido / Sub-resfriado: P = 5.0 MPa, T = 40 °C
const wSub = WaterEngine.solveGeneral({ P_MPa: 5.0, T: 40 });
assert(approxEq(wSub.v, 0.001006, 1.0), 'Líquido Comprimido 5 MPa, 40°C: v ~ 0.001006 m3/kg', `Obtido: ${wSub.v}`);
assert(approxEq(wSub.h, 171.9, 2.0), 'Líquido Comprimido 5 MPa, 40°C: h ~ 171.9 kJ/kg', `Obtido: ${wSub.h}`);
assert(wSub.phase === 'Subcooled Liquid', 'Fase correta: Subcooled Liquid');

// -----------------------------------------------------------------------------
// 2. REFRIGERANTES (TODOS OS 20 FLUIDOS)
// -----------------------------------------------------------------------------
console.log('\n2. TESTANDO TODOS OS 20 REFRIGERANTES:');
const refList = [
  'co2', 'r11', 'r12', 'r13', 'r14', 'r21', 'r22', 'r23', 'r113', 'r114',
  'r123', 'r134a', 'r152a', 'r404a', 'r407c', 'r410a', 'r500', 'r502', 'r507a', 'rc318'
];

assert(refList.length === 20, 'Contagem exata de 20 refrigerantes');

for (const refId of refList) {
  const fluid = FLUID_CATALOG[refId];
  assert(!!fluid && fluid.table.length > 0, `Fluido [${refId}] catalogado com tabela de saturação`);
  
  // Teste de cálculo a título 0.5
  const midT = fluid.table[Math.floor(fluid.table.length / 2)].T;
  const state = RefrigerantEngine.solve(refId, { mode: 'SATURATION', type: 'T', value: midT, secondProp: 'x', secondVal: 0.5 });
  
  const validNumbers = !isNaN(state.T) && !isNaN(state.P) && !isNaN(state.v) && !isNaN(state.h) && !isNaN(state.s) && !isNaN(state.u);
  const thermoConsistency = (state.vg || 0) > (state.vf || 0) && (state.hg || 0) > (state.hf || 0) && (state.sg || 0) > (state.sf || 0);
  
  assert(validNumbers && thermoConsistency, `[${fluid.name}] Cálculo válido e consistente (T=${midT}°C, P=${state.P.toFixed(2)} bar)`);
}

// Benchmark específico: R-134a a 20 °C (Tabela A-11)
const r134aState = RefrigerantEngine.solve('r134a', { mode: 'SATURATION', type: 'T', value: 20, secondProp: 'x', secondVal: 1.0 });
assert(approxEq(r134aState.P, 5.717, 1.0), 'R-134a a 20°C: P ~ 5.72 bar', `Obtido: ${r134aState.P}`);
assert(approxEq(r134aState.hg || 0, 256.75, 1.0), 'R-134a a 20°C: hg ~ 256.75 kJ/kg', `Obtido: ${r134aState.hg}`);
assert(approxEq(r134aState.sg || 0, 0.8732, 1.0), 'R-134a a 20°C: sg ~ 0.8732 kJ/kg·K', `Obtido: ${r134aState.sg}`);

// Benchmark específico: R-22 a 0 °C (Tabela A-7)
const r22State = RefrigerantEngine.solve('r22', { mode: 'SATURATION', type: 'T', value: 0, secondProp: 'x', secondVal: 1.0 });
assert(approxEq(r22State.P, 4.976, 1.0), 'R-22 a 0°C: P ~ 4.98 bar', `Obtido: ${r22State.P}`);
assert(approxEq(r22State.hg || 0, 250.3, 1.0), 'R-22 a 0°C: hg ~ 250.3 kJ/kg', `Obtido: ${r22State.hg}`);

// -----------------------------------------------------------------------------
// 3. FLUIDOS CRIOGÊNICOS (TODOS OS 11 FLUIDOS)
// -----------------------------------------------------------------------------
console.log('\n3. TESTANDO TODOS OS 11 FLUIDOS CRIOGÊNICOS:');
const cryoList = [
  'ammonia', 'argon', 'ethane', 'ethylene', 'helium',
  'isobutane', 'methane', 'neon', 'nitrogen', 'oxygen', 'propane'
];

assert(cryoList.length === 11, 'Contagem exata de 11 criogênicos');

for (const cryoId of cryoList) {
  const fluid = FLUID_CATALOG[cryoId];
  assert(!!fluid && fluid.table.length > 0, `Criogênico [${cryoId}] catalogado com tabela de saturação`);
  
  const midT = fluid.table[Math.floor(fluid.table.length / 2)].T;
  const state = RefrigerantEngine.solve(cryoId, { mode: 'SATURATION', type: 'T', value: midT, secondProp: 'x', secondVal: 0.5 });
  
  const validNumbers = !isNaN(state.T) && !isNaN(state.P) && !isNaN(state.v) && !isNaN(state.h) && !isNaN(state.s) && !isNaN(state.u);
  const thermoConsistency = (state.vg || 0) > (state.vf || 0) && (state.hg || 0) > (state.hf || 0) && (state.sg || 0) > (state.sf || 0);
  
  assert(validNumbers && thermoConsistency, `[${fluid.name}] Cálculo válido e consistente (T=${midT}°C, P=${state.P.toFixed(2)} bar)`);
}

// Benchmark específico: Amônia (R-717) a 0 °C (Tabela A-13)
const nh3State = RefrigerantEngine.solve('ammonia', { mode: 'SATURATION', type: 'T', value: 0, secondProp: 'x', secondVal: 0.0 });
assert(approxEq(nh3State.P, 4.2939, 1.0), 'Amônia a 0°C: P ~ 4.29 bar', `Obtido: ${nh3State.P}`);
assert(approxEq(nh3State.hf || 0, 181.2, 1.0), 'Amônia a 0°C: hf ~ 181.2 kJ/kg', `Obtido: ${nh3State.hf}`);

// Benchmark específico: Oxigênio Líquido em ebulição normal (-182.9 °C)
const o2State = RefrigerantEngine.solve('oxygen', { mode: 'SATURATION', type: 'T', value: -182.9, secondProp: 'x', secondVal: 1.0 });
assert(approxEq(o2State.P, 1.013, 2.0), 'Oxigênio a -182.9°C: P ~ 1.013 bar (1 atm)', `Obtido: ${o2State.P}`);

// -----------------------------------------------------------------------------
// 4. TABELA DE AR (GÁS REAL - TABELA A-17 / A-22)
// -----------------------------------------------------------------------------
console.log('\n4. TESTANDO TABELA DE AR (AR COMO GÁS IDEAL VARIÁVEL):');

// Ar a T = 300 K (Moran A-22 / Çengel A-17)
const air300 = AirEngine.solve('T', 300, 1.01325);
assert(approxEq(air300.h, 300.19, 0.5), 'Ar a 300 K: h ~ 300.19 kJ/kg', `Obtido: ${air300.h}`);
assert(approxEq(air300.u, 214.07, 0.5), 'Ar a 300 K: u ~ 214.07 kJ/kg', `Obtido: ${air300.u}`);
assert(approxEq(air300.s0 || 0, 1.70203, 0.5), 'Ar a 300 K: s° ~ 1.702 kJ/kg·K', `Obtido: ${air300.s0}`);
assert(approxEq(air300.Pr || 0, 1.3860, 1.0), 'Ar a 300 K: Pr ~ 1.386', `Obtido: ${air300.Pr}`);
assert(approxEq(air300.vr || 0, 621.2, 1.0), 'Ar a 300 K: vr ~ 621.2', `Obtido: ${air300.vr}`);

// Ar a T = 500 K
const air500 = AirEngine.solve('T', 500, 1.01325);
assert(approxEq(air500.h, 503.02, 0.5), 'Ar a 500 K: h ~ 503.02 kJ/kg', `Obtido: ${air500.h}`);
assert(approxEq(air500.u, 359.49, 0.5), 'Ar a 500 K: u ~ 359.49 kJ/kg', `Obtido: ${air500.u}`);

// Interpolação Inversa (Buscar por Entalpia: h = 400 kJ/kg, T ~ 398.9 K -> T_C ~ 125.8 °C)
const airByH = AirEngine.solve('h', 400, 1.01325);
assert(approxEq(airByH.h, 400, 0.1), 'Ar inverso por h: h ~ 400 kJ/kg', `Obtido: ${airByH.h}`);
assert(approxEq(airByH.T + 273.15, 399.0, 0.5), 'Ar inverso por h: T_K ~ 399.0 K (125.8°C)', `T: ${(airByH.T + 273.15).toFixed(1)} K`);

// -----------------------------------------------------------------------------
// 5. GASES IDEAIS (TODAS AS 12 ESPÉCIES NIST SHOMATE)
// -----------------------------------------------------------------------------
console.log('\n5. TESTANDO TODOS OS 12 GASES IDEAIS (POLINÔMIOS NIST SHOMATE):');
const gasList = ['co', 'co2', 'n', 'n2', 'no', 'no2', 'h', 'h2', 'h2o', 'o', 'o2', 'oh'];

assert(gasList.length === 12, 'Contagem exata de 12 espécies de gases ideais');

for (const gasId of gasList) {
  const gas = GAS_CATALOG[gasId];
  assert(!!gas && gas.M > 0, `Gás [${gasId}] catalogado com massa molar M = ${gas?.M}`);
  
  const state = IdealGasEngine.solve(gasId, 25, 1.01325);
  const R_gas = 8.314462618 / gas.M;
  const T_K = 25 + 273.15;
  const P_kPa = 101.325;
  const expectedV = (R_gas * T_K) / P_kPa;
  
  assert(approxEq(state.v, expectedV, 0.1), `[${gas.formula}] Equação de Estado P·v = R·T satisfeita`, `v: ${state.v}, Esperado: ${expectedV}`);
  assert(approxEq(state.u, state.h - R_gas * T_K, 0.1), `[${gas.formula}] Relação u = h - R·T satisfeita`);
}

// Benchmark analítico exato: CO2 a 25 °C, 1 atm
const co2State = IdealGasEngine.solve('co2', 25, 1.01325);
assert(approxEq(co2State.v, 0.5559, 0.5), 'CO2 a 25°C, 1 atm: v ~ 0.5559 m3/kg', `Obtido: ${co2State.v}`);

// Benchmark analítico exato: N2 a 25 °C, 1 atm
const n2State = IdealGasEngine.solve('n2', 25, 1.01325);
assert(approxEq(n2State.v, 0.8734, 0.5), 'N2 a 25°C, 1 atm: v ~ 0.8734 m3/kg', `Obtido: ${n2State.v}`);

// -----------------------------------------------------------------------------
// 6. FATOR DE COMPRESSIBILIDADE (Z - NELSON-OBERT / LEE-KESLER)
// -----------------------------------------------------------------------------
console.log('\n6. TESTANDO FATOR DE COMPRESSIBILIDADE GENERALIZADO (Z):');

// Limite de Gás Ideal (Pr -> 0, Tr = 1.5): Z deve tender a 1.0
const zIdeal = CompressibilityEngine.solve(0.05, 1.5);
assert(approxEq(zIdeal.Z, 1.0, 1.0), 'Limite de gás ideal (Pr=0.05, Tr=1.5): Z ~ 1.0', `Obtido: ${zIdeal.Z}`);

// Ponto Próximo ao Crítico (Pr = 1.0, Tr = 1.0): Z deve ser ~0.28
const zCrit = CompressibilityEngine.solve(1.0, 1.0);
assert(zCrit.Z >= 0.25 && zCrit.Z <= 0.35, 'Comportamento crítico (Pr=1.0, Tr=1.0): Z entre 0.25 e 0.35', `Obtido: ${zCrit.Z}`);

// Região Supercrítica Moderada (Pr = 1.0, Tr = 2.0): Z deve ser ~0.95 - 0.98
const zSuper = CompressibilityEngine.solve(1.0, 2.0);
assert(zSuper.Z >= 0.95 && zSuper.Z <= 0.99, 'Região Tr=2.0, Pr=1.0: Z ~ 0.97', `Obtido: ${zSuper.Z}`);

// -----------------------------------------------------------------------------
// 7. PSICROMETRIA (ASHRAE AR ÚMIDO)
// -----------------------------------------------------------------------------
console.log('\n7. TESTANDO PSICROMETRIA (ASHRAE FUNDAMENTALS):');

// Condição Padrão de Conforto: Tbs = 25 °C, UR = 50%, P = 101.325 kPa
const psychStd = PsychrometricsEngine.solve({ Tdb: 25, inputMode: 'RH', value: 50 });
assert(approxEq((psychStd.w || 0) * 1000, 9.88, 2.0), 'Psicrometria 25°C 50% UR: w ~ 9.88 g/kg', `Obtido: ${((psychStd.w || 0) * 1000).toFixed(2)} g/kg`);
assert(approxEq(psychStd.h, 50.3, 2.0), 'Psicrometria 25°C 50% UR: h ~ 50.3 kJ/kg', `Obtido: ${psychStd.h}`);
assert(approxEq(psychStd.Tdp || 0, 13.9, 3.0), 'Psicrometria 25°C 50% UR: Tpo ~ 13.9 °C', `Obtido: ${psychStd.Tdp}`);
assert(approxEq(psychStd.Twb || 0, 17.9, 3.0), 'Psicrometria 25°C 50% UR: Tbu ~ 17.9 °C', `Obtido: ${psychStd.Twb}`);
assert(approxEq(psychStd.v, 0.858, 2.0), 'Psicrometria 25°C 50% UR: v ~ 0.858 m3/kg', `Obtido: ${psychStd.v}`);

// Condição de Saturação (UR = 100%): Tbs = Tbu = Tpo
const psychSat = PsychrometricsEngine.solve({ Tdb: 20, inputMode: 'RH', value: 100 });
assert(approxEq(psychSat.Tdb || 0, psychSat.Twb || 0, 0.5), 'Ar saturado (UR=100%): Tbs == Tbu', `Tbs: ${psychSat.Tdb}, Tbu: ${psychSat.Twb}`);
assert(approxEq(psychSat.Tdb || 0, psychSat.Tdp || 0, 0.5), 'Ar saturado (UR=100%): Tbs == Tpo', `Tbs: ${psychSat.Tdb}, Tpo: ${psychSat.Tdp}`);

// -----------------------------------------------------------------------------
// 8. CONVERSOR DE UNIDADES (SI, BAR, ENGLISH)
// -----------------------------------------------------------------------------
console.log('\n8. TESTANDO CONVERSOR DE UNIDADES:');

// Temperatura
assert(approxEq(UnitConverter.toInternalT(100, '°C'), 100, 0.01), 'Conversão T: 100°C -> 100°C');
assert(approxEq(UnitConverter.toInternalT(373.15, 'K'), 100, 0.01), 'Conversão T: 373.15 K -> 100°C');
assert(approxEq(UnitConverter.toInternalT(212, '°F'), 100, 0.01), 'Conversão T: 212°F -> 100°C');
assert(approxEq(UnitConverter.fromInternalT(100, '°F'), 212, 0.01), 'Conversão T: 100°C -> 212°F');

// Pressão
assert(approxEq(UnitConverter.toInternalP(1.0, 'MPa'), 1.0, 0.01), 'Conversão P: 1.0 MPa -> 1.0 MPa');
assert(approxEq(UnitConverter.toInternalP(10.0, 'bar'), 1.0, 0.01), 'Conversão P: 10.0 bar -> 1.0 MPa');
assert(approxEq(UnitConverter.toInternalP(1000.0, 'kPa'), 1.0, 0.01), 'Conversão P: 1000 kPa -> 1.0 MPa');
assert(approxEq(UnitConverter.toInternalP(145.038, 'psia'), 1.0, 0.1), 'Conversão P: 145.038 psia -> 1.0 MPa');

// Energia e Entalpia
assert(approxEq(UnitConverter.toInternalEnergy(1.0, 'kJ/kg'), 1.0, 0.01), 'Conversão h: 1 kJ/kg -> 1 kJ/kg');
assert(approxEq(UnitConverter.fromInternalEnergy(1.0, 'Btu/lbm'), 0.42992, 0.1), 'Conversão h: 1 kJ/kg -> 0.42992 Btu/lbm');
assert(approxEq(UnitConverter.fromInternalEnergy(1.0, 'Btu/lb'), 0.42992, 0.1), 'Conversão h: 1 kJ/kg -> 0.42992 Btu/lb (sinônimo)');

// -----------------------------------------------------------------------------
// 9. PROCESSOS TERMODINÂMICOS (OS 9 PROCESSOS CLÁSSICOS DO CATT3)
// -----------------------------------------------------------------------------
console.log('\n9. TESTANDO OS 9 PROCESSOS DO ASSISTENTE DE PROCESSOS (PLOT PROCESS):');
const stateBase = WaterEngine.solveGeneral({ T: 150, P_MPa: 1.0 });

// 1. Isotérmico (T = cte)
const procIsoT = ProcessPlotter.calculateProcess({
  state1: stateBase,
  type: 'ISOTHERMAL',
  targetProperty: 'P',
  targetValue: 0.5,
});
assert(approxEq(procIsoT.state2.T, stateBase.T, 0.5), 'Processo Isotérmico: T2 == T1');
assert(procIsoT.path.length > 5, 'Processo Isotérmico: Caminho gerado');

// 2. Isobárico (P = cte)
const procIsoP = ProcessPlotter.calculateProcess({
  state1: stateBase,
  type: 'ISOBARIC',
  targetProperty: 'T',
  targetValue: 200,
});
assert(approxEq(procIsoP.state2.P_MPa, stateBase.P_MPa, 0.01), 'Processo Isobárico: P2 == P1');
assert(approxEq(procIsoP.heat, procIsoP.state2.h - procIsoP.state1.h, 0.1), 'Processo Isobárico: q == Delta h');

// 3. Isocórico (v = cte)
const procIsoV = ProcessPlotter.calculateProcess({
  state1: stateBase,
  type: 'ISOCHORIC',
  targetProperty: 'P',
  targetValue: 0.8,
});
assert(approxEq(procIsoV.state2.v, stateBase.v, 0.001), 'Processo Isocórico: v2 == v1');
assert(approxEq(procIsoV.work, 0, 0.001), 'Processo Isocórico: Trabalho w == 0');

// 4. Isentrópico (s = cte)
const procIsoS = ProcessPlotter.calculateProcess({
  state1: stateBase,
  type: 'ISENTROPIC',
  targetProperty: 'P',
  targetValue: 0.5,
});
assert(approxEq(procIsoS.state2.s, stateBase.s, 0.05), 'Processo Isentrópico: s2 == s1');
assert(approxEq(procIsoS.heat, 0, 0.001), 'Processo Isentrópico: Calor q == 0');

// 5. Isenérgico (u = cte)
const procIsoU = ProcessPlotter.calculateProcess({
  state1: stateBase,
  type: 'ISENERGIC',
  targetProperty: 'P',
  targetValue: 0.7,
});
assert(procIsoU.path.length > 5, 'Processo Isenérgico: Caminho gerado');

// 6. Isentálpico (h = cte - estrangulamento)
const procIsoH = ProcessPlotter.calculateProcess({
  state1: stateBase,
  type: 'ISENTHALPIC',
  targetProperty: 'P',
  targetValue: 0.5,
});
assert(approxEq(procIsoH.state2.h, stateBase.h, 0.5), 'Processo Isentálpico: h2 == h1');
assert(approxEq(procIsoH.work, 0, 0.001), 'Processo Isentálpico: Trabalho w == 0');

// 7. P inverso em v (P*v = cte)
const procPInvV = ProcessPlotter.calculateProcess({
  state1: stateBase,
  type: 'PINVERSE_V',
  targetProperty: 'P',
  targetValue: 0.5,
});
assert(approxEq(procPInvV.state2.P_MPa * procPInvV.state2.v, stateBase.P_MPa * stateBase.v, 0.05), 'Processo P*v = cte: P2*v2 == P1*v1');

// 8. Politrópico (P*v^n = cte)
const procPoly = ProcessPlotter.calculateProcess({
  state1: stateBase,
  type: 'POLYTROPIC',
  targetProperty: 'P',
  targetValue: 0.5,
  polytropicN: 1.3,
});
assert(procPoly.path.length > 5, 'Processo Politrópico: Caminho gerado');
assert(procPoly.work !== 0, 'Processo Politrópico: Trabalho w calculado');

// 9. Pressão linear com volume (P = a + b*v)
const procLin = ProcessPlotter.calculateProcess({
  state1: stateBase,
  type: 'LINEAR_PV',
  targetProperty: 'P',
  targetValue: 0.6,
  targetV2Linear: stateBase.v * 1.4,
});
assert(procLin.path.length > 5, 'Processo Linear: Caminho gerado');
assert(procLin.work > 0, 'Processo Linear: Trabalho w > 0');

console.log('\n================================================================');
console.log(`RESULTADO FINAL DOS TESTES:`);
console.log(`TOTAL DE ASSERTIVAS: ${totalTests}`);
console.log(`PASSOU: ${passedTests}`);
console.log(`FALHOU: ${failedTests}`);
console.log('================================================================');

if (failedTests === 0) {
  console.log('\n>>> TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! PARABÉNS! <<<');
  process.exit(0);
} else {
  console.error(`\n>>> ATENÇÃO: ${failedTests} TESTES FALHARAM! <<<`);
  process.exit(1);
}
