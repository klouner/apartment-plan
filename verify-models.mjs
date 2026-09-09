import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from './vendor/three.module.js';import {detailedModel} from './object-models.js';
// Exercise geometry construction without requiring a GPU. Canvas is only a label bitmap.
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},fillText(){}})})};
const p=JSON.parse(fs.readFileSync(new URL('./project.json',import.meta.url)));const mat=c=>new THREE.MeshStandardMaterial({color:c});const materials=Object.fromEntries(['white','stone','oak','dark','metal','linen','fabric'].map(k=>[k,mat('#aaaaaa')]));
const box=(g,w,h,d,x,y,z,m)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);g.add(mesh);return mesh;};const cylinder=(g,r,h,x,y,z,m,n)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,n),m);mesh.position.set(x,y,z);g.add(mesh);return mesh;};let count=0;
for(const o of p.objects){const g=new THREE.Group();if(detailedModel(g,o,{THREE,box,cylinder,mat,materials,project:p})){count++;g.traverse(m=>{if(m.geometry)for(const v of m.geometry.attributes.position.array)assert.ok(Number.isFinite(v),o.id+' invalid vertex');});}}
assert.ok(count>40);console.log('PASS: '+count+' detailed object meshes constructed; all vertices finite, including panel routing.');
