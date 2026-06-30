import type { Product, SystemComponent, SystemDesign } from '../types/system';

type ProductLookup = Map<string, Product>;

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
  return {
    ...system,
    components: system.components.map((component) => sanitizeSolarComponent(component, products)),
  };
}
