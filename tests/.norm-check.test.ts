import { ALL_PRODUCTS } from '../src/data/products';
import { DEFAULT_SYSTEM } from '../src/data/defaultSystem';
import { generateWarnings } from '../src/utils/electricalCalculations';
import { validateCatalog } from '../src/data/products/helpers/validation';
import { getEffectiveTerminals } from '../src/utils/effectiveTerminals';
import helios from '../src/data/products/catalog/batteries/discover-helios-ess-52-48-16000';

const v = validateCatalog(ALL_PRODUCTS);
console.log(`catalog: valid=${v.valid} errors=${v.errorCount}`);

const PRODUCT_MAP = new Map(ALL_PRODUCTS.map(p => [p.id, p]));
const warns = generateWarnings(DEFAULT_SYSTEM, PRODUCT_MAP);
console.log(`DEFAULT_SYSTEM errors=${warns.filter(w => w.severity === 'error').length}`);
for (const w of warns.filter(w => w.severity === 'error')) console.log(`  ${w.code}`);

console.log('Helios effective terminals (polarity stamped from group):');
const ets = getEffectiveTerminals(helios, { id: 'x', productId: helios.id, quantity: 1, x: 0, y: 0 } as any).filter(t => t.portId === 'main');
for (const t of ets) console.log(`  ${t.id}: polarity=${t.polarity} reqOCP=${t.requiresOvercurrentProtection ?? false}`);
