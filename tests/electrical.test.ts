// ============================================================
// electrical.test.ts — System Design Validation Engine tests
// ============================================================
// Deploy-safe: lives outside `src` so the production `tsc` (include: ["src"])
// never compiles it, and it uses node:assert + esbuild bundling so it needs no
// extra npm dependencies. Run with `npm test`.
//
// Tests exercise the active 48 V validation catalogue through the single
// authoritative engine entry point `analyzeSystemDesign`, plus the deterministic
// sizing helpers it composes. Legacy 12 V/24 V product tests were retired with the
// catalogue isolation refactor (those products now live under data/products/legacy).
// ============================================================

import assert from 'node:assert/strict';

import { PRODUCT_MAP, ALL_PRODUCTS } from '../src/data/products';
import { validateCatalog } from '../src/data/products/helpers/validation';
import { analyzeSystemDesign, resolveTerminalGroups } from '../src/utils/analysis';
import { buildBuilderIssues, buildProductIssues } from '../src/utils/builderIssues';
import { getEffectiveTerminal } from '../src/utils/effectiveTerminals';
import { selectBestFuseProduct, getFuseRating } from '../src/utils/fuseSelection';
import { continuousFactorForBus, DEFAULT_ASSUMPTIONS } from '../src/data/electricalRules';
import { voltageDropV, cableByAwg } from '../src/data/cableAmpacity';
import { nextStandardFuse } from '../src/data/fuseRatings';
import { DEFAULT_SYSTEM } from '../src/data/defaultSystem';
import { SYSTEM_PRESETS } from '../src/data/presetSystems';
import type { Product, SystemDesign } from '../src/types/system';

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

const base = {
  assumptions: { ...DEFAULT_ASSUMPTIONS },
  createdAt: '',
  updatedAt: '',
} as const;

// ============================================================
// Pure helpers (catalogue-independent)
// ============================================================

test('selectBestFuseProduct never exceeds cable ampacity (ANL on 73A/8AWG)', () => {
  const anl = fusesByFamily('ANL');
  assert.ok(anl.length > 0, 'ANL fuses must remain in the active catalogue');
  const best = selectBestFuseProduct(anl, { targetA: 70, maxAmpacityA: 73 });
  assert.ok(best, 'expected a fuse to be selected');
  assert.ok(getFuseRating(best!) <= 73, `selected ${getFuseRating(best!)}A fuse exceeds 73A ampacity`);
});

test('selectBestFuseProduct hits the target exactly when a part fits (MIDI 60A)', () => {
  const midi = fusesByFamily('MIDI');
  const best = selectBestFuseProduct(midi, { targetA: 60, maxAmpacityA: 73 });
  assert.equal(getFuseRating(best!), 60);
});

test('continuousFactorForBus applies 156% to PV, 125% elsewhere', () => {
  assert.equal(continuousFactorForBus('pv_pos'), 1.5625);
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
});

// ============================================================
// Terminal-group model (the new product data model)
// ============================================================

test('active product catalog passes strict data validation', () => {
  const result = validateCatalog(ALL_PRODUCTS);
  const errors = result.issues
    .filter((issue) => issue.severity === 'error')
    .map((issue) => `[${issue.code}] ${issue.productId}${issue.field ? ` ${issue.field}` : ''}: ${issue.message}`);
  assert.equal(result.errorCount, 0, errors.join('\n'));
  assert.equal(result.warningCount, 0, 'active catalog should not emit validation warnings');
});

test('Helios resolves explicit DC commons (400A internal bus) with 250A posts', () => {
  const helios = PRODUCT_MAP.get('discover-helios-ess-52-48-16000');
  assert.ok(helios, 'Helios must be an active product');
  const { groups, terminalGroupKeyByTerminalId } = resolveTerminalGroups(helios!, {
    id: 'b',
    productId: helios!.id,
    quantity: 1,
    x: 0,
    y: 0,
  });
  const posKey = terminalGroupKeyByTerminalId.get('dc_pos_1');
  const negKey = terminalGroupKeyByTerminalId.get('dc_neg_1');
  assert.equal(posKey, 'b:main_pos');
  const pos = groups.get(posKey!)!;
  assert.equal(pos.internallyCommon, true);
  assert.equal(pos.maxCurrentA, 400);
  assert.equal(pos.terminalIds.length, 4, 'all four DC+ posts share one internal common node');
  assert.ok(negKey && groups.get(negKey)!.maxCurrentA === 400);
  // Each physical post keeps its own 250A rating.
  const post = helios!.terminals.find((t) => t.id === 'dc_pos_1')!;
  assert.equal(post.maxCurrentA, 250);
});

test('busbar resolves one internally-common bus group rated to busbar current', () => {
  const bus = PRODUCT_MAP.get('dist-generic-busbar-5pt')!;
  const { groups } = resolveTerminalGroups(bus, {
    id: 'bus',
    productId: bus.id,
    quantity: 1,
    x: 0,
    y: 0,
    busPolarity: 'positive',
  });
  const busGroup = groups.get('bus:bus')!;
  assert.ok(busGroup, 'explicit bus group expected');
  assert.equal(busGroup.internallyCommon, true);
  assert.equal(busGroup.maxCurrentA, 600);
});

test('effective terminal current rating falls back terminal -> group -> port', () => {
  const helios = PRODUCT_MAP.get('discover-helios-ess-52-48-16000')!;
  const heliosWithUnsetPost = {
    ...helios,
    terminals: helios.terminals.map((terminal) =>
      terminal.id === 'dc_pos_1' ? { ...terminal, maxCurrentA: 0 } : terminal
    ),
  };
  assert.equal(getEffectiveTerminal(heliosWithUnsetPost, 'dc_pos_1')!.maxCurrentA, 400);

  const bus = PRODUCT_MAP.get('dist-generic-busbar-5pt')!;
  const busWithUnsetGroup = {
    ...bus,
    terminalGroups: bus.terminalGroups?.map((group) =>
      group.id === 'bus' ? { ...group, maxCurrentA: 0 } : group
    ),
  };
  const effectiveBusTerminal = getEffectiveTerminal(busWithUnsetGroup, 'terminal_1', {
    id: 'bus',
    productId: bus.id,
    quantity: 1,
    x: 0,
    y: 0,
    busPolarity: 'positive',
  })!;
  assert.equal(effectiveBusTerminal.maxCurrentA, 600);

  const fuse = PRODUCT_MAP.get('fuse-anl-250a')!;
  assert.equal(getEffectiveTerminal(fuse, 'in')!.maxCurrentA, 250);
});

test('effective terminal role and direction are inherited from the port', () => {
  const product: Product = {
    id: 'port-role-device',
    manufacturer: 'Test',
    name: 'Port Role Device',
    productType: 'accessory',
    width: 100,
    height: 80,
    terminals: [
      {
        id: 'pos',
        label: '+',
        kind: 'dc_power',
        polarity: 'positive',
        role: 'sink',
        direction: 'input',
        side: 'right',
        offsetX: 40,
        offsetY: -10,
        portId: 'output',
        terminalGroupId: 'output_pos',
      },
    ],
    ports: [
      {
        id: 'output',
        kind: 'dc',
        topology: 'two_pole',
        role: 'source',
      },
    ],
    terminalGroups: [
      {
        id: 'output_pos',
        portId: 'output',
        groupType: 'power_conductor',
        kind: 'dc_power',
        polarity: 'positive',
        internallyCommon: true,
      },
    ],
  };

  const terminal = getEffectiveTerminal(product, 'pos')!;
  assert.equal(terminal.role, 'source');
  assert.equal(terminal.direction, 'output');
});

test('buildProductIssues exposes terminal-group validation errors for malformed products', () => {
  const baseProduct = PRODUCT_MAP.get('discover-helios-ess-52-48-16000')!;
  const malformedProduct: Product = {
    ...baseProduct,
    terminals: baseProduct.terminals.map((terminal) =>
      terminal.id === 'dc_pos_1' ? { ...terminal, terminalGroupId: undefined } : terminal
    ),
  };

  const issues = buildProductIssues(malformedProduct);
  assert.ok(issues.some((issue) => issue.code === 'TERMINAL_NO_GROUP'));
});

test('buildBuilderIssues accepts generic source/load products with usable default ratings', () => {
  const system: SystemDesign = {
    ...base,
    id: 'builder-issues',
    name: 'builder issues',
    nominalVoltage: 48,
    components: [
      { id: 'src', productId: 'generic-alternator-source', label: 'Alternator', quantity: 1, x: -120, y: 0 },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'Cab Load', quantity: 1, x: 120, y: 0 },
    ],
    connections: [],
  };

  const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
  const issues = buildBuilderIssues(system, PRODUCT_MAP, analysis);

  assert.ok(!issues.some((issue) => issue.componentId === 'src' && issue.code === 'INSTANCE_VOLTAGE_MISSING'));
  assert.ok(!issues.some((issue) => issue.componentId === 'src' && issue.code === 'INSTANCE_CURRENT_MISSING'));
  assert.ok(!issues.some((issue) => issue.componentId === 'load' && issue.code === 'INSTANCE_VOLTAGE_MISSING'));
  assert.ok(!issues.some((issue) => issue.componentId === 'load' && issue.code === 'INSTANCE_CURRENT_MISSING'));
  assert.ok(!issues.some((issue) => issue.code === 'PLACEHOLDER_PRODUCT'));
});

test('buildBuilderIssues flags missing current when generic products have no usable current ratings', () => {
  const source = PRODUCT_MAP.get('generic-alternator-source')!;
  const load = PRODUCT_MAP.get('acc-dc-load-generic')!;
  const productMap = new Map(PRODUCT_MAP);
  productMap.set('generic-alternator-source', {
    ...source,
    nominalVoltage: undefined,
    maxCurrentA: undefined,
    continuousPowerW: undefined,
    ports: source.ports?.map((port) => ({ ...port, nominalVoltageV: undefined, maxCurrentA: undefined, maxPowerW: undefined })),
  });
  productMap.set('acc-dc-load-generic', {
    ...load,
    continuousPowerW: undefined,
    loadRatings: undefined,
    ports: load.ports?.map((port) => ({ ...port, nominalVoltageV: undefined, maxCurrentA: undefined, maxPowerW: undefined })),
    terminals: load.terminals.map((terminal) => ({ ...terminal, voltageClass: undefined })),
  });
  const system: SystemDesign = {
    ...base,
    id: 'builder-missing-ratings',
    name: 'builder missing ratings',
    nominalVoltage: 48,
    components: [
      { id: 'src', productId: 'generic-alternator-source', label: 'Alternator', quantity: 1, x: -120, y: 0 },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'Cab Load', quantity: 1, x: 120, y: 0 },
    ],
    connections: [],
  };

  const analysis = analyzeSystemDesign(system, productMap);
  const issues = buildBuilderIssues(system, productMap, analysis);

  assert.ok(issues.some((issue) => issue.componentId === 'src' && issue.code === 'INSTANCE_CURRENT_MISSING'));
  assert.ok(issues.some((issue) => issue.componentId === 'load' && issue.code === 'INSTANCE_CURRENT_MISSING'));
  assert.ok(!issues.some((issue) => issue.componentId === 'src' && issue.code === 'INSTANCE_VOLTAGE_MISSING'));
  assert.ok(!issues.some((issue) => issue.componentId === 'load' && issue.code === 'INSTANCE_VOLTAGE_MISSING'));
});

// ============================================================
// Engine scenarios (active 48 V catalogue)
// ============================================================

// Scenario 1: single Helios -> Class T fuse -> +busbar; Helios -> -busbar -> load.
function singleHeliosToBus(loadA: number): SystemDesign {
  return {
    ...base,
    id: 's1',
    name: 'single helios',
    nominalVoltage: 48,
    components: [
      { id: 'bat', productId: 'discover-helios-ess-52-48-16000', label: 'Helios', quantity: 1, x: -200, y: 0 },
      { id: 'fuse', productId: 'fuse-class-t-300a', label: 'Pack Fuse', quantity: 1, x: -60, y: -40 },
      { id: 'posbus', productId: 'dist-generic-busbar-5pt', label: 'DC+', quantity: 1, x: 80, y: -40, busPolarity: 'positive' },
      { id: 'negbus', productId: 'dist-generic-busbar-5pt', label: 'DC-', quantity: 1, x: 80, y: 60, busPolarity: 'negative' },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'DC Load', quantity: 1, x: 260, y: 0, instanceMaxCurrentA: loadA, instanceVoltageV: 48 },
    ],
    connections: [
      { id: 'bat-fuse', fromComponentId: 'bat', fromTerminalId: 'dc_pos_1', toComponentId: 'fuse', toTerminalId: 'in', cableLengthFt: 2 },
      { id: 'fuse-bus', fromComponentId: 'fuse', fromTerminalId: 'out', toComponentId: 'posbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bat-neg', fromComponentId: 'bat', fromTerminalId: 'dc_neg_1', toComponentId: 'negbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bus-load-p', fromComponentId: 'posbus', fromTerminalId: 'terminal_2', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 3 },
      { id: 'bus-load-n', fromComponentId: 'negbus', fromTerminalId: 'terminal_2', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 3 },
    ],
  };
}

test('Scenario 1: single Helios system analyses cleanly and sizes the branch', () => {
  const analysis = analyzeSystemDesign(singleHeliosToBus(100), PRODUCT_MAP);
  // every connection has a sized analysis
  for (const conn of ['bat-fuse', 'fuse-bus', 'bat-neg', 'bus-load-p', 'bus-load-n']) {
    assert.ok(analysis.connections[conn], `missing analysis for ${conn}`);
  }
  const batPos = analysis.terminals['bat:dc_pos_1'];
  assert.equal(batPos.maxCurrentA, 250);
  assert.ok(!batPos.overCurrent, '100A draw must not exceed the 250A post');
  const group = analysis.terminalGroups['bat:main_pos'];
  assert.equal(group.maxCurrentA, 400);
  assert.ok(!group.overRated);
});

test('Scenario 3: a single Helios post carrying combined bank current overloads the terminal', () => {
  // 600A through one post exceeds the 250A post rating AND the 400A internal bus.
  const analysis = analyzeSystemDesign(singleHeliosToBus(600), PRODUCT_MAP);
  const batPos = analysis.terminals['bat:dc_pos_1'];
  assert.ok(batPos.designCurrentA > 250, `expected >250A, got ${batPos.designCurrentA}`);
  assert.ok(batPos.overCurrent, 'single 250A post must flag overcurrent at 600A');
  const overTerminal = analysis.issues.some((i) => i.code === 'terminal_overcurrent' && i.terminalKey === 'bat:dc_pos_1');
  assert.ok(overTerminal, 'expected a terminal_overcurrent design issue');
  const overGroup = analysis.issues.some((i) => i.code === 'terminal_group_overrated' && i.componentId === 'bat');
  assert.ok(overGroup, 'expected a terminal_group_overrated design issue (>400A internal bus)');
});

// Scenario 2: Two Helios batteries in parallel, each with its own fuse to the positive busbar.
function twoHeliosParallel(loadA: number): SystemDesign {
  return {
    ...base,
    id: 's2',
    name: 'two helios parallel',
    nominalVoltage: 48,
    components: [
      { id: 'bat-a', productId: 'discover-helios-ess-52-48-16000', label: 'Helios A', quantity: 1, x: -200, y: -60 },
      { id: 'bat-b', productId: 'discover-helios-ess-52-48-16000', label: 'Helios B', quantity: 1, x: -200, y: 60 },
      { id: 'fuse-a', productId: 'fuse-anl-250a', label: 'Fuse A', quantity: 1, x: -60, y: -60 },
      { id: 'fuse-b', productId: 'fuse-anl-250a', label: 'Fuse B', quantity: 1, x: -60, y: 60 },
      { id: 'posbus', productId: 'dist-generic-busbar-5pt', label: 'DC+', quantity: 1, x: 80, y: -20, busPolarity: 'positive' as const },
      { id: 'negbus', productId: 'dist-generic-busbar-5pt', label: 'DC-', quantity: 1, x: 80, y: 60, busPolarity: 'negative' as const },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'DC Load', quantity: 1, x: 260, y: 0, instanceMaxCurrentA: loadA, instanceVoltageV: 48 },
    ],
    connections: [
      { id: 'a-fuse', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos_1', toComponentId: 'fuse-a', toTerminalId: 'in', cableLengthFt: 2 },
      { id: 'a-bus', fromComponentId: 'fuse-a', fromTerminalId: 'out', toComponentId: 'posbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'b-fuse', fromComponentId: 'bat-b', fromTerminalId: 'dc_pos_1', toComponentId: 'fuse-b', toTerminalId: 'in', cableLengthFt: 2 },
      { id: 'b-bus', fromComponentId: 'fuse-b', fromTerminalId: 'out', toComponentId: 'posbus', toTerminalId: 'terminal_2', cableLengthFt: 2 },
      { id: 'a-neg', fromComponentId: 'bat-a', fromTerminalId: 'dc_neg_1', toComponentId: 'negbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'b-neg', fromComponentId: 'bat-b', fromTerminalId: 'dc_neg_1', toComponentId: 'negbus', toTerminalId: 'terminal_2', cableLengthFt: 2 },
      { id: 'load-p', fromComponentId: 'posbus', fromTerminalId: 'terminal_3', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 3 },
      { id: 'load-n', fromComponentId: 'negbus', fromTerminalId: 'terminal_3', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 3 },
    ],
  };
}

test('Scenario 2: two Helios in parallel — both branches analysed, each battery checked independently', () => {
  const analysis = analyzeSystemDesign(twoHeliosParallel(180), PRODUCT_MAP);
  // Both battery components have their own analysis entry
  assert.ok(analysis.components['bat-a'], 'bat-a must have component analysis');
  assert.ok(analysis.components['bat-b'], 'bat-b must have component analysis');
  // Each battery's DC+ internal bus group is checked at its own 400A limit
  assert.equal(analysis.terminalGroups['bat-a:main_pos']?.maxCurrentA, 400);
  assert.equal(analysis.terminalGroups['bat-b:main_pos']?.maxCurrentA, 400);
  // At 180A load (within a single battery's 200A capacity), neither battery's bus is overRated
  assert.ok(!analysis.terminalGroups['bat-a:main_pos']?.overRated, 'bat-a internal bus must not be overRated at 180A');
  assert.ok(!analysis.terminalGroups['bat-b:main_pos']?.overRated, 'bat-b internal bus must not be overRated at 180A');
  // All connections are accounted for
  for (const conn of ['a-fuse', 'a-bus', 'b-fuse', 'b-bus', 'a-neg', 'b-neg', 'load-p', 'load-n']) {
    assert.ok(analysis.connections[conn], `missing analysis for ${conn}`);
  }
});

// Scenario 4: MPPT — PV input and DC output are distinct domains; battery-side fuse present.
function threeHeliosDaisyChainWithLoad(loadA: number): SystemDesign {
  return {
    ...base,
    id: 's2b',
    name: 'three helios daisy chain',
    nominalVoltage: 48,
    components: [
      { id: 'bat-1', productId: 'discover-helios-ess-52-48-16000', label: 'Helios 1', quantity: 1, x: 80, y: 340 },
      { id: 'bat-2', productId: 'discover-helios-ess-52-48-16000', label: 'Helios 2', quantity: 1, x: -120, y: 340 },
      { id: 'bat-3', productId: 'discover-helios-ess-52-48-16000', label: 'Helios 3', quantity: 1, x: -320, y: 340 },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'DC Load', quantity: 1, x: 260, y: 20, instanceVoltageV: 48, instanceMaxCurrentA: loadA },
      { id: 'fuse', productId: 'fuse-midi-200a', label: 'Fuse', quantity: 1, x: 170, y: 95 },
    ],
    connections: [
      { id: 'bat3-bat2-pos', fromComponentId: 'bat-3', fromTerminalId: 'dc_pos_1', toComponentId: 'bat-2', toTerminalId: 'dc_pos_2', cableLengthFt: 2 },
      { id: 'bat2-bat1-pos', fromComponentId: 'bat-2', fromTerminalId: 'dc_pos_1', toComponentId: 'bat-1', toTerminalId: 'dc_pos_2', cableLengthFt: 2 },
      { id: 'bat1-bat2-neg', fromComponentId: 'bat-1', fromTerminalId: 'dc_neg_1', toComponentId: 'bat-2', toTerminalId: 'dc_neg_2', cableLengthFt: 2 },
      { id: 'bat2-bat3-neg', fromComponentId: 'bat-2', fromTerminalId: 'dc_neg_1', toComponentId: 'bat-3', toTerminalId: 'dc_neg_2', cableLengthFt: 2 },
      { id: 'load-neg', fromComponentId: 'bat-3', fromTerminalId: 'dc_neg_1', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 6 },
      { id: 'load-fuse-pos', fromComponentId: 'load', fromTerminalId: 'dc_pos', toComponentId: 'fuse', toTerminalId: 'out', cableLengthFt: 3 },
      { id: 'fuse-bat-pos', fromComponentId: 'fuse', fromTerminalId: 'in', toComponentId: 'bat-1', toTerminalId: 'dc_pos_1', cableLengthFt: 3 },
    ],
  };
}

test('Scenario 2b: direct battery interconnect positive and negative conductors size as a paired run', () => {
  const analysis = analyzeSystemDesign(threeHeliosDaisyChainWithLoad(150), PRODUCT_MAP);
  const firstPositive = analysis.connections['bat2-bat1-pos'];
  const firstNegative = analysis.connections['bat1-bat2-neg'];
  const secondPositive = analysis.connections['bat3-bat2-pos'];
  const secondNegative = analysis.connections['bat2-bat3-neg'];

  assert.equal(firstPositive?.recommendedCableAwg, '1/0');
  assert.equal(secondPositive?.recommendedCableAwg, '1/0');
  assert.equal(firstNegative?.recommendedCableAwg, '1/0');
  assert.equal(secondNegative?.recommendedCableAwg, '1/0');
  assert.equal(firstNegative?.cableSizingCurrentA, firstPositive?.cableSizingCurrentA);
  assert.equal(secondNegative?.cableSizingCurrentA, secondPositive?.cableSizingCurrentA);
});

function mpptScenario(): SystemDesign {
  return {
    ...base,
    id: 's4',
    name: 'mppt',
    nominalVoltage: 48,
    components: [
      { id: 'solar', productId: 'solar-array-2000w', label: 'Solar', quantity: 1, x: -200, y: 0 },
      { id: 'mppt', productId: 'mppt-vic-150-60', label: 'MPPT', quantity: 1, x: 0, y: 0 },
      { id: 'fuse', productId: 'fuse-midi-70a', label: 'MPPT Fuse', quantity: 1, x: 160, y: -30 },
      { id: 'posbus', productId: 'dist-generic-busbar-5pt', label: 'DC+', quantity: 1, x: 280, y: -30, busPolarity: 'positive' as const },
      { id: 'negbus', productId: 'dist-generic-busbar-5pt', label: 'DC-', quantity: 1, x: 280, y: 30, busPolarity: 'negative' as const },
    ],
    connections: [
      { id: 'pv-pos', fromComponentId: 'solar', fromTerminalId: 'pv_pos', toComponentId: 'mppt', toTerminalId: 'pv_pos', cableLengthFt: 10 },
      { id: 'pv-neg', fromComponentId: 'solar', fromTerminalId: 'pv_neg', toComponentId: 'mppt', toTerminalId: 'pv_neg', cableLengthFt: 10 },
      { id: 'mppt-fuse', fromComponentId: 'mppt', fromTerminalId: 'bat_pos', toComponentId: 'fuse', toTerminalId: 'in', cableLengthFt: 2 },
      { id: 'fuse-bus', fromComponentId: 'fuse', fromTerminalId: 'out', toComponentId: 'posbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'mppt-neg', fromComponentId: 'mppt', fromTerminalId: 'bat_neg', toComponentId: 'negbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
    ],
  };
}

test('Scenario 4: MPPT PV input and DC output on separate domains, output branch sized to MPPT rating', () => {
  const analysis = analyzeSystemDesign(mpptScenario(), PRODUCT_MAP);
  // PV positive and DC output positive must be on separate nets
  const pvPosNet = analysis.graph.terminalNetIds.get('mppt:pv_pos');
  const dcOutNet = analysis.graph.terminalNetIds.get('mppt:bat_pos');
  assert.ok(pvPosNet, 'MPPT pv_pos must be on a net');
  assert.ok(dcOutNet, 'MPPT bat_pos must be on a net');
  assert.notEqual(pvPosNet, dcOutNet, 'PV input and DC output must be separate domains');
  // MPPT DC output branch carries a non-zero design current within the 60A rating
  const mpptFuse = analysis.connections['mppt-fuse'];
  assert.ok(mpptFuse, 'mppt-fuse connection must be analysed');
  assert.ok(mpptFuse.designCurrentA > 0, `MPPT DC output design current must be > 0, got ${mpptFuse.designCurrentA}`);
  assert.ok(mpptFuse.designCurrentA <= 60, `MPPT design current ${mpptFuse.designCurrentA}A exceeds 60A rating`);
  // All connections present
  for (const conn of ['pv-pos', 'pv-neg', 'mppt-fuse', 'fuse-bus', 'mppt-neg']) {
    assert.ok(analysis.connections[conn], `missing analysis for ${conn}`);
  }
});

// Scenario 5: Inverter/charger — DC bus, AC input, and AC output are three separate domains.
function inverterChargerScenario(): SystemDesign {
  return {
    ...base,
    id: 's5',
    name: 'inverter-charger',
    nominalVoltage: 48,
    components: [
      { id: 'bat', productId: 'discover-helios-ess-52-48-16000', label: 'Helios', quantity: 1, x: -200, y: 0 },
      { id: 'posbus', productId: 'dist-generic-busbar-5pt', label: 'DC+', quantity: 1, x: -40, y: -30, busPolarity: 'positive' as const },
      { id: 'negbus', productId: 'dist-generic-busbar-5pt', label: 'DC-', quantity: 1, x: -40, y: 30, busPolarity: 'negative' as const },
      { id: 'fuse', productId: 'fuse-anl-150a', label: 'Inverter Fuse', quantity: 1, x: 120, y: -30 },
      { id: 'inv', productId: 'inv-vic-mp2-48-5000', label: 'MultiPlus-II', quantity: 1, x: 280, y: 0 },
      { id: 'grid', productId: 'generic-grid-source', label: 'Shore Power', quantity: 1, x: 280, y: 200 },
      { id: 'acload', productId: 'acc-ac-load-generic', label: 'AC Load', quantity: 1, x: 480, y: 0 },
    ],
    connections: [
      { id: 'bat-p', fromComponentId: 'bat', fromTerminalId: 'dc_pos_1', toComponentId: 'posbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bat-n', fromComponentId: 'bat', fromTerminalId: 'dc_neg_1', toComponentId: 'negbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bus-fuse', fromComponentId: 'posbus', fromTerminalId: 'terminal_2', toComponentId: 'fuse', toTerminalId: 'in', cableLengthFt: 2 },
      { id: 'fuse-inv', fromComponentId: 'fuse', fromTerminalId: 'out', toComponentId: 'inv', toTerminalId: 'dc_pos', cableLengthFt: 2 },
      { id: 'inv-neg', fromComponentId: 'negbus', fromTerminalId: 'terminal_2', toComponentId: 'inv', toTerminalId: 'dc_neg', cableLengthFt: 2 },
      { id: 'grid-l', fromComponentId: 'grid', fromTerminalId: 'ac_l', toComponentId: 'inv', toTerminalId: 'ac_in_l', cableLengthFt: 10 },
      { id: 'grid-n', fromComponentId: 'grid', fromTerminalId: 'ac_n', toComponentId: 'inv', toTerminalId: 'ac_in_n', cableLengthFt: 10 },
      { id: 'ac-l', fromComponentId: 'inv', fromTerminalId: 'ac_out_l', toComponentId: 'acload', toTerminalId: 'ac_l', cableLengthFt: 5 },
      { id: 'ac-n', fromComponentId: 'inv', fromTerminalId: 'ac_out_n', toComponentId: 'acload', toTerminalId: 'ac_n', cableLengthFt: 5 },
    ],
  };
}

test('Scenario 5: inverter/charger DC, AC input, and AC output are three separate domains', () => {
  const analysis = analyzeSystemDesign(inverterChargerScenario(), PRODUCT_MAP);
  const dcNet = analysis.graph.terminalNetIds.get('inv:dc_pos');
  const acInNet = analysis.graph.terminalNetIds.get('inv:ac_in_l');
  const acOutNet = analysis.graph.terminalNetIds.get('inv:ac_out_l');
  assert.ok(dcNet, 'inverter DC terminal must be on a net');
  assert.ok(acInNet, 'inverter AC input must be on a net');
  assert.ok(acOutNet, 'inverter AC output must be on a net');
  assert.notEqual(acInNet, acOutNet, 'AC input and AC output must be separate nets');
  assert.notEqual(dcNet, acInNet, 'DC bus and AC input must be separate domains');
  assert.notEqual(dcNet, acOutNet, 'DC bus and AC output must be separate domains');
  for (const conn of ['bat-p', 'bat-n', 'bus-fuse', 'fuse-inv', 'inv-neg', 'grid-l', 'grid-n', 'ac-l', 'ac-n']) {
    assert.ok(analysis.connections[conn], `missing analysis for ${conn}`);
  }
});

// Scenario 7: Generic DC and AC loads both receive design current and cable sizing.
function genericLoadsScenario(): SystemDesign {
  return {
    ...base,
    id: 's7',
    name: 'generic loads',
    nominalVoltage: 48,
    components: [
      { id: 'bat', productId: 'discover-helios-ess-52-48-16000', label: 'Helios', quantity: 1, x: -200, y: 0 },
      { id: 'posbus', productId: 'dist-generic-busbar-5pt', label: 'DC+', quantity: 1, x: -40, y: -30, busPolarity: 'positive' as const },
      { id: 'negbus', productId: 'dist-generic-busbar-5pt', label: 'DC-', quantity: 1, x: -40, y: 30, busPolarity: 'negative' as const },
      { id: 'dcload', productId: 'acc-dc-load-generic', label: 'DC Load', quantity: 1, x: 140, y: -60, instanceMaxCurrentA: 20, instanceVoltageV: 48 },
      { id: 'inv', productId: 'inv-vic-mp2-48-5000', label: 'MultiPlus-II', quantity: 1, x: 140, y: 100 },
      { id: 'acload', productId: 'acc-ac-load-generic', label: 'AC Load', quantity: 1, x: 360, y: 100 },
    ],
    connections: [
      { id: 'bat-p', fromComponentId: 'bat', fromTerminalId: 'dc_pos_1', toComponentId: 'posbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bat-n', fromComponentId: 'bat', fromTerminalId: 'dc_neg_1', toComponentId: 'negbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'dc-l-p', fromComponentId: 'posbus', fromTerminalId: 'terminal_2', toComponentId: 'dcload', toTerminalId: 'dc_pos', cableLengthFt: 4 },
      { id: 'dc-l-n', fromComponentId: 'negbus', fromTerminalId: 'terminal_2', toComponentId: 'dcload', toTerminalId: 'dc_neg', cableLengthFt: 4 },
      { id: 'inv-p', fromComponentId: 'posbus', fromTerminalId: 'terminal_3', toComponentId: 'inv', toTerminalId: 'dc_pos', cableLengthFt: 4 },
      { id: 'inv-n', fromComponentId: 'negbus', fromTerminalId: 'terminal_3', toComponentId: 'inv', toTerminalId: 'dc_neg', cableLengthFt: 4 },
      { id: 'ac-l', fromComponentId: 'inv', fromTerminalId: 'ac_out_l', toComponentId: 'acload', toTerminalId: 'ac_l', cableLengthFt: 6 },
      { id: 'ac-n', fromComponentId: 'inv', fromTerminalId: 'ac_out_n', toComponentId: 'acload', toTerminalId: 'ac_n', cableLengthFt: 6 },
    ],
  };
}

test('Scenario 7: DC and AC loads both receive non-negative design current and separate domain routing', () => {
  const analysis = analyzeSystemDesign(genericLoadsScenario(), PRODUCT_MAP);
  for (const conn of ['bat-p', 'bat-n', 'dc-l-p', 'dc-l-n', 'inv-p', 'inv-n', 'ac-l', 'ac-n']) {
    assert.ok(analysis.connections[conn], `missing analysis for ${conn}`);
  }
  const dcLoadConn = analysis.connections['dc-l-p'];
  assert.ok(dcLoadConn.designCurrentA >= 0, `DC load design current must be ≥ 0, got ${dcLoadConn.designCurrentA}`);
  const acLoadConn = analysis.connections['ac-l'];
  assert.ok(acLoadConn.designCurrentA >= 0, `AC load design current must be ≥ 0, got ${acLoadConn.designCurrentA}`);
  // DC bus and inverter AC output must be distinct domains
  const dcNet = analysis.graph.terminalNetIds.get('inv:dc_pos');
  const acOutNet = analysis.graph.terminalNetIds.get('inv:ac_out_l');
  assert.ok(dcNet && acOutNet && dcNet !== acOutNet, 'DC bus and AC output must be separate domains');
});

// Scenario 6: DC-DC converter keeps input (48V) and output (12V) on separate domains.
function dcDcCrossVoltage(): SystemDesign {
  return {
    ...base,
    id: 's6',
    name: 'dcdc',
    nominalVoltage: 48,
    components: [
      { id: 'bat', productId: 'discover-helios-ess-52-48-16000', label: 'Helios', quantity: 1, x: -200, y: 0 },
      { id: 'posbus', productId: 'dist-generic-busbar-5pt', label: 'DC+', quantity: 1, x: -40, y: -40, busPolarity: 'positive' },
      { id: 'negbus', productId: 'dist-generic-busbar-5pt', label: 'DC-', quantity: 1, x: -40, y: 60, busPolarity: 'negative' },
      { id: 'dcdc', productId: 'orion-tr-48-12-20', label: 'DC-DC', quantity: 1, x: 140, y: 0 },
      { id: 'load', productId: 'acc-dc-load-generic', label: '12V Load', quantity: 1, x: 320, y: 0, instanceMaxCurrentA: 15, instanceVoltageV: 12 },
    ],
    connections: [
      { id: 'bat-p', fromComponentId: 'bat', fromTerminalId: 'dc_pos_1', toComponentId: 'posbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'bat-n', fromComponentId: 'bat', fromTerminalId: 'dc_neg_1', toComponentId: 'negbus', toTerminalId: 'terminal_1', cableLengthFt: 2 },
      { id: 'in-p', fromComponentId: 'posbus', fromTerminalId: 'terminal_2', toComponentId: 'dcdc', toTerminalId: 'in_pos', cableLengthFt: 2 },
      { id: 'in-n', fromComponentId: 'negbus', fromTerminalId: 'terminal_2', toComponentId: 'dcdc', toTerminalId: 'in_neg', cableLengthFt: 2 },
      { id: 'out-p', fromComponentId: 'dcdc', fromTerminalId: 'out_pos', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 2 },
      { id: 'out-n', fromComponentId: 'dcdc', fromTerminalId: 'out_neg', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 2 },
    ],
  };
}

test('Scenario 6: DC-DC input and output are separate power domains', () => {
  const analysis = analyzeSystemDesign(dcDcCrossVoltage(), PRODUCT_MAP);
  const inNet = analysis.graph.terminalNetIds.get('dcdc:in_pos');
  const outNet = analysis.graph.terminalNetIds.get('dcdc:out_pos');
  assert.ok(inNet, 'input terminal must be on a net');
  assert.ok(outNet, 'output terminal must be on a net');
  assert.notEqual(inNet, outNet, 'cross-voltage input/output must not share a domain');
});

// Scenario 8: protocol-level communication only (no per-conductor CAN pins).
function twoHeliosComm(): SystemDesign {
  return {
    ...base,
    id: 's8',
    name: 'comm',
    nominalVoltage: 48,
    components: [
      { id: 'bat-a', productId: 'discover-helios-ess-52-48-16000', label: 'Helios A', quantity: 1, x: -120, y: 0 },
      { id: 'bat-b', productId: 'discover-helios-ess-52-48-16000', label: 'Helios B', quantity: 1, x: 120, y: 0 },
    ],
    connections: [
      {
        id: 'lynk',
        fromComponentId: 'bat-a',
        fromTerminalId: 'port_lynk_1',
        toComponentId: 'bat-b',
        toTerminalId: 'port_lynk_2',
        cableLengthFt: 3,
        wireKind: 'communication',
      },
    ],
  };
}

test('Scenario 8: communication is modelled at the protocol level', () => {
  const analysis = analyzeSystemDesign(twoHeliosComm(), PRODUCT_MAP);
  assert.ok(analysis.communicationNetworks.length >= 1, 'expected a communication network');
});

// ============================================================
// Regression guard: the shipped default 48 V system stays analysable
// ============================================================

test('DEFAULT_SYSTEM analyses through the engine without throwing', () => {
  const analysis = analyzeSystemDesign(DEFAULT_SYSTEM, PRODUCT_MAP);
  assert.ok(Array.isArray(analysis.warnings));
  assert.equal(analysis.issues.length, 0, analysis.issues.map((issue) => issue.message).join('\n'));
  const errorWarnings = analysis.warnings.filter((warning) => warning.severity === 'error');
  assert.equal(errorWarnings.length, 0, errorWarnings.map((warning) => warning.message).join('\n'));
  for (const conn of DEFAULT_SYSTEM.connections) {
    assert.ok(analysis.connections[conn.id], `missing analysis for default connection ${conn.id}`);
  }
  // Every referenced product must be in the active catalogue.
  for (const comp of DEFAULT_SYSTEM.components) {
    assert.ok(PRODUCT_MAP.get(comp.productId), `default system references missing product ${comp.productId}`);
  }
});

test('DEFAULT_SYSTEM negative bus current comes from branch analysis, not busbar rating', () => {
  const analysis = analyzeSystemDesign(DEFAULT_SYSTEM, PRODUCT_MAP);
  const negativeBusGroup = analysis.terminalGroups['p3-bus-neg:bus'];
  assert.ok(negativeBusGroup, 'negative bus group must be analysed');
  assert.equal(negativeBusGroup.designCurrentA, 250);
  assert.ok(!negativeBusGroup.overRated, 'negative bus must not overload from its own 600A rating');

  const negativeBusNet = analysis.graph.nets.find((net) => (
    net.terminalKeys.some((key) => key.startsWith('p3-bus-neg:'))
  ));
  assert.ok(negativeBusNet, 'negative bus net must exist');
  assert.equal(negativeBusNet.operatingCurrentA, 250);

  const summaryNode = analysis.legacy.electricalSummary.powerNodes.find((node) => (
    node.componentId.startsWith('p3-bus-neg:')
  ));
  assert.ok(summaryNode, 'negative bus summary node must exist');
  assert.equal(summaryNode.operatingCurrentA, 250);

  const badWarning = analysis.warnings.find((warning) => (
    warning.componentId === 'p3-bus-neg' ||
    warning.code === 'NET_OVER_PROTECTION_LIMIT' ||
    warning.code === 'source_capacity_exceeded'
  ));
  assert.equal(badWarning, undefined, badWarning?.message);
});

test('DEFAULT_SYSTEM branch protection constraints stay local to the protected branch', () => {
  const analysis = analyzeSystemDesign(DEFAULT_SYSTEM, PRODUCT_MAP);
  for (const connectionId of ['p3-b1-to-fuse', 'p3-fuse-to-bus', 'p3-bus-to-fuse-inv', 'p3-fuse-inv-to-inv']) {
    const connection = analysis.connections[connectionId];
    assert.ok(connection, `${connectionId} must be analysed`);
    assert.ok(
      !connection.errors.some((error) => error.code === 'SELECTED_FUSE_EXCEEDS_DEVICE_MAX'),
      `${connectionId} must not inherit another branch's max-fuse limit`
    );
  }

  const acLoadLine = analysis.connections['p3-ac-l'];
  assert.ok(acLoadLine, 'AC load line must be analysed');
  assert.ok(
    !acLoadLine.errors.some((error) => error.code === 'SOURCE_SIDE_PROTECTION_MISSING'),
    'current-limited inverter AC output must not be treated as a battery-like fault source'
  );
});

test('48V preset MPPT negative returns stay paired to their own output branches', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.id === 'offgrid-48v')?.system;
  assert.ok(preset, '48V preset must exist');

  const analysis = analyzeSystemDesign(preset, PRODUCT_MAP);
  const errorWarnings = analysis.warnings.filter((warning) => warning.severity === 'error');
  assert.equal(errorWarnings.length, 0, errorWarnings.map((warning) => warning.message).join('\n'));

  const mppts = preset.components.filter((component) => component.productId === 'mppt-vic-150-100');
  assert.equal(mppts.length, 2, 'preset should contain both MPPT 150/100 controllers');

  for (const mppt of mppts) {
    const negativeReturn = preset.connections.find((connection) => (
      (connection.fromComponentId === mppt.id && connection.fromTerminalId === 'bat_neg') ||
      (connection.toComponentId === mppt.id && connection.toTerminalId === 'bat_neg')
    ));
    const positiveOutput = preset.connections.find((connection) => (
      (connection.fromComponentId === mppt.id && connection.fromTerminalId === 'bat_pos') ||
      (connection.toComponentId === mppt.id && connection.toTerminalId === 'bat_pos')
    ));
    assert.ok(negativeReturn, `${mppt.label} must have a battery negative return`);
    assert.ok(positiveOutput, `${mppt.label} must have a battery positive output`);

    const negativeAnalysis = analysis.connections[negativeReturn.id];
    const positiveAnalysis = analysis.connections[positiveOutput.id];
    assert.ok(negativeAnalysis, `${negativeReturn.id} must be analysed`);
    assert.ok(positiveAnalysis, `${positiveOutput.id} must be analysed`);
    assert.equal(negativeAnalysis.designCurrentA, 100);
    assert.equal(negativeAnalysis.cableSizingCurrentA, 125);
    assert.equal(positiveAnalysis.designCurrentA, 100);
    assert.equal(positiveAnalysis.cableSizingCurrentA, 125);
    assert.deepEqual(negativeAnalysis.errors, []);

    const terminal = analysis.terminals[`${mppt.id}:bat_neg`];
    assert.ok(terminal, `${mppt.label} BAT- terminal must be analysed`);
    assert.equal(terminal.designCurrentA, 100);
    assert.equal(terminal.overCurrent, false);
  }
});

test('48V preset does not promote placeholder metadata into runtime issue cards', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.id === 'offgrid-48v')?.system;
  assert.ok(preset, '48V preset must exist');

  const analysis = analyzeSystemDesign(preset, PRODUCT_MAP);
  const issues = buildBuilderIssues(preset, PRODUCT_MAP, analysis);
  assert.ok(
    !issues.some((issue) => issue.code === 'PLACEHOLDER_PRODUCT'),
    issues.filter((issue) => issue.code === 'PLACEHOLDER_PRODUCT').map((issue) => issue.message).join('\n')
  );
});

// ---- summary ----------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\nFailures:\n  - ' + failures.join('\n  - '));
  process.exit(1);
}
