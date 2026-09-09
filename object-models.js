// Lightweight procedural models. Local front is +Z; sizes follow source footprints.
export function detailedModel(g,o,{THREE,box,cylinder,mat,materials:m,project}){
 const [w,h,d]=o.size,k=o.kind;
 const b=(a,c,e,x,y,z,material=m.white,r=false)=>box(g,a,c,e,x,y,z,material,r);
 const disk=(r,depth,x,y,z,material)=>{const v=cylinder(g,r,depth,x,y,z,material,24);v.rotation.x=Math.PI/2;return v;};
 const front=(height=h,finish=m.stone)=>{b(w,height,d,0,height/2,0,m.oak);b(w-.012,height-.02,.018,0,height/2,d/2+.009,finish);};
 const handle=(y,x=w*.32)=>b(.015,Math.min(.24,h*.25),.028,x,y,d/2+.033,m.metal,true);
 const label=(text,x,y,z,ww,hh)=>{const cv=document.createElement('canvas');cv.width=512;cv.height=128;const c=cv.getContext('2d');c.fillStyle='#e9efed';c.fillRect(0,0,512,128);c.fillStyle='#193730';c.textAlign='center';c.font='bold 40px sans-serif';c.fillText(text,256,82,495);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(ww,hh),new THREE.MeshBasicMaterial({map:tx}));mesh.position.set(x,y,z);mesh.userData.ownMaterial=true;g.add(mesh);};
 if(k==='tv') {b(w,h,d,0,h/2,0,m.dark,true);b(w-.025,h-.025,.005,0,h/2,d/2+.004,mat('#152a39',{metalness:.25,roughness:.22}));b(w*.55,h*.38,.001,-w*.1,h*.57,d/2+.007,mat('#244251',{roughness:.2}));b(.08,.14,.09,0,h/2,-d/2-.04,m.dark);}
 else if(k==='speaker'||k==='soundbar'){b(w,h,d,0,h/2,0,m.dark,true);if(k==='speaker'){disk(w*.32,.009,0,h*.53,d/2+.007,mat('#152027'));disk(w*.12,.01,0,h*.82,d/2+.013,m.metal);}else for(const x of [-w*.37,0,w*.37])disk(h*.32,.006,x,h/2,d/2+.005,mat('#152027'));}
 else if(k==='projector'){b(w,h,d,0,h/2,0,m.white,true);disk(h*.32,.025,w*.23,h*.5,d/2,m.dark);disk(h*.23,.03,w*.23,h*.5,d/2+.006,mat('#3e7296',{metalness:.6,roughness:.15}));b(.025,.2,.025,0,h+.08,0,m.metal);for(let i=0;i<5;i++)b(.06,.006,.004,-w*.24,h*.26+i*.017,d/2+.005,m.dark);}
 else if(k==='screen'){b(w,h,d,0,h/2,0,m.white,true);b(w*.96,1.06,.015,0,-.53,0,m.linen);b(w*.97,.024,.027,0,-1.06,0,m.dark);}
 else if(k==='boiler'){cylinder(g,w/2,h,0,h/2,0,m.white,32);cylinder(g,w*.48,.035,0,h-.008,0,m.metal,32);b(.12,.16,.035,0,h*.3,d/2,m.dark,true);disk(.025,.01,0,h*.27,d/2+.025,m.metal);for(const x of [-.09,.09]){cylinder(g,.016,.10,x,-.04,0,mat(x<0?'#379ee6':'#df6b59'));}label('80 L ≈',0,h*.68,d/2+.007,.21,.053);}
 else if(['dishwasher','dryingCabinet','fridge','freezer','ovenTower','coffeeTower','winefridge','hob','kitchenSink'].includes(k)){
 front(h,k==='fridge'||k==='freezer'?m.white:m.stone);
 if(['fridge','freezer','dryingCabinet'].includes(k)){handle(h*.65);b(w-.015,.009,.022,0,h*.28,d/2+.02,m.dark);if(k==='dryingCabinet')for(let i=0;i<5;i++)b(w*.65,.012,.006,0,.13+i*.032,d/2+.025,m.dark);}
 else if(k==='dishwasher'){b(w-.024,.065,.02,0,h-.08,d/2+.02,m.metal);b(w*.48,.015,.034,0,h-.14,d/2+.035,m.dark);}
 else if(k==='winefridge'){b(w*.83,h*.78,.025,0,h*.48,d/2+.025,m.dark);for(let i=0;i<4;i++){b(w*.75,.015,.03,0,.12+i*h*.18,d/2+.045,m.oak);for(let j=0;j<3;j++)disk(.025,.025,(j-1)*w*.22,.15+i*h*.18,d/2+.055,mat('#344f3e'));}}
 else if(k==='ovenTower'||k==='coffeeTower'){const y=h*.53;b(w*.86,.53,.027,0,y,d/2+.025,m.dark);b(w*.83,.075,.03,0,y+.24,d/2+.04,m.metal);b(w*.65,.022,.045,0,y+.14,d/2+.06,m.metal);if(k==='ovenTower'){b(w*.72,.22,.032,0,y-.055,d/2+.045,mat('#263946'));b(w*.86,.37,.025,0,y+.54,d/2+.025,m.dark);b(w*.65,.018,.045,0,y+.64,d/2+.06,m.metal);}else {b(w*.35,.22,.04,0,y-.03,d/2+.04,m.metal);b(.10,.03,.08,0,y-.04,d/2+.08,m.dark);}}
 else {b(w+.005,.035,d+.012,0,h+.018,0,m.stone);if(k==='hob'){b(w*.88,.01,d*.85,0,h+.041,0,m.dark,true);for(const x of [-w*.23,w*.23])for(const z of [-d*.22,d*.22])cylinder(g,Math.min(w,d)*.14,.003,x,h+.048,z,m.metal,24);}else {b(w*.76,.012,d*.68,0,h+.044,0,m.dark,true);b(w*.66,.013,d*.55,0,h+.048,.012,m.metal,true);b(.022,.25,.022,0,h+.14,-d*.34,m.metal);b(.022,.022,.17,0,h+.26,-d*.22,m.metal);}}
 }
 else if(k==='armchair'){b(w,.17,d,0,.22,0,m.oak,true);b(w*.74,.20,d*.7,0,.43,.06,m.linen,true);b(w,.55,.17,0,.58,-d*.4,m.fabric,true);for(const x of [-1,1])b(.15,.36,d,x*(w/2-.075),.48,0,m.fabric,true);}
 else if(k==='sink'){b(w,.68,d,0,.38,0,m.oak);const count=Math.max(1,Math.round(w/.6));for(let i=0;i<count;i++){b(w/count-.012,.59,.018,-w/2+(i+.5)*w/count,.42,d/2+.008,m.stone);b(w/count*.5,.014,.025,-w/2+(i+.5)*w/count,.67,d/2+.025,m.dark);}b(w,.045,d,0,.75,0,m.white,true);const bowls=w>1.6?[-w*.26,w*.26]:[0];for(const x of bowls){const bw=Math.min(.52,w*.75);b(bw,.04,d*.64,x,.79,0,m.dark,true);b(bw-.045,.04,d*.56,x,.797,.012,m.white,true);b(.022,.22,.022,x,.88,-d*.32,m.metal);b(.022,.022,.14,x,.98,-d*.23,m.metal);}}
 else if(k==='socket'){b(w,h,d,0,h/2,0,m.white,true);const n=o.socketCount||o.count||1;for(let i=0;i<n;i++){const x=(i-(n-1)/2)*w/n;disk(Math.min(w/n,h)*.30,.007,x,h/2,d/2+.005,m.stone);for(const dx of [-.012,.012])disk(.004,.005,x+dx,h/2,d/2+.010,m.dark);}if(o.ip==='IP66'||o.outdoor)b(w,.014,d*.5,0,h+.002,d*.35,m.metal);}
 else if(k==='panel'&&o.id==='PANEL'&&project.electrical?.panelLayout){
 b(w,h,.025,0,h/2,-d/2,m.dark);for(const x of [-1,1])b(.024,h,d,x*w/2,h/2,0,m.metal);b(w,.025,d,0,h,0,m.metal);b(w,.025,d,0,0,0,m.metal);
 const rails=project.electrical.panelLayout.rails,step=(h-.17)/rails.length,devicePositions=new Map(),railWidth=24*.018;
 for(const x of [-.31,.31])b(.035,h-.05,.055,x,h/2,.015,m.stone);
 rails.forEach((row,i)=>{const y=h-.12-i*step;b(.58,.026,.016,0,y,-.01,m.metal);b(.58,.033,.042,0,y-step*.42,.008,m.stone);let x=-railWidth/2;
 for(const item of row){const width=.018*item.din;devicePositions.set(item.id,{x:x+width/2,y,width});if(item.kind!=='reserve'){b(width-.003,.095,.059,x+width/2,y,.03,item.kind==='module'?mat('#478979'):m.white,true);label(item.id,x+width/2,y,.061,width-.005,.022);const n=item.kind==='module'?Math.min(12,item.din*3):item.kind==='terminal'?24:2;for(let j=0;j<n;j++){const tx=x+width*(j+.5)/n;for(const yy of [-.04,.04]){b(width/n*.8,.017,.016,tx,y+yy,.066,item.kind==='module'?mat('#64a64e'):m.stone);disk(.0025,.003,tx,y+yy,.076,m.dark);}}if(item.kind==='protection')b(width*.45,.023,.015,x+width*.5,y-.006,.078,m.dark);}
 x+=width;}
 });
 // Schematic duct routing uses the same functional netlist as the close-up.
 const data=project.electrical.panelWiring;const wiringGroup=new THREE.Group(),detailLOD=new THREE.LOD();detailLOD.addLevel(wiringGroup,0);detailLOD.addLevel(new THREE.Group(),5);g.add(detailLOD);
 const locate=(ref)=>{let id=ref.split('/')[0];if(id.startsWith('XD-'))id=id.slice(3);let v=devicePositions.get(id);if(!v){const signal=id.startsWith('PATCH')||id.startsWith('RESERVE')||ref.includes('PAIR')||ref.includes('COMMON')||ref.includes('SENSOR');v=devicePositions.get(signal?'XT-SIGNAL':'XT-POWER');}return v;};
 for(const [i,wire] of (data?.wires||[]).entries()){
  const a=locate(wire.from),c=locate(wire.to);if(!a||!c||a===c)continue;const lv=['RS485','INTERNAL'].includes(wire.circuit)||wire.signal.includes('contact')||wire.signal.includes('sensor');const lane=(lv?1:-1)*(.265+(i%9)*.003);const ax=a.x+(i%3-1)*.004,bx=c.x+(i%3-1)*.004;const pts=[[ax,a.y-.043,.076],[ax,a.y-step*.42,.076],[lane,a.y-step*.42,.076],[lane,c.y-step*.42,.076],[bx,c.y-step*.42,.076],[bx,c.y-.043,.076]].map(v=>new THREE.Vector3(...v));const curve=new THREE.CurvePath();for(let j=1;j<pts.length;j++)curve.add(new THREE.LineCurve3(pts[j-1],pts[j]));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,22,.0011,4,false),mat(wire.color));wiringGroup.add(mesh);
 }
 }
 else return false;
 return true;
}
