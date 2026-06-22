export interface CableSpec {
  awg: string;
  /**
   * Ampacity (A) basis: ABYC E-11, 105 C insulation, conductor OUTSIDE an engine
   * room, not bundled (single pair). These are the values appropriate for the
   * mobile/marine off-grid context this tool targets, and they run higher than
   * NEC 60/75 C building-wiring values (e.g. 8 AWG = 73 A here vs ~50 A at 75 C).
   * If a build needs engine-room or bundled derating, size conservatively or
   * apply the relevant ABYC correction factor — this table does not derate.
   */
  ampacity: number;
  /** DC resistance, ohms per foot (one-way), copper at ~25 C. */
  resistanceOhmPerFt: number;
  label: string;
}

// Source: ABYC E-11 Table (105 C, outside engine space, not bundled).
export const CABLE_TABLE: CableSpec[] = [
  { awg: '18', ampacity: 16,  resistanceOhmPerFt: 0.00638,  label: '18 AWG' },
  { awg: '16', ampacity: 22,  resistanceOhmPerFt: 0.004016, label: '16 AWG' },
  { awg: '14', ampacity: 32,  resistanceOhmPerFt: 0.002525, label: '14 AWG' },
  { awg: '12', ampacity: 41,  resistanceOhmPerFt: 0.001588, label: '12 AWG' },
  { awg: '10', ampacity: 55,  resistanceOhmPerFt: 0.000999, label: '10 AWG' },
  { awg: '8',  ampacity: 73,  resistanceOhmPerFt: 0.000629, label: '8 AWG'  },
  { awg: '6',  ampacity: 95,  resistanceOhmPerFt: 0.000395, label: '6 AWG'  },
  { awg: '4',  ampacity: 125, resistanceOhmPerFt: 0.000249, label: '4 AWG'  },
  { awg: '2',  ampacity: 170, resistanceOhmPerFt: 0.000157, label: '2 AWG'  },
  { awg: '1',  ampacity: 195, resistanceOhmPerFt: 0.000124, label: '1 AWG'  },
  { awg: '1/0',ampacity: 230, resistanceOhmPerFt: 0.0000983,label: '1/0 AWG'},
  { awg: '2/0',ampacity: 265, resistanceOhmPerFt: 0.0000779,label: '2/0 AWG'},
  { awg: '4/0',ampacity: 360, resistanceOhmPerFt: 0.0000490,label: '4/0 AWG'},
];

export function cableForCurrent(currentA: number): CableSpec {
  return (
    CABLE_TABLE.find((c) => c.ampacity >= currentA) ??
    CABLE_TABLE[CABLE_TABLE.length - 1]
  );
}

export function cableByAwg(awg: string): CableSpec | undefined {
  return CABLE_TABLE.find((c) => c.awg === awg);
}

export function voltageDropV(
  currentA: number,
  lengthFt: number,
  awg: string
): number {
  const spec = CABLE_TABLE.find((c) => c.awg === awg);
  if (!spec) return 0;
  return 2 * currentA * spec.resistanceOhmPerFt * lengthFt;
}
