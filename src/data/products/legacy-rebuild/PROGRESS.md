# Legacy rebuild progress

This document records restart points so work can resume if usage limits interrupt
the session.

## Rules

- Rebuild legacy products in sorted path order.
- Keep rebuilt files in `src/data/products/legacy-rebuild/`.
- Do not add this folder to the active catalog loader.
- Validate each rebuilt file before advancing.

## Completed

- `src/data/products/legacy-rebuild/ac-chargers/blue-smart-ip22-15.ts`
  - Validation: `npm.cmd run typecheck`
  - Validation: `npm.cmd test`
  - Validation: `npm.cmd run build`
- `src/data/products/legacy-rebuild/ac-chargers/blue-smart-ip22-24-16.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/ac-chargers/blue-smart-ip22-30.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/ac-chargers/blue-smart-ip65-12-15.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/ac-chargers/skylla-ip65-24-70.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/ac-dc-breaker-kit.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/battery-cable-kit.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/cables-materials-kit.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/generic-ac-panel.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/generic-agm-battery.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/generic-battery-bank.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/generic-bms.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/generic-mc4-connector.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/generic-pv-disconnect.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/generic-pwm-controller.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/high-current-fuse-kit.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/mk3-usb.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/mon-vic-bmv-712.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/mon-vic-cerbo-gx.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/temperature-sensor-quattro.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/ve-bus-smart-dongle.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/vedirect-cable-3m.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/accessories/vedirect-usb.ts`
  - Validation: `npm.cmd run typecheck`
- Communication batch:
  - `src/data/products/legacy-rebuild/communication/comm-rj45-coupler.ts`
  - `src/data/products/legacy-rebuild/communication/comm-vebus-cable-rj45.ts`
  - `src/data/products/legacy-rebuild/communication/comm-vebus-ethernet-gw.ts`
  - `src/data/products/legacy-rebuild/communication/comm-vecan-cable-rj45.ts`
  - `src/data/products/legacy-rebuild/communication/comm-vecan-terminator.ts`
  - `src/data/products/legacy-rebuild/communication/discover-lynk-ii.ts`
  - `src/data/products/legacy-rebuild/communication/discover-lynk-lite.ts`
  - Validation: `npm.cmd run typecheck`
  - Validation: `npm.cmd run build`
- `src/data/products/legacy-rebuild/dc-dc-chargers/buck-boost-100.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/dc-dc-chargers/buck-boost-25.ts`
  - Validation: `npm.cmd run typecheck`
- `src/data/products/legacy-rebuild/dc-dc-chargers/buck-boost-50.ts`
  - Validation: `tsc.cmd --noEmit --skipLibCheck --moduleResolution bundler --module esnext --target es2020 --jsx react-jsx src/data/products/legacy-rebuild/dc-dc-chargers/buck-boost-50.ts`

## Current target

- `src/data/products/legacy/dc-dc-chargers/orion-110-24-15-converter.ts`

## Validation Note

Repo-wide `npm.cmd run typecheck` is currently reporting existing catalog typing
drift outside the rebuild folder. Use targeted checks for individual rebuild
files until that separate cleanup is resolved.
