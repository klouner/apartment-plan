import assert from 'node:assert/strict';import fs from 'node:fs';
import {migrate84} from './migration-v84.js';import {orthogonal} from './editing.js';import {movePanelItem} from './panel-editor.js';import {validate,clone} from './model.js';import {frontClearance} from './access-check.js';
const p=JSON.parse(fs.readFileSync(new URL('./project.json',import.meta.url)));validate(p);assert.deepEqual(migrate84(p),p);
for(const c of p.electrical.circuits.filter(c=>c.type==='lighting'))assert.equal(p.routes.filter(r=>r.circuit===c.id&&r.from==='PANEL').length,1,c.id);
assert.deepEqual(p.electrical.circuits.find(c=>c.id==='C-L10').consumers,['PENDANT-3','PENDANT-4']);assert.deepEqual(p.electrical.circuits.find(c=>c.id==='C-L13').consumers,['PENDANT-0','PENDANT-1','PENDANT-2']);
const route=orthogonal([[1,0,2],[3,2,5],[6,1,4]]);for(let i=1;i<route.length;i++)assert.equal(route[i].filter((x,j)=>x!==route[i-1][j]).length,1);
const q=clone(p);movePanelItem(q,'MR-01',3,4);validate(q);assert.equal(q.electrical.modules.find(m=>m.id==='MR-01').row,4);assert.throws(()=>movePanelItem(q,'MR-02',0,8));
assert.ok(frontClearance(p,p.objects.find(o=>o.id==='KITCHEN-01'))>1);
console.log('PASS v8.4: idempotent migration; one feeder per light group; island/dining separation; orthogonal routes; collision-safe DIN placement; kitchen access estimate.');
