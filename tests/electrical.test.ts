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
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

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
import { productMatchesVoltageFilter } from '../src/data/products/helpers/catalogUtils';
import { getProductDisplayImageUrl } from '../src/utils/productImages';
import { breakerCompatibility, breakerPoleCount, breakerRatingProfiles } from '../src/utils/breakerSemantics';
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

test('continuousFactorForBus applies 156% to PV, 110% elsewhere', () => {
  assert.equal(continuousFactorForBus('pv_pos'), 1.5625);
  assert.equal(continuousFactorForBus('dc_pos'), 1.10);
  assert.equal(continuousFactorForBus('ac_line'), 1.10);
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
  const dualRated = PRODUCT_MAP.get('breaker-ac-dc-din-2p-30a');
  assert.ok(dualRated);
  assert.deepEqual(inlineProtectionTerminalIds(dualRated!, 'ac_line2'), { inId: 'l2_in', outId: 'l2_out' });
  assert.deepEqual(inlineProtectionTerminalIds(dualRated!, 'dc_neg'), { inId: 'l2_in', outId: 'l2_out' });
});

test('breaker catalog exposes explicit poles and distinct AC/DC rating profiles', () => {
  const dual = PRODUCT_MAP.get('breaker-ac-dc-din-2p-30a');
  assert.ok(dual, 'dual-rated 2P breaker must be in the active catalog');
  assert.equal(breakerCompatibility(dual!), 'both');
  assert.equal(breakerPoleCount(dual!), 2);
  assert.deepEqual(new Set(breakerRatingProfiles(dual!).map((profile) => profile.medium)), new Set(['ac', 'dc']));

  const acL2 = getEffectiveTerminal(dual!, 'l2_in', {
    id: 'dual', productId: dual!.id, quantity: 1, x: 0, y: 0, breakerConfigurationId: 'ac-480v-2p',
  });
  const dcPole2 = getEffectiveTerminal(dual!, 'l2_in', {
    id: 'dual', productId: dual!.id, quantity: 1, x: 0, y: 0, breakerConfigurationId: 'dc-60v-bipolar',
  });
  assert.equal(acL2?.kind, 'ac_power');
  assert.equal(acL2?.polarity, 'line2');
  assert.equal(dcPole2?.kind, 'dc_power');
  assert.equal(dcPole2?.polarity, 'negative');
});

test('three-pole breaker represents L1, L2, and L3 as separate conductors', () => {
  const breaker = PRODUCT_MAP.get('breaker-ac-din-3p-30a');
  assert.ok(breaker, '3P breaker must be in the active catalog');
  assert.equal(getEffectiveTerminal(breaker!, 'l1_in')?.polarity, 'line');
  assert.equal(getEffectiveTerminal(breaker!, 'l2_in')?.polarity, 'line2');
  assert.equal(getEffectiveTerminal(breaker!, 'l3_in')?.polarity, 'line3');
  assert.equal(breaker!.ports?.[0]?.phases, 3);
});

test('Smart BatteryProtect is an electronic disconnect, not verified breaker OCP', () => {
  const product = PRODUCT_MAP.get('breaker-smart-batteryprotect-100a');
  assert.ok(product);
  assert.equal(product!.productType, 'dcDisconnect');
  assert.notEqual(product!.protectionRatings?.protectionType, 'breaker');
});

test('mobile breaker catalog includes a verified 48V marine family', () => {
  const product = PRODUCT_MAP.get('breaker-blue-sea-285-80a');
  assert.ok(product);
  assert.equal(product!.manufacturer, 'Blue Sea Systems');
  assert.equal(product!.partNumber, '7186');
  assert.equal(product!.protectionRatings?.interruptRatingA, 3000);
  assert.deepEqual(product!.breakerDefinition?.applicationTags, ['mobile', 'marine', 'rv']);
});

test('breaker service validation rejects a DC domain above its rating', () => {
  const system: SystemDesign = {
    ...base,
    id: 'breaker-overvoltage', name: 'breaker overvoltage', nominalVoltage: 48,
    components: [
      { id: 'src', productId: 'generic-alternator-source', label: '120V DC Source', quantity: 1, x: -160, y: 0, instanceVoltageV: 120, instanceMaxCurrentA: 20 },
      { id: 'breaker', productId: 'breaker-dc-breaker-30a', label: '48V Breaker', quantity: 1, x: 0, y: -30 },
      { id: 'load', productId: 'acc-dc-load-generic', label: '120V Load', quantity: 1, x: 160, y: 0, instanceVoltageV: 120, instanceMaxCurrentA: 20 },
    ],
    connections: [
      { id: 'pos-in', fromComponentId: 'src', fromTerminalId: 'dc_pos', toComponentId: 'breaker', toTerminalId: 'in', cableLengthFt: 2 },
      { id: 'pos-out', fromComponentId: 'breaker', fromTerminalId: 'out', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 2 },
      { id: 'neg', fromComponentId: 'src', fromTerminalId: 'dc_neg', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 4 },
    ],
  };
  const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
  assert.ok(analysis.warnings.some((warning) => warning.code === 'BREAKER_VOLTAGE_EXCEEDED'));
  assert.ok(analysis.warnings.some((warning) => warning.code === 'BREAKER_INTERRUPT_RATING_UNKNOWN'));
});

test('breaker interrupt rating is compared with configured available fault current', () => {
  const system: SystemDesign = {
    ...base,
    id: 'breaker-interrupt-rating',
    name: 'breaker interrupt rating',
    nominalVoltage: 48,
    components: [
      { id: 'src', productId: 'generic-alternator-source', label: '48V Source', quantity: 1, x: -160, y: 0, instanceVoltageV: 48, instanceMaxCurrentA: 20, availableFaultCurrentA: 5000 },
      { id: 'breaker', productId: 'breaker-blue-sea-285-80a', label: '3kA Breaker', quantity: 1, x: 0, y: -30 },
      { id: 'load', productId: 'acc-dc-load-generic', label: '48V Load', quantity: 1, x: 160, y: 0, instanceVoltageV: 48, instanceMaxCurrentA: 20 },
    ],
    connections: [
      { id: 'pos-in', fromComponentId: 'src', fromTerminalId: 'dc_pos', toComponentId: 'breaker', toTerminalId: 'in', cableLengthFt: 2 },
      { id: 'pos-out', fromComponentId: 'breaker', fromTerminalId: 'out', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 2 },
      { id: 'neg', fromComponentId: 'src', fromTerminalId: 'dc_neg', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 4 },
    ],
  };
  const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
  assert.ok(analysis.warnings.some((warning) => warning.code === 'INTERRUPT_RATING_EXCEEDED' && warning.componentId === 'breaker'));
});

test('known breaker rating remains visibly unverified when source fault current is unknown', () => {
  const system: SystemDesign = {
    ...base,
    id: 'breaker-fault-current-unknown',
    name: 'breaker fault current unknown',
    nominalVoltage: 48,
    components: [
      { id: 'src', productId: 'generic-alternator-source', label: '48V Source', quantity: 1, x: -160, y: 0, instanceVoltageV: 48, instanceMaxCurrentA: 20 },
      { id: 'breaker', productId: 'breaker-blue-sea-285-80a', label: '3kA Breaker', quantity: 1, x: 0, y: -30 },
      { id: 'load', productId: 'acc-dc-load-generic', label: '48V Load', quantity: 1, x: 160, y: 0, instanceVoltageV: 48, instanceMaxCurrentA: 20 },
    ],
    connections: [
      { id: 'pos-in', fromComponentId: 'src', fromTerminalId: 'dc_pos', toComponentId: 'breaker', toTerminalId: 'in', cableLengthFt: 2 },
      { id: 'pos-out', fromComponentId: 'breaker', fromTerminalId: 'out', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 2 },
      { id: 'neg', fromComponentId: 'src', fromTerminalId: 'dc_neg', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 4 },
    ],
  };
  const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
  assert.ok(analysis.warnings.some((warning) => warning.code === 'FAULT_CURRENT_UNKNOWN' && warning.componentId === 'breaker'));
});

test('configured AC source fault current verifies the shipped AC breaker interrupt ratings', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.id === 'offgrid-48v')?.system;
  assert.ok(preset, '48V preset must exist');

  const configured: SystemDesign = {
    ...preset!,
    components: preset!.components.map((component) => (
      PRODUCT_MAP.get(component.productId)?.productType === 'shorePowerInlet'
        ? { ...component, availableFaultCurrentA: 5000 }
        : component
    )),
  };
  const analysis = analyzeSystemDesign(configured, PRODUCT_MAP);

  assert.ok(
    !analysis.warnings.some((warning) => warning.code === 'FAULT_CURRENT_UNKNOWN'),
    'configured AC source fault current should clear unknown-fault-current warnings',
  );
  assert.ok(
    !analysis.warnings.some((warning) => warning.code === 'INTERRUPT_RATING_EXCEEDED'),
    '5kA available fault current should remain below the shipped 6kA breaker ratings',
  );
});

function fuseVoltageSystem(fuseProductId: string): SystemDesign {
  return {
    ...base,
    id: `fuse-voltage-${fuseProductId}`,
    name: 'Fuse voltage validation',
    nominalVoltage: 48,
    components: [
      { id: 'src', productId: 'generic-alternator-source', label: '48V Source', quantity: 1, x: -160, y: 0, instanceVoltageV: 48, instanceMaxCurrentA: 20 },
      { id: 'fuse', productId: fuseProductId, label: 'Branch Fuse', quantity: 1, x: 0, y: -30, inferredConnectionKind: 'dc_power', inferredPolarity: 'positive', inferredVoltageClass: 'dc_low_voltage' },
      { id: 'load', productId: 'acc-dc-load-generic', label: '48V Load', quantity: 1, x: 160, y: 0, instanceVoltageV: 48, instanceMaxCurrentA: 20 },
    ],
    connections: [
      { id: 'pos-in', fromComponentId: 'src', fromTerminalId: 'dc_pos', toComponentId: 'fuse', toTerminalId: 'in', cableLengthFt: 2 },
      { id: 'pos-out', fromComponentId: 'fuse', fromTerminalId: 'out', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 2 },
      { id: 'neg', fromComponentId: 'src', fromTerminalId: 'dc_neg', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 4 },
    ],
  };
}

test('32V fuse is rejected on a resolved 48V DC domain', () => {
  const analysis = analyzeSystemDesign(fuseVoltageSystem('fuse-mega-generic-32v-60a'), PRODUCT_MAP);
  assert.ok(analysis.warnings.some((warning) => (
    warning.code === 'COMPONENT_VOLTAGE_RATING_EXCEEDED' && warning.componentId === 'fuse'
  )));
});

test('58V fuse is accepted on a resolved 48V DC domain', () => {
  const analysis = analyzeSystemDesign(fuseVoltageSystem('fuse-mega-generic-58v-60a'), PRODUCT_MAP);
  assert.ok(!analysis.warnings.some((warning) => (
    warning.code === 'COMPONENT_VOLTAGE_RATING_EXCEEDED' && warning.componentId === 'fuse'
  )));
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

test('active product display images resolve to public assets', () => {
  const missing = ALL_PRODUCTS.flatMap((product) => {
    const imageUrl = getProductDisplayImageUrl(product);
    if (!imageUrl?.startsWith('/product-images/')) return [];
    const publicPath = resolve(process.cwd(), 'public', imageUrl.replace(/^\/+/, ''));
    return existsSync(publicPath) ? [] : [`${product.id}: ${imageUrl}`];
  });

  assert.deepEqual(missing, [], `missing product display images:\n${missing.join('\n')}`);
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
        { id: 'source', productId: 'generic-alternator-source', label: 'DC Source', quantity: 1, x: -160, y: 0, instanceVoltageV: 48, instanceMaxCurrentA: 20 },
        { id: 'load', productId: 'test-dc-load-cable-limits', label: 'Load', quantity: 1, x: 160, y: 0, instanceVoltageV: 48, instanceMaxCurrentA: 20 },
      ],
      connections: [
        { id: 'pos', fromComponentId: 'source', fromTerminalId: 'dc_pos', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 2, ...connectionPatch },
        { id: 'neg', fromComponentId: 'source', fromTerminalId: 'dc_neg', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 2 },
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

test('12V Bare DC preset uses Lynx Distributor with fused DC-DC, MPPT, and DC loads', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.id === 'simple-12v')?.system;
  assert.ok(preset, '12V Bare DC preset must exist');

  const analysis = analyzeSystemDesign(preset, PRODUCT_MAP);
  assert.equal(analysis.issues.length, 0, `unexpected issues: ${analysis.issues.map((issue) => issue.message).join('; ')}`);

  const unexpectedWarnings = analysis.warnings.filter((w) => w.code !== 'DC_BUS_VOLTAGE_UNKNOWN');
  assert.equal(
    unexpectedWarnings.length,
    0,
    `unexpected warnings: ${unexpectedWarnings.map((warning) => `${warning.code}:${warning.connectionId ?? 'system'}:${warning.message}`).join('; ')}`
  );

  const batteries = preset.components.filter((component) => PRODUCT_MAP.get(component.productId)?.productType === 'battery');
  assert.equal(batteries.length, 1, 'bare DC preset should have a single battery');

  const lynx = preset.components.find((component) => component.productId === 'dist-vic-lynx-distributor');
  assert.ok(lynx, 'preset should use the Victron Lynx Distributor');

  assert.ok(
    preset.components.some((component) => component.productId === 'acc-vic-dc-dc-orion-12-12-30'),
    'preset should use the Orion-Tr Smart 12/12-30A DC-DC charger'
  );

  assert.ok(
    preset.components.some((component) => component.productId === 'mppt-vic-150-60'),
    'preset should use the SmartSolar MPPT 150/60'
  );

  assert.ok(
    preset.components.some((component) => component.productId === 'acc-dc-load-generic'),
    'preset should include a DC load'
  );

  const battery = batteries[0];
  const batteryProduct = PRODUCT_MAP.get(battery.productId);
  const positiveGroup = batteryProduct?.terminalGroups?.find((group) => group.id === 'dc_pos');
  assert.equal(positiveGroup?.integratedProtection?.protectionType, 'fuse');
  assert.equal(positiveGroup?.integratedProtection?.currentRatingA, 200);

  const batteryPositiveFeed = preset.connections.find((connection) =>
    connection.fromComponentId === battery.id &&
    connection.fromTerminalId === 'dc_pos' &&
    connection.toComponentId === lynx.id &&
    connection.toTerminalId === 'main_pos'
  );
  assert.ok(batteryPositiveFeed, 'the AES-B positive post should feed the Lynx directly');
  assert.ok(
    analysis.connections[batteryPositiveFeed.id]?.protectedBy.some((device) => device.label === 'Integrated DC+ fuse' && device.ratingA === 200),
    'the direct AES-B feed should be protected by the integrated DC+ fuse'
  );

  // Verify Lynx fused outputs: DC load on slot 1, MPPT on slot 2, DC-DC on slot 3
  assert.ok(
    preset.connections.some((c) => c.fromComponentId === 'rv12-lynx' && c.toComponentId === 'rv12-dc-load' && c.fromTerminalId === 'out_pos_1' && c.toTerminalId === 'dc_pos'),
    'DC load should connect to Lynx slot 1'
  );
  assert.ok(
    preset.connections.some((c) =>
      (c.fromComponentId === 'rv12-mppt' && c.toComponentId === 'rv12-lynx' && c.fromTerminalId === 'bat_pos' && c.toTerminalId === 'out_pos_2') ||
      (c.fromComponentId === 'rv12-lynx' && c.toComponentId === 'rv12-mppt' && c.fromTerminalId === 'out_pos_2' && c.toTerminalId === 'bat_pos')
    ),
    'MPPT output should connect to Lynx slot 2'
  );
  assert.ok(
    preset.connections.some((c) => c.fromComponentId === 'rv12-dcdc' && c.toComponentId === 'rv12-lynx' && c.fromTerminalId === 'out_pos' && c.toTerminalId === 'out_pos_3'),
    'DC-DC output should connect to Lynx slot 3'
  );
});

test('24V Medium RV preset stacked battery studs do not report false terminal issues', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.voltage === 24)?.system;
  assert.ok(preset, '24V Medium RV preset must exist');

  const analysis = analyzeSystemDesign(preset, PRODUCT_MAP);
  const batteryIds = new Set(
    preset.components
      .filter((component) => PRODUCT_MAP.get(component.productId)?.productType === 'battery')
      .map((component) => component.id)
  );
  const batteryTerminalIssues = analysis.issues.filter((issue) =>
    issue.componentId != null &&
    batteryIds.has(issue.componentId) &&
    (issue.code === 'terminal_overcurrent' || issue.code === 'terminal_too_many_connections')
  );
  const batteryTerminalWarnings = analysis.warnings.filter((warning) =>
    warning.componentId != null &&
    batteryIds.has(warning.componentId) &&
    warning.code === 'TERMINAL_OVERCURRENT'
  );

  assert.equal(
    batteryTerminalIssues.length,
    0,
    `unexpected battery terminal issues: ${batteryTerminalIssues.map((issue) => issue.message).join('; ')}`
  );
  assert.equal(
    batteryTerminalWarnings.length,
    0,
    `unexpected battery terminal warnings: ${batteryTerminalWarnings.map((warning) => warning.message).join('; ')}`
  );
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

function customArrayThroughBreakerToMppt(
  breakerProductId: string,
  ratings: SystemDesign['components'][number]['customSolarArrayRatings']
): SystemDesign {
  return {
    ...base,
    id: 'custom-array-breaker-mppt',
    name: 'custom array through breaker to mppt',
    nominalVoltage: 48,
    components: [
      {
        id: 'array',
        productId: 'custom-solar-array',
        label: 'Custom PV Array',
        quantity: 1,
        x: -240,
        y: 0,
        includeInBom: false,
        customSolarArrayRatings: ratings,
      },
      {
        id: 'breaker',
        productId: breakerProductId,
        label: 'PV Breaker',
        quantity: 1,
        x: -80,
        y: 0,
        // A generic breaker has no fixed kind of its own — this mirrors what
        // App.tsx's dynamic-conductor inference stamps onto the component once
        // it is actually wired into a PV string in the UI.
        inferredConnectionKind: 'pv_power',
        inferredPolarity: 'positive',
        inferredVoltageClass: 'pv_high_voltage',
      },
      { id: 'mppt', productId: 'mppt-150-35', label: 'MPPT', quantity: 1, x: 160, y: 0 },
    ],
    connections: [
      { id: 'pv-pos-in', fromComponentId: 'array', fromTerminalId: 'pv_pos', toComponentId: 'breaker', toTerminalId: 'in', cableLengthFt: 6 },
      { id: 'pv-pos-out', fromComponentId: 'breaker', fromTerminalId: 'out', toComponentId: 'mppt', toTerminalId: 'pv_pos', cableLengthFt: 6 },
      { id: 'pv-neg', fromComponentId: 'array', fromTerminalId: 'pv_neg', toComponentId: 'mppt', toTerminalId: 'pv_neg', cableLengthFt: 12 },
    ],
  };
}

test('Generic DC breaker under-rated for PV string Voc triggers PROTECTION_PV_VOLTAGE_EXCEEDED', () => {
  const analysis = analyzeSystemDesign(
    customArrayThroughBreakerToMppt('breaker-dc-breaker-30a', { vocV: 140, coldVocV: 160, vmpV: 120, iscA: 20, impA: 18, powerW: 2160 }),
    PRODUCT_MAP
  );
  assert.ok(analysis.warnings.some((warning) => warning.code === 'PROTECTION_PV_VOLTAGE_EXCEEDED'));
});

test('600V-rated PV breaker on the same string reports no over-voltage warning', () => {
  const analysis = analyzeSystemDesign(
    customArrayThroughBreakerToMppt('breaker-dc-breaker-600v-30a', { vocV: 140, coldVocV: 160, vmpV: 120, iscA: 20, impA: 18, powerW: 2160 }),
    PRODUCT_MAP
  );
  assert.ok(!analysis.warnings.some((warning) => warning.code === 'PROTECTION_PV_VOLTAGE_EXCEEDED'));
  assert.ok(!analysis.warnings.some((warning) => warning.code === 'PROTECTION_PV_VOLTAGE_MARGIN'));
});

test('Regression: MPPT Voc check still sees through a PV breaker in series', () => {
  // Before the isPvPassThroughProduct fix, a breaker sitting between the array
  // and the MPPT would stop the upstream walk, silently hiding the array from
  // the MPPT's own MPPT_PV_VOLTAGE_EXCEEDED check.
  const analysis = analyzeSystemDesign(
    customArrayThroughBreakerToMppt('breaker-dc-breaker-600v-30a', { vocV: 140, coldVocV: 160, vmpV: 120, iscA: 20, impA: 18, powerW: 2160 }),
    PRODUCT_MAP
  );
  assert.ok(analysis.warnings.some((warning) => warning.code === 'MPPT_PV_VOLTAGE_EXCEEDED'));
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

  // SOURCE_SIDE_PROTECTION_MISSING on holder input-side cables is expected with
  // the fuse-holder distribution model. Voltage-class warnings may also arise
  // from pass-through distribution products. These are tracked separately.
  const nonSrcIssues = analysis.issues.filter(
    (issue) => issue.code !== 'SOURCE_SIDE_PROTECTION_MISSING'
  );
  assert.equal(nonSrcIssues.length, 0, nonSrcIssues.map((issue) => issue.message).join('\n'));
  const errorWarnings = analysis.warnings.filter(
    (warning) =>
      warning.severity === 'error' &&
      warning.code !== 'SOURCE_SIDE_PROTECTION_MISSING' &&
      warning.code !== 'INCOMPATIBLE_SOURCE_VOLTAGES'
  );
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
  const negativeBusId = DEFAULT_SYSTEM.components.find((component) => component.label === 'Negative Busbar')?.id;
  assert.ok(negativeBusId, 'default system must include a negative busbar');
  const expectedTerminalCurrentA = Math.max(
    ...Object.values(analysis.terminals)
      .filter((terminal) => terminal.componentId === negativeBusId)
      .map((terminal) => terminal.designCurrentA)
  );
  assert.ok(expectedTerminalCurrentA > 0, 'negative bus must have analysed terminal current');

  const negativeBusGroup = analysis.terminalGroups[`${negativeBusId}:bus`];
  assert.ok(negativeBusGroup, 'negative bus group must be analysed');
  assert.equal(negativeBusGroup.designCurrentA, expectedTerminalCurrentA);
  assert.notEqual(negativeBusGroup.designCurrentA, negativeBusGroup.maxCurrentA, 'negative bus group current must not come from its own busbar rating');
  assert.ok(!negativeBusGroup.overRated, 'negative bus must not overload from its own 600A rating');

  const negativeBusNet = analysis.graph.nets.find((net) => (
    net.terminalKeys.some((key) => key.startsWith(`${negativeBusId}:`))
  ));
  assert.ok(negativeBusNet, 'negative bus net must exist');
  assert.ok(negativeBusNet.operatingCurrentA > 0, 'negative bus net must have branch-derived operating current');
  assert.ok(negativeBusNet.operatingCurrentA < (negativeBusGroup.maxCurrentA ?? Infinity), 'negative bus net current must not come from its own busbar rating');

  const summaryNode = analysis.legacy.electricalSummary.powerNodes.find((node) => (
    node.componentId.startsWith(`${negativeBusId}:`)
  ));
  assert.ok(summaryNode, 'negative bus summary node must exist');
  assert.equal(summaryNode.operatingCurrentA, negativeBusGroup.designCurrentA);

  const badWarning = analysis.warnings.find((warning) => (
    warning.componentId === negativeBusId ||
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

test('48V preset PV input branches stay paired to their own tracker inputs', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.id === 'offgrid-48v')?.system;
  assert.ok(preset, '48V preset must exist');

  const analysis = analyzeSystemDesign(preset, PRODUCT_MAP);
  const pvErrorWarnings = analysis.warnings.filter((warning) => (
    warning.severity === 'error' &&
    warning.connectionId != null &&
    warning.connectionId.startsWith('pv')
  ));
  assert.equal(pvErrorWarnings.length, 0, pvErrorWarnings.map((warning) => warning.message).join('\n'));

  const pvInputs = preset.components.flatMap((component) => {
    const product = PRODUCT_MAP.get(component.productId);
    if (!product) return [];
    return (product.ports ?? [])
      .filter((port) => port.kind === 'pv' && port.role === 'sink')
      .map((port) => {
        const groups = product.terminalGroups ?? [];
        const positiveGroup = groups.find((group) => group.portId === port.id && group.polarity === 'positive');
        const negativeGroup = groups.find((group) => group.portId === port.id && group.polarity === 'negative');
        const positiveTerminal = product.terminals.find((terminal) => terminal.terminalGroupId === positiveGroup?.id);
        const negativeTerminal = product.terminals.find((terminal) => terminal.terminalGroupId === negativeGroup?.id);
        return {
          componentId: component.id,
          portId: port.id,
          positiveTerminalId: positiveTerminal?.id,
          negativeTerminalId: negativeTerminal?.id,
        };
      });
  });
  assert.ok(pvInputs.length > 0, '48V preset must include PV tracker inputs');

  for (const input of pvInputs) {
    assert.ok(input.positiveTerminalId, `${input.componentId} ${input.portId} PV positive terminal must exist`);
    assert.ok(input.negativeTerminalId, `${input.componentId} ${input.portId} PV negative terminal must exist`);
    const positiveId = preset.connections.find((connection) => (
      (connection.fromComponentId === input.componentId && connection.fromTerminalId === input.positiveTerminalId) ||
      (connection.toComponentId === input.componentId && connection.toTerminalId === input.positiveTerminalId)
    ))?.id;
    const negativeId = preset.connections.find((connection) => (
      (connection.fromComponentId === input.componentId && connection.fromTerminalId === input.negativeTerminalId) ||
      (connection.toComponentId === input.componentId && connection.toTerminalId === input.negativeTerminalId)
    ))?.id;
    assert.ok(positiveId, `${input.componentId} ${input.portId} PV positive connection must exist`);
    assert.ok(negativeId, `${input.componentId} ${input.portId} PV negative connection must exist`);
    const positiveAnalysis = analysis.connections[positiveId];
    const negativeAnalysis = analysis.connections[negativeId];
    assert.ok(positiveAnalysis, `${positiveId} must be analysed`);
    assert.ok(negativeAnalysis, `${negativeId} must be analysed`);
    assert.ok(positiveAnalysis.designCurrentA > 0);
    assert.equal(negativeAnalysis.designCurrentA, positiveAnalysis.designCurrentA);
    assert.deepEqual(positiveAnalysis.errors, []);
    assert.deepEqual(negativeAnalysis.errors, []);

    const positiveTerminal = analysis.terminals[`${input.componentId}:${input.positiveTerminalId}`];
    const negativeTerminal = analysis.terminals[`${input.componentId}:${input.negativeTerminalId}`];
    assert.ok(positiveTerminal, `${input.componentId} ${input.portId} PV positive must be analysed`);
    assert.ok(negativeTerminal, `${input.componentId} ${input.portId} PV negative must be analysed`);
    assert.equal(positiveTerminal.designCurrentA, positiveAnalysis.designCurrentA);
    assert.equal(negativeTerminal.designCurrentA, positiveAnalysis.designCurrentA);
    assert.equal(positiveTerminal.overCurrent, false);
    assert.equal(negativeTerminal.overCurrent, false);
  }
});

test('Release gate: default and shipped presets contain no electrical errors', () => {
  const systems = [
    { id: 'default', system: DEFAULT_SYSTEM },
    ...SYSTEM_PRESETS.map((preset) => ({ id: preset.id, system: preset.system })),
  ];
  for (const { id, system } of systems) {
    const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
    const errors = analysis.warnings.filter((warning) => warning.severity === 'error');
    assert.deepEqual(errors, [], `${id}:\n${errors.map((warning) => `${warning.code}: ${warning.message}`).join('\n')}`);
  }
});

test('Release gate: energized active conductors never silently resolve to zero current', () => {
  const activeBusTypes = new Set(['dc_pos', 'pv_pos', 'ac_line', 'ac_line2', 'ac_line3']);
  const systems = [
    { id: 'default', system: DEFAULT_SYSTEM },
    ...SYSTEM_PRESETS.map((preset) => ({ id: preset.id, system: preset.system })),
  ];
  for (const { id, system } of systems) {
    const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
    const zeroCurrent = system.connections.filter((connection) => {
      if (connection.busLink || connection.wireKind === 'communication') return false;
      const result = analysis.connections[connection.id];
      return result && activeBusTypes.has(result.busType) && result.designCurrentA <= 0;
    });
    assert.deepEqual(
      zeroCurrent.map((connection) => connection.id),
      [],
      `${id} contains active conductors with unresolved zero current`
    );
  }
});

test('Release gate: every connected power domain resolves a voltage basis', () => {
  const powerBusTypes = new Set([
    'dc_pos', 'dc_neg', 'pv_pos', 'pv_neg',
    'ac_line', 'ac_line2', 'ac_line3', 'ac_neutral',
  ]);
  const systems = [
    { id: 'default', system: DEFAULT_SYSTEM },
    ...SYSTEM_PRESETS.map((preset) => ({ id: preset.id, system: preset.system })),
  ];
  for (const { id, system } of systems) {
    const connectedKeys = new Set(system.connections.flatMap((connection) => [
      `${connection.fromComponentId}:${connection.fromTerminalId}`,
      `${connection.toComponentId}:${connection.toTerminalId}`,
    ]));
    const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
    const unresolved = analysis.powerDomains.filter((domain) => (
      powerBusTypes.has(domain.busType) &&
      domain.terminalKeys.some((key) => connectedKeys.has(key)) &&
      domain.nominalVoltageV == null
    ));
    assert.deepEqual(
      unresolved.map((domain) => domain.id),
      [],
      `${id} contains connected power domains without a voltage basis`
    );
  }
});

test('48V preset AC services resolve at 240V with source-side breaker orientation', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.id === 'offgrid-48v')?.system;
  assert.ok(preset, '48V preset must exist');

  const analysis = analyzeSystemDesign(preset, PRODUCT_MAP);
  const voltageErrors = [
    ...analysis.warnings.filter((warning) => warning.code === 'NET_VOLTAGE_CONFLICT'),
    ...analysis.issues.filter((issue) => issue.code === 'net_voltage_conflict'),
  ];
  assert.deepEqual(voltageErrors, []);

  const acDomains = analysis.powerDomains.filter((domain) => domain.busType.startsWith('ac_'));
  assert.ok(acDomains.length > 0, '48V preset must contain AC electrical domains');
  assert.ok(acDomains.every((domain) => domain.nominalVoltageV === 120 && !domain.hasVoltageConflict));

  for (const connection of Object.values(analysis.connections)) {
    if (connection.busType === 'ac_line' || connection.busType === 'ac_line2') {
      assert.equal(connection.voltageV, 240, `${connection.connectionId} must use the split-phase line-to-line voltage basis`);
    } else if (connection.busType === 'ac_neutral') {
      assert.equal(connection.voltageV, 120, `${connection.connectionId} neutral must use the line-to-neutral voltage basis`);
    }
  }

  const componentById = new Map(preset.components.map((component) => [component.id, component]));
  assert.equal(componentById.get('comp-1782867869646-470')?.label, 'Grid');
  assert.equal(componentById.get('comp-1782867874813-497')?.label, 'Generator');

  const connectionById = new Map(preset.connections.map((connection) => [connection.id, connection]));
  assert.equal(connectionById.get('conn-1782867906434-556')?.toTerminalId, 'l2_in');
  assert.equal(connectionById.get('conn-1782867909335-563')?.toTerminalId, 'l1_in');
  assert.equal(connectionById.get('conn-1782867911464-570')?.toTerminalId, 'l2_out');
  assert.equal(connectionById.get('conn-1782867913734-577')?.toTerminalId, 'l1_out');
  assert.equal(connectionById.get('conn-1782867915172-584')?.fromTerminalId, 'l1_out');
  assert.equal(connectionById.get('conn-1782867917896-591')?.toTerminalId, 'l2_out');
  assert.equal(connectionById.get('conn-1782867979043-742')?.fromTerminalId, 'l2_in');
  assert.equal(connectionById.get('conn-1782867980793-749')?.toTerminalId, 'l1_in');
  assert.equal(connectionById.get('conn-1782867982316-756')?.fromTerminalId, 'l2_in');
  assert.equal(connectionById.get('conn-1782867983843-763')?.toTerminalId, 'l1_in');

  const acConnectionErrors = preset.connections
    .filter((connection) => connection.busType?.startsWith('ac_'))
    .flatMap((connection) => analysis.connections[connection.id]?.errors ?? []);
  assert.deepEqual(acConnectionErrors, []);

  for (const connectionId of [
    'conn-1782867911464-570',
    'conn-1782867913734-577',
    'conn-1782867915172-584',
    'conn-1782867917896-591',
  ]) {
    assert.equal(
      analysis.connections[connectionId]?.designCurrentA,
      40,
      `${connectionId} must inherit the configured 40A grid/generator service current through its breaker`
    );
    assert.ok(
      !analysis.connections[connectionId]?.errors.some((issue) => issue.code === 'ANALYSIS_CURRENT_UNRESOLVED'),
      `${connectionId} must not silently resolve to zero current`
    );
  }
});

test('saved copies of the legacy 48V preset migrate to the corrected AC model', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.id === 'offgrid-48v')?.system;
  assert.ok(preset, '48V preset must exist');
  const legacyLabels: Record<string, string> = {
    'comp-1782867869646-470': 'Generator',
    'comp-1782867874813-497': 'Grid',
  };
  const legacyConnectionTerminals: Record<string, { from?: string; to?: string }> = {
    'conn-1782867911464-570': { to: 'l2_in' },
    'conn-1782867913734-577': { to: 'l1_in' },
    'conn-1782867915172-584': { from: 'l1_in' },
    'conn-1782867917896-591': { to: 'l2_in' },
    'conn-1782867979043-742': { from: 'l2_out' },
    'conn-1782867980793-749': { to: 'l1_out' },
    'conn-1782867982316-756': { from: 'l2_out' },
    'conn-1782867983843-763': { to: 'l1_out' },
  };
  const legacy: SystemDesign = {
    ...preset,
    id: 'saved-copy-of-legacy-48v-preset',
    components: preset.components.map((component) => (
      component.id in legacyLabels
        ? { ...component, label: legacyLabels[component.id], instanceVoltageV: 120 }
        : component.id === 'comp-1782867890071-533'
          ? { ...component, instanceVoltageV: 120 }
          : component
    )),
    connections: preset.connections.map((connection) => {
      const terminals = legacyConnectionTerminals[connection.id];
      return terminals ? {
        ...connection,
        fromTerminalId: terminals.from ?? connection.fromTerminalId,
        toTerminalId: terminals.to ?? connection.toTerminalId,
      } : connection;
    }),
  };

  const migrated = sanitizeSystemDesign(legacy, PRODUCT_MAP);
  const migratedById = new Map(migrated.components.map((component) => [component.id, component]));
  assert.equal(migratedById.get('comp-1782867869646-470')?.label, 'Grid');
  assert.equal(migratedById.get('comp-1782867874813-497')?.label, 'Generator');
  for (const id of ['comp-1782867869646-470', 'comp-1782867874813-497', 'comp-1782867890071-533']) {
    assert.equal(migratedById.get(id)?.instanceVoltageV, undefined);
  }

  const analysis = analyzeSystemDesign(migrated, PRODUCT_MAP);
  assert.ok(!analysis.warnings.some((warning) => warning.code === 'NET_VOLTAGE_CONFLICT'));
  assert.ok(analysis.powerDomains
    .filter((domain) => domain.busType.startsWith('ac_'))
    .every((domain) => domain.nominalVoltageV === 120 && !domain.hasVoltageConflict));
});

test('builder issue cards deduplicate voltage-domain warning adapters', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.id === 'offgrid-48v')?.system;
  assert.ok(preset, '48V preset must exist');
  const gridId = 'comp-1782867869646-470';
  const conflicted: SystemDesign = {
    ...preset,
    components: preset.components.map((component) =>
      component.id === gridId ? { ...component, instanceVoltageV: 120 } : component
    ),
  };

  const analysis = analyzeSystemDesign(conflicted, PRODUCT_MAP);
  const rawFindings = [
    ...analysis.warnings.filter((warning) => warning.code === 'NET_VOLTAGE_CONFLICT'),
    ...analysis.issues.filter((issue) => issue.code === 'net_voltage_conflict'),
  ];
  assert.ok(rawFindings.length > 2, 'split-phase conductors should reproduce repeated adapter findings');

  const cards = buildBuilderIssues(conflicted, PRODUCT_MAP, analysis).filter(
    (issue) => issue.code.toUpperCase() === 'NET_VOLTAGE_CONFLICT'
  );
  assert.equal(cards.length, 2, cards.map((issue) => `${issue.componentId}: ${issue.message}`).join('\n'));
  assert.equal(new Set(cards.map((issue) => issue.componentId)).size, 2);
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

test('Regression: persisted voltage-drop and warning fields do not drive analysis warnings', () => {
  const stale = directBatteryInverter();
  stale.connections = stale.connections.map((connection) => ({
    ...connection,
    calculatedCurrentA: 999,
    recommendedCableAwg: '18',
    voltageDropPercent: 99,
    warnings: ['legacy persisted sizing warning should be ignored'],
  }));

  const analysis = analyzeSystemDesign(stale, PRODUCT_MAP);
  assert.equal(
    analysis.warnings.some((warning) => warning.code === 'HIGH_VOLTAGE_DROP'),
    false,
    'computed analysis, not stale persisted voltageDropPercent, should drive voltage-drop warnings'
  );
  assert.equal(
    analysis.warnings.some((warning) => warning.message.includes('legacy persisted sizing warning')),
    false,
    'computed analysis, not stale persisted connection warnings, should drive sizing warnings'
  );
});

test('Regression: protection recommendations use circuit output, not persisted connection recommendations', () => {
  const stale = directBatteryInverter();
  stale.connections = stale.connections.map((connection) => (
    connection.id === 'inv-pos'
      ? { ...connection, recommendedFuseA: 1, recommendedCableAwg: '18' }
      : connection
  ));

  const analysis = analyzeSystemDesign(stale, PRODUCT_MAP);
  const recommendation = analysis.legacy.protectionRecommendations.find((item) => item.connectionId === 'inv-pos');
  assert.equal(recommendation, undefined, 'Helios integrated breaker should satisfy source-side protection');
  assert.ok(
    analysis.connections['inv-pos']?.protectedBy.some((device) => device.label === 'Integrated 200A DC breaker' && device.ratingA === 200),
    'direct Helios inverter positive lead should be protected by the integrated breaker'
  );
  assert.notEqual(analysis.connections['inv-pos']?.recommendedFuseA, 1);
  assert.notEqual(analysis.connections['inv-pos']?.recommendedCableAwg, '18');
});

function parallelAesPack(withPackFuse: boolean): SystemDesign {
  return {
    ...base,
    id: withPackFuse ? 'parallel-aes-pack-fused' : 'parallel-aes-pack-unfused',
    name: withPackFuse ? 'parallel aes pack fused' : 'parallel aes pack unfused',
    nominalVoltage: 12,
    components: [
      { id: 'bat-a', productId: 'discover-aes-lithium-12-200', label: 'AES-B A', quantity: 1, x: -220, y: -60 },
      { id: 'bat-b', productId: 'discover-aes-lithium-12-200', label: 'AES-B B', quantity: 1, x: -220, y: 80 },
      ...(withPackFuse ? [
        { id: 'pack-fuse', productId: 'fuse-midi-200a', label: 'Pack Fuse', quantity: 1, x: -20, y: -60 },
      ] : []),
      { id: 'load', productId: 'acc-dc-load-generic', label: 'DC Load', quantity: 1, x: 180, y: 0, instanceVoltageV: 12, instanceMaxCurrentA: 60 },
    ],
    connections: [
      { id: 'parallel-pos', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos', toComponentId: 'bat-b', toTerminalId: 'dc_pos', cableLengthFt: 2 },
      { id: 'parallel-neg', fromComponentId: 'bat-a', fromTerminalId: 'dc_neg', toComponentId: 'bat-b', toTerminalId: 'dc_neg', cableLengthFt: 2 },
      ...(withPackFuse ? [
        { id: 'pack-fuse-in', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos', toComponentId: 'pack-fuse', toTerminalId: 'in', cableLengthFt: 2 },
        { id: 'pack-pos', fromComponentId: 'pack-fuse', fromTerminalId: 'out', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 5 },
      ] : [
        { id: 'pack-pos', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 5 },
      ]),
      { id: 'pack-neg', fromComponentId: 'bat-b', fromTerminalId: 'dc_neg', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 5 },
    ],
  };
}

test('Parallel AES-B pack output still requires a pack fuse', () => {
  const analysis = analyzeSystemDesign(parallelAesPack(false), PRODUCT_MAP);
  const packOutput = analysis.connections['pack-pos'];
  assert.ok(packOutput, 'pack output must be analysed');
  assert.equal(
    packOutput.protectedBy.some((device) => device.label === 'Integrated DC+ fuse'),
    false,
    'per-battery integrated fuses must not be treated as the aggregate pack fuse'
  );
  assert.ok(
    packOutput.errors.some((error) => error.code === 'PACK_FUSE_REQUIRED'),
    'parallel pack output should require a pack fuse or breaker'
  );
  const recommendation = analysis.legacy.protectionRecommendations.find((item) => item.connectionId === 'pack-pos');
  assert.equal(recommendation?.kind, 'pack_fuse_required');
  assert.equal(recommendation?.message, 'Parallel battery pack output needs a fuse/breaker');
  assert.ok(recommendation?.reason.includes('combined positive takeoff'));
  assert.equal(recommendation?.recommendedFuseA, 70);
  assert.equal(recommendation?.insertTitle, 'Insert Battery Pack Fuse');
  assert.equal(recommendation?.defaultComponentLabel, 'Battery Pack Fuse');
});

test('Parallel AES-B pack output accepts a dedicated pack fuse', () => {
  const analysis = analyzeSystemDesign(parallelAesPack(true), PRODUCT_MAP);
  assert.ok(
    !analysis.connections['pack-fuse-in']?.errors.some((error) => error.code === 'SOURCE_SIDE_PROTECTION_MISSING'),
    'short source lead to the pack fuse should be accepted'
  );
  assert.ok(
    analysis.connections['pack-pos']?.protectedBy.some((device) => device.label === 'Pack Fuse' && device.ratingA === 200),
    'pack output should be protected by the dedicated pack fuse'
  );
  assert.equal(
    analysis.legacy.protectionRecommendations.some((item) => item.connectionId === 'pack-pos' || item.connectionId === 'pack-fuse-in'),
    false,
    'fused parallel pack should not produce missing-protection recommendations'
  );
});

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

// ============================================================
// AC split-phase: L1 / L2 / N are separate nets; voltage
// derivation distinguishes line→line2 (240V) from line→neutral
// (120V) on ac_240v-class ports.
// ============================================================

function splitPhaseSystem(): SystemDesign {
  return {
    ...base,
    id: 'split-phase',
    name: 'split phase',
    nominalVoltage: 48,
    components: [
      { id: 'grid', productId: 'generic-grid-source-240v', label: 'Shore 240V', quantity: 1, x: -160, y: 0 },
      { id: 'load', productId: 'acc-ac-load-split-phase-240v', label: 'AC Panel', quantity: 1, x: 160, y: 0, instanceMaxCurrentA: 40, instanceVoltageV: 240 },
    ],
    connections: [
      { id: 'l1', fromComponentId: 'grid', fromTerminalId: 'ac_l1', toComponentId: 'load', toTerminalId: 'ac_l1', cableLengthFt: 10 },
      { id: 'l2', fromComponentId: 'grid', fromTerminalId: 'ac_l2', toComponentId: 'load', toTerminalId: 'ac_l2', cableLengthFt: 10 },
      { id: 'n', fromComponentId: 'grid', fromTerminalId: 'ac_n', toComponentId: 'load', toTerminalId: 'ac_n', cableLengthFt: 10 },
    ],
  };
}

test('AC split-phase: L1 and L2 are separate nets, neutral is a third net', () => {
  const analysis = analyzeSystemDesign(splitPhaseSystem(), PRODUCT_MAP);
  assert.ok(analysis.connections['l1'], 'L1 connection must be analysed');
  assert.ok(analysis.connections['l2'], 'L2 connection must be analysed');
  assert.ok(analysis.connections['n'], 'neutral connection must be analysed');

  const l1Net = analysis.graph.terminalNetIds.get('load:ac_l1');
  const l2Net = analysis.graph.terminalNetIds.get('load:ac_l2');
  const nNet = analysis.graph.terminalNetIds.get('load:ac_n');
  assert.ok(l1Net, 'L1 must be on a net');
  assert.ok(l2Net, 'L2 must be on a net');
  assert.ok(nNet, 'neutral must be on a net');
  assert.notEqual(l1Net, l2Net, 'L1 and L2 must be separate nets');
  assert.notEqual(l1Net, nNet, 'L1 and neutral must be separate nets');
  assert.notEqual(l2Net, nNet, 'L2 and neutral must be separate nets');

  // L1 and L2 both carry non-zero design current at the load rating
  assert.ok(analysis.connections['l1'].designCurrentA > 0, 'L1 design current must be > 0');
  assert.equal(analysis.connections['l1'].designCurrentA, analysis.connections['l2'].designCurrentA,
    'L1 and L2 design currents must match on a balanced split-phase load');
});

test('AC split-phase: voltage derivation returns 240V for line→line2 and 120V for line→neutral', () => {
  const analysis = analyzeSystemDesign(splitPhaseSystem(), PRODUCT_MAP);

  // Each L→N connection should derive as 120V on ac_240v class
  // (line→neutral = 120V in split-phase per connectionNominalVoltageV)
  const l1VoltageV = analysis.connections['l1'].voltageV;
  const l2VoltageV = analysis.connections['l2'].voltageV;
  const nVoltageV = analysis.connections['n'].voltageV;
  assert.ok(l1VoltageV !== undefined, 'L1 connection must have voltage');
  assert.ok(l2VoltageV !== undefined, 'L2 connection must have voltage');
  assert.ok(nVoltageV !== undefined, 'neutral connection must have voltage');
  assert.equal(l1VoltageV, 240);
  assert.equal(l2VoltageV, 240);
  assert.equal(nVoltageV, 120);
});

test('AC service compatibility distinguishes 240V split-phase L-N from 230V single-phase L-N', () => {
  const system: SystemDesign = {
    ...base,
    id: 'split-phase-to-230v',
    name: 'split phase to 230V',
    components: [
      { id: 'grid', productId: 'generic-grid-source-240v', quantity: 1, x: -160, y: 0 },
      { id: 'inverter', productId: 'multiplus-ii-48-3000-230v', quantity: 1, x: 160, y: 0 },
    ],
    connections: [
      { id: 'line', fromComponentId: 'grid', fromTerminalId: 'ac_l1', toComponentId: 'inverter', toTerminalId: 'ac_in_l', cableLengthFt: 10 },
      { id: 'neutral', fromComponentId: 'grid', fromTerminalId: 'ac_n', toComponentId: 'inverter', toTerminalId: 'ac_in_n', cableLengthFt: 10 },
    ],
  };
  const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
  assert.ok(analysis.warnings.some((warning) => warning.code === 'NET_VOLTAGE_CONFLICT'));
  assert.equal(analysis.connections.line.voltageV, 120, 'L1-N on a 120/240V split-phase source is a 120V circuit');
});

test('AC service compatibility accepts 230V and 240V single-phase equipment in one class', () => {
  const baseSource = PRODUCT_MAP.get('generic-grid-source');
  assert.ok(baseSource);
  const source240: Product = {
    ...baseSource!,
    id: 'test-single-phase-source-240v',
    name: 'Test single-phase 240V source',
    ports: baseSource!.ports?.map((port) => port.kind === 'ac' ? {
      ...port,
      voltageClass: 'ac_240v',
      nominalVoltageV: 240,
      phases: 1,
      acService: { configuration: 'single_phase_line_neutral', lineToNeutralVoltageV: 240 },
    } : port),
  };
  const products = new Map(PRODUCT_MAP);
  products.set(source240.id, source240);
  const system: SystemDesign = {
    ...base,
    id: 'single-phase-230-240',
    name: 'single phase 230/240',
    components: [
      { id: 'source', productId: source240.id, quantity: 1, x: -160, y: 0 },
      { id: 'inverter', productId: 'multiplus-ii-48-3000-230v', quantity: 1, x: 160, y: 0 },
    ],
    connections: [
      { id: 'line', fromComponentId: 'source', fromTerminalId: 'ac_l', toComponentId: 'inverter', toTerminalId: 'ac_in_l', cableLengthFt: 10 },
      { id: 'neutral', fromComponentId: 'source', fromTerminalId: 'ac_n', toComponentId: 'inverter', toTerminalId: 'ac_in_n', cableLengthFt: 10 },
    ],
  };
  const analysis = analyzeSystemDesign(system, products);
  assert.ok(!analysis.warnings.some((warning) => warning.code === 'NET_VOLTAGE_CONFLICT'));
  assert.equal(analysis.connections.line.voltageV, 240);
});

// ============================================================
// Grounding / bonding: chassis ground and system earth are
// separate from power conductors and do not carry branch
// design current.
// ============================================================

function groundingSystem(): SystemDesign {
  return {
    ...base,
    id: 'grounding',
    name: 'grounding test',
    nominalVoltage: 48,
    components: [
      { id: 'bat', productId: 'discover-helios-ess-52-48-16000', label: 'Helios', quantity: 1, x: -160, y: 0 },
      { id: 'earth', productId: 'system-ac-earth', label: 'Earth', quantity: 1, x: 160, y: 0 },
      { id: 'chassis', productId: 'system-dc-chassis', label: 'Chassis', quantity: 1, x: 0, y: 120 },
    ],
    connections: [
      { id: 'chassis-earth', fromComponentId: 'chassis', fromTerminalId: 'chassis', toComponentId: 'earth', toTerminalId: 'earth', cableLengthFt: 5, wireKind: 'ground' },
    ],
  };
}

test('Grounding: chassis and earth grounds are on a separate net from DC power', () => {
  const analysis = analyzeSystemDesign(groundingSystem(), PRODUCT_MAP);

  const dcPosNet = analysis.graph.terminalNetIds.get('bat:dc_pos_1');
  const chassisNet = analysis.graph.terminalNetIds.get('chassis:chassis');
  const earthNet = analysis.graph.terminalNetIds.get('earth:earth');
  assert.ok(dcPosNet, 'DC positive must be on a net');
  assert.ok(chassisNet, 'chassis ground must be on a net');
  assert.ok(earthNet, 'earth ground must be on a net');
  assert.notEqual(dcPosNet, chassisNet, 'DC power and chassis ground must be separate nets');
  assert.notEqual(dcPosNet, earthNet, 'DC power and earth ground must be separate nets');

  // Chassis and earth share a ground net when connected
  assert.equal(chassisNet, earthNet, 'connected chassis and earth must share a net');

  // Ground connections carry zero design current
  assert.equal(analysis.connections['chassis-earth'].designCurrentA, 0,
    'ground bonding connection must carry zero design current');
});

// ============================================================
// Shore power / transfer switch: shore inlet feeds inverter
// AC input; inverter AC output feeds loads on a separate net.
// ============================================================

function shorePowerTransferSystem(): SystemDesign {
  return {
    ...base,
    id: 'shore-transfer',
    name: 'shore power transfer',
    nominalVoltage: 48,
    components: [
      { id: 'bat', productId: 'discover-helios-ess-52-48-16000', label: 'Helios', quantity: 1, x: -200, y: 0 },
      { id: 'shore', productId: 'generic-grid-source', label: 'Shore 120V', quantity: 1, x: -200, y: 200 },
      { id: 'inv', productId: 'inv-vic-mp2-48-5000', label: 'MultiPlus-II', quantity: 1, x: 0, y: 100 },
      { id: 'acload', productId: 'acc-ac-load-generic', label: 'AC Load', quantity: 1, x: 200, y: 100 },
    ],
    connections: [
      // DC side
      { id: 'bat-pos', fromComponentId: 'bat', fromTerminalId: 'dc_pos_1', toComponentId: 'inv', toTerminalId: 'dc_pos', cableLengthFt: 3 },
      { id: 'bat-neg', fromComponentId: 'bat', fromTerminalId: 'dc_neg_1', toComponentId: 'inv', toTerminalId: 'dc_neg', cableLengthFt: 3 },
      // Shore power into inverter AC input
      { id: 'shore-l', fromComponentId: 'shore', fromTerminalId: 'ac_l', toComponentId: 'inv', toTerminalId: 'ac_in_l', cableLengthFt: 20 },
      { id: 'shore-n', fromComponentId: 'shore', fromTerminalId: 'ac_n', toComponentId: 'inv', toTerminalId: 'ac_in_n', cableLengthFt: 20 },
      // Inverter AC output to load
      { id: 'acout-l', fromComponentId: 'inv', fromTerminalId: 'ac_out_l', toComponentId: 'acload', toTerminalId: 'ac_l', cableLengthFt: 5 },
      { id: 'acout-n', fromComponentId: 'inv', fromTerminalId: 'ac_out_n', toComponentId: 'acload', toTerminalId: 'ac_n', cableLengthFt: 5 },
    ],
  };
}

test('Shore power transfer: AC input and AC output are separate nets', () => {
  const analysis = analyzeSystemDesign(shorePowerTransferSystem(), PRODUCT_MAP);

  const acInNet = analysis.graph.terminalNetIds.get('inv:ac_in_l');
  const acOutNet = analysis.graph.terminalNetIds.get('inv:ac_out_l');
  assert.ok(acInNet, 'inverter AC input must be on a net');
  assert.ok(acOutNet, 'inverter AC output must be on a net');
  assert.notEqual(acInNet, acOutNet, 'shore AC input and inverter AC output must be separate nets');

  // DC bus is separate from both AC domains
  const dcNet = analysis.graph.terminalNetIds.get('inv:dc_pos');
  assert.ok(dcNet, 'inverter DC terminal must be on a net');
  assert.notEqual(dcNet, acInNet, 'DC bus and AC input must be separate');
  assert.notEqual(dcNet, acOutNet, 'DC bus and AC output must be separate');

  // All connections analysed
  for (const conn of ['bat-pos', 'bat-neg', 'shore-l', 'shore-n', 'acout-l', 'acout-n']) {
    assert.ok(analysis.connections[conn], `missing analysis for ${conn}`);
  }

  // Shore power input and inverter output both carry design current
  assert.ok(analysis.connections['shore-l'].designCurrentA > 0, 'shore input must carry design current');
  assert.ok(analysis.connections['acout-l'].designCurrentA > 0, 'inverter AC output must carry design current');
});

test('Regression: fuse_holder input lead is recognized as protected by its own slot fuse', () => {
  const sys: SystemDesign = {
    ...base,
    id: 'holder-upstream-parallel-pack',
    name: 'holder upstream parallel pack',
    nominalVoltage: 12,
    components: [
      { id: 'bat-a', productId: 'discover-aes-lithium-12-200', label: 'AES-B A', quantity: 1, x: -220, y: -60 },
      { id: 'bat-b', productId: 'discover-aes-lithium-12-200', label: 'AES-B B', quantity: 1, x: -220, y: 80 },
      { id: 'holder', productId: 'holder-midi-1pos-inline', label: 'Pack Fuse Holder', quantity: 1, x: -20, y: -60, fuseSlots: { slot_1: { installed: true, ratingA: 200 } } },
      { id: 'load', productId: 'acc-dc-load-generic', label: 'DC Load', quantity: 1, x: 180, y: 0, instanceVoltageV: 12, instanceMaxCurrentA: 60 },
    ],
    connections: [
      { id: 'parallel-pos', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos', toComponentId: 'bat-b', toTerminalId: 'dc_pos', cableLengthFt: 2 },
      { id: 'parallel-neg', fromComponentId: 'bat-a', fromTerminalId: 'dc_neg', toComponentId: 'bat-b', toTerminalId: 'dc_neg', cableLengthFt: 2 },
      { id: 'bat-to-holder', fromComponentId: 'bat-a', fromTerminalId: 'dc_pos', toComponentId: 'holder', toTerminalId: 'in_pos', cableLengthFt: 2 },
      { id: 'holder-to-load-pos', fromComponentId: 'holder', fromTerminalId: 'out_pos', toComponentId: 'load', toTerminalId: 'dc_pos', cableLengthFt: 5 },
      { id: 'bat-to-load-neg', fromComponentId: 'bat-b', fromTerminalId: 'dc_neg', toComponentId: 'load', toTerminalId: 'dc_neg', cableLengthFt: 5 },
    ],
  };
  const analysis = analyzeSystemDesign(sys, PRODUCT_MAP);
  const upstream = analysis.connections['bat-to-holder'];
  assert.ok(
    upstream?.protectedBy.some((device) => device.ratingA === 200),
    'the lead into the fuse holder should be recognized as protected by its own 200A slot fuse'
  );
  assert.equal(
    upstream?.recommendedCableAwg,
    '1/0',
    'cable feeding an oversized 200A fuse holder must be sized to the installed fuse, not just the load-driven design current'
  );
  const rec = analysis.legacy.protectionRecommendations.find((item) => item.connectionId === 'bat-to-holder');
  assert.equal(rec, undefined, 'no missing-protection recommendation should fire on a lead that already terminates at an installed fuse');
});

test('24V Medium RV resolves independent 12V and 24V DC domains through Orion converters', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.voltage === 24)?.system;
  assert.ok(preset, '24V Medium RV preset must exist');

  const analysis = analyzeSystemDesign(preset, PRODUCT_MAP);
  const dcVoltages = [...new Set(
    analysis.powerDomains
      .filter((domain) => (domain.busType === 'dc_pos' || domain.busType === 'dc_neg') && domain.voltageClassV != null)
      .map((domain) => domain.voltageClassV)
  )].sort((a, b) => a! - b!);

  assert.deepEqual(dcVoltages, [12, 24]);
  assert.equal(analysis.connections['rv24-alt-to-input-fuse']?.voltageV, 12);
  assert.equal(analysis.connections['rv24-alt-to-input-fuse']?.designCurrentA, 30);
  assert.equal(analysis.connections['rv24-dcdc-to-output-fuse']?.voltageV, 24);
  assert.equal(analysis.connections['rv24-dcdc-to-output-fuse']?.designCurrentA, 15);
  assert.equal(analysis.connections['rv24-pos-bus-to-converter']?.voltageV, 24);
  assert.equal(analysis.connections['rv24-pos-bus-to-converter']?.designCurrentA, 15);
  assert.equal(analysis.connections['rv24-converter-to-load-fuse']?.voltageV, 12);
  assert.equal(analysis.connections['rv24-converter-to-load-fuse']?.designCurrentA, 20);
  assert.ok(
    !analysis.warnings.some((warning) =>
      warning.code === 'VOLTAGE_MISMATCH' ||
      (warning.code === 'PORT_VOLTAGE_INCOMPATIBLE' && (warning.componentId === 'rv24-dcdc' || warning.componentId === 'rv24-converter'))
    ),
    analysis.warnings.filter((warning) => warning.code.includes('VOLTAGE')).map((warning) => warning.message).join('\n')
  );
});

test('Voltage validation uses connected port domains instead of the legacy primary default', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.voltage === 24)?.system;
  assert.ok(preset, '24V Medium RV preset must exist');

  const analysis = analyzeSystemDesign({ ...preset, nominalVoltage: 48 }, PRODUCT_MAP);
  assert.equal(analysis.connections['rv24-pos-bus-to-converter']?.voltageV, 24);
  assert.equal(analysis.connections['rv24-converter-to-load-fuse']?.voltageV, 12);
  assert.ok(!analysis.warnings.some((warning) => warning.code === 'PORT_VOLTAGE_INCOMPATIBLE'));
});

test('Voltage validation rejects a source outside a DC-DC input port range', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.voltage === 24)?.system;
  assert.ok(preset, '24V Medium RV preset must exist');
  const invalid: SystemDesign = {
    ...preset,
    components: preset.components.map((component) =>
      component.id === 'rv24-alternator' ? { ...component, instanceVoltageV: 48 } : component
    ),
  };

  const analysis = analyzeSystemDesign(invalid, PRODUCT_MAP);
  assert.ok(
    analysis.warnings.some((warning) => warning.code === 'PORT_VOLTAGE_INCOMPATIBLE' && warning.componentId === 'rv24-dcdc'),
    'the Orion 12V input must reject a connected 48V source domain'
  );
});

test('Catalog voltage filtering includes both sides of a multi-voltage converter', () => {
  const converter = PRODUCT_MAP.get('orion-tr-24-12-30-converter');
  assert.ok(converter);
  assert.equal(productMatchesVoltageFilter(converter, 12), true);
  assert.equal(productMatchesVoltageFilter(converter, 24), true);
  assert.equal(productMatchesVoltageFilter(converter, 48), false);
});

test('Regression: passive fuse holder does not propagate an unrelated inverter load into a DC-DC branch', () => {
  const preset = SYSTEM_PRESETS.find((item) => item.voltage === 24)?.system;
  assert.ok(preset, '24V Medium RV preset must exist');

  const system: SystemDesign = {
    ...preset,
    components: [
      ...preset.components,
      {
        id: 'converter-input-fuse',
        productId: 'holder-class-t-1pos',
        label: 'DC-DC Converter Input Fuse',
        quantity: 1,
        x: 100,
        y: 280,
        fuseSlots: { slot_1: { installed: true, ratingA: 35 } },
      },
    ],
    connections: [
      ...preset.connections.filter((connection) => connection.id !== 'rv24-pos-bus-to-converter'),
      {
        id: 'bus-to-converter-input-fuse',
        fromComponentId: 'rv24-pos-bus',
        fromTerminalId: 'terminal_5',
        toComponentId: 'converter-input-fuse',
        toTerminalId: 'in_pos',
        cableLengthFt: 2,
      },
      {
        id: 'converter-input-fuse-to-converter',
        fromComponentId: 'converter-input-fuse',
        fromTerminalId: 'out_pos',
        toComponentId: 'rv24-converter',
        toTerminalId: 'in_pos',
        cableLengthFt: 2,
      },
    ],
  };

  const analysis = analyzeSystemDesign(system, PRODUCT_MAP);
  const inverterBranch = analysis.connections['rv24-pos-bus-to-inv-fuse'];
  const fuseInput = analysis.connections['bus-to-converter-input-fuse'];
  const fuseOutput = analysis.connections['converter-input-fuse-to-converter'];

  assert.equal(inverterBranch?.designCurrentA, 130, 'the inverter branch should retain its own 130A design current');
  assert.equal(fuseOutput?.designCurrentA, 15, 'the 360W converter input should resolve to 15A on its 24V input domain');
  assert.equal(
    fuseInput?.designCurrentA,
    fuseOutput?.designCurrentA,
    'a passive fuse holder must carry the same branch current on both sides'
  );
  assert.ok(
    !fuseInput?.errors.some((error) => error.code === 'SELECTED_FUSE_UNDER_BRANCH_CURRENT'),
    'the 35A converter fuse must not be compared against the unrelated 130A inverter branch'
  );
});

// ---- summary ----------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\nFailures:\n  - ' + failures.join('\n  - '));
  process.exit(1);
}
