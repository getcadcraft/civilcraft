#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** griddims-test.mjs — 0.10.1 (support #1509): a grid line's spacing typed as a number (model-grids.js gridSpacing / gridSpacingMove) and a
 * dimension between two parallel walls measured square to them whatever Direction says (wall-dimensions.js squareDimension).
 *   node tools/bimcraft-test/griddims-test.mjs */
import assert from 'node:assert/strict';
const D = new URL('../../public_html/assets/apps/bimcraft/dev/', import.meta.url).href;
const { gridSpacing, gridSpacingMove, gridLayout, gridDims } = await import(D+'model-grids.js');
const { squareDimension, resolveDimension } = await import(D+'wall-dimensions.js');
const { dimensionMove } = await import(D+'walls/modify.js');
let n=0; const ok=(c,m)=>{assert.ok(c,m);n++;};
// grid: 4 numbered (vertical lines spaced along X), 3 lettered (horizontal, spaced along Y)
const ax=gridLayout({origin:[0,0],angle:0,u:{count:4,spacing:6000,first:'1'},v:{count:3,spacing:5000,first:'A'},extend:1500});
for (const [tag,from,gap] of [['2','1',6000],['1','2',6000],['4','3',6000],['B','A',5000],['A','B',5000],['C','B',5000]]) {
  const g=gridSpacing(ax,tag); ok(g&&g.from===from&&Math.abs(g.gap-gap)<1e-6, tag+' from '+g?.from+' '+g?.gap);
}
// typing 4500 for 2 (numbered) and 3200 for B (lettered): both directions
for (const [tag,v] of [['2',4500],['B',3200],['1',7000],['C',2500]]) {
  const to=gridSpacingMove(ax,tag,v); ok(to,'move '+tag);
  const ax2=ax.map(x=>x.tag===tag?{...x,...to}:x), g=gridSpacing(ax2,tag);
  ok(Math.abs(g.gap-v)<1e-6, tag+' → '+g.gap);
  const me=ax.find(x=>x.tag===tag); const d=[to.a[0]-me.a[0],to.a[1]-me.a[1]], e=[me.b[0]-me.a[0],me.b[1]-me.a[1]];
  ok(Math.abs(d[0]*e[0]+d[1]*e[1])<1e-6,'square move');
  ok(gridDims(ax2,String).some(q=>Math.abs(Number(q.text)-v)<1e-6),'grid dimension row shows '+v);
}
// turned grid (30°)
const axr=gridLayout({origin:[100,200],angle:30,u:{count:3,spacing:4000,first:'1'},v:{count:2,spacing:3000,first:'A'},extend:1000});
{ const to=gridSpacingMove(axr,'3',2500), g=gridSpacing(axr.map(x=>x.tag==='3'?{...x,...to}:x),'3'); ok(Math.abs(g.gap-2500)<1e-6&&g.from==='2','turned'); }
{ const to=gridSpacingMove(axr,'B',1234), g=gridSpacing(axr.map(x=>x.tag==='B'?{...x,...to}:x),'B'); ok(Math.abs(g.gap-1234)<1e-6,'turned lettered'); }
ok(gridSpacing([ax[0]],'1')===null,'alone'); ok(gridSpacingMove(ax,'2',0)===null,'zero'); ok(gridSpacingMove(ax,'zz',10)===null,'missing');
// dimensions between walls
const W=(guid,a,b)=>({guid,a,b,t:200,storey:1,extSide:1,bulge:0});
const H1=W('h1',[0,0],[8000,0]), H2=W('h2',[0,4000],[8000,4000]), V1=W('v1',[0,0],[0,4000]), V2=W('v2',[8000,0],[8000,4000]);
const walls=[H1,H2,V1,V2], R=(wall,station)=>({wall,reference:'center',station});
// the reported case: Horizontal between two walls running left-right
{ const refs=[R('h1',0.30),R('h2',0.32)];
  const before=resolveDimension({version:1,refs,axis:'x',offset:300,storey:1,view:'plan:x'},walls);
  ok(before.status==='ok'&&Math.abs(before.value-160)<1e-6,'before: measures along the walls ('+before.value+')');
  ok(dimensionMove(before,3000,H2)===null,'before: typed value cannot move the wall');
  const fit=squareDimension(refs,'x',walls); ok(fit.axis==='y','turned to y');
  const r=resolveDimension({version:1,refs:fit.refs,axis:fit.axis,offset:300,storey:1,view:'plan:x'},walls);
  ok(r.status==='ok'&&Math.abs(r.value-4000)<1e-6,'after: spacing 4000');
  ok(Math.abs(Math.abs(dimensionMove(r,3000,H2))-1000)<1e-6,'after: typed 3000 moves 1000'); }
{ const refs=[R('v1',0.5),R('v2',0.5)];
  ok(squareDimension(refs,'x',walls).axis==='x','vertical walls keep x');
  const fit=squareDimension(refs,'y',walls); ok(fit.axis==='x','y → x for walls running up');
  const r=resolveDimension({version:1,refs:fit.refs,axis:fit.axis,offset:300,storey:1,view:'plan:x'},walls); ok(Math.abs(r.value-8000)<1e-6,'8000'); }
{ const refs=[R('h1',0.2),R('h2',0.7)], fit=squareDimension(refs,'aligned',walls);
  ok(fit.axis==='aligned'&&Math.abs(fit.refs[1].station-0.2)<1e-9,'aligned drops square');
  const r=resolveDimension({version:1,refs:fit.refs,axis:'aligned',offset:300,storey:1,view:'plan:x'},walls); ok(Math.abs(r.value-4000)<1e-6,'aligned 4000'); }
{ const refs=[R('h1',0.2),R('v2',0.7)]; const fit=squareDimension(refs,'x',walls); ok(fit.axis==='x'&&fit.refs===refs,'not parallel: untouched'); }
{ const S1=W('s1',[0,0],[4000,4000]), S2=W('s2',[2000,0],[6000,4000]); const refs=[R('s1',0.5),R('s2',0.1)];
  ok(squareDimension(refs,'x',[S1,S2]).axis==='x','skew walls: Horizontal is a real choice, kept');
  const fit=squareDimension(refs,'aligned',[S1,S2]); const r=resolveDimension({version:1,refs:fit.refs,axis:'aligned',offset:0,storey:1,view:'plan:x'},[S1,S2]);
  ok(Math.abs(r.value-2000/Math.SQRT2)<1e-6,'skew aligned square '+r.value); }
{ const short=W('k',[7000,4000],[8000,4000]); const refs=[R('h1',0.1),R('k',0.5)]; const fit=squareDimension(refs,'aligned',[H1,short]); ok(fit.refs[1].station===0.5,'foot off the wall: pick kept'); }
console.log('ok',n);
