/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import * as W from '../../../../public_html/assets/apps/bimcraft/dev/ifc/api.js';
import {IfcModel} from '../../../../public_html/assets/apps/bimcraft/dev/ifc-model.js';
import {newBuilding,stackLevels} from '../../../../public_html/assets/apps/bimcraft/dev/new-model.js';
import {readLevels} from '../../../../public_html/assets/apps/bimcraft/dev/model-levels.js';
import {readWalls} from '../../../../public_html/assets/apps/bimcraft/dev/model-walls.js';
import {drawWalls,saveWallAssembly,placeOpening,op} from '../../../../public_html/assets/apps/bimcraft/dev/model-ops.js';
import {saveMaterial,readMaterials} from '../../../../public_html/assets/apps/bimcraft/dev/project-materials.js';
import {placeSectionLine,readSectionLines,sectionDir,composeSheet,setPdf} from '../../../../public_html/assets/apps/bimcraft/dev/res-sheets.js';
import {setProjectedView,readProjectedView,projectedBox} from '../../../../public_html/assets/apps/bimcraft/dev/projected-views.js';
import {saveSheet} from '../../../../public_html/assets/apps/bimcraft/dev/views-model.js';
import {sectionModel} from '../../../../public_html/assets/apps/bimcraft/dev/wall-section-graphics.js';
import {viewerToPlan} from '../../../../public_html/assets/apps/bimcraft/dev/model-plan.js';
import {modelTriangles,projectView} from '../../../../public_html/assets/apps/bimcraft/dev/res-views.js';
import {model as open,exterior,interior} from '../f04/fixture.mjs';
export const fixture=new URL('../../../../fixtures/f05/wall-views.ifc',import.meta.url);
export const model=(bytes=fs.readFileSync(fixture))=>open(bytes);
export async function generate() {
 const m=await model(new TextEncoder().encode(newBuilding({name:'F05 straight-wall sections',levels:stackLevels(1,3300,()=> 'F05 Ground'),now:new Date('2026-10-22T12:00:00Z')})));
 m.change(saveWallAssembly({...exterior,key:'wall-f05-exterior',name:'F05 rainscreen'}));
 m.change(saveWallAssembly({...interior,key:'wall-f05-interior',name:'F05 service partition'}));
 const lv=readLevels(m.w())[0];
 m.change(drawWalls({storey:lv.guid,typeKey:'wall-f05-exterior',height:3000,segs:[{a:[0,0],b:[6000,0],justification:'coreCenter'}]}));
 m.change(drawWalls({storey:lv.guid,typeKey:'wall-f05-interior',height:2700,segs:[{a:[6000,1800],b:[0,1800],justification:'coreCenter',extSide:'left'}]}));
 const walls=readWalls(m.w());
 m.change(placeOpening({wall:walls[0].guid,typeKey:'door-single',offset:900,width:900,height:2100,sill:0}));
 m.change(placeOpening({wall:walls[0].guid,typeKey:'win-fixed',offset:2700,width:1400,height:1350,sill:850}));
 m.change(placeOpening({wall:walls[1].guid,typeKey:'win-fixed',offset:2600,width:1200,height:1000,sill:1100}));
 m.change(placeSectionLine({level:lv.guid,a:[3200,-500],b:[3200,2300],look:'right',depth:3000,name:'A'}));
 const sl=readSectionLines(m.w())[0];
 m.change(setProjectedView('section:'+sl.guid,{detail:'fine',scale:20,crop:[-2200,-200,400,3200]}));
 m.change(setProjectedView('elevation:south',{detail:'fine',scale:50,crop:null}));
 m.change(saveSheet({number:'F05-01',title:'Wall section and south elevation',paper:'a3',views:[{kind:'section',ref:sl.guid,x:90,y:165,ratio:20},{kind:'elevation',ref:'south',x:275,y:170,ratio:50}]}));
 m.change(op(w=>{const mat=readMaterials(w).find(x=>x.legacyName==='F04 membrane');saveMaterial(w,{...mat,color:'#a31b54',fillColor:'#a31b54'});return [];}));
 let text=new TextDecoder().decode(m.ed.save());
 const guids=[...new Set([...text.matchAll(/#[0-9]+=IFC[A-Z0-9]+\('([0-3][0-9A-Za-z_$]{21})'/g)].map(m=>m[1]))];
 for(const [i,g]of guids.entries())text=text.split(g).join('0F05'+String(i).padStart(18,'0'));
 const re=await model(new TextEncoder().encode(text));return re.w().api.file(re.w().mid).save({timeStamp:'2026-10-22T12:00:00'});
}
export async function triangles(m,storey=readLevels(m.w())[0].id) {
 const host=await IfcModel.create(W,null),loaded=await host.load(m.ed.save());
 const els=modelTriangles(loaded,viewerToPlan(host.api.GetCoordinationMatrix(loaded.modelID),m.w().storeyWorld(storey)));
 host.api.CloseModel(loaded.modelID);return els;
}
export async function view(m,changes={},elevation=false) {
 const w=m.w(),lv=readLevels(w)[0],sl=readSectionLines(w)[0],sd=sectionDir(sl),settings=readProjectedView(w,elevation?'elevation:south':'section:'+sl.guid);
 return projectView(await triangles(m),{...sectionModel(w,lv.id),materials:readMaterials(w),dir:elevation?[0,1]:sd.dir,...(!elevation?{cut:{o:sd.o},far:sl.depth}:{}),detail:settings.detail,scale:settings.scale,box:projectedBox(settings),...changes});
}
export function sheet(view,elevation,ratio=20) {return composeSheet({number:'F05',title:'Straight wall acceptance',views:[{kind:'section',ref:'s',x:95,y:165,ratio},{kind:'elevation',ref:'south',x:280,y:165,ratio:50}]},{sections:[{ref:'s',title:'Section A',view}],elevations:[{ref:'south',title:'South elevation',view:elevation}]},{paper:'a3',units:'mm',date:'2026-10-22',project:'F05 synthetic fixture'});}
export {setPdf};
if(process.argv[1]===fileURLToPath(import.meta.url)){fs.writeFileSync(fixture,await generate());console.log(fileURLToPath(fixture));}
