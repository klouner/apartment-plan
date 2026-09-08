import json,pathlib,fitz,math
from PIL import Image
r=pathlib.Path(__file__).parent;m=json.loads((r/'project.json').read_text());S=47.2440944882
xy=lambda x,z:((x-109.83078)/S,(z-67.141808)/S)
def obj(id,kind,x,z,w,d,h=1,rot=0,layer='furniture',name=None,status='needs_verification',source='A-03',y=0):
 px,pz=xy(x,z);o=dict(id=id,kind=kind,name=name or kind,position=[round(px,4),y,round(pz,4)],rotation=[0,rot,0],scale=[1,1,1],size=[w,h,d],layer=layer,status=status,source=source);m['objects'].append(o);return o
# Dimensions from furniture sheet; locations scaled from its drawing and explicitly reviewable.
obj('BED-01','bed',451,146,2.2,2.1,.55,math.pi/2,name='Кровать · спальня')
obj('BED-02','bed',742,91,1.7,.9,.5,name='Кровать · детская')
obj('SOFA-01','sofa',654,380,2.8,1.1,.82,math.pi/2,name='Диван · гостиная')
obj('SOFA-02','sofa',732,232,2.2,1,.8,name='Диван · детская')
obj('DINING','table',543,418,2.1,1.05,.76,name='Обеденный стол')
obj('ISLAND','island',422,415,.9,2,.92,name='Кухонный остров')
for i,(x,z,rot) in enumerate([(513,381,0),(548,381,0),(580,381,0),(513,453,math.pi),(548,453,math.pi),(580,453,math.pi),(481,418,math.pi/2),(612,418,-math.pi/2),(449,385,-math.pi/2),(449,415,-math.pi/2),(449,445,-math.pi/2)]):obj('CHAIR-%02d'%i,'chair',x,z,.46,.48,.88,rot,name='Стул')
for i,(x,z,rad,h) in enumerate([(731,390,.4,.4),(746,414,.52,.34),(675,86,.35,.6),(655,106,.23,.5),(684,113,.23,.55),(495,83,.22,.5)]):obj('ROUND-%02d'%i,'roundTable',x,z,rad*2,rad*2,h,name='Круглый стол')
obj('ARMCHAIR','chair',743,463,.82,.82,.9,-.4,name='Кресло')
for i in range(5):obj('KITCHEN-%02d'%i,'cabinet',329,357+i*28.35,.6,.6,.9,math.pi/2,name='Кухня · нижний модуль')
for i,(x,kind) in enumerate([(440,'fridge'),(470,'cabinet'),(501,'oven'),(532,'fridge')]):obj('TALL-%02d'%i,kind,x,278,.64,.6,2.3,name='Кухня · пенал')
obj('WARD-A','cabinet',548,80,1.33,.5,2.4,name='Гардероб · верхняя секция')
obj('WARD-B','cabinet',586,167,3.45,.5,2.4,math.pi/2,name='Гардероб · правая секция')
obj('ENTRY-BENCH','cabinet',115,307,.35,1.7,.55,name='Обувница')
obj('HALL-CLOSET','cabinet',294,360,.6,.85,2.4,name='Шкаф прихожей')
obj('PIANO','piano',720,282,1.32,.57,.95,name='Пианино')
obj('CHILD-STORAGE','cabinet',621,180,.55,1.65,1.1,name='Мебель детской')
obj('LAUNDRY-WASH','washer',295,445,.6,.6,.85,name='Стиральная машина')
obj('LAUNDRY-DRY','cabinet',295,480,.6,.6,2.2,name='Сушильный шкаф')
for i,(kind,x,z,w,d,rot) in enumerate([('sink',265,80,1.2,.55,0),('toilet',300,157,.4,.65,0),('shower',242,158,1.1,1.1,0),('toilet',230,214,.4,.65,0),('sink',263,203,.65,.45,0),('shower',304,225,.9,1.3,0),('sink',329,364,.6,.6,math.pi/2),('sink',295,423,.6,.6,0)]):obj('PL-%02d'%i,kind,x,z,w,d,.85,rot,layer='plumbing',name={'sink':'Раковина','toilet':'Унитаз','shower':'Душ'}[kind],source='A-04')
# Nine thermostat symbol centres from engineering PDF vectors.
ss=(1059.48-253.32)/14.27
smartxy=lambda x,z:((x-253.32)/ss,(z-101.24)/ss)
for i,(x,z) in enumerate([(337.44,328.4),(337.44,339.68),(510.6,194.48),(396.72,328.4),(453,484.88),(605.04,339.68),(519.96,194.48),(736.08,269),(915.48,328.4)]):
 o=obj('T%d'%(i+1),'thermostat',110,67,.10,.035,.10,layer='smart',name='Термостат T%d'%(i+1),source='S-01',status='pdf_scaled',y=1.4);x,z=smartxy(x,z);o['position']=[x,1.4,z]
for i,(x,z) in enumerate([(265.5,108.5),(445.26,108.02),(446.22,258.38),(482.94,525.62),(515.94,476.66)]):
 o=obj('DP%d'%(i+1),'sensor',110,67,.085,.085,.03,layer='sensors',name='Датчик протечки ДП%d'%(i+1),source='S-01',status='pdf_scaled');x,z=smartxy(x,z);o['position']=[x,.04,z]
for i,(x,z,w) in enumerate([(423.9,500,3),(573.3,500,2),(698.9,500,2),(394.2,64,1.5),(665.9,64,1)]):obj('CURTAIN-%d'%(i+1),'curtain',x,z,w,.08,.08,layer='curtains',name='Привод штор Ш%d'%(i+1),source='S-01',y=3.05)
for i,(x,z,w) in enumerate([(423.9,490,3),(573.3,490,2),(698.9,490,2)]):obj('CONV-%d'%(i+1),'convector',x,z,w,.2,.09,layer='heating',name='Внутрипольный конвектор К%d'%(i+1),source='A-04')
for i,x in enumerate([394,666]):obj('RAD-%d'%i,'radiator',x,69,.8,.1,.3,layer='heating',name='Радиатор',source='A-04',y=.05)
for i,(x,z) in enumerate([(360,258),(633,258),(633,272)]):obj('AC-%d'%i,'ac',x,z,.85,.22,.28,layer='hvac',name='Кондиционер',source='A-08',y=2.72)
obj('PANEL','panel',150,90,.55,.18,.85,layer='power',name='Электрощит · место уточнить',source='S-01',y=1.2)
# Outlet blocks read from A-07; detailed circuits remain to be designed.
for i,(x,z,n,y,rot) in enumerate([(122,241,2,.3,0),(177,241,2,.3,0),(307,95,2,.85,0),(312,158,2,1,0),(269,211,2,1.4,0),(364,76,2,.3,0),(468,89,2,.7,0),(468,200,2,.7,0),(532,97,2,.3,0),(642,91,2,.3,0),(764,126,2,.9,0),(764,219,2,.7,0),(761,295,2,.4,0),(229,330,1,.9,0),(298,354,1,.2,0),(345,368,3,1.1,math.pi/2),(449,464,2,.75,0),(464,298,1,.05,0),(491,290,2,.1,0),(517,309,2,1.85,0),(536,290,1,.05,0),(350,398,1,.05,math.pi/2),(350,471,3,1.1,math.pi/2),(216,411,2,1.1,0),(279,463,3,1.1,0),(763,471,2,.3,0),(231,514,2,.3,0),(497,514,1,.3,0),(623,514,1,.3,0),(750,514,1,.3,0)]):
 obj('SOCKET-%02d'%i,'socket',x,z,.078*n,.025,.078,rot,layer='power',name='Блок розеток · %d'%n,source='A-07',y=y)
# Lighting symbols: small black filled circular CAD paths. Deduplicate symbol centres in plan area.
p=fitz.open('source-pdfs/чертежи в работе 1.pdf')[6];centres=[]
for d in p.get_drawings():
 q=d['rect']
 if q.x0<100 or q.x1>805 or q.y0<65 or q.y1>500:continue
 if d['fill'] and max(d['fill'])<.5 and 3<q.width<6 and 3<q.height<6 and abs(q.width-q.height)<.3 and len(d['items'])>=8:
  x,z=(q.x0+q.x1)/2,(q.y0+q.y1)/2
  if all(math.hypot(x-a,z-b)>1 for a,b in centres):centres.append((x,z))
for i,(x,z) in enumerate(centres):obj('LIGHT-%02d'%i,'light',x,z,.07,.07,.035,layer='lighting',name='Светильник',source='A-10',y=3.15,status='pdf_vector')
# Switch mechanisms extracted from the two CAD blue symbol fills (21 mechanisms).
p=fitz.open('source-pdfs/чертежи в работе 1.pdf')[4]
for d in p.get_drawings():
 c=d['fill'];q=d['rect']
 if c and q.x0>100 and q.x1<805 and 65<q.y0<530 and c[2]>.98 and .30<c[0]<.52 and .30<c[1]<.78:
  o=obj('SW-%02d'%sum(o['kind']=='switch' for o in m['objects']),'switch',(q.x0+q.x1)/2,(q.y0+q.y1)/2,.07,.025,.07,layer='lighting',name='Выключатель · высоту проверить',source='A-07',y=.9,status='pdf_scaled')
# Four ceiling lighting tracks drawn as filled CAD rectangles.
p=fitz.open('source-pdfs/чертежи в работе 1.pdf')[6]
for d in p.get_drawings():
 c=d['fill'];q=d['rect']
 if c and abs(c[0]-.8)<.01 and 3<q.width<3.1 and q.height>200 and 350<q.x0<730:
  obj('TRACK-%d'%sum(o['kind']=='track' for o in m['objects']),'track',(q.x0+q.x1)/2,(q.y0+q.y1)/2,q.width/S,q.height/S,.04,layer='lighting',name='Трек освещения',source='A-10',y=3.14,status='pdf_vector')
for i,(x,z) in enumerate([(421,396),(421,416),(421,436),(523,416),(560,416)]):obj('PENDANT-%d'%i,'pendant',x,z,.26,.26,.22,layer='lighting',name='Подвесной светильник · высоту проверить',source='A-10',y=2.3)

# Exact heating zone contours from yellow fills.
p=fitz.open('source-pdfs/чертежи в работе 1.pdf')[3]
for d in p.get_drawings():
 c=d['fill'];q=d['rect']
 if c and c[0]>.8 and c[1]>.8 and c[2]<.8 and q.width>10 and q.height>10 and q.x1<810:
  pts=[list(xy(*it[1])) for it in d['items'] if it[0]=='l']
  if len(pts)>2:m['heatingZones'].append(dict(id='HF-%02d'%len(m['heatingZones']),polygon=pts,status='pdf_vector',source='A-05'))
# Installation routing proposals: separated trunks and individually inspectable branches.
colors={'power':'#f27858','ftp':'#4eaaff','smart':'#57d5ba','curtains':'#ba9afa','hvac':'#edb75e','sensors':'#50d3df','lighting':'#f6d883'}
for i,(x,z) in enumerate([(1.35,3.75),(4.5,4.5),(8,4.5),(11.6,4.5),(4.5,6.75)]):
 for typ,off in [('power',0),('ftp',.32)]:m['junctionBoxes'].append(dict(id='JB-%s-%02d'%(typ.upper(),i+1),position=[x,2.95,z+off],type=typ,status='needs_verification',name='Распредкоробка' if typ=='power' else 'Слаботочный узел'))
for typ in ['power','ftp']:
 boxes=[b for b in m['junctionBoxes'] if b['type']==typ];last='PANEL'
 for j,b in enumerate(boxes):
  start=next((x['position'] for x in boxes if x['id']==last),next(o['position'] for o in m['objects'] if o['id']=='PANEL'))
  end=b['position'];route=[start,[start[0],end[1],start[2]],[start[0],end[1],end[2]],end]
  m['routes'].append(dict(id='TRUNK-%s-%d'%(typ,j),type=typ,**{'from':last,'to':b['id']},route=route,cable='Уточнить по расчёту' if typ=='power' else 'FTP · категорию уточнить',conduit='Диаметр уточнить',circuit='Магистраль',group=typ,status='needs_verification'));last=b['id']
for o in m['objects']:
 typ=o['layer']
 if typ not in colors or o['id']=='PANEL':continue
 boxes=[b for b in m['junctionBoxes'] if b['type']==('power' if typ in ['power','lighting','hvac','curtains'] else 'ftp')];b=min(boxes,key=lambda b:math.dist(b['position'][::2],o['position'][::2]));x,y,z=o['position'];a=b['position'];route=[a,[x,a[1],a[2]],[x,a[1],z],[x,y,z]]
 m['routes'].append(dict(id='LINE-'+o['id'],type=typ,**{'from':b['id'],'to':o['id']},route=route,cable='Уточнить по расчёту',conduit='Гофра · диаметр уточнить',circuit='Назначить',group=o['id'],status='needs_verification'))
ssdoc=fitz.open('source-pdfs/План оборудования (04.09.2026).pdf');clip=fitz.Rect(230,80,1085,640);pix=ssdoc[0].get_pixmap(matrix=fitz.Matrix(2,2),clip=clip);Image.frombytes('RGB',[pix.width,pix.height],pix.samples).save(r/'assets/blueprint-smart.webp',quality=90)
m['sources'].append(dict(id='S-01',name='Умный дом',image='assets/blueprint-smart.webp',origin=list(smartxy(230,80)),size=[855/ss,560/ss],page=1))
m['verification']=['Архитектура восстановлена из векторного листа A-02. Оконные четверти упрощены в параметрических стенах; точный контур сохранён отдельно.','Положения мебели и блоков розеток требуют контрольной сверки; размеры взяты с листов.','Магистрали и коробки — предложение для обсуждения, а не трассы из PDF. Требуются расчёт нагрузок, сечения, защиты, проверка пересечений и согласование монтажником.','После правок стен контуры полов и отопления требуют отдельной сверки.','Точные места вентиляционной установки, клапанов и приводов тёплого пола уточнить по разделам ОВ и ВК.']
(r/'project.json').write_text(json.dumps(m,ensure_ascii=False,indent=2));print(len(m['objects']),'objects',len(centres),'lights',len(m['heatingZones']),'heating zones')
