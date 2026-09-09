export function cablePath(project,route){
 const result=[],seen=new Set();let current=route;
 while(current&&!seen.has(current.id)){seen.add(current.id);result.unshift(current);if(current.from==='PANEL'||current.from==='RACK')break;const parents=project.routes.filter(r=>r.circuit===current.circuit&&r.to===current.from);if(parents.length!==1)break;current=parents[0];}
 return result;
}
export function pathLength(routes){return routes.reduce((s,r)=>s+r.route.slice(1).reduce((n,p,i)=>n+Math.hypot(...p.map((v,j)=>v-r.route[i][j])),0),0);}
