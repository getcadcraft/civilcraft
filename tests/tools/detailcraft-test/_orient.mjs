import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const APP='/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/detailcraft/dev';
const load=(f)=>import(pathToFileURL(path.join(APP,f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP,'lang/en.json'),'utf8')) });
const {Model,starterState}=await load('model.js'); const {build}=await load('build.js');
const m=new Model(starterState('t'));
m.change('x',(tx)=>{ tx.addProfile({name:'T2x4',kind:'FLAT',b:89,t:38});
  tx.addMember({type:'column',profile:'T2x4',material:'timber',position:'middle',rotation:0,start:[0,0,0],end:[0,0,2000]});
  tx.addMember({type:'beam',profile:'T2x4',material:'timber',position:'middle',rotation:0,start:[1000,0,500],end:[3000,0,500]}); });
const b=build(m.state);
for(const p of b.parts){ console.log(p.id,Object.keys(p).join()); break; }
for(const p of b.parts){ console.log(p.id, JSON.stringify(p.frame), p.profile.width, p.profile.depth); }
