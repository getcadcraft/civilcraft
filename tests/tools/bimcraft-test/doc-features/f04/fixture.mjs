/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import * as W from '../../../../public_html/assets/apps/bimcraft/dev/ifc/api.js';
import {init} from '../../../../public_html/assets/apps/bimcraft/dev/i18n.js';
import {newBuilding,stackLevels} from '../../../../public_html/assets/apps/bimcraft/dev/new-model.js';
import {IfcEditor} from '../../../../public_html/assets/apps/bimcraft/dev/ifc-edit.js';
import {ModelWriter} from '../../../../public_html/assets/apps/bimcraft/dev/model-write.js';
import {readLevels} from '../../../../public_html/assets/apps/bimcraft/dev/model-levels.js';
import {readWalls,wallOutlines} from '../../../../public_html/assets/apps/bimcraft/dev/model-walls.js';
import {readOpenings,openingSymbol} from '../../../../public_html/assets/apps/bimcraft/dev/model-openings.js';
import {drawWalls,saveWallAssembly,placeOpening,op} from '../../../../public_html/assets/apps/bimcraft/dev/model-ops.js';
import {readMaterials,saveMaterial} from '../../../../public_html/assets/apps/bimcraft/dev/project-materials.js';
import {wallPieces} from '../../../../public_html/assets/apps/bimcraft/dev/model-plan.js';
import {wallPlanEdges} from '../../../../public_html/assets/apps/bimcraft/dev/wall-plan-graphics.js';
import {planLoops} from '../../../../public_html/assets/apps/bimcraft/dev/model-rooms.js';
import {saveWallDimension,readWallDimensions,resolveDimension} from '../../../../public_html/assets/apps/bimcraft/dev/wall-dimensions.js';
init({strings:JSON.parse(fs.readFileSync(new URL('../../../../public_html/assets/apps/bimcraft/dev/lang/en.json',import.meta.url)))});
export const fixture=new URL('../../../../fixtures/f04/layered-plans.ifc',import.meta.url);
export const exterior={key:'wall-f04-rainscreen',name:'F04 ventilated rainscreen',exterior:true,layers:[
 {mat:'siding',t:19.05,function:'finish',core:false},
 {mat:'air',t:25.4,kind:'cavity',ventilation:'ventilated',function:'substrate',core:false},
 {mat:'F04 membrane',t:0,function:'membrane',core:false},
 {mat:'osb',t:12.7,function:'substrate',core:false},
 {mat:'studs',t:139.7,function:'structure',core:true},
 {mat:'gypsum',t:12.7,function:'finish',core:false}
]};
export const interior={key:'wall-f04-partition',name:'F04 service cavity partition',exterior:false,layers:[
 {mat:'gypsum',t:12.7,function:'finish',core:false},
 {mat:'air',t:38.1,kind:'cavity',ventilation:'ventilated',function:'substrate',core:false},
 {mat:'F04 membrane',t:0,function:'membrane',core:false},
 {mat:'studs',t:88.9,function:'structure',core:true},
 {mat:'gypsum',t:15.875,function:'finish',core:false}
]};
export async function model(bytes=fs.readFileSync(fixture)) {
 const api=new W.IfcAPI();await api.Init({manifold:false});const mid=api.OpenModel(bytes);
 const ed=new IfcEditor(W,{api,modelID:mid});return {ed,w:()=>new ModelWriter(W,api,mid),change:f=>ed.modelChange(f)};
}
export async function generate() {
 const m=await model(new TextEncoder().encode(newBuilding({name:'F04 layered plan acceptance',levels:stackLevels(1,3000,()=> 'F04 Ground'),now:new Date('2026-10-21T12:00:00Z')})));
 m.change(saveWallAssembly(exterior));m.change(saveWallAssembly(interior));
 const level=readLevels(m.w())[0];
 const add=(segs,typeKey=exterior.key)=>m.change(drawWalls({storey:level.guid,segs,typeKey,height:2700}));
 // Straight isolated, reversed, and signed curves; each location-line mode is represented.
 add([{a:[0,0],b:[6000,0],justification:'coreCenter'}, {a:[6000,1600],b:[0,1600],extSide:'right',justification:'coreExterior'},
 {a:[0,4000],b:[6000,4000],bulge:.25,justification:'exterior'}, {a:[6000,6500],b:[0,6500],bulge:-.25,extSide:'right',justification:'coreInterior'}]);
 // Existing physical L and T joins; no new wrapping or join model.
 add([{a:[8000,0],b:[13000,0]}, {a:[13000,0],b:[13000,4000]}]);
 add([{a:[8000,6500],b:[14000,6500],justification:'center'}]);
 add([{a:[11000,6500],b:[11000,9500],justification:'center'}],interior.key);
 add([{a:[0,9500],b:[6000,9500],justification:'interior'}],interior.key);
 const walls=readWalls(m.w());
 for(const [index,typeKey,offset,width,sill,height] of [[0,'door-single',1000,900,0,2100],[1,'win-fixed',3000,1200,900,1200],[2,'win-fixed',2000,1000,900,1200],[3,'door-single',1000,900,0,2100],[6,'win-fixed',800,900,900,1200]])
  m.change(placeOpening({wall:walls[index].guid,typeKey,offset,width,sill,height}));
 for(const [i,refs]of [['exterior','interior'],['coreExterior','coreInterior']].entries())m.change(saveWallDimension({level:level.guid,view:'plan:'+level.guid,axis:'y',offset:600+i*550,refs:refs.map(reference=>({wall:walls[0].guid,reference,station:.8}))}));
 m.change(op(w=>{const mat=readMaterials(w).find(x=>x.legacyName==='F04 membrane');saveMaterial(w,{...mat,color:'#a31b54',fillColor:'#a31b54'});return [];}));
 let text=new TextDecoder().decode(m.ed.save());
 const guids=[...new Set([...text.matchAll(/#[0-9]+=IFC[A-Z0-9]+\('([0-3][0-9A-Za-z_$]{21})'/g)].map(m=>m[1]))];
 for(const [i,g]of guids.entries())text=text.split(g).join('0F04'+String(i).padStart(18,'0'));
 // Deterministic header and owner-history time, without removing any model records.
 const reopened=await model(new TextEncoder().encode(text));
 return reopened.w().api.file(reopened.w().mid).save({timeStamp:'2026-10-21T12:00:00'});
}
export function scene(m,graphics=null,detail='fine',scale=50) {
 const w=m.w(),walls=readWalls(w),openings=readOpenings(w),outlines=wallOutlines(walls.map(x=>({...x,key:x.guid})));
 const rows=graphics?graphics(walls,outlines,openings,readMaterials(w),{detail,scale}):walls.map(x=>({key:x.id,guid:x.guid,poly:outlines.get(x.guid),pieces:wallPieces(x,outlines.get(x.guid),openings.filter(o=>o.wall===x.id))}));
 const loops=graphics?null:planLoops(rows.flatMap(x=>x.pieces));
 return {walls:rows,wallEdges:graphics?wallPlanEdges(rows):[...loops.rooms.flatMap(r=>[r.poly,...r.holes]),...loops.outlines.map(o=>o.poly)],symbols:openings.map(o=>({key:o.id,guid:o.guid,...openingSymbol(o,walls.find(x=>x.id===o.wall))})),dims:readWallDimensions(w).map(d=>resolveDimension(d,walls)).filter(d=>d.status==='ok').map(d=>({...d,key:d.guid,text:d.value.toFixed(2)+' mm'})),rooms:[],cut:[],below:[],detail,scale};
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {fs.writeFileSync(fixture,await generate());console.log(fileURLToPath(fixture));}
