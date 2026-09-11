// Presentation only: order, IDs, DIN widths and netlist remain owned by the project.
const s=(tag,a={},text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
export function railTitle(row){
 if(row.some(x=>x.id==='XT-POWER'))return 'КЛЕММЫ · СИЛОВЫЕ ЛИНИИ';
 if(row.some(x=>x.id==='XT-SIGNAL'))return 'КЛЕММЫ · СИГНАЛЫ И ДАТЧИКИ';
 if(row.some(x=>x.id==='WB-01'))return 'КОНТРОЛЛЕР · СВЯЗЬ · ПИТАНИЕ';
 if(row.some(x=>x.id.startsWith('MR-')))return 'АВТОМАТИКА · СВЕТ И ШТОРЫ';
 if(row.some(x=>x.id.startsWith('PS-')))return 'ПИТАНИЕ 24 В · ЗАЩИТА DC';
 if(row.some(x=>x.id==='INPUT'))return 'ВВОД · ГРУППОВАЯ ЗАЩИТА';
 return 'ГРУППОВАЯ ЗАЩИТА · РЕЗЕРВ';
}
export function panelLayoutView(e,onDevice){
 const rows=e.panelLayout.rails,H=155+rows.length*166;
 const svg=s('svg',{viewBox:`0 0 1100 ${H}`,role:'img','aria-label':'Монтажная панель щита: аппараты, DIN-рейки, клеммы и кабельные каналы'});
 svg.append(s('rect',{x:8,y:8,width:1084,height:H-16,rx:12,fill:'#dadcd9',stroke:'#86918e','stroke-width':8}),s('rect',{x:28,y:28,width:1044,height:H-56,fill:'#eceeea',stroke:'#b1b8b3'}));
 svg.append(s('text',{x:100,y: 60,fill:'#243e3a','font-family':'sans-serif','font-size':24,'font-weight':700},'ЩР–01   /   ВЫДРИНО'),s('text',{x:100,y:86,fill:'#5e716b','font-size':13},'МОНТАЖНАЯ КОМПОНОВКА   ·   '+rows.length+' × '+e.panelLayout.dinPerRow+' DIN'));
 function duct(x,y,w,h){svg.append(s('rect',{x,y,width:w,height:h,fill:'#b8bfba',stroke:'#8a9790'}));const vertical=h>w;for(let i=6;i<(vertical?h:w)-4;i+=10)svg.append(s('path',{d:vertical?`M ${x} ${y+i} h 8 M ${x+w-8} ${y+i} h 8`:`M ${x+i} ${y} v 6 M ${x+i} ${y+h-6} v 6`,stroke:'#6e7d75','stroke-width':2}));}
 duct(42,105,38,H-155);duct(1020,105,38,H-155);
 rows.forEach((row,i)=>{const y=126+i*166;svg.append(s('text',{x:100,y:y-13,fill:'#3e5850','font-size':13,'font-weight':600},`${String(i+1).padStart(2,'0')}  /  ${railTitle(row)}`));
  svg.append(s('rect',{x:96,y:y+30,width:908,height:38,fill:'#a8b2ad',stroke:'#7b8880'}),s('path',{d:`M 96 ${y+35} H 1004 M 96 ${y+63} H 1004`,stroke:'#f9fbf8','stroke-width':3}));
  duct(96,y+119,908,23);let x=100;
  for(const item of row){const w=item.din*37.5,g=s('g',{tabindex:0,role:'button','aria-label':item.id+' '+item.name,style:'cursor:pointer'});g.append(s('title',{},item.id+' · '+item.name));
   if(item.kind==='terminal'){
    const signal=item.id==='XT-SIGNAL',count=signal?48:45,cw=(w-10)/count;
    for(let j=0;j<count;j++){const color=signal?'#c5ceca':['#a6aea9','#75b4d1','#bdc96c'][j%3];const xx=x+5+j*cw;g.append(s('rect',{x:xx,y:y+4,width:cw-1,height:86,fill:color,stroke:'#7c8b83','stroke-width':.6}));for(const yy of [y+18,y+73])g.append(s('circle',{cx:xx+cw/2,cy:yy,r:3.2,fill:'#45594f'}));g.append(s('rect',{x:xx+1,y:y+36,width:cw-3,height:19,fill:'#f6f7ef'}));}
    g.append(s('text',{x:x+w/2,y:y+107,'text-anchor':'middle',fill:'#263e34','font-size':13},item.id+' · '+(signal?'СИГНАЛЬНЫЕ ЦЕПИ':'L / N / PE')));
   }else if(item.kind==='reserve'){
    g.append(s('rect',{x:x+2,y:y+2,width:w-6,height:90,fill:'#e4e7df',stroke:'#98a69c','stroke-dasharray':'4 4'}),s('text',{x:x+w/2,y:y+43,'text-anchor':'middle',fill:'#6c7b70','font-size':13},item.id==='INPUT'?'ВВОД · ПОДБОР':'РЕЗЕРВ'),s('text',{x:x+w/2,y:y+64,'text-anchor':'middle',fill:'#7c897e','font-size':12},item.din+' DIN'));
   }else{
    const module=item.kind==='module',ps=item.id.startsWith('PS-');
    g.append(s('rect',{x:x+3,y:y+4,width:w-7,height:91,rx:2,fill:'#a0aaa2'}),s('rect',{x:x+1,y,width:w-7,height:90,rx:2,fill:ps?'#b1b9b2':'#f7f6ee',stroke:'#9ca99f'}));
    for(const yy of [y+4,y+72])for(let j=0;j<(module?Math.min(8,item.din*2):2);j++){const n=module?Math.min(8,item.din*2):2,xx=x+7+j*(w-20)/n;g.append(s('rect',{x:xx,y:yy,width:(w-20)/n-2,height:14,fill:module&&!ps?'#59965c':'#d9ddd3'}),s('circle',{cx:xx+(w-20)/n/2-1,cy:yy+7,r:2.4,fill:'#4b5d50'}));}
    g.append(s('text',{x:x+(w-6)/2,y:y+34,'text-anchor':'middle',fill:'#223c2c','font-size':Math.min(13,w/8),'font-weight':700},item.id));
    if(module){g.append(s('text',{x:x+(w-6)/2,y:y+52,'text-anchor':'middle',fill:'#466044','font-size':Math.min(10,w/13)},ps?'24 V DC':item.name.replace(' v.3','').replace(' v.2','')),s('circle',{cx:x+10,cy:y+61,r:2.2,fill:'#75a65b'}));if(ps)for(let j=0;j<7;j++)g.append(s('path',{d:`M ${x+w-24+j*2} ${y+24} v 40`,stroke:'#708173'}));}
    else {const q=e.protections.find(q=>q.id===item.id);g.append(s('rect',{x:x+w*.29,y:y+42,width:w*.36,height:18,rx:1,fill:'#33493a'}),s('rect',{x:x+w*.32,y:y+44,width:w*.30,height:5,fill:'#667a6a'}),s('text',{x:x+(w-6)/2,y:y+69,'text-anchor':'middle',fill:'#405741','font-size':10},q?q.curve+q.amps+' · 30 mA':'ПОДБОР'));}
    g.append(s('rect',{x:x+2,y:y+98,width:w-8,height:15,fill:'#fafbf4',stroke:'#c4ccc0'}),s('text',{x:x+(w-6)/2,y:y+109,'text-anchor':'middle',fill:'#223b2b','font-size':Math.min(10,w/9)},item.id));
   }
   g.onclick=()=>onDevice(item.id);g.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onDevice(item.id);}};svg.append(g);x+=w;
  }
 });
 for(const x of [25,1075])for(const y of [25,H-25])svg.append(s('circle',{cx:x,cy:y,r:5,fill:'#737f76'}));return svg;
}

