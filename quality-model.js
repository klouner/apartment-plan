import {clone,wallFrame,reroute,recalculateElectrical} from './model.js?v=8.4.0';

const round=n=>+n.toFixed(5);
export function attachWall(p,o,wallId,side){
 const w=p.walls.find(w=>w.id===wallId);if(!w)return false;
 const f=wallFrame(p,w),half=(o.size[0]*(o.scale?.[0]||1))/2+.012;
 let t=(o.position[0]-f.a[0])*f.dx+(o.position[2]-f.a[1])*f.dz;
 let spans=[[half,f.length-half]];
 for(const a of p.openings.filter(a=>a.wallId===w.id&&o.position[1]<a.sillHeight+a.height&&o.position[1]+o.size[1]>a.sillHeight)){
  spans=spans.flatMap(([lo,hi])=>[[lo,Math.min(hi,a.offset-half)],[Math.max(lo,a.offset+a.width+half),hi]].filter(([a,b])=>a<=b));
 }
 if(!spans.length){o.placementStatus='needs_verification';return false;}
 t=spans.map(([a,b])=>Math.max(a,Math.min(b,t))).sort((a,b)=>Math.abs(a-t)-Math.abs(b-t))[0];
 const nx=-f.dz*side,nz=f.dx*side,depth=(o.size[2]*(o.scale?.[2]||1))/2+(o.kind==='tv'?.05:.003);
 o.position=[round(f.a[0]+f.dx*t+nx*(w.thickness/2+depth)),o.position[1],round(f.a[1]+f.dz*t+nz*(w.thickness/2+depth))];
 o.rotation=[0,Math.atan2(nx,nz)||0,0];o.mount={kind:'wall',wallId:w.id,offset:round(t),side};o.placementStatus='surface_attached';return true;
}
export function attachNearest(p,o){
 const choices=p.walls.map(w=>{const f=wallFrame(p,w),t=Math.max(0,Math.min(f.length,(o.position[0]-f.a[0])*f.dx+(o.position[2]-f.a[1])*f.dz)),x=f.a[0]+f.dx*t,z=f.a[1]+f.dz*t;return {w,d:Math.hypot(o.position[0]-x,o.position[2]-z),side:((o.position[0]-x)*-f.dz+(o.position[2]-z)*f.dx)>=0?1:-1};}).sort((a,b)=>a.d-b.d);
 for(const a of choices){if(a.d>1)break;if(attachWall(p,o,a.w.id,a.side))return true;}o.placementStatus='needs_verification';return false;
}
export function mountingAudit(p){const issues=[];
 for(const o of p.objects.filter(o=>['socket','switch','data','connection','ac','tv','soundbar'].includes(o.kind))){
  if(o.mount?.kind==='wall'){
   const copy=clone(o);if(!attachWall(p,copy,o.mount.wallId,o.mount.side)||Math.hypot(copy.position[0]-o.position[0],copy.position[2]-o.position[2])>.025)issues.push({id:o.id,reason:'Нет опоры на сплошную поверхность стены / пересечение проёма'});
  }else if(!['ceiling','object'].includes(o.mount?.kind))issues.push({id:o.id,reason:'Не подтверждена монтажная поверхность'});
 }
 return issues;
}
export function syncMounts(p){
 for(const o of p.objects){const m=o.mount;if(m?.kind==='wall'){
  const w=p.walls.find(w=>w.id===m.wallId);if(!w)continue;const f=wallFrame(p,w),nx=-f.dz*m.side,nz=f.dx*m.side;
  o.position[0]=f.a[0]+f.dx*m.offset+nx*(w.thickness/2+o.size[2]/2+.003);o.position[2]=f.a[1]+f.dz*m.offset+nz*(w.thickness/2+o.size[2]/2+.003);attachWall(p,o,w.id,m.side);
 }else if(m?.kind==='object'&&m.objectId==='ISLAND'){
  const parent=p.objects.find(v=>v.id===m.objectId);if(!parent)continue;const a=parent.rotation[1],x=parent.size[0]/2+o.size[2]/2+.003,z=m.localZ??0;
  o.position[0]=parent.position[0]+Math.cos(a)*x+Math.sin(a)*z;o.position[2]=parent.position[2]-Math.sin(a)*x+Math.cos(a)*z;o.rotation=[0,a+Math.PI/2,0];
 }}
 supportedRoutes(p);
}
// Hidden permanent wiring drops within the wall, then a short connection to
// the terminal. Equipment flexes run at equipment/socket height, never from a ceiling.
export function supportedRoutes(p){
 for(const r of p.routes){
  if(r.manualRoute){r.installationNote='Ручной маршрут: проверить опоры, вводы и пересечения';continue;}
  const o=p.objects.find(o=>o.id===r.to);if(!o)continue;
  if(o.mount?.kind==='wall'){
   const w=p.walls.find(w=>w.id===o.mount.wallId),f=wallFrame(p,w),t=o.mount.offset;
   const back=[round(f.a[0]+f.dx*t),o.position[1]+o.size[1]/2,round(f.a[1]+f.dz*t)];
   const a=r.route[0],h=r.voltageClass==='SELV / data'?3.08:2.92;
   const lane=r.route[2]?.[2]??a[2];
   r.route=[a,[a[0],h,a[2]],[a[0],h,lane],[back[0],h,lane],[back[0],h,back[2]],back,[o.position[0],back[1],back[2]],[o.position[0],back[1],o.position[2]]].filter((q,i,arr)=>!i||q.some((v,j)=>Math.abs(v-arr[i-1][j])>.00001));
   r.installation={ceiling:'На опорах над потолком, раздельно с силой/данными',drop:'Скрыто в стене в монтажной системе',terminal:'В подрозетнике/за корпусом',status:'needs_verification'};
  }else if(o.mount?.kind==='object'&&o.mount.objectId==='ISLAND'){
   const a=r.route[0],w=p.walls.find(w=>w.id==='KITCHEN-W2'),f=wallFrame(p,w),x=f.a[0],z=o.position[2];
   r.route=[a,[a[0],2.92,a[2]],[x,2.92,a[2]],[x,2.92,z],[x,-.05,z],[o.position[0],-.05,z],o.position];r.installation={drop:'У стены; далее труба в конструкции пола и ввод в остров',status:'needs_verification'};
  }
 }
 recalculateElectrical(p);
}
export function migrate86(input){const p=clone(input);if(p.visualRevision==='8.6')return p;
 p.qualityChanges=[];
 const obj=id=>p.objects.find(o=>o.id===id);
 function move(id,old,position,wall,side){const o=obj(id);if(!o)return;if(old&&Math.hypot(...o.position.map((v,i)=>v-old[i]))>.04){p.qualityChanges.push(id+': сохранено пользовательское положение; проверить вручную');return;}o.position=position;if(wall)attachWall(p,o,wall,side);o.status='needs_verification';p.qualityChanges.push(id+': исправлено размещение');}
 move('AC-0',[5.2952,2.72,4.0398],[5.2952,2.72,4.0398],'ROW-3',-1);
 move('AC-1',[11.0737,2.72,4.0398],[11.0737,2.72,4.0398],'ROW-5',-1);
 move('AC-2',[11.0737,2.72,4.3362],[11.0737,2.72,4.3362],'ROW-5',1);
 move('TV-BED',[4.79,1.3,2.9],[4.79,1.18,2.05],'BATH-E1',-1);
 move('TV-LIVING',[14.19,1.35,5.25],[14.19,1.2,5.08],'EXT-E',1);
 move('TV-CHILD',[10.59,1.25,2.25],[10.59,1.18,2.2],'CHILD-W',-1);
 move('SOUNDBAR',[14.1,1.13,5.25],[14.1,1.04,5.08],'EXT-E',1);
 move('SUBWOOFER',[13.7,0,5.65],[14.05,0,5.68]);obj('SUBWOOFER').name='Сабвуфер · напольный, рядом с ТВ';
 for(const id of ['TV-LIVING','TV-BED','TV-CHILD','SOUNDBAR','SUBWOOFER']){
  const device=obj(id),out=obj('OUT-'+id);if(!device||!out)continue;
  out.position=[...device.position];out.position[1]=id==='SUBWOOFER'?.26:device.position[1]+.1;attachNearest(p,out);out.name='Скрытый вывод питания · '+device.name;out.deviceId=id;
  for(const r of p.routes.filter(r=>r.to===id)){r.from=out.id;r.route=[out.position,[out.position[0],device.position[1],out.position[2]],device.position];r.manualRoute=true;r.installationNote='Короткий шнур от вывода за устройством; скрыт корпусом/плинтусом';}
 }
 for(const o of p.objects.filter(o=>o.mount?.kind==='wall'&&['socket','switch'].includes(o.kind))){const old=[...o.position];attachWall(p,o,o.mount.wallId,o.mount.side);if(Math.hypot(...old.map((v,i)=>v-o.position[i]))>.03)p.qualityChanges.push(o.id+': точка перенесена со створки/проёма на простенок');}
 const islandOutlet=obj('SOCKET-16');if(islandOutlet?.mount)islandOutlet.mount.localZ=islandOutlet.position[2]-obj('ISLAND').position[2];
 for(const o of p.objects.filter(o=>['data','connection','socket'].includes(o.kind)&&!o.mount)){attachNearest(p,o);}
 for(const id of ['SOCKET-ROUTER','SOCKET-PROJECTOR','SOCKET-SCREEN']){const o=obj(id);if(o){o.rotation=[Math.PI/2,0,0];o.position[1]=3.18;o.mount={kind:'ceiling'};}}
 const lan=obj('LAN-1'),tv=obj('TV-LIVING');if(lan){lan.position=[tv.position[0],1.3,tv.position[2]+.12];attachNearest(p,lan);lan.name='Ethernet за ТВ гостиной';}
 const ap=obj('LAN-4');if(ap){ap.kind='accessPoint';ap.name='MikroTik cAP ax · потолочная точка Wi-Fi 6';ap.position=[8,3.152,5.4];ap.size=[.228,.048,.228];ap.rotation=[0,0,0];ap.mount={kind:'ceiling'};ap.modelUrl='https://mikrotik.com/product/cap_ax';ap.status='needs_verification';ap.notes='Предложение: центральная открытая зона, вне шкафов. Cat6 + PoE 802.3af/at в ether1. Покрытие спален проверить после монтажа.';reroute(p,ap.id);}
 const net=p.electrical.circuits.find(c=>c.id==='C-LAN4');if(net){net.name='Потолочная точка MikroTik cAP ax';net.channel='PATCH/4 → PoE switch/4 → ether1';net.protectionProposal='PoE 802.3af/at; электрическое питание через сетевой шкаф';}
 const rack=obj('PANEL-LV');rack.name='ЩС-01 · сеть: ONT, шлюз, PoE-коммутатор и патч-панель';rack.notes='Отдельный сетевой шкаф. ONT провайдера → маршрутизатор → 8-портовый PoE-коммутатор → патч-панель: 1 ТВ, 2 спальня, 3 детская, 4 cAP ax. Модели шлюза/коммутатора и питание шкафа требуют согласования.';
 const sourceSocket=obj('SOCKET-ROUTER');if(sourceSocket)sourceSocket.name='Резервная потолочная розетка из A-07 · cAP ax питается PoE';
 // Decorative proposals are separate editable objects, not architectural changes.
 for(const [id,kind,name,pos,size,wall,side]of [
  ['DECOR-BED','wallPanel','Дубовые рейки у изголовья · предложение',[8.35,.02,1.62],[2.15,2.5,.028],'WARD-1',1],
  ['ART-HALL','art','Абстракция · прихожая, предложение',[3.7,1.25,4.25],[.64,.82,.025],'ROW-2',1],
  ['ART-CHILD','art','Геометрическая композиция · детская',[14.2,1.45,2.28],[.65,.85,.025],'EXT-E',1]
 ]){if(!obj(id)){const o={id,kind,name,position:pos,size,rotation:[0,0,0],scale:[1,1,1],layer:'furniture',status:'needs_verification',source:'Декоративное предложение v8.6'};attachWall(p,o,wall,side);p.objects.push(o);}}
 for(const id of ['PL-02','PL-05']){const o=obj(id);o.size[1]=2.12;o.notes='Поддон/трап на полу; стойка, смеситель и стекло закреплены. Высоты — визуальное предложение.';}
 if(obj('PL-02').rotation[1]===0)obj('PL-02').rotation[1]=Math.PI;
 supportedRoutes(p);p.visualRevision='8.6';p.placementAudit=mountingAudit(p);
 p.verification.push('v8.6: положение точек в проёмах исправлено; новые места согласовать с A-07. В мокрых зонах проверить зоны защиты по действующим нормам. Штробы в несущих конструкциях не назначены. Материалы потолка, опоры, проходки и противопожарная заделка требуют рабочего проекта.');
 return p;
}
