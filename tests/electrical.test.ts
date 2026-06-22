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
import { selectBestFuseProduct, getFuseRating } from '../src/utils/fuseSelection';
import { continuousFactorForBus, DEFAULT_ASSUMPTIONS } from '../src/data/electricalRules';
import { voltageDropV, cableByAwg } from '../src/data/cableAmpacity';
import { nextStandardFuse } from '../src/data/fuseRatings';
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

test('50A MPPT on a busbar: design 50A, fuse 70A, no busbar-rating leak', () => {
  const analysis = analyzeSystemCircuits(mpptOnBusbar(12, 4, 'dist-generic-busbar-5pt'), PRODUCT_MAP);
  const c = analysis.connections.get('mppt-p')!;
  assert.equal(c.designCurrentA, 50, 'MPPT output branch should carry its own 50A, not the busbar rating');
  assert.equal(c.recommendedFuseA, 70, '50A * 1.25 -> next standard fuse = 70A');
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

// ---- summary ----------------------------------------------------------------

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\nFailures:\n  - ' + failures.join('\n  - '));
  process.exit(1);
}
