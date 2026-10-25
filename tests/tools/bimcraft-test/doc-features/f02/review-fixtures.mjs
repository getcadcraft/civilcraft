/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import {model,directory} from './fixtures.mjs';
import {readWalls} from '../../../../public_html/assets/apps/bimcraft/dev/model-walls.js';
import {readWallDimensions,removeWallDimensions,DIMENSION_PSET} from '../../../../public_html/assets/apps/bimcraft/dev/wall-dimensions.js';
import {readAssemblyRecords} from '../../../../public_html/assets/apps/bimcraft/dev/wall-assemblies.js';
import {readMaterials,MATERIAL_PSET} from '../../../../public_html/assets/apps/bimcraft/dev/project-materials.js';
import {removeElements} from '../../../../public_html/assets/apps/bimcraft/dev/model-ops.js';
import {ids} from '../../../../public_html/assets/apps/bimcraft/dev/ifc-util.js';
const load=()=>model(fs.readFileSync(new URL('mm-local.ifc',directory)));
fs.mkdirSync('.cc-test/f02-review',{recursive:true});
const bad=await load(),w=bad.w(),d=readWallDimensions(w)[0],r=readAssemblyRecords(w)[0];
w.run(w=>{
 w.upsertPset(d.id,DIMENSION_PSET,[['Spec','IFCTEXT',JSON.stringify({...d,version:99})]]);
 w.upsertPset(ids(w.api,w.mid,'IFCPROJECT')[0],MATERIAL_PSET,[['Library','IFCTEXT',JSON.stringify({version:99,materials:readMaterials(w)})]]);
 const ps=w.api.GetLine(w.mid,r.psetId,false),p=ps.HasProperties.map(h=>w.api.GetLine(w.mid,h.value,false)).find(p=>p.Name.value==='Recipe');
 const q=w.touch(p.expressID);q.NominalValue=w.T('IFCTEXT',JSON.stringify({...r,version:99}));w.write(q);
});
fs.writeFileSync('.cc-test/f02-review/unsupported.ifc',bad.ed.save());
const missing=await load();missing.change(removeWallDimensions(readWallDimensions(missing.w()).slice(1).map(d=>d.guid)));
missing.change(removeElements({walls:[readWalls(missing.w())[0].guid]}));
fs.writeFileSync('.cc-test/f02-review/missing-host.ifc',missing.ed.save());
// Keep just one annotation so a damaged record's preserved IFC geometry is easy to spot.
const damaged=await load();damaged.change(removeWallDimensions(readWallDimensions(damaged.w()).slice(1).map(d=>d.guid)));
const dw=damaged.w(),dd=readWallDimensions(dw)[0],assembly=readAssemblyRecords(dw)[0];
dw.run(w=>{
 for(const [id,field] of [[w.defNamed(dd.id,DIMENSION_PSET).def,'Spec'],[assembly.psetId,'Recipe'],[w.defNamed(ids(w.api,w.mid,'IFCPROJECT')[0],MATERIAL_PSET).def,'Library']]) {
  const ps=w.touch(id);ps.HasProperties=ps.HasProperties.filter(h=>w.api.GetLine(w.mid,h.value,false).Name.value!==field);w.write(ps);
 }
});
fs.writeFileSync('.cc-test/f02-review/missing-payloads.ifc',damaged.ed.save());
