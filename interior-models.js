// All models use metres and the source footprint. +Z is the front.
export function interiorModel(g,o,{THREE,box,cylinder,mat,materials:m}){
 const [w,h,d]=o.size,k=o.kind;
 const b=(a,c,e,x,y,z,material=m.white,r=false)=>box(g,a,c,e,x,y,z,material,r);
 const cyl=(r,hh,x,y,z,material=m.metal)=>cylinder(g,r,hh,x,y,z,material,20);
 const tube=(points,r,material=m.metal)=>{const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,20,r,6,false),material);g.add(mesh);return mesh;};
 const cream=mat('#dcd4c7',{roughness:.96}),walnut=mat('#72543e',{roughness:.7}),black=mat('#172021',{roughness:.48}),brass=mat('#b89b60',{metalness:.65,roughness:.35});
 if(k==='bed'){
  b(w,.20,d,0,.24,0,walnut,true);b(w-.06,.20,d-.12,0,.43,.025,cream,true);b(w-.04,.08,d*.68,0,.55,d*.12,m.linen,true);
  b(w+.04,.82,.09,0,.52,-d/2+.02,cream,true);for(const x of [-w*.43,w*.43])for(const z of [-d*.42,d*.42])b(.05,.16,.05,x,.08,z,walnut);
  for(const x of [-w*.24,w*.24]){const pillow=b(w*.40,.11,d*.18,x,.59,-d*.32,m.linen,true);pillow.rotation.x=-.08;}
  b(w*.98,.018,d*.20,0,.60,d*.28,mat('#7d8e84',{roughness:1}),true);for(let i=0;i<8;i++)b(w*.96,.002,.002,0,.61,d*.20+i*.025,cream);
 }
 else if(k==='sofa'){
  for(const x of [-w*.42,w*.42])for(const z of [-d*.34,d*.34])b(.035,.13,.035,x,.065,z,black);
  b(w,.20,d,0,.23,0,cream,true);b(w,.49,.20,0,.56,-d*.39,cream,true);
  for(const x of [-1,1])b(.17,.43,d,x*(w/2-.085),.42,0,cream,true);
  const n=Math.max(2,Math.round(w/.8));for(let i=0;i<n;i++){const x=-w/2+.19+(i+.5)*(w-.38)/n;b((w-.38)/n-.013,.14,d*.69,x,.40,d*.055,m.fabric,true);const cushion=b((w-.38)/n-.02,.38,.16,x,.62,-d*.22,cream,true);cushion.rotation.x=-.10;}
  for(const x of [-w*.33,w*.33]){const pillow=b(.31,.31,.11,x,.59,d*.08,mat('#9c795e'),true);pillow.rotation.z=x<0?.16:-.16;}
 }
 else if(k==='chair'){
  for(const x of [-w*.32,w*.32])for(const z of [-d*.30,d*.30]){const leg=b(.024,.43,.024,x,.215,z,walnut,true);leg.rotation.z=x<0?.055:-.055;}
  b(w,.08,d*.9,0,.46,0,cream,true);const back=b(w*.94,.37,.065,0,.69,-d*.40,cream,true);back.rotation.x=-.12;for(const x of [-w*.36,w*.36])b(.021,.36,.021,x,.53,-d*.36,walnut);
 }
 else if(k==='cabinet'){
  b(w,.07,d*.82,0,.065,0,black);b(w,h-.1,d,0,(h+.1)/2,0,walnut);
  const n=Math.max(1,Math.round(w/.55));for(let i=0;i<n;i++){const x=-w/2+(i+.5)*w/n;b(w/n-.007,h-.12,.018,x,(h+.1)/2,d/2+.005,cream);b(.008,Math.min(.26,h*.25),.017,x+w/n*.33,h*.60,d/2+.024,brass);}
  b(w+.015,.025,d+.015,0,h+.008,0,walnut);if(h<1.2)b(w*.92,.055,d*.83,0,h+.045,0,m.linen,true);
 }
 else if(k==='washer'){
  b(w,h,d,0,h/2,0,m.white,true);b(w-.03,.08,.008,0,h-.07,d/2+.008,cream);b(.13,.035,.008,w*.19,h-.07,d/2+.014,black);
  for(const [radius,depth,z,material]of [[.215,.028,d/2+.015,m.metal],[.179,.02,d/2+.035,black],[.145,.015,d/2+.052,mat('#435960',{metalness:.4,roughness:.2})]]){const disk=cyl(radius,depth,0,h*.47,z,material);disk.rotation.x=Math.PI/2;}
  const dial=cyl(.025,.01,-w*.25,h-.07,d/2+.02,m.metal);dial.rotation.x=Math.PI/2;
  b(w*.8,.009,.004,0,.055,d/2+.013,m.stone);
 }
 else if(k==='piano'){
  // Upright piano: continuous case, fallboard, keybed, cheek blocks and pedals.
  b(w,h,.20,0,h/2,-d/2+.10,black,true);b(w+.018,.035,d*.58,0,h,-d*.19,black,true);
  b(w-.055,.28,.018,0,.36,-d*.05,walnut);b(w-.12,.24,.012,0,h-.19,-d*.08,black);
  for(const x of [-1,1]){b(.07,.67,d*.8,x*(w/2-.045),.335,.035,black);b(.075,.055,d*.92,x*(w/2-.045),.04,.015,black,true);}
  b(w,.045,d*.62,0,.705,d*.18,black);b(w-.13,.065,.035,0,.785,0,black);
  const n=52,kw=(w-.16)/n;
  // 52 white + 36 black keys, A0 through C8.
  for(let i=0;i<n;i++){b(kw-.001,.018,.18,-(w-.16)/2+kw*(i+.5),.738,d*.24,m.white);if([0,2,3,5,6].includes(i%7)&&i<n-1)b(kw*.55,.018,.105,-(w-.16)/2+kw*(i+1),.754,d*.17,black);}
  b(.28,.02,.028,0,h-.12,-d*.04,brass);for(const x of [-.07,0,.07])b(.022,.013,.09,x,.09,d*.32,brass,true);
  // Music rest with two feet, anchored to the fallboard.
  b(w*.46,.15,.018,0,.91,-d*.05,black);for(const x of [-w*.18,w*.18])b(.015,.1,.015,x,.80,-d*.05,black);
 }
 else if(k==='shower'){
  const glass=mat('#bad8df',{transparent:true,opacity:.16,depthWrite:false,roughness:.15,metalness:.05});
  b(w,.045,d,0,.0225,0,mat('#c9c5bc'),true);b(w*.72,.004,.028,0,.049,-d*.3,m.dark);
  // Side glazing rests in floor and wall channels; mixer connects to riser.
  b(.012,h-.09,d,-w/2+.013,h/2+.02,0,glass);b(.025,.025,d,-w/2+.013,.06,0,m.metal);
  for(const z of [-d/2+.02,d/2-.02])b(.018,h-.04,.018,-w/2+.013,h/2,z,m.metal);
  b(w*.5,.012,.016,-w*.24,h,-d/2+.03,m.metal);
  const x=w*.25,z=-d/2+.045;
  b(.15,.07,.035,x,1.08,z,m.metal,true);b(.022,.97,.025,x,1.59,z,m.metal);
  tube([[x,2.04,z],[x,2.09,z+.06],[x,2.09,z+.28]],.011);cyl(.12,.016,x,2.08,z+.28,black);
  tube([[x-.05,1.08,z+.02],[x-.12,.66,z+.07],[x+.04,.7,z+.08],[x+.07,1.35,z+.07]],.007);
  b(.028,.15,.025,x+.07,1.39,z+.07,m.metal,true);b(.18,.035,.09,-w*.20,1.14,z,m.metal);
 }
 else if(k==='ac'){
  b(w,h,d,0,h/2,0,cream,true);b(w*.94,h*.60,.025,0,h*.64,d/2,mat('#f6f5ef'),true);
  b(w*.85,.045,.035,0,h*.16,d/2+.002,black,true);
  for(let i=0;i<12;i++)b(.004,.025,.036,(i-5.5)*w*.067,h*.16,d/2+.007,m.metal);
  const flap=b(w*.86,.008,.07,0,h*.12,d/2+.02,m.white);flap.rotation.x=.35;
  b(.026,.012,.002,w*.34,h*.43,d/2+.018,mat('#789b90'));
 }
 else if(k==='tv'){
  b(w,h,d,0,h/2,0,black,true);b(w-.018,h-.021,.004,0,h/2,d/2+.004,mat('#15282f',{roughness:.23,metalness:.4}));
  // Quiet abstract artwork on screen, with a thin metal bezel and indicator.
  b(w*.58,h*.92,.001,-w*.18,h*.5,d/2+.007,mat('#263c46'));b(w*.38,h*.38,.001,w*.17,h*.36,d/2+.009,mat('#a68463'));
  const disk=cyl(h*.24,.001,w*.12,h*.61,d/2+.010,mat('#a7b4aa'));disk.rotation.x=Math.PI/2;
  b(w*.8,.006,.001,0,.014,d/2+.011,m.metal);b(.007,.003,.002,w*.4,.014,d/2+.014,mat('#b9d6c8'));
  b(w*.32,.16,.045,0,h/2,-d/2-.014,black);
 }
 else if(k==='speaker'||k==='soundbar'){
  b(w,h,d,0,h/2,0,black,true);b(w-.02,h-.025,.006,0,h/2,d/2+.002,mat('#394142',{roughness:1}),true);
  const count=k==='speaker'?16:36;for(let i=0;i<count;i++)b(.002,h*.78,.002,-w*.43+i*w*.86/(count-1),h/2,d/2+.006,mat('#151e20'));
  if(k==='speaker'){for(const x of [-w*.34,w*.34])for(const z of [-d*.32,d*.32])cyl(.018,.028,x,.014,z,black);}else b(.013,.004,.004,w*.38,h*.65,d/2+.01,mat('#8fac9d'));
 }
 else if(k==='accessPoint'){
  b(w,h,d,0,h/2,0,m.white,true);b(w*.88,.008,d*.88,0,.002,0,cream,true);
  for(let i=0;i<9;i++)b(w*.54,.002,.002,0,-.003,(i-4)*.009,m.stone);
  b(.035,.002,.002,0,-.005,d*.31,mat('#6daca8',{emissive:'#3e756c',emissiveIntensity:.15}));
 }
 else if(k==='panel'&&o.id==='PANEL-LV'){
  b(w,h,.025,0,h/2,-d/2,black);for(const x of [-1,1])b(.025,h,d,x*w/2,h/2,0,m.metal);for(const y of [0,h])b(w,.025,d,0,y,0,m.metal);
  const slots=[{y:h-.12,n:8},{y:h-.29,n:8},{y:h-.48,n:5}];
  for(const row of slots){b(w*.86,.08,.12,0,row.y,0,m.metal,true);for(let i=0;i<row.n;i++){const x=(i-(row.n-1)/2)*.048;b(.033,.024,.008,x,row.y,.065,black);b(.003,.003,.004,x+.012,row.y+.022,.069,mat('#70aa83'));}}
  // ONT and gateway on shelves, bundled patch cords in a side organiser.
  b(w*.9,.015,d*.9,0,h-.65,0,m.metal);b(.19,.045,.13,-.12,h-.62,.02,m.white,true);b(.14,.035,.10,.12,h-.62,.02,black,true);
  b(w*.76,.065,.08,0,.12,.04,black,true);for(const x of [-.18,-.06,.06,.18]){const port=cyl(.016,.006,x,.12,.085,m.stone);port.rotation.x=Math.PI/2;}
  for(let i=0;i<4;i++){const x=(i-1.5)*.048;tube([[x,h-.12,.072],[x,h-.17,.10],[w*.35,h-.19-i*.016,.11],[w*.35,h-.25-i*.016,.11],[x,h-.29,.073]],.0035,mat('#5298ba'));}
  // Labels are geometry-native and supplied by the existing label helper.
  g.userData.rackLabels=[['PATCH · 1 TV  2 BED  3 CHILD  4 AP',h-.12],['PoE SWITCH · 802.3af/at',h-.29],['GATEWAY / LAN',h-.48],['ONT · ISP',h-.73],['POWER · proposed',.12]];
 }
 else if(k==='pendant'){
  cyl(.045,.025,0,.70,0,black);cyl(.003,.70,0,.35,0,black);
  const shade=cyl(w/2,h,0,-h/2,0,o.id.includes('PENDANT-0')?brass:cream);shade.material.side=THREE.DoubleSide;
  cyl(w*.43,.01,0,-h,0,mat('#fff0d0',{emissive:'#fff0d0',emissiveIntensity:.4}));
 }
 else if(k==='light'){
  cyl(w*.53,.014,0,0,0,brass);cyl(w*.43,h,0,-h/3,0,black);cyl(w*.32,.004,0,-h/2-.01,0,mat('#fff1d6',{emissive:'#fff1d6',emissiveIntensity:.45}));
 }
 else if(k==='track'){
  b(w,h,d,0,0,0,black);for(let i=0;i<3;i++){b(.026,.065,.026,0,-.04,(i-1)*d*.36,brass);cyl(.045,.095,0,-.10,(i-1)*d*.36,black);const lamp=cyl(.034,.004,0,-.15,(i-1)*d*.36,mat('#fff1d6',{emissive:'#fff1d6',emissiveIntensity:.4}));lamp.userData.fixtureEmitter=true;}
 }
 else if(k==='wallPanel'){
  b(w,h,d,0,h/2,0,walnut);const n=Math.floor(w/.055);for(let i=0;i<n;i++)b(.028,h,.018,-w/2+(i+.5)*w/n,h/2,d/2+.009,m.oak);
 }
 else if(k==='art'){
  b(w,h,d,0,h/2,0,walnut);b(w-.045,h-.045,.005,0,h/2,d/2+.004,cream);
  b(w*.34,h*.65,.001,-w*.20,h*.5,d/2+.008,mat('#374c4a'));b(w*.32,h*.32,.001,w*.12,h*.35,d/2+.010,mat('#b07755'));
  const disk=cyl(w*.20,.002,w*.13,h*.66,d/2+.012,mat('#c4a46b'));disk.rotation.x=Math.PI/2;
 }
 else return false;
 return true;
}
