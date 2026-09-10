import * as T from './vendor/three.module.js';
const up=new T.Vector3(0,1,0),forward=new T.Vector3(0,0,1);
export function projectionInfo(p,o){
 const screen=p.objects.find(s=>s.id===(o.projectionScreenId||'SCREEN')&&s.kind==='screen')||p.objects.find(s=>s.kind==='screen');if(!screen)return null;
 const sm=new T.Matrix4().compose(new T.Vector3(...screen.position),new T.Quaternion().setFromEuler(new T.Euler(...screen.rotation)),new T.Vector3(...screen.scale));
 const target=new T.Vector3(0,-screen.size[0]*.96*9/32,.011).applyMatrix4(sm),origin=new T.Vector3(...o.position),local=new T.Vector3(o.size[0]*.23,o.size[1]*.5,o.size[2]/2+.033).multiply(new T.Vector3(...o.scale));
 const q=new T.Quaternion().setFromEuler(new T.Euler(...o.rotation)),lens=local.clone().applyQuaternion(q).add(origin);
 const ray=forward.clone().applyQuaternion(q),toTarget=target.clone().sub(lens),normal=forward.clone().transformDirection(sm);
 return {screen,target,lens,ray,distance:toTarget.length(),error:ray.angleTo(toTarget),offAxis:normal.angleTo(toTarget.clone().negate())*180/Math.PI,throwRatio:toTarget.length()/(screen.size[0]*.96*Math.abs(screen.scale[0]))};
}
export function syncProjection(p){
 for(const o of p.objects.filter(o=>o.kind==='projector')){
  if(o.projectionAutoAim===false)continue;
  o.projectionAutoAim=true;
  // Account for the off-centre lens, not just the case centre.
  for(let i=0;i<12;i++){const info=projectionInfo(p,o);if(!info)break;const q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(info.target,info.lens,up));o.rotation=new T.Euler().setFromQuaternion(q,'XYZ').toArray().slice(0,3);}
 }
}
export function projectorMount(g,o,ceiling=3.2){
 if(o.kind!=='projector')return;g.updateMatrixWorld(true);
 const start=new T.Vector3(0,o.size[1],0).applyMatrix4(g.matrixWorld),end=new T.Vector3(start.x,ceiling,start.z);if(end.y<=start.y)return;
 const inverse=g.matrixWorld.clone().invert();start.applyMatrix4(inverse);end.applyMatrix4(inverse);
 const material=new T.MeshStandardMaterial({color:'#555e5d',metalness:.65,roughness:.38});
 const rod=new T.Mesh(new T.CylinderGeometry(.011,.011,start.distanceTo(end),12),material);rod.position.copy(start).add(end).multiplyScalar(.5);rod.quaternion.setFromUnitVectors(up,end.clone().sub(start).normalize());rod.userData.ownMaterial=true;g.add(rod);
 const plate=new T.Mesh(new T.CylinderGeometry(.045,.012, .012,20),material.clone());plate.position.copy(end);plate.quaternion.setFromUnitVectors(up,end.clone().sub(start).normalize());plate.userData.ownMaterial=true;g.add(plate);
}
