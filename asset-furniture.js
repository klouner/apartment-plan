import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const templates=new Map();
export const furnitureAssets=['sofa_02','sofa_03','modern_arm_chair_01','dining_chair_02'];
export async function loadFurniture(){
 const loader=new GLTFLoader();
 return Promise.allSettled(furnitureAssets.map(async id=>{
  const {scene}=await loader.loadAsync(`assets/furniture/${id}/${id}.gltf`);
  const lights=[];scene.traverse(n=>{if(n.isLight||n.isCamera)lights.push(n);if(n.isMesh){n.castShadow=n.receiveShadow=true;n.userData.sharedGeometry=true;for(const m of Array.isArray(n.material)?n.material:[n.material]){for(const key of ['map','normalMap','roughnessMap','metalnessMap','aoMap'])if(m[key])m[key].anisotropy=4;}}});lights.forEach(n=>n.removeFromParent());
  scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  if(size.toArray().some(v=>!Number.isFinite(v)||v<=0))throw Error(`Invalid furniture: ${id}`);
  scene.position.sub(new T.Vector3(center.x,bounds.min.y,center.z));
  const root=new T.Group();root.add(scene);templates.set(id,{root,size});
 }));
}
export function assetFurniture(g,o){
 const id=o.kind==='sofa'?(o.id==='SOFA-02'?'sofa_03':'sofa_02'):o.kind==='armchair'?'modern_arm_chair_01':o.kind==='chair'?'dining_chair_02':null;
 const asset=templates.get(id);if(!asset)return false;
 const model=asset.root.clone(true);model.scale.set(o.size[0]/asset.size.x,o.size[1]/asset.size.y,o.size[2]/asset.size.z);g.add(model);
 g.userData.modelQuality='Poly Haven · CC0';g.userData.furnitureAsset=id;return true;
}
