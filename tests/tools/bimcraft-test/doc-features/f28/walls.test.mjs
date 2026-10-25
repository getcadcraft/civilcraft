/* SPDX-License-Identifier: Apache-2.0 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {model,fixture} from '../f04/fixture.mjs';
import {readLevels} from '../../../../public_html/assets/apps/bimcraft/dev/model-levels.js';
import {readWalls,locationLine} from '../../../../public_html/assets/apps/bimcraft/dev/model-walls.js';
import {readAssemblies} from '../../../../public_html/assets/apps/bimcraft/dev/wall-assemblies.js';
import {readMaterials,saveMaterial} from '../../../../public_html/assets/apps/bimcraft/dev/project-materials.js';
import {readWallDimensions,resolveDimension} from '../../../../public_html/assets/apps/bimcraft/dev/wall-dimensions.js';
import {drawWallPath,saveWallAssembly,changeWall,op} from '../../../../public_html/assets/apps/bimcraft/dev/model-ops.js';
import {placementReference,placementPath,WALL_LOCATION_LINES} from '../../../../public_html/assets/apps/bimcraft/dev/wall-placement.js';
import {wallSelection} from '../../../../public_html/assets/apps/bimcraft/dev/workspace/walls.js';
import {createCommands,shortcutCommand} from '../../../../public_html/assets/apps/bimcraft/dev/workspace/commands.js';
const close=(a,b)=>{assert.equal(a.length,b.length);a.forEach((x,i)=>assert.ok(Math.abs(x-b[i])<.00001,`${x} != ${b[i]}`));};
// Journals may allocate a fresh STEP property-set container on Redo; stable type/material/wall GUIDs and values are retained.
const values=walls=>walls.map(w=>({...w,assembly:w.assembly&&(({psetId,...record})=>record)(w.assembly)}));
test('all six placement lines and both exterior orientations use actual IFC axes and journals',async()=>{
 const m=await model(),level=readLevels(m.w())[0],type=readAssemblies(m.w())[0];
 for(const [i,reference]of WALL_LOCATION_LINES.entries())for(const [j,side]of ['left','right'].entries()){
  const points=[[20000+i*5000,15000+j*3000],[23000+i*5000,15000+j*3000]],spec=placementReference(reference,type,side);
  m.change(drawWallPath({storey:level.guid,points,guids:[],typeKey:type.key,reference,extSide:side,...spec,height:2800}));
  const made=readWalls(m.w()).at(-1),line=locationLine(made);close(line.a,points[0]);close(line.b,points[1]);assert.equal(made.justification,reference);assert.equal(made.extSide,side);
  const guid=made.guid;m.ed.undo();assert.ok(!readWalls(m.w()).some(w=>w.guid===guid));m.ed.redo();assert.ok(readWalls(m.w()).some(w=>w.guid===guid));
 }
 const reopened=await model(m.ed.save());assert.deepEqual(readWalls(reopened.w()),readWalls(m.w()));
 assert.throws(()=>placementReference('coreCenter',{...type,layers:type.layers.map(l=>({...l,core:false}))},'left'),/no usable core/);
 assert.throws(()=>placementReference('unknown',type,'left'),/supported wall location/);
 const path=placementPath([[0,0],[4000,0],[4000,4000]],type,'coreExterior','right');close(path[0].b,path[1].a);
});
test('shared type edits, duplicate assignment and layer reordering preserve identities, core anchors and dimensions',async()=>{
 const bytes=fs.readFileSync(fixture),m=await model(bytes),other=await model(bytes),walls=readWalls(m.w()),first=walls[0],initial=readAssemblies(m.w()),type=initial.find(t=>t.key===first.typeKey);
 const stable=()=>({walls:readWalls(m.w()).map(w=>w.guid),materials:readMaterials(m.w()).map(x=>x.id),dims:readWallDimensions(m.w()).map(d=>[d.guid,d.refs])});
 const identity=stable(),anchor=locationLine(first),width=first.t;
 m.change(saveWallAssembly({...type,layers:type.layers.map((l,i)=>({...l,t:l.t+(i===0?6.35:0)}))}));
 for(const wall of readWalls(m.w()).filter(w=>w.typeKey===type.key))assert.ok(Math.abs(wall.t-width-6.35)<.00001);
 assert.equal(readAssemblies(m.w()).find(t=>t.key===type.key).guid,type.guid);close(locationLine(readWalls(m.w())[0]).a,anchor.a);assert.deepEqual(stable(),identity);
 const copied={...readAssemblies(m.w()).find(t=>t.key===type.key),key:'wall-f28b-duplicate',name:'F28-B selected wall only'};
 m.change(saveWallAssembly(copied,[first.guid]));
 const assigned=readWalls(m.w());assert.equal(assigned.filter(w=>w.typeKey===copied.key).length,1);assert.equal(assigned[0].guid,first.guid);
 const duplicate=readAssemblies(m.w()).find(t=>t.key===copied.key);assert.notEqual(duplicate.guid,type.guid);
 const layers=duplicate.layers.map(l=>({...l}));[layers[0],layers[1]]=[layers[1],layers[0]];layers[1].t+=3.175;
 m.change(saveWallAssembly({...duplicate,layers}));assert.deepEqual(stable(),identity);close(locationLine(readWalls(m.w())[0]).a,anchor.a);
 const changed=values(readWalls(m.w()));m.ed.undo();assert.notDeepEqual(values(readWalls(m.w())),changed);m.ed.redo();assert.deepEqual(values(readWalls(m.w())),changed);
 m.change(changeWall(first.guid,{justification:'coreExterior',baseOffset:25.4,height:2900,extSide:'right'}));
 const material=readMaterials(m.w()).find(x=>x.id===layers.find(l=>l.kind!=='cavity').materialId),before=readAssemblies(m.w());
 m.change(op(w=>{saveMaterial(w,{...material,defaultThickness:31.75,color:'#637b91'});return {};}));assert.deepEqual(readAssemblies(m.w()),before);
 const reopened=await model(m.ed.save());assert.deepEqual(readWalls(reopened.w()),readWalls(m.w()));assert.deepEqual(readAssemblies(reopened.w()),readAssemblies(m.w()));
 for(const d of readWallDimensions(reopened.w()))assert.equal(resolveDimension(d,readWalls(reopened.w())).status,'ok');
 assert.deepEqual(readWalls(other.w()),walls);assert.deepEqual(readAssemblies(other.w()),initial);assert.equal(other.ed.changes.length,0);
});
test('wall commands separate placement, instance type editing, missing records, busy state and cancellation',()=>{
 const wall={id:7,guid:'w1',typeKey:'wall-a',assembly:{}},selection=wallSelection({walls:[wall]},[107],100,'select');assert.equal(selection.supported,true);
 assert.equal(wallSelection({walls:[{...wall,referenceIssue:{}}]},[107],100,'select').supported,false);
 assert.equal(wallSelection({walls:[wall]},[107,108],100,'select').supported,false);
 const s={live:true,document:{},busy:false,levels:[{}],selection:[107],view:{kind:'plan'},wall:selection};let calls=0;
 const c=createCommands({state:()=>s,actions:{wall:()=>++calls,assembly:()=>++calls,structure:()=>++calls,cancel:()=>++calls}});
 assert.equal(c.execute('wall'),1);assert.equal(c.execute('assembly'),2);s.wall.sameType=false;assert.equal(c.execute('assembly'),false);
 s.wall.placing=true;assert.equal(c.describe('assembly').enabled,true);s.busy=true;assert.equal(c.execute('wall'),false);assert.equal(c.execute('cancel'),3);
 s.busy=false;s.wall.placementError='Corrupt assembly record';assert.equal(c.describe('wall').reason,'Corrupt assembly record');
 const event={key:'Escape',target:{closest:()=>null}};assert.equal(shortcutCommand(event,s),'cancel');assert.equal(shortcutCommand({...event,key:'Enter'},s),'finish');assert.equal(shortcutCommand({...event,key:'w'},s),'wall');
 assert.equal(shortcutCommand({...event,target:{closest:()=>true}},s),null);
});
