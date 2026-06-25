// ============================================================
// electrical.test.ts — unit + regression tests for the electrical engine
// ============================================================
// Deploy-safe: lives outside `src` so the production `tsc` (include: ["src"])
// never compiles it, and it uses node:assert + esbuild bundling so it needs no
// extra npm dependencies. Run with `npm test`.
// ============================================================

import assert from 'node:assert/strict';

import { PRODUCT_MAP, ALL_PRODUCTS } from '../src/data/products';
import { analyzeSystemCircuits } from '../src/utils/circuitAnalysis';
import { generateWarnings } from '../src/utils/electricalCalculations';
import { selectBestFuseProduct, getFuseRating } from '../src/utils/fuseSelection';
import { continuousFactorForBus, DEFAULT_ASSUMPTIONS } from '../src/data/electricalRules';
import { voltageDropV, cableByAwg } from '../src/data/cableAmpacity';
import { nextStandardFuse } from '../src/data/fuseRatings';
import { selectLug, lugKey } from '../src/data/lugs';
import { getEffectiveConnector } from '../src/utils/terminalConnectors';
import { buildCableBomRows, buildConnectorSummary } from '../src/utils/cableSummary';
import type { SystemDesign } from '../src/types/system';

// ---- tiny test runner -------------------------------------------------------
let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (err) {
    failed++;
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`${name}\n      ${msg.replace(/\n/g, '\n      ')}`);
    console.log(`  FAIL ${name}`);
  }
}

function fusesByFamily(family: string) {
  return ALL_PRODUCTS.filter(
    (p) => p.productType === 'fuse' && p.category === family && p.protectionRatings?.currentRatingA != null
  );
}

// ---- fuse selection: the cable-protection invariant -------------------------

test('selectBestFuseProduct never exceeds cable ampacity (ANL on 73A/8AWG)', () => {
  const anl = fusesByFamily('ANL');
  const best = selectBestFuseProduct(anl, { targetA: 70, maxAmpacityA: 73 });
  assert.ok(best, 'expected a fuse to be selected');
  assert.ok(
    getFuseRating(best!) <= 73,
    `selected ${getFuseRating(best!)}A fuse exceeds the 73A cable ampacity`
  );
});

test('selectBestFuseProduct hits the target exactly when a part fits (MIDI 70A)', () => {
  const midi = fusesByFamily('MIDI'); // MIDI has a 70A part
  const best = selectBestFuseProduct(midi, { targetA: 70, maxAmpacityA: 73 });
  assert.equal(getFuseRating(best!), 70);
});

test('selectBestFuseProduct rounds up to target when ampacity allows', () => {
  const anl = fusesByFamily('ANL'); // ANL: 60, 80, 100 ... (no 70)
  const best = selectBestFuseProduct(anl, { targetA: 70, maxAmpacityA: 170 });
  assert.equal(getFuseRating(best!), 80, 'should pick the next size up (80A) when the cable allows it');
});

test('selectBestFuseProduct falls back to largest within ampacity when target unreachable', () => {
  const anl = fusesByFamily('ANL');
  // Ceiling 65A: only 35/40/50/60 are <= 65; target 70 unreachable -> pick 60.
  const best = selectBestFuseProduct(anl, { targetA: 70, maxAmpacityA: 65 });
  assert.equal(getFuseRating(best!), 60);
});

// ---- pure helpers -----------------------------------------------------------

test('continuousFactorForBus applies 156% to PV, 125% elsewhere', () => {
  assert.equal(continuousFactorForBus('pv_pos'), 1.5625);
  assert.equal(continuousFactorForBus('pv_neg'), 1.5625);
  assert.equal(continuousFactorForBus('dc_pos'), 1.25);
  assert.equal(continuousFactorForBus('ac_line'), 1.25);
});

test('voltageDropV is round-trip (2 * I * R * L)', () => {
  const spec = cableByAwg('8')!;
  const expected = 2 * 50 * spec.resistanceOhmPerFt * 10;
  assert.ok(Math.abs(voltageDropV(50, 10, '8') - expected) < 1e-9);
});

test('nextStandardFuse rounds up to a standard rating', () => {
  assert.equal(nextStandardFuse(62.5), 70);
  assert.equal(nextStandardFuse(50), 50);
  assert.equal(nextStandardFuse(101), 110);
});

// ---- integration: MPPT branch regression (the reported scenario) ------------

function mpptOnBusbar(nominalVoltage: 12 | 24, lengthFt: number, busProductId: string): SystemDesign {
  return {
    id: 't', name: 't', nominalVoltage,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '', updatedAt: '',
    components: [
      { id: 'mppt', productId: 'mppt-100-50', label: 'MPPT', quantity: 1, x: 0, y: 0 },
      { id: 'bat', productId: 'bat-vic-smart-12-200', label: 'Bat', quantity: 1, x: 0, y: 200 },
      { id: 'bus', productId: busProductId, label: 'Bus', quantity: 1, x: 200, y: 100, busPolarity: 'positive' },
    ],
    connections: [
      { id: 'mppt-p', fromComponentId: 'mppt', fromTerminalId: 'bat_pos', toComponentId: 'bus', toTerminalId: 'terminal_1', cableLengthFt: lengthFt },
      { id: 'mppt-n', fromComponentId: 'mppt', fromTerminalId: 'bat_neg', toComponentId: 'bus', toTerminalId: 'terminal_1', cableLengthFt: lengthFt },
      { id: 'bat-p', fromComponentId: 'bat', fromTerminalId: 'dc_pos', toComponentId: 'bus', toTerminalId: 'terminal_2', cableLengthFt: 2 },
      { id: 'bat-n', fromComponentId: 'bat', fromTerminalId: 'dc_neg', toComponentId: 'bus', toTerminalId: 'terminal_2', cableLengthFt: 2 },
    ],
  } as SystemDesign;
}

function mpptOnBusyPositiveBus(lengthFt: number, maxCableAwg?: string): SystemDesign {
  return {
    id: 'busy-bus',
    name: 'busy-bus',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'mppt', productId: 'mppt-100-50', label: 'MPPT', quantity: 1, x: 0, y: 0, maxCableAwg },
      { id: 'dcdc', productId: 'orion-tr-smart-12-12-30-non-isolated', label: 'DC-DC', quantity: 1, x: 0, y: 100 },
      { id: 'inv', productId: 'inv-vic-mp2-12-3000', label: 'Inverter', quantity: 1, x: 0, y: 200 },
      { id: 'bat', productId: 'bat-vic-smart-12-200', label: 'Bat', quantity: 1, x: 0, y: 300 },
      {
        id: 'bus',
        productId: 'dist-generic-busbar-5pt',
        label: 'Positive Bus',
        quantity: 1,
        x: 200,
        y: 100,
        inferredConnectionKind: 'dc_power',
        inferredPolarity: 'positive',
        inferredElectricalType: 'dc_pos',
        inferredVoltageClass: 'dc_low_voltage',
      },
    ],
    connections: [
      { id: 'mppt-p', fromComponentId: 'mppt', fromTerminalId: 'bat_pos', toComponentId: 'bus', toTerminalId: 'terminal_1', cableLengthFt: lengthFt },
      { id: 'dcdc-p', fromComponentId: 'dcdc', fromTerminalId: 'out_pos', toComponentId: 'bus', toTerminalId: 'terminal_2', cableLengthFt: 4 },
      { id: 'inv-p', fromComponentId: 'bus', fromTerminalId: 'terminal_3', toComponentId: 'inv', toTerminalId: 'dc_pos', cableLengthFt: 5 },
      { id: 'bat-p', fromComponentId: 'bat', fromTerminalId: 'dc_pos', toComponentId: 'bus', toTerminalId: 'terminal_4', cableLengthFt: 2 },
    ],
  } as SystemDesign;
}

function batteryFuseLoad(loadA: number, fuseProductId = 'fuse-midi-100a', manualCableAwg?: string): SystemDesign {
  return {
    id: 'battery-fuse-load',
    name: 'battery-fuse-load',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'bat', productId: 'bat-vic-smart-12-200', label: 'Battery', quantity: 1, x: 0, y: 0 },
      { id: 'fuse', productId: fuseProductId, label: 'Branch Fuse', quantity: 1, x: 120, y: 0 },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'Load', quantity: 1, x: 240, y: 0, instanceMaxCurrentA: loadA },
    ],
    connections: [
      { id: 'bat-fuse', fromComponentId: 'bat', fromTerminalId: 'dc_pos', toComponentId: 'fuse', toTerminalId: 'in', cableLengthFt: 2 },
      {
        id: 'fuse-load',
        fromComponentId: 'fuse',
        fromTerminalId: 'out',
        toComponentId: 'load',
        toTerminalId: 'dc_pos',
        cableLengthFt: 4,
        ...(manualCableAwg ? { manualCableAwg } : {}),
      },
    ],
  } as SystemDesign;
}

function batteryBusLoadNoFuse(loadA: number): SystemDesign {
  return {
    id: 'battery-bus-load',
    name: 'battery-bus-load',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'bat', productId: 'bat-vic-smart-12-200', label: 'Battery', quantity: 1, x: 0, y: 0 },
      {
        id: 'bus',
        productId: 'dist-generic-busbar-5pt',
        label: 'Positive Bus',
        quantity: 1,
        x: 120,
        y: 0,
        inferredConnectionKind: 'dc_power',
        inferredPolarity: 'positive',
        inferredElectricalType: 'dc_pos',
        inferredVoltageClass: 'dc_low_voltage',
      },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'Load', quantity: 1, x: 240, y: 0, instanceMaxCurrentA: loadA },
    ],
    connections: [
      { id: 'bat-bus', fromComponentId: 'bat', fromTerminalId: 'dc_pos', toComponentId: 'bus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bus-load', fromComponentId: 'bus', fromTerminalId: 'terminal_2', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 4 },
    ],
  } as SystemDesign;
}

function batteryBatteryOneFuse(): SystemDesign {
  return {
    id: 'battery-battery-one-fuse',
    name: 'battery-battery-one-fuse',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'bat-a', productId: 'bat-vic-smart-12-200', label: 'Battery A', quantity: 1, x: 0, y: 0 },
      { id: 'fuse', productId: 'fuse-midi-100a', label: 'A-side Fuse', quantity: 1, x: 120, y: 0 },
      { id: 'bat-b', productId: 'bat-vic-smart-12-200', label: 'Battery B', quantity: 1, x: 240, y: 0 },
    ],
    connections: [
      { id: 'a-fuse', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos', toComponentId: 'fuse', toTerminalId: 'in', cableLengthFt: 1, designCurrentOverrideA: 80 },
      { id: 'fuse-b', fromComponentId: 'fuse', fromTerminalId: 'out', toComponentId: 'bat-b', toTerminalId: 'dc_pos', cableLengthFt: 6, designCurrentOverrideA: 80 },
    ],
  } as SystemDesign;
}

function overloadedPositiveBusbar(): SystemDesign {
  return {
    id: 'overloaded-busbar',
    name: 'overloaded-busbar',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'bat', productId: 'bat-vic-smart-12-200', label: 'Battery', quantity: 1, x: 0, y: 0 },
      {
        id: 'bus',
        productId: 'dist-generic-busbar',
        label: 'Positive Bus',
        quantity: 1,
        x: 120,
        y: 0,
        inferredConnectionKind: 'dc_power',
        inferredPolarity: 'positive',
        inferredElectricalType: 'dc_pos',
        inferredVoltageClass: 'dc_low_voltage',
      },
      { id: 'load-a', productId: 'acc-dc-load-generic', label: 'Load A', quantity: 1, x: 240, y: -40, instanceMaxCurrentA: 250 },
      { id: 'load-b', productId: 'acc-dc-load-generic', label: 'Load B', quantity: 1, x: 240, y: 40, instanceMaxCurrentA: 250 },
    ],
    connections: [
      { id: 'bat-bus', fromComponentId: 'bat', fromTerminalId: 'dc_pos', toComponentId: 'bus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bus-load-a', fromComponentId: 'bus', fromTerminalId: 'terminal_2', toComponentId: 'load-a', toTerminalId: 'dc_pos', cableLengthFt: 4 },
      { id: 'bus-load-b', fromComponentId: 'bus', fromTerminalId: 'terminal_3', toComponentId: 'load-b', toTerminalId: 'dc_pos', cableLengthFt: 4 },
    ],
  } as SystemDesign;
}

function incompatibleBatterySources(): SystemDesign {
  return {
    id: 'incompatible-sources',
    name: 'incompatible-sources',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'bat-12', productId: 'bat-vic-smart-12-200', label: '12V Battery', quantity: 1, x: 0, y: 0 },
      { id: 'bat-24', productId: 'bat-vic-smart-24-100', label: '24V Battery', quantity: 1, x: 0, y: 100 },
      {
        id: 'bus',
        productId: 'dist-generic-busbar',
        label: 'Positive Bus',
        quantity: 1,
        x: 160,
        y: 50,
        inferredConnectionKind: 'dc_power',
        inferredPolarity: 'positive',
        inferredElectricalType: 'dc_pos',
        inferredVoltageClass: 'dc_low_voltage',
      },
    ],
    connections: [
      { id: 'bat-12-bus', fromComponentId: 'bat-12', fromTerminalId: 'dc_pos', toComponentId: 'bus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bat-24-bus', fromComponentId: 'bat-24', fromTerminalId: 'dc_pos', toComponentId: 'bus', toTerminalId: 'terminal_2', cableLengthFt: 2 },
    ],
  } as SystemDesign;
}

function overloadedDistributionBus(): SystemDesign {
  return {
    id: 'overloaded-distribution',
    name: 'overloaded-distribution',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'lynx', productId: 'dist-vic-lynx-distributor', label: 'Lynx Distributor', quantity: 1, x: 0, y: 0 },
      { id: 'load-a', productId: 'acc-dc-load-generic', label: 'Load A', quantity: 1, x: 240, y: -90, instanceMaxCurrentA: 300 },
      { id: 'load-b', productId: 'acc-dc-load-generic', label: 'Load B', quantity: 1, x: 240, y: -30, instanceMaxCurrentA: 300 },
      { id: 'load-c', productId: 'acc-dc-load-generic', label: 'Load C', quantity: 1, x: 240, y: 30, instanceMaxCurrentA: 300 },
      { id: 'load-d', productId: 'acc-dc-load-generic', label: 'Load D', quantity: 1, x: 240, y: 90, instanceMaxCurrentA: 300 },
    ],
    connections: [
      { id: 'lynx-load-a', fromComponentId: 'lynx', fromTerminalId: 'out_pos_1', toComponentId: 'load-a', toTerminalId: 'dc_pos', cableLengthFt: 4 },
      { id: 'lynx-load-b', fromComponentId: 'lynx', fromTerminalId: 'out_pos_2', toComponentId: 'load-b', toTerminalId: 'dc_pos', cableLengthFt: 4 },
      { id: 'lynx-load-c', fromComponentId: 'lynx', fromTerminalId: 'out_pos_3', toComponentId: 'load-c', toTerminalId: 'dc_pos', cableLengthFt: 4 },
      { id: 'lynx-load-d', fromComponentId: 'lynx', fromTerminalId: 'out_pos_4', toComponentId: 'load-d', toTerminalId: 'dc_pos', cableLengthFt: 4 },
    ],
  } as SystemDesign;
}

function mpptWithOversizePositiveFuseAndSixAwgReturn(): SystemDesign {
  return {
    id: 'mppt-return-sizing',
    name: 'mppt-return-sizing',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'mppt', productId: 'mppt-100-50', label: 'MPPT Charge Controller', quantity: 1, x: 0, y: 0 },
      { id: 'fuse', productId: 'fuse-midi-80a', label: '80A Fuse', quantity: 1, x: 120, y: -40 },
      {
        id: 'pos-bus',
        productId: 'dist-generic-busbar',
        label: 'Positive Bus',
        quantity: 1,
        x: 260,
        y: -40,
        inferredConnectionKind: 'dc_power',
        inferredPolarity: 'positive',
        inferredElectricalType: 'dc_pos',
        inferredVoltageClass: 'dc_low_voltage',
      },
      {
        id: 'neg-bus',
        productId: 'dist-generic-busbar',
        label: 'Negative Bus',
        quantity: 1,
        x: 260,
        y: 40,
        inferredConnectionKind: 'dc_power',
        inferredPolarity: 'negative',
        inferredElectricalType: 'dc_neg',
        inferredVoltageClass: 'dc_low_voltage',
      },
    ],
    connections: [
      { id: 'mppt-fuse', fromComponentId: 'mppt', fromTerminalId: 'bat_pos', toComponentId: 'fuse', toTerminalId: 'in', cableLengthFt: 2, manualCableAwg: '4' },
      { id: 'fuse-bus', fromComponentId: 'fuse', fromTerminalId: 'out', toComponentId: 'pos-bus', toTerminalId: 'terminal_1', cableLengthFt: 2, manualCableAwg: '4' },
      { id: 'mppt-return', fromComponentId: 'mppt', fromTerminalId: 'bat_neg', toComponentId: 'neg-bus', toTerminalId: 'terminal_1', cableLengthFt: 4, manualCableAwg: '6' },
    ],
  } as SystemDesign;
}

function mpptFusedToBatteryBackedBus(): SystemDesign {
  const base = mpptWithOversizePositiveFuseAndSixAwgReturn();
  return {
    ...base,
    id: 'mppt-fused-battery-backed-bus',
    name: 'mppt-fused-battery-backed-bus',
    components: [
      ...base.components,
      { id: 'bat', productId: 'bat-vic-smart-12-200', label: 'Battery', quantity: 1, x: 420, y: -40 },
    ],
    connections: [
      ...base.connections,
      { id: 'bat-bus', fromComponentId: 'bat', fromTerminalId: 'dc_pos', toComponentId: 'pos-bus', toTerminalId: 'terminal_2', cableLengthFt: 1 },
    ],
  } as SystemDesign;
}

function parallelBatteryBankWithSingleMainFuse(): SystemDesign {
  const busDefaults = {
    productId: 'dist-generic-busbar-5pt',
    quantity: 1,
    inferredConnectionKind: 'dc_power',
    inferredVoltageClass: 'dc_low_voltage',
  } as const;

  return {
    id: 'parallel-bank-single-main-fuse',
    name: 'parallel-bank-single-main-fuse',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'bat-a', productId: 'bat-vic-smart-12-200', label: 'Battery A', quantity: 1, x: 0, y: -80 },
      { id: 'bat-b', productId: 'bat-vic-smart-12-200', label: 'Battery B', quantity: 1, x: 0, y: 80 },
      {
        ...busDefaults,
        id: 'pos-bank',
        label: 'Positive Battery Collector',
        x: 170,
        y: -60,
        busPolarity: 'positive',
        inferredPolarity: 'positive',
        inferredElectricalType: 'dc_pos',
      },
      {
        ...busDefaults,
        id: 'neg-bank',
        label: 'Negative Battery Collector',
        x: 170,
        y: 60,
        busPolarity: 'negative',
        inferredPolarity: 'negative',
        inferredElectricalType: 'dc_neg',
      },
      { id: 'fuse', productId: 'fuse-mega-generic-58v-300a', label: '300A Main Fuse', quantity: 1, x: 330, y: -60 },
      {
        ...busDefaults,
        id: 'pos-main',
        label: 'Positive Busbar',
        x: 500,
        y: -60,
        busPolarity: 'positive',
        inferredPolarity: 'positive',
        inferredElectricalType: 'dc_pos',
      },
      {
        ...busDefaults,
        id: 'neg-main',
        label: 'Negative Busbar',
        x: 500,
        y: 60,
        busPolarity: 'negative',
        inferredPolarity: 'negative',
        inferredElectricalType: 'dc_neg',
      },
      { id: 'mppt', productId: 'mppt-100-50', label: 'MPPT Charge Controller', quantity: 1, x: 650, y: 0 },
    ],
    connections: [
      { id: 'bat-a-pos', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos', toComponentId: 'pos-bank', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bat-b-pos', fromComponentId: 'bat-b', fromTerminalId: 'dc_pos', toComponentId: 'pos-bank', toTerminalId: 'terminal_2', cableLengthFt: 2 },
      { id: 'bat-a-neg', fromComponentId: 'bat-a', fromTerminalId: 'dc_neg', toComponentId: 'neg-bank', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bat-b-neg', fromComponentId: 'bat-b', fromTerminalId: 'dc_neg', toComponentId: 'neg-bank', toTerminalId: 'terminal_2', cableLengthFt: 2 },
      { id: 'bank-fuse', fromComponentId: 'pos-bank', fromTerminalId: 'terminal_3', toComponentId: 'fuse', toTerminalId: 'in', cableLengthFt: 1 },
      { id: 'fuse-main', fromComponentId: 'fuse', fromTerminalId: 'out', toComponentId: 'pos-main', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'neg-bank-main', fromComponentId: 'neg-bank', fromTerminalId: 'terminal_3', toComponentId: 'neg-main', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'mppt-pos', fromComponentId: 'mppt', fromTerminalId: 'bat_pos', toComponentId: 'pos-main', toTerminalId: 'terminal_2', cableLengthFt: 4 },
      { id: 'mppt-neg', fromComponentId: 'mppt', fromTerminalId: 'bat_neg', toComponentId: 'neg-main', toTerminalId: 'terminal_2', cableLengthFt: 4 },
    ],
  } as SystemDesign;
}

function daisyChainParallelBatteries(): SystemDesign {
  const busDefaults = {
    productId: 'dist-generic-busbar-5pt',
    quantity: 1,
    inferredConnectionKind: 'dc_power',
    inferredVoltageClass: 'dc_low_voltage',
  } as const;

  return {
    id: 'daisy-chain-parallel-batteries',
    name: 'daisy-chain-parallel-batteries',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'bat-a', productId: 'bat-vic-smart-12-200', label: 'Battery A', quantity: 1, x: 0, y: -80 },
      { id: 'bat-b', productId: 'bat-vic-smart-12-200', label: 'Battery B', quantity: 1, x: 0, y: 80 },
      { id: 'fuse', productId: 'fuse-mega-generic-58v-300a', label: '300A Main Fuse', quantity: 1, x: 200, y: -80 },
      {
        ...busDefaults,
        id: 'pos-main',
        label: 'Positive Busbar',
        x: 400,
        y: -60,
        busPolarity: 'positive',
        inferredPolarity: 'positive',
        inferredElectricalType: 'dc_pos',
      },
      {
        ...busDefaults,
        id: 'neg-main',
        label: 'Negative Busbar',
        x: 400,
        y: 60,
        busPolarity: 'negative',
        inferredPolarity: 'negative',
        inferredElectricalType: 'dc_neg',
      },
      { id: 'mppt', productId: 'mppt-100-50', label: 'MPPT Charge Controller', quantity: 1, x: 600, y: 0 },
    ],
    connections: [
      // Batteries wired directly in parallel (no collector busbar).
      { id: 'ab-pos', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos', toComponentId: 'bat-b', toTerminalId: 'dc_pos', cableLengthFt: 2 },
      { id: 'ab-neg', fromComponentId: 'bat-a', fromTerminalId: 'dc_neg', toComponentId: 'bat-b', toTerminalId: 'dc_neg', cableLengthFt: 2 },
      // Diagonal takeoff: positive off Battery A through the main fuse, negative off Battery B.
      { id: 'a-fuse', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos', toComponentId: 'fuse', toTerminalId: 'in', cableLengthFt: 1 },
      { id: 'fuse-main', fromComponentId: 'fuse', fromTerminalId: 'out', toComponentId: 'pos-main', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'b-neg-main', fromComponentId: 'bat-b', fromTerminalId: 'dc_neg', toComponentId: 'neg-main', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'mppt-pos', fromComponentId: 'mppt', fromTerminalId: 'bat_pos', toComponentId: 'pos-main', toTerminalId: 'terminal_2', cableLengthFt: 4 },
      { id: 'mppt-neg', fromComponentId: 'mppt', fromTerminalId: 'bat_neg', toComponentId: 'neg-main', toTerminalId: 'terminal_2', cableLengthFt: 4 },
    ],
  } as SystemDesign;
}

function dcSourceFeedingSmallDcLoad(): SystemDesign {
  return {
    id: 'dc-source-small-load',
    name: 'dc-source-small-load',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'source', productId: 'generic-alternator-source', label: 'DC Source', quantity: 1, x: 0, y: 0, instanceMaxCurrentA: 50 },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'DC Load', quantity: 1, x: 180, y: 0, instanceMaxCurrentA: 15 },
    ],
    connections: [
      { id: 'source-load-pos', fromComponentId: 'source', fromTerminalId: 'dc_pos', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 4 },
    ],
  } as SystemDesign;
}

function dcSourceFuseLoad(sourceA: number, loadA: number): SystemDesign {
  return {
    id: 'dc-source-fuse-load',
    name: 'dc-source-fuse-load',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'source', productId: 'generic-alternator-source', label: 'DC Source', quantity: 1, x: 0, y: 0, instanceMaxCurrentA: sourceA },
      { id: 'fuse', productId: 'fuse-midi-100a', label: 'Branch Fuse', quantity: 1, x: 120, y: 0 },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'DC Load', quantity: 1, x: 240, y: 0, instanceMaxCurrentA: loadA },
    ],
    connections: [
      { id: 'src-fuse', fromComponentId: 'source', fromTerminalId: 'dc_pos', toComponentId: 'fuse', toTerminalId: 'in', cableLengthFt: 2 },
      { id: 'fuse-load', fromComponentId: 'fuse', fromTerminalId: 'out', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 4 },
    ],
  } as SystemDesign;
}

function batteryFuseLoadWithUndersizedReturn(loadA: number): SystemDesign {
  const base = batteryFuseLoad(loadA);
  return {
    ...base,
    connections: [
      ...base.connections,
      {
        id: 'load-return',
        fromComponentId: 'load',
        fromTerminalId: 'dc_neg',
        toComponentId: 'bat',
        toTerminalId: 'dc_neg',
        cableLengthFt: 4,
        manualCableAwg: '18',
      },
    ],
  } as SystemDesign;
}

function shuntOverRating(): SystemDesign {
  return {
    id: 'shunt-over-rating',
    name: 'shunt-over-rating',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'bat', productId: 'bat-vic-smart-12-200', label: 'Battery', quantity: 1, x: 0, y: 0 },
      { id: 'shunt', productId: 'smartshunt-500', label: 'SmartShunt', quantity: 1, x: 160, y: 0 },
    ],
    connections: [
      {
        id: 'bat-shunt',
        fromComponentId: 'bat',
        fromTerminalId: 'dc_neg',
        toComponentId: 'shunt',
        toTerminalId: 'shunt_neg',
        cableLengthFt: 2,
        designCurrentOverrideA: 600,
      },
    ],
  } as SystemDesign;
}

function errorCodes(system: SystemDesign, connectionId: string): string[] {
  return analyzeSystemCircuits(system, PRODUCT_MAP).connections.get(connectionId)!.errors.map((issue) => issue.code);
}

function warningCodes(system: SystemDesign): string[] {
  return generateWarnings(system, PRODUCT_MAP).map((warning) => warning.code);
}

test('50A MPPT on a busbar: design 50A, fuse 70A, no busbar-rating leak', () => {
  const analysis = analyzeSystemCircuits(mpptOnBusbar(12, 4, 'dist-generic-busbar-5pt'), PRODUCT_MAP);
  const c = analysis.connections.get('mppt-p')!;
  assert.equal(c.designCurrentA, 50, 'MPPT output branch should carry its own 50A, not the busbar rating');
  assert.equal(c.recommendedFuseA, 70, '50A * 1.25 -> next standard fuse = 70A');
});

test('50A MPPT branch ignores other normal sources on the same DC bus', () => {
  const analysis = analyzeSystemCircuits(mpptOnBusyPositiveBus(4), PRODUCT_MAP);
  const c = analysis.connections.get('mppt-p')!;
  assert.equal(c.designCurrentA, 50, 'MPPT output branch should not inherit inverter-charger or DC-DC source current');
  assert.equal(c.recommendedFuseA, 70, '50A * 1.25 -> next standard fuse = 70A');
});

test('component max cable override caps automatic cable recommendation', () => {
  const analysis = analyzeSystemCircuits(mpptOnBusyPositiveBus(30, '6'), PRODUCT_MAP);
  const c = analysis.connections.get('mppt-p')!;
  assert.equal(c.designCurrentA, 50);
  assert.equal(c.recommendedFuseA, 70);
  assert.equal(c.recommendedCableAwg, '6');
  assert.ok(c.warnings.some((warning) => warning.includes('capped at endpoint maximum of 6 AWG')));
});

test('50A MPPT fuse is unchanged by busbar ampacity rating (400A vs 600A bars)', () => {
  // Generic busbars share terminal_N naming; 4pt is rated 400A, 5pt/8pt 600A.
  // The MPPT branch fuse must stay 70A regardless of the bar's own rating.
  for (const bus of ['dist-generic-busbar', 'dist-generic-busbar-5pt', 'dist-generic-busbar-8pt']) {
    const c = analyzeSystemCircuits(mpptOnBusbar(12, 4, bus), PRODUCT_MAP).connections.get('mppt-p')!;
    assert.equal(c.recommendedFuseA, 70, `fuse should be 70A on ${bus}, got ${c.recommendedFuseA}`);
  }
});

test('recommended fuse never exceeds the recommended cable ampacity', () => {
  // Across a range of lengths the engine may upsize cable for voltage drop;
  // the fuse must still be protected by (<=) that cable's ampacity.
  for (const len of [2, 4, 10, 20, 30]) {
    const c = analyzeSystemCircuits(mpptOnBusbar(12, len, 'dist-generic-busbar-5pt'), PRODUCT_MAP).connections.get('mppt-p')!;
    const amp = cableByAwg(c.recommendedCableAwg ?? '')?.ampacity ?? Infinity;
    assert.ok(
      (c.recommendedFuseA ?? 0) <= amp,
      `len ${len}ft: ${c.recommendedFuseA}A fuse exceeds ${c.recommendedCableAwg} ampacity ${amp}A`
    );
  }
});

test('battery source capability larger than selected fuse is valid when load and cable fit', () => {
  const c = analyzeSystemCircuits(batteryFuseLoad(80), PRODUCT_MAP).connections.get('fuse-load')!;
  assert.equal(c.designCurrentA, 80);
  assert.equal(c.selectedFuseA, 100);
  assert.equal(c.effectiveBranchLimitA, 100);
  assert.deepEqual(c.errors, []);
});

test('selected fuse below load current is a hard branch error', () => {
  const codes = errorCodes(batteryFuseLoad(120), 'fuse-load');
  assert.ok(codes.includes('SELECTED_FUSE_UNDER_BRANCH_CURRENT'));
});

test('selected fuse over manual cable ampacity is a hard branch error', () => {
  const codes = errorCodes(batteryFuseLoad(80, 'fuse-mega-generic-58v-200a', '6'), 'fuse-load');
  assert.ok(codes.includes('FUSE_OVER_CABLE_AMPACITY'));
});

test('battery-backed bus branch without fuse has source-side protection error', () => {
  const codes = errorCodes(batteryBusLoadNoFuse(80), 'bus-load');
  assert.ok(codes.includes('SOURCE_SIDE_PROTECTION_MISSING'));
});

test('source-to-source branch with one fuse is unprotected from the far battery side', () => {
  const codes = errorCodes(batteryBatteryOneFuse(), 'fuse-b');
  assert.ok(codes.includes('SOURCE_SIDE_PROTECTION_MISSING'));
});

test('busbar rating is checked against total connected branch current', () => {
  const codes = warningCodes(overloadedPositiveBusbar());
  assert.ok(codes.includes('BUSBAR_OVERLOADED'));
});

test('parallel DC sources with different nominal voltages are rejected', () => {
  const codes = warningCodes(incompatibleBatterySources());
  assert.ok(codes.includes('INCOMPATIBLE_SOURCE_VOLTAGES'));
});

test('distribution bus rating sums downstream protected outputs', () => {
  const codes = warningCodes(overloadedDistributionBus());
  assert.ok(codes.includes('DISTRIBUTION_BUS_OVERLOADED'));
});

test('50A MPPT return sizing uses branch current, not oversized fuse rating', () => {
  const codes = warningCodes(mpptWithOversizePositiveFuseAndSixAwgReturn());
  assert.ok(!codes.includes('DC_NEG_RETURN_UNDERSIZED'));
});

test('short busbar-to-fuse lead is valid source-side protection for MPPT branch', () => {
  const codes = errorCodes(mpptFusedToBatteryBackedBus(), 'fuse-bus');
  assert.ok(!codes.includes('SOURCE_SIDE_PROTECTION_MISSING'));
});

test('short parallel battery collector leads do not require individual source-side fuses', () => {
  const system = parallelBatteryBankWithSingleMainFuse();
  assert.ok(!errorCodes(system, 'bat-a-pos').includes('SOURCE_SIDE_PROTECTION_MISSING'));
  assert.ok(!errorCodes(system, 'bat-b-pos').includes('SOURCE_SIDE_PROTECTION_MISSING'));
});

test('parallel bank negative output sizes from the shared positive main fuse', () => {
  const c = analyzeSystemCircuits(parallelBatteryBankWithSingleMainFuse(), PRODUCT_MAP).connections.get('neg-bank-main')!;
  assert.equal(c.designCurrentA, 300);
  assert.equal(c.recommendedCableAwg, '4/0');
});

test('daisy-chained parallel battery interconnects size for the pack fuse, not the table minimum', () => {
  const analysis = analyzeSystemCircuits(daisyChainParallelBatteries(), PRODUCT_MAP);
  const posInterconnect = analysis.connections.get('ab-pos')!;
  const negInterconnect = analysis.connections.get('ab-neg')!;

  assert.equal(posInterconnect.designCurrentA, 300);
  assert.equal(posInterconnect.recommendedCableAwg, '4/0');
  assert.equal(negInterconnect.designCurrentA, 300);
  assert.equal(negInterconnect.recommendedCableAwg, '4/0');
});

test('daisy-chained parallel battery interconnects do not demand a separate source-side fuse', () => {
  const system = daisyChainParallelBatteries();
  assert.ok(!errorCodes(system, 'ab-pos').includes('SOURCE_SIDE_PROTECTION_MISSING'));
  assert.ok(!errorCodes(system, 'ab-neg').includes('SOURCE_SIDE_PROTECTION_MISSING'));
});

test('battery source capability is not counted as busbar operating current', () => {
  const codes = warningCodes(parallelBatteryBankWithSingleMainFuse());
  assert.ok(!codes.includes('BUSBAR_OVERLOADED'));
});

test('DC load instance current limits source-to-load branch current', () => {
  const c = analyzeSystemCircuits(dcSourceFeedingSmallDcLoad(), PRODUCT_MAP).connections.get('source-load-pos')!;
  assert.equal(c.designCurrentA, 15);
});

test('current-limited source feeding a smaller load is load-limited on both sides of an in-line fuse', () => {
  const analysis = analyzeSystemCircuits(dcSourceFuseLoad(50, 15), PRODUCT_MAP);
  const beforeFuse = analysis.connections.get('src-fuse')!;
  const afterFuse = analysis.connections.get('fuse-load')!;
  assert.equal(beforeFuse.designCurrentA, 15, 'source->fuse segment should carry the 15A load demand, not the 50A source rating');
  assert.equal(afterFuse.designCurrentA, 15, 'fuse->load segment should carry the 15A load demand');
  assert.equal(beforeFuse.designCurrentA, afterFuse.designCurrentA, 'branch current must match before and after the fuse');
});

test('current-limited source feeding an oversized load is clamped to source capability across a fuse', () => {
  const analysis = analyzeSystemCircuits(dcSourceFuseLoad(50, 200), PRODUCT_MAP);
  const beforeFuse = analysis.connections.get('src-fuse')!;
  const afterFuse = analysis.connections.get('fuse-load')!;
  assert.equal(beforeFuse.designCurrentA, 50, 'branch is capped at the 50A source when the load demands more');
  assert.equal(afterFuse.designCurrentA, 50, 'branch is capped at the 50A source on both sides of the fuse');
});

test('DC positive branch without a negative return is a hard system error', () => {
  const codes = warningCodes(batteryFuseLoad(80));
  assert.ok(codes.includes('DC_NEG_RETURN_MISSING'));
});

test('DC negative return cable must support the protected branch current', () => {
  const codes = warningCodes(batteryFuseLoadWithUndersizedReturn(80));
  assert.ok(codes.includes('DC_NEG_RETURN_UNDERSIZED'));
});

test('shunt current rating is enforced', () => {
  const codes = warningCodes(shuntOverRating());
  assert.ok(codes.includes('SHUNT_RATING_EXCEEDED'));
});

// ---- connectors, lugs & cable BOM -------------------------------------------

function batteryBusLoadWithGauges(): SystemDesign {
  return {
    id: 'cable-bom',
    name: 'cable-bom',
    nominalVoltage: 12,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    createdAt: '',
    updatedAt: '',
    components: [
      { id: 'bat', productId: 'bat-vic-smart-12-200', label: 'Battery', quantity: 1, x: 0, y: 0 },
      {
        id: 'bus',
        productId: 'dist-generic-busbar-5pt',
        label: 'Positive Bus',
        quantity: 1,
        x: 120,
        y: 0,
        busPolarity: 'positive',
        inferredConnectionKind: 'dc_power',
        inferredPolarity: 'positive',
        inferredElectricalType: 'dc_pos',
        inferredVoltageClass: 'dc_low_voltage',
      },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'Load', quantity: 1, x: 240, y: 0, instanceMaxCurrentA: 30 },
    ],
    connections: [
      { id: 'bat-bus', fromComponentId: 'bat', fromTerminalId: 'dc_pos', toComponentId: 'bus', toTerminalId: 'terminal_1', cableLengthFt: 2, manualCableAwg: '2/0' },
      { id: 'bus-load', fromComponentId: 'bus', fromTerminalId: 'terminal_2', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 4, manualCableAwg: '8' },
    ],
  } as SystemDesign;
}

test('selectLug returns a generic lug for a known gauge + hole size', () => {
  const lug = selectLug('2/0', '3/8');
  assert.ok(lug, 'expected a lug');
  assert.equal(lug!.awg, '2/0');
  assert.equal(lug!.holeSize, '3/8');
  assert.equal(lug!.id, lugKey('2/0', '3/8'));
  assert.ok(lug!.estMsrpUsd > 0);
});

test('selectLug returns undefined when gauge or hole size is missing/unknown', () => {
  assert.equal(selectLug(undefined, '3/8'), undefined);
  assert.equal(selectLug('2/0', undefined), undefined);
  assert.equal(selectLug('999', '3/8'), undefined);
});

test('getEffectiveConnector: battery stud -> lug, load -> screw, solar -> MC4', () => {
  const bat = PRODUCT_MAP.get('bat-vic-smart-12-200')!;
  const load = PRODUCT_MAP.get('acc-dc-load-generic')!;
  const solar = PRODUCT_MAP.get('solar-array-400w')!;
  assert.equal(getEffectiveConnector(bat, 'dc_pos')?.kind, 'lug');
  assert.equal(getEffectiveConnector(load, 'dc_pos')?.kind, 'screw_terminal');
  assert.equal(getEffectiveConnector(solar, 'pv_pos')?.kind, 'mc4_male');
  assert.equal(getEffectiveConnector(solar, 'pv_neg')?.kind, 'mc4_female');
});

test('buildCableBomRows resolves a lug at the stud end and a screw terminal at the load end', () => {
  const rows = buildCableBomRows(batteryBusLoadWithGauges(), PRODUCT_MAP);
  assert.equal(rows.length, 2);

  const batBus = rows.find((r) => r.connectionId === 'bat-bus')!;
  assert.equal(batBus.gauge, '2/0');
  assert.equal(batBus.fromEnd.connector?.kind, 'lug');
  assert.ok(batBus.fromEnd.lug, 'battery stud end should have a lug');
  assert.equal(batBus.fromEnd.lug!.awg, '2/0');

  const busLoad = rows.find((r) => r.connectionId === 'bus-load')!;
  assert.equal(busLoad.toEnd.connector?.kind, 'screw_terminal');
  assert.equal(busLoad.toEnd.lug, undefined, 'screw terminal end should not produce a lug');
});

test('buildConnectorSummary aggregates lugs (priced) and screw terminals (unpriced)', () => {
  const rows = buildCableBomRows(batteryBusLoadWithGauges(), PRODUCT_MAP);
  const summary = buildConnectorSummary(rows);

  const lug20 = summary.find((s) => s.gauge === '2/0');
  assert.ok(lug20, 'expected an aggregated 2/0 lug line');
  assert.ok(lug20!.estUnitMsrpUsd != null && lug20!.estUnitMsrpUsd > 0);
  assert.equal(lug20!.estExtendedMsrpUsd, lug20!.estUnitMsrpUsd! * lug20!.count);

  const screw = summary.find((s) => s.label === 'Screw terminal');
  assert.ok(screw, 'expected a screw terminal line');
  assert.equal(screw!.estUnitMsrpUsd, null);
});

// ---- summary ----------------------------------------------------------------

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\nFailures:\n  - ' + failures.join('\n  - '));
  process.exit(1);
}
