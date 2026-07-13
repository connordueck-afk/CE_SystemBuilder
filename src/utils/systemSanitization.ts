import type { Product, SystemComponent, SystemDesign } from '../types/system';

type ProductLookup = Map<string, Product>;

const LEGACY_48V_AC_COMPONENTS = {
  inverter: ['comp-1782867470682-15', 'megarevo-12kw-hybrid-inverter'],
  grid: ['comp-1782867869646-470', 'generic-grid-source-240v'],
  generator: ['comp-1782867874813-497', 'generic-grid-source-240v'],
  load: ['comp-1782867890071-533', 'acc-ac-load-split-phase-240v'],
} as const;

const LEGACY_48V_AC_CONNECTION_TERMINALS: Record<string, {
  from?: readonly [legacy: string, current: string];
  to?: readonly [legacy: string, current: string];
}> = {
  'conn-1782867911464-570': { to: ['l2_in', 'l2_out'] },
  'conn-1782867913734-577': { to: ['l1_in', 'l1_out'] },
  'conn-1782867915172-584': { from: ['l1_in', 'l1_out'] },
  'conn-1782867917896-591': { to: ['l2_in', 'l2_out'] },
  'conn-1782867979043-742': { from: ['l2_out', 'l2_in'] },
  'conn-1782867980793-749': { to: ['l1_out', 'l1_in'] },
  'conn-1782867982316-756': { from: ['l2_out', 'l2_in'] },
  'conn-1782867983843-763': { to: ['l1_out', 'l1_in'] },
};

function migrateLegacy48VAcPreset(system: SystemDesign, products: ProductLookup): SystemDesign {
  if (system.nominalVoltage !== 48) return system;

  const componentById = new Map(system.components.map((component) => [component.id, component]));
  const hasLegacyPresetSignature = Object.values(LEGACY_48V_AC_COMPONENTS).every(([id, productId]) => (
    componentById.get(id)?.productId === productId
  ));
  if (!hasLegacyPresetSignature) return system;

  const components = system.components.map((component): SystemComponent => {
    let migrated = component;
    const product = products.get(component.productId);
    const isSplitPhase240V = product?.ports?.some((port) => (
      port.kind === 'ac' && port.nominalVoltageV === 240 && port.phases === 2
    ));
    if (isSplitPhase240V && component.instanceVoltageV === 120) {
      const { instanceVoltageV, ...withoutLegacyVoltage } = migrated;
      void instanceVoltageV;
      migrated = withoutLegacyVoltage;
    }

    if (component.id === LEGACY_48V_AC_COMPONENTS.grid[0] && component.label === 'Generator') {
      migrated = { ...migrated, label: 'Grid' };
    } else if (component.id === LEGACY_48V_AC_COMPONENTS.generator[0] && component.label === 'Grid') {
      migrated = { ...migrated, label: 'Generator' };
    }
    return migrated;
  });

  const connections = system.connections.map((connection) => {
    const migration = LEGACY_48V_AC_CONNECTION_TERMINALS[connection.id];
    if (!migration) return connection;
    return {
      ...connection,
      fromTerminalId: migration.from && connection.fromTerminalId === migration.from[0]
        ? migration.from[1]
        : connection.fromTerminalId,
      toTerminalId: migration.to && connection.toTerminalId === migration.to[0]
        ? migration.to[1]
        : connection.toTerminalId,
    };
  });

  return { ...system, components, connections };
}

function stripLegacySolarFields(component: SystemComponent): SystemComponent {
  const {
    solarWiringMode,
    solarSeriesCount,
    solarParallelCount,
    ...rest
  } = component;
  void solarWiringMode;
  void solarSeriesCount;
  void solarParallelCount;
  return rest;
}

function sanitizeSolarComponent(component: SystemComponent, products: ProductLookup): SystemComponent {
  const product = products.get(component.productId);
  if (!product) return component;

  if (product.productType === 'solar_array') {
    const { customSolarArrayRatings, ...withoutCustomRatings } = stripLegacySolarFields(component);
    void customSolarArrayRatings;
    return {
      ...withoutCustomRatings,
      quantity: 1,
    };
  }

  if (product.productType === 'custom_solar_array') {
    return {
      ...stripLegacySolarFields(component),
      quantity: 1,
    };
  }

  return component;
}

export function sanitizeSystemDesign(system: SystemDesign, products: ProductLookup): SystemDesign {
  return migrateLegacy48VAcPreset({
    ...system,
    components: system.components.map((component) => sanitizeSolarComponent(component, products)),
  }, products);
}
