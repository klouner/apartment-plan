// Original procedural assets, metres, +Z front. No external downloads at runtime.
// Shared 256px physical material maps: deterministic and bounded in GPU memory.
const palettes=new WeakMap();
export async function loadWoodFinish(T){
 const loader=new T.TextureLoader(),maps=await Promise.all(['Diffuse','nor_gl','Rough'].map(k=>loader.loadAsync(`assets/materials/oak-${k}.jpg`)));
 maps.forEach(t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;});maps[0].colorSpace=T.SRGBColorSpace;
 const p=surfacePalette(T);for(const key of ['wood','walnut']){const m=p[key];m.map=maps[0];m.normalMap=maps[1];m.normalScale=new T.Vector2(.35,.35);m.roughnessMap=maps[2];m.roughness=.85;m.bumpMap=null;m.color.set(key==='wood'?'#e1c9a4':'#947256');m.needsUpdate=true;}
}
export function surfacePalette(T){
 if(palettes.has(T))return palettes.get(T);
 const texture=(type)=>{const n=256,data=new Uint8Array(n*n*4);let seed=713;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=(seed/4294967296-.5),v=type==='wood'?180+24*Math.sin(x*.22+3*Math.sin(y*.024))+12*Math.sin(x*.61+Math.sin(y*.049))+noise*9:190+((x%4<2)===(y%4<2)?19:-19)+noise*17;const i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
  const t=new T.DataTexture(data,n,n,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(type==='wood'?2:7,type==='wood'?1:7);t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;return t;};
 const weave=texture('fabric'),grain=texture('wood');
 const cloth=color=>new T.MeshStandardMaterial({color,map:weave,bumpMap:weave,bumpScale:.0012,roughness:1});
 const p={ivory:cloth('#eee5d6'),sage:cloth('#8eaaa1'),rust:cloth('#ad795b'),darkCloth:cloth('#353f40'),wood:new T.MeshStandardMaterial({color:'#a4825d',map:grain,bumpMap:grain,bumpScale:.0006,roughness:.57}),walnut:new T.MeshStandardMaterial({color:'#72513d',map:grain,bumpMap:grain,bumpScale:.0006,roughness:.54}),ceramic:new T.MeshPhysicalMaterial({color:'#f0eee5',roughness:.22,clearcoat:.4}),black:new T.MeshStandardMaterial({color:'#202827',roughness:.4}),metal:new T.MeshStandardMaterial({color:'#b6a68a',metalness:.8,roughness:.28})};
 palettes.set(T,p);return p;
}
export function premiumModel(g,o,ctx){
 const {THREE:T,box,cylinder,mat,materials:m}=ctx,[w,h,d]=o.size,k=o.kind;
 if(!['bed','sofa','armchair','chair','table','roundTable','island','toilet','projector','screen','tv'].includes(k))return false;
 const p=surfacePalette(T),b=(a,c,e,x,y,z,material=p.wood,r=true)=>box(g,a,c,e,x,y,z,material,r);
 const mesh=(geo,material,x=0,y=0,z=0)=>{const v=new T.Mesh(geo,material);v.position.set(x,y,z);v.castShadow=v.receiveShadow=true;g.add(v);return v;};
 const rod=(a,z,r=.012,material=p.metal)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...z),v=mesh(new T.CylinderGeometry(r,r*.85,av.distanceTo(bv),10),material);v.position.copy(av).add(bv).multiplyScalar(.5);v.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return v;};
 const pow=(v,e)=>Math.sign(v)*Math.abs(v)**e;
 // Superellipsoid cushions: curved sides and crowns, instead of bevelled boxes.
 const soft=(a,c,e,x,y,z,material=p.ivory,exp=.32)=>{const geo=new T.SphereGeometry(1,32,16),pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const xx=pos.getX(i),yy=pos.getY(i),zz=pos.getZ(i),lat=Math.asin(Math.max(-1,Math.min(1,yy))),lon=Math.atan2(zz,xx);pos.setXYZ(i,a/2*pow(Math.cos(lat),exp)*pow(Math.cos(lon),exp),c/2*pow(Math.sin(lat),exp),e/2*pow(Math.cos(lat),exp)*pow(Math.sin(lon),exp));}geo.computeVertexNormals();return mesh(geo,material,x,y,z);};
 const piping=(a,e,y,x=0,z=0,material=p.ivory)=>{const points=[];for(let i=0;i<=64;i++){const t=i/64*Math.PI*2;points.push(new T.Vector3(x+a/2*pow(Math.cos(t),.32),y,z+e/2*pow(Math.sin(t),.32)));}return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),64,.0022,4,false),material);};
 const lathe=(points,material,x=0,y=0,z=0)=>mesh(new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),40),material,x,y,z);
 if(k==='bed'){
  b(w,.20,d,0,.22,0,p.walnut);soft(w-.04,.19,d-.09,0,.405,.01,p.ivory,.16);piping(w-.04,d-.09,.465);
  soft(w,.83,.115,0,.51,-d/2+.057,p.sage,.25);
  for(const x of [-w*.42,w*.42])for(const z of [-d*.41,d*.41])rod([x,0,z],[x,.16,z],.022,p.walnut);
  const duvet=soft(w-.05,.075,d*.71,0,.535,d*.11,p.ivory,.14);
  // Gentle folds in the actual surface, not painted stripes.
  const pos=duvet.geometry.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,pos.getY(i)+.012*Math.sin(x*23+z*3)*Math.sin(z*6));}duvet.geometry.computeVertexNormals();
  const xs=w>1.4?[-w*.24,w*.24]:[0];for(const x of xs){const pillow=soft(w>1.4?w*.40:w*.78,.105,d*.22,x,.56,-d*.31);pillow.rotation.x=-.10;}
  soft(w-.03,.034,d*.19,0,.59,d*.28,p.sage,.2);piping(w-.04,d*.19,.593,0,d*.28,p.sage);
 }
 else if(k==='sofa'||k==='armchair'){
  const chair=k==='armchair',seatH=Math.min(.45,h*.55),arm=chair?w*.15:.145;
  for(const x of [-w*.40,w*.40])for(const z of [-d*.33,d*.33])rod([x,.01,z],[x*.98,.17,z],.018,p.walnut);
  soft(w,.20,d,0,.23,0,p.sage,.25);soft(w,h-.29,.20,0,(h+.29)/2,-d/2+.1,p.sage,.3);
  for(const x of [-1,1])soft(arm,h*.49,d*.94,x*(w-arm)/2,h*.48,.015,p.sage,.35);
  const n=chair?1:Math.max(2,Math.round(w/.85)),sw=(w-2*arm-.035)/n;
  for(let i=0;i<n;i++){const x=(i-(n-1)/2)*sw;soft(sw-.012,.17,d*.70,x,seatH,.045);piping(sw-.025,d*.68,seatH+.02,x,.045);const back=soft(sw-.015,h*.40,.18,x,h*.73,-d*.235);back.rotation.x=-.13;}
  for(const x of chair?[0]:[-w*.31,w*.31]){const v=soft(Math.min(.34,w*.43),.32,.13,x,h*.65,d*.02,p.rust,.52);v.rotation.set(-.18,0,x<0?.17:-.17);}
 }
 else if(k==='chair'){
  for(const x of [-1,1])for(const z of [-1,1])rod([x*w*.39,.01,z*d*.38],[x*w*.30,h*.50,z*d*.27],.018,p.walnut);
  soft(w,.075,d*.86,0,h*.52,.015,p.ivory,.3);
  // Continuous curved bentwood back shell, with an upholstered inner face.
  const shell=(material,depth)=>{const points=[],indices=[],uv=[];const n=24;for(let j=0;j<=1;j++)for(let i=0;i<=n;i++){const a=(i/n-.5)*2.45;points.push(Math.sin(a)*w*.51,h*(j?.99:.66),-Math.cos(a)*d*.40+depth);uv.push(i/n,j);}for(let i=0;i<n;i++){const a=i,b=i+1,c=i+n+1,e=i+n+2;indices.push(a,c,b,b,c,e);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const mt=material.clone();mt.side=T.DoubleSide;const v=mesh(geo,mt);v.userData.ownMaterial=true;v.userData.sharedMaps=true;};
  shell(p.wood,0);shell(p.ivory,.008);
  for(const x of [-1,1])rod([x*w*.34,h*.48,-d*.28],[x*w*.34,h*.82,-d*.29],.013,p.walnut);
 }
 else if(k==='table'){
  b(w,.045,d,0,h-.023,0,p.wood);
  for(const x of [-1,1]){b(.10,h-.07,d*.58,x*w*.29,(h-.07)/2,0,p.walnut);b(.24,.022,d*.64,x*w*.29,.012,0,p.black);}
 }
 else if(k==='roundTable'){
  lathe([[0,0],[w*.21,0],[w*.24,.022],[w*.13,h*.15],[w*.085,h-.065],[w*.48,h-.065],[w*.5,h-.047],[w*.5,h-.014],[w*.48,h],[0,h]],p.wood);
 }
 else if(k==='island'){
  b(w-.08,.065,d-.12,0,.035,0,p.black);b(w-.05,h-.1,d-.08,0,h/2,0,p.walnut);
  const n=Math.floor(d/.045);for(const x of [-1,1])for(let i=0;i<n;i++)b(.018,h-.14,.023,x*(w/2-.022),h/2,-d/2+.045+(i+.5)*(d-.09)/n,p.wood,false);
  b(w,.04,d,0,h-.02,0,mat('#d9d3c6',{roughness:.36}));for(const z of [-1,1]){b(w-.065,h-.13,.018,0,h/2,z*(d/2-.025),p.wood);b(w*.7,.008,.012,0,h-.13,z*(d/2-.012),p.black);}
 }
 else if(k==='toilet'){
  soft(w*.67,h*.48,d*.69,0,h*.29,0,p.ceramic,.58);soft(w,.13,d*.83,0,h*.66,d*.04,p.ceramic,.53);
  const seat=mesh(new T.TorusGeometry(1,.11,8,40),p.ceramic,0,h*.76,d*.04);seat.rotation.x=Math.PI/2;seat.scale.set(w*.39,d*.31,.11);
  soft(w*.69,.015,d*.55,0,h*.74,d*.04,p.black,.5);soft(w*.86,.028,d*.76,0,h*.81,d*.02,p.ceramic,.42);
 }
 else if(k==='projector'){
  b(w,h,d,0,h/2,0,p.ceramic);const lensX=w*.23,lensY=h*.5;
  for(const [r,depth,z,material]of [[h*.34,.016,d/2,p.black],[h*.28,.016,d/2+.012,p.metal],[h*.235,.01,d/2+.025,mat('#244457',{metalness:.55,roughness:.12})],[h*.14,.003,d/2+.031,mat('#6a93ad',{metalness:.5,roughness:.08})]]){const v=cylinder(g,r,depth,lensX,lensY,z,material,32);v.rotation.x=Math.PI/2;}
  for(let i=0;i<9;i++)b(w*.31,.003,.005,-w*.23,h*.20+i*h*.063,d/2+.003,p.black,false);
  for(let i=0;i<5;i++)b(.006,.003,d*.45,-w*.32+i*.016,h+.001,-d*.02,p.black,false);
  b(.008,.003,.008,w*.31,h+.002,-d*.28,mat('#76ad99'));g.userData.lensLocal=[lensX,lensY,d/2+.033];
 }
 else if(k==='screen'){
  b(w,h,d,0,h/2,0,p.ceramic);const sh=w*.96*9/16;
  b(w*.98,sh+.025,.012,0,-sh/2,0,p.black,false);b(w*.96,sh,.004,0,-sh/2,.008,mat('#eeeae2',{roughness:1}),false);
  b(w*.99,.022,.027,0,-sh-.01,0,p.black);for(const x of [-w*.43,w*.43])b(.027,.05,.035,x,h+.015,0,p.metal);
 }
 else if(k==='tv'){
  b(w,h,d,0,h/2,0,p.black);b(w-.012,h-.012,.004,0,h/2,d/2+.001,p.metal,false);
  // Deterministic, original landscape artwork shared by all televisions.
  const key='tvArtwork';if(!p[key]){const n=256,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){let color=[177-y*.13,190-y*.11,180-y*.07];for(let j=0;j<4;j++)if(y>98+j*24+Math.sin(x*.022+j*1.3)*15+Math.sin(x*.048+j)*7)color=[[125,151,144],[91,122,117],[60,91,87],[37, 60,61]][j];const i=(y*n+x)*4;data.set([...color,255],i);}const tx=new T.DataTexture(data,n,n,T.RGBAFormat);tx.colorSpace=T.SRGBColorSpace;tx.needsUpdate=true;tx.magFilter=T.LinearFilter;p[key]=new T.MeshStandardMaterial({map:tx,roughness:.2,metalness:.15,emissive:'#ffffff',emissiveMap:tx,emissiveIntensity:.14});}
  b(w-.021,h-.021,.002,0,h/2,d/2+.005,p[key],false);b(w*.30,h*.25,.026,0,h*.52,-d/2-.014,p.black);b(.005,.002,.002,w*.42,.008,d/2+.008,p.ivory,false);
 }
 g.userData.modelQuality='crafted-v8.7';return true;
}
