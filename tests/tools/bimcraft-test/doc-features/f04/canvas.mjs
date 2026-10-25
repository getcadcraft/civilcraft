/* SPDX-License-Identifier: Apache-2.0 */
// Optional native Canvas evidence. Executes production PlanView.draw() with Skia;
// no browser, observer, UI dialogs, network or screenshot claims.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {model,scene} from './fixture.mjs';
import {wallPlanGraphics} from '../../../../public_html/assets/apps/bimcraft/dev/wall-plan-graphics.js';
import {PlanView} from '../../../../public_html/assets/apps/bimcraft/dev/model-planview.js';
const {createCanvas}=await import(process.argv[2]||'@napi-rs/canvas');
const base='656d46236ff32b444cbd5a2b4ebe5164858c3848';
const source=execFileSync('git',['show',base+':app/model-planview.js'],{encoding:'utf8'}).replace(/from '\.\/([^']+)'/g,(_,p)=>'from '+JSON.stringify(pathToFileURL(path.resolve('app',p)).href));
const BaseView=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).PlanView;
const m=await model(),metrics={};
for(const [name,View,sc]of [['before',BaseView,scene(m)],['after',PlanView,scene(m,wallPlanGraphics)]]){
 const canvas=createCanvas(1600,1100),pv=Object.create(View.prototype);
 Object.assign(pv,{ctx:canvas.getContext('2d'),scene:sc,w:1600,h2:1100,cx:7000,cy:4700,scale:.1,dpr:1,hover:null,selection:new Set(),markers:[],colors:()=>({'--sheet':'#fff'})});
 const times=[];for(let i=0;i<35;i++){const start=performance.now();pv.draw();if(i>=5)times.push(performance.now()-start);}times.sort((a,b)=>a-b);metrics[name]={n:30,p50Ms:times[15],p95Ms:times[28]};
 fs.writeFileSync('evidence/f04/native-canvas-'+name+'.png',canvas.toBuffer('image/png'));
 if(name==='after'){pv.cx=5150;pv.cy=0;pv.scale=.8;pv.draw();fs.writeFileSync('evidence/f04/native-canvas-detail.png',canvas.toBuffer('image/png'));}
}
fs.writeFileSync('evidence/f04/native-canvas-measure.json',JSON.stringify({backend:'@napi-rs/canvas (Skia), Node; not browser frame timing',approvedBase:base,width:1600,height:1100,warmup:5,metrics},null,2)+'\n');console.log(metrics);
