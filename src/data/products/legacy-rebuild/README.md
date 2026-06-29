# Legacy rebuild workspace

This folder is for rebuilt legacy product files that are still being reviewed
and should not be loaded into the active catalog yet.

Processing order:

1. Follow the legacy file list in sorted path order.
2. Rebuild one product at a time into the matching subfolder here.
3. Validate each rebuilt product before moving to the next one.

Current status:

- Started: 2026-06-27
- Next product: `src/data/products/legacy/dc-dc-chargers/orion-110-24-15-converter.ts`
- Active catalog impact: none
- Validation note: repo-wide `npm.cmd run typecheck` is currently noisy against
  existing catalog typing drift, so rebuild files may need targeted checks until
  that separate cleanup lands.
