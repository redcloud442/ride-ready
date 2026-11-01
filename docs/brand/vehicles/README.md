# Vehicle and powertrain art

`apps/mobile/assets/images/vehicles/*.webp` are rendered here:

- Cars (sedan, hatchback, suv, pickup, van, coupe): "Generic passenger car pack" by Comrade1280,
  CC-BY-4.0, https://sketchfab.com/3d-models/generic-passenger-car-pack-20f9af9b8a404d5cb022ac6fe87f21f5.
  Unbranded, so no trademarks. The credit is shown in the app (`features/profile/components/credits.tsx`);
  keep it while these images ship. Body node per style: `PACK_BODIES` in `scene.js`.
- Motorcycles: procedural low-poly models in `scene.js` (`BIKES`).
- Paint: every body style is also rendered as `<style>-<colour>.webp` for core `VEHICLE_COLORS`. Cars use
  textures repainted by `paint.py` (`python paint.py <pack dir> pack/paint` before rendering); bikes recolour
  in code. Colours must match `paint.py`, `render.mjs` `COLOURS` and `apps/mobile/src/theme/vehicle-paint.ts`.
  After adding a colour or style, regenerate `apps/mobile/src/constants/vehicle-images.ts`.
- Powertrain icons: extruded Material Design Icons, in brand colors.

Regenerate (not a project dependency; run from an empty temp folder):

```bash
npm init -y && npm pkg set type=module
PUPPETEER_SKIP_DOWNLOAD=1 npm i three@0.171.0 @mdi/js puppeteer-core
cp <repo>/docs/brand/vehicles/{scene.js,render.mjs} .
# car pack: download glTF from the Sketchfab link (free login), unzip to ./pack
CAR_PACK=pack/scene.gltf node render.mjs out   # uses the installed Chrome (path in render.mjs); ONLY=sedan,suv for a subset
cp out/*.webp <repo>/apps/mobile/assets/images/vehicles/
```

Change colors in `scene.js` (`M.body`, `ICONS`), shapes in `CARS` / `BIKES`.
