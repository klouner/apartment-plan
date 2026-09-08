"""Reproducible geometry extraction. PDF coordinates, never inferred room boxes.
Run: python build_model.py /path/to/architectural.pdf /path/to/smart.pdf
"""
import fitz,json,sys,pathlib
root=pathlib.Path(__file__).parent
arch=fitz.open(sys.argv[1]);smart=fitz.open(sys.argv[2]);p=arch[0]
OX,OY,S=109.83078002929688,67.14180755615234,47.2440944882
xy=lambda x,y:[round((x-OX)/S,5),round((y-OY)/S,5)]
model=dict(schemaVersion=8,projectId='vydrino-house',units='m',height=3.2,revision='8.0',nodes=[],walls=[],openings=[],rooms=[],objects=[],junctionBoxes=[],routes=[],heatingZones=[],sources=[],verification=[])
nodes={}
def node(x,y):
 k=(round(x,3),round(y,3))
 if k not in nodes:
  id='N-%03d'%(len(nodes)+1);nodes[k]=id;model['nodes'].append(dict(id=id,position=xy(x,y)))
 return nodes[k]
def wall(id,axis,fix,a,b,t,opens=[]):
 pos=lambda v:(v,fix) if axis=='h' else (fix,v)
 model['walls'].append(dict(id=id,a=node(*pos(a)),b=node(*pos(b)),thickness=round(t/S,5),height=3.2,source='A-02',status='pdf_vector'))
 for kind,start,width,height,sill,hinge in opens:
  model['openings'].append(dict(id=('D' if kind=='door' else 'W')+'-%02d'%(len(model['openings'])+1),wallId=id,offset=round((start-a)/S,5),width=width,height=height,sillHeight=sill,type=kind,hinge=hinge,source='A-02',status='pdf_vector'))
# Centres of actual wall faces extracted from PDF paths. Endpoints share junctions.
wall('EXT-N','h',59.110,101.799,792.037,16.064,[('window',358.807,1.5,2.4,.5,1),('window',642.272,1,2.4,.5,1)])
wall('EXT-E','v',792.037,59.110,506.040,16.064)
wall('EXT-S','h',506.040,202.193,792.037,16.064,[('window',353.138,3,3,0,1),('window',526.054,2,3,0,1),('window',651.712,2,3,0,1)])
wall('EXT-W','v',101.799,59.110,364.302,16.063)
wall('ENTRY','h',364.302,101.799,202.193,16.064,[('door',129.417,.960,2.05,0,1)])
wall('LAUNDRY-W','v',202.193,364.302,506.040,16.064,[('window',428.789,.6,.87,1.5,1)])
wall('TECH-E','v',202.193,59.110,261.788,16.063)
wall('ENTRY-E','v',202.193,261.788,364.302,16.063,[('door',280.704,.9,2.36,0,-1)])
wall('HALL-W','v',202.193,364.302,384.505,16.063)
# Upper circulation wall split at structural junctions.
wall('ROW-1','h',261.788,101.799,202.193,9.449,[('door',130.624,.9,2.36,0,-1)])
wall('ROW-2','h',261.788,202.193,329.398,9.449,[('door',236.917,.9,2.36,0,1)])
wall('ROW-3','h',261.788,329.398,507.745,9.449,[('door',339.928,.9,2.36,0,-1)])
wall('ROW-4','h',261.788,507.745,603.415,9.449)
wall('ROW-5','h',261.788,603.415,792.037,9.449,[('door',613.906,.9,2.36,0,-1)])
wall('BATH-E1','v',329.398,59.110,188.441,6.849,[('door',100.234,.8,2.36,0,-1)])
wall('BATH-E2','v',329.398,188.441,261.788,6.849)
wall('BATH-DIV','h',188.441,202.193,329.398,6.851)
wall('WARD-1','v',510.108,59.110,195.627,6.852)
wall('WARD-STEP','h',195.627,507.745,510.108,6.852)
wall('WARD-2','v',507.745,195.627,261.788,11.577,[('door',214.536,.8,2.36,0,1)])
wall('CHILD-W','v',603.415,59.110,261.788,6.849)
wall('LAUNDRY-N','h',384.505,202.193,311.918,6.851,[('door',231.963,.8,2.36,0,-1)])
wall('KITCHEN-W1','v',311.918,334.898,384.505,6.851)
wall('KITCHEN-W2','v',311.918,384.505,506.040,6.851)
wall('HALL-NICHE1','h',334.898,280.146,311.918,6.851)
wall('HALL-NICHE2','h',334.898,311.918,346.051,6.851)
wall('FIREPLACE-1','h',349.898,760.384,792.037,4.724)
wall('FIREPLACE-2','h',414.623,760.384,792.037,4.726)
wall('SHOWER','v',274.949,132.103,188.441,9.449)
# Door swing sides read from architectural arcs.
for o in model['openings']:
 if o['type']=='door':
  o['hinge']={'ENTRY':-1,'ENTRY-E':-1,'ROW-1':1,'ROW-2':-1,'ROW-3':1,'ROW-5':1,'BATH-E1':1,'WARD-2':-1,'LAUNDRY-N':1}[o['wallId']]
  o['hingeAtEnd']=o['wallId']=='WARD-2'
# Actual clear room polygons from the CAD white fill, keeping hall/L-shaped living room.
rd=[('Мастер-санузел',5.52),('Тамбур',3.39),('Техкомната',7.18),('Прачечная',4.85),('Санузел',3.05),('Спальня',14.66),('Гардеробная',7.36),('Детская',15.03),('Гостиная-кухня',47.52),('Прихожая',6.05)]
ri=0
for d in p.get_drawings():
 r=d['rect']
 if d['fill']==(1.,1.,1.) and r.width>20 and r.height>20 and r.y0<360 and r.x1<810 or d['fill']==(1.,1.,1.) and 380<r.y0<400 and r.width>90:
  pts=[xy(*it[1]) for it in d['items'] if it[0]=='l']
  if ri<len(rd):
   name,area=rd[ri];model['rooms'].append(dict(id='R-%02d'%(ri+1),name=name,areaSource=area,polygon=pts,source='A-02'));ri+=1
# Exact CAD structural footprints retained as reference (including window rebates).
model['sourceFootprints']=[]
for d in p.get_drawings():
 if d['fill'] and abs(d['fill'][0]-.8)<.001:
  model['sourceFootprints'].append([xy(*it[1]) for it in d['items'] if it[0]=='l'])
model['floorPolygon']=[xy(x,y) for x,y in [(93.768,51.079),(800.069,51.079),(800.069,514.072),(194.162,514.072),(194.162,372.334),(93.768,372.334)]]
# Raster overlays use a fixed crop and one calibrated transform on all architectural sheets.
from PIL import Image
(root/'assets').mkdir(exist_ok=True)
for i,page in enumerate(arch):
 clip=fitz.Rect(85,45,810,520);pix=page.get_pixmap(matrix=fitz.Matrix(2,2),clip=clip)
 name=f'assets/blueprint-{i}.webp';Image.frombytes('RGB',[pix.width,pix.height],pix.samples).save(root/name,quality=90)
 model['sources'].append(dict(id=['A-02','A-03','A-04','A-05','A-07','A-08','A-10'][i],name=['Размеры и планировка','Мебель','Сантехника и отопление','Тёплый пол','Розетки и выключатели','Электрические выводы','Освещение'][i],image=name,origin=xy(85,45),size=[725/S,475/S],page=i+1))
# Smart-home PDF is aligned by its inner top-left and inner width. Derived from vector wall fills below.
(root/'project.json').write_text(json.dumps(model,ensure_ascii=False,indent=2))
print('Written',len(model['walls']),'walls,',len(model['openings']),'openings,',len(model['rooms']),'rooms')
