---
title: LandXML: ဖတ်ခြင်းနှင့် ရေးခြင်း
summary: CivilCraft ဖတ်ပြီး ရေးသော LandXML 1.2 element နှင့် attribute များကို element အလိုက်၊ နှင့် ကျော်သွားသော အရာအားလုံး။
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, feature line, schema, မျက်နှာပြင်, နယ်နိမိတ်, ဖြောင့်မျဉ်း, ပရိုဖိုင်, ပိုက်, အင်္ဂါရပ်မျဉ်း
from: ca3cf359
---

CivilCraft သည် LandXML 1.2 ကို တရားဝင် namespace နှင့် schema location ဖြင့် ရေးသည်။ root element `LandXML` ဖြစ်သော မည်သည့်ဖိုင်ကိုမဆို ဖတ်ပြီး အောက်ပါ element များကို အမည်ဖြင့် ယူသည် (namespace prefix များကို လျစ်လျူရှုသည်; ဗားရှင်းကို မစစ်ဆေးပါ)။ ၎င်း၏ XML ဖတ်ကိရိယာသည် စံ entity ငါးခုနှင့် ဂဏန်း character reference များကိုသာ လက်ခံသည်; DTD သို့မဟုတ် ပြင်ပဖိုင်ကို ဘယ်တော့မှ မတင်ပါ။ အဆင့်များအတွက် [LandXML ကို လဲလှယ်ခြင်း](topic:landxml) ကို ကြည့်ပါ။

LandXML တွင် ကိုဩဒိနိတ်များကို မြောက်ဘက်တန်ဖိုး (northing) ကို ဦးစွာ ရေးသည်: အမှတ်တစ်ခုသည် "N E" သို့မဟုတ် "N E Z" ဖြစ်သည်။

## ရေးသားသည်များ

| Element | CivilCraft ရေးသားသည် |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot၊ ဧရိယာများ စတုရန်းပေ၊ ထုထည်များ ကုဗရာဒ်၊ အချင်းများ လက်မ) သို့မဟုတ် `Metric` (meter၊ square meter၊ cubic meter၊ millimeter) |
| `Project` | `name` = စီမံကိန်းအမည် |
| `Application` | အမည် CivilCraft၊ ထုတ်လုပ်သူ CadCraft |
| `CgPoints` / `CgPoint` | `name` = အမှတ်နံပါတ်၊ `desc` = ဖော်ပြချက်၊ `code` = အုပ်စု; စာသား "N E Z" (အမြင့်မပါလျှင် "N E") |
| `Alignments` / `Alignment` | `name`၊ `length`၊ `staStart` |
| `CoordGeom` / `Line` | `staStart`၊ `length`၊ `Start`၊ `End` |
| `CoordGeom` / `Curve` | `crvType` arc၊ `rot` cw သို့မဟုတ် ccw၊ `radius`၊ `length`၊ `staStart`၊ `chord`၊ `delta` (ဒီဂရီ)၊ `tangent`၊ `external`၊ `midOrd`; `Start`၊ `Center`၊ `End`၊ `PI` |
| `Profile` / `ProfSurf` | ဖြောင့်မျဉ်းတလျှောက် ရှိပြီးသား မြေပြင်၊ station နှင့် အမြင့်တွဲများ (`PntList2D`) အဖြစ်၊ မျက်နှာပြင်မှ ထွက်သွားသည့်နေရာတွင် ခွဲထားသည် |
| `Profile` / `ProfAlign` | ဒီဇိုင်း ပရိုဖိုင် (အမည် "<alignment> design"): အဆုံးများနှင့် ထောင့်အမှတ်များအတွက် `PVI`၊ ဒေါင်လိုက် ကွေးများအတွက် `length` ပါသော `ParaCurve` |
| `Surfaces` / `Surface` | `name` နှင့် `desc`; ပထမဆုံးမှာ ရှိပြီးသား မြေပြင်၊ ထို့နောက် pad များ သို့မဟုတ် corridor များ မြေညှိသည့်အခါ "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard၊ `name`၊ `PntList3D` (ရှိပြီးသား မြေပြင်သာ) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer၊ `edgeTrim` true၊ `PntList2D` (ရှိပြီးသား မြေပြင်သာ၊ ရှိလျှင်) |
| `Definition` | `surfType` TIN၊ `area2DSurf`၊ `area3DSurf`၊ `elevMax`၊ `elevMin`; `Pnts` / `P` ပါ `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`၊ `pipeNetType` storm သို့မဟုတ် sanitary |
| `Struct` | `name`၊ `elevRim` (သုံးထားသော အပေါ်ဘောင်၊ သတ်မှတ်ထားသော သို့မဟုတ် မျက်နှာပြင်မှ)၊ `elevSump`; `Center`; `diameter` ပါ `CircStruct`; `elev`၊ `flowDir` in သို့မဟုတ် out၊ `refPipe` ပါ `Invert` |
| `Pipe` | `name`၊ `refStart`၊ `refEnd`၊ `length`၊ `slope`; `diameter` ပါ `CircPipe` |
| `PlanFeatures` / `PlanFeature` | အင်္ဂါရပ်မျဉ်းတစ်ခုလျှင် တစ်ခု: `name`; `Line` (`length`၊ `Start`၊ `End`) ပါ `CoordGeom` နှင့် `Curve` (`rot`၊ `crvType` arc၊ `radius`၊ `length`၊ `chord`၊ `delta`); `Start` နှင့် `End` ကို "N E Z", `Center` ကို "N E" အဖြစ်; `Property` အသုံးပြုမှုပါ `Feature` `code="CivilCraft"` နှင့် ပိတ်ထားခြင်း |

မရေးသားရသေးသော အရာများ: pad နှင့် corridor များကို အရာဝတ္ထုအဖြစ် (၎င်းတို့၏ ရလဒ်မှာ "Proposed" မျက်နှာပြင်ဖြစ်သည်)၊ အမှား ပါသော ဖြောင့်မျဉ်းများ၊ invert နှစ်ခုလုံး မပါသော ပိုက်များ၊ ကွန်ရက် စည်းမျဉ်းများ။

## ဖတ်သည်များ

| Element | CivilCraft ယူသည် |
|---|---|
| `Units` | `Imperial` သို့မဟုတ် `Metric` နှင့် ၎င်း၏ `linearUnit` က ပေ သို့မဟုတ် မီတာ ဆုံးဖြတ်သည်။ မသိသော ယူနစ်ကို မှတ်ထားသည်။ |
| `Project` | `name` သည် စီမံကိန်းအမည် ဖြစ်လာသည်။ |
| `CgPoints` / `CgPoint` (အတွင်းပိုင်းလည်း ပါ) | အမည် (သို့မဟုတ် `oID`)၊ "N E" သို့မဟုတ် "N E Z"၊ `desc` (သို့မဟုတ် `code`) ကို ဖော်ပြချက်အဖြစ် |
| `Definition surfType="TIN"` ပါ `Surface` | `Pnts` နှင့် `Faces` ကို ရှိပြီးသား မြေပြင်အဖြစ် (ပထမ မျက်နှာပြင်တစ်ခုသာ); မမြင်ရသော မျက်နှာများ (`i="1"`) ကို ချန်ထားသည် |
| `SourceData` / `Breaklines` | 3D breakline များ၊ မျက်နှာပြင်နှင့်အတူ ထားသည် |
| `SourceData` / `Boundaries` | အပြင်ဘက် နယ်နိမိတ် |
| `Alignment` / `CoordGeom` | `Line` နှင့် `Curve` element များ; PI များကို ကွေးတစ်ခုစီ၏ `PI` မှ၊ သို့မဟုတ် ၎င်း၏ `Center` နှင့် tangent များမှ ပြန်တည်ဆောက်သည်; `staStart` |
| `Profile` / `ProfAlign` | `PVI` နှင့် `ParaCurve` (`length` ပါ); PVI အနည်းဆုံး နှစ်ခုရှိသော ပထမ ဒီဇိုင်း ပရိုဖိုင် |
| `PlanFeatures` / `PlanFeature` | တစ်ခုစီကို အင်္ဂါရပ်မျဉ်းအဖြစ်: `Line`၊ `Curve` (၎င်း၏ `Start`၊ `Center`၊ `End` နှင့် `rot`) နှင့် `IrregularLine` (`PntList3D` သို့မဟုတ် `PntList2D`) များကို အဆုံးမှ အဆုံးထိ ချိတ်ဆက်သည် (ကွက်လပ်ကို မျဉ်းဖြောင့်ဖြင့် ချိတ်ပြီး မှတ်သည်); အစနေရာသို့ ပြန်ရောက်သည့်အခါ ပိတ်သည်; အသုံးပြုမှုနှင့် ပိတ်ခြင်းကို CivilCraft ၏ ကိုယ်ပိုင် `Feature` မှ ယူသည်၊ မဟုတ်လျှင် **ဆွဲထားသည်သာ**။ အမြင့်မပါသော အမှတ်များကို 0 ပေးသည် (မှတ်သည်)။ |
| `Spiral` | `Curve` ဘေးရှိ clothoid spiral များ (ထွက်နှင့် ဝင်); radius နှင့် spiral အရှည်များပါသော PI တစ်ခုအဖြစ် ဖတ်ပြီး `theta`၊ `totalX`၊ `totalY`၊ `tanLong`၊ `tanShort`၊ `constant` ဖြင့် ပြန်ရေးသည် |
| `PipeNetwork` | ပိုက်ပါသော ပထမ ကွန်ရက်: `Struct` (`Center`၊ `elevRim`၊ `elevSump`၊ `CircStruct` diameter၊ ပိုက်တစ်ခုလျှင် `Invert`) နှင့် `Pipe` (`refStart`၊ `refEnd`၊ `CircPipe` diameter) |

## ကျော်သွားသည်များ၊ မှတ်ချက်များတွင် အမည်ပေးထားသည်

- ပထမတစ်ခုနောက်ပိုင်း မျက်နှာပြင်များ၊ grid မျက်နှာပြင်များနှင့် အခြား non-TIN မျက်နှာပြင်များ
- `IrregularLine` သို့မဟုတ် `Chain` element ပါသော ဖြောင့်မျဉ်းများ၊ clothoid မဟုတ်သော spiral များ၊ ကွေးနှစ်ခုကြား spiral တစ်ခု၊ သို့မဟုတ် ဂျီသြမေတြီ မပါသော ဖြောင့်မျဉ်းများ
- ပထမတစ်ခုနောက်ပိုင်း ဒီဇိုင်းပရိုဖိုင်များ၊ `CircCurve` နှင့် `UnsymParaCurve` ဒေါင်လိုက်ကွေးများ (၎င်းတို့၏ PVI များကို ကွေးမပါဘဲ ထားသည်)
- အခြားအမှတ်များကိုသာ ရည်ညွှန်းသော အမှတ်များ (`pntRef`) နှင့် ဖတ်နိုင်သော ကိုဩဒိနိတ် မပါသော အမှတ်များ
- ထပ်နေသော အမှတ်အမည်များ (ပထမတစ်ခုကို ထားသည်)
- ဖျောက်/ပြ နှင့် data-clip နယ်နိမိတ်များ၊ 3D အမှတ်မပါသော breakline များ
- ပထမတစ်ခုနောက်ပိုင်း ပိုက်ကွန်ရက်များ၊ storm နှင့် sanitary မဟုတ်သော ကွန်ရက်အမျိုးအစားများ (storm အဖြစ် ဖတ်သည်)
- ထောင့်မှန်၊ ဝင်ပေါက်နှင့် ထွက်ပေါက် structure များ (ပတ်ပတ်လည်အဖြစ် ဖတ်သည်); egg၊ elliptical နှင့် box ပိုက်နှင့် မြောင်းများ (အရွယ်အစားမရှိသော ပတ်ပတ်လည် ပိုက်အဖြစ် ဖတ်သည်)
- အစီအစဉ် feature များထဲရှိ `Spiral` element များ
- `Parcels`၊ `Roadways`၊ `GradeModel` နှင့် `Survey`

ဖိုင်တစ်ခုရှိ မြေပြင်ပရိုဖိုင်များ (`ProfSurf`) ကို မသုံးပါ: CivilCraft သည် မြေပြင်ကို မျက်နှာပြင်မှ တိုက်ရိုက် နမူနာယူသည်။

## ဖိုင် မဖွင့်နိုင်သည့်အခါ မက်ဆေ့ချ်များ

| မက်ဆေ့ချ် | အဓိပ္ပာယ် |
|---|---|
| "ဤသည်မှာ XML ဖြစ်သော်လည်း LandXML မဟုတ်ပါ (root element သည် <…>)။" | ဖိုင်သည် အခြား XML အမျိုးအစား ဖြစ်သည်။ |
| "… တွင် CivilCraft ဖတ်နိုင်သော အမှတ်များ၊ TIN မျက်နှာပြင်များ သို့မဟုတ် ဖြောင့်မျဉ်းများ မရှိပါ။" | ဖိုင်ရှိ အရာအားလုံးသည် ကျော်သွားသော စာရင်းတွင် ရှိသည်။ နောက်ဆက်တွဲ မှတ်ချက်များက ထိုမှာ ဘာရှိသည်ကို ပြောပြသည်။ |
| "ပုံစံမကိုက်သော အဆုံး tag …"၊ "မပိတ်ထားသော tag …"၊ "ဖိုင်သည် … အတွင်း အဆုံးသတ်သည်" | ဖိုင် ပျက်စီးနေသည် သို့မဟုတ် ဖြတ်တောက်ထားသည်။ |
