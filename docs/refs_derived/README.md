# Derived Reference Data

This directory contains **generated** reference data derived from the read-only `docs/refs/` sources.
It exists to provide stable IDs, consistent schemas, and mode-aware splits (basic vs advanced)
without mutating the original source-of-truth files.

## Files

- `factions.json` (basic mode)
- `factions_advanced.json` (advanced-only factions inferred from the map)
- `hexmap.json` (basic mode; advanced kingdoms are omitted)
- `hexmap_advanced.json` (full map, including advanced kingdoms)
- `starting_units.json` (basic mode)
- `starting_units_advanced.json` (advanced-only units)
- `abilities.json` (ability IDs mapped to rules references)

## Notes

- The read-only `docs/refs/` data is **not modified**.
- Advanced-mode factions (`The Black Hand`, `The Eaters of Wisdom`) are inferred from the hexmap
  because they are referenced in `hexmap.json` and `starting_units.json` but not in `factions.json`.
- Ambassadors use `movement_type: "teleport"` while retaining numeric `movement_points`.
- Terrain keys are normalized to `snake_case` (e.g., `minor_river`, `major_river`, `mountain_pass`,
  `ancient_battlefield`).

## Regeneration

Run:

```bash
python scripts/derive_refs.py
```

Then validate:

```bash
python scripts/validate_derived_refs.py
```
