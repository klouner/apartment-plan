"""Functional terminal schedule. Actual hardware revisions and input remain unverified."""
import json
from pathlib import Path
path=Path(__file__).with_name('project.json');p=json.loads(path.read_text());e=p['electrical'];devices=[];wires=[]
def device(id,terminals,kind='terminal',label=None,source='Функциональные обозначения; модель аппарата не выбрана'):
 d={'id':id,'kind':kind,'label':label or id,'terminals':terminals,'source':source};devices.append(d);return d
def wire(a,b,circuit,signal,section,color,notes='Предварительно; проверить сечение и клеммную ёмкость выбранного аппарата'):
 wires.append({'id':f'W-{len(wires)+1:03}','from':a,'to':b,'circuit':circuit,'signal':signal,'sectionMm2':section,'color':color,'notes':notes,'status':'needs_verification'})
mr='https://wiki.wirenboard.com/wiki/WB-MR6C_v.3_Modbus_Relay_Modules'
cur='https://wiki.wirenboard.com/wiki/WB-MRPS6_Modbus_Relay_Modules'
mw='https://wiki.wirenboard.com/wiki/WB-MWAC_v.2_Modbus_Water_Consumption_Metering_and_Leak_Monitoring'
for q in e['protections']:
 device(q['id'],['L.in','N.in','L.out','N.out'],'protection',q['proposal'])
 # The protected phase and neutral distribution is separate for EACH RCBO.
 device('XD-'+q['id'],['L','N']);wire(q['id']+'/L.out','XD-'+q['id']+'/L',q['id'],'L',6 if q['amps']>16 else 2.5,'#b88050');wire(q['id']+'/N.out','XD-'+q['id']+'/N',q['id'],'N',6 if q['amps']>16 else 2.5,'#53a9ed')
device('XPE',['PE'],label='Защитная шина PE')
for m in e['modules']:
 id=m['id'];t=['V+','GND','A','B'];source='Функциональные обозначения; сверить паспорт выбранной модели'
 if id.startswith('MR-'):t+=list(map(str,range(7)))+['iGND','K1','K2','K3','C1','N','C2','K4','K5','K6'];source=mr
 elif id.startswith('CUR-'):t+=[f'K{i}.{x}' for i in range(1,7) for x in ['COM','NO']];source=cur
 elif id.startswith('MWAC'):t+=['F1','F2','F3','F4','F5','S6','iGND','iVout','P1','P2']+[f'K{i}.{x}' for i in [1,2] for x in ['C','NO','NC']];source=mw
 elif id.startswith('PS-'):t=['L','N','PE','V+','0V']
 device(id,t,'module',m['model'],source)
for m in e['modules']:
 if m['id'].startswith('MR-'):
  for terminal in ['C1','C2']:wire('XD-'+m['protection']+'/L',m['id']+'/'+terminal,m['protection'],'L',1.5,'#b88050','В этой схеме обе общие клеммы питаются одним АВДТ. Питание электроники внешнее 24 В; клемма N не используется.')
for c in e['circuits']:
 id=c['id'];xt='XT-'+id;channel=c.get('channel');q=c['protection'];typ=c['type'];terms=[]
 if c.get('reserve'):terms=['RESERVE'];device(xt,terms);continue
 if typ=='lighting':
  device(xt,['L','N','PE']);wire(channel,xt+'/L',id,'L switched',1.5,'#b88050')
  wire('XD-'+q+'/N',xt+'/N',id,'N',1.5,'#53a9ed');wire('XPE/PE',xt+'/PE',id,'PE',1.5,'#a8c84c')
 elif typ=='curtains':
  device(xt,['OPEN','CLOSE','N','PE','SPARE']);m,ks=channel.split('/');ks=ks.split('+')
  for k,t in zip(ks,['OPEN','CLOSE']):
   wire('XD-'+q+'/L',m+'/'+k+'.COM',id,'L',1.5,'#b88050');wire(m+'/'+k+'.NO',xt+'/'+t,id,'L '+t,1.5,'#b88050' if t=='OPEN' else '#a394b4','Только после подтверждения двигателя 230 В с двумя направлениями. Включить режим привода с блокировкой направлений.')
  wire('XD-'+q+'/N',xt+'/N',id,'N',1.5,'#53a9ed');wire('XPE/PE',xt+'/PE',id,'PE',1.5,'#a8c84c')
 elif id.startswith('C-B-'):
  device(xt,['PAIR.1','PAIR.2','SPARE']);m,inp=channel.split('/');wire(xt+'/PAIR.1',m+'/'+inp.replace('IN',''),id,'dry contact',.5,'#ec9849','Внутри щита 0,5 мм²; полевая пара Cat5e через переходную клемму, подходящую для её жил.');wire(xt+'/PAIR.2',m+'/iGND',id,'isolated input common',.5,'#ead9b9')
 elif id.startswith('C-DP'):
  device(xt,['SENSOR','COMMON']);m,inp=channel.split('/');wire(xt+'/SENSOR',channel,id,'dry sensor',.5,'#60d3cb');wire(xt+'/COMMON',m+'/iGND',id,'isolated sensor common',.5,'#ead9b9')
 elif id.startswith('C-V'):
  # Deliberately no guessed motor contact mapping before its passport is available.
  device(xt,['MOTOR.TBD']);device('RESERVE-'+id,['C','NO','NC'],'reserve','Кран: контактная схема по паспорту');
  for t in ['C','NO','NC']:wire(channel+'.'+t,'RESERVE-'+id+'/'+t,id,'valve contact / unassigned',.75,'#60d3cb','Контакт реле показан по паспорту MWAC; назначение жил двигателя НЕ определено. Подключение отложено до выбора крана.')
 elif typ=='ftp':device(xt,['RJ45.T568B']);device('PATCH-'+id,['RJ45.T568B'],'data','Патч-панель');wire(xt+'/RJ45.T568B','PATCH-'+id+'/RJ45.T568B',id,'Ethernet',None,'#53a9ed','Четыре пары целиком, распиновка T568B с обеих сторон; экранирование по выбранной системе.')
 elif q.startswith('QF-'):
  device(xt,['L','N','PE']);section=6 if '6' in c['cable'].split('×')[-1] else 1.5 if '1,5' in c['cable'] else 2.5
  for t,color in [('L','#b88050'),('N','#53a9ed'),('PE','#a8c84c')]:wire('XPE/PE' if t=='PE' else 'XD-'+q+'/'+t,xt+'/'+t,id,t,section,color)
 else:device(xt,['TBD'],'reserve','Схема подключения уточняется')
for ps,q in [('PS-01','QF-PS'),('PS-WATER','QF-MWAC'),('PS-VALVE','QF-VALVE')]:
 for t,color in [('L','#b88050'),('N','#53a9ed')]:wire('XD-'+q+'/'+t,ps+'/'+t,'INTERNAL',t,1.5,color)
 # PE depends on protection class of selected supply; deliberately not guessed.
for m in e['modules']:
 if m['id'].startswith('PS-'):continue
 ps='PS-WATER' if m['id']=='MWAC-01' else 'PS-01'
 for t,out,color in [('V+','V+','#d67967'),('GND','0V','#9aa9b8')]:wire(ps+'/'+out,m['id']+'/'+t,'INTERNAL','24 V DC',.5,color,'Через отдельные распределительные клеммы и DC-защиту по току ветви; аппараты DC-защиты не выбраны. PS-WATER питает только MWAC.')
for a,b in zip(e['bus']['devices'],e['bus']['devices'][1:]):
 for t,color in [('A','#63c9bc'),('B','#c3a4f0'),('GND','#9aa9b8')]:wire(a+'/'+t,b+'/'+t,'RS485',t,.5,color,'A/B одна витая пара; GND отдельный провод. Это GND интерфейса, НЕ iGND датчиков.')
e['panelWiring']={'version':1,'status':'needs_verification','devices':devices,'wires':wires,'notes':['Функциональная карта соединений, не монтажный паспорт. Положение контактов в увеличенном виде условное, обозначения реле — из документации производителя.','Ввод, УЗИП, селективность, ток КЗ, групповые поправки, DC-защита и конкретные модели АВДТ/БП ещё не выбраны. Входы L.in/N.in остаются неподключёнными до расчёта ввода.','XD — распределение после каждого АВДТ: нейтрали разных АВДТ не объединяются. Все разветвления выполнять через рассчитанные распределительные клеммы, не пучком под один винт.','PE не коммутировать. Клеммные ряды и каналы требуют проверки вместимости; резерв DIN не заменяет расчёт числа клемм.','Жилы и наконечники выбирать по клеммам конкретной ревизии. Входные iGND не соединять с PE, питанием и GND RS-485.','Для клапанов показаны только контакты MWAC. Выводы двигателя, его питание и конечные положения будут определены по паспорту клапана.']}
p['verification']=list(dict.fromkeys(p['verification']));next(o for o in p['objects'] if o['id']=='OUT-VENT')['kind']='connection'
def normalize(x):
 if isinstance(x,dict):return {k:normalize(v) for k,v in x.items()}
 if isinstance(x,list):return [normalize(v) for v in x]
 return 0 if isinstance(x,float) and x==0 else x
p=normalize(p)
path.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n');print(len(devices),'devices;',len(wires),'connections')
