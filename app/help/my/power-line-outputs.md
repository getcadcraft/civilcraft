---
title: လျှပ်စစ်ကြိုး ဇယားများ၊ ပမာဏများ၊ စာရွက်များနှင့် GIS
summary: ဆွဲတပ်နှင့် ထောက်ပံ့ချက် ဇယားများ၊ spreadsheet သို့မဟုတ် TakeoffCraft အတွက် ပစ္စည်းပမာဏများ၊ PDF တစ်ခုတည်းတွင် plan နှင့် profile စာရွက်များနှင့် လေ့လာမှု အစီရင်ခံစာ၊ ပစ္စည်းတိုင်း၏ ဒေတာပါသော GIS အလွှာများ။
keywords: ဆွဲတပ်ဇယား, ထောက်ပံ့ချက်ဇယား, ပမာဏ, bill of materials, takeoffcraft, စာရွက်များ, အစီရင်ခံစာ, pdf, profile စာရွက်, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

ဤအရာအားလုံးသည် Power lines group ရှိ {{ui:More}} အောက်တွင် ရှိပါသည်။

| အထွက် | သင်ရရှိသည့်အရာ |
|---|---|
| {{ui:Stringing tables…}} | အပိုင်းတစ်ခုချင်းစီအလိုက် အလျားလိုက် tension နှင့် span တစ်ခုချင်းစီ၏ sag ကို အပူချိန်တိုင်းတွင်; CSV အဖြစ် သိမ်းပါ။ {{ui:Save the supports table (CSV)}}: ထောက်ပံ့ချက်တစ်ခုချင်းစီ၏ အခန်းကဏ္ဍ၊ ပစ္စည်း၊ မြေပြင်၊ ချိတ်ဆက်မှု၊ အကြီးဆုံး load၊ nominal၊ OK၊ အကြံပြုချက်၊ အုတ်မြစ်၊ swing၊ uplift |
| {{ui:Quantities…}} | Conductor (catenary အလျား × conductor × circuit + jumper နှင့် dead-end အတွက် 2 %)၊ ထောက်ပံ့ချက်များနှင့် ပစ္စည်းများကို စာကြည့်တိုက်ပစ္စည်းအလိုက်၊ ကေဘယ်၊ trench၊ တူးဖော်မှု၊ ပိုက်လိုင်း၊ joint များ။ CSV၊ Excel၊ သို့မဟုတ် TakeoffCraft ပမာဏဖိုင် |
| {{ui:Sheets and report…}} | PDF တစ်ခုတည်း: plan; လိုင်းတစ်ခုစီအတွက် profile စာရွက် (သင်ရွေးသော load case များဖြင့် conductor နှင့် span အလျား၊ sag နှင့် အနိမ့်ဆုံး ရှင်းလင်းမှုများ၏ အစင်း); နှင့် လေ့လာမှု အစီရင်ခံစာ (စည်းမျဉ်းအစု၊ အပိုင်းများ၊ ဆွဲတပ်ဇယားများ၊ ထောက်ပံ့ချက်များ၊ စစ်ဆေးမှုအားလုံး) |
| {{ui:Export to GIS…}} | ထောက်ပံ့ချက်များ၊ span များ၊ ကေဘယ်လမ်းကြောင်းများ၊ ပစ္စည်းများနှင့် အတားအဆီးများကို ၎င်းတို့၏ ဒေတာ (အမြင့်၊ load၊ sag၊ ရှင်းလင်းမှု၊ မအောင်မြင်သည့်အရာ) ပါသော အလွှာများအဖြစ်; GeoPackage၊ shapefile၊ GeoJSON၊ KML သို့မဟုတ် KMZ |

GeoJSON နှင့် KML သည် project ၏ coordinate system ကို လိုအပ်ပါသည် ([Coordinate systems](topic:coordinate-systems))၊ မရှိပါက GeoPackage နှင့် shapefile တွင် project ၏ ကိုယ်ပိုင် နံပါတ်များ ပါပါမည်။
