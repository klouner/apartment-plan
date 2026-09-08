export const clone=x=>JSON.parse(JSON.stringify(x));
export function wallFrame(project,wall){const a=project.nodes.find(n=>n.id===wall.a).position,b=project.nodes.find(n=>n.id===wall.b).position;const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);return {a,b,dx:dx/length,dz:dz/length,length};}
export function openingPosition(p,o){const w=p.walls.find(w=>w.id===o.wallId),f=wallFrame(p,w);return [f.a[0]+f.dx*(o.offset+o.width/2),o.sillHeight,f.a[1]+f.dz*(o.offset+o.width/2)];}
export function validate(p){
 if(!p||p.schemaVersion!==8||p.projectId!=='vydrino-house'||p.units!=='m')throw Error('Нужен JSON проекта Выдрино версии 8.');
 const all=new Set(),finite=(a,n)=>Array.isArray(a)&&a.length===n&&a.every(v=>Number.isFinite(v)&&Math.abs(v)<1000);
 for(const k of ['nodes','walls','openings','objects','junctionBoxes','routes','rooms','sources','floorPolygon','heatingZones','verification'])if(!Array.isArray(p[k]))throw Error('Нет раздела '+k);
 for(const k of ['nodes','walls','openings','objects','junctionBoxes','routes','rooms','sources','heatingZones']){
 if(p[k].length>3000)throw Error('Слишком много элементов');
 for(const o of p[k]){if(typeof o.id!=='string'||all.has(o.id))throw Error('Повторяющийся или пустой ID');all.add(o.id);}}
 for(const n of p.nodes)if(!finite(n.position,2))throw Error('Некорректные координаты узла');
 for(const w of p.walls){if(!p.nodes.some(n=>n.id===w.a)||!p.nodes.some(n=>n.id===w.b))throw Error('Не найден узел стены');if(!(w.thickness>.01&&w.thickness<2&&w.height>.1&&w.height<10&&wallFrame(p,w).length>.03))throw Error('Некорректные размеры стены');}
 for(const o of p.openings){const w=p.walls.find(w=>w.id===o.wallId);if(!w||!['window','door'].includes(o.type)||!Number.isFinite(o.offset)||o.offset<0||!(o.width>.05)||!(o.height>.05)||!(o.sillHeight>=0)||o.sillHeight+o.height>w.height+.001||o.offset+o.width>wallFrame(p,w).length+.005)throw Error('Проём '+o.id+' выходит за стену');}
 for(const w of p.walls){let end=-1;for(const o of p.openings.filter(o=>o.wallId===w.id).sort((a,b)=>a.offset-b.offset)){if(o.offset<end-.001)throw Error('Проёмы пересекаются');end=o.offset+o.width;}}
 for(const o of [...p.objects,...p.junctionBoxes]){if(!finite(o.position,3))throw Error('Некорректный объект');if(o.size&&(!finite(o.size,3)||o.size.some(v=>v<=0||v>30)))throw Error('Некорректный размер');if(o.rotation&&!finite(o.rotation,3))throw Error('Некорректный поворот');if(o.scale&&(!finite(o.scale,3)||o.scale.some(v=>v<=0||v>20)))throw Error('Некорректный масштаб');}
 for(const s of p.sources)if(typeof s.image!=='string'||!/^assets\/blueprint-(?:[0-6]|smart)\.webp$/.test(s.image)||!finite(s.origin,2)||!finite(s.size,2)||s.size.some(v=>v<=0))throw Error('Некорректный чертёж');
 for(const r of p.routes)if(!Array.isArray(r.route)||r.route.length>100||r.route.some(a=>!finite(a,3))||!all.has(r.from)||!all.has(r.to))throw Error('Некорректная трасса');
 for(const r of [...p.rooms,...p.heatingZones,{polygon:p.floorPolygon}])if(!Array.isArray(r.polygon)||r.polygon.length<3||r.polygon.length>2000||r.polygon.some(a=>!finite(a,2)))throw Error('Некорректный контур');
 return true;
}
export function reroute(p,id){for(const r of p.routes){if(r.from!==id&&r.to!==id)continue;const a=[...p.objects,...p.junctionBoxes].find(o=>o.id===r.from)?.position,b=[...p.objects,...p.junctionBoxes].find(o=>o.id===r.to)?.position;if(!a||!b)continue;const h=Math.max(a[1],b[1],2.95);r.route=[a.slice(),[a[0],h,a[2]],[b[0],h,a[2]],[b[0],h,b[2]],b.slice()];r.status='needs_verification';}}
export function removeObject(p,id){p.objects=p.objects.filter(o=>o.id!==id);p.junctionBoxes=p.junctionBoxes.filter(o=>o.id!==id);p.routes=p.routes.filter(o=>o.id!==id&&o.from!==id&&o.to!==id);}
export class History{constructor(p){this.entries=[clone(p)];this.index=0;}push(p){const s=clone(p);if(JSON.stringify(s)===JSON.stringify(this.entries[this.index]))return;this.entries.splice(++this.index);this.entries.push(s);if(this.entries.length>60){this.entries.shift();this.index--;}}undo(){if(this.index>0)return clone(this.entries[--this.index]);}redo(){if(this.index<this.entries.length-1)return clone(this.entries[++this.index]);}}
