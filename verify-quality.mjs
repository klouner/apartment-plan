import fs from 'node:fs';import assert from 'node:assert/strict';import * as THREE from './vendor/three.module.js';
import {migrate86,mountingAudit,syncMounts} from './quality-model.js';import {validate,clone} from './model.js';import {detailedModel} from './object-models.js';
const input=JSON.parse(fs.readFileSync(new URL('./project.json',import.meta.url))),p=migrate86(input);validate(p);assert.deepEqual(mountingAudit(p),[]);assert.deepEqual(migrate86(p),p);
assert.equal(p.objects.filter(o=>o.kind==='socket').length,input.objects.filter(o=>o.kind==='socket').length);
assert.equal(p.objects.find(o=>o.id==='LAN-4').kind,'accessPoint');assert.equal(p.routes.filter(r=>r.to==='LAN-4').length,1);
const edited=clone(input);edited.objects.find(o=>o.id==='TV-BED').position=[6,1.5,2];assert.deepEqual(migrate86(edited).objects.find(o=>o.id==='TV-BED').position,[6,1.5,2]);
const mounted=p.objects.find(o=>o.id==='SW-03'),w=p.walls.find(w=>w.id===mounted.mount.wallId),old=mounted.position[2];for(const id of [w.a,w.b])p.nodes.find(n=>n.id===id).position[1]-=.05;syncMounts(p);assert.ok(Math.abs(mounted.position[2]-old+.05)<.0001);
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},fillText(){}})})};
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,...extra});const materials=Object.fromEntries(['white','stone','oak','dark','metal','linen','fabric','glass'].map(k=>[k,mat('#aaaaaa')]));
const box=(g,w,h,d,x,y,z,m)=>{const v=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);v.position.set(x,y,z);g.add(v);return v;};const cylinder=(g,r,h,x,y,z,m,n)=>{const v=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,n),m);v.position.set(x,y,z);g.add(v);return v;};
for(const o of p.objects){const g=new THREE.Group();detailedModel(g,o,{THREE,box,cylinder,mat,materials,project:p});g.traverse(m=>{if(m.geometry)assert.ok([...m.geometry.attributes.position.array].every(Number.isFinite),o.id);});if(['PIANO','PL-02','PL-05','LAN-4','PANEL-LV'].includes(o.id))assert.ok(g.children.length>4,o.id);}
console.log('PASS: socket inventory retained; no unsupported wall points/opening overlaps; manual TV edit preserved; wall mounts follow layout; AP connected; all new meshes finite.');
