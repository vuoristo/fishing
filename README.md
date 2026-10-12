# Keitele — a fishing expedition

A playable PS1-inspired browser fishing game built with TypeScript, Three.js, and Vite. No backend or account is needed. Fonts, graphics, lake datasets, and audio are local: the game does not call third-party services at runtime.

## Run

Requires Node.js 22+ (validated with Node 24).

```sh
npm ci --cache /workspace/.cache/npm
npm run dev -- --port 5173
```

For a static production build, run `npm run build` and serve `dist/`. `npm run preview -- --port 4173` serves the built version locally. A WebGL-capable browser is required.

## Play

- **WASD / arrow keys:** accelerate, reverse, and turn. On phones, use the on-screen arrows. Drop anchor to hold position.
- **Sonar:** down scan, side imaging, and manually aimable LiveScope. The beam direction changes both the fish returns and the direction of your cast.
- **C / Make a cast:** cast the chosen lure at the selected distance; cast again to retrieve. Slow below 5 km/h first. An initial perch school provides a good starting spot with the paddle-tail jig.
- **Space / Set the hook:** react within seven seconds when a fish bites.
- **Hold Space / Hold to reel:** pull in the fish. Release to ease tension. Excessive tension breaks the line; drag and rod strength affect the fight.
- **Your boat:** choose three hulls, three motors, three sonar packages, and three rods. Motors change speed; hulls change appearance and steering; sonar packages enable different scanning modes; rods change line tolerance and reeling strength.
- **Tackle:** paddle-tail jig, spoon, crankbait, spinner, jerkbait, and bottom rig. Species preferences, sinking speed, location, and depth affect bites.
- **Journal:** catches are measured, recorded, and released. Loadout and catches persist in local browser storage. Export the journal as JSON.

Perch, northern pike, zander, burbot, brown trout, and European whitefish are represented. Fish behaviour, population, lure performance, and measurements are simplified game models, not fisheries advice.

## Real lake data

The repository includes downloaded data, rather than making a live map service a prerequisite to playing:

- `public/data/keitele-depth.geojson`: **60 actual Finnish topographic depth-contour features**, 10,141 original vertices, with provider `DEPTH` values in metres. Retrieved through SYKE's public WMS `GetFeatureInfo`, layer `mert:syvyyskayra_vLine`. The sampled subset contains 3, 6, 10, and 20 m contours. It is **not a complete lake survey**.
- `public/data/keitele-depth-chart.png`: official **full-lake depth map** from SYKE's WMS `GetMap`, using depth areas, contours, and depth points.
- `public/data/keitele-shoreline.geojson`: real Keitele outline and **314 island rings**, from OpenStreetMap relation 444652.
- `public/data/sources.json`: source URLs, layer names, bounding boxes, retrieval timestamps, attribution, and content hashes.

The sonar and boat readouts interpolate between real contour vertices using a spatial search tree. The readout marks these values **DEPTH · EST**. These estimates do not resolve every basin. The play area is centred around **62.859°N, 26.009°E**. The separate **Keitele survey chart** shows real lake geography; **3D scenery and collisions use a compact stylised island layout**, rather than a reconstruction of the shoreline. Fish locations are simulated, with habitats adjusted to the loaded depth model.

The default synthetic depth model is used only if bundled data fails to load and is explicitly marked **DEPTH · SIM**. Additional WGS84 GeoJSON depth contours can be imported through **Lake data & credits**. Imports are session-local and not independently authenticated.

To refresh bundled data:

```sh
npm run data:fetch
```

The downloader preserves TLS validation and source depth values, checks completeness of OSM rings, writes source metadata, and never generates fabricated survey data. It needs network access to `paikkatiedot.ymparisto.fi` and `overpass-api.de`. The SYKE WFS interface is disabled; the working downloader uses WMS. Bundled data makes network access unnecessary for normal development and play.

Depth-map attribution: **Finnish Environment Institute (SYKE) / National Land Survey of Finland**. The WMS metadata declares licensed access (`Lisenssi`); the manifest records this and the NLS open-data licence reference. Shoreline attribution: **© OpenStreetMap contributors, ODbL 1.0**. Attribution is displayed in the game chart and credits. All maps and depth estimates are for this game and **not for navigation**.

## Validation

```sh
npm test           # Simulation, sonar geometry, fight outcomes, depth import and actual source-data checks
npm run build      # TypeScript validation and production bundle
npm run test:browser
```

The Playwright test launches Vite, drives the boat, anchors, aims sonar, swaps all gear categories, casts, hooks and lands a fish, verifies journal persistence, imports contour data, opens the real survey chart, and checks mobile overflow. It uses `/usr/bin/chromium` by default; set `CHROMIUM_PATH` for another installed Chromium executable. Install Chromium through Playwright (`npx playwright install chromium`) if needed, then set `CHROMIUM_PATH` to its executable. The gameplay test takes roughly a minute and does not mutate game state through test-only controls.

## Browser access through GitHub Pages

The Codex environment-onboarding chat cannot expose the running Vite port or provide workspace-file downloads. To play from a normal browser without installing anything, publish the static game to GitHub Pages.

A deployment workflow is prepared in `.github/workflows/deploy-pages.yml`. After the project is pushed to `main`, enable **GitHub Actions** as the Pages source in the repository's **Settings → Pages**. The workflow builds with the `/fishing/` base path, runs the simulation/data tests, and publishes `dist/`. The lake assets also respect the base path.

For the standard `vuoristo/fishing` project Pages setup, the expected URL after a successful deployment is `https://vuoristo.github.io/fishing/`. This is an expected URL, not a claim that deployment has happened. Publishing makes the game publicly accessible; no deployment was performed while preparing these files.
