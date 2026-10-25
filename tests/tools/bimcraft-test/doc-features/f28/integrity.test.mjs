/* SPDX-License-Identifier: Apache-2.0 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {model} from '../f02/fixtures.mjs';
import {readWalls,locationLine} from '../../../../public_html/assets/apps/bimcraft/dev/model-walls.js';
import {changeWall} from '../../../../public_html/assets/apps/bimcraft/dev/model-ops.js';
import {readWallDimensions,resolveDimension,referencePoint,WALL_REFERENCES} from '../../../../public_html/assets/apps/bimcraft/dev/wall-dimensions.js';
import {readAssemblies} from '../../../../public_html/assets/apps/bimcraft/dev/wall-assemblies.js';
import {readMaterials} from '../../../../public_html/assets/apps/bimcraft/dev/project-materials.js';
import {setPlanView,readPlanViews,effectiveView} from '../../../../public_html/assets/apps/bimcraft/dev/views-model.js';
import {readLevels} from '../../../../public_html/assets/apps/bimcraft/dev/model-levels.js';
const bytes=fs.readFileSync(new URL('../../../../fixtures/f02/mm-local.ifc',import.meta.url));
const near=(a,b)=>assert.ok(Math.abs(a-b)<.005,`${a} != ${b}`);
const stable=m=>({walls:readWalls(m.w()).map(w=>[w.guid,w.typeKey,w.a,w.b,w.justification,locationLine(w)]),assemblies:readAssemblies(m.w()),materials:readMaterials(m.w()),dimensions:readWallDimensions(m.w()).map(d=>({guid:d.guid,refs:d.refs,value:resolveDimension(d,readWalls(m.w())).value,status:resolveDimension(d,readWalls(m.w())).status}))});
test('F28 bounded height/base transactions preserve identities, core references, materials and persistent dimensions through undo/redo and actual bytes',async()=>{
 const m=await model(bytes),other=await model(bytes),before=stable(m),wall=readWalls(m.w())[0];
 const refs=WALL_REFERENCES.map(reference=>({wall:wall.guid,reference,station:.4321}));
 const points=refs.map(r=>referencePoint(r,readWalls(m.w())));
 m.change(changeWall(wall.guid,{height:wall.height+250}));near(readWalls(m.w())[0].height,wall.height+250);assert.deepEqual(stable(m),before);
 m.change(changeWall(wall.guid,{baseOffset:125}));near(readWalls(m.w())[0].baseOffset,125);assert.deepEqual(stable(m),before);
 m.ed.undo();near(readWalls(m.w())[0].baseOffset,wall.baseOffset);m.ed.redo();near(readWalls(m.w())[0].baseOffset,125);
 const saved=m.ed.save();fs.mkdirSync('.cc-test/f28',{recursive:true});fs.writeFileSync('.cc-test/f28/bounded-edit.ifc',saved);
 const reopened=await model(saved);assert.deepEqual(stable(reopened),before);near(readWalls(reopened.w())[0].height,wall.height+250);near(readWalls(reopened.w())[0].baseOffset,125);
 for(const [i,r]of refs.entries()) {const p=referencePoint(r,readWalls(reopened.w()));near(p[0],points[i][0]);near(p[1],points[i][1]);}
 assert.deepEqual(stable(other),before);near(readWalls(other.w())[0].height,wall.height);near(readWalls(other.w())[0].baseOffset,wall.baseOffset);
});
test('detail/scale transactions preserve all other view settings and template semantics',async()=>{
 const m=await model(bytes),lv=readLevels(m.w())[0];
 m.change(setPlanView(lv.guid,{cut:1300,top:2800,bottom:100,depth:75,detail:'fine',scale:50}));
 m.change(setPlanView(lv.guid,{detail:'medium'}));
 let v=readPlanViews(m.w()).get(lv.id);assert.equal(v.cut,1300);assert.equal(v.scale,50);assert.equal(v.detail,'medium');
 m.ed.undo();assert.equal(readPlanViews(m.w()).get(lv.id).detail,'fine');m.ed.redo();
 const re=await model(m.ed.save());v=readPlanViews(re.w()).get(readLevels(re.w())[0].id);assert.equal(v.detail,'medium');assert.equal(v.scale,50);assert.equal(v.depth,75);
 const e=effectiveView({...v,template:'Template'},[{name:'Template',cut:1100,top:2900,bottom:0,depth:80,scale:100,detail:'fine',hidden:[]}],3000);
 assert.equal(e.detail,'fine');assert.equal(e.scale,100);assert.equal(e.template,'Template');
});
