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
import { buildBom } from '../src/utils/bomCalculations';
import { getEffectiveTerminal } from '../src/utils/effectiveTerminals';
import { selectBestFuseProduct, getFuseRating } from '../src/utils/fuseSelection';
import { continuousFactorForBus, DEFAULT_ASSUMPTIONS } from '../src/data/electricalRules';
import { voltageDropV, cableByAwg } from '../src/data/cableAmpacity';
import { nextStandardFuse } from '../src/data/fuseRatings';
import { DEFAULT_SYSTEM } from '../src/data/defaultSystem';
import { SYSTEM_PRESETS } from '../src/data/presetSystems';
import { sanitizeSystemDesign } from '../src/utils/systemSanitization';
import { inlineProtectionTerminalIds } from '../src/utils/inlineProtection';
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

test('inline AC breaker insertion resolves L1 and L2 pole terminals', () => {
  const onePole = PRODUCT_MAP.get('breaker-ac-din-1p-30a');
  const twoPole = PRODUCT_MAP.get('breaker-ac-din-2p-30a');
  assert.ok(onePole, '1P AC breaker variant must remain in the active catalogue');
  assert.ok(twoPole, '2P AC breaker variant must remain in the active catalogue');

  assert.deepEqual(inlineProtectionTerminalIds(onePole!, 'ac_line'), {
    inId: 'l1_in',
    outId: 'l1_out',
  });
  assert.equal(inlineProtectionTerminalIds(onePole!, 'ac_line2'), null);
  assert.deepEqual(inlineProtectionTerminalIds(twoPole!, 'ac_line2'), {
    inId: 'l2_in',
    outId: 'l2_out',
  });
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

test('Scenario 2b: direct battery interconnect positive and negative conductors stay paired by topology', () => {
  const analysis = analyzeSystemDesign(threeHeliosDaisyChainWithLoad(150), PRODUCT_MAP);
  const firstPositive = analysis.connections['bat2-bat1-pos'];
  const firstNegative = analysis.connections['bat1-bat2-neg'];
  const secondPositive = analysis.connections['bat3-bat2-pos'];
  const secondNegative = analysis.connections['bat2-bat3-neg'];

  assert.equal(firstNegative?.recommendedCableAwg, firstPositive?.recommendedCableAwg);
  assert.equal(secondNegative?.recommendedCableAwg, secondPositive?.recommendedCableAwg);
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

function commProduct(id: string): Product {
  return {
    id,
    manufacturer: 'Test',
    name: id,
    productType: 'commAccessory',
    width: 80,
    height: 60,
    ports: [
      {
        id: 'can_out',
        kind: 'comm',
        topology: 'bus',
        role: 'bidirectional',
        label: 'CAN Out',
        connectorType: 'RJ45',
        supportedProtocols: ['Pylon LV', 'J1939'],
        isConfigurable: true,
      },
    ],
    terminalGroups: [
      {
        id: 'can_iface',
        portId: 'can_out',
        groupType: 'communication_interface',
        internallyCommon: true,
      },
    ],
    terminals: [
      { id: 'can_out_jack_1', label: 'CAN 1', side: 'right', offsetX: 40, offsetY: -8, terminalGroupId: 'can_iface' },
      { id: 'can_out_jack_2', label: 'CAN 2', side: 'right', offsetX: 40, offsetY: 8, terminalGroupId: 'can_iface' },
    ],
    communicationPorts: [
      {
        id: 'legacy_other_id',
        name: 'Legacy should not win',
        connectorType: 'RJ45',
        supportedProtocols: ['J1939'],
      },
    ],
  };
}

test('Regression: communication protocol resolves from ProductPort via terminal.portId', () => {
  const productMap = new Map(PRODUCT_MAP);
  productMap.set('comm-a', commProduct('comm-a'));
  productMap.set('comm-b', commProduct('comm-b'));
  const system: SystemDesign = {
    ...base,
    id: 'comm-port-resolution',
    name: 'comm port resolution',
    nominalVoltage: 48,
    components: [
      { id: 'a', productId: 'comm-a', label: 'A', quantity: 1, x: -80, y: 0, configuredProtocols: { can_out: 'Pylon LV' } },
      { id: 'b', productId: 'comm-b', label: 'B', quantity: 1, x: 80, y: 0, configuredProtocols: { can_out: 'Pylon LV' } },
    ],
    connections: [
      { id: 'wire', fromComponentId: 'a', fromTerminalId: 'can_out_jack_1', toComponentId: 'b', toTerminalId: 'can_out_jack_2', cableLengthFt: 3, wireKind: 'communication' },
    ],
  };
  const analysis = analyzeSystemDesign(system, productMap);
  assert.equal(analysis.communicationNetworks.length, 1);
  assert.deepEqual(analysis.communicationNetworks[0].protocols, ['Pylon LV']);
  assert.ok(analysis.communicationNetworks[0].portRefs.every((ref) => ref.portId === 'can_out'));
});

test('Regression: communication protocol conflict is checked at ProductPort level', () => {
  const productMap = new Map(PRODUCT_MAP);
  productMap.set('comm-a', commProduct('comm-a'));
  productMap.set('comm-b', commProduct('comm-b'));
  const system: SystemDesign = {
    ...base,
    id: 'comm-port-conflict',
    name: 'comm port conflict',
    nominalVoltage: 48,
    components: [
      { id: 'a', productId: 'comm-a', label: 'A', quantity: 1, x: -80, y: 0, configuredProtocols: { can_out: 'Pylon LV' } },
      { id: 'b', productId: 'comm-b', label: 'B', quantity: 1, x: 80, y: 0, configuredProtocols: { can_out: 'J1939' } },
    ],
    connections: [
      { id: 'wire', fromComponentId: 'a', fromTerminalId: 'can_out_jack_1', toComponentId: 'b', toTerminalId: 'can_out_jack_1', cableLengthFt: 3, wireKind: 'communication' },
    ],
  };
  const analysis = analyzeSystemDesign(system, productMap);
  assert.ok(analysis.communicationNetworks[0].errors.some((error) => error.code === 'COMM_PROTOCOL_CONFLICT'));
});

function cableLimitSystem(
  loadTerminalPatch: Partial<Product['terminals'][number]>,
  connectionPatch: Partial<SystemDesign['connections'][number]> = {}
): { system: SystemDesign; productMap: Map<string, Product> } {
  const load = PRODUCT_MAP.get('acc-dc-load-generic')!;
  const productMap = new Map(PRODUCT_MAP);
  productMap.set('test-dc-load-cable-limits', {
    ...load,
    id: 'test-dc-load-cable-limits',
    terminals: load.terminals.map((terminal) =>
      terminal.id === 'dc_pos' ? { ...terminal, ...loadTerminalPatch } : terminal
    ),
  });
  return {
    productMap,
    system: {
      ...base,
      id: 'cable-limits',
      name: 'cable limits',
      nominalVoltage: 48,
      components: [
        { id: 'bat', productId: 'discover-helios-ess-52-48-16000', label: 'Helios', quantity: 1, x: -160, y: 0 },
        { id: 'load', productId: 'test-dc-load-cable-limits', label: 'Load', quantity: 1, x: 160, y: 0, instanceVoltageV: 48, instanceMaxCurrentA: 20 },
      ],
      connections: [
        { id: 'pos', fromComponentId: 'bat', fromTerminalId: 'dc_pos_1', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 2, ...connectionPatch },
        { id: 'neg', fromComponentId: 'bat', fromTerminalId: 'dc_neg_1', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 2 },
      ],
    },
  };
}

test('Regression: terminal minCableAwg raises auto cable recommendation', () => {
  const { system, productMap } = cableLimitSystem({ minCableAwg: '4' });
  const analysis = analyzeSystemDesign(system, productMap);
  assert.equal(analysis.connections['pos'].recommendedCableAwg, '4');
});

test('Regression: terminal recommendedCableAwg is preferred when legal', () => {
  const { system, productMap } = cableLimitSystem({ recommendedCableAwg: '2' });
  const analysis = analyzeSystemDesign(system, productMap);
  assert.equal(analysis.connections['pos'].recommendedCableAwg, '2');
});

test('Regression: terminal maxCableAwg is enforced for manual cable sizing', () => {
  const { system, productMap } = cableLimitSystem(
    { maxCableAwg: '6' },
    { designCurrentOverrideA: 150, manualCableAwg: '2' }
  );
  const analysis = analyzeSystemDesign(system, productMap);
  assert.ok(analysis.connections['pos'].errors.some((error) => error.code === 'CABLE_EXCEEDS_TERMINAL_MAX'));
});

// ============================================================
// Solar source model: physical panels vs explicit custom arrays
// ============================================================

function customArrayToMppt(ratings: SystemDesign['components'][number]['customSolarArrayRatings']): SystemDesign {
  return {
    ...base,
    id: 'custom-array-mppt',
    name: 'custom array to mppt',
    nominalVoltage: 48,
    components: [
      {
        id: 'array',
        productId: 'custom-solar-array',
        label: 'Custom PV Array',
        quantity: 1,
        x: -160,
        y: 0,
        includeInBom: false,
        customSolarArrayRatings: ratings,
      },
      { id: 'mppt', productId: 'mppt-150-35', label: 'MPPT', quantity: 1, x: 160, y: 0 },
    ],
    connections: [
      { id: 'pv-pos', fromComponentId: 'array', fromTerminalId: 'pv_pos', toComponentId: 'mppt', toTerminalId: 'pv_pos', cableLengthFt: 12 },
      { id: 'pv-neg', fromComponentId: 'array', fromTerminalId: 'pv_neg', toComponentId: 'mppt', toTerminalId: 'pv_neg', cableLengthFt: 12 },
    ],
  };
}

test('Solar sanitization: physical panel quantity and hidden multipliers are stripped', () => {
  const system = sanitizeSystemDesign({
    ...base,
    id: 'sanitize-panel',
    name: 'sanitize panel',
    nominalVoltage: 48,
    components: [
      {
        id: 'panel',
        productId: 'solar-array-400w',
        label: 'Solar Panel',
        quantity: 7,
        x: 0,
        y: 0,
        solarSeriesCount: 7,
        solarParallelCount: 1,
        solarWiringMode: 'series',
        customSolarArrayRatings: { vocV: 280, iscA: 12, powerW: 2800 },
      },
    ],
    connections: [],
  }, PRODUCT_MAP);
  const panel = system.components[0];
  assert.equal(panel.quantity, 1);
  assert.equal(panel.solarSeriesCount, undefined);
  assert.equal(panel.solarParallelCount, undefined);
  assert.equal(panel.solarWiringMode, undefined);
  assert.equal(panel.customSolarArrayRatings, undefined);
});

test('Solar model: one physical 400W panel remains 400W, not a hidden 2800W string', () => {
  const system = customArrayToMppt({ vocV: 40, vmpV: 34, iscA: 12, impA: 10, powerW: 400 });
  system.components[0] = {
    ...system.components[0],
    productId: 'solar-array-400w',
    label: 'Solar Panel 400W',
    quantity: 7,
    solarSeriesCount: 7,
    customSolarArrayRatings: { vocV: 280, iscA: 12, powerW: 2800 },
  };
  const sanitized = sanitizeSystemDesign(system, PRODUCT_MAP);
  const analysis = analyzeSystemDesign(sanitized, PRODUCT_MAP);
  const solarSummary = analysis.legacy.electricalSummary.solar[0];
  assert.equal(solarSummary.powerW, 400);
  assert.equal(sanitized.components[0].quantity, 1);
});

test('Default and preset systems contain no hidden physical-panel multipliers', () => {
  const systems = [DEFAULT_SYSTEM, ...SYSTEM_PRESETS.map((preset) => preset.system)];
  for (const system of systems) {
    for (const component of system.components) {
      const product = PRODUCT_MAP.get(component.productId);
      if (product?.productType !== 'solar_array') continue;
      assert.equal(component.quantity, 1, `${system.id} ${component.id} physical panel quantity`);
      assert.equal(component.solarSeriesCount, undefined, `${system.id} ${component.id} series`);
      assert.equal(component.solarParallelCount, undefined, `${system.id} ${component.id} parallel`);
      assert.equal(component.solarWiringMode, undefined, `${system.id} ${component.id} wiring`);
      assert.equal(component.customSolarArrayRatings, undefined, `${system.id} ${component.id} custom ratings`);
    }
  }
});

test('Simple 12V Solar preset treats stacked battery studs as lug junctions and sizes parallel interconnects to pack conductors', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.id === 'simple-12v')?.system;
  assert.ok(preset, 'Simple 12V Solar preset must exist');

  const analysis = analyzeSystemDesign(preset, PRODUCT_MAP);
  assert.equal(analysis.issues.length, 0, `unexpected issues: ${analysis.issues.map((issue) => issue.message).join('; ')}`);
  assert.equal(analysis.warnings.length, 0, `unexpected warnings: ${analysis.warnings.map((warning) => warning.message).join('; ')}`);

  const positiveStack = analysis.terminals['comp-1782842438398-42:dc_pos'];
  const negativeStack = analysis.terminals['comp-1782842440255-43:dc_neg'];
  assert.ok(positiveStack, 'positive stacked battery stud must be analysed');
  assert.ok(negativeStack, 'negative stacked battery stud must be analysed');
  assert.equal(positiveStack.connectionCount, 2);
  assert.equal(negativeStack.connectionCount, 2);
  assert.ok(!positiveStack.overCurrent, 'stacked positive stud should not treat full pack feeder current as internal battery current');
  assert.ok(!negativeStack.overCurrent, 'stacked negative stud should not add charge and load currents in one direction');

  const positiveInterconnect = analysis.connections['conn-1782842443039-44'];
  const negativeInterconnect = analysis.connections['conn-1782842444342-45'];
  assert.equal(positiveInterconnect.designCurrentA, 170);
  assert.equal(negativeInterconnect.designCurrentA, 170);
  assert.equal(positiveInterconnect.recommendedCableAwg, '4/0');
  assert.equal(negativeInterconnect.recommendedCableAwg, '4/0');
});

test('Custom Solar Array preserves ratings while forcing quantity to one', () => {
  const system = sanitizeSystemDesign({
    ...base,
    id: 'sanitize-custom-array',
    name: 'sanitize custom array',
    nominalVoltage: 48,
    components: [
      {
        id: 'array',
        productId: 'custom-solar-array',
        quantity: 5,
        x: 0,
        y: 0,
        solarSeriesCount: 7,
        customSolarArrayRatings: { vocV: 120, vmpV: 100, iscA: 20, impA: 18, powerW: 1800 },
      },
    ],
    connections: [],
  }, PRODUCT_MAP);
  assert.equal(system.components[0].quantity, 1);
  assert.equal(system.components[0].solarSeriesCount, undefined);
  assert.deepEqual(system.components[0].customSolarArrayRatings, { vocV: 120, vmpV: 100, iscA: 20, impA: 18, powerW: 1800 });
});

test('Custom Solar Array missing Voc or Isc creates CUSTOM_SOLAR_ARRAY_INCOMPLETE', () => {
  const analysis = analyzeSystemDesign(customArrayToMppt({ vmpV: 100, impA: 10, powerW: 1000 }), PRODUCT_MAP);
  assert.ok(analysis.warnings.some((warning) => warning.code === 'CUSTOM_SOLAR_ARRAY_INCOMPLETE'));
});

test('Custom Solar Array invalid Vmp/Imp relationships create CUSTOM_SOLAR_ARRAY_INVALID_RATINGS', () => {
  const highVmp = analyzeSystemDesign(customArrayToMppt({ vocV: 100, vmpV: 120, iscA: 12, impA: 10, powerW: 1200 }), PRODUCT_MAP);
  assert.ok(highVmp.warnings.some((warning) => warning.code === 'CUSTOM_SOLAR_ARRAY_INVALID_RATINGS'));

  const highImp = analyzeSystemDesign(customArrayToMppt({ vocV: 120, vmpV: 100, iscA: 12, impA: 13, powerW: 1300 }), PRODUCT_MAP);
  assert.ok(highImp.warnings.some((warning) => warning.code === 'CUSTOM_SOLAR_ARRAY_INVALID_RATINGS'));
});

test('Custom Solar Array MPPT limit checks use voltage, current, and power ratings', () => {
  const voltage = analyzeSystemDesign(customArrayToMppt({ vocV: 140, coldVocV: 160, vmpV: 120, iscA: 20, impA: 18, powerW: 2160 }), PRODUCT_MAP);
  assert.ok(voltage.warnings.some((warning) => warning.code === 'MPPT_PV_VOLTAGE_EXCEEDED'));

  const current = analyzeSystemDesign(customArrayToMppt({ vocV: 120, vmpV: 100, iscA: 40, impA: 30, powerW: 3000 }), PRODUCT_MAP);
  assert.ok(current.warnings.some((warning) => warning.code === 'MPPT_PV_CURRENT_EXCEEDED'));

  const power = analyzeSystemDesign(customArrayToMppt({ vocV: 120, vmpV: 100, iscA: 20, impA: 18, powerW: 2500 }), PRODUCT_MAP);
  assert.ok(power.warnings.some((warning) => warning.code === 'MPPT_PV_POWER_EXCEEDED'));
});

test('Custom Solar Array PV positive uses Isc and PV negative matches it', () => {
  const analysis = analyzeSystemDesign(customArrayToMppt({ vocV: 120, vmpV: 100, iscA: 22, impA: 18, powerW: 1800 }), PRODUCT_MAP);
  assert.equal(analysis.connections['pv-pos'].designCurrentA, 22);
  assert.equal(analysis.connections['pv-neg'].designCurrentA, 22);
});

test('BOM physical panel quantity is seven only for seven placed panels', () => {
  const components = Array.from({ length: 7 }, (_, index) => ({
    id: `panel-${index + 1}`,
    productId: 'solar-array-400w',
    label: `Solar Panel ${index + 1}`,
    quantity: 1,
    x: index * 20,
    y: 0,
    includeInBom: true,
  }));
  const rows = buildBom({
    ...base,
    id: 'solar-bom',
    name: 'solar bom',
    nominalVoltage: 48,
    components,
    connections: [],
  }, PRODUCT_MAP);
  const row = rows.find((item) => item.productType === 'solar_array' && item.componentId === 'panel-1');
  assert.ok(row, 'expected aggregated solar panel BOM row');
  assert.equal(row.quantity, 7);
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
  const negativeBusGroup = analysis.terminalGroups['bus-neg:bus'];
  assert.ok(negativeBusGroup, 'negative bus group must be analysed');
  assert.equal(negativeBusGroup.designCurrentA, 250);
  assert.ok(!negativeBusGroup.overRated, 'negative bus must not overload from its own 600A rating');

  const negativeBusNet = analysis.graph.nets.find((net) => (
    net.terminalKeys.some((key) => key.startsWith('bus-neg:'))
  ));
  assert.ok(negativeBusNet, 'negative bus net must exist');
  assert.equal(negativeBusNet.operatingCurrentA, 250);

  const summaryNode = analysis.legacy.electricalSummary.powerNodes.find((node) => (
    node.componentId.startsWith('bus-neg:')
  ));
  assert.ok(summaryNode, 'negative bus summary node must exist');
  assert.equal(summaryNode.operatingCurrentA, 250);

  const badWarning = analysis.warnings.find((warning) => (
    warning.componentId === 'bus-neg' ||
    warning.code === 'NET_OVER_PROTECTION_LIMIT' ||
    warning.code === 'source_capacity_exceeded'
  ));
  assert.equal(badWarning, undefined, badWarning?.message);
});

test('DEFAULT_SYSTEM branch protection constraints stay local to the protected branch', () => {
  const analysis = analyzeSystemDesign(DEFAULT_SYSTEM, PRODUCT_MAP);
  for (const connectionId of ['bat1-pos', 'bat1-fuse-bus', 'bus-pos-main-fuse', 'main-fuse-inverter']) {
    const connection = analysis.connections[connectionId];
    assert.ok(connection, `${connectionId} must be analysed`);
    assert.ok(
      !connection.errors.some((error) => error.code === 'SELECTED_FUSE_EXCEEDS_DEVICE_MAX'),
      `${connectionId} must not inherit another branch's max-fuse limit`
    );
  }

  const acLoadLine = analysis.connections['load-l1'];
  assert.ok(acLoadLine, 'AC load line must be analysed');
  assert.ok(
    !acLoadLine.errors.some((error) => error.code === 'SOURCE_SIDE_PROTECTION_MISSING'),
    'current-limited inverter AC output must not be treated as a battery-like fault source'
  );
});

test('48V preset PV tracker branches stay paired to their own inverter inputs', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.id === 'offgrid-48v')?.system;
  assert.ok(preset, '48V preset must exist');

  const analysis = analyzeSystemDesign(preset, PRODUCT_MAP);
  const pvErrorWarnings = analysis.warnings.filter((warning) => (
    warning.severity === 'error' &&
    warning.connectionId != null &&
    warning.connectionId.startsWith('pv')
  ));
  assert.equal(pvErrorWarnings.length, 0, pvErrorWarnings.map((warning) => warning.message).join('\n'));

  for (const [terminalPositive, terminalNegative] of [
    ['pv1_pos', 'pv1_neg'],
    ['pv2_pos', 'pv2_neg'],
  ] as const) {
    const positiveId = preset.connections.find((connection) => (
      (connection.fromComponentId === 'inverter' && connection.fromTerminalId === terminalPositive) ||
      (connection.toComponentId === 'inverter' && connection.toTerminalId === terminalPositive)
    ))?.id;
    const negativeId = preset.connections.find((connection) => (
      (connection.fromComponentId === 'inverter' && connection.fromTerminalId === terminalNegative) ||
      (connection.toComponentId === 'inverter' && connection.toTerminalId === terminalNegative)
    ))?.id;
    assert.ok(positiveId, `${terminalPositive} connection must exist`);
    assert.ok(negativeId, `${terminalNegative} connection must exist`);
    const positiveAnalysis = analysis.connections[positiveId];
    const negativeAnalysis = analysis.connections[negativeId];
    assert.ok(positiveAnalysis, `${positiveId} must be analysed`);
    assert.ok(negativeAnalysis, `${negativeId} must be analysed`);
    assert.ok(positiveAnalysis.designCurrentA > 0);
    assert.equal(negativeAnalysis.designCurrentA, positiveAnalysis.designCurrentA);
    assert.deepEqual(positiveAnalysis.errors, []);
    assert.deepEqual(negativeAnalysis.errors, []);

    const positiveTerminal = analysis.terminals[`inverter:${terminalPositive}`];
    const negativeTerminal = analysis.terminals[`inverter:${terminalNegative}`];
    assert.ok(positiveTerminal, `${terminalPositive} must be analysed`);
    assert.ok(negativeTerminal, `${terminalNegative} must be analysed`);
    assert.equal(positiveTerminal.designCurrentA, positiveAnalysis.designCurrentA);
    assert.equal(negativeTerminal.designCurrentA, positiveAnalysis.designCurrentA);
    assert.equal(positiveTerminal.overCurrent, false);
    assert.equal(negativeTerminal.overCurrent, false);
  }
});

function directBatteryInverter(withMppt = false): SystemDesign {
  return {
    ...base,
    id: withMppt ? 'direct-inverter-mppt' : 'direct-inverter',
    name: withMppt ? 'direct inverter with mppt' : 'direct inverter',
    nominalVoltage: 48,
    components: [
      { id: 'bat', productId: 'discover-helios-ess-52-48-16000', label: 'Helios', quantity: 1, x: -160, y: 0 },
      { id: 'inv', productId: 'inv-vic-mp2-48-5000', label: 'MultiPlus-II', quantity: 1, x: 160, y: 0 },
      ...(withMppt ? [
        { id: 'mppt', productId: 'mppt-vic-150-60', label: 'MPPT', quantity: 1, x: 0, y: 160 },
      ] : []),
    ],
    connections: [
      { id: 'inv-pos', fromComponentId: 'bat', fromTerminalId: 'dc_pos_1', toComponentId: 'inv', toTerminalId: 'dc_pos', cableLengthFt: 4 },
      { id: 'inv-neg', fromComponentId: 'bat', fromTerminalId: 'dc_neg_1', toComponentId: 'inv', toTerminalId: 'dc_neg', cableLengthFt: 4 },
      ...(withMppt ? [
        { id: 'mppt-pos', fromComponentId: 'mppt', fromTerminalId: 'bat_pos', toComponentId: 'bat', toTerminalId: 'dc_pos_2', cableLengthFt: 4 },
        { id: 'mppt-neg', fromComponentId: 'mppt', fromTerminalId: 'bat_neg', toComponentId: 'bat', toTerminalId: 'dc_neg_2', cableLengthFt: 4 },
      ] : []),
    ],
  };
}

test('Regression: direct battery to inverter/charger gets inverter DC demand without MPPT', () => {
  const analysis = analyzeSystemDesign(directBatteryInverter(), PRODUCT_MAP);
  const inverter = PRODUCT_MAP.get('inv-vic-mp2-48-5000')!;
  const expectedA = inverter.inverterChargerRatings!.maxDcCurrentA!;
  assert.equal(analysis.connections['inv-pos'].designCurrentA, expectedA);
  assert.equal(analysis.connections['inv-neg'].designCurrentA, expectedA);
});

test('Regression: adding MPPT does not change direct inverter/charger branch current', () => {
  const withoutMppt = analyzeSystemDesign(directBatteryInverter(), PRODUCT_MAP);
  const withMppt = analyzeSystemDesign(directBatteryInverter(true), PRODUCT_MAP);
  assert.equal(withMppt.connections['inv-pos'].designCurrentA, withoutMppt.connections['inv-pos'].designCurrentA);
  assert.equal(withMppt.connections['inv-neg'].designCurrentA, withoutMppt.connections['inv-neg'].designCurrentA);
  assert.equal(withMppt.connections['mppt-pos'].designCurrentA, 60);
  assert.equal(withMppt.connections['mppt-neg'].designCurrentA, 60);
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

// ============================================================
// DC- return path validation: battery-to-battery interconnects
// vs pack-external feeders
// ============================================================

function batteryToBatteryInterconnectSystem(opts?: {
  missingNeg?: boolean;
  reversedNeg?: boolean;
  differentTerminals?: boolean;
  undersizedNeg?: boolean;
}): SystemDesign {
  const negCableAwg = opts?.undersizedNeg ? '18' : undefined;
  return {
    ...base,
    id: 'bat-interconnect',
    name: 'battery interconnect test',
    nominalVoltage: 48,
    components: [
      { id: 'bat-a', productId: 'discover-helios-ess-52-48-16000', label: 'Helios A', quantity: 1, x: -200, y: -60 },
      { id: 'bat-b', productId: 'discover-helios-ess-52-48-16000', label: 'Helios B', quantity: 1, x: -200, y: 60 },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'DC Load', quantity: 1, x: 160, y: 0, instanceVoltageV: 48, instanceMaxCurrentA: 80 },
    ],
    connections: [
      // Battery-to-battery positive interconnect
      { id: 'bat-a-pos', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos_1', toComponentId: 'bat-b', toTerminalId: 'dc_pos_2', cableLengthFt: 2 },
      // External positive feeder from pack to load
      { id: 'load-pos', fromComponentId: 'bat-b', fromTerminalId: opts?.differentTerminals ? 'dc_pos_3' : 'dc_pos_1', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 6 },
      // External negative return from pack to load (diagonal takeoff from bat-a)
      { id: 'load-neg', fromComponentId: 'bat-a', fromTerminalId: 'dc_neg_1', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 6 },
      ...(opts?.missingNeg ? [] : [{
        // Battery-to-battery negative interconnect (direction may be reversed)
        id: 'bat-neg',
        fromComponentId: opts?.reversedNeg ? 'bat-b' : 'bat-a',
        fromTerminalId: opts?.differentTerminals ? 'dc_neg_3' : 'dc_neg_1',
        toComponentId: opts?.reversedNeg ? 'bat-a' : 'bat-b',
        toTerminalId: opts?.differentTerminals ? 'dc_neg_2' : 'dc_neg_2',
        cableLengthFt: 2,
        ...(negCableAwg ? { manualCableAwg: negCableAwg } : {}),
      }]),
    ],
  };
}

test('DC- return: battery-to-battery positive interconnect with matching negative passes', () => {
  const analysis = analyzeSystemDesign(batteryToBatteryInterconnectSystem(), PRODUCT_MAP);
  const missingNeg = analysis.warnings.filter((w) =>
    w.code === 'DC_NEG_RETURN_MISSING' && w.connectionId === 'bat-a-pos'
  );
  assert.equal(missingNeg.length, 0, `unexpected DC_NEG_RETURN_MISSING: ${missingNeg.map((w) => w.message).join('; ')}`);
});

test('DC- return: battery-to-battery positive interconnect without matching negative is caught', () => {
  const analysis = analyzeSystemDesign(batteryToBatteryInterconnectSystem({ missingNeg: true }), PRODUCT_MAP);
  const missingNeg = analysis.warnings.filter((w) =>
    w.code === 'DC_NEG_RETURN_MISSING' && w.connectionId === 'bat-a-pos'
  );
  assert.equal(missingNeg.length, 1, 'expected DC_NEG_RETURN_MISSING for bat-a-pos without matching negative');
});

test('DC- return: negative interconnect direction does not matter', () => {
  const analysis = analyzeSystemDesign(batteryToBatteryInterconnectSystem({ reversedNeg: true }), PRODUCT_MAP);
  const missingNeg = analysis.warnings.filter((w) =>
    w.code === 'DC_NEG_RETURN_MISSING' && w.connectionId === 'bat-a-pos'
  );
  assert.equal(missingNeg.length, 0, `unexpected DC_NEG_RETURN_MISSING with reversed negative: ${missingNeg.map((w) => w.message).join('; ')}`);
});

test('DC- return: negative interconnect terminal numbers do not matter', () => {
  const analysis = analyzeSystemDesign(batteryToBatteryInterconnectSystem({ differentTerminals: true }), PRODUCT_MAP);
  const missingNeg = analysis.warnings.filter((w) =>
    w.code === 'DC_NEG_RETURN_MISSING' && w.connectionId === 'bat-a-pos'
  );
  assert.equal(missingNeg.length, 0, `unexpected DC_NEG_RETURN_MISSING with different terminals: ${missingNeg.map((w) => w.message).join('; ')}`);
});

test('DC- return: undersized matching negative interconnect is caught', () => {
  const analysis = analyzeSystemDesign(batteryToBatteryInterconnectSystem({ undersizedNeg: true }), PRODUCT_MAP);
  const undersized = analysis.warnings.filter((w) =>
    w.code === 'DC_NEG_RETURN_UNDERSIZED' && w.connectionId === 'bat-a-pos'
  );
  assert.equal(undersized.length, 1, 'expected DC_NEG_RETURN_UNDERSIZED for undersized negative interconnect');
});

test('DC- return: diagonal external pack takeoff is allowed', () => {
  // The positive feeder comes from bat-b but the negative return comes from bat-a.
  // This is valid diagonal takeoff — the external return does not need to be on
  // the same physical battery as the external positive.
  const system = batteryToBatteryInterconnectSystem();
  const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
  const missingNeg = analysis.warnings.filter((w) =>
    w.code === 'DC_NEG_RETURN_MISSING' && w.connectionId === 'load-pos'
  );
  assert.equal(missingNeg.length, 0, `unexpected DC_NEG_RETURN_MISSING for diagonal takeoff: ${missingNeg.map((w) => w.message).join('; ')}`);
});

test('DC- return: missing external pack DC- return is still caught', () => {
  const system = batteryToBatteryInterconnectSystem();
  // Remove the external negative return connection
  system.connections = system.connections.filter((c) => c.id !== 'load-neg');
  const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
  const missingNeg = analysis.warnings.filter((w) =>
    w.code === 'DC_NEG_RETURN_MISSING' && w.connectionId === 'load-pos'
  );
  assert.equal(missingNeg.length, 1, 'expected DC_NEG_RETURN_MISSING for load-pos without external negative return');
});

test('DC- return: DEFAULT_SYSTEM produces no false DC_NEG_RETURN_MISSING warnings', () => {
  const analysis = analyzeSystemDesign(DEFAULT_SYSTEM, PRODUCT_MAP);
  const missingNegWarnings = analysis.warnings.filter((w) => w.code === 'DC_NEG_RETURN_MISSING');
  assert.equal(missingNegWarnings.length, 0,
    `DEFAULT_SYSTEM must not produce false DC_NEG_RETURN_MISSING: ${missingNegWarnings.map((w) => `${w.connectionId}: ${w.message}`).join('; ')}`
  );
});

// ---- summary ----------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\nFailures:\n  - ' + failures.join('\n  - '));
  process.exit(1);
}
