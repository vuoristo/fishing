export const LAKE_ORIGIN={lon:26.009,lat:62.859};
export const species = [
  { id:'perch', name:'European perch', finnish:'Ahven', color:'#b28d35', min:0.22, max:1.8, strength:0.62, depth:[3,15], lures:['spinner','jig','worm'], info:'Often found in shoals around rocky points and weed edges. A small jig is a reliable starting point.' },
  { id:'pike', name:'Northern pike', finnish:'Hauki', color:'#718052', min:1.2, max:9.5, strength:1.12, depth:[2,9], lures:['spoon','jerk','spinner'], info:'An ambush predator of the shallows. Work a spoon or jerkbait along the reed beds.' },
  { id:'zander', name:'Zander', finnish:'Kuha · pike perch', color:'#a7a17e', min:0.7, max:5.2, strength:0.9, depth:[7,22], lures:['jig','crank'], info:'Search the edges of deeper basins. A slowly worked soft plastic is a good choice in low light.' },
  { id:'burbot', name:'Burbot', finnish:'Made', color:'#7a6949', min:0.5, max:4.0, strength:0.84, depth:[16,40], lures:['worm','jig'], info:'A cold-water, bottom-dwelling fish. It is much less active during a bright summer day.' },
  { id:'trout', name:'Brown trout', finnish:'Taimen', color:'#b59272', min:0.8, max:4.7, strength:1.28, depth:[9,28], lures:['spoon','crank'], info:'Cruises cool, oxygen-rich open water. Use a spoon or trolling plug. Wild lake trout need careful protection.' },
  { id:'whitefish', name:'European whitefish', finnish:'Siika', color:'#a6b5aa', min:0.3, max:2.2, strength:0.7, depth:[10,30], lures:['worm','jig'], info:'A cautious fish of clean, cool water. Small presentations and a patient approach work best.' }
];
export const lures = [
 {id:'jig',name:'Paddle tail',type:'SOFT JIG',color:'#dd8254',weight:'14 g',depth:'3–20 m',sink:0.85},
 {id:'spoon',name:'Copper flash',type:'SPOON',color:'#bd8150',weight:'18 g',depth:'1–8 m',sink:0.5},
 {id:'crank',name:'Deep runner',type:'CRANKBAIT',color:'#b7bd58',weight:'21 g',depth:'4–12 m',sink:0.6},
 {id:'spinner',name:'Silver leaf',type:'SPINNER',color:'#b9c8bf',weight:'9 g',depth:'1–5 m',sink:0.28},
 {id:'jerk',name:'Forest minnow',type:'JERKBAIT',color:'#869775',weight:'32 g',depth:'1–6 m',sink:0.32},
 {id:'worm',name:'Night crawler',type:'BOTTOM RIG',color:'#ab777c',weight:'12 g',depth:'5–35 m',sink:1.2}
];
export const equipment = {
 hull:[{id:'scout',name:'Scout 410',detail:'4.1 m · agile aluminium',value:1},{id:'ranger',name:'Ranger 510',detail:'5.1 m · stable fishing platform',value:0.83},{id:'skiff',name:'Classic skiff',detail:'3.8 m · light timber',value:1.15}],
 motor:[{id:'electric',name:'Electric · 3 kW',detail:'Quiet approach · 12 km/h',value:12},{id:'outboard',name:'Outboard · 25 hp',detail:'Balanced range · 28 km/h',value:28},{id:'sport',name:'Outboard · 60 hp',detail:'Cross the lake · 46 km/h',value:46}],
 sonar:[{id:'live',name:'LiveScope + side imaging',detail:'Aimable live beam, side and down scan',value:1},{id:'side',name:'Side imaging + down scan',detail:'Find structure to port and starboard',value:0.8},{id:'down',name:'Down scan',detail:'Read the water directly below',value:0.55}],
 rod:[{id:'medium',name:'All-round · 7′ medium',detail:'Balanced action · 8 kg line',value:1},{id:'light',name:'Finesse · 6′6″ light',detail:'Sensitive bites · 4 kg line',value:0.68},{id:'heavy',name:'Predator · 8′ heavy',detail:'Strong backbone · 14 kg line',value:1.45}]
};
export function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
export function seeded(seed){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
export const islands = [
 {x:-115,z:-100,rx:90,rz:58,h:14}, {x:165,z:-175,rx:95,rz:145,h:18},
 {x:-410,z:-245,rx:150,rz:150,h:25}, {x:350,z:100,rx:105,rz:100,h:20},
 {x:-320,z:170,rx:145,rz:190,h:23}, {x:110,z:-500,rx:250,rz:80,h:21},
 {x:475,z:-400,rx:150,rz:210,h:30}, {x:-190,z:550,rx:260,rz:95,h:25}
];
export function onLand(x,z,margin=5){return islands.some(i=>Math.pow((x-i.x)/(i.rx+margin),2)+Math.pow((z-i.z)/(i.rz+margin),2)<1);}
export function syntheticDepth(x,z){
 let shore=1;
 for(const i of islands){const d=Math.sqrt(((x-i.x)/i.rx)**2+((z-i.z)/i.rz)**2);shore=Math.min(shore,clamp((d-1)*1.4,0,1));}
 const basin=14+10*Math.sin(x/220)*Math.cos(z/310)+15*Math.exp(-((x-100)**2+(z-150)**2)/50000);
 return Math.max(1.2,basin*shore+2);
}
export function createSchools(){const rand=seeded(4812);const result=[{id:0,x:12,z:-27,species:'perch',count:11,depth:7.8}];
 for(let n=1;n<38;n++){let x,z;do{x=(rand()-.5)*1000;z=(rand()-.5)*1000;}while(onLand(x,z,20));const d=syntheticDepth(x,z);const choices=species.filter(s=>d>=s.depth[0]&&d<=s.depth[1]);const sp=choices[Math.floor(rand()*choices.length)]||species[0];result.push({id:n,x,z,species:sp.id,count:3+Math.floor(rand()*14),depth:Math.min(d-1,sp.depth[0]+rand()*6)});}return result;}
export function sonarTargets(boat,schools,mode,aim=0,depthAt=syntheticDepth){
 return schools.map(s=>{const dx=s.x-boat.x,dz=s.z-boat.z;const distance=Math.hypot(dx,dz);let angle=Math.atan2(dx,-dz)-boat.heading-aim;angle=Math.atan2(Math.sin(angle),Math.cos(angle));const floor=depthAt(s.x,s.z);return {...s,depth:Math.min(s.depth,Math.max(.5,floor-1)),distance,angle};}).filter(s=>mode==='live'?s.distance<150&&Math.abs(s.angle)<0.40:mode==='side'?s.distance<160&&Math.abs(Math.cos(s.angle))<.65:s.distance<55);
}
export function advanceFight(fight,dt,reeling,drag,rodStrength){
 const surge=Math.sin(fight.elapsed*2.3)*.5+.5;
 fight.elapsed+=dt;
 const pull=(0.20+surge*.26)*fight.strength;
 fight.tension=clamp(fight.tension+dt*((reeling?.64*drag: -.51)+pull-.16)*(.95/rodStrength),.02,1.15);
 fight.stress=Math.max(0,(fight.stress||0)+dt*(fight.tension>.94?1:-1.9));
 if(reeling){fight.progress=clamp(fight.progress+dt*(fight.tension<.93?.067*rodStrength: .012),0,1);}
 else fight.progress=clamp(fight.progress-dt*.012*surge,0,1);
 return fight.stress>1.2?'escaped':fight.progress>=1?'caught':'fighting';
}
export function extractDepthContours(geo){
 if(geo?.type!=='FeatureCollection'||!Array.isArray(geo.features))throw new Error('Expected a GeoJSON FeatureCollection.');
 const points=[];const features=[];
 const aliases=['depth','depth_m','depthmetres','depthmetre','syvyys','syvyys_m','valdco','z','value','contour','korkeus'];
 for(const f of geo.features){const props=f.properties||{};const k=Object.keys(props).find(k=>aliases.includes(k.toLowerCase()));let d=k?Math.abs(Number(props[k])):NaN;
  if(!Number.isFinite(d)||d>100||d<0)continue;
  const g=f.geometry;let lines=g?.type==='LineString'?[g.coordinates]:g?.type==='MultiLineString'?g.coordinates:g?.type==='Point'?[[g.coordinates]]:null;
  if(!lines)continue;
  for(const line of lines)for(const c of line){if(!Array.isArray(c)||!Number.isFinite(c[0])||!Number.isFinite(c[1]))continue;points.push({lon:c[0],lat:c[1],depth:d});}
  features.push(f);
 }
 if(points.length<3)throw new Error('No usable depth contours. Include depth/depth_m/syvyys/VALDCO in WGS84 GeoJSON.');
 if(points.some(p=>p.lon<25.4||p.lon>26.6||p.lat<62.45||p.lat>63.4))throw new Error('The contours must cover Keitele and use WGS84 longitude/latitude.');
 return {points,features};
}
export function contourDepth(points,x,z){
 const lon=LAKE_ORIGIN.lon+x/51000,lat=LAKE_ORIGIN.lat-z/111320;let best=[];
 for(const p of points){const dist=((p.lon-lon)*51000)**2+((p.lat-lat)*111320)**2;best.push([dist,p.depth]);}
 best.sort((a,b)=>a[0]-b[0]);let sum=0,weight=0;for(const [d,depth] of best.slice(0,8)){const w=1/Math.max(1,d);sum+=depth*w;weight+=w;}return weight?sum/weight:syntheticDepth(x,z);
}

// A spatial search tree keeps sonar, movement, and chart rendering fast even
// with thousands of survey vertices. Contour values remain unmodified.
export function createDepthSampler(points){
 const samples=points.map(p=>({x:(p.lon-LAKE_ORIGIN.lon)*51000,z:(LAKE_ORIGIN.lat-p.lat)*111320,depth:p.depth}));
 function build(list,axis=0){if(!list.length)return null;const key=axis?'z':'x';list.sort((a,b)=>a[key]-b[key]);const mid=Math.floor(list.length/2);return {p:list[mid],axis,left:build(list.slice(0,mid),1-axis),right:build(list.slice(mid+1),1-axis)};}
 const root=build(samples);
 return (x,z)=>{const best=[];function visit(node){if(!node)return;const dx=node.p.x-x,dz=node.p.z-z,dist=dx*dx+dz*dz;if(best.length<8||dist<best[best.length-1][0]){best.push([dist,node.p.depth]);best.sort((a,b)=>a[0]-b[0]);if(best.length>8)best.pop();}const delta=node.axis?z-node.p.z:x-node.p.x;visit(delta<0?node.left:node.right);if(best.length<8||delta*delta<best[best.length-1][0])visit(delta<0?node.right:node.left);}
 visit(root);let sum=0,weight=0;for(const [d,depth] of best){const w=1/Math.max(1,d);sum+=depth*w;weight+=w;}return weight?sum/weight:syntheticDepth(x,z);};
}
