/* SPDX-License-Identifier: Apache-2.0 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cases,directory,recipe,model} from './fixtures.mjs';
import {readWalls,locationLine} from '../../../../public_html/assets/apps/bimcraft/dev/model-walls.js';
import {readLevels} from '../../../../public_html/assets/apps/bimcraft/dev/model-levels.js';
import {readAssemblies,readAssemblyRecords,validateAssembly,ASSEMBLY_PSET} from '../../../../public_html/assets/apps/bimcraft/dev/wall-assemblies.js';
import {readMaterials,saveMaterial,MATERIAL_PSET,writeMaterials} from '../../../../public_html/assets/apps/bimcraft/dev/project-materials.js';
import {saveWallAssembly,changeWall,removeElements,drawWalls,op} from '../../../../public_html/assets/apps/bimcraft/dev/model-ops.js';
import {readWallDimensions,resolveDimension,saveWallDimension,referencePoint,DIMENSION_PSET,WALL_REFERENCES} from '../../../../public_html/assets/apps/bimcraft/dev/wall-dimensions.js';
import {ids} from '../../../../public_html/assets/apps/bimcraft/dev/ifc-util.js';
const read=c=>model(fs.readFileSync(new URL(c.name+'.ifc',directory)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<0.005,`${a} differs from ${b} by ${Math.abs(a-b)} mm`);
// SaveModel renews FILE_NAME time on every call. Freeze only that header timestamp
// for rollback comparisons; every data record and all other header fields remain compared.
const snapshotBytes=m=>{const w=m.w();return w.api.file(w.mid).save({timeStamp:'2026-10-21T12:00:00'});};
const resolved=m=>readWallDimensions(m.w()).map(d=>resolveDimension(d,readWalls(m.w())));
const identity=m=>({walls:readWalls(m.w()).map(w=>w.guid),types:readAssemblies(m.w()).map(w=>w.guid),dims:readWallDimensions(m.w()).map(d=>[d.guid,d.refs]),materials:readMaterials(m.w()).map(m=>m.id)});
// Independent analytic expectation for horizontal chords: no app geometry helper.
function point(c,i,reference,station,delta=0) {
 const x=c.origin[0],y=c.origin[1]+i*10000,bulge=[0,.25,-.25][i];
 const total=recipe.layers.reduce((s,l)=>s+l.t,0),outer=recipe.layers[0].t+25.4;
 let off={exterior:total/2,interior:-total/2,center:0,coreExterior:total/2-outer,coreInterior:total/2-outer-139.7,coreCenter:total/2-outer-139.7/2}[reference];
 off+=reference==='exterior'?delta:reference==='center'?delta/2:0;
 if(!bulge)return [x+5000*station,y+off];
 const theta=4*Math.atan(bulge),R=5000*(1+bulge*bulge)/(4*Math.abs(bulge)),cy=y+5000*(1-bulge*bulge)/(4*bulge),cx=x+2500;
 const a=Math.atan2(y-cy,x-cx)+theta*station,rad=R-Math.sign(bulge)*off;
 return [cx+rad*Math.cos(a),cy+rad*Math.sin(a)];
}
fs.mkdirSync('.cc-test/f02',{recursive:true});
for(const c of cases)test(c.name+': ten edit/undo/redo/save/reopen cycles',async()=>{
 let m=await read(c);assert.equal(m.w().unitMm,c.unitMm);
 const ids=identity(m),isolated=await read(c);let maxGeometry=0,maxDimension=0,maxAnchor=0;
 const check=delta=>{
  const walls=readWalls(m.w());assert.equal(walls.length,3);assert.equal(readWallDimensions(m.w()).length,18);
  for(const [i,w]of walls.entries()) {
   near(w.t,recipe.layers.reduce((s,l)=>s+l.t,0)+delta);
   for(const ref of WALL_REFERENCES)for(const station of [0,.123456,.876544,1]) {
    const p=referencePoint({wall:w.guid,reference:ref,station},walls),expected=point(c,i,ref,station,delta);
    const err=Math.hypot(p[0]-expected[0],p[1]-expected[1]);maxGeometry=Math.max(maxGeometry,err);near(err,0);
    if(ref==='coreCenter')maxAnchor=Math.max(maxAnchor,err);
   }
  }
  for(const d of resolved(m)) {
   assert.equal(d.status,'ok');const i=walls.findIndex(w=>w.guid===d.refs[0].wall);
   const pts=d.refs.map(r=>point(c,i,r.reference,r.station,delta)),expected=Math.hypot(pts[1][0]-pts[0][0],pts[1][1]-pts[0][1]);
   maxDimension=Math.max(maxDimension,Math.abs(d.value-expected));near(d.value,expected);
  }
  assert.deepEqual(identity(m),ids);
  for(const [i,wall] of walls.entries()) if(i) {
   const w=m.w(),product=w.api.GetLine(w.mid,wall.id,false),shape=w.api.GetLine(w.mid,product.Representation.value,false);
   const axis=shape.Representations.map(h=>w.api.GetLine(w.mid,h.value,false)).find(r=>r.RepresentationIdentifier.value==='Axis');
   const trim=w.api.GetLine(w.mid,axis.Items[0].value,false),circle=w.api.GetLine(w.mid,trim.BasisCurve.value,false);
   near(circle.Radius.value*w.unitMm,5312.5-(i===1?1:-1)*delta/2);
  }
  const layers=readAssemblies(m.w())[0].layers;assert.equal(layers[1].t,25.4);assert.equal(layers[1].ventilation,'ventilated');assert.equal(layers[2].t,0);
 };
 check(0);
 for(let cycle=0;cycle<10;cycle++) {
  const delta=(cycle+1)*.012345;
  m.change(saveWallAssembly({...recipe,layers:recipe.layers.map((l,i)=>i===0?{...l,t:l.t+delta}:l)}));check(delta);
  m.ed.undo();check(cycle*.012345);m.ed.redo();check(delta);
  const mat=readMaterials(m.w()).find(m=>m.id==='material-siding');m.change(op(w=>saveMaterial(w,{...mat,defaultThickness:200+cycle})));check(delta);
  m=await model(m.ed.save());check(delta);
 }
 assert.equal(readAssemblies(isolated.w())[0].layers[0].t,recipe.layers[0].t);
 fs.writeFileSync('.cc-test/f02/'+c.name+'.ifc',m.ed.save());
 const report={case:c.name,cycles:10,maxGeometryMm:maxGeometry,maxDimensionMm:maxDimension,maxCoreAnchorMm:maxAnchor};
 fs.writeFileSync('.cc-test/f02/'+c.name+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
});
test('dimension editing/rebind preserves exactly one annotation through undo/redo/reopen',async()=>{
 let m=await read(cases[0]),d=readWallDimensions(m.w())[0],level=readLevels(m.w())[0];
 m.change(saveWallDimension({...d,level:level.guid,offset:123.456}));
 assert.equal(readWallDimensions(m.w()).length,18);assert.equal(readWallDimensions(m.w()).find(x=>x.guid===d.guid).offset,123.456);
 m.ed.undo();assert.equal(readWallDimensions(m.w()).length,18);m.ed.redo();
 m=await model(m.ed.save());assert.equal(readWallDimensions(m.w()).filter(x=>x.guid===d.guid).length,1);
 const wall=readWalls(m.w())[0];m.change(removeElements({walls:[wall.guid]}));
 assert.equal(resolved(m)[0].status,'missing');assert.equal(resolved(m)[0].value,undefined);
 assert.equal(m.w().api.GetLine(m.w().mid,readWallDimensions(m.w())[0].id,false).Representation,null);
 m.change(drawWalls({storey:level.guid,typeKey:recipe.key,segs:[{a:wall.a,b:wall.b}],height:2700}));
 assert.equal(resolved(m)[0].status,'missing');const replacement=readWalls(m.w()).at(-1);
 m.change(saveWallDimension({...d,level:level.guid,refs:d.refs.map(r=>({...r,wall:replacement.guid}))}));
 assert.equal(resolved(m)[0].status,'ok');assert.equal(readWallDimensions(m.w()).length,18);
 m.ed.undo();assert.equal(resolved(m)[0].status,'missing');m.ed.redo();assert.equal(resolved(m)[0].status,'ok');
});
test('invalid, duplicate, missing and coincident references never retain a numeric value',()=>{
 const wall={guid:'wall',storey:1,a:[0,0],b:[5000,0],t:100,extSide:'left'};
 const d={axis:'aligned',offset:0,storey:1,refs:[{wall:'wall',reference:'center',station:0},{wall:'wall',reference:'center',station:.0000004}]};
 near(resolveDimension(d,[wall]).value,.002);
 for(const bad of [{...d,refs:d.refs.map(r=>({...r,station:0}))},{...d,axis:'bad'},{...d,refs:[null,null]},{...d,offset:NaN},{...d,version:99}])assert.equal(resolveDimension({...bad,value:123,a:[0,0],b:[123,0]},[wall]).value,undefined);
 for(const walls of [[],[wall,wall],[{...wall,a:[NaN,0]}],[{...wall,b:[0,0]}],[{...wall,referenceIssue:'unsupported'}]])assert.equal(resolveDimension({...d,value:123},walls).value,undefined);
});
function setSpec(m,raw){const d=readWallDimensions(m.w())[0];m.w().run(w=>w.upsertPset(d.id,DIMENSION_PSET,[['Spec','IFCTEXT',raw]]));return d;}
function setRecipe(m,raw){const r=readAssemblyRecords(m.w())[0],w=m.w(),ps=w.api.GetLine(w.mid,r.psetId,false);w.run(w=>{const p=ps.HasProperties.map(h=>w.api.GetLine(w.mid,h.value,false)).find(p=>p.Name.value==='Recipe');const q=w.touch(p.expressID);q.NominalValue=w.T('IFCTEXT',raw);w.write(q);});}
for(const kind of ['assembly','dimension','materials'])test(kind+': unsupported/corrupt versions preserved and edits refused atomically',async()=>{
 for(const version of [99,null,'1',1.5,'absent','bad-json']) {
  const m=await read(cases[0]);let raw;
  const record=kind==='assembly'?readAssemblies(m.w())[0]:kind==='dimension'?readWallDimensions(m.w())[0]:{version:1,materials:readMaterials(m.w())};
  if(version==='absent')delete record.version;else record.version=version;
  raw=version==='bad-json'?'{broken':JSON.stringify(record);
  if(kind==='assembly')setRecipe(m,raw);else if(kind==='dimension')setSpec(m,raw);else {const w=m.w();w.run(w=>w.upsertPset(w.api.GetLineIDsWithType(w.mid,w.W.IFCPROJECT).get(0),MATERIAL_PSET,[['Library','IFCTEXT',raw]]));}
  const before=snapshotBytes(m),legacy=version==='absent' && kind!=='materials';
  if(legacy) {assert.doesNotThrow(()=>kind==='assembly'?readAssemblies(m.w()):readWallDimensions(m.w()));continue;}
  if(kind==='assembly')assert.ok(readAssemblyRecords(m.w())[0].issue);
  if(kind==='dimension')assert.notEqual(resolved(m)[0].status,'ok');
  const wall=readWalls(m.w())[0];
  assert.throws(()=>m.change(changeWall(wall.guid,{height:2800})),/preserved/);
  assert.deepEqual(snapshotBytes(m),before);
  if(kind==='materials')assert.throws(()=>m.w().run(w=>writeMaterials(w,record.materials)),/preserved/);
  if(kind==='dimension')assert.throws(()=>m.change(saveWallDimension({...readWallDimensions(m.w())[1],guid:record.guid,level:readLevels(m.w())[0].guid})),/preserved/);
  assert.deepEqual(snapshotBytes(await model(m.ed.save())),before);
 }
});
test('legacy migration only on explicit save, reversible through journal',async()=>{
 const m=await read(cases[0]);const r={...recipe};delete r.version;setRecipe(m,JSON.stringify(r));
 const d=readWallDimensions(m.w())[0];delete d.version;setSpec(m,JSON.stringify(d));
 const before=snapshotBytes(m);readAssemblies(m.w());readWallDimensions(m.w());assert.deepEqual(snapshotBytes(m),before);
 m.change(saveWallAssembly(recipe));assert.equal(JSON.parse(readAssemblyRecords(m.w())[0].raw).version,1);m.ed.undo();assert.deepEqual(snapshotBytes(m),before);m.ed.redo();
 const old=snapshotBytes(m);m.change(saveWallDimension({...d,level:readLevels(m.w())[0].guid}));assert.equal(JSON.parse(readWallDimensions(m.w())[0].raw).version,1);m.ed.undo();assert.deepEqual(snapshotBytes(m),old);
});
test('nonfinite wall edits fail without changing any geometry or history',async()=>{
 const m=await read(cases[0]),wall=readWalls(m.w())[0],before=snapshotBytes(m);
 for(const change of [{a:[NaN,0]},{b:[Infinity,1]},{height:NaN},{bulge:Infinity},{baseOffset:NaN}]) {
  assert.throws(()=>m.change(changeWall(wall.guid,change)),/finite/);assert.deepEqual(snapshotBytes(m),before);
 }
 assert.equal(m.ed.changes.length,0);
});
for(const kind of ['assembly','dimension','materials'])test(kind+': missing or ambiguous payloads are refused without rewriting',async()=>{
 for(const damage of ['missing-property','duplicate-property','duplicate-set']) {
  const m=await read(cases[0]),w=m.w(),d=readWallDimensions(w)[0],a=readAssemblyRecords(w)[0];
  const project=ids(w.api,w.mid,'IFCPROJECT')[0];
  const [owner,name,field]=kind==='assembly'?[a.id,ASSEMBLY_PSET,'Recipe']:kind==='dimension'?[d.id,DIMENSION_PSET,'Spec']:[project,MATERIAL_PSET,'Library'];
  const pset=kind==='assembly'?a.psetId:w.defNamed(owner,name).def;
  w.run(w=>{
   const ps=w.touch(pset),property=ps.HasProperties.find(h=>w.api.GetLine(w.mid,h.value,false).Name.value===field);
   if(damage==='missing-property')ps.HasProperties=ps.HasProperties.filter(h=>h.value!==property.value);
   // Put the unsupported value first: the old last-property-wins reader hid it.
   if(damage==='duplicate-property')ps.HasProperties.unshift(...w.propLines([[field,'IFCTEXT','{"version":99}']]));
   w.write(ps);
   if(damage==='duplicate-set') {
    const extra=w.pset(name,[[field,'IFCTEXT','{"version":99}']]);
    if(kind==='assembly'){const type=w.touch(owner);type.HasPropertySets.push(w.H(extra));w.write(type);}
    else w.relateDef(owner,extra);
   }
  });
  const before=snapshotBytes(m);
  if(kind==='materials')assert.throws(()=>readMaterials(m.w()),/preserved/);
  if(kind==='assembly'){assert.ok(readAssemblyRecords(m.w()).some(a=>a.issue));assert.equal(resolved(m)[0].value,undefined);}
  if(kind==='dimension'){assert.equal(readWallDimensions(m.w()).length,18);assert.equal(resolved(m)[0].value,undefined);}
  assert.throws(()=>m.change(changeWall(readWalls(m.w())[0].guid,{height:2800})),/preserved/);
  assert.deepEqual(snapshotBytes(m),before);assert.deepEqual(snapshotBytes(await model(m.ed.save())),before);
 }
});
test('a dimension with its whole property set missing still suppresses stale geometry',async()=>{
 const m=await read(cases[0]),w=m.w(),d=readWallDimensions(w)[0],def=w.defNamed(d.id,DIMENSION_PSET);
 w.run(w=>{const rel=w.touch(def.rel);rel.RelatedObjects=rel.RelatedObjects.filter(h=>h.value!==d.id);w.write(rel);});
 assert.equal(readWallDimensions(m.w()).length,18);assert.equal(resolved(m)[0].value,undefined);
 const before=snapshotBytes(m);assert.throws(()=>m.change(changeWall(readWalls(m.w())[0].guid,{height:2800})),/preserved/);assert.deepEqual(snapshotBytes(m),before);
});
test('invalid thickness values cannot silently become zero membranes or material defaults',async()=>{
 for(const value of [null,false,true,'',[],[1],'12.7']) {
  const m=await read(cases[0]),before=snapshotBytes(m),material=readMaterials(m.w())[0];
  assert.throws(()=>m.change(op(w=>saveMaterial(w,{...material,defaultThickness:value}))));
  assert.throws(()=>validateAssembly({...recipe,layers:recipe.layers.map((l,i)=>i===2?{...l,t:value}:l)}));
  assert.deepEqual(snapshotBytes(m),before);
  const bad=structuredClone(recipe);bad.layers[2].t=value;setRecipe(m,JSON.stringify(bad));
  assert.ok(readAssemblyRecords(m.w())[0].issue);assert.equal(resolved(m)[0].value,undefined);
  const library=await read(cases[0]),materials=readMaterials(library.w());materials[0].defaultThickness=value;
  library.w().run(w=>w.upsertPset(ids(w.api,w.mid,'IFCPROJECT')[0],MATERIAL_PSET,[['Library','IFCTEXT',JSON.stringify({version:1,materials})]]));
  const saved=snapshotBytes(library);assert.throws(()=>readMaterials(library.w()),/preserved/);
  assert.throws(()=>library.change(op(w=>saveMaterial(w,material))),/preserved/);assert.deepEqual(snapshotBytes(library),saved);
 }
});
