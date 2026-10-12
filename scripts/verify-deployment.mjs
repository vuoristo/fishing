// Verify the published HTTP assets from a runner with access to the Pages host.
// This is separate from the local browser gameplay test.
const root = new URL(process.env.GAME_URL || 'https://vuoristo.github.io/fishing/');
if (root.protocol !== 'https:' && root.hostname !== '127.0.0.1') throw new Error('Use HTTPS for a public deployment.');
async function get(path) {
  const url = new URL(path, root);
  const r = await fetch(url, {signal: AbortSignal.timeout(15000), cache:'no-store'});
  if (!r.ok) throw new Error(`${r.status} ${url.pathname}`);
  return r;
}
let failure;
for (let attempt=0; attempt<12; attempt++) {
  try {
    const html = await (await get(root.href)).text();
    if (!html.includes('Keitele — A fishing expedition')) throw new Error('Unexpected page title.');
    const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(m=>m[1]);
    if (assets.length<2) throw new Error('Production JS/CSS assets are missing.');
    await Promise.all(assets.map(async path=>{const response=await get(path);if((response.headers.get('content-type')||'').includes('text/html'))throw new Error('Asset returned an HTML fallback.');}));
    const contours = await (await get('data/keitele-depth.geojson')).json();
    if (contours.type!=='FeatureCollection'||contours.features.length<50||!contours.features.every(f=>typeof f.properties.DEPTH==='number'))throw new Error('Survey contours missing.');
    const shoreline = await (await get('data/keitele-shoreline.geojson')).json();
    if(shoreline.features.length<300)throw new Error('Real shoreline missing.');
    const chart = new Uint8Array(await (await get('data/keitele-depth-chart.png')).arrayBuffer());
    if(chart[0]!==137||chart[1]!==80||chart[2]!==78||chart[3]!==71)throw new Error('Official chart is not a PNG.');
    console.log(`Verified public game: ${root.href}`);
    console.log(`HTML, ${assets.length} JS/CSS assets, ${contours.features.length} official contours, ${shoreline.features.length} shoreline features, and depth chart all served successfully.`);
    process.exit(0);
  } catch (error) {
    failure=error;
    console.log(`Attempt ${attempt+1}: ${error.message}`);
    if(attempt<11)await new Promise(resolve=>setTimeout(resolve,5000));
  }
}
throw failure;
