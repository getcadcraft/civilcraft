/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fixture,model,generate,view,sheet,setPdf} from './fixture.mjs';
import {readWalls,locationLine} from '../../../../public_html/assets/apps/bimcraft/dev/model-walls.js';
import {readLevels} from '../../../../public_html/assets/apps/bimcraft/dev/model-levels.js';
import {readOpenings} from '../../../../public_html/assets/apps/bimcraft/dev/model-openings.js';
import {readAssemblies} from '../../../../public_html/assets/apps/bimcraft/dev/wall-assemblies.js';
import {readMaterials,saveMaterial} from '../../../../public_html/assets/apps/bimcraft/dev/project-materials.js';
import {changeWall,changeOpening,saveWallAssembly,op} from '../../../../public_html/assets/apps/bimcraft/dev/model-ops.js';
import {readProjectedView,setProjectedView,PROJECTED_PSET} from '../../../../public_html/assets/apps/bimcraft/dev/projected-views.js';
import {readSectionLines,changeSectionLine,viewItems,sheetSvg} from '../../../../public_html/assets/apps/bimcraft/dev/res-sheets.js';
import {readSheets} from '../../../../public_html/assets/apps/bimcraft/dev/views-model.js';
import {projectView} from '../../../../public_html/assets/apps/bimcraft/dev/res-views.js';
import {wallSectionGraphics,sectionModel} from '../../../../public_html/assets/apps/bimcraft/dev/wall-section-graphics.js';
import {ids} from '../../../../public_html/assets/apps/bimcraft/dev/ifc-util.js';
const out='.cc-test/f05';fs.mkdirSync(out,{recursive:true});
const near=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<.005,`${a} vs ${b}`);
const bytes=m=>m.w().api.file(m.w().mid).save({timeStamp:'2026-10-22T12:00:00'});
const faces=v=>v.cuts.filter(c=>c.source==='authored-wall');
const ys=c=>c.loops.map(p=>[Math.min(...p.map(q=>q[1])),Math.max(...p.map(q=>q[1]))]);
const sx=m=>({walls:readWalls(m.w()),types:readAssemblies(m.w()),openings:readOpenings(m.w()),materials:readMaterials(m.w())});

test('deterministic residential fixture has two opposite assemblies, explicit cores, cavities, membranes and hosted cuts',async()=>{
 assert.deepEqual(Buffer.from(await generate()),fs.readFileSync(fixture));
 const m=await model(),walls=readWalls(m.w()),v=await view(m);
 assert.equal(walls.length,2);assert.equal(readOpenings(m.w()).length,3);assert.equal(readSectionLines(m.w()).length,1);assert.equal(readSheets(m.w()).length,1);
 assert.ok(walls[0].b[0]>walls[0].a[0]&&walls[1].b[0]<walls[1].a[0]);
 assert.equal(faces(v).length,2);assert.deepEqual(v.warnings,[]);
 assert.deepEqual(faces(v).map(c=>c.layers.filter(l=>l.core).map(l=>l.thickness)),[[139.7],[88.9]]);
 fs.writeFileSync(out+'/seed.ifc',m.ed.save());
});
test('cut widths, exterior order and opposite orientations agree with independent authored dimensions',async()=>{
 const v=await view(await model()),cs=faces(v),expected=[[19.05,25.4,0,12.7,139.7,12.7],[12.7,38.1,0,88.9,15.875]];
 for(let i=0;i<2;i++)for(let j=0;j<expected[i].length;j++){
  const l=cs[i].layers[j];near(Math.abs(l.to-l.from),expected[i][j]);assert.equal(l.thickness,expected[i][j]);
  if(i===0)assert.ok(l.to>=l.from);else assert.ok(l.to<=l.from);
  if(l.kind==='cavity')assert.equal(l.fill,'none');
  if(!l.thickness){assert.deepEqual(l.polys,[]);assert.equal(l.from,l.to);}
 }
 assert.equal(cs[0].boundaries.filter(b=>b.membrane).length,1);
 assert.deepEqual(ys(cs[0]),[[0,850],[2200,3000]]);assert.deepEqual(ys(cs[1]),[[0,1100],[2100,2700]]);
});
test('sections before, at jambs, inside and after actual door/window widths respect sill and head',async()=>{
 const m=await model();
 for(const x of [800,900,1350,1800,1800.01,2699.99,2700,3200,4100,4100.01,5000]){
  const c=faces(await view(m,{cut:{o:[x,0]},box:null}))[0];
  assert.deepEqual(ys(c),x>=900&&x<=1800?[[2100,3000]]:x>=2700&&x<=4100?[[0,850],[2200,3000]]:[[0,3000]],'station '+x);
 }
});
test('look flip reverses lateral order while retaining physical widths and exact opening heights',async()=>{
 const m=await model(),a=faces(await view(m)),b=faces(await view(m,{dir:[-1,0],box:null}));
 assert.deepEqual(a.map(ys),b.map(ys));for(let i=0;i<2;i++)for(let j=0;j<a[i].layers.length;j++){near(a[i].layers[j].from,-b[i].layers[j].from);near(a[i].layers[j].to,-b[i].layers[j].to);}
});
test('coarse medium fine are presentation-only and elevations never expose internal layers',async()=>{
 const m=await model(),before=bytes(m),fine=await view(m),medium=await view(m,{detail:'medium'}),coarse=await view(m,{detail:'coarse'}),e=await view(m,{},true);
 assert.deepEqual(bytes(m),before);assert.ok(faces(coarse).every(c=>!c.layers));
 assert.deepEqual(faces(fine).map(c=>c.layers.map(l=>l.polys)),faces(medium).map(c=>c.layers.map(l=>l.polys)));
 assert.ok(faces(fine).some(c=>c.layers.some(l=>l.hatch.length)));assert.ok(faces(medium).every(c=>c.layers.every(l=>!l.hatch.length)));
 assert.ok(e.lines.length>0);const wallKeys=readWalls(m.w()).map(w=>w.id);assert.ok(!e.lines.some(l=>wallKeys.includes(l[4])&&Math.abs(l[2]-l[0])>.005&&Math.abs(l[3]-l[1])>.005),'no spurious wall-face triangulation diagonals');assert.ok(e.cuts.every(c=>!c.layers));
 const head=e.lines.filter(l=>Math.abs(l[1]-2200)<.005&&Math.abs(l[3]-2200)<.005);assert.ok(head.length,'visible window head');
});
test('far clipping intersects straddling triangles rather than retaining geometry beyond depth',()=>{
 const tris=Float64Array.from([0,0,0, 1000,1000,0, 0,1000,1000]);
 const v=projectView([{key:1,cls:'IfcWall',tris}],{dir:[0,1],cut:{o:[0,0]},far:500});
 near(v.bounds.x1,500);for(const l of v.lines)assert.ok(Math.max(l[0],l[2])<=500.005);
});
test('crop clips cut bands and zero membrane lines, without changing authored dimensions',async()=>{
 const m=await model(),v=await view(m,{box:{x0:-100,y0:700,x1:90,y1:2400}}),c=faces(v)[0];
 assert.deepEqual(ys(c),[[700,850],[2200,2400]]);for(const p of c.layers.flatMap(l=>l.polys))for(const [x,y]of p)assert.ok(x>=-100&&x<=90&&y>=700&&y<=2400);
 near(c.layers[1].thickness,25.4);assert.ok(c.boundaries.flatMap(b=>b.paths).flat().every(p=>p[1]>=700&&p[1]<=2400));
});
test('height assembly and window edits regenerate cuts, projected elevation and composed sheets, with undo/redo',async()=>{
 let m=await model();const isolated=await model(),initial=await view(m),before=sx(m),wall=before.walls[0],window=before.openings.find(o=>o.kind==='window');
 m.change(changeWall(wall.guid,{height:3150}));near(Math.max(...faces(await view(m))[0].loops.flat().map(p=>p[1])),3150);
 m.ed.undo();assert.deepEqual(await view(m),initial);m.ed.redo();
 const type=readAssemblies(m.w())[0],anchor=locationLine(readWalls(m.w())[0]);m.change(saveWallAssembly({...type,layers:type.layers.map((l,i)=>i===0?{...l,t:25.4}:l)}));
 near(faces(await view(m))[0].layers[0].thickness,25.4);const held=locationLine(readWalls(m.w())[0]);for(const k of ["a","b"])for(let j=0;j<2;j++)near(held[k][j],anchor[k][j]);
 m.change(changeOpening(window.guid,{width:1600,height:1250,sill:950}));
 const revised=await view(m),elev=await view(m,{},true);assert.deepEqual(ys(faces(revised)[0]),[[0,950],[2200,3150]]);
 assert.ok(elev.lines.some(l=>Math.abs(l[1]-950)<.005&&Math.abs(l[3]-950)<.005));
 const beforeSheet=sheet(initial,await view(isolated,{},true)),afterSheet=sheet(revised,elev);assert.notDeepEqual(beforeSheet.items,afterSheet.items);
 fs.writeFileSync(out+'/edited.ifc',m.ed.save());fs.writeFileSync(out+'/edited-sheet.pdf',setPdf([afterSheet],{paper:'a3'}));
 const after=sx(m),saved=m.ed.save();m=await model(saved);assert.deepEqual(sx(m),after);assert.deepEqual(await view(m),revised);assert.deepEqual(sx(isolated),before);
});
test('material/default edits change cut graphics only, preserving widths cores anchors and model IDs',async()=>{
 let m=await model();const before=sx(m),initial=await view(m),mat=before.materials.find(x=>x.id==='material-studs');
 m.change(op(w=>saveMaterial(w,{...mat,color:'#174f92',fill:'crosshatch',fillColor:'#9f1122',defaultThickness:333})));
 const next=await view(m);assert.notDeepEqual(next,initial);assert.deepEqual(readWalls(m.w()),before.walls);assert.deepEqual(readOpenings(m.w()),before.openings);
 m.ed.undo();assert.deepEqual(await view(m),initial);m.ed.redo();m=await model(m.ed.save());assert.deepEqual(await view(m),next);
 fs.writeFileSync(out+'/styled.ifc',m.ed.save());
});
test('view settings depth and references persist through actual serialization, undo/redo and isolated projects',async()=>{
 let m=await model();const isolated=await model(),sl=readSectionLines(m.w())[0],key='section:'+sl.guid,old=readProjectedView(m.w(),key);
 m.change(setProjectedView(key,{detail:'medium',scale:25,crop:[-2000,700,200,2500]}));
 m.ed.undo();assert.deepEqual(readProjectedView(m.w(),key),old);m.ed.redo();
 m.change(changeSectionLine(sl.guid,{depth:1000}));m=await model(m.ed.save());assert.equal(readSectionLines(m.w())[0].depth,1000);assert.equal(readProjectedView(m.w(),key).detail,'medium');assert.deepEqual(readProjectedView(isolated.w(),key),old);
 assert.equal(readSheets(m.w())[0].views[0].ref,sl.guid);
});
test('missing settings are read-only defaults; invalid versions values and duplicate properties refuse atomic writes',async()=>{
 const m=await model(),key='elevation:west',initial=bytes(m);assert.equal(readProjectedView(m.w(),key).detail,'coarse');assert.deepEqual(bytes(m),initial);
 for(const ch of [{detail:'future'},{scale:NaN},{crop:[0,0,0,10]},{crop:[0,0,'10',10]},{version:99}]){assert.throws(()=>m.change(setProjectedView(key,ch)));assert.deepEqual(bytes(m),initial);}
 for(const raw of ['{}','null','{bad',JSON.stringify({version:99,detail:'fine',scale:20,crop:null})]){
  m.change(op(w=>{w.upsertPset(ids(w.api,w.mid,'IFCPROJECT')[0],PROJECTED_PSET,[[key,'IFCTEXT',raw]]);return [];}));
  const before=bytes(m);assert.ok(readProjectedView(m.w(),key).issue);assert.throws(()=>m.change(setProjectedView(key,{detail:'fine'})));assert.deepEqual(bytes(m),before);m.ed.undo();
 }
 assert.throws(()=>m.change(setProjectedView('section:0F05000000000000000999',{detail:'fine'})),/missing/i);
});
test('unsupported cuts and unavailable layers retain diagnosed envelope fallback without fabricated widths',async()=>{
 const m=await model(),w=m.w(),data=sectionModel(w,readLevels(w)[0].id),v=await view(m);
 const noMat=wallSectionGraphics(v,data.walls,data.openings,null,{dir:[1,0],cut:{o:[3200,0]},detail:'fine'});
 assert.ok(faces(noMat).every(c=>!c.layers));assert.ok(noMat.warnings.some(x=>x.reason==='unavailable-layers'));
 const oblique=await view(m,{dir:[Math.SQRT1_2,Math.SQRT1_2],box:null});assert.ok(oblique.warnings.some(x=>x.reason==='unsupported-cut'));assert.ok(oblique.cuts.every(c=>!c.layers));
 assert.throws(()=>projectView([],{dir:[0,0]}));assert.throws(()=>projectView([],{dir:[1,0],far:NaN}));
});
test('screen SVG and vector PDFs use shared exact cut primitives at normal and enlarged scales',async()=>{
 const m=await model(),v=await view(m),e=await view(m,{},true);
 const sh=sheet(v,e);fs.writeFileSync(out+'/normal.pdf',setPdf([sh],{paper:'a3'}));fs.writeFileSync(out+'/normal.svg',sheetSvg(sh,{paper:'a3'}));
 const enlarged=await view(m,{box:{x0:-150,y0:400,x1:150,y1:1400},scale:5});
 const detail=sheet(enlarged,{bounds:null},5);fs.writeFileSync(out+'/detail.pdf',setPdf([detail],{paper:'a3'}));fs.writeFileSync(out+'/detail.svg',sheetSvg(detail,{paper:'a3'}));
 assert.ok(sh.items.some(x=>x.color==='#a31b54'&&x.dash));assert.ok(sh.items.some(x=>x.t==='fill'&&x.color));
 const primitives=viewItems(v,p=>p,1/20);assert.ok(primitives.some(x=>x.t==='line'&&x.w===.45));assert.ok(primitives.some(x=>x.t==='line'&&x.w===.18));
 assert.ok(!new TextDecoder().decode(setPdf([sh],{paper:'a3'})).includes('/Subtype /Image'));
 fs.writeFileSync(out+'/scene.json',JSON.stringify(v));
});

test('duplicate settings containers/properties preserve unsupported records and refuse scoped writes',async()=>{
 for(const duplicateSet of [false,true]){
  const m=await model(),key='elevation:south';
  m.change(op(w=>{
   const project=ids(w.api,w.mid,'IFCPROJECT')[0];
   if(duplicateSet)w.relateDef(project,w.pset(PROJECTED_PSET,[[key,'IFCTEXT','{"version":99}']]));
   else {const d=w.defs(project).map(d=>w.api.GetLine(w.mid,d.def,false)).find(p=>p.Name.value===PROJECTED_PSET),t=w.touch(d.expressID);t.HasProperties.push(t.HasProperties[0]);w.write(t);}
   return [];
  }));
  const before=bytes(m);assert.ok(readProjectedView(m.w(),key).issue);assert.throws(()=>m.change(setProjectedView(key,{detail:'medium'})));assert.deepEqual(bytes(m),before);
  const re=await model(m.ed.save());assert.ok(readProjectedView(re.w(),key).issue);
 }
});
test('IFC2X3 settings and authored cavity/membrane cuts survive actual save/reopen',async()=>{
 let m=await model(fs.readFileSync(new URL('../../../detailcraft-test/fixtures/ios-steel-ifc2x3.ifc',import.meta.url)));
 // The inherited steel seed has an Axis without RefDirection (IFC2X3 WR5).
 // Build a valid F05 input by explicitly completing that fixture placement only.
 m.change(op(w=>{const a=w.touch(135);assert.equal(a.RefDirection,null);a.RefDirection=w.H(w.dir(1,0,0));w.write(a);return [];}));
 assert.equal(m.w().v4,false);const lv=readLevels(m.w())[0];
 const recipe=readAssemblies((await model()).w())[0];m.change(saveWallAssembly({...recipe,guid:undefined}));
 const {drawWalls}=await import('../../../../public_html/assets/apps/bimcraft/dev/model-ops.js');m.change(drawWalls({storey:lv.guid,typeKey:recipe.key,height:3000,segs:[{a:[0,0],b:[6000,0]}]}));
 const {placeSectionLine}=await import('../../../../public_html/assets/apps/bimcraft/dev/res-sheets.js');m.change(placeSectionLine({level:lv.guid,a:[3200,-500],b:[3200,500],look:'right',name:'A'}));
 const key='section:'+readSectionLines(m.w())[0].guid;m.change(setProjectedView(key,{detail:'fine',scale:20}));
 const before=await view(m);m=await model(m.ed.save());assert.equal(readProjectedView(m.w(),key).detail,'fine');assert.deepEqual(await view(m),before);
 const layers=faces(before)[0].layers;assert.ok(layers.some(l=>l.thickness===0&&!l.polys.length));assert.ok(layers.some(l=>l.kind==='cavity'&&l.fill==='none'));
 fs.writeFileSync(out+'/ifc2x3.ifc',m.ed.save());
});
test('enlarged crop stays composed on paper and does not invent a ground line at its lower edge',async()=>{
 const m=await model(),v=await view(m,{box:{x0:-150,y0:400,x1:150,y1:1400},scale:5}),sh=sheet(v,{bounds:null},5);
 assert.ok(!viewItems(v,p=>p,1/5).some(i=>i.t==='line'&&i.w===.6));
 for(const i of sh.items.filter(i=>i.t==='text'))assert.ok(i.y>10&&i.y<287,'text off paper: '+i.s);
 assert.ok(sh.views.every(v=>v.box[0]>=10&&v.box[1]>=28&&v.box[2]<=410&&v.box[3]<=287));
});
test('stacked levels retain storey-relative opening heights and independent cut layers',async()=>{
 const m=await model(),{addLevel}=await import('../../../../public_html/assets/apps/bimcraft/dev/model-levels.js'),{drawWalls,placeOpening}=await import('../../../../public_html/assets/apps/bimcraft/dev/model-ops.js');
 m.change(op(w=>addLevel(w,{name:'Upper',elevation:3300,height:3000})));
 const lv=readLevels(m.w())[1];m.change(drawWalls({storey:lv.guid,typeKey:'wall-f05-exterior',height:2800,segs:[{a:[0,0],b:[6000,0]}]}));
 const wall=readWalls(m.w()).at(-1);m.change(placeOpening({wall:wall.guid,typeKey:'win-fixed',offset:2700,width:1400,sill:900,height:1000}));
 const v=await view(m,{box:null}),c=faces(v).find(c=>c.guid===wall.guid);
 assert.deepEqual(v.warnings,[]);assert.ok(c.layers);assert.deepEqual(ys(c),[[3300,4200],[5200,6100]]);
});
test('overall elevation note measures the wall envelope without adding thickness along its length',async()=>{
 const {straightElevationWidth}=await import('../../../../public_html/assets/apps/bimcraft/dev/wall-section-graphics.js'),m=await model(),walls=sectionModel(m.w(),readLevels(m.w())[0].id).walls;
 const b=straightElevationWidth(walls,[0,1]);near(b.x1-b.x0,6000);
 const e=straightElevationWidth(walls,[1,0]);near(e.x1-e.x0,1982.5625);
});
