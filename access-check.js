import {wallFrame} from './model.js?v=8.4.0';
export function frontClearance(p,o){
 const a=o.rotation?.[1]||0,fx=Math.sin(a),fz=Math.cos(a),half=o.size[2]*(o.scale?.[2]||1)/2;
 const obstacles=p.objects.filter(x=>x.id!==o.id&&['bed','sofa','cabinet','island','washer','dryingCabinet','fridge','freezer','ovenTower','coffeeTower','dishwasher','hob','kitchenSink','sink'].includes(x.kind));
 for(let distance=.05;distance<=2;distance+=.05){
  for(const side of [-.35,0,.35]){const x=o.position[0]+fx*(half+distance)+Math.cos(a)*o.size[0]*side,z=o.position[2]+fz*(half+distance)-Math.sin(a)*o.size[0]*side;
   for(const w of p.walls){const f=wallFrame(p,w),t=(x-f.a[0])*f.dx+(z-f.a[1])*f.dz;if(t<0||t>f.length)continue;if(Math.abs((x-f.a[0])*f.dz-(z-f.a[1])*f.dx)<w.thickness/2&&!p.openings.some(op=>op.wallId===w.id&&op.type==='door'&&t>op.offset&&t<op.offset+op.width))return Math.max(0,distance-.05);}
   for(const b of obstacles){const dx=x-b.position[0],dz=z-b.position[2],r=b.rotation[1];if(Math.abs(Math.cos(r)*dx-Math.sin(r)*dz)<b.size[0]*b.scale[0]/2&&Math.abs(Math.sin(r)*dx+Math.cos(r)*dz)<b.size[2]*b.scale[2]/2)return Math.max(0,distance-.05);}
  }
 }return 2;
}
