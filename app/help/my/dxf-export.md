---
title: ပလန်ကို DXF အဖြစ် ထုတ်ရန်
summary: ပလန်မျဉ်းများကို အမည်ပေးထားသော လေယာများပေါ်တွင် R12 DXF အဖြစ် ရေးသားပြီး၊ ကွန်တူများကို ၎င်းတို့၏ အမြင့်ဖြင့်နှင့် breakline များကို 3D ဖြင့် ထားရှိကာ မည်သည့် CAD ပရိုဂရမ်အတွက်မဆို ထုတ်ပေးသည်။
keywords: dxf, dwg, cad, ထုတ်ရန်, မျဉ်း, r12, 2000, 2004, 2007, 2010, 2013, 2018, လေယာများ, ကွန်တူများ, ပုံဆွဲ ဖလှယ်ခြင်း, အခြေခံမြေပုံ, နောက်ခံ
from: f2d8ede9
---

{{ui:DXF}} သည် ပလန်တွင် မြင်ရသည်များကို R12 ဖော်မတ်ဖြင့် DXF ဖိုင်အဖြစ် ရေးသားသည်။ ဤဗားရှင်းကို CAD ပရိုဂရမ်အားလုံး ဖွင့်နိုင်သည်။ AutoCAD သို့မဟုတ် Civil 3D ကို အသုံးပြုဖူးလျှင် DXF ဖိုင်တစ်ခုကို ဖွင့်သည့်အတိုင်း ဖွင့်ပါ သို့မဟုတ် insert လုပ်ပါ။

## ထုတ်ရန်

1. ပုံဆွဲလိုသည့်ပုံစံအတိုင်း ပလန်ကို သတ်မှတ်ပါ။ **Display** အောက်တွင် မျက်နှာပြင် (လက်ရှိ သို့မဟုတ် အဆိုပြုထားသော)၊ ကွန်တူ အကွာအဝေး၊ နှင့် ဖွင့်ထားမည့်အရာများ (ကွန်တူများ၊ label များ၊ point များ၊ point label များ၊ တြိဂံများ၊ breakline များ၊ မျက်နှာပြင်ဘောင်၊ ပိုက်များ၊ slope မြားများ) ကို ရွေးပါ။
2. **Export** အုပ်စုတွင် {{ui:DWG/DXF}} ကို နှိပ်ပြီး {{ui:DXF (R12, စာသား) — ရိုးရှင်းသော ဖလှယ်ဖိုင်}} ကို ရွေးကာ {{ui:Download}} ကို နှိပ်ပါ။
3. ဘရောက်ဇာသည် `<name>.dxf` ကို ဒေါင်းလုဒ်ဆွဲသည်။ Status bar က ဥပမာအားဖြင့် ဤသို့ ပြသသည်: "Exported R12 DXF: 2,140 objects; labels sized for 1" = 40'. Bands are not exported."

Coordinates များကို ပရောဂျက် ယူနစ်ဖြင့် မှန်ကန်သော တန်ဖိုးအတိုင်း ရေးသားသည် (state plane coordinates များ မူလအတိုင်း ရှိနေသည်)။ ဘာမျှ scale မလုပ်ပါ၊ ရွှေ့ခြင်းလည်း မရှိပါ။

## ဖိုင်ထဲတွင် ပါဝင်သည်များ

| အရာ | DXF entity | လေယာ |
|---|---|---|
| အသေးနှင့် အကြီး ကွန်တူများ | အမြင့်ဖြင့် 2D polylines | C-TOPO-MINR, C-TOPO-MAJR |
| ကွန်တူ label များ | Text | C-TOPO-TEXT |
| တြိဂံများ | Polylines | C-TOPO-TINN |
| Breakline များနှင့် နယ်နိမိတ် | 3D polylines | C-TOPO-BRKL |
| မျက်နှာပြင်ဘောင် | Polylines | C-TOPO-BNDY |
| Slope မြားများ | Polylines | C-TOPO-SLOP |
| Survey point များနှင့် ၎င်းတို့၏ label များ | Points (အမြင့်ပါ), text | V-NODE, V-NODE-TEXT |
| Line code မှ မျဉ်းများ | 3D polylines | V-NODE-LINE |
| Alignment centerline များ | Lines and arcs | C-ROAD-CNTR |
| Stationing tick နှင့် label များ | Polylines, text | C-ROAD-STAN |
| Corridor ဘောင်များ | Polylines | C-ROAD-CORR |
| Sample line များ | Polylines | C-ROAD-SCTN |
| Pad များ၊ daylight line များ၊ slope line များ | Polylines | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Feature line များ | 3D polylines (arc များကို 0.01 အတွင်း အပိုင်းများအဖြစ်; see [Feature line များ](topic:feature-lines)) | C-GRAD-FEAT |
| Swept path များ | Polylines, text | C-ROAD-SWPT |
| ပိုက်များ၊ structure များ၊ label များ | Polylines, text | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| ပြဿနာရှိသော ပိုက်နှင့် structure များ | Polylines | C-STRM-PROB |

လေယာတစ်ခုစီတွင် အရောင် ရှိသည်။ အပြည့်အစုံ စာရင်းကို [ပလန်လေယာများ](topic:plan-layers) တွင် တွေ့နိုင်သည်။

## Label အရွယ်အစား

Text တွင် drawing unit ဖြင့် အရွယ်အစား ရှိရမည်။ CivilCraft က label များကို ပလန်တစ်ခုလုံး Tabloid စာရွက် (feet) သို့မဟုတ် A3 စာရွက် (metres) အပေါ် ကိုက်ညီသည့် scale အတွက် အရွယ်ချိန်ပြီး status message တွင် မည်သည့် scale ဖြစ်ကြောင်း ပြောသည်။ CAD ပရိုဂရမ်တွင် အခြား scale ဖြင့် ပလော့လုပ်လျှင် ထို program တွင် text ကို scale လုပ်ပါ။

## မထုတ်ရသည့်အရာများ

- Elevation band များ (မျက်နှာပြင်တွင်သာ)။
- Profile view။ Profile များကို drawing အဖြစ် မဟုတ်ဘဲ LandXML အဖြစ် ထုတ်သည်။
- မျက်နှာပြင်ကိုယ်တိုင်ကို 3D object အဖြစ်။ TIN အတွက် LandXML ကို သုံးပါ၊ သို့မဟုတ် {{ui:Triangles}} ကို ဖွင့်ပြီး ၎င်း၏ ဘောင်များကို linework အဖြစ် ရယူပါ။
- **Display** အောက်တွင် ပိတ်ထားသည့် မည်သည့်အရာမဆို။

## DWG

{{ui:DWG/DXF}} သည် တူညီသော linework ကို DWG drawing အဖြစ်လည်း ရေးသားနိုင်သည်။ dialog က ဖော်မတ်ကို မေးသည်: DXF၊ သို့မဟုတ် 2000၊ 2004၊ 2007၊ 2010၊ 2013 သို့မဟုတ် 2018 DWG။ 2000 ကို CAD ပရိုဂရမ်အဟောင်းနှင့်အသစ် အားလုံးနီးပါးက ဖွင့်နိုင်သည်။ ပုံဆွဲကို လက်ခံသူက ပိုသစ်သော ဗားရှင်း တောင်းဆိုသည့်အခါ ထိုဗားရှင်းကို ရွေးပါ။ သင်၏ရွေးချယ်ချက်ကို ဤဘရောက်ဇာတွင် မှတ်ထားသည်။

1. **Export** အုပ်စုတွင် {{ui:DWG}} ကို နှိပ်ပါ။
2. **Format** ကို ရွေးပြီး **Download DWG** ကို နှိပ်ပါ။
3. ဘရောက်ဇာသည် `<name>.dwg` ကို ဒေါင်းလုဒ်ဆွဲသည်။ Status bar က ဘာပါဝင်သည်ကို ပြသသည်၊ ဥပမာ "Exported DWG (2018 format): 12 polylines, 40 labels on 9 layers"။

DWG တွင် DXF နှင့် တူညီသော လေယာများ၊ အရောင်များ၊ ကွန်တူများ (အမြင့်ဖြင့် polyline များအဖြစ်)၊ 3D breakline များ၊ label များနှင့် point များ ပါဝင်ပြီး coordinates များလည်း တူညီသည်။ DWG က မထိန်းသိမ်းနိုင်သော လေယာအမည်များကို ပြောင်းလဲပြီး status message တွင် ထိုသို့ ပြောသည်။ CivilCraft က DWG ကို ကိုယ်ပိုင်ကုဒ်ဖြင့် ရေးသားသဖြင့် မည်သည့်အရာမှ သင့်ကွန်ပျူတာမှ မထွက်ပါ။

### DWG ထဲရှိ မြေပုံ လေယာများ

DWG drawing သည် ပုံကို ၎င်းအတွင်း ထည့်၍မရပါ။ CAD ပရိုဂရမ်များက drawing ဘေးတွင် ထားသော ပုံအဖြစ် ပြသသည်။ မြေပုံ လေယာများ ပြနေချိန်တွင် dialog က **Map layers as a picture beside the drawing** ကို ပေးသည်။ ၎င်းကို အမှန်ခြစ်ထားလျှင် download သည် `.zip` ဖြစ်ပြီး အတွင်းတွင် `<name>.dwg`၊ `<name>-map.png` (drawing တစ်ခုလုံးပေါ်ရှိ မြေပုံ လေယာများ၊ 4,096 pixel အထိ အကျယ်) နှင့် `<name>-map.pgw` (GIS ပရိုဂရမ်များအတွက် world file) ပါဝင်သည်။ Drawing က ပုံကို G-MAP-IMAG လေယာပေါ်တွင် နေရာအတိုင်း image အဖြစ် ပြသည်။ ဖိုင်များကို ဖိုင်တွဲတစ်ခုတည်းသို့ unzip လုပ်ပြီး အတူတူ ထားပါ။
