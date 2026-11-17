---
title: Toolbar အညွှန်း
summary: CivilCraft ရှိ toolbar ခလုတ်တိုင်း၊ ၎င်းလုပ်ဆောင်ချက်၊ ၎င်း၏ key နှင့် မှိန်နေသည့် သို့မဟုတ် ငြင်းပယ်သည့်အချိန်။
keywords: toolbar, buttons, commands, tools, file, export, surface, design, edit, view, menu
from: 4c4352bc
---

toolbar သည် အက်ပ်၏ အပေါ်ဘက်တွင် အုပ်စု ခုနစ်စု ဖြင့် ရှိပါသည်။ ခလုတ်တိုင်းသည် ၎င်းပေါ် မောက်ထောက်ပြသောအခါ tooltip နှင့် key ကို ပြပါသည်။

## File

| ခလုတ် | Key | ဘာလုပ်သလဲ |
|---|---|---|
| {{ui:New}} | မရှိ | ပရောဂျက် အလွတ်တစ်ခု စတင်ပါသည်။ မသိမ်းရသေးသော ပြောင်းလဲမှု ရှိပါက ဦးစွာ မေးပါသည်။ |
| {{ui:Open}} | {{key:Mod+O}} | point ဖိုင် (CSV, TXT)၊ LandXML သို့မဟုတ် CivilCraft ပရောဂျက်ကို ဖွင့်ပါသည်။ |
| {{ui:Save}} | {{key:Mod+S}} | ပရောဂျက်ကို `<name>.civilcraft.json` အဖြစ် ဒေါင်းလုဒ်ဆွဲပါသည်။ |

## Export

| ခလုတ် | Key | ဘာလုပ်သလဲ |
|---|---|---|
| {{ui:LandXML}} | မရှိ | `<name>.xml` ကို ဒေါင်းလုဒ်ဆွဲပါသည်: points၊ surfaces၊ alignments၊ profiles နှင့် pipe network ကို LandXML 1.2 အဖြစ်။ ပရောဂျက် ဗလာဖြစ်သောအခါ "Nothing to export yet." ဟု ပြပါသည်။ |
| {{ui:DXF}} | မရှိ | `<name>.dxf` ကို ဒေါင်းလုဒ်ဆွဲပါသည်: plan linework ကို R12 DXF အဖြစ်။ |
| {{ui:PDF}} | {{key:Mod+P}} | **Plot the plan to PDF** ကို ဖွင့်ပါသည်။ ပရောဂျက် ဗလာဖြစ်သောအခါ "Nothing to plot yet." ဟု ပြပါသည်။ |

## Surface

| ခလုတ် | Key | ဘာလုပ်သလဲ |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | survey points များကို အစဉ်လိုက် နှိပ်ပါ၊ ပြီးဆုံးရန် {{key:Enter}}။ breakline က point များ၏ အမြင့်ကို ယူပါသည်။ |
| {{ui:Boundary}} | {{key:O}} | အပြင်ဘက် boundary ၏ cornerများကို နှိပ်ပါ၊ ပြီးဆုံးရန် {{key:Enter}}။ boundary အဟောင်းကို အစားထိုးပါသည်။ |

နှစ်ခုစလုံးသည် မျက်နှာပြင် မရှိသေးသောအခါ "There is no surface yet: open survey points first." ဟု ပြောပါသည်။

## Design

| ခလုတ် | Key | ဘာလုပ်သလဲ |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | PI များကို အစဉ်လိုက် နှိပ်ပါ၊ ပြီးဆုံးရန် {{key:Enter}}။ |
| {{ui:Pad}} | {{key:G}} | pad ၏ cornerများကို နှိပ်ပါ၊ ပြီးဆုံးရန် {{key:Enter}}။ မျက်နှာပြင် ကိရိယာများကဲ့သို့ မျက်နှာပြင် မရှိသောအခါ သတိပေးပါသည်; pad သည် မျက်နှာပြင်တစ်ခုပေါ်တွင်သာ grade လုပ်နိုင်ပါသည်။ |
| {{ui:Pipes}} | {{key:P}} | structures များကို အပေါ်ဘက်မှ အောက်သို့ နှိပ်ပါ (ရှိပြီးသား တစ်ခုကို နှိပ်ပါက ၎င်းနှင့် ပေါင်းပါသည်)၊ ပြီးဆုံးရန် {{key:Enter}}။ |
| {{ui:Profile}} | {{key:R}} | plan အောက်ရှိ profile view ကို ပြ သို့မဟုတ် ဖျောက်ပါသည်။ |

## Edit

| ခလုတ် | Key | ဘာလုပ်သလဲ |
|---|---|---|
| {{ui:Undo}} | {{key:Mod+Z}} | နောက်ဆုံး ပြောင်းလဲမှုကို ပြန်ဖျက်ပါသည် (200 အထိ)။ ပြန်ဖျက်စရာ မရှိသောအခါ မှိန်နေပါသည်။ |
| {{ui:Redo}} | {{key:Mod+Y}} | ပြန်ဖျက်ခဲ့သည်ကို ပြန်လုပ်ပါသည်။ ပြန်လုပ်စရာ မရှိသောအခါ မှိန်နေပါသည်။ |
| {{ui:Copy}} | {{key:Mod+C}} | ရွေးထားသော survey points များကို ကူးပြီး spreadsheet က ယူနိုင်သော point row အဖြစ် clipboard ပေါ်ထားပါသည်။ points မရွေးရသေးမချင်း မှိန်နေပါသည်။ |
| {{ui:Paste}} | {{key:Mod+V}} | points များကို ကူးထည့်ပါသည်: ၎င်းတို့သည် pointer ကို လိုက်ပြီး၊ နှိပ်လိုက်သောအခါ အခြား point မရှိသော နံပါတ်များဖြင့် ချပါသည်။ spreadsheet တွင် ကူးထားသော point rows များလည်း ကူးထည့်ပါသည်။ |
| {{ui:More}} | မရှိ | အောက်ပါ menu ကို ဖွင့်ပါသည်။ |

{{ui:More}} menu:

| ပစ္စည်း | Key | ဘာလုပ်သလဲ |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | ရွေးထားသော points များကို ကူးပြီး ဖျက်ပါသည် (undo အဆင့်တစ်ခု)။ |
| {{ui:Copy}} | {{key:Mod+C}} | {{ui:Copy}} ခလုတ်ကဲ့သို့။ |
| {{ui:Paste}} | {{key:Mod+V}} | {{ui:Paste}} ခလုတ်ကဲ့သို့။ |
| {{ui:Paste in place}} | {{key:Mod+Shift+V}} | points များကို ၎င်းတို့၏ ကိုယ်ပိုင် coordinates ဖြင့် ကူးထည့်ပါသည်၊ အခြား point မရှိသော နံပါတ်များဖြင့်။ |
| {{ui:Duplicate}} | {{key:Mod+D}} | ရွေးထားသော points ၏ မိတ္တူတစ်ခုသည် pointer ကို လိုက်ပါသည်; ရောက်သင့်သည့်နေရာကို နှိပ်ပါ။ clipboard ကို မထိပါ။ |
| {{ui:Delete}} | {{key:Delete}} | ရွေးထားသော survey points၊ သို့မဟုတ် alignment၊ pad၊ structure (ပိုက်များနှင့်အတူ)၊ pipe သို့မဟုတ် PVI ကို ဖျက်ပါသည်။ |
| {{ui:Select all points}} | {{key:Mod+A}} | survey point အားလုံးကို ရွေးပါသည်။ |
| {{ui:Select none}} | {{key:Esc}} | ရွေးချယ်မှုကို ရှင်းပါသည်။ |

ယခု လုပ်ဆောင်၍ မရသော ပစ္စည်းကို မှိန်ထားပြီး ၎င်း၏ tooltip က အကြောင်းပြချက်ကို ပြပါသည်။ အသေးစိတ်: [survey points များကို ရွေး၊ ကူးနှင့် ကူးထည့်ခြင်း](topic:copy-paste-points)။

Undo သည် design၊ မျက်နှာပြင် ဆက်တင်များနှင့် survey points များ (paste၊ cut၊ duplicate၊ delete) ၏ ပြင်ဆင်မှုများကို လွှမ်းခြုံပါသည်။ ပြသမှု ဆက်တင်များကို မလွှမ်းခြုံပါ၊ ဖိုင်ဖွင့်ခြင်း သို့မဟုတ် သွင်းခြင်းတိုင်းသည် undo ကို ရှင်းပါသည်။

## GIS

| ခလုတ် | Key | ဘာလုပ်သလဲ |
|---|---|---|
| {{ui:Coordinates}} | မရှိ | **Coordinate system** ဒိုင်ယာလော့ခ်ကို ဖွင့်ပါသည်: ပရောဂျက်သည် မည်သည့် system တွင် ရှိသည်ကို ပြောပါ၊ သို့မဟုတ် မြေပြင် သို့မဟုတ် ဒေသဆိုင်ရာ coordinates ကို သုံးပါ။ [ပရောဂျက်၏ coordinate system ကို သတ်မှတ်ခြင်း](topic:coordinate-systems) နှင့် [မြေပြင်နှင့် ဒေသဆိုင်ရာ coordinates](topic:ground-and-local-coordinates) ကို ကြည့်ပါ။ |
| {{ui:Import}} | မရှိ | GIS ဒေတာ သွင်းပါသည်: shapefiles၊ GeoJSON၊ GeoPackage၊ elevation grids နှင့် LiDAR။ [GIS ဒေတာ သွင်းခြင်း](topic:gis-import) ကို ကြည့်ပါ။ |
| {{ui:Export}} | မရှိ | GIS ဌာနအတွက် as-built ဒေတာကို ထုတ်ပါသည်။ [GIS အတွက် as-built ဒေတာ ထုတ်ခြင်း](topic:gis-export) ကို ကြည့်ပါ။ |
| {{ui:Analyze}} | မရှိ | GIS ခွဲခြမ်းစိတ်ဖြာ panel ကို ဖွင့်ပါသည်: buffer၊ overlay၊ spatial join၊ attribute ဖြင့် ရွေးခြင်း၊ တိုင်းတာခြင်း။ [GIS layers များကို ခွဲခြမ်းစိတ်ဖြာခြင်း](topic:gis-analysis) ကို ကြည့်ပါ။ |
| {{ui:Attribute table}} | မရှိ | Surface › More တွင် ရှိသည်။ GIS layer ၏ attribute table ကို ဖွင့်ပါသည်: စီခြင်း၊ စစ်ထုတ်ခြင်း၊ ရွေးခြင်း၊ တည်းဖြတ်ခြင်း၊ field ထည့်ခြင်း၊ တွက်ချက်ခြင်း၊ CSV အဖြစ် သိမ်းခြင်း။ [layer ၏ attribute table နှင့် အလုပ်လုပ်ခြင်း](topic:gis-table) ကို ကြည့်ပါ။ |
| {{ui:Map}} | မရှိ | **Map layers** ဒိုင်ယာလော့ခ်ကို ဖွင့်ပါသည်: coordinates ပါသော ပုံ၊ သို့မဟုတ် သင်ထည့်သော map servers များ၊ plan အောက်တွင် ဆွဲထားသည်။ [plan အောက်ရှိ map layers ပြခြင်း](topic:map-layers) ကို ကြည့်ပါ။ |

GIS ကိရိယာများသည် ဤခလုတ်များထဲမှ တစ်ခုကို ပထမဆုံး အသုံးပြုသည့်အခါ၊ GIS ဖိုင် ဖွင့်သည့်အခါ၊ သို့မဟုတ် coordinate system သို့မဟုတ် GIS layers ရှိသော ပရောဂျက်ကို ဖွင့်သည့်အခါ ဖွင့်ပါသည်။

## View

| ခလုတ် | Key | ဘာလုပ်သလဲ |
|---|---|---|
| {{ui:Select}} | {{key:V}} သို့မဟုတ် {{key:Esc}} | alignments၊ pads၊ structures၊ pipes နှင့် points များကို ရွေးရန် နှိပ်ပါ ({{key:Shift}} နှင့် နှိပ်ခြင်း သို့မဟုတ် ဆွဲခြင်းက points ထည့်ပါသည်); PI များ၊ pad cornerများနှင့် structures များကို ရွှေ့ရန် grips ကို ဆွဲပါ။ |
| {{ui:Fit}} | {{key:F}} | plan ကို မျက်နှာပြင်၊ points၊ alignments နှင့် pads ပြရန် ချဲ့ပါသည် (3D view တွင်: အားလုံးကို ပြပါသည်)။ |
| {{ui:3D}} | {{key:D}} | ဆိုက်ကို plan အပေါ်တွင် 3D ဖြင့် ပြ သို့မဟုတ် plan သို့ ပြန်သွားပါသည်။ 3D view အပေါ်ရှိ bar သည် view၊ exaggeration၊ အရောင်နှင့် ပြရမည့်အရာများကို သတ်မှတ်ပြီး GLB သို့မဟုတ် OBJ ကို ထုတ်ပါသည်။ [ဆိုက်ကို 3D ဖြင့် ကြည့်ခြင်း](topic:site-3d) ကို ကြည့်ပါ။ |

## Panels အတွင်းရှိ ခလုတ်များ

| ခလုတ် | ဘယ်မှာလဲ | ဘာလုပ်သလဲ |
|---|---|---|
| {{ui:Open the sample site}} | ဗလာ plan ပေါ်ရှိ ဘောက်စ် | နမူနာ survey ကို တင်ပါသည် (ချိတ်ဆက်မှု လိုအပ်ပါသည်၊ CivilCraft ကို offline အသုံးပြုရန် သိမ်းထားခြင်း မရှိမှသာ)။ |
| {{ui:Remove the boundary}} | ဘယ်ဘက် panel၊ Surface | အပြင်ဘက် boundary ကို ဖယ်ပါသည်။ |
| {{ui:Remove drawn breaklines}} | ဘယ်ဘက် panel၊ Surface | ကိရိယာဖြင့် ဆွဲထားသော breakline အားလုံးကို ဖယ်ပါသည် (breakline အုပ်စုများ မဟုတ်ပါ)။ |
| {{ui:Rebuild the surface from the points}} | ဘယ်ဘက် panel၊ Surface (LandXML မျက်နှာပြင်သာ) | LandXML TIN ကို ဖျက်ပြီး points မှ တည်ဆောက်ပါသည်; ပြန်မဖျက်နိုင်ပါ။ |
| {{ui:Start from the ground}} | ညာဘက် panel၊ Alignment | အဆုံးတိုင်းတွင် မြေပြင်ပေါ် PVI ပါသော design profile တစ်ခု စတင်ပါသည်။ |
| {{ui:Profile view}} | ညာဘက် panel၊ Alignment | ဤ alignment အတွက် profile view ကို ဖွင့်ပါသည်။ |
| {{ui:Add PVIs}} | Profile bar | ဖိထားစဉ် profile တွင် နှိပ်ခြင်းက PVI ထည့်ပါသည်။ |
| {{ui:Set every invert from the rules}} | ညာဘက် panel၊ Pipe network | ပိုက်အားလုံး၏ inverts ကို စည်းမျဉ်းအလိုက် သတ်မှတ်ပါသည်။ |
| {{ui:Set its inverts from the rules}} | ညာဘက် panel၊ Pipe | ဤပိုက်၏ inverts ကို စည်းမျဉ်းအလိုက် သတ်မှတ်ပါသည်။ |
