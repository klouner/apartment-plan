"""Source-bound furniture correction and engineering review, applied after v8.2."""
import json,math,re,collections,sys
from pathlib import Path
P=Path(__file__).parent/'project.json';p=json.loads((Path(sys.argv[1]) if len(sys.argv)>1 else P).read_text());e=p['electrical'];O={o['id']:o for o in p['objects']};audit=[]
S=47.2440944882;OX=109.8307800293;OZ=67.1418075562
xy=lambda x,z:((x-OX)/S,(z-OZ)/S)
def fix(id,**kw):
 o=O[id];before={k:o.get(k) for k in kw};o.update(kw);audit.append(dict(id=id,before=before,after=kw));return o
def add(id,kind,name,pos,size,layer='furniture',rot=0,source='Предложение v8.3'):
 o=dict(id=id,kind=kind,name=name,position=pos,size=size,rotation=[0,rot,0],scale=[1,1,1],layer=layer,status='needs_verification',source=source)
 if id in O:O[id].update(o);return O[id]
 p['objects'].append(o);O[id]=o;return o
def footprint(id,rect,rot=0):
 x0,z0,x1,z1=rect;x,z=xy((x0+x1)/2,(z0+z1)/2);wx=(x1-x0)/S;dz=(z1-z0)/S
 o=O[id];w,d=(dz,wx) if abs(math.sin(rot))>.9 else (wx,dz)
 fix(id,position=[round(x,5),o['position'][1],round(z,5)],size=[round(w,5),o['size'][1],round(d,5)],rotation=[0,rot,0],source='A-03 · векторный контур',sourceRect=rect,placementStatus='source_footprint_checked',status='pdf_vector')
footprint('BED-01',[401.80,95.47,505.74,194.68],-math.pi/2)
footprint('BED-02',[702.48,68.36,782.79,110.88],-math.pi/2)
footprint('SOFA-01',[628.10,322.26,680.07,440.37],math.pi/2)
footprint('SOFA-02',[678.50,208.34,782.79,255.59],math.pi)
footprint('DINING',[492.51,394.06,591.72,441.31]);footprint('ISLAND',[400.38,370.44,442.90,464.93])
chairs=[[501.75,377.53,520.22,401.11],[533,377.53,551.47,401.11],[564.26,377.53,582.72,401.11],[501.75,434.27,520.22,457.84],[533,434.27,551.47,457.84],[564.26,434.27,582.72,457.84],[475.97,408.45,499.55,426.92],[584.68,408.45,608.26,426.92],[436.77,380.37,456.05,399.71],[436.77,408.01,456.05,427.36],[436.77,435.66,456.05,455]]
for i,r in enumerate(chairs):footprint(f'CHAIR-{i:02}',r,[0,0,0,math.pi,math.pi,math.pi,math.pi/2,-math.pi/2,-math.pi/2,-math.pi/2,-math.pi/2][i])
for i,r in enumerate([[706.13,379.64,729.76,403.26],[714.22,393.96,747.28,427.03],[659.44,80.22,692.51,113.29],[644.49,86.38,663.39,105.28],[667.05,111.52,685.94,130.41],[485.75,75.89,504.65,94.79]]):footprint(f'ROUND-{i:02}',r)
footprint('ARMCHAIR',[705.98,442.58,753.06,489.89]);fix('ARMCHAIR',kind='armchair',rotation=[0,.3,0])
for i in range(5):footprint(f'KITCHEN-{i:02}',[315.34,352.50+i*28.345,343.69,380.845+i*28.345],math.pi/2)
fix('KITCHEN-00',kind='kitchenSink',name='Кухня · мойка');fix('KITCHEN-01',kind='dishwasher',name='Посудомоечная машина');fix('KITCHEN-03',kind='hob',name='Варочная панель');fix('KITCHEN-04',kind='winefridge',name='Винный шкаф')
for i,r in enumerate([[424.96,266.51,454.25,294.86],[469.84,266.51,498.19,294.86],[498.19,266.51,526.54,294.86],[542.13,266.51,571.42,294.86]]):footprint(f'TALL-{i:02}',r)
fix('TALL-00',name='Холодильник');fix('TALL-01',kind='coffeeTower',name='Кофе-зона · пенал');fix('TALL-02',kind='ovenTower',name='Духовой шкаф + микроволновая печь');fix('TALL-03',kind='freezer',name='Морозильник')
for i,r in enumerate([[455.67,266.51,469.84,294.86],[526.54,266.51,540.71,294.86]]):add(f'TALL-FILL-{i}','cabinet','Пенал · узкая секция',[0,0,0],[.3,2.3,.6]);footprint(f'TALL-FILL-{i}',r)
footprint('WARD-A',[513.53,67.14,576.37,90.76]);footprint('WARD-B',[576.37,67.14,599.99,257.06],-math.pi/2)
footprint('ENTRY-BENCH',[110.6,268.93,124.77,353.97],math.pi/2)
footprint('HALL-CLOSET',[280.15,338.32,308.49,381.08],-math.pi/2)
footprint('PIANO',[679.13,266.43,745.27,290.77]);footprint('CHILD-STORAGE',[607.55,74.23,633.53,145.09],math.pi/2)
footprint('LAUNDRY-WASH',[282.03,437.54,308.01,465.89],-math.pi/2);footprint('LAUNDRY-DRY',[280.14,468.38,307.54,496.72],-math.pi/2)
fix('LAUNDRY-DRY',kind='dryingCabinet',name='Сушильный шкаф')
footprint('PL-00',[211.41,68.09,324.79,94.07]);footprint('PL-01',[293.85,150.06,310.85,175.57],math.pi);footprint('PL-03',[222.98,202.26,239.99,227.77]);footprint('PL-04',[252.96,192.81,281.30,211.71]);footprint('PL-05',[282.51,192.81,325.03,256.12]);footprint('PL-07',[281.56,387.93,308.49,437.54],-math.pi/2)
# Kitchen sink was previously duplicated as a whole second cabinet.
p['objects']=[o for o in p['objects'] if o['id']!='PL-06'];O.pop('PL-06',None)
# New media objects: proposals marked separately from source furniture.
add('TV-LIVING','tv','ТВ · гостиная, размещение согласовать',[14.19,1.35,5.25],[1.23,.71,.05],rot=-math.pi/2)
add('TV-BED','tv','ТВ · спальня, размещение согласовать',[4.79,1.3,2.9],[.97,.56,.05],rot=math.pi/2)
add('TV-CHILD','tv','ТВ · детская, размещение согласовать',[10.59,1.25,2.25],[.97,.56,.05],rot=math.pi/2)
add('SOUNDBAR','soundbar','Саундбар · гостиная',[14.10,1.13,5.25],[.95,.065,.10],rot=-math.pi/2)
add('SUBWOOFER','speaker','Сабвуфер · предложение',[13.7,0,5.65],[.32,.42,.32])
add('PROJECTOR','projector','Проектор · потолочный вывод A-07',[10.2,2.82,6.65],[.32,.15,.26],rot=-math.pi/2,source='A-07 · потолочная точка; корпус условный')
add('SCREEN','screen','Проекционный экран · A-07',[13.63,2.8,7.6],[1.9,.09,.10],rot=-math.pi/2,source='A-07 · потолочный вывод; габариты уточнить')
add('BOILER','boiler','Бойлер · условно 80 л / 2 кВт',[1.49,.7,1.05],[.5,1,.5],layer='plumbing',source='Предложение · место и объём уточнить')
add('LAUNDRY-CLOSET','cabinet','Хозяйственный шкаф',[2.525,0,8.97],[.8,2.2,.3],source='A-03 · шкаф 800 × 400; глубину сверить')
# All socket markers are projected to their actual supporting surface, not symbol offset.
W={w['id']:w for w in p['walls']};N={n['id']:n['position'] for n in p['nodes']}
def mount(id,wall,along,side,height,count=None,outdoor=False):
 o=O[id];w=W[wall];a=N[w['a']];b=N[w['b']];L=math.dist(a,b);dx=(b[0]-a[0])/L;dz=(b[1]-a[1])/L;nx=-dz*side;nz=dx*side
 t=along-a[0] if abs(dx)>.5 else along-a[1];x=a[0]+t*dx;z=a[1]+t*dz;d=w['thickness']/2+o['size'][2]/2+.002
 if count is not None:o['size'][0]=count*.078;o['socketCount']=count
 fix(id,position=[round(x+nx*d,5),round(height-o['size'][1]/2,5),round(z+nz*d,5)],rotation=[0,math.atan2(nx,nz),0],mountingHeight=height,mount=dict(kind='wall',wallId=wall,offset=round(t,5),side=side),environment='outdoor' if outdoor else 'indoor',status='needs_verification',placementStatus='surface_attached',source='A-07 · привязка к поверхности; сверить монтажные размеры')
 if outdoor:o.update(ip='IP66',name=f'Уличная розетка IP66 · {o.get("socketCount",1)} поста',source='A-07 · явно подписана «уличная», IP66')
 else:o['ip']='IP44' if id in ['SOCKET-02','SOCKET-04'] else 'IP20'
placements=[('ROW-1',.30,-1,.3,2),('ROW-1',1.485,-1,.3,2),('EXT-N',4.375,1,.85,2),('BATH-E1',2.1,1,1,1),('BATH-DIV',3.28,1,1.4,2),('EXT-N',5.22,1,.3,2),('WARD-1',.5,1,.7,2),('WARD-2',2.82,1,.7,2),('EXT-N',8.94,1,.3,2),('EXT-N',11.17,1,.3,2),('EXT-E',1.25,1,.9,2),('EXT-E',3.22,1,.7,2),('EXT-E',4.82,1,.4,2),('ENTRY-E',5.56,-1,.9,1),('HALL-NICHE1',3.98,1,.2,1),('KITCHEN-W1',6.37,-1,1.1,3),None,('ROW-3',O['TALL-00']['position'][0],1,.05,1),('ROW-3',O['TALL-01']['position'][0],1,1.1,2),('ROW-4',O['TALL-02']['position'][0],1,1.85,2),('ROW-4',O['TALL-03']['position'][0],1,.05,1),('KITCHEN-W2',O['KITCHEN-01']['position'][2],-1,.05,1),('KITCHEN-W2',8.55,-1,1.1,3),('LAUNDRY-W',7.28,-1,1.1,2),('KITCHEN-W2',8.38,1,1.1,3),('EXT-E',8.55,1,.3,2),('EXT-S',2.245,1,.3,2),('EXT-S',8.195,1,.3,1),('EXT-S',10.862,1,.3,1),('EXT-S',13.55,1,.3,1)]
for i,v in enumerate(placements):
 if v:mount(f'SOCKET-{i:02}',*v,outdoor=i>=26)
island=O['ISLAND'];fix('SOCKET-16',position=[island['position'][0]+island['size'][0]/2+.0145,.711,8.34],rotation=[0,math.pi/2,0],mountingHeight=.75,mount=dict(kind='object',objectId='ISLAND',face='+X'),socketCount=2,environment='indoor',placementStatus='surface_attached')
# Switch heights and surface attachments. Keep source mechanism IDs for existing channel map.
swm=[('HALL-NICHE2',4.85,1,.9),('HALL-NICHE2',4.7,1,.9),('EXT-S',6.605,-1,.8),('EXT-N',4.1,1,.85),('WARD-2',2.82,1,.7),('WARD-1',.50,1,.7),('WARD-1',.67,1,.7),('EXT-E',1.25,1,.9),('EXT-E',1.42,1,.9),('ROW-3',5.92,-1,.9),('WARD-2',2.97,-1,.9),('ENTRY-E',5.193,-1,.9),('LAUNDRY-N',3.535,1,.9),('ENTRY-E',5.674,1,.9),('ROW-1',1.49,1,.9),('ROW-2',2.54,-1,.9),('BATH-E1',1.65,-1,.9),('ROW-2',3.74,1,.9),('ROW-5',11.72,-1,.9),('EXT-W',5.674,-1,.9),('SHOWER',1.20,1,.9)]
# Last switch by shower stays on north vanity wall: never in shower enclosure.
swm[-1]=('EXT-N',4.25,1,.85)
for i,v in enumerate(swm):mount(f'SW-{i:02}',*v)
# 3 omitted ceiling sockets: source legend total 48 IP20 + 4 IP44 + 5 IP66 = 57.
for id,name,pos in [('SOCKET-ROUTER','Розетка роутера · потолок',[9.4,3.17,6.05]),('SOCKET-PROJECTOR','Розетка проектора · потолок',[10.2,3.17,6.65]),('SOCKET-SCREEN','Вывод экрана · потолок',[13.63,3.17,7.6])]:
 o=add(id,'socket',name,pos,[.078,.078,.025],layer='power',source='A-07 · потолочный вывод H=3200; привязку сверить');o.update(socketCount=1,ip='IP20',environment='indoor',mount={'kind':'ceiling'},rotation=[math.pi/2,0,0],mountingHeight=3.2)
# Fix provisional dedicated equipment outlets: align with source furniture, not opposite room wall.
for id,owner in [('OUT-HOB','KITCHEN-03'),('OUT-OVEN','TALL-02'),('OUT-DW','KITCHEN-01'),('OUT-FRIDGE','TALL-00'),('OUT-WASH','LAUNDRY-WASH'),('OUT-DRY','LAUNDRY-DRY')]:
 o=O[id];f=O[owner];fix(id,position=[f['position'][0],.35,f['position'][2]],kind='connection',name=f['name']+' · подключение за корпусом',size=[.025,.025,.025],hostId=owner)
 O[owner]['circuit']=o['circuit'];O[owner]['poweredBy']=id
# External outlets have their own protective device; remove them from indoor groups.
ext=[f'SOCKET-{i}' for i in range(26,30)]
for c in e['circuits']:c['consumers']=[id for id in c['consumers'] if id not in ext]
def circuit(id,name,ids,power=1500,breaker='B16',cable='ВВГнг(А)-LS 3×2,5',typ='power'):
 c=dict(id=id,name=name,consumers=ids,type=typ,powerW=power,powerBasis='Предварительная оценка',cable=cable,protection=id.replace('C-','QF-',1),protectionProposal=breaker+' · АВДТ 1P+N тип A 30 мА',channel=None,status='needs_verification',estimatedCurrentA=round(power/230,2),routeLengthM=0,purchaseEstimateM=0)
 old=next((c for c in e['circuits'] if c['id']==id),None)
 if old:old.update(c);c=old
 else:e['circuits'].append(c)
 for id in ids:O[id]['circuit']=c['id']
 return c
circuit('C-OUTDOOR','Уличные розетки IP66',ext,1500)
for id,name,power in [('BOILER','Бойлер',2000),('FREEZER','Морозильник',250)]:
 owner='BOILER' if id=='BOILER' else 'TALL-03';f=O[owner];o=add('OUT-'+id,'connection',name+' · подключение',f['position'].copy(),[.025,.025,.025],'power');o['hostId']=owner;c=circuit('C-A-'+id,name,[o['id']],power);f['circuit']=c['id'];f['poweredBy']=o['id']
# Media uses a separate group; existing ceiling source sockets included without duplication.
for id in ['TV-LIVING','TV-BED','TV-CHILD','SOUNDBAR','SUBWOOFER']:
 o=O[id];out=add('OUT-'+id,'connection',o['name']+' · питание',o['position'].copy(),[.025,.025,.025],'power');out['hostId']=id
media=['SOCKET-ROUTER','SOCKET-PROJECTOR','SOCKET-SCREEN']+['OUT-'+id for id in ['TV-LIVING','TV-BED','TV-CHILD','SOUNDBAR','SUBWOOFER']]
c=circuit('C-AV','ТВ / аудио / проектор',media,800,'B10','ВВГнг(А)-LS 3×1,5')
for id in ['TV-LIVING','TV-BED','TV-CHILD','SOUNDBAR','SUBWOOFER','PROJECTOR','SCREEN']:O[id]['circuit']=c['id']
# Split multi-post source frames where distinct protected appliances require distinct feeds.
fix('SOCKET-19',size=[.078,.078,.025],socketCount=1,position=[O['SOCKET-19']['position'][0]-.039,O['SOCKET-19']['position'][1],O['SOCKET-19']['position'][2]])
for id,base,delta,name in [('SOCKET-MICRO','SOCKET-19',[.078,0,0],'Микроволновая печь'),('SOCKET-DRY','SOCKET-24',[0,0,0],'Сушильный шкаф'),('SOCKET-LAUNDRY','SOCKET-24',[0,0,.078],'Прачечная · сервисная розетка')]:
 b=O[base];o=add(id,'socket',name,[v+d for v,d in zip(b['position'],delta)],[.078,.078,.025],'power');o.update(rotation=b['rotation'].copy(),socketCount=1,ip='IP20',environment='indoor',mount=b['mount'].copy(),mountingHeight=b['mountingHeight'],source='A-07 · пост в исходной рамке')
fix('SOCKET-24',size=[.078,.078,.025],socketCount=1,position=[O['SOCKET-24']['position'][0],O['SOCKET-24']['position'][1],O['SOCKET-24']['position'][2]-.078])
# Move the existing feeder endpoint instead of creating a second circuit at the same socket.
replace={'OUT-FRIDGE':'SOCKET-17','OUT-FREEZER':'SOCKET-20','OUT-OVEN':'SOCKET-19','OUT-DW':'SOCKET-21','OUT-WASH':'SOCKET-24','OUT-DRY':'SOCKET-DRY'}
for old,new in replace.items():
 c=next(c for c in e['circuits'] if old in c['consumers']);owner=O[old]['hostId'];O[owner]['poweredBy']=new;O[owner]['circuit']=c['id']
 for other in e['circuits']:other['consumers']=[id for id in other['consumers'] if id!=new]
 c['consumers']=[new if id==old else id for id in c['consumers']];O[new]['circuit']=c['id']
 p['routes']=[r for r in p['routes'] if r['to'] not in [old,new]];p['objects']=[o for o in p['objects'] if o['id']!=old];O.pop(old)
circuit('C-A-MICRO','Микроволновая печь',['SOCKET-MICRO'],1200)
service=next(c for c in e['circuits'] if c['id']=='C-S04A');service['consumers'].append('SOCKET-LAUNDRY');O['SOCKET-LAUNDRY']['circuit']=service['id']
O['OUT-HOB']['position']=[4.365,.35,O['KITCHEN-03']['position'][2]]
e['circuits']=[c for c in e['circuits'] if c['consumers']]
validC={c['id'] for c in e['circuits']};p['routes']=[r for r in p['routes'] if r['circuit'] in validC]

# Rebuild existing route endpoints and add feeders for new groups. Architectural geometry is untouched.
C={c['id']:c for c in e['circuits']};boxes={b['id']:b for b in p['junctionBoxes']}
p['routes']=[r for r in p['routes'] if r['to'] not in ext]
for c in e['circuits']:
 for id in c['consumers']:
  if not any(r['circuit']==c['id'] and r['to']==id for r in p['routes']):p['routes'].append(dict(id='LINE-'+id,type=c['type'],**{'from':'PANEL','to':id},circuit=c['id'],group=c['id'],route=[],cable=c['cable'],conduit='Отдельная труба Ø20/25 · подбор',homeRun=True,status='needs_verification',voltageClass='230V'))
for i,r in enumerate(p['routes']):
 a=(O.get(r['from']) or boxes.get(r['from']))['position'].copy();b=(O.get(r['to']) or boxes.get(r['to']))['position'].copy();c=C[r['circuit']];lv=r['type'] in ['smart','ftp','sensors'];h=3.08 if lv else 2.92
 if r['from'].startswith('PANEL'):a=[a[0]+.17,a[1]+O[r['from']]['size'][1],a[2]]
 z=(4.75 if lv else 4.30)+(i%12)*.018
 # Source-listed outdoor outlets: internal drop then a short perpendicular wall penetration.
 outside=O.get(r['to'],{}).get('environment')=='outdoor';target=b.copy();target[2]=9.10 if outside else target[2]
 raw=[a,[a[0],h,a[2]],[a[0],h,z],[target[0],h,z],[target[0],h,target[2]],target]+([b] if outside else []) if r.get('homeRun') else [a,[a[0],h,a[2]],[target[0],h,a[2]],[target[0],h,target[2]],target]+([b] if outside else [])
 r['route']=[[round(v,5) for v in q] for j,q in enumerate(raw) if j==0 or math.dist(q,raw[j-1])>.0001];r['lengthM']=round(sum(math.dist(x,y) for x,y in zip(r['route'],r['route'][1:])),2);r['status']='needs_verification'
 match=re.search(r'(\d+)×([\d,]+)$',r['cable']);r['cores']=int(match[1]) if match else 8 if 'Cat' in r['cable'] else None;r['sectionMm2']=float(match[2].replace(',','.')) if match else None
 if r['type']=='smart' and 'Cat5e' in r['cable']:r['sectionMm2']=.212;r['conductorDiameterMm']=.52
 r['lengthBasis']='По осевой полилинии; радиусы изгиба и монтажный запас отдельно'
for c in e['circuits']:
 rr=[r for r in p['routes'] if r['circuit']==c['id']];c['routeLengthM']=round(sum(r['lengthM'] for r in rr),2);c['purchaseEstimateM']=math.ceil(c['routeLengthM']*1.15+sum(r.get('homeRun',False) for r in rr)*2)
# Recount actual protective devices, not one breaker per WB output.
protection={}
for c in e['circuits']:
 if c['type'] not in ['power','lighting','curtains','hvac']:continue
 b=re.search(r'B(\d+)',c['protectionProposal']);amps=int(b[1]) if b else 16;q=protection.setdefault(c['protection'],dict(id=c['protection'],kind='RCBO',poles='1P+N',curve='B',amps=amps,rcdType='A',deltaMA=30,din=2,circuits=[],powerW=0,proposal=f'АВДТ 1P+N B{amps} · тип A · 30 мА',phase='Ввод и фазу уточнить',status='needs_verification'));q['circuits'].append(c['id']);q['powerW']+=c['powerW']
for id in ['QF-PS','QF-MWAC','QF-VALVE']:protection[id]=dict(id=id,kind='RCBO',poles='1P+N',curve='B',amps=6,rcdType='A',deltaMA=30,din=2,circuits=[],powerW=60,proposal='АВДТ 1P+N B6 · тип A · 30 мА',phase='Питание БП',status='needs_verification')
e['protections']=list(protection.values());counter=collections.Counter((q['kind'],q['amps'],q['poles'],q['rcdType'],q['deltaMA']) for q in protection.values());e['billOfMaterials']=[dict(name=f'АВДТ {poles} B{amps} / {typ} / {ma} мА',quantity=count,dinEach=2,status='preliminary') for (kind,amps,poles,typ,ma),count in sorted(counter.items(),key=lambda k:k[0][1])]
for m in e['modules']:e['billOfMaterials'].append(dict(name=m['model'],quantity=1,dinEach=m['din'],id=m['id'],status='preliminary'))
# A 216 DIN envelope provides room for added loads, routing ducts and a visible reserve.
rails=[[] for _ in range(9)];rails[0].append(dict(id='INPUT',name='Ввод / УЗИП / контроль напряжения · подбор',din=8,kind='reserve'))
for q in protection.values():
 row=next(row for row in rails[:4] if sum(b['din'] for b in row)+2<=24);row.append(dict(id=q['id'],name=q['proposal'],din=2,kind='protection'))
for m in e['modules']:
 row=4 if m['id'].startswith(('MR-','CUR-')) else 5 if m['id'] in ['WB-01','MWAC-01','PS-01'] else 6;m['row']=row+1;rails[row].append(dict(id=m['id'],name=m['model'],din=m['din'],kind='module'))
rails[6].append(dict(id='F-DC',name='DC-защита · подбор',din=4,kind='protection'));rails[7].append(dict(id='XT-POWER',name='Клеммы L / N / PE',din=24,kind='terminal'));rails[8].append(dict(id='XT-SIGNAL',name='Изолированные клеммы сигналов',din=24,kind='terminal'))
for row in rails:
 free=24-sum(b['din'] for b in row)
 if free:row.append(dict(id='RESERVE',name='Резерв',din=free,kind='reserve'))
e['panelLayout'].update(rows=9,capacityDIN=216,rails=rails);e['version']='8.3'
e['sources'].append(dict(title='MR6C v.3 — монтаж и назначение входов',url='https://wiki.wirenboard.com/wiki/WB-MR6C_v.3_Modbus_Relay_Modules'))
e['notes']=[n.replace('Наружные/сомнительные позиции исходных розеток и кнопок сохранены, требуют сверки.','Уличные розетки подтверждены A-07: пять механизмов IP66, размещены на фасаде.').replace('8×24','9×24') for n in e['notes']]
e['notes']+=['Подсчёт аппаратов сделан по принятой структуре групп. Добавлены отдельные цепи уличных розеток, бойлера, морозильника и AV. Ввод, отключающая способность и селективность требуют расчёта.','Монтажные высоты розеток/кнопок теперь относятся к центру механизма. Кухонные выводы закреплены за соответствующей техникой.','ТВ и аудио — предложения пользователя; исходник содержит проектор и моторизованный экран. Места экранов, бойлера и аудио согласовать.']
p['revision']='8.3';p['placementReview']=dict(date='2026-09-08',source='A-03 / A-07',changes=audit,notes=['На A-07 есть пять уличных розеток IP66; это не лишние комнатные розетки.','Мебель откорректирована по векторным контурам A-03; высоты и внутреннее устройство процедурных моделей условные.','TV, аудио и бойлер — предложения; для розеток санузлов необходима отдельная проверка зон безопасности.'])
p['verification'].append('v8.3: исправлены контуры мебели, стороны фасадов, привязки розеток и выделенные выводы. См. placementReview. Точные монтажные размеры и зоны санузлов ещё требуют проверки.')
P.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n');print('v8.3:',len(audit),'placement corrections;',len(protection),'RCBO;',e['billOfMaterials'][:4])
