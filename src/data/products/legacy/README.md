# Legacy products (not loaded)

These product files are preserved for future reintegration but are **not** part of
the active catalogue. The catalog loader (`src/data/products/index.ts`) discovers
products with `import.meta.glob('./catalog/**/*.ts')`, which does **not** reach this
`legacy/` folder, so nothing here appears in `ALL_PRODUCTS` / `PRODUCT_MAP`.

They were moved here during the System Design Validation Engine refactor to reduce
the catalogue to a fully-ported 48 V validation set. Current operating notes live
in the root `AGENTS.md`; old implementation briefs are archived under
`docs/archive/context-history/`.

Products that have been ported back into `catalog/` are preserved under
`legacy/reimported/` instead of being deleted.

## To reactivate a product

1. Move its file back under `src/data/products/catalog/<category>/`.
2. Fully port it to the current product model: explicit `ports`, `terminalGroups`,
   and a `terminalGroupId` on every terminal (see an active product such as
   `catalog/batteries/discover-helios-ess-52-48-16000.ts` for the pattern).
3. Set `dataQuality` honestly.

Do not add the legacy folder to the loader glob — port products deliberately.
