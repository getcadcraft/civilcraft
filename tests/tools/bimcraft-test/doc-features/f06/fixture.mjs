/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {model as open} from '../f04/fixture.mjs';
import {newBuilding,stackLevels} from '../../../../public_html/assets/apps/bimcraft/dev/new-model.js';
import {readLevels} from '../../../../public_html/assets/apps/bimcraft/dev/model-levels.js';
import {drawWalls,saveWallAssembly,op} from '../../../../public_html/assets/apps/bimcraft/dev/model-ops.js';
import {writeMaterials,readMaterials} from '../../../../public_html/assets/apps/bimcraft/dev/project-materials.js';
import {saveSheet} from '../../../../public_html/assets/apps/bimcraft/dev/views-model.js';
export const fixture=new URL('../../../../fixtures/f06/assembly-documentation.ifc',import.meta.url);
export const model=(bytes=fs.readFileSync(fixture))=>open(bytes);
export const name='Same finish, "reviewed"\nBoard - café';
export const exterior={key:'wall-f06-exterior',name:'Exterior ventilated rainscreen with continuous sheathing and zero nominal weather membrane',exterior:true,layers:[
 {mat:'finish A',materialId:'material-f06-a',kind:'material',t:19.05,function:'finish',core:false},
 {mat:'air',kind:'cavity',t:25.4,ventilation:'ventilated',function:'substrate',core:false},
 {mat:'membrane',t:0,function:'membrane',core:false},
 {mat:'osb',t:12.7,function:'substrate',core:false},
 {mat:'studs',t:139.7,function:'structure',core:true},
 {mat:'gypsum',t:12.7,function:'finish',core:false}]};
export const interior={key:'wall-f06-interior',name:'Unused service partition with an unventilated cavity and two ordered zero-thickness membranes',exterior:false,layers:[
 {mat:'finish B',materialId:'material-f06-b',kind:'material',t:15.875,function:'finish',core:false},
 {mat:'membrane',t:0,function:'membrane',core:false},
 {mat:'air',kind:'cavity',t:38.1,ventilation:'unventilated',function:'substrate',core:true},
 {mat:'studs',t:88.9,function:'structure',core:true},
 {mat:'membrane',t:0,function:'membrane',core:false},
 {mat:'gypsum',t:12.7,function:'finish',core:false}]};
export async function generate({count=2,schemaBytes=null}={}){
 const m=await model(schemaBytes||new TextEncoder().encode(newBuilding({name:'F06 assembly documentation',levels:stackLevels(1,3000,()=> 'Ground'),now:new Date('2026-10-22T12:00:00Z')})));
 m.change(op(w=>{const ms=readMaterials(w);ms.push(...['a','b'].map((k,i)=>({...ms[0],id:'material-f06-'+k,legacyName:'finish '+k.toUpperCase(),name,color:i?'#ac365d':'#287b8a',fill:i?'diagonal':'crosshatch'})));writeMaterials(w,ms);return [];}));
 m.change(saveWallAssembly(exterior));m.change(saveWallAssembly(interior));
 for(let i=2;i<count;i++)m.change(saveWallAssembly({...exterior,key:'wall-f06-'+String(i).padStart(3,'0'),name:'Large fixture assembly '+i+' with long cladding / sheathing / framing descriptions'}));
 const lv=readLevels(m.w())[0];m.change(drawWalls({storey:lv.guid,typeKey:exterior.key,height:2700,segs:[{a:[0,0],b:[6000,0],justification:'coreCenter'}]}));
 m.change(saveSheet({number:'F06-01',title:'Wall assembly documentation',paper:'a3',views:[{kind:'schedule',ref:'f06-assemblies:1',x:210,y:180,ratio:0}]}));
 let text=new TextDecoder().decode(m.ed.save());const guids=[...new Set([...text.matchAll(/#[0-9]+=IFC[A-Z0-9]+\('([0-3][0-9A-Za-z_$]{21})'/g)].map(m=>m[1]))];
 for(const[i,g]of guids.entries())text=text.split(g).join('0F06'+String(i).padStart(18,'0'));
 const re=await model(new TextEncoder().encode(text));return re.w().api.file(re.w().mid).save({timeStamp:'2026-10-22T12:00:00'});
}
if(process.argv[1]===fileURLToPath(import.meta.url)){fs.writeFileSync(fixture,await generate());console.log(fileURLToPath(fixture));}
