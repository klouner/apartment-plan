import fs from 'node:fs/promises';
import path from 'node:path';
const ids=['sofa_02','sofa_03','modern_arm_chair_01','dining_chair_02'];
for(const id of ids){
 const response=await fetch(`https://api.polyhaven.com/files/${id}`);if(!response.ok)throw Error(response.status);
 const data=await response.json(),asset=data.gltf['1k'].gltf,dir=`assets/furniture/${id}`;
 for(const [name,file] of Object.entries({[`${id}.gltf`]:asset,...asset.include})){
  const dest=path.join(dir,name);await fs.mkdir(path.dirname(dest),{recursive:true});const r=await fetch(file.url);if(!r.ok)throw Error(file.url);await fs.writeFile(dest,Buffer.from(await r.arrayBuffer()));
 }
 console.log(id,asset.size+Object.values(asset.include).reduce((s,f)=>s+f.size,0));
}
