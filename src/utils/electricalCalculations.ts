import type { SystemDesign, SystemComponent, SystemConnection, SystemWarning, Product, TerminalDefinition } from '../types/system';
import { nextStandardFuse } from '../data/fuseRatings';
import { cableForCurrent, cableByAwg, voltageDropV } from '../data/cableAmpacity';
import { CONTINUOUS_LOAD_FACTOR } from '../data/electricalRules';
import { validateSystemConnection } from './connectionRules';
import { findSolarArrayFeedingComponent } from './solarCalculations';
import { canProvidePower, inferTerminalDirection, terminalCurrentLimitA } from './terminalDirection';
import { buildBatteryInterconnectMap } from './batteryPackAnalysis';
import { analyzeSystemCircuits } from './circuitAnalysis';
import {
  buildElectricalNetlist,
  busTypeFromTerminal,
  busTypeRequiresFuse,
  isReturnOrGroundBus,
  type BusType,
} from './electricalNetlist';
import { resolveTerminalCurrentA } from './terminalElectrics';

const PASS_THROUGH_TYPES = new Set<string>(['fuse', 'breaker']);

export function estimateDcCurrent(powerW: number, voltageV: number): number {
  if (voltageV <= 0) return 0;
  return powerW / voltageV;
}

export function estimateInverterDcCurrent(
  acPowerW: number,
  batteryVoltageV: number,
  efficiency: number
): number {
  if (batteryVoltageV <= 0 || efficiency <= 0) return 0;
  return acPowerW / (batteryVoltageV * efficiency);
}

export function recommendedFuseA(continuousCurrentA: number): number {
  return nextStandardFuse(continuousCurrentA * CONTINUOUS_LOAD_FACTOR);
}

export function recommendedCableAwg(currentA: number): string {
  return cableForCurrent(currentA).awg;
}

export function calcVoltageDropPercent(
  currentA: number,
  lengthFt: number,
  awg: string,
  systemVoltageV: number
): number {
  if (systemVoltageV <= 0) return 0;
  const drop = voltageDropV(currentA, lengthFt, awg);
  return (drop / systemVoltageV) * 100;
}

export function enrichConnection(
  conn: SystemConnection,
  fromProduct: Product | undefined,
  toProduct: Product | undefined,
  systemVoltage: number,
  efficiency: number,
  fromTerminal?: TerminalDefinition,
  toTerminal?: TerminalDefinition,
  netBusType?: BusType
): SystemConnection {
  const fromCanProvide = fromTerminal ? canProvidePower(fromTerminal) : true;
  const toCanProvide = toTerminal ? canProvidePower(toTerminal) : false;
  const sourceProduct = toCanProvide && !fromCanProvide ? toProduct : fromProduct;
  const loadProduct = sourceProduct === fromProduct ? toProduct : fromProduct;
  const sourceTerminal = sourceProduct === fromProduct ? fromTerminal : toTerminal;

  const solarCurrentA = sourceProduct?.productType === 'solar_array'
    ? sourceProduct.maxPvCurrentA ?? sourceProduct.solarPanelRatings?.iscA ?? sourceProduct.solarPanelRatings?.impA
    : loadProduct?.productType === 'solar_array'
      ? loadProduct.maxPvCurrentA ?? loadProduct.solarPanelRatings?.iscA ?? loadProduct.solarPanelRatings?.impA
      : undefined;
  let currentA = solarCurrentA ?? conn.calculatedCurrentA;

  if (currentA == null) {
    // Terminal-first: prefer declared terminal current/power over product-type switches.
    if (sourceTerminal) {
      const declaredA = resolveTerminalCurrentA(sourceTerminal, systemVoltage);
      if (declaredA != null) currentA = declaredA;
    }

    // Derive from source product (skip pass-throughs - their maxCurrentA is a rating, not circuit current)
    if (currentA == null && sourceProduct?.productType === 'inverter_charger' && sourceProduct.continuousPowerW) {
      currentA = estimateInverterDcCurrent(sourceProduct.continuousPowerW, systemVoltage, efficiency);
    } else if (currentA == null && sourceProduct?.continuousPowerW) {
      currentA = estimateDcCurrent(sourceProduct.continuousPowerW, systemVoltage);
    } else if (currentA == null && sourceProduct?.maxCurrentA && !PASS_THROUGH_TYPES.has(sourceProduct.productType)) {
      currentA = sourceProduct.maxCurrentA;
    }

    // Fallback: derive from consuming product when source is a pass-through or has no power specs.
    // Check load-side terminal declarations before falling back to product-type switches.
    if (!currentA) {
      const loadTerminal = sourceProduct === fromProduct ? toTerminal : fromTerminal;
      if (loadTerminal) {
        const declaredA = resolveTerminalCurrentA(loadTerminal, systemVoltage);
        if (declaredA != null) currentA = declaredA;
      }
    }
    if (!currentA && loadProduct) {
      if (loadProduct.productType === 'inverter_charger' && loadProduct.continuousPowerW) {
        currentA = estimateInverterDcCurrent(loadProduct.continuousPowerW, systemVoltage, efficiency);
      } else if (loadProduct.continuousPowerW) {
        currentA = estimateDcCurrent(loadProduct.continuousPowerW, systemVoltage);
      } else if (loadProduct.maxCurrentA && !PASS_THROUGH_TYPES.has(loadProduct.productType)) {
        currentA = loadProduct.maxCurrentA;
      }
    }

    currentA = currentA ?? 0;
  }

  const sourceLimitA = sourceProduct && sourceTerminal && inferTerminalDirection(sourceTerminal) === 'output'
    ? terminalCurrentLimitA(sourceProduct, sourceTerminal)
    : undefined;
  const limitedCurrentA = sourceLimitA != null ? Math.min(currentA, sourceLimitA) : currentA;
  const fromBusType = fromTerminal ? busTypeFromTerminal(fromTerminal) : 'unknown';
  const toBusType = toTerminal ? busTypeFromTerminal(toTerminal) : 'unknown';
  const busType = netBusType ?? (fromBusType !== 'unknown' ? fromBusType : toBusType);
  const fuseRequired = busTypeRequiresFuse(busType);

  const fuseA = fuseRequired ? conn.recommendedFuseA ?? recommendedFuseA(limitedCurrentA) : undefined;
  const cableSizingCurrentA = fuseA ?? limitedCurrentA * CONTINUOUS_LOAD_FACTOR;
  const recommendedAwg = recommendedCableAwg(cableSizingCurrentA);
  const awg = conn.manualCableAwg && cableByAwg(conn.manualCableAwg)
    ? conn.manualCableAwg
    : recommendedAwg;
  const dropPct = calcVoltageDropPercent(limitedCurrentA, conn.cableLengthFt, awg, systemVoltage);
  const dropV = voltageDropV(limitedCurrentA, conn.cableLengthFt, awg);

  const warnings: string[] = [];
  if (dropPct > 3) {
    warnings.push(`Voltage drop ${dropPct.toFixed(1)}% exceeds 3% limit - consider larger cable or shorter run`);
  }
  if (sourceLimitA != null && currentA > sourceLimitA) {
    warnings.push(`Output limited to ${sourceLimitA}A by ${sourceProduct?.protectionRatings?.protectionType ?? 'device'} rating`);
  }

  return {
    ...conn,
    calculatedCurrentA: limitedCurrentA,
    recommendedFuseA: fuseA,
    recommendedCableAwg: awg,
    voltageDropV: parseFloat(dropV.toFixed(3)),
    voltageDropPercent: parseFloat(dropPct.toFixed(2)),
    warnings,
  };
}

export function enrichConnectionLegacy(
  conn: SystemConnection,
  fromProduct: Product | undefined,
  toProduct: Product | undefined,
  systemVoltage: number,
  efficiency: number
): SystemConnection {
  const solarCurrentA = fromProduct?.productType === 'solar_array'
    ? fromProduct.maxPvCurrentA ?? fromProduct.solarPanelRatings?.iscA ?? fromProduct.solarPanelRatings?.impA
    : toProduct?.productType === 'solar_array'
      ? toProduct.maxPvCurrentA ?? toProduct.solarPanelRatings?.iscA ?? toProduct.solarPanelRatings?.impA
      : undefined;
  let currentA = solarCurrentA ?? conn.calculatedCurrentA;

  if (currentA == null) {
    // Derive from source product (skip pass-throughs — their maxCurrentA is a rating, not circuit current)
    if (currentA == null && fromProduct?.productType === 'inverter_charger' && fromProduct.continuousPowerW) {
      currentA = estimateInverterDcCurrent(fromProduct.continuousPowerW, systemVoltage, efficiency);
    } else if (currentA == null && fromProduct?.continuousPowerW) {
      currentA = estimateDcCurrent(fromProduct.continuousPowerW, systemVoltage);
    } else if (currentA == null && fromProduct?.maxCurrentA && !PASS_THROUGH_TYPES.has(fromProduct.productType)) {
      currentA = fromProduct.maxCurrentA;
    }

    // Fallback: derive from consuming product when source is a pass-through or has no power specs
    if (!currentA && toProduct) {
      if (toProduct.productType === 'inverter_charger' && toProduct.continuousPowerW) {
        currentA = estimateInverterDcCurrent(toProduct.continuousPowerW, systemVoltage, efficiency);
      } else if (toProduct.continuousPowerW) {
        currentA = estimateDcCurrent(toProduct.continuousPowerW, systemVoltage);
      } else if (toProduct.maxCurrentA && !PASS_THROUGH_TYPES.has(toProduct.productType)) {
        currentA = toProduct.maxCurrentA;
      }
    }

    currentA = currentA ?? 0;
  }

  const fuseA = conn.recommendedFuseA ?? recommendedFuseA(currentA);
  const recommendedAwg = recommendedCableAwg(fuseA);
  const awg = conn.manualCableAwg && cableByAwg(conn.manualCableAwg)
    ? conn.manualCableAwg
    : recommendedAwg;
  const dropPct = calcVoltageDropPercent(currentA, conn.cableLengthFt, awg, systemVoltage);
  const dropV = voltageDropV(currentA, conn.cableLengthFt, awg);

  const warnings: string[] = [];
  if (dropPct > 3) {
    warnings.push(`Voltage drop ${dropPct.toFixed(1)}% exceeds 3% limit — consider larger cable or shorter run`);
  }

  return {
    ...conn,
    calculatedCurrentA: currentA,
    recommendedFuseA: fuseA,
    recommendedCableAwg: awg,
    voltageDropV: parseFloat(dropV.toFixed(3)),
    voltageDropPercent: parseFloat(dropPct.toFixed(2)),
    warnings,
  };
}

export function generateWarnings(
  system: SystemDesign,
  products: Map<string, Product>
): SystemWarning[] {
  const warnings: SystemWarning[] = [];
  let warnId = 0;

  const warn = (
    severity: SystemWarning['severity'],
    message: string,
    code: string,
    componentId?: string,
    connectionId?: string
  ) => {
    warnings.push({ id: `w-${++warnId}`, severity, message, code, componentId, connectionId });
  };

  const connectedTerminals = new Set<string>();
  for (const conn of system.connections) {
    connectedTerminals.add(`${conn.fromComponentId}:${conn.fromTerminalId}`);
    connectedTerminals.add(`${conn.toComponentId}:${conn.toTerminalId}`);
  }

  const netlist = buildElectricalNetlist(system, products);
  const circuitAnalysis = analyzeSystemCircuits(system, products);
  const batteryInterconnects = buildBatteryInterconnectMap(system, products);
  for (const conflict of netlist.conflicts) {
    warn('error', conflict, 'BUS_TYPE_CONFLICT');
  }

  for (const interconnect of batteryInterconnects.values()) {
    if (!interconnect.isSameProduct || !interconnect.isSameNominalVoltage) {
      warn(
        'warning',
        'Battery pack interconnect joins batteries that are not the same product and nominal voltage; review parallel-pack compatibility',
        'BATTERY_PACK_MISMATCH',
        undefined,
        interconnect.connectionId
      );
      continue;
    }

    if (!interconnect.isShortPackInterconnect) {
      warn(
        'warning',
        `Battery pack interconnect is ${interconnect.cableLengthFt.toFixed(1)} ft; V1 assumes unfused battery interconnects are ${interconnect.maxLengthFt} ft or shorter`,
        'BATTERY_INTERCONNECT_LONG',
        undefined,
        interconnect.connectionId
      );
    }
  }

  for (const net of netlist.nets) {
    if (net.busType === 'unknown') continue;

    const protectionLimitA = net.availableCurrentA;
    if (protectionLimitA != null && net.operatingCurrentA > protectionLimitA) {
      warn(
        'error',
        `${net.id} load is ${net.operatingCurrentA.toFixed(0)}A but available protected current is ${protectionLimitA.toFixed(0)}A`,
        'NET_OVER_PROTECTION_LIMIT'
      );
    }

    // Missing protection is evaluated per conductor in circuitAnalysis. A whole net can contain
    // multiple feeder and branch conductors with different protection requirements.
  }

  for (const connection of system.connections) {
    const context = circuitAnalysis.connections.get(connection.id);
    if (!context || !context.protectionRequired || context.designCurrentA <= 0 || context.protectedBy.length > 0) continue;
    warn(
      'warning',
      `Connection carries ${context.designCurrentA.toFixed(0)}A on ${context.busType.replace('_', ' ')} without local fuse or breaker protection`,
      'CONNECTION_MISSING_PROTECTION',
      undefined,
      connection.id
    );
  }

  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product) {
      warn('warning', `Component "${comp.label ?? comp.id}" references unknown product "${comp.productId}"`, 'UNKNOWN_PRODUCT', comp.id);
      continue;
    }

    if (product.msrpUsd == null && product.oemPriceUsd == null) {
      warn('info', `"${product.name}" has no price data`, 'MISSING_PRICE', comp.id);
    }

    const hasAnyConnection = system.connections.some(
      (c) => c.fromComponentId === comp.id || c.toComponentId === comp.id
    );

    if (!hasAnyConnection && !['monitor', 'accessory'].includes(product.productType)) {
      warn('warning', `"${comp.label ?? product.name}" is not connected to anything`, 'UNCONNECTED', comp.id);
    }

    if (product.nominalVoltage != null) {
      const volts = Array.isArray(product.nominalVoltage)
        ? product.nominalVoltage
        : [product.nominalVoltage];
      if (!volts.includes(system.nominalVoltage)) {
        warn(
          'error',
          `"${product.name}" is rated for ${volts.join('/')} V but system is ${system.nominalVoltage} V`,
          'VOLTAGE_MISMATCH',
          comp.id
        );
      }
    }
  }

  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product || product.productType !== 'mppt' || !product.mpptRatings) continue;

    const solarArray = findSolarArrayFeedingComponent(comp.id, system.components, system.connections, products);
    const solarStats = solarArray.stats;
    if (!solarStats) continue;

    for (const mismatch of solarArray.mismatches) {
      warn(
        'error',
        `Parallel solar strings must have matching Voc: "${mismatch.leftLabel}" is ${mismatch.leftVocV.toFixed(1)}V, "${mismatch.rightLabel}" is ${mismatch.rightVocV.toFixed(1)}V`,
        'SOLAR_PARALLEL_VOC_MISMATCH',
        comp.id
      );
    }

    const mppt = product.mpptRatings;
    if (solarStats.vocV > mppt.maxPvVoltageV) {
      warn(
        'error',
        `"${comp.label ?? product.name}" PV input over-voltage: array Voc ${solarStats.vocV.toFixed(1)}V exceeds ${mppt.maxPvVoltageV}V limit`,
        'MPPT_PV_VOLTAGE_EXCEEDED',
        comp.id
      );
    } else if (solarStats.vocV > mppt.maxPvVoltageV * 0.9) {
      warn(
        'warning',
        `"${comp.label ?? product.name}" PV input is close to voltage limit: array Voc ${solarStats.vocV.toFixed(1)}V of ${mppt.maxPvVoltageV}V`,
        'MPPT_PV_VOLTAGE_MARGIN',
        comp.id
      );
    }

    const arrayIscA = solarStats.iscA ?? solarStats.impA;
    if (arrayIscA != null && arrayIscA > mppt.maxPvCurrentA) {
      warn(
        'error',
        `"${comp.label ?? product.name}" PV input over-current: array Isc ${arrayIscA.toFixed(1)}A exceeds ${mppt.maxPvCurrentA}A limit`,
        'MPPT_PV_CURRENT_EXCEEDED',
        comp.id
      );
    }

    if (mppt.maxPvPowerW != null && solarStats.powerW > mppt.maxPvPowerW) {
      warn(
        'warning',
        `"${comp.label ?? product.name}" is over-paneled: array ${solarStats.powerW.toFixed(0)}W exceeds ${mppt.maxPvPowerW}W nominal PV rating`,
        'MPPT_PV_POWER_EXCEEDED',
        comp.id
      );
    }
  }

  // Fuse and breaker rating validation
  for (const comp of system.components) {
    const product = products.get(comp.productId);
    if (!product || !PASS_THROUGH_TYPES.has(product.productType)) continue;
    const fuseRatingA = product.maxCurrentA;
    if (!fuseRatingA) continue;

    const fuseBusTypes = new Set(
      system.connections
        .filter((c) => c.fromComponentId === comp.id || c.toComponentId === comp.id)
        .map((c) => netlist.connectionContexts.get(c.id)?.busType)
        .filter((busType): busType is BusType => Boolean(busType))
    );
    if ([...fuseBusTypes].some(isReturnOrGroundBus)) {
      warn(
        'info',
        `"${comp.label ?? product.name}" is on a return/ground bus; ${[...fuseBusTypes].join('/')} conductors normally do not need fuse protection`,
        'UNNEEDED_RETURN_BUS_PROTECTION',
        comp.id
      );
    }

    const adjConns = system.connections.filter(
      (c) => c.fromComponentId === comp.id || c.toComponentId === comp.id
    );
    if (adjConns.length === 0) continue;

    // Under-rated: fuse will nuisance-trip under continuous load
    const knownCurrentConns = adjConns.filter((c) => (c.calculatedCurrentA ?? 0) > 0);
    if (knownCurrentConns.length > 0) {
      const throughCurrentA = Math.max(...knownCurrentConns.map((c) => c.calculatedCurrentA!));
      const minRequired = nextStandardFuse(throughCurrentA * CONTINUOUS_LOAD_FACTOR);
      if (fuseRatingA < throughCurrentA * CONTINUOUS_LOAD_FACTOR) {
        warn(
          'error',
          `"${comp.label ?? product.name}" is under-rated: ${fuseRatingA}A fuse for ${throughCurrentA.toFixed(0)}A continuous load — minimum ${minRequired}A required`,
          'FUSE_UNDER_RATED',
          comp.id
        );
      }
    }

    // Over-rated: fuse exceeds cable ampacity — cable may burn before fuse blows
    const awgs = adjConns.map((c) => c.recommendedCableAwg).filter(Boolean) as string[];
    if (awgs.length > 0) {
      const minAmpacity = Math.min(...awgs.map((awg) => cableByAwg(awg)?.ampacity ?? Infinity));
      if (minAmpacity < Infinity && fuseRatingA > minAmpacity) {
        const worstAwg = awgs.find((awg) => (cableByAwg(awg)?.ampacity ?? Infinity) === minAmpacity)!;
        warn(
          'error',
          `"${comp.label ?? product.name}" is over-rated: ${fuseRatingA}A fuse exceeds ${worstAwg} AWG cable ampacity of ${minAmpacity}A — cable may burn before fuse blows`,
          'FUSE_OVER_RATED',
          comp.id
        );
      }
    }
  }

  for (const conn of system.connections) {
    const validation = validateSystemConnection(conn, system.components, products);
    if (!validation.valid) {
      warn(
        'error',
        `Invalid connection: ${validation.message ?? 'These terminals are not compatible.'}`,
        'INVALID_CONNECTION',
        undefined,
        conn.id
      );
    }

    if ((conn.voltageDropPercent ?? 0) > system.assumptions.maxVoltageDropPercent) {
      warn(
        'warning',
        `Connection has ${conn.voltageDropPercent?.toFixed(1)}% voltage drop (limit: ${system.assumptions.maxVoltageDropPercent}%)`,
        'HIGH_VOLTAGE_DROP',
        undefined,
        conn.id
      );
    }

    for (const connectionWarning of conn.warnings ?? []) {
      if (connectionWarning.toLowerCase().includes('voltage drop')) continue;
      warn('warning', connectionWarning, 'CONNECTION_SIZING_WARNING', undefined, conn.id);
    }
  }

  return warnings;
}
