import {test} from 'node:test';
import assert from 'node:assert/strict';
import {species,createSchools,sonarTargets,onLand,advanceFight,extractDepthContours,contourDepth,syntheticDepth} from '../src/simulation.js';

test('fish schools spawn reproducibly in open water with supported species',()=>{
 const a=createSchools(),b=createSchools();assert.deepEqual(a,b);assert.ok(a.length>=30);
 for(const school of a){assert.equal(onLand(school.x,school.z,0),false);assert.ok(species.some(s=>s.id===school.species));assert.ok(school.count>0);assert.ok(school.depth>0);}
});
test('live sonar and aim distinguish forward, side, and rear fish schools',()=>{
 const boat={x:0,z:0,heading:0};const fish=[{id:1,x:0,z:-60,depth:5},{id:2,x:60,z:0,depth:5},{id:3,x:0,z:60,depth:5}];
 assert.deepEqual(sonarTargets(boat,fish,'live').map(s=>s.id),[1]);
 assert.deepEqual(sonarTargets(boat,fish,'live',Math.PI/2).map(s=>s.id),[2]);
 assert.deepEqual(sonarTargets(boat,fish,'side').map(s=>s.id),[2]);
 assert.deepEqual(sonarTargets(boat,fish,'down').map(s=>s.id),[]);
});
test('rotating the boat also rotates the live sonar beam',()=>{
 assert.deepEqual(sonarTargets({x:0,z:0,heading:Math.PI/2},[{id:4,x:50,z:0,depth:5}],'live').map(s=>s.id),[4]);
});
test('holding the reel without managing tension breaks the line',()=>{
 const f={elapsed:0,tension:.25,progress:0,strength:1,stress:0};let outcome;
 for(let i=0;i<1000;i++){outcome=advanceFight(f,1/60,true,.9,1);if(outcome!=='fighting')break;}
 assert.equal(outcome,'escaped');assert.ok(f.progress<1);
});
test('alternating reel and release can land a fish with a medium rod',()=>{
 const f={elapsed:0,tension:.25,progress:0,strength:1,stress:0};let outcome;let reeling=true;
 for(let i=0;i<60*180;i++){if(f.tension>.73)reeling=false;if(f.tension<.32)reeling=true;outcome=advanceFight(f,1/60,reeling,.55,1);if(outcome!=='fighting')break;}
 assert.equal(outcome,'caught');assert.equal(f.progress,1);
});
test('easing off lowers tension and prolonged red tension is required to lose a fish',()=>{
 const f={elapsed:0,tension:1,progress:.2,strength:.7,stress:0};assert.equal(advanceFight(f,.1,false,.6,1),'fighting');assert.ok(f.tension<1);
});
test('survey contours use real metre values and reject coordinates outside Keitele',()=>{
 const geo={type:'FeatureCollection',features:[{type:'Feature',properties:{VALDCO:12},geometry:{type:'LineString',coordinates:[[25.94,62.86],[25.95,62.86],[25.94,62.87]]}}]};
 const {points}=extractDepthContours(geo);assert.equal(points.length,3);assert.equal(contourDepth(points,0,0),12);
 assert.throws(()=>extractDepthContours({...geo,features:[{...geo.features[0],geometry:{type:'LineString',coordinates:[[0,0],[1,0],[0,1]]}}]}),/Keitele/);
 assert.throws(()=>extractDepthContours({type:'FeatureCollection',features:[]}),/No usable depth/);
});
test('land and simulated depth agree on shallow island edges',()=>{
 assert.equal(onLand(-115,-100),true);assert.ok(syntheticDepth(-115,-100)<3);assert.equal(onLand(0,18),false);assert.ok(syntheticDepth(0,18)>5);
});

test('spatial contour search matches the reference interpolation without mutating survey samples',async()=>{
 const {createDepthSampler}=await import('../src/simulation.js');
 const points=Array.from({length:50},(_,i)=>({lon:25.93+(i%10)*.002,lat:62.85+Math.floor(i/10)*.003,depth:3+i%4*3}));const saved=structuredClone(points),sample=createDepthSampler(points);
 for(const [x,z] of [[0,0],[100,250],[-300,-800],[400,900]])assert.ok(Math.abs(sample(x,z)-contourDepth(points,x,z))<1e-9);
 assert.deepEqual(points,saved);
});
test('bundled official contours carry source IDs, metre depths, and usable Keitele coordinates',async()=>{
 const {readFile}=await import('node:fs/promises');const data=JSON.parse(await readFile(new URL('../public/data/keitele-depth.geojson',import.meta.url),'utf8'));
 const {points,features}=extractDepthContours(data);assert.ok(features.length>=50);assert.ok(points.length>5000);assert.ok(features.every(f=>f.id.startsWith('syvyyskayra_vLine.')));assert.ok(features.every(f=>[3,6,10,20].includes(f.properties.DEPTH)));assert.ok(data.metadata.source_url.startsWith('https://paikkatiedot.ymparisto.fi/'));
});
