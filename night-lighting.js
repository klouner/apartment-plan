import * as THREE from 'three';

// Visual preview, not a lux/IES calculation. Keep the light inventory stable
// while switching groups, avoiding shader recompiles on every button press.
export function nightLighting(scene, objects, getProject) {
  const root = new THREE.Group();
  root.name = 'Fixture lighting';
  root.visible = false;
  scene.add(root);
  const ambient=new THREE.HemisphereLight('#bdcbd8','#746450',.14);root.add(ambient);
  let active = false, saved = null, signature = '', fixtures = [], bounces=[];
  const inside = (x,z,poly) => {
    let yes=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
      const a=poly[i],b=poly[j];
      if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;
    }
    return yes;
  };
  function clear() {
    for(const child of [...root.children]) {
      if(child===ambient)continue;
      child.shadow?.map?.dispose(); child.shadow?.mapPass?.dispose();
      root.remove(child);
    }
    fixtures=[];bounces=[];signature='';
  }
  function apply(state) {
    if(!active)return;
    const p=getProject();
    const records=(p.electrical?.circuits||[]).filter(c=>c.type==='lighting')
      .flatMap(c=>c.consumers.map(id=>({c,o:p.objects.find(o=>o.id===id),g:objects.get(id)})))
      .filter(v=>v.o&&v.g&&['light','pendant','track'].includes(v.o.kind));
    const next=JSON.stringify(records.map(({c,o})=>[c.id,o.id,o.position,o.rotation,o.scale,o.size]));
    if(next!==signature) {
      clear(); signature=next;
      scene.updateMatrixWorld(true);
      for(const {c,o,g} of records) {
        const offset=o.kind==='pendant'?-o.size[1]-.025:-o.size[1]/2-.025;
        const position=g.localToWorld(new THREE.Vector3(0,offset,0));
        // Soft, downward beam at the actual fixture, not a painted floor disc.
        const angle=o.kind==='track'?.85:o.kind==='pendant'?1.10:1.02;
        const light=new THREE.SpotLight('#ffe2ba',0,8,angle,1,2);
        light.position.copy(position);light.target.position.copy(position).add(new THREE.Vector3(0,-1,0));
        light.userData.fixtureId=o.id;light.userData.circuit=c.id;
        // No per-fixture shadow-map passes: dozens of them stall mobile GPUs.
        // Beam falloff is real; occlusion is approximate in this lightweight preview.
        root.add(light,light.target);
        fixtures.push({light,circuit:c.id,kind:o.kind,position:position.toArray(),
          room:p.rooms.find(r=>inside(position.x,position.z,r.polygon))?.polygon});
      }
      // One low-energy diffuse proxy per room approximates reflected light.
      // This is deliberately labelled a preview, not a global illumination solver.
      for(const r of p.rooms){const members=fixtures.filter(f=>f.room===r.polygon);if(!members.length)continue;const x=members.reduce((n,f)=>n+f.position[0],0)/members.length,z=members.reduce((n,f)=>n+f.position[2],0)/members.length;const light=new THREE.PointLight('#ffe5c7',0,5,2);light.position.set(x,1.65,z);root.add(light);bounces.push({light,members});}
    }
    for(const f of fixtures)f.light.intensity=state.lights[f.circuit]?(f.kind==='track'?85:f.kind==='pendant'?38:42):0;
    for(const b of bounces)b.light.intensity=Math.min(6,Math.sqrt(b.members.filter(f=>f.light.intensity>0).length)*2.0);
    scene.userData.homeNight={active:true,lamps:fixtures.filter(f=>f.light.intensity>0).map(f=>({position:f.position,room:f.room,radius:f.kind==='pendant'?2.3:2.7}))};
  }
  function setActive(value) {
    if(value===active)return;
    active=value;root.visible=value;
    if(value) {
      const lights=[];
      scene.traverse(o=>{if(o.isLight&&!root.children.includes(o)){lights.push([o,o.intensity]);o.intensity=0;}});
      saved={lights,background:scene.background,environment:scene.environment};
      scene.background=new THREE.Color('#020408');scene.environment=null;
      scene.userData.homeNight={active:true,lamps:[]};
    } else {
      for(const [light,intensity] of saved?.lights||[])light.intensity=intensity;
      if(saved){scene.background=saved.background;scene.environment=saved.environment;}
      delete scene.userData.homeNight;clear();saved=null;
    }
  }
  return {apply,setActive};
}
