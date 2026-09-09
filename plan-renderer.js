import * as THREE from 'three';
// Software top-view renderer for devices where WebGL is disabled.
// Shares the same scene, coordinates, selection and project state.
export function createPlanRenderer(){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');let width=1,height=1,dpr=1;
 const project=(p,c)=>{p.project(c);return [(p.x+1)*width/2,(1-p.y)*height/2];};
 return {domElement:canvas,shadowMap:{},setPixelRatio(v){dpr=v;},setSize(w,h){width=w;height=h;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';},setAnimationLoop(fn){let previous=0;function frame(t){requestAnimationFrame(frame);if(t-previous>32){previous=t;fn();}}requestAnimationFrame(frame);},render(scene,camera){
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);scene.traverse(o=>{if(o.isLOD)o.update(camera);});ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=1;ctx.fillStyle='#111b24';ctx.fillRect(0,0,width,height);
 const drawPath=(pts,fill,stroke,alpha=1,weight=.8)=>{if(pts.length<2)return;ctx.globalAlpha=alpha;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=weight;ctx.stroke();}ctx.globalAlpha=1;};
 const meshes=[];scene.traverseVisible(o=>{if(o.isMesh&&!o.isInstancedMesh){let parent=o,skip=false;while(parent){if(parent.type.startsWith('TransformControls'))skip=true;parent=parent.parent;}if(!skip)meshes.push(o);}});
 const order=o=>o.geometry.type==='TubeGeometry'?(o.userData.highlight?200:100):new THREE.Vector3().setFromMatrixPosition(o.matrixWorld).y;meshes.sort((a,b)=>order(a)-order(b));
 for(const o of meshes){const geo=o.geometry,m=Array.isArray(o.material)?o.material[0]:o.material;if(!m||m.visible===false)continue;const color=m.color?'#'+m.color.getHexString():'#d4e0e4';
 if(geo.type==='TubeGeometry'){drawPath(geo.parameters.path.getPoints(48).map(p=>project(p.applyMatrix4(o.matrixWorld),camera)),null,color,m.opacity,o.userData.highlight?4:1.6);continue;}
 const shape=geo.parameters?.shapes;if(shape){drawPath(shape.getPoints().map(p=>project(new THREE.Vector3(p.x,0,-p.y).applyMatrix4(o.matrixWorld),camera)),color,null,m.opacity);continue;}
 if(!geo.boundingBox)geo.computeBoundingBox();const b=geo.boundingBox;if(!b)continue;const pts=[[b.min.x,b.min.z],[b.max.x,b.min.z],[b.max.x,b.max.z],[b.min.x,b.max.z]].map(([x,z])=>project(new THREE.Vector3(x,b.max.y,z).applyMatrix4(o.matrixWorld),camera));
 if(m.map?.image&&geo.type==='PlaneGeometry'){const image=m.map.image;const a=project(new THREE.Vector3(-geo.parameters.width/2,geo.parameters.height/2,0).applyMatrix4(o.matrixWorld),camera),b=project(new THREE.Vector3(geo.parameters.width/2,-geo.parameters.height/2,0).applyMatrix4(o.matrixWorld),camera);ctx.globalAlpha=m.opacity;ctx.drawImage(image,a[0],a[1],b[0]-a[0],b[1]-a[1]);ctx.globalAlpha=1;}else drawPath(pts,color,'#50616a',m.opacity);
 }
 scene.traverseVisible(o=>{if(o.type==='BoxHelper'){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i+=2){const p=project(new THREE.Vector3().fromBufferAttribute(a,i),camera),q=project(new THREE.Vector3().fromBufferAttribute(a,Math.min(i+1,a.count-1)),camera);drawPath([p,q],null,'#65dafa');}}if(o.isSprite&&o.material.map?.image){const p=project(o.getWorldPosition(new THREE.Vector3()),camera);ctx.drawImage(o.material.map.image,p[0]-70,p[1]-14,140,28);}});
 }};
}
