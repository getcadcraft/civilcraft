/* SPDX-License-Identifier: Apache-2.0 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {model,scene,exterior,generate,fixture} from './fixture.mjs';
import {wallPlanGraphics,wallPlanEdges,layerPrimitives,PLAN_CHORD_ERROR} from '../../../../public_html/assets/apps/bimcraft/dev/wall-plan-graphics.js';
import {readWalls,wallOutlines,locationLine} from '../../../../public_html/assets/apps/bimcraft/dev/model-walls.js';
import {readOpenings} from '../../../../public_html/assets/apps/bimcraft/dev/model-openings.js';
import {readMaterials,saveMaterial} from '../../../../public_html/assets/apps/bimcraft/dev/project-materials.js';
import {readAssemblies} from '../../../../public_html/assets/apps/bimcraft/dev/wall-assemblies.js';
import {readLevels} from '../../../../public_html/assets/apps/bimcraft/dev/model-levels.js';
import {readWallDimensions,resolveDimension} from '../../../../public_html/assets/apps/bimcraft/dev/wall-dimensions.js';
import {op,drawWalls} from '../../../../public_html/assets/apps/bimcraft/dev/model-ops.js';
import {setPlanView,readPlanViews,effectiveView,saveTemplate,readTemplates,deleteTemplate} from '../../../../public_html/assets/apps/bimcraft/dev/views-model.js';
import {planPdf} from '../../../../public_html/assets/apps/bimcraft/dev/model-pdf.js';
import {planSheet,setPdf,sheetSvg,composeSheet} from '../../../../public_html/assets/apps/bimcraft/dev/res-sheets.js';
const output=process.env.F04_EVIDENCE_DIR || '.cc-test/f04';fs.mkdirSync(output,{recursive:true});
const near=(a,b,tol=.005)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b} (error ${Math.abs(a-b)})`);
const bytes=m=>m.w().api.file(m.w().mid).save({timeStamp:'2026-10-21T12:00:00'});
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0)/2);
const geom=m=>({walls:readWalls(m.w()),types:readAssemblies(m.w()),dims:readWallDimensions(m.w()),openings:readOpenings(m.w())});
const draw=m=>scene(m,wallPlanGraphics);
test('fixture is deterministic: two cores, ventilated cavities, membranes, signs, reversed axes, six location lines',async()=>{
 assert.deepEqual(Buffer.from(await generate()),fs.readFileSync(fixture));
 const m=await model(),ws=readWalls(m.w());assert.equal(ws.length,9);assert.equal(readOpenings(m.w()).length,5);
 assert.deepEqual(new Set(ws.map(w=>w.justification)),new Set(['center','coreCenter','coreExterior','coreInterior','exterior','interior']));
 for(const t of readAssemblies(m.w())){assert.ok(t.layers.some(l=>l.core&&l.t>0));assert.ok(t.layers.some(l=>l.kind==='cavity'&&l.ventilation==='ventilated'&&l.t>0));assert.ok(t.layers.some(l=>l.function==='membrane'&&l.t===0));}
});
test('fine straight offsets, layer widths, unfilled cavity, zero membrane and reverse ordering',async()=>{
 const m=await model(),sc=draw(m);for(const index of [0,1]){
 const row=sc.walls[index];assert.deepEqual(row.layers.map(l=>l.thickness),[19.05,25.4,0,12.7,139.7,12.7]);
 let off=104.775*(index===0?1:-1),sign=index===0?1:-1;
 for(const l of row.layers){near(l.from,off);off-=sign*l.thickness;near(l.to,off);for(const p of l.polys)for(const q of p) assert.ok(q.every(Number.isFinite));}
 assert.equal(row.layers[1].fill,'none');assert.deepEqual(row.layers[2].polys,[]);assert.equal(row.boundaries.filter(b=>b.membrane).length,1);near(row.boundaries.find(b=>b.membrane).offset,60.325*sign);
 const polys=row.layers.flatMap(l=>l.polys);near(polys.reduce((s,p)=>s+area(p),0),row.pieces.reduce((s,p)=>s+area(p),0),.005);
 }
});
test('signed curves have exact concentric layer vertices and bounded chord error',async()=>{
 const m=await model(),sc=draw(m),ws=readWalls(m.w());
 for(const i of [2,3]){
  const w=ws[i],row=sc.walls[i],dx=w.b[0]-w.a[0],dy=w.b[1]-w.a[1],chord=Math.hypot(dx,dy),bg=w.bulge,sg=Math.sign(bg);
  const R=chord*(1+bg*bg)/(4*Math.abs(bg)),h=chord*(1-bg*bg)/(4*bg),C=[(w.a[0]+w.b[0])/2-dy/chord*h,(w.a[1]+w.b[1])/2+dx/chord*h];
  let maxChord=0;
  for(const l of row.layers)for(const p of l.polys)for(let j=0;j<p.length;j++){
   const a=p[j],b=p[(j+1)%p.length],r=Math.hypot(a[0]-C[0],a[1]-C[1]);assert.ok(Math.min(Math.abs(r-(R-sg*l.from)),Math.abs(r-(R-sg*l.to)))<.005);
   const rb=Math.hypot(b[0]-C[0],b[1]-C[1]);if(Math.abs(r-rb)<1e-6){const rm=Math.hypot((a[0]+b[0])/2-C[0],(a[1]+b[1])/2-C[1]);maxChord=Math.max(maxChord,r-rm);}
  }
  assert.ok(maxChord<=PLAN_CHORD_ERROR+1e-8);console.log('curve chord error mm',i,maxChord);
 }
});
test('door/window intervals interrupt fills and boundary paths including radial curve cuts; cut height respected',async()=>{
 const m=await model(),sc=draw(m),ws=readWalls(m.w()),ops=readOpenings(m.w());
 for(const o of ops){const i=ws.findIndex(w=>w.id===o.wall),w=ws[i],r=sc.walls[i];const chord=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);
 const station=p=>{if(!w.bulge)return ((p[0]-w.a[0])*(w.b[0]-w.a[0])+(p[1]-w.a[1])*(w.b[1]-w.a[1]))/chord;
 const bg=w.bulge,sg=Math.sign(bg),R=chord*(1+bg*bg)/(4*Math.abs(bg)),h=chord*(1-bg*bg)/(4*bg),C=[(w.a[0]+w.b[0])/2-(w.b[1]-w.a[1])/chord*h,(w.a[1]+w.b[1])/2+(w.b[0]-w.a[0])/chord*h];let d=(Math.atan2(p[1]-C[1],p[0]-C[0])-Math.atan2(w.a[1]-C[1],w.a[0]-C[0]))*sg;while(d<-.1)d+=2*Math.PI;return d*R;};
 for(const points of [...r.layers.flatMap(l=>l.polys),...r.boundaries.flatMap(b=>b.paths)])for(const p of points){const s=station(p);assert.ok(s<=o.offset+.005||s>=o.offset+o.width-.005,`paint in opening ${i}: ${s}`);}
 }
 const outlines=wallOutlines(ws.map(w=>({...w,key:w.guid}))),high=wallPlanGraphics(ws,outlines,ops,readMaterials(m.w()),{detail:'fine',cutZ:2400});assert.equal(high[0].pieces.length,1);assert.equal(high[2].pieces.length,1);
});
test('L and fractional T junction edges are complete without cap seams; fills conserve joined area',async()=>{
 const sc=draw(await model());for(const [a,b]of [[4,5],[6,7]]){
  for(const row of sc.walls.slice(a,b+1))near(row.layers.flatMap(l=>l.polys).reduce((s,p)=>s+area(p),0),row.pieces.reduce((s,p)=>s+area(p),0),.005);
 }
 const T=wallPlanEdges(sc.walls.slice(6,8));const perimeter=T.reduce((s,p)=>s+p.reduce((v,a,i)=>{const b=p[(i+1)%p.length];return v+Math.hypot(a[0]-b[0],a[1]-b[1]);},0)*(p.length===2?.5:1),0);
 near(perimeter,16828.65); // two opening jambs, through wall perimeter, exposed stem, less shared cap
 assert.ok(T.some(p=>p.some(q=>Math.abs(q[1]-9500)<.005)));
 for(const p of T)if(p.length===2){const mid=p[0].map((v,i)=>(v+p[1][i])/2);assert.ok(!(Math.abs(mid[1]-6604.775)<.005&&mid[0]>10922.213&&mid[0]<11077.787),'internal T cap');}
});
test('detail changes are read-only: medium retains exact fine polygons, coarse has envelope only',async()=>{
 const m=await model(),before=bytes(m),fine=draw(m),medium=scene(m,wallPlanGraphics,'medium'),coarse=scene(m,wallPlanGraphics,'coarse');
 assert.deepEqual(bytes(m),before);assert.ok(coarse.walls.every(w=>!w.layers));
 for(let i=0;i<fine.walls.length;i++){assert.deepEqual(fine.walls[i].pieces,medium.walls[i].pieces);assert.deepEqual(fine.walls[i].layers.map(l=>l.polys),medium.walls[i].layers.map(l=>l.polys));assert.ok(medium.walls[i].layers.every(l=>!l.hatch.length));}
 assert.ok(fine.walls.some(w=>w.layers.some(l=>l.hatch.length)));
});
test('material styles/defaults undo, redo, reopen and project isolation preserve geometry and reference dimensions',async()=>{
 let m=await model();const isolated=await model(),before=geom(m),initial=draw(m),mat=readMaterials(m.w()).find(x=>x.id==='material-studs');
 const edit={...mat,color:'#174f92',fill:'crosshatch',fillColor:'#9f1122',defaultThickness:333};
 m.change(op(w=>saveMaterial(w,edit)));assert.deepEqual(geom(m),before);assert.notDeepEqual(draw(m),initial);
 const after=draw(m);m.ed.undo();assert.deepEqual(draw(m),initial);m.ed.redo();assert.deepEqual(draw(m),after);
 m=await model(m.ed.save());assert.deepEqual(draw(m),after);assert.deepEqual(geom(m),before);assert.deepEqual(draw(isolated),initial);
 assert.deepEqual(readWallDimensions(m.w()).map(d=>resolveDimension(d,readWalls(m.w())).value),[209.55,139.7]);
 assert.deepEqual(readWalls(m.w()).map(locationLine),before.walls.map(locationLine));
 fs.writeFileSync(output+'/styled-reopened.ifc',m.ed.save());
 fs.writeFileSync(output+'/styled-plan.pdf',planPdf(after,{paper:'a3',units:'mm',title:'F04 material edit: geometry unchanged'}).bytes);
});
test('view detail, RCP and template persistence, undo/redo and template deletion',async()=>{
 let m=await model(),level=readLevels(m.w())[0],base=geom(m);m.change(setPlanView(level.guid,{detail:'fine'}));assert.equal(readPlanViews(m.w()).get(level.id).detail,'fine');
 m.ed.undo();assert.equal(readPlanViews(m.w()).get(level.id),undefined);m.ed.redo();
 m.change(setPlanView(level.guid,{detail:'medium'},'rcp'));m.change(saveTemplate({name:'F04 fine',cut:1200,top:0,bottom:0,depth:50,detail:'fine'}));m.change(setPlanView(level.guid,{detail:'coarse',template:'F04 fine'}));
 assert.equal(effectiveView(readPlanViews(m.w()).get(level.id),readTemplates(m.w())).detail,'fine');
 m.change(deleteTemplate('F04 fine'));assert.equal(readPlanViews(m.w()).get(level.id).detail,'fine');
 m=await model(m.ed.save());assert.equal(readPlanViews(m.w()).get(level.id).detail,'fine');assert.equal(readPlanViews(m.w(),'rcp').get(level.id).detail,'medium');assert.deepEqual(geom(m),base);assert.equal(readPlanViews((await model()).w()).size,0);
 fs.writeFileSync(output+'/fine-reopened.ifc',m.ed.save());
});
test('unsupported library/assembly cannot fabricate layers; invalid detail rejected atomically',async()=>{
 const m=await model(),ws=readWalls(m.w()),outlines=wallOutlines(ws.map(w=>({...w,key:w.guid}))),before=bytes(m),level=readLevels(m.w())[0];
 assert.ok(wallPlanGraphics(ws,outlines,[],null,{detail:'fine'}).every(w=>w.graphicWarning&&!w.layers));
 const bad=ws.map(w=>({...w,assembly:null}));assert.ok(wallPlanGraphics(bad,outlines,[],readMaterials(m.w()),{detail:'fine'}).every(w=>w.graphicWarning&&!w.layers));
 for(const detail of [null,0,'future',{},false]){assert.throws(()=>m.change(setPlanView(level.guid,{detail})));assert.deepEqual(bytes(m),before);}
});
test('all location lines and exterior sides preserve authored layer widths after placement',async()=>{
 const m=await model(),level=readLevels(m.w())[0];let i=0;
 for(const justification of ['center','exterior','interior','coreCenter','coreExterior','coreInterior'])for(const extSide of ['left','right']){
 const y=20000+(i++)*2000;m.change(drawWalls({storey:level.guid,typeKey:exterior.key,segs:[{a:[0,y],b:[5000,y],justification,extSide}],height:2700}));const w=readWalls(m.w()).at(-1),r=draw(m).walls.at(-1);assert.equal(w.justification,justification);near(r.layers.reduce((s,l)=>s+l.thickness,0),209.55);near(r.layers[0].from,extSide==='left'?104.775:-104.775);
 }
});
test('real vector PDFs, sheet SVG and enlarged views share the scene primitives and scales',async()=>{
 const m=await model(),sc=draw(m);fs.writeFileSync(output+'/fine-plan.pdf',planPdf(sc,{paper:'a3',units:'mm',scale:50,title:'F04 whole plan - fine'}).bytes);
 const detail={...scene(m,wallPlanGraphics,'fine',5),crop:[4300,-650,6000,650]};
 const pdf=planPdf(detail,{paper:'a3',units:'mm',scale:5,title:'F04 detail - 209.55 mm wall / 139.70 mm core'});assert.equal(pdf.scale.ratio,5);fs.writeFileSync(output+'/fine-detail.pdf',pdf.bytes);
 const views=[{ref:'whole',title:'Whole plan',scene:sc},{ref:'detail',title:'Enlarged detail',scene:detail}];
 const sheet=composeSheet({number:'F04',title:'Layered plan and enlarged detail',paper:'a3',views:[{kind:'plan',ref:'whole',x:100,y:160,ratio:100},{kind:'plan',ref:'detail',x:305,y:160,ratio:10}]},{plans:views,elevations:[],sections:[],schedules:[]},{paper:'a3',units:'mm',project:'F04 acceptance',date:'2026-10-21'});
 fs.writeFileSync(output+'/fine-sheet.pdf',setPdf([sheet],{paper:'a3'}));fs.writeFileSync(output+'/fine-sheet.svg',sheetSvg(sheet,{paper:'a3'}));
 assert.ok(sheet.items.some(i=>i.color==='#a31b54'&&i.dash));assert.ok(sheet.items.some(i=>i.t==='fill'&&i.color));
 const pdfText=new TextDecoder().decode(pdf.bytes);assert.ok(pdfText.includes(' rg'));assert.ok(!pdfText.includes('/Subtype /Image'));
 fs.writeFileSync(output+'/fine-scene.json',JSON.stringify(sc));
});
test('outer-face membranes remain exact boundary lines on either side',async()=>{
 const m=await model(),wall=readWalls(m.w())[0],membrane=wall.assembly.layers[2];
 for(const side of ['left','right'])for(const end of ['first','last']){
 const w={...wall,extSide:side,assembly:{...wall.assembly,layers:end==='first'?[membrane,...wall.assembly.layers]:[...wall.assembly.layers,membrane]}};
 const r=wallPlanGraphics([w],wallOutlines([{...w,key:w.guid}]),[],readMaterials(m.w()),{detail:'fine'})[0];
 const off=(side==='left'?1:-1)*(end==='first'?1:-1)*w.t/2,b=r.boundaries.find(b=>Math.abs(b.offset-off)<1e-7);assert.ok(b?.membrane&&b.paths.length);assert.ok(b.paths.flat().every(p=>Math.abs(p[1]-off)<.005));
 }
});
import {PlanView} from '../../../../public_html/assets/apps/bimcraft/dev/model-planview.js';
test('production Canvas painter emits the shared fill polygons and never paints cavity bands',async()=>{
 const sc=draw(await model()),fills=[],strokes=[];let path=[];
 const ctx=new Proxy({beginPath(){path=[];},moveTo(x,y){path.push([x,y]);},lineTo(x,y){path.push([x,y]);},fill(){fills.push({color:this.fillStyle,path:structuredClone(path)});},stroke(){strokes.push({color:this.strokeStyle,path:structuredClone(path)});},measureText(){return {width:12};}}, {get:(o,k)=>k in o?o[k]:()=>{}});
 const pv=Object.create(PlanView.prototype);Object.assign(pv,{ctx,scene:sc,w:1500,h2:1000,cx:7000,cy:4700,scale:.08,dpr:1,hover:null,selection:new Set(),markers:[],colors:()=>({'--sheet':'#fff'})});pv.draw();
 const expected=sc.walls.flatMap(w=>layerPrimitives(w)).filter(i=>i.t==='fill').flatMap(i=>i.polys.map(p=>({color:i.color,path:p.map(q=>{const r=pv.toScreen(q);return[r.x,r.y];})})));
 // Door symbols can paint white masks. Compare only validated material colors.
 const materialColors=new Set(expected.map(x=>x.color));assert.deepEqual(fills.filter(f=>materialColors.has(f.color)),expected);
 assert.ok(strokes.some(s=>s.color==='#a31b54'));
});
