---
title: CivilCraft ဆက်တင်များ
summary: ကူးထားသော နှင့် ကပ်ထားသော point rows များအတွက် ကော်လံအစဉ်၊ ဖိုင်၏ ကော်လံများကို ခန့်မှန်းရန်၊ ကပ်ထားသော points များကို နံပါတ်ပေးပုံ၊ point labels ပြသမည့်အရာ၊ corner indicator၊ 3D ဒေါင်လိုက် exaggeration၊ latitude နှင့် longitude ပြပုံ၊ နှင့် map layers များ အင်တာနက်မှ လာခြင်း ရှိ မရှိ။
keywords: settings, preferences, pnezd, penzd, column order, point rows, renumber, point numbers, start number, point labels, labels, description, elevation, view cube, axis icon, corner indicator, compass, vertical exaggeration, 3d, latitude, longitude, dms, decimal degrees, map layers, internet, privacy, ဆက်တင်များ, ကော်လံအစဉ်, point labels, latitude, longitude
from: 64b9cb92
---

{{ui:Settings}} ကို app bar ရှိ ဂီယာ သို့မဟုတ် {{key:Mod+,}} ဖြင့် ဖွင့်ပါ။ ပထမ tab ဖြစ်သော {{ui:CivilCraft}} တွင် ဤ app နှင့် သက်ဆိုင်သော ဆက်တင်များ ရှိသည်; {{ui:General}} တွင် CadCraft app အားလုံး မျှဝေသော ဆက်တင်များ (theme၊ toolbar၊ panels) ရှိသည်။ CivilCraft ၏ ဆက်တင်များသည် app ထဲမှာသာ ရှိသည်: ဤနေရာတွင် ပြောင်းပြီး ဤ browser က မှတ်ထားသည်။ {{ui:Reset CivilCraft settings}} သည် ဆက်တင်အားလုံးကို စတင်တန်ဖိုးသို့ ပြန်ထားသည်။

## Point rows

**P, N, E, Z, D** (စတင်တန်ဖိုး) သို့မဟုတ် **P, E, N, Z, D**: point၊ northing၊ easting၊ elevation၊ description၊ သို့မဟုတ် northing ရှေ့တွင် easting။ ၎င်းကို နေရာသုံးခုတွင် သုံးသည်:

- **Copy**: spreadsheet အတွက် system clipboard ပေါ် CivilCraft ထည့်သော rows များ။
- **Paste**: header row မပါသော spreadsheet သို့မဟုတ် စာသားဖိုင်မှ ကပ်ထားသော rows များ။
- **Import**: ဖိုင်တွင် header row မရှိသောအခါ **Import points** dialog ရှိ ခန့်မှန်းချက် (ကော်လံလေးခုရှိ ဖိုင်သည် PENZ အဖြစ် ဖတ်သည်၊ သုံးခုဆိုလျှင် ENZ)။ [Point file formats](topic:point-file-formats) ကို ကြည့်ပါ။

ကော်လံများကို အမည်ပေးသော header row သည် အမြဲ အနိုင်ရသည်၊ import dialog ၏ **Columns** list ရွေးချယ်မှုလည်း ထိုနည်းတူ။

## ကပ်ထားသော points များအတွက် နံပါတ်များ

- **Keep free numbers** (စတင်တန်ဖိုး): ကပ်ထားသော point သည် ၎င်းနံပါတ်ကို အခမဲ့ဖြစ်လျှင် ထိန်းထားသည်; အတိုက်အခံရှိသော points များသာ နံပါတ်အသစ် ရသည်။
- **Always new numbers**: ကပ်ထားသော point တိုင်း၏ ကိုယ်ပိုင်နံပါတ် အခမဲ့ဖြစ်လျှင်ပင် နံပါတ်အသစ် ရသည်။

**New numbers start at**: ဗလာထားပါက အသုံးပြုနေသော အမြင့်ဆုံး နံပါတ်ထက် တစ်ခု ပိုသော နံပါတ်မှ ရေတွက်သည်။ နံပါတ်တစ်ခု ရိုက်ထည့်ပါ၊ ဥပမာ 5000၊ point အသစ်များကို 5000 မှ စတင် နံပါတ်ပေးရန်; အသုံးပြုပြီးသား နံပါတ်များကို ကျော်သည်။ နည်းလမ်းနှစ်ခုလုံးတွင် points နှစ်ခု နံပါတ်တူ မရှိပါ။ [Select, copy and paste survey points](topic:copy-paste-points#point-numbers-never-clash) ကို ကြည့်ပါ။

## Point labels

**Display** အောက်ရှိ {{ui:Point labels}} ဖွင့်ထားသောအခါ point label က ပြသမည့်အရာ: **Number**၊ **Number and elevation** သို့မဟုတ် **Number, elevation and description** (စတင်တန်ဖိုး)။ DXF၊ DWG နှင့် PDF export များသည် ဖန်သားပြင်နှင့် တူညီသော labels များကို ပြသသည်။

## Corner indicator

Plan နှင့် 3D view ၏ထောင့်တွင် ဘာရှိမလဲ: **View cube** (စတင်တန်ဖိုး)၊ **Axis icon** သို့မဟုတ် **None**။

- **View cube** (ညာဘက်ထိပ်)။ Plan ပေါ်တွင် ၎င်းသည် ထိပ်ကို ပြသည်၊ compass ring နှင့်အတူ: N သည် grid north (plan ၏ အပေါ်)။ Cube ၏ အခြား ဘက်၊ အစွန်း သို့မဟုတ် ထောင့်တစ်ခုကို နှိပ်ပါ သို့မဟုတ် ဆွဲပါ၊ [3D view](topic:site-3d) သည် ထိုနေရာမှ ကြည့်ရန် ဖွင့်သည်။ Plan cube ပေါ်ရှိ {{ui:Home}} သည် plan ကို ကိုက်ညီစေသည်။
- 3D view တွင် cube သည် view နှင့်အတူ လှည့်သည်: ဘက်တစ်ခု၊ အစွန်း သို့မဟုတ် ထောင့်ကို နှိပ်ပြီး ထိုနေရာမှ ကြည့်ပါ၊ cube ကို ဆွဲ၍ orbit လုပ်ပါ၊ compass ring ကို ဆွဲ၍ ဒေါင်လိုက်ပတ်လည် လှည့်ပါ၊ စာလုံးတစ်လုံးကို နှိပ်၍ ထိုဘက်မှ ကြည့်ပါ၊ နှင့် တစ်ခုလုံး site ၏ iso view အတွက် {{ui:Home}} ကို သုံးပါ။ ဘက်တစ်ခုကို တိုက်ရိုက်ကြည့်နေချိန် အသေးမြှားများက နောက်ဘက်သို့ သွားပြီး မျဉ်းကွေးမြှားများက view ကို လေးပုံတစ်ပုံ လှည့်သည်။
- **Axis icon** (ဘယ်ဘက်အောက်): plan ပေါ်တွင် အသေး X (အရှေ့) နှင့် Y (မြောက်) အမှတ်အသား၊ 3D တွင် X၊ Y နှင့် Z (အပေါ်)။

## 3D ဒေါင်လိုက် exaggeration

3D view သည် elevations ကို ဘယ်လောက် ဆန့်ထုတ်သလဲ: **1×**၊ **2×** (စတင်တန်ဖိုး)၊ **3×**၊ **5×** သို့မဟုတ် **10×**။ 3D view ၏ bar ရှိ list သည် ဤဆက်တင်တူပင်ဖြစ်သည်၊ ထို့ကြောင့် တစ်ခုပြောင်းလျှင် နှစ်ခုလုံး ပြောင်းသည်။ ပမာဏများ၊ profiles နှင့် 3D exports များသည် အမှန်စကေးတွင် ကျန်နေသည်။

## Latitude နှင့် longitude

Project တွင် coordinate system ရှိသောအခါ status bar က pointer ၏ latitude နှင့် longitude ကို ပြပုံ: **degrees, minutes and seconds** (စတင်တန်ဖိုး၊ ဥပမာ `30°18′00.00″ N`) သို့မဟုတ် **decimal degrees** (`30.300000° N`)။ [Set the project's coordinate system](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar) ကို ကြည့်ပါ။

## အင်တာနက်မှ map layers

**Off** (စတင်တန်ဖိုး) သို့မဟုတ် **On**။ ဖွင့်ထားသောအခါ CivilCraft သည် သင်ထည့်ထားသော map servers များကို ဖန်သားပြင်ပေါ် ဧရိယာ၏ ပုံများ တောင်းသည်။ သင့် drawing သည် ဤကွန်ပျူတာတွင်သာ ရှိနေသည်; server က ဧရိယာနှင့် သင့် internet address ကို မြင်သည်။ ပိတ်ထားစဉ် map server ကို မည်သည့်အရာမှ မတောင်းပါ၊ ဖွင့်သော project က အမည်ပေးထားသည့်တိုင်း; ဖိုင်မှ georeferenced ပုံသည် နည်းလမ်းနှစ်ခုလုံးဖြင့် အလုပ်လုပ်သည်။ [Show map layers under the plan](topic:map-layers) ကို ကြည့်ပါ။

## AI assistants များ

**Let AI assistants and scripts use CivilCraft** (စတင်ချိန်တွင် ပိတ်) သည် သင့်ကွန်ပျူတာပေါ်ရှိ assistant တစ်ခုအား CadCraft Studio မှတစ်ဆင့် ဖွင့်ထားသော site ကို ဝင်ရောက်ခွင့်ပေးသည်: **Read** သည် site ကို ဖော်ပြပြီး points၊ surface elevations၊ stations၊ profiles၊ volumes နှင့် parcels ပေးသည်; **Edit** သည် survey points များကို ရွေး၊ ထည့်ခွင့်ပေးသည်; **Save** နှင့် **Export** သည် project ကို သိမ်းခွင့်နှင့် LandXML သို့မဟုတ် DWG ရေးခွင့်ပေးသည်။ **Folders it may use** (Studio တွင်) သည် ၎င်း သိမ်း/export လုပ်နိုင်သော folders ဖြစ်သည်။ **Activity** သည် ၎င်း၏ calls များကို စာရင်းပြုသည်။ [Let an AI assistant work with your site](topic:assistants) ကို ကြည့်ပါ။
