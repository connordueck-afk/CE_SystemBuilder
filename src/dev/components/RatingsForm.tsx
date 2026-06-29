import type {
  Product, ProductType,
  BatteryRatings, MpptRatings, InverterChargerRatings,
  DcDcChargerRatings, ProtectionRatings, BusbarRatings,
} from '../../types/system';
import { CollapsibleSection } from './CollapsibleSection';

interface Props {
  productType: ProductType | undefined;
  product: Partial<Product>;
  onRatingsChange: (ratingsKey: string, field: string, value: unknown) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Num({
  label, value, onChange, placeholder, min, step,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  min?: number;
  step?: number;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value ?? ''}
        placeholder={placeholder}
        min={min}
        step={step ?? 1}
        onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
    </Field>
  );
}

// ---- Battery ----

function BatteryForm({ ratings, onChange }: {
  ratings: Partial<BatteryRatings>;
  onChange: (field: string, v: unknown) => void;
}) {
  const n = (field: keyof BatteryRatings) =>
    (v: number | undefined) => onChange(field, v);

  return (
    <>
      <div className="pb-field-row">
        <Num label="Nominal Voltage (V)" value={ratings.nominalVoltageV} onChange={n('nominalVoltageV')} />
        <Num label="Capacity (Ah)" value={ratings.capacityAh} onChange={n('capacityAh')} />
      </div>
      <div className="pb-field-row">
        <Num label="Capacity (Wh)" value={ratings.capacityWh} onChange={n('capacityWh')} />
        <Num label="Capacity (kWh)" value={ratings.capacityKwh} onChange={n('capacityKwh')} step={0.01} />
      </div>
      <div className="pb-field-row">
        <Num label="Max Charge Current (A)" value={ratings.maxChargeCurrentA} onChange={n('maxChargeCurrentA')} />
        <Num label="Max Discharge Current (A)" value={ratings.maxDischargeCurrentA} onChange={n('maxDischargeCurrentA')} />
      </div>
      <div className="pb-field-row">
        <Num label="Peak Discharge Current (A)" value={ratings.peakDischargeCurrentA} onChange={n('peakDischargeCurrentA')} />
        <Num label="Charge Voltage (V)" value={ratings.chargeVoltageV} onChange={n('chargeVoltageV')} step={0.1} />
      </div>
      <div className="pb-field-row">
        <Num label="Cutoff Voltage (V)" value={ratings.cutoffVoltageV} onChange={n('cutoffVoltageV')} step={0.1} />
        <Field label="Chemistry">
          <input
            type="text"
            value={ratings.chemistry ?? ''}
            onChange={e => onChange('chemistry', e.target.value)}
            placeholder="LiFePO4"
          />
        </Field>
      </div>
      <div className="pb-field-row">
        <div className="pb-checkbox-row">
          <input
            id="r_internalBms"
            type="checkbox"
            checked={ratings.hasInternalBms ?? false}
            onChange={e => onChange('hasInternalBms', e.target.checked)}
          />
          <label htmlFor="r_internalBms">Internal BMS</label>
        </div>
        <div className="pb-checkbox-row">
          <input
            id="r_series"
            type="checkbox"
            checked={ratings.seriesAllowed ?? false}
            onChange={e => onChange('seriesAllowed', e.target.checked)}
          />
          <label htmlFor="r_series">Series Allowed</label>
        </div>
        <div className="pb-checkbox-row">
          <input
            id="r_parallel"
            type="checkbox"
            checked={ratings.parallelAllowed ?? false}
            onChange={e => onChange('parallelAllowed', e.target.checked)}
          />
          <label htmlFor="r_parallel">Parallel Allowed</label>
        </div>
      </div>
    </>
  );
}

// ---- MPPT ----

function MpptForm({ ratings, onChange }: {
  ratings: Partial<MpptRatings>;
  onChange: (field: string, v: unknown) => void;
}) {
  const n = (field: keyof MpptRatings) =>
    (v: number | undefined) => onChange(field, v);

  return (
    <>
      <div className="pb-field-row">
        <Num label="Max PV Voltage (V)" value={ratings.maxPvVoltageV} onChange={n('maxPvVoltageV')} />
        <Num label="Max PV Current (A)" value={ratings.maxPvCurrentA} onChange={n('maxPvCurrentA')} />
      </div>
      <div className="pb-field-row">
        <Num label="Max Output Current (A)" value={ratings.maxOutputCurrentA} onChange={n('maxOutputCurrentA')} />
        <Num label="Max PV Power (W)" value={ratings.maxPvPowerW} onChange={n('maxPvPowerW')} />
      </div>
      <div className="pb-field-row">
        <Num label="Efficiency (%)" value={ratings.efficiencyPct} onChange={n('efficiencyPct')} step={0.1} />
        <Field label="Battery Voltages (e.g. 12,24,48)">
          <input
            type="text"
            value={(ratings.batteryVoltagesV ?? []).join(',')}
            onChange={e => onChange('batteryVoltagesV', e.target.value.split(',').map(Number).filter(Boolean))}
          />
        </Field>
      </div>
    </>
  );
}

// ---- Inverter / Charger ----

function InverterChargerForm({ ratings, onChange }: {
  ratings: Partial<InverterChargerRatings>;
  onChange: (field: string, v: unknown) => void;
}) {
  const n = (field: keyof InverterChargerRatings) =>
    (v: number | undefined) => onChange(field, v);

  return (
    <>
      <div className="pb-field-row">
        <Num label="DC Voltage (V)" value={ratings.dcVoltageV} onChange={n('dcVoltageV')} />
        <Num label="Continuous Inverter (W)" value={ratings.continuousInverterW} onChange={n('continuousInverterW')} />
      </div>
      <div className="pb-field-row">
        <Num label="Surge (W)" value={ratings.surgeW} onChange={n('surgeW')} />
        <Num label="Charger Current (A)" value={ratings.chargerCurrentA} onChange={n('chargerCurrentA')} />
      </div>
      <div className="pb-field-row">
        <Num label="AC Input Voltage (V)" value={ratings.acInputVoltageV} onChange={n('acInputVoltageV')} />
        <Num label="AC Input Current (A)" value={ratings.acInputCurrentA} onChange={n('acInputCurrentA')} />
      </div>
      <div className="pb-field-row">
        <Num label="AC Output Voltage (V)" value={ratings.acOutputVoltageV} onChange={n('acOutputVoltageV')} />
        <Num label="AC Output Current (A)" value={ratings.acOutputCurrentA} onChange={n('acOutputCurrentA')} />
      </div>
      <div className="pb-field-row">
        <Num label="Transfer Switch (A)" value={ratings.transferSwitchA} onChange={n('transferSwitchA')} />
        <Num label="Efficiency (%)" value={ratings.efficiencyPct} onChange={n('efficiencyPct')} step={0.1} />
      </div>
    </>
  );
}

// ---- DC-DC Charger ----

function DcDcForm({ ratings, onChange }: {
  ratings: Partial<DcDcChargerRatings>;
  onChange: (field: string, v: unknown) => void;
}) {
  const n = (field: keyof DcDcChargerRatings) =>
    (v: number | undefined) => onChange(field, v);

  return (
    <>
      <div className="pb-field-row">
        <Num label="Input Voltage Min (V)" value={ratings.inputVoltageMinV} onChange={n('inputVoltageMinV')} />
        <Num label="Input Voltage Max (V)" value={ratings.inputVoltageMaxV} onChange={n('inputVoltageMaxV')} />
      </div>
      <div className="pb-field-row">
        <Num label="Output Voltage (V)" value={ratings.outputVoltageV} onChange={n('outputVoltageV')} />
        <Num label="Output Current (A)" value={ratings.outputCurrentA} onChange={n('outputCurrentA')} />
      </div>
      <div className="pb-field-row">
        <Num label="Output Power (W)" value={ratings.outputPowerW} onChange={n('outputPowerW')} />
        <div className="pb-checkbox-row" style={{ marginTop: 18 }}>
          <input
            id="r_isolated"
            type="checkbox"
            checked={ratings.isolated ?? false}
            onChange={e => onChange('isolated', e.target.checked)}
          />
          <label htmlFor="r_isolated">Galvanic Isolation</label>
        </div>
      </div>
    </>
  );
}

// ---- Protection ----

function ProtectionForm({ ratings, onChange }: {
  ratings: Partial<ProtectionRatings>;
  onChange: (field: string, v: unknown) => void;
}) {
  const n = (field: keyof ProtectionRatings) =>
    (v: number | undefined) => onChange(field, v);

  return (
    <>
      <div className="pb-field-row">
        <Num label="Current Rating (A) *" value={ratings.currentRatingA} onChange={n('currentRatingA')} />
        <Num label="Voltage Rating (V)" value={ratings.voltageRatingV} onChange={n('voltageRatingV')} />
      </div>
      <div className="pb-field-row">
        <Num label="Interrupt Rating (A)" value={ratings.interruptRatingA} onChange={n('interruptRatingA')} />
        <div className="pb-field">
          <label>AC/DC Compatibility</label>
          <select
            value={ratings.acDcCompatibility ?? ''}
            onChange={e => onChange('acDcCompatibility', e.target.value || undefined)}
          >
            <option value="">—</option>
            <option value="dc">DC</option>
            <option value="ac">AC</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>
      <div className="pb-field-row">
        <div className="pb-field">
          <label>Fuse Style</label>
          <input
            type="text"
            value={ratings.fuseStyle ?? ''}
            onChange={e => onChange('fuseStyle', e.target.value || undefined)}
            placeholder="ANL, MIDI, MEGA…"
          />
        </div>
        <div className="pb-field">
          <label>Protection Type</label>
          <select
            value={ratings.protectionType ?? ''}
            onChange={e => onChange('protectionType', e.target.value || undefined)}
          >
            <option value="">—</option>
            <option value="fuse">Fuse</option>
            <option value="breaker">Breaker</option>
          </select>
        </div>
      </div>
    </>
  );
}

// ---- Busbar ----

function BusbarForm({ ratings, onChange }: {
  ratings: Partial<BusbarRatings>;
  onChange: (field: string, v: unknown) => void;
}) {
  const n = (field: keyof BusbarRatings) =>
    (v: number | undefined) => onChange(field, v);

  return (
    <>
      <div className="pb-field-row">
        <Num label="Voltage Rating (V)" value={ratings.voltageRatingV} onChange={n('voltageRatingV')} />
        <Num label="Current Rating (A)" value={ratings.currentRatingA} onChange={n('currentRatingA')} />
      </div>
      <div className="pb-field-row">
        <Num label="Connection Count" value={ratings.connectionCount} onChange={n('connectionCount')} />
        <div className="pb-field">
          <label>Bus Designation</label>
          <select
            value={ratings.busDesignation ?? ''}
            onChange={e => onChange('busDesignation', e.target.value || undefined)}
          >
            <option value="">—</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="combined">Combined</option>
          </select>
        </div>
      </div>
    </>
  );
}

// ---- Root ----

const RATINGS_LABELS: Partial<Record<ProductType, string>> = {
  battery: 'Battery Ratings',
  mppt: 'MPPT Ratings',
  inverter_charger: 'Inverter / Charger Ratings',
  dc_dc_charger: 'DC-DC Charger Ratings',
  shore_charger: 'Shore Charger Ratings',
  fuse: 'Protection Ratings',
  breaker: 'Protection Ratings',
  busbar: 'Busbar Ratings',
  dc_distribution: 'Distribution Ratings',
};

export function RatingsForm({ productType, product, onRatingsChange }: Props) {
  if (!productType || !RATINGS_LABELS[productType]) return null;

  const label = RATINGS_LABELS[productType]!;
  const ch = (field: string) => (v: unknown) => onRatingsChange(
    productType === 'battery' ? 'batteryRatings'
    : productType === 'mppt' ? 'mpptRatings'
    : productType === 'inverter_charger' ? 'inverterChargerRatings'
    : productType === 'dc_dc_charger' || productType === 'shore_charger' ? 'dcDcChargerRatings'
    : productType === 'fuse' || productType === 'breaker' ? 'protectionRatings'
    : 'busbarRatings',
    field, v
  );

  const r = (key: string) => (product as Record<string, unknown>)[key] as Record<string, unknown> ?? {};

  return (
    <CollapsibleSection title={label}>
        {productType === 'battery' && (
          <BatteryForm
            ratings={r('batteryRatings') as Partial<BatteryRatings>}
            onChange={(f, v) => onRatingsChange('batteryRatings', f, v)}
          />
        )}
        {productType === 'mppt' && (
          <MpptForm
            ratings={r('mpptRatings') as Partial<MpptRatings>}
            onChange={(f, v) => onRatingsChange('mpptRatings', f, v)}
          />
        )}
        {productType === 'inverter_charger' && (
          <InverterChargerForm
            ratings={r('inverterChargerRatings') as Partial<InverterChargerRatings>}
            onChange={(f, v) => onRatingsChange('inverterChargerRatings', f, v)}
          />
        )}
        {(productType === 'dc_dc_charger' || productType === 'shore_charger') && (
          <DcDcForm
            ratings={r('dcDcChargerRatings') as Partial<DcDcChargerRatings>}
            onChange={(f, v) => onRatingsChange('dcDcChargerRatings', f, v)}
          />
        )}
        {(productType === 'fuse' || productType === 'breaker') && (
          <ProtectionForm
            ratings={r('protectionRatings') as Partial<ProtectionRatings>}
            onChange={(f, v) => onRatingsChange('protectionRatings', f, v)}
          />
        )}
        {(productType === 'busbar' || productType === 'dc_distribution') && (
          <BusbarForm
            ratings={r('busbarRatings') as Partial<BusbarRatings>}
            onChange={(f, v) => onRatingsChange('busbarRatings', f, v)}
          />
        )}
    </CollapsibleSection>
  );
}
