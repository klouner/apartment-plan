import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from './vendor/three.module.js';
const source=fs.readFileSync(new URL('./night-lighting.js',import.meta.url),'utf8').replace("'three'",JSON.stringify(new URL('./vendor/three.module.js',import.meta.url).href));
const {nightLighting}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const p=JSON.parse(fs.readFileSync(new URL('./project.json',import.meta.url))),scene=new THREE.Scene(),objects=new Map();
for(const o of p.objects){const g=new THREE.Group();g.position.fromArray(o.position);scene.add(g);objects.set(o.id,g);}
const sun=new THREE.DirectionalLight(0xffffff,3.8),sky=new THREE.HemisphereLight(0xffffff,0x666666,2.8);scene.add(sun,sky);const background=new THREE.Color('#112233');scene.background=background;
const preview=nightLighting(scene,objects,()=>p);
preview.setActive(true);preview.setActive(true);assert.equal(sun.intensity,0);assert.equal(sky.intensity,0);
preview.apply({lights:{}});const root=scene.getObjectByName('Fixture lighting'),lights=root.children.filter(o=>o.isSpotLight);assert.ok(lights.length>=58);assert.ok(lights.every(l=>l.intensity===0));
preview.apply({lights:{'C-L01':true}});assert.ok(lights.some(l=>l.intensity>0));assert.ok(lights.filter(l=>l.userData.circuit!=='C-L01').every(l=>l.intensity===0));assert.equal(root.children.filter(o=>o.isSpotLight)[0],lights[0]);assert.ok(scene.userData.homeNight.lamps.every(l=>l.position.every(Number.isFinite)));
preview.apply({lights:{}});assert.equal(scene.userData.homeNight.lamps.length,0);
preview.setActive(false);assert.equal(root.children.length,0);assert.equal(sun.intensity,3.8);assert.equal(sky.intensity,2.8);assert.equal(scene.background,background);assert.equal(scene.userData.homeNight,undefined);
preview.setActive(true);preview.apply({lights:{'C-L01':true}});preview.setActive(false);assert.equal(sun.intensity,3.8);
console.log('PASS: daylight off; fixture-position spotlights; independent groups; stable light inventory; zero active lamps when off; daylight restored on repeated close.');
