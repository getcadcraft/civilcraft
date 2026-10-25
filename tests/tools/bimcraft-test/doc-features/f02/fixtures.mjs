/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import * as W from '../../../../public_html/assets/apps/bimcraft/dev/ifc/api.js';
import { init } from '../../../../public_html/assets/apps/bimcraft/dev/i18n.js';
import { newBuilding, stackLevels } from '../../../../public_html/assets/apps/bimcraft/dev/new-model.js';
import { IfcEditor } from '../../../../public_html/assets/apps/bimcraft/dev/ifc-edit.js';
import { ModelWriter } from '../../../../public_html/assets/apps/bimcraft/dev/model-write.js';
import { readLevels } from '../../../../public_html/assets/apps/bimcraft/dev/model-levels.js';
import { readWalls } from '../../../../public_html/assets/apps/bimcraft/dev/model-walls.js';
import { saveWallAssembly, drawWalls } from '../../../../public_html/assets/apps/bimcraft/dev/model-ops.js';
import { saveWallDimension, WALL_REFERENCES } from '../../../../public_html/assets/apps/bimcraft/dev/wall-dimensions.js';
init({strings:JSON.parse(fs.readFileSync(new URL('../../../../public_html/assets/apps/bimcraft/dev/lang/en.json',import.meta.url)))});
export const directory=new URL('../../../../fixtures/f02/',import.meta.url);
export const cases=['mm','m','inch','foot'].flatMap(unit=>[false,true].map(translated=>({name:unit+(translated?'-translated':'-local'),unit,unitMm:{mm:1,m:1000,inch:25.4,foot:304.8}[unit],origin:translated?[1000000.000123,-1000000.000321]:[0.000123,-0.000321],project:translated?[10000000,-10000000]:[0,0]})));
export const recipe={key:'wall-f02',name:'F02 precision wall',exterior:true,layers:[
 {mat:'siding',t:19.123456,function:'finish',core:false},
 {mat:'air',t:25.4,kind:'cavity',ventilation:'ventilated',function:'substrate',core:false},
 {mat:'membrane',t:0,function:'membrane',core:false},
 {mat:'studs',t:139.7,function:'structure',core:true},
 {mat:'gypsum',t:12.7,function:'finish',core:false}
]};
export async function model(bytes) {
 const api=new W.IfcAPI();await api.Init({manifold:false});
 const mid=api.OpenModel(bytes);const ed=new IfcEditor(W,{api,modelID:mid});
 return {ed,w:()=>new ModelWriter(W,api,mid),change:op=>ed.modelChange(op)};
}
export async function seed(c) {
 let text=newBuilding({name:'F02 '+c.name,levels:stackLevels(1,3000,()=> 'Ground'),now:new Date('2026-10-21T12:00:00Z')});
 if(c.unit==='m') text=text.replace('IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)','IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)');
 if(c.unit==='inch'||c.unit==='foot') {
  text=text.replace('IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)',`IFCCONVERSIONBASEDUNIT(#90001,.LENGTHUNIT.,'${c.unit}',#90002)`);
  text=text.replace('ENDSEC;\nEND-ISO',`#90001=IFCDIMENSIONALEXPONENTS(1,0,0,0,0,0,0);\n#90002=IFCMEASUREWITHUNIT(IFCLENGTHMEASURE(${c.unitMm/1000}),#90003);\n#90003=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);\nENDSEC;\nEND-ISO`);
 }
 const m=await model(new TextEncoder().encode(text)),w=m.w(),level=readLevels(w)[0];
 // Storey placement is deliberately translated in project space; model edits remain local.
 const st=w.api.GetLine(w.mid,level.id,false),lp=st.ObjectPlacement.value;
 w.run(w=>w.movePlacement(lp,...c.project,0,0));
 m.change(saveWallAssembly(recipe));
 for(const [i,bulge] of [0,0.25,-0.25].entries()) {
  const a=[c.origin[0],c.origin[1]+i*10000],b=[a[0]+5000,a[1]];
  m.change(drawWalls({storey:level.guid,typeKey:recipe.key,segs:[{a,b,bulge,justification:'coreCenter'}],height:2700.123456}));
 }
 for(const wall of readWalls(m.w())) for(const reference of WALL_REFERENCES) {
  m.change(saveWallDimension({level:level.guid,view:'plan:'+level.guid,axis:'aligned',offset:300.002,refs:[{wall:wall.guid,reference,station:0.123456},{wall:wall.guid,reference,station:0.876544}]}));
 }
 // Freeze all generated IDs deterministically by entity order, including JSON references.
 text=new TextDecoder().decode(m.ed.save());
 const guids=[...new Set([...text.matchAll(/#[0-9]+=IFC[A-Z0-9]+\('([0-3][0-9A-Za-z_$]{21})'/g)].map(m=>m[1]))];
 for(const [i,g] of guids.entries())text=text.split(g).join('0F02'+String(cases.indexOf(c)).padStart(2,'0')+String(i).padStart(16,'0'));
 return new TextEncoder().encode(text);
}
if(process.argv.includes('--generate')) {
 for(const c of cases)fs.writeFileSync(new URL(c.name+'.ifc',directory),await seed(c));
 fs.writeFileSync(new URL('cases.json',directory),JSON.stringify(cases,null,2)+'\n');
}
