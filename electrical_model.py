"""Repeatable preliminary WB wiring proposal; never changes source architecture."""
import json, math
from pathlib import Path
path=Path(__file__).parent/'project.json'
p=json.loads(path.read_text())
p['objects']=[o for o in p['objects'] if not o.get('electricalGenerated')]
p['junctionBoxes']=[];p['routes']=[]
O={o['id']:o for o in p['objects']}; circuits=[]; modules=[]
status='needs_verification'
def add(id,name,pos,kind='socket',layer='power',size=[.09,.09,.035]):
 o=dict(id=id,name=name,position=pos,rotation=[0,0,0],scale=[1,1,1],size=size,kind=kind,layer=layer,status=status,source='WB proposal 2026-09-08',electricalGenerated=True);p['objects'].append(o);O[id]=o;return o
panel=O['PANEL'];panel.update(name='ЩР-01 · силовой щит и Wiren Board',position=[.16,.55,2.5],size=[.95,1.65,.30],rotation=[0,math.pi/2,0],status=status,source='Проектное размещение: западная стена техкомнаты')
add('PANEL-LV','ЩС-01 · Ethernet / патч-панель',[.16,.9,1.15],'panel','ftp',[.65,1.05,.30])['rotation']=[0,math.pi/2,0]
def inside(q,poly):
 x,z=q;v=False
 for a,b in zip(poly,poly[1:]+poly[:1]):
  if (a[1]>z)!=(b[1]>z) and x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]:v=not v
 return v
def room(o):
 q=[o['position'][0],o['position'][2]]
 for r in p['rooms']:
  if inside(q,r['polygon']):return r
 return min(p['rooms'],key=lambda r:min(math.dist(q,a) for a in r['polygon']))
def circuit(id,name,ids,typ='power',watts=1500,cable='ВВГнг(А)-LS 3×2,5',breaker='B16 · АВДТ тип A 30 мА',channel=None,protection=None):
 c=dict(id=id,name=name,consumers=ids,type=typ,powerW=watts,powerBasis='Оценка для планирования, заменить паспортными данными',cable=cable,protection=protection or id.replace('C-','QF-'),protectionProposal=breaker,channel=channel,status=status)
 circuits.append(c)
 for id in ids:O[id]['circuit']=c['id']
 return c
# Controlled groups are explicitly a proposal, not inferred connections from source symbol proximity.
lighting={}
for o in O.values():
 if o['kind'] in ['light','track','pendant']:
  r=room(o); subtype={'light':'Основной свет','track':'Треки','pendant':'Подвесы'}[o['kind']]
  key=(r['id'],subtype);lighting.setdefault(key,[]).append(o['id'])
for i,((rid,subtype),ids) in enumerate(sorted(lighting.items())):
 m={'R-06':1,'R-07':1,'R-08':2,'R-09':2,'R-01':3,'R-02':3,'R-05':3,'R-03':4,'R-04':4,'R-10':4}[rid];ch=1+sum(c.get('channel','').startswith(f'MR-{m:02}/') for c in circuits);r=next(r for r in p['rooms'] if r['id']==rid)
 c=circuit(f'C-L{i+1:02}',r['name']+' · '+subtype,ids,'lighting',sum({'light':10,'track':60,'pendant':15}[O[id]['kind']] for id in ids),'ВВГнг(А)-LS 3×1,5','B10 · АВДТ тип A 30 мА',f'MR-{m:02}/K{ch}',f'QF-L{m:02}');c['roomId']=rid;c['groupingBasis']='Предложение по помещениям и типам света; сверить группы листа A-10'
# Dedicated lighting relays. All six outputs of each module share ONE RCBO and ONE phase.
for i in range(1,5):modules.append(dict(id=f'MR-{i:02}',model='WB-MR6C v.3',din=3,row=3 if i<3 else 4,purpose='Свет / прямые кнопочные входы',protection=f'QF-L{i:02}',notes='C1/C2 только от одного АВДТ и одной фазы. Нейтраль только этого АВДТ. Матрицу кнопок настроить; проверка LED-пусковых токов.'))
# Existing socket blocks, grouped by room; dedicated appliances are separate terminal points.
for i,r in enumerate(p['rooms']):
 ids=[o['id'] for o in O.values() if o['kind']=='socket' and room(o)['id']==r['id']]
 if ids:
  # divide kitchen general-purpose outlets into two circuits
  parts=[ids[::2],ids[1::2]] if r['id']=='R-09' else [ids]
  for j,part in enumerate(parts):
   if part:circuit(f'C-S{i+1:02}{chr(65+j)}',r['name']+' · розетки'+(f' {j+1}' if len(parts)>1 else ''),part,watts=2500 if r['id']=='R-09' else 1500)
appliances=[('HOB','Варочная панель',[5.0,.35,7.2],7200,'ВВГнг(А)-LS 3×6','B32 · АВДТ тип A 30 мА; вариант 1N~'),('OVEN','Духовой шкаф',[8.15,.4,4.6],3000,None,None),('DW','Посудомоечная машина',[5.0,.3,6.65],2200,None,None),('FRIDGE','Холодильник',[8.9,.35,4.6],250,None,None),('WASH','Стиральная машина',[2.3,.6,7.7],2200,None,None),('DRY','Сушильная машина',[2.3,1.4,7.7],2500,None,None),('VENT','Резерв вентиляции',[1.6,2.5,3.3],300,None,None)]
for id,name,pos,power,cab,br in appliances:
 o=add('OUT-'+id,name+' · отдельный вывод',pos)
 c=circuit('C-A-'+id,name,[o['id']],watts=power,cable=cab or 'ВВГнг(А)-LS 3×2,5',breaker=br or 'B16 · АВДТ тип A 30 мА');c['locationBasis']='Предложение рядом с оборудованием; точку подключения уточнить'
for o in list(O.values()):
 if o['kind']=='ac':circuit('C-'+o['id'],o['name']+' '+o['id'],[o['id']],'hvac',1000,breaker='B16 · тип A 30 мА предварительно; тип УДТ по паспорту инвертора')
# Buttons use dedicated Cat5e runs, direct relay input where possible.
inputUse={m['id']:0 for m in modules}
for o in list(O.values()):
 if o['kind']!='switch':continue
 r=room(o);targets=[c for c in circuits if c.get('roomId')==r['id']]
 target=targets[0] if targets else next(c for c in circuits if c['type']=='lighting')
 preferred=target['channel'].split('/')[0]
 module=preferred if inputUse[preferred]<6 else next(k for k,v in inputUse.items() if v<6)
 inputUse[module]+=1;ch=f'{module}/IN{inputUse[module]}'
 o.update(name='Кнопка без фиксации · '+o['id'],layer='smart',buttonType='momentary_NO',inputChannel=ch,controls=[target['id']],controlMode='local_mapping' if module==preferred else 'controller_rule',status=status)
 c=circuit('C-B-'+o['id'],o['name'],[o['id']],'smart',0,'Cat5e U/UTP 4×2×0,52 Cu, нг(А)-LS','Вход сухого контакта, НЕ 230 В',ch,'INPUTS');c['notes']='Одна пара IN/iGND, остальные изолированный резерв. iGND разных модулей не объединять. Матрица и назначение клавиш предварительные.'
# Curtains: assumed reversible 230 V motor, not universal for all curtain drives.
for i in range(1,3):modules.append(dict(id=f'CUR-{i:02}',model='WB-MRPS6',din=3,row=4,purpose='3 привода штор',protection=f'QF-CUR{i:02}',notes='Парные выходы в режиме привода, блокировка направлений и пауза. Схему двигателя подтвердить.'))
for i,o in enumerate([o for o in O.values() if o['kind']=='curtain']):
 m=i//3+1;k=(i%3)*2+1
 c=circuit(f'C-CUR{i+1:02}',o['name'],[o['id']],'curtains',120,'ВВГнг(А)-LS 5×1,5','B6 · АВДТ тип A 30 мА',f'CUR-{m:02}/K{k}+K{k+1}',f'QF-CUR{m:02}');c['notes']='Принят 230 В реверсивный привод: N/PE/открыть/закрыть/резерв. Если сухие контакты/24 В/Modbus — изменить кабель и управление.'
modules.extend([dict(id='WB-01',model='Wiren Board · контроллер',din=6,row=5,purpose='Сценарии и Modbus',notes='Модель и габариты уточнить по реальному комплекту'),dict(id='MWAC-01',model='WB-MWAC v.2',din=3,row=5,purpose='5 зон протечки / 2 крана',notes='Отдельный БП только MWAC с изоляцией 4 кВ. iGND датчиков не объединять с PE/GND. Автономное закрытие.'),dict(id='PS-01',model='БП 24 В · 60 Вт',din=4,row=5,purpose='WB / реле; резерв по мощности',notes='Номинал предварительный: пересчитать пики/температуру/резерв'),dict(id='PS-WATER',model='БП 24 В · MWAC',din=3,row=6,purpose='Только MWAC · изоляция 4 кВ',notes='Отдельная цепь питания по инструкции MWAC; не питать другие устройства'),dict(id='PS-VALVE',model='БП 24 В · краны',din=3,row=6,purpose='Приводы кранов',notes='Питание и резерв энергии на закрытие рассчитать после выбора приводов')])
for i in range(1,6):
 c=circuit(f'C-DP{i}','Зона протечки '+str(i),[f'DP{i}'],'sensors',0,'Кабель датчика / 2×0,5 Cu нг(А)-LS','Изолированный вход MWAC',f'MWAC-01/F{i}','WATER');c['notes']='Пассивный совместимый датчик принят условно. Для активного датчика пересчитать питание и число жил.'
for i in range(1,3):
 o=add(f'VALVE-{i}','Кран '+('ХВС' if i==1 else 'ГВС')+' · место уточнить',[1.5,.5,.4+i*.2],'valve','sensors',[.16,.16,.14])
 c=circuit(f'C-V{i}',o['name'],[o['id']],'sensors',10,'Кабель управления 4×0,75 Cu нг(А)-LS','24 В, индивидуальная DC-защита по паспорту',f'MWAC-01/K{i}','VALVES');c['notes']='Предположен 24 В трёхпроводный привод. Нужны паспорт, ток пуска и резерв закрытия.'
# T1-T9: dedicated conduits to terminal strip. Not fictional RS485 devices.
for i in range(1,10):
 c=circuit(f'C-T{i}',f'T{i} · резерв интерфейса',[f'T{i}'],'smart',0,'Cat5e U/UTP 4×2×0,52 Cu нг(А)-LS','Не подключено: интерфейс термостата неизвестен',f'XT-T/{i}','RESERVE');c['notes']='Резервная трасса, не действующая RS-485 звезда. После выбора T1–T9: входы/датчики/Modbus, для шины последовательная прокладка. Нельзя подать 230 В на этот кабель.';c['reserve']=True
# Ethernet destinations proposals; never spliced through power junction boxes.
for i,(name,pos) in enumerate([('ТВ гостиная',[13.8,.35,8.3]),('Рабочее место спальни',[5.2,.35,.25]),('Рабочее место детской',[13.8,.8,1.6]),('Точка Wi-Fi',[8,3.05,4.9])],1):
 o=add(f'LAN-{i}',name,pos,'data','ftp')
 circuit(f'C-LAN{i}',name,[o['id']],'ftp',0,'Cat6 U/UTP 4 пары Cu нг(А)-LS','Патч-панель; PoE только совместимым устройствам',f'PATCH/{i}','LAN')
# Routes use two separate ceiling corridors. Offsets are design choice, not a universal code distance.
def obj(id):return O.get(id) or next(b for b in p['junctionBoxes'] if b['id']==id)
def route(id,fr,to,c,home=False):
 a=obj(fr)['position'];b=obj(to)['position'];lv=c['type'] in ['smart','ftp','sensors'];h=3.08 if lv else 2.92
 n=len(p['routes']);lane=(n%12)*.018;z=4.75+lane if lv else 4.30+lane
 # Ceiling connector heights need top-of-cabinet entry, object base remains editable.
 if fr.startswith('PANEL'):a=[a[0]+.17,obj(fr)['position'][1]+obj(fr)['size'][1],a[2]]
 pts=[a[:],[a[0],h,a[2]],[a[0],h,z],[b[0],h,z],[b[0],h,b[2]],b[:]] if home else [a[:],[a[0],h,a[2]],[b[0],h,a[2]],[b[0],h,b[2]],b[:]]
 pts=[[round(v,4) for v in q] for i,q in enumerate(pts) if i==0 or math.dist(q,pts[i-1])>.001]
 r=dict(id=id,type=c['type'],from_=fr,to=to,route=pts,cable=c['cable'],conduit='Отдельная труба Ø20, предварительно' if lv else ('Отдельная труба Ø32, предварительно' if '3×6' in c['cable'] else 'Отдельная труба Ø20/25, предварительно'),circuit=c['id'],group=c['id'],status=status,voltageClass='SELV / data' if lv else '230V',homeRun=home,channel=c.get('channel'),reserve=c.get('reserve',False),lengthM=round(sum(math.dist(x,y) for x,y in zip(pts,pts[1:])),2))
 r['from']=r.pop('from_');p['routes'].append(r)
for c in circuits:
 ids=c['consumers'];fr='PANEL-LV' if c['type']=='ftp' else 'PANEL'
 if len(ids)>1 and c['type'] in ['lighting','power']:
  target=O[ids[0]]['position'];jb=dict(id='JB-'+c['id'][2:],name='Доступная коробка · '+c['name'],position=[target[0],2.92,target[2]],type=c['type'],status=status,circuit=c['id'],access='Ревизионный люк / съёмный светильник; место согласовать')
  p['junctionBoxes'].append(jb);route('FEED-'+c['id'],fr,jb['id'],c,True)
  for id in ids:route('LINE-'+id,jb['id'],id,c)
 else:route('LINE-'+ids[0],fr,ids[0],c,True)
# internal RS485 harness data, not a field star; no controller GND tied to MWAC sensor iGND.
bus=['WB-01']+[m['id'] for m in modules if m['id'].startswith(('MR-','CUR-'))]+['MWAC-01']
for c in circuits:
 c['routeLengthM']=round(sum(r['lengthM'] for r in p['routes'] if r['circuit']==c['id']),2)
 c['purchaseEstimateM']=math.ceil(c['routeLengthM']*1.15+2*sum(r['homeRun'] for r in p['routes'] if r['circuit']==c['id']))
 c['estimatedCurrentA']=round(c['powerW']/230,2) if c['type'] in ['power','lighting','curtains','hvac'] else None
protections={}
for c in circuits:
 if c['type'] in ['power','lighting','curtains','hvac']:
  q=protections.setdefault(c['protection'],dict(id=c['protection'],proposal=c['protectionProposal'],circuits=[],powerW=0,phase='Уточнить ввод'))
  q['circuits'].append(c['id']);q['powerW']+=c['powerW']
for i in range(1,5):protections.setdefault(f'QF-L{i:02}',dict(id=f'QF-L{i:02}',proposal='B10 · тип A 30 мА',circuits=[],powerW=0,phase='Резерв / входы'))
for id in ['QF-PS','QF-MWAC','QF-VALVE']:
 protections[id]=dict(id=id,proposal='B6 · тип A 30 мА предварительно',circuits=[],powerW=60,phase='Уточнить ввод; отдельное питание БП')
notes=[
'Эскиз электрики для согласования, не рабочая монтажная документация. Сечения, автоматы и мощности предварительные.',
'Ввод: число фаз, выделенная мощность, система заземления, ток КЗ и существующие защиты неизвестны. Вводной аппарат, УЗИП и баланс фаз не назначены.',
'Основа: СП 256.1325800.2016, ГОСТ Р 50571.5.52-2011, ГОСТ Р 50571.7.701-2024, ГОСТ 31565-2012. Актуальные изменения и применимость к конструкциям проверить перед выпуском рабочего проекта.',
'Для розеточных линий предложены АВДТ типа A 30 мА; проверяются зоны санузлов, IP и уравнивание потенциалов. N каждой защиты отдельно, PE непрерывен и не коммутируется.',
'Расстояние между коридорами трасс в модели — проектное предложение. Силовые и сигнальные кабели в отдельных трубах/каналах; пересечения по возможности под прямым углом. Гофра не обеспечивает огнестойкость сама по себе.',
'Нужны проверка Ib ≤ In ≤ Iz с поправками на пучки/температуру, отключения при КЗ и падения напряжения. Геометрические длины + 15% + 2 м на ввод не являются сметой.',
'Потолочная прокладка предложена на 2,92 / 3,08 м. Все проходки стен, несущие конструкции, водопровод и ОВ требуют координации; штробы и отверстия не согласованы.',
'Группы света и назначения кнопок — новое предложение; это не расшифровка всех связей A-10. Диммирование/LED-драйверы пока не назначены.',
'T1–T9 оставлены как резерв интерфейса. Тип тёплого пола (водяной/электрический), коллектор, приводы и мощности пока не определены; питание нагревателей не выдумано.',
'Краны, вентиляционный вывод и Ethernet-точки добавлены как предложения. Наружные/сомнительные позиции исходных розеток и кнопок сохранены, требуют сверки.',
'Щит на западной стене техкомнаты, низ 0,55 м. Проверить доступ, влажность, расстояния до труб, открывание двери и размещение оборудования. Отдельный слаботочный шкаф рядом.',
'MR6C: один АВДТ/одна фаза на модуль; локальная матрица кнопок сохраняет базовое управление без контроллера только для связей local_mapping. Межмодульные сценарии зависят от WB.',
'MWAC: отдельный БП с изоляцией 4 кВ только для MWAC; iGND датчиков изолирован от PE и других цепей. Питание приводов отдельно; предусмотреть энергию на закрытие при потере сети.',
'Шторы: принят реверсивный привод 230 В. Парные выходы MRPS6, блокировка направлений и пауза. Для другого типа привода схема меняется.'
]
p['electrical']=dict(version='8.2',status=status,panelId='PANEL',circuits=circuits,modules=modules,protections=list(protections.values()),notes=notes,bus=dict(id='RS485-PANEL',topology='daisy_chain',devices=bus,cable='Экранированная парная скрутка; A/B в одной паре',termination='120 Ом только на двух физических концах; встроенный терминатор WB по конфигурации',notes='Внутри щита. Питание MWAC отдельно, его входной iGND не связан с GND шины.'),panelLayout=dict(rows=8,dinPerRow=24,capacityDIN=192,reserveTarget='Не менее 25% + место клемм/кабельных каналов; компоновка условная',input='QS / контроль напряжения / УЗИП: резерв, подбор после данных ввода'),sources=[dict(title='WB-MR6C v.3 — входы и выходы',url='https://wiki.wirenboard.com/wiki/WB-MR6C_v.3_Modbus_Relay_Modules'),dict(title='WB-MRPS6 — приводы',url='https://wiki.wirenboard.com/wiki/WB-MRPS6_Modbus_Relay_Modules'),dict(title='WB-MWAC — протечки',url='https://wiki.wirenboard.com/wiki/WB-MWAC'),dict(title='RS-485 — физическое подключение',url='https://wiki.wirenboard.com/wiki/RS-485:_Wiring_and_Connection'),dict(title='СП 256 — текст редакции с изменениями 1–6 (нужна проверка последующих изменений)',url='https://fkr-spb.ru/upload/iblock/a16/1kutj6qbwlu0nc0csvay1t40et50t155.pdf')])
layout=[[] for _ in range(8)]
layout[0].append(dict(id='INPUT',name='Ввод · резерв',din=8,kind='reserve'))
for q in protections.values():
 row=next(row for row in layout[:3] if sum(b['din'] for b in row)+2<=24)
 row.append(dict(id=q['id'],name=q['proposal'],din=2,kind='protection'))
for m in modules:
 row=3 if m['id'].startswith(('MR-','CUR-')) else 4 if m['id'] in ['WB-01','MWAC-01','PS-01'] else 5
 layout[row].append(dict(id=m['id'],name=m['model'],din=m['din'],kind='module'))
layout[5].append(dict(id='F-DC',name='DC-защита · подбор',din=4,kind='protection'))
layout[6].append(dict(id='XT-POWER',name='L / N / PE · клеммы, оценка места',din=24,kind='terminal'))
layout[7].append(dict(id='XT-SIGNAL',name='Кнопки / датчики · раздельные клеммы',din=24,kind='terminal'))
for row in layout:
 free=24-sum(b['din'] for b in row)
 if free:row.append(dict(id='RESERVE',name='Резерв',din=free,kind='reserve'))
p['electrical']['panelLayout']['rails']=layout
p['revision']='8.2';p['verification']=[v for v in p['verification'] if not v.startswith('Магистрали')];p['verification'].append('Электрика 8.2: предварительный проект Wiren Board. Допущения и неизвестные параметры — во вкладке «Щит».')
path.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
print(len(circuits),'circuits;',len(p['routes']),'routes;',len(protections),'protections;',len(lighting),'light groups')
