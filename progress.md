Original prompt: We're going to massively improve the UI. Use this image as the base for the map. Reconfigure / calibrate the hex grid to be an overlay on top of this image. Notice how the hexes tile - they have the pointy end down, and are staggered to perfectly tessalate the surface. Plan out how you would do this, keeping display of units clear on top of the hex grid image.

## 2026-02-09

- Started `feat/map-image-grid-overlay` from `origin/main`.
- Confirmed provided board image exists at `public/assets/minaria-map-hires.jpg` with dimensions `1841x1403`.
- Implementing first pass: image-backed map layer, calibrated hex overlay, improved unit marker legibility, pan/zoom interactions.
- Added `src/ui/map-calibration.ts` for reusable map/hex calibration constants and coordinate helpers.
- Reworked `HexBoard` to render the map image as base layer with subtle interactive hex overlay and high-contrast unit badges.
- Added board pan/zoom interaction with reset control to support map readability and navigation.
- Pulled the board base from the provided local asset path (`public/assets/minaria-map-hires.jpg`) and wired it as the rendered board image.
- Verification:
  - `npm run lint` passed.
  - `npm test` passed.
  - `npm run build` passed.
  - `npm run test:e2e -- --project=chromium` passed (run outside sandbox restrictions due local EPERM in sandbox).

## TODO / Follow-ups

- Fine-tune `MINARIA_MAP_CALIBRATION` constants by visual calibration pass against target landmarks for tighter edge alignment.
- Add touch pinch-zoom support for mobile beyond drag + wheel baseline.
