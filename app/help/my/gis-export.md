---
title: GIS အတွက် as-built ဒေတာ ထုတ်ခြင်း
summary: survey အမှတ်များ၊ contour များ၊ alignment များ၊ pad များ၊ ပိုက်များနှင့် structure များကို မြို့ သို့မဟုတ် ကောင်တီ GIS ဌာနသို့ shapefile၊ GeoPackage၊ GeoJSON သို့မဟုတ် KML အဖြစ် ပရောဂျက်၏ coordinate system ရှိ grid coordinate များဖြင့် ပို့ခြင်း။
keywords: gis, ထုတ်ခြင်း, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, ပိုက်များ, structure များ, utility များ, မြို့, ကောင်တီ, grid, မြေပြင်, epsg, prj
from: bba4fea5
---

မြို့နှင့် ကောင်တီများသည် ပရောဂျက်ပိတ်သည့်အခါ GIS ဖော်မတ်ဖြင့် as-built ဒေတာ တောင်းဆိုကြသည်: ပိုက်နှင့် structure များ ရောက်ရှိရာနေရာ၊ နောက်ဆုံး grade များ၊ လမ်းမ၏ centerline။ **GIS › Export** က CivilCraft ထိန်းသိမ်းထားသည်များကို အမျိုးအစားတစ်ခုလျှင် GIS အလွှာတစ်ခုအဖြစ် ရေးသည်။

## ထုတ်ခြင်းမပြုမီ

1. ပရောဂျက်၏ coordinate system ကို {{ui:Coordinates}} တွင် သတ်မှတ်ပါ။ GIS ဌာနသည် ကိန်းဂဏန်းများ ဘယ်မှာရှိသည်ကို သိရန် လိုအပ်သည်; system မရှိလျှင် ဖိုင်များသည် ပရောဂျက်၏ ကိုယ်ပိုင်ကိန်းဂဏန်းများကိုသာ ပါပြီး မည်သည့် system ကိုမျှ အမည်မပေးပါ။
2. မျက်နှာပြင်၊ alignment များ၊ pad များနှင့် ပိုက်ကွန်ရက်ကို သင်ပို့လိုသည့်ပုံစံအတိုင်း စစ်ဆေးပါ။
3. ဌာနအား မည်သည့်ဖော်မတ်နှင့် မည်သည့် coordinate system ကို လိုချင်သည်ကို မေးပါ။ အများအပြားက local state plane zone ရှိ shapefile ကို ဆက်တောင်းကြသည်; စနစ်အသစ်များက GeoPackage ကို လက်ခံသည်။

## ထုတ်ခြင်း

1. **GIS** အုပ်စုရှိ {{ui:Export}} ကို နှိပ်ပါ။
2. **What** အောက်တွင် ပို့လိုသော အမျိုးအစားများကို အမှန်ခြစ်ပါ။ တစ်ခုစီက အင်္ဂါရပ် အရေအတွက်ကို ပြသည်; ဘာမျှ မရှိသေးသော အမျိုးအစားများသည် မှိန်နေသည်။
3. **As** အောက်တွင် ဖော်မတ်ကို ရွေးပါ။
4. coordinate နှင့် ယူနစ်များအကြောင်း မှတ်ချက်များကို ဖတ်ပြီး download ခလုတ်ကို နှိပ်ပါ။ status line က ဘာတွေ ပါဝင်ခဲ့ကြောင်းနှင့် အတိုကောက်ခံခဲ့ရသော field အမည်များကို ပြောပြသည်။

dialog တွင် elevation grid export ({{ui:Surface as a GeoTIFF elevation grid}}) လည်း ပါဝင်သည်; [Elevation grid နှင့် LiDAR](topic:elevation-grids-and-lidar) ကို ကြည့်ပါ။

## အမျိုးအစားတစ်ခုစီတွင် ပါဝင်သည်များ

| အမျိုးအစား | ပုံသဏ္ဍာန် | Field များ |
|---|---|---|
| Survey points | အမြင့်ပါသော အမှတ်များ | `P` အမှတ်နံပါတ်၊ `N` မြောက်ညွှန်း (northing)၊ `E` အရှေ့ညွှန်း (easting)၊ `Z` အမြင့်၊ `D` ဖော်ပြချက် |
| ရှိပြီးမြေပြင်၏ contour များ၊ grade ပြီးမျက်နှာပြင်၏ contour များ | အမြင့်ဖြင့် မျဉ်းများ | `ELEV` |
| Breaklines | အမြင့်ပါသော မျဉ်းများ | `NAME` |
| Surface boundary | Polygon (ဆွဲထားသော နယ်နိမိတ်၊ မဟုတ်လျှင် မျက်နှာပြင်၏ အနားစွန်း) | `NAME` |
| Alignments | Centerline များ | `NAME`, `LENGTH`, `STA_START`, `STA_END` (station များကို ရိုးရိုးကိန်းဂဏန်းအဖြစ်) |
| Pads | Pad အမြင့်ရှိ polygon များ | `NAME`, `ELEV`, `AREA` |
| Daylight lines | အမြင့်ပါသော မျဉ်းများ (pad နှင့် corridor) | `NAME` |
| Corridor feature lines | အမြင့်ပါသော မျဉ်းများ: အလယ်၊ ကတ္တရာ အနားများ၊ ပခုံးများ | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Pipes | အပေါ် invert မှ အောက် invert သို့ မျဉ်းများ | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (ရာခိုင်နှုန်း), `LENGTH`, `NETWORK` |
| Structures | ထိပ်တွင် အမှတ်များ | `NAME`, `RIM`, `INVERT` (ထိုနေရာရှိ အနိမ့်ဆုံး ပိုက် invert), `SUMP`, `DIA`, `DIA_UNIT` |
| GIS အလွှာတစ်ခုစီ | သွင်းထားသည့်အတိုင်း | ကိုယ်ပိုင် field များ |

အလျား၊ station နှင့် အမြင့်များသည် ပရောဂျက်၏ ယူနစ် (US survey feet သို့မဟုတ် meter) ဖြင့် ဖြစ်သည်။ ပိုက်နှင့် structure အချင်းများသည် feet ပရောဂျက်အတွက် inch နှင့် meter ပရောဂျက်အတွက် mm ဖြစ်ပြီး `DIA_UNIT` က မည်သည့်ယူနစ်ဖြစ်သည်ကို ပြသည်။

## ဖော်မတ်များ

- **Shapefile**: အမျိုးအစားတစ်ခုစီအတွက် shapefile (`.shp`, `.shx`, `.dbf`) ပါသော `.zip` တစ်ခု၊ စာသားသည် UTF-8 ဖြစ်ကြောင်း ပြသော `.cpg`၊ coordinate system ကို အမည်ပေးသော `.prj`။ elevation ပါသော ပုံသဏ္ဍာန်များကို shapefile ၏ Z အမျိုးအစားများအဖြစ် ရေးသည်။ ဖော်မတ်က တောင်းဆိုသည့်အတိုင်း အက္ခရာ 10 လုံးထက် ရှည်သော field အမည်များကို တိုစေပြီး status line က ၎င်းတို့ကို စာရင်းပြုစုသည်။
- **GeoPackage**: အမျိုးအစားတစ်ခုစီအတွက် table ပါသော `.gpkg` ဖိုင်တစ်ခု၊ coordinate system ကို EPSG code ဖြင့် သိမ်းသည်။ ဖိုင်များစွာအစား ဖိုင်တစ်ခု၊ field အမည်ရှည်များ မပျက်စီးပါ။
- **KML** သို့မဟုတ် **KMZ** (zip ထားသော KML): Google Earth နှင့် web map များအတွက် latitude နှင့် longitude ပါသော ဖိုင်တစ်ခု၊ အမျိုးအစားတစ်ခုစီအတွက် folder၊ အင်္ဂါရပ်တစ်ခုစီသည် NAME field မှ အမည်ပေးထားသော placemark ဖြစ်ပြီး field အားလုံးကို extended data အဖြစ် ပါဝင်သည်; အမြင့်များကို meter ဖြင့် (altitude mode absolute)။ GeoJSON ကဲ့သို့ပင် ပရောဂျက်၏ coordinate system လိုအပ်သည်။
- **GeoJSON**: latitude နှင့် longitude ပါသော ဖိုင်တစ်ခု (GeoJSON စံနှုန်းက အခြားမည်သည့်အရာမျှ ခွင့်မပြု)၊ အင်္ဂါရပ်တစ်ခုစီတွင် `kind` property (`pipes`, `structures`, …) ပါ၍ လက်ခံသူက ခွဲနိုင်သည်။ အမြင့်များကို GeoJSON စံနှုန်းအတိုင်း meter သို့ ပြောင်းသည်; ၎င်းတို့သည် ပရောဂျက်၏ vertical datum ပေါ်တွင် ရှိနေဆဲ ဖြစ်သည် (CivilCraft တွင် geoid model မရှိ)။ coordinate system မရှိသော ပရောဂျက်သည် GeoJSON ထုတ်၍ မရပါ; dialog က အကြောင်းပြသည်။

## Grid၊ မဟုတ် ground

GIS ဌာနများသည် ၎င်းတို့၏ ဒေတာကို coordinate system ၏ **grid** coordinate များဖြင့် ထိန်းသိမ်းသည်။ ပရောဂျက်သည် ground သို့မဟုတ် local coordinate (ပြင်ဆင်ရန် {{ui:Coordinates}}) ကို သုံးလျှင် ထွက်ခွာချိန်တွင် coordinate တိုင်းကို grid သို့ ပြန်ပြောင်းသည်; ဖိုင်များထဲရှိ ကိန်းဂဏန်းများသည် plan နှင့် သင်၏ scale factor (local system အတွက် rotation လည်း) အလိုက် ကွာသည်။ `N` နှင့် `E` အမှတ် field များတွင်လည်း grid တန်ဖိုးများ ပါသည်။ dialog က ထိုအကြောင်းကို သတိပေးသည်။

:::tip
ဖိုင်များနှင့်အတူ တိုတိုမှတ်ချက် ပို့ပါ: coordinate system နှင့် EPSG code၊ သင်၏ elevation များ၏ vertical datum၊ ယူနစ်များ၊ ဖိုင်တစ်ခုစီက ဘာလဲဆိုသည်။
:::

## ဘာတွေ စစ်ဆေးပြီးပြီလဲ

- ရေးထားသော ဖိုင်တိုင်းကို GDAL (GIS ပရိုဂရမ်အများစု သုံးသော library) က ပြန်ဖတ်ထားသည်: ပုံသဏ္ဍာန်တိုင်း၊ elevation နှင့် attribute တိုင်း၊ အင်္ဂါရပ် အရေအတွက်များ၊ coordinate system ကို EPSG code အဖြစ် (`.prj` နှင့် GeoPackage)။ ကျွန်ုပ်တို့၏ reader များကလည်း အတူတူ ပြန်ဖတ်ပါသည်။
- GeoJSON ဖိုင်များသည် RFC 7946 ကို လိုက်နာသည်: longitude ကို latitude ရှေ့တွင်၊ `crs` member မရှိ၊ outer ring များ နာရီလက်တံ ပြောင်းပြန်ဘက်၊ hole များ နာရီလက်တံဘက်။ နေရာများကို PROJ နှင့် 2 mm အတွင်း ကိုက်ညီသည်။
- ground-coordinate ပရောဂျက်ကို ထုတ်ပြီး အမှတ်တိုင်းကို ၎င်း၏ grid coordinate များနှင့် စစ်ဆေးထားသည်။
- ဤအရာများကို အခြား GIS ပရိုဂရမ်များတွင် မဖွင့်ရသေးပါ။ ပထမဆုံး ပို့ဆောင်မှုကို မှီခိုမည်မတိုင်မီ ဌာနနှင့်အတူ စစ်ဆေးပါ။
